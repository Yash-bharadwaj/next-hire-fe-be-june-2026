import jwt from "jsonwebtoken";
import { logger } from "./logger";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "candidate" | "recruiter" | "vendor" | "admin";
  iat?: number;
  exp?: number;
}

export const generateTokens = (payload: Omit<JWTPayload, "iat" | "exp">) => {
  const jwtSecret = process.env.JWT_SECRET || "default-secret";
  const jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || "default-refresh-secret";

  const accessToken = jwt.sign(payload as any, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as any);

  const refreshToken = jwt.sign(payload as any, jwtRefreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as any);

  return { accessToken, refreshToken };
};

export const verifyToken = (
  token: string,
  isRefreshToken = false
): JWTPayload | null => {
  try {
    const secret = isRefreshToken
      ? process.env.JWT_REFRESH_SECRET!
      : process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error("Token verification failed:", error);
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error("Token decoding failed:", error);
    return null;
  }
};
