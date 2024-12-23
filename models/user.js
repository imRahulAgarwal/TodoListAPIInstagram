import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: String,
        email: String,
        password: String,
        // The isDeleted field will be used to track if the user has deleted their account
        isDeleted: { type: Boolean, default: false },
        // The isVerified field will be used to track if the user is a valid user
        // To ensure the status we will send an 6 digit OTP code to the provided e-mail address and verify it
        isVerified: { type: Boolean, default: false },
        otp: Number,
        otpExpiryTime: Date,
        resetPasswordToken: String,
    },
    { timestamps: true, versionKey: false }
);

const User = model("users", userSchema);

export default User;
