import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import __dirname from "../dirname.js";

async function getMailCredentials() {
    let transporter;
    if (process.env.NODE_ENV === "DEVELOPMENT") {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } else {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
    }

    return transporter;
}

export const sendVerificationMail = async ({ to, name, otp }) => {
    let transporter = await getMailCredentials();

    const emailTemplate = path.join(__dirname, "templates", "registration-email.html");
    const emailHtml = fs.readFileSync(emailTemplate, "utf8");

    let subject = "Verify Your Registration";
    let message =
        "Thank you for registering with us. Please use the following One-Time Password (OTP) to complete your registration:";
    let validityMessage = "This OTP is valid for the next 1 minute.";
    let note =
        "If you did not initiate this registration process, please do not share this OTP with anyone and ignore this email.";

    let emailContent = emailHtml
        .replace(/{subject}/g, subject)
        .replace(/{username}/g, name)
        .replace(/{otp}/g, otp)
        .replace(/{message}/g, message)
        .replace(/{validityMessage}/g, validityMessage)
        .replace(/{note}/g, note);

    const mailOptions = {
        from: transporter.transporter.auth.user,
        to,
        subject,
        html: emailContent,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
};

export const sendForgotPasswordMail = async ({ to, subject, name, link }) => {
    let transporter = await getMailCredentials();

    const emailTemplate = path.join(__dirname, "templates", "forgot-password-template.html");
    const emailHtml = fs.readFileSync(emailTemplate, "utf8");
    const emailContent = emailHtml.replace("https://example.com/reset-password", link).replace("username", name);

    // Define email options
    const mailOptions = {
        from: transporter.transporter.auth.user,
        to,
        subject,
        html: emailContent,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
};
