import crypto from "crypto";

export const generateOTP = (length: number = 6): string => {
  // For automated tests we can force a fixed OTP via env var
  if (process.env.FIXED_TEST_OTP) {
    return process.env.FIXED_TEST_OTP;
  }

  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

export const generateOTPExpiry = (minutes: number = 10): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

export const isOTPExpired = (expiry: Date): boolean => {
  return new Date() > expiry;
};

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
