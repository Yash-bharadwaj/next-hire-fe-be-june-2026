import nodemailer from "nodemailer";
import { logger } from "./logger";

// Validate email configuration
const validateEmailConfig = () => {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.warn(`Missing email configuration: ${missing.join(", ")}`);
    return false;
  }
  return true;
};

// Create transporter with validation
let transporter: nodemailer.Transporter | null = null;

if (validateEmailConfig()) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    transporter.verify((error) => {
      if (error) {
        logger.error("Email transporter verification failed:", error);
      } else {
        logger.info("Email transporter configured successfully");
      }
    });
  } catch (error) {
    logger.error("Failed to create email transporter:", error);
  }
} else {
  logger.warn("Email transporter not initialized - missing configuration");
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  if (!transporter) {
    logger.error(
      "Email transporter not configured. Please check your .env file."
    );
    return false;
  }

  if (!process.env.FROM_EMAIL) {
    logger.error("FROM_EMAIL not configured in environment variables");
    return false;
  }

  try {
    const fromName = process.env.FROM_NAME || "The Next Hire";
    const mailOptions = {
      from: `${fromName} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
    });
    return true;
  } catch (error: any) {
    // Log detailed error information
    const errorDetails: any = {
      error: error.message,
      to: options.to,
      subject: options.subject,
    };

    // Include response details if available (for Resend/SMTP errors)
    if (error.response) {
      errorDetails.response = error.response;
    }
    if (error.responseCode) {
      errorDetails.responseCode = error.responseCode;
    }

    logger.error("Failed to send email:", errorDetails);

    // If it's a Resend limitation error, provide helpful message
    if (error.response && error.response.includes("only send testing emails")) {
      logger.error(
        "Resend limitation: You can only send to verified email or need domain verification. See: https://resend.com/domains"
      );
    }

    return false;
  }
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  name?: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Your OTP Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c5530;">The Next Hire - Email Verification</h2>
            <p>Hello${name ? ` ${name}` : ""},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="font-size: 32px; color: #2c5530; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in ${
              process.env.OTP_EXPIRES_IN || 10
            } minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
                This email was sent by The Next Hire recruitment platform.
            </p>
        </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Your verification code",
    html,
    text: `Your verification code is: ${otp}. This code will expire in ${
      process.env.OTP_EXPIRES_IN || 10
    } minutes.`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name?: string
): Promise<boolean> => {
  const frontendBase =
    process.env.FRONTEND_URL?.trim() || "http://localhost:8080";
  const resetUrl = `${frontendBase}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c5530;">The Next Hire - Password Reset</h2>
            <p>Hello${name ? ` ${name}` : ""},</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
                This email was sent by The Next Hire recruitment platform.
            </p>
        </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
    text: `You requested a password reset. Visit this link to reset your password: ${resetUrl}`,
  });
};
