import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/jwt";
import { createError } from "./errorHandler";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Export alias for AuthRequest
export type AuthRequest = AuthenticatedRequest;

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError("Access token required", 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      throw createError("Invalid or expired token", 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(createError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError("Insufficient permissions", 403));
    }

    next();
  };
};

// Middleware to check if user is candidate
export const candidateOnly = authorize("candidate");

// Middleware to check if user is recruiter
export const recruiterOnly = authorize("recruiter");

// Middleware to check if user is vendor
export const vendorOnly = authorize("vendor");

// Middleware to check if user is recruiter or admin
export const recruiterOrAdmin = authorize("recruiter", "admin");

// Export alias for auth
export const auth = authenticate;

// Export alias for protect
export const protect = authenticate;
