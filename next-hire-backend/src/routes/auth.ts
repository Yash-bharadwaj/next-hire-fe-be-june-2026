import { Router } from "express";
import { body } from "express-validator";
import {
  signup,
  verifyOTP,
  resendOTP,
  login,
  requestLoginOTP,
  loginWithOTP,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getCurrentUserProfile,
  uploadAvatar,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { avatarUpload } from "../middleware/upload";

const router = Router();

// Validation rules
const signupValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .isIn(["candidate", "recruiter", "vendor"])
    .withMessage("Valid role is required"),
  body("first_name")
    .optional()
    .isString()
    .trim()
    .withMessage("First name must be a string"),
  body("last_name")
    .optional()
    .isString()
    .trim()
    .withMessage("Last name must be a string"),
  body("phone")
    .optional()
    .isString()
    .trim()
    .withMessage("Phone must be a string"),
  body("company_name")
    .optional()
    .isString()
    .trim()
    .withMessage("Company name must be a string"),
  body("contact_name")
    .optional()
    .isString()
    .trim()
    .withMessage("Contact name must be a string"),
];

const verifyOTPValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const resendOTPValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const refreshTokenValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
];

// Routes
router.post("/signup", signupValidation, validate, signup);
router.post("/verify-otp", verifyOTPValidation, validate, verifyOTP);
router.post("/resend-otp", resendOTPValidation, validate, resendOTP);
router.post("/login", loginValidation, validate, login);
router.post("/login-otp/request", resendOTPValidation, validate, requestLoginOTP);
router.post("/login-otp/verify", verifyOTPValidation, validate, loginWithOTP);
router.post("/refresh-token", refreshTokenValidation, validate, refreshToken);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword
);
router.post(
  "/change-password",
  authenticate,
  changePasswordValidation,
  validate,
  changePassword
);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUserProfile);
router.post(
  "/me/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  uploadAvatar
);

export default router;
