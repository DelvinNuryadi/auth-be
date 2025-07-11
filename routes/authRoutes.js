import express from "express";
import {
    register,
    login,
    logout,
    sendVerifyOtp,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword,
} from "../controllers/authController.js";
import { body } from "express-validator";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password")
            .isLength({ min: 4 })
            .withMessage("Password length min 4 characters"),
    ],
    register
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password").notEmpty().withMessage("password cannot be empty"),
    ],
    login
);

router.post("/logout", logout);
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-account", userAuth, verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);
router.post(
    "/send-reset-otp",
    [body("email").isEmail().withMessage("Enter a valid email")],
    sendResetOtp
);
router.post("/reset-password", resetPassword);

export default router;
