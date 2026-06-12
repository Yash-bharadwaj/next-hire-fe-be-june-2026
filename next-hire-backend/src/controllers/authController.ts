import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User, Candidate, Recruiter, Vendor } from "../models";
import { generateTokens, verifyToken } from "../utils/jwt";
import {
  generateOTP,
  generateOTPExpiry,
  isOTPExpired,
  generateSecureToken,
} from "../utils/otp";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/email";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middleware/auth";

// Sign up with OTP verification
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    role,
    first_name,
    last_name,
    phone,
    company_name,
    contact_name,
  } = req.body;

  // Validate input
  if (!email || !password || !role) {
    throw createError("Email, password, and role are required", 400);
  }

  if (!["candidate", "recruiter", "vendor"].includes(role)) {
    throw createError("Invalid role", 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) {
    if (existingUser.email_verified) {
      throw createError("User already exists with this email", 409);
    }
    // Previous signup never completed OTP verification - discard the stale
    // record (cascades to its role profile) so the user can sign up again.
    await existingUser.destroy();
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = generateOTPExpiry();

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    otp,
    otp_expires_at: otpExpiry,
    status: "inactive", // Will be activated after OTP verification
  });

  // Create role-specific profile
  switch (role) {
    case "candidate":
      await Candidate.create({
        user_id: user.id,
        created_by: user.id,
        first_name,
        last_name,
        phone,
      });
      break;
    case "recruiter":
      await Recruiter.create({
        user_id: user.id,
        first_name,
        last_name,
      });
      break;
    case "vendor":
      await Vendor.create({
        user_id: user.id,
        company_name,
        contact_person_name:
          contact_name ||
          (first_name && last_name ? `${first_name} ${last_name}` : undefined),
      });
      break;
  }

  // Send OTP email
  const emailSent = await sendOTPEmail(email, otp);

  if (!emailSent) {
    logger.error(`Failed to send OTP email to ${email}`);
    // Still return success but warn about email failure
    return res.status(201).json({
      success: true,
      message:
        "User created successfully. However, we were unable to send the OTP email. Please contact support or try resending the OTP.",
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        emailSent: false,
        warning:
          "OTP email could not be sent. Please use the resend OTP feature.",
      },
    });
  }

  res.status(201).json({
    success: true,
    message:
      "User created successfully. Please verify your email with the OTP sent.",
    data: {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailSent: true,
    },
  });
});

// Verify OTP and activate account
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw createError("Email and OTP are required", 400);
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw createError("User not found", 404);
  }

  if (!user.otp || !user.otp_expires_at) {
    throw createError("No OTP found for this user", 400);
  }

  if (user.otp !== otp) {
    throw createError("Invalid OTP", 400);
  }

  if (isOTPExpired(user.otp_expires_at)) {
    throw createError("OTP has expired", 400);
  }

  // Activate user and clear OTP
  await user.update({
    status: "active",
    email_verified: true,
    email_verified_at: new Date(),
    otp: null as any,
    otp_expires_at: null as any,
  });

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        first_name: null,
        last_name: null,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
      },
      ...tokens,
    },
  });
});

// Resend OTP
export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw createError("Email is required", 400);
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.email_verified) {
    throw createError("Email is already verified", 400);
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpiry = generateOTPExpiry();

  await user.update({
    otp,
    otp_expires_at: otpExpiry,
  });

  // Send OTP email
  const emailSent = await sendOTPEmail(email, otp);

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: { emailSent },
  });
});

// Request login OTP for existing verified user
export const requestLoginOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw createError("Email is required", 400);
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw createError("User not found", 404);
    }

    if (!user.email_verified || user.status !== "active") {
      throw createError("Account is not active or email not verified", 403);
    }

    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    await user.update({
      otp,
      otp_expires_at: otpExpiry,
    });

    const emailSent = await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: "Login OTP sent successfully",
      data: { emailSent },
    });
  }
);

// Login using OTP (no password)
export const loginWithOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError("Email and OTP are required", 400);
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw createError("User not found", 404);
    }

    if (!user.email_verified || user.status !== "active") {
      throw createError("Account is not active or email not verified", 403);
    }

    if (!user.otp || !user.otp_expires_at) {
      throw createError("No OTP found for this user", 400);
    }

    if (user.otp !== otp) {
      throw createError("Invalid OTP", 400);
    }

    if (isOTPExpired(user.otp_expires_at)) {
      throw createError("OTP has expired", 400);
    }

    // Clear OTP after successful login
    await user.update({
      otp: null as any,
      otp_expires_at: null as any,
      last_login_at: new Date(),
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
          first_name: null,
          last_name: null,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login_at: user.last_login_at,
        },
        ...tokens,
      },
    });
  }
);

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  // Find user
  const user = await User.findOne({
    where: { email: email.toLowerCase() },
    include: [
      { model: Candidate, as: "candidateProfile" },
      { model: Recruiter, as: "recruiterProfile" },
      { model: Vendor, as: "vendorProfile" },
    ],
  });

  if (!user) {
    throw createError("Invalid credentials", 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError("Invalid credentials", 401);
  }

  // Check if email is verified
  if (!user.email_verified) {
    throw createError("Please verify your email before logging in", 401);
  }

  // Check if user is active
  if (user.status !== "active") {
    throw createError("Account is not active", 401);
  }

  // Update last login
  const currentLoginTime = new Date();
  await user.update({ last_login_at: currentLoginTime });
  (user as any).last_login_at = currentLoginTime;

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Get profile data based on role
  let profile = null;
  switch (user.role) {
    case "candidate":
      profile = (user as any).candidateProfile;
      break;
    case "recruiter":
      profile = (user as any).recruiterProfile;
      break;
    case "vendor":
      profile = (user as any).vendorProfile;
      break;
  }

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
      },
      ...tokens,
    },
  });
});

// Refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError("Refresh token is required", 400);
    }

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      throw createError("Invalid refresh token", 401);
    }

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== "active") {
      throw createError("User not found or inactive", 401);
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: tokens,
    });
  }
);

// Forgot password
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw createError("Email is required", 400);
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if user exists or not
      res.json({
        success: true,
        message: "If the email exists, a password reset link will be sent",
      });
      return;
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 hour expiry

    await user.update({
      reset_token: resetToken,
      reset_token_expires_at: resetExpiry,
    });

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: "If the email exists, a password reset link will be sent",
      data: { emailSent },
    });
  }
);

// Reset password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw createError("Token and new password are required", 400);
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      throw createError("Invalid or expired reset token", 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      reset_token: null as any,
      reset_token_expires_at: null as any,
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  }
);

// Change password (for authenticated users)
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!currentPassword || !newPassword) {
      throw createError("Current password and new password are required", 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw createError("Current password is incorrect", 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await user.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

// Logout (optional - mainly for clearing client-side tokens)
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Get current authenticated user profile
export const getCurrentUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw createError("Authentication required", 401);
    }

    const user = await User.findByPk(userId, {
      include: [
        { model: Candidate, as: "candidateProfile" },
        { model: Recruiter, as: "recruiterProfile" },
        { model: Vendor, as: "vendorProfile" },
      ],
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    let profile = null;
    switch (user.role) {
      case "candidate":
        profile = (user as any).candidateProfile;
        break;
      case "recruiter":
        profile = (user as any).recruiterProfile;
        break;
      case "vendor":
        profile = (user as any).vendorProfile;
        break;
    }

    const profileData = profile ? profile.toJSON() : null;

    res.json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          email_verified: user.email_verified,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login_at: user.last_login_at,
        },
        profile: profileData,
      },
    });
  }
);
