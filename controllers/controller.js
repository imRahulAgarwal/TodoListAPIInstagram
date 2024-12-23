import User from "../models/user.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    changePasswordSchema,
    loginSchema,
    profileSchema,
    registerSchema,
    resetPasswordSchema,
    validateEmail,
} from "../schemas/user.js";
import moment from "moment";
import { sendForgotPasswordMail, sendVerificationMail } from "../utils/sendEmail.js";
import { generateToken, verifyToken } from "../utils/token.js";

// As of now the domain will be backend url
// But when you develop a frontend (using React) make sure that you have the frontend url
// In that scenario use another variable name in the .env file and in the files
const DOMAIN = process.env.DOMAIN;

export const register = asyncHandler(async (req, res, next) => {
    const validation = registerSchema.validate(req.body);

    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 422));
    }

    let { name, email, password } = validation.value;

    let userExists = await User.findOne({ email, isDeleted: false });
    if (userExists && userExists.isVerified) {
        return next(new ErrorHandler("User exists with the provided E-Mail", 400));
    }

    // The hashed password is stored in the password variable
    password = hashPassword(password);

    const otp = Math.floor(Math.random() * 900000 + 100000);
    if (userExists) {
        userExists.otp = otp;
        userExists.otpExpiryTime = moment().add(1, "minute");
        userExists.name = name;
        userExists.password = password;
    } else {
        userExists = new User({ name, email, password, otp, otpExpiryTime: moment().add(1, "minute") });
    }

    await userExists.save();

    sendVerificationMail({ name, otp, to: email });

    return res.status(200).json({ success: true, message: "User registered. Complete verification" });
});

export const login = asyncHandler(async (req, res, next) => {
    const validation = loginSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 422));
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, isDeleted: false, isVerified: true });
    if (!user) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Check if password is correct
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Generate JWT token
    const token = generateToken({ id: user._id });

    // Send response
    return res.status(200).json({
        success: true,
        message: "User logged in",
        data: {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        },
    });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
    const validation = validateEmail.validate(req.body.email);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 400));
    }

    const { email } = req.body;
    const user = await User.findOne({ email, isDeleted: false, isVerified: true });
    if (!user) {
        return next(new ErrorHandler("No user found with this email", 404));
    }

    const token = generateToken({ id: user._id }, 60);
    user.resetPasswordToken = token;
    await user.save();

    sendForgotPasswordMail({
        to: user.email,
        name: user.name,
        subject: "Reset Password Link",
        link: DOMAIN + "/reset-password/" + token,
    });

    return res.status(200).json({ success: true, message: "Reset Password email sent" });
});

export const sendMail = asyncHandler(async (req, res, next) => {
    let { email } = req.body;
    if (!email) {
        return next(new ErrorHandler("Invalid E-Mail format", 400));
    }

    let userExists = await User.findOne({ email, isDeleted: false });
    if (!userExists) {
        return next(new ErrorHandler("User details not found", 404));
    }

    if (userExists.isVerified) {
        return next(new ErrorHandler("User already verified", 400));
    }

    const otp = Math.floor(Math.random() * 900000 + 100000);

    userExists.otp = otp;
    userExists.otpExpiryTime = moment().add(1, "minute");

    await userExists.save();
    sendVerificationMail({ name: userExists.name, otp, to: email, type: "registration" });

    return res.status(200).json({ success: true, message: "Verification e-mail sent" });
});

export const verifyOtp = asyncHandler(async (req, res, next) => {
    let { otp, email } = req.body;

    if (!otp && typeof otp !== "number") {
        return next(new ErrorHandler("Invalid OTP format", 400));
    }

    if (!email) {
        return next(new ErrorHandler("Invalid E-Mail format", 400));
    }

    let userExists = await User.findOne({ email, otp, isDeleted: false });
    if (!userExists) {
        return next(new ErrorHandler("User details not found", 404));
    }

    if (moment(userExists.otpExpiryTime) < moment()) {
        return next(new ErrorHandler("OTP expired, please try again", 400));
    }

    userExists.isVerified = true;
    userExists.otp = undefined;
    userExists.otpExpiryTime = undefined;

    await userExists.save();
    return res.status(200).json({ success: true, message: "User verification completed" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const validation = resetPasswordSchema.validate({ newPassword, confirmPassword });
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 400));
    }

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (err) {
        return next(new ErrorHandler("Invalid or expired token", 400));
    }

    const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token, isDeleted: false });
    if (!user) {
        return next(new ErrorHandler("Invalid or expired token", 400));
    }

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = undefined; // Clear token from user document
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
});

export const profile = asyncHandler(async (req, res, next) => {
    let { name, email } = req.user;
    return res.status(200).json({ success: true, data: { user: { name, email } } });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    let validation = profileSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 400));
    }

    let updatedData = await User.findOneAndUpdate(
        { _id: req.user._id, isDeleted: false, isVerified: true },
        { $set: validation.value },
        { new: true } // When new field is set to true it will return the updated document
    );

    if (!updatedData) {
        return next(new ErrorHandler("Internal server error", 500));
    }

    let { name, email } = updatedData;

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: { name, email } },
    });
});

export const changePassword = asyncHandler(async (req, res, next) => {
    const validation = changePasswordSchema.validate(req.body);
    if (validation.error) {
        return next(new ErrorHandler(validation.error.details[0].message, 400));
    }

    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    // Check if the old password is correct
    const isMatch = comparePassword(oldPassword, user.password);
    if (!isMatch) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
});
