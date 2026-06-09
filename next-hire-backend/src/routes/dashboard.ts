import { Router } from "express";
import { query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getDashboardStats,
  getRecentActivity,
} from "../controllers/dashboardController";

const router = Router();

// Validation rules
const activityValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// All routes require authentication
router.use(auth);

// Get dashboard statistics (role-based)
router.get("/stats", getDashboardStats);

// Get recent activity feed
router.get("/activity", activityValidation, validate, getRecentActivity);

export default router;
