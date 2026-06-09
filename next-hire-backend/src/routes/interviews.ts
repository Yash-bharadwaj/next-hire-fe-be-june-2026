import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getInterviewStats,
} from "../controllers/interviewController";

const router = Router();

// Validation rules
const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["scheduled", "in_progress", "completed", "cancelled", "no_show"])
    .withMessage("Invalid status"),
  query("interview_type")
    .optional()
    .isIn(["phone", "video", "in_person", "technical", "behavioral"])
    .withMessage("Invalid interview type"),
  query("date_from")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for date_from"),
  query("date_to")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for date_to"),
];

const createInterviewValidation = [
  body("submission_id")
    .isUUID()
    .withMessage("Valid submission ID is required"),
  body("interview_type")
    .optional()
    .isIn(["phone", "video", "in_person", "technical", "behavioral"])
    .withMessage("Invalid interview type"),
  body("scheduled_at")
    .isISO8601()
    .withMessage("Valid scheduled date/time is required"),
  body("duration_minutes")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  body("interviewer_id")
    .optional()
    .isUUID()
    .withMessage("Valid interviewer ID required"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
  body("meeting_link")
    .optional()
    .isURL()
    .withMessage("Meeting link must be a valid URL"),
];

const updateInterviewValidation = [
  param("id").isUUID().withMessage("Valid interview ID is required"),
  body("interview_type")
    .optional()
    .isIn(["phone", "video", "in_person", "technical", "behavioral"])
    .withMessage("Invalid interview type"),
  body("scheduled_at")
    .optional()
    .isISO8601()
    .withMessage("Valid scheduled date/time required"),
  body("duration_minutes")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15 and 480 minutes"),
  body("status")
    .optional()
    .isIn(["scheduled", "in_progress", "completed", "cancelled", "no_show"])
    .withMessage("Invalid status"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];

const interviewIdValidation = [
  param("id").isUUID().withMessage("Valid interview ID is required"),
];

// All routes require authentication
router.use(auth);

// Get interviews with filters
router.get("/", paginationValidation, validate, getInterviews);

// Get interview statistics
router.get("/stats", getInterviewStats);

// Get single interview
router.get("/:id", getInterviewById);

// Create interview (recruiters only)
router.post("/", createInterviewValidation, validate, createInterview);

// Update interview
router.put("/:id", updateInterviewValidation, validate, updateInterview);

// Delete interview (recruiters only)
router.delete("/:id", interviewIdValidation, validate, deleteInterview);

export default router;
