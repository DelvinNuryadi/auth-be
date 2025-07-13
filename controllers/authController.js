import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { validationResult } from "express-validator";
import transporter from "../config/nodemailer.js";
import {
    EMAIL_VERIFY_TEMPLATES,
    PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            const error = new Error("user already exist, try another one");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to the home",
            text: `Welcome ${name} to home website. your account has been created with email id: ${email}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            userId: user._id,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const login = async (req, res, next) => {
    const errors = validationResult(req);
    const { email, password } = req.body;
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.data = errors.array();
        error.statusCode = 422;
        throw error;
    }

    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 409;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const error = new Error("Invalid password");
            error.statusCode = 409;
            throw error;
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login Successfully!",
            userData: {
                id: user._id,
                name: user.name,
            },
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "logged out" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// send verification OTP to the user's email
export const sendVerifyOtp = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            const error = new Error("account already verified");
            error.statusCode = 409;
            throw error;
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        // sending email with otp
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            // text: `Your OTP is ${otp}. verify your account using this OTP`,
            html: EMAIL_VERIFY_TEMPLATES.replace("{{otp}}", otp).replace(
                "{{email}}",
                user.email
            ),
        };

        await transporter.sendMail(mailOptions);

        return res
            .status(200)
            .json({ success: true, message: "Verification OTP sent on email" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// verify email with token that already sent on email
export const verifyEmail = async (req, res, next) => {
    const { otp } = req.body;
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            const error = new Error("user not found");
            error.statusCode = 404;
            throw error;
        }

        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            const error = new Error("Invalid OTP");
            error.statusCode = 400;
            throw error;
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            const error = new Error("OTP expired");
            error.statusCode = 410;
            throw error;
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res
            .status(200)
            .json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
    try {
        return res
            .status(200)
            .json({ success: true, message: "user is authenticated" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// send password reset OTP
export const sendResetOtp = async (req, res, next) => {
    const errors = validationResult(req);
    const { email } = req.body;

    try {
        if (!errors.isEmpty()) {
            const error = new Error("validation failed");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }

        const user = await userModel.findOne({ email: email });
        if (!user) {
            const error = new Error("user not found");
            error.statusCode = 404;
            throw error;
        }
        const otp = String(Math.floor(10000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        // sending email with otp
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password reset OTP",
            // text: `Your OTP for resetting your password is ${otp}. use this to proceed with resetting your password`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
                "{{email}}",
                user.email
            ),
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "OTP sent tou your email" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// reset user password
export const resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    const { email, otp, newPassword } = req.body;
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.data = errors.array();
        error.statusCode = 409;
        next(error);
    }
    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            const error = new Error("user not found");
            error.statusCode = 404;
            throw error;
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            const error = new Error("invalid otp");
            error.statusCode = 409;
            throw error;
        }

        if (user.resetOtpExpireAt < Date.now()) {
            const error = new Error("OTP expired");
            error.statusCode = 410;
            throw error;
        }

        const isMatch = await bcrypt.compare(newPassword, user.password);

        if (isMatch) {
            const error = new Error("Use new password");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res
            .status(200)
            .json({ message: "Password has been reset successfully" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
