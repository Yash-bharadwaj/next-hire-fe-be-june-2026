import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getProfile,
  updateProfile,
  browseJobs,
  getJobDetails,
  applyToJob,
  getMySubmissions,
  getUpcomingInterviews,
  uploadResume,
  getOnboardingTasks,
} from "../controllers/candidateController";
import { authenticate, candidateOnly } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

// Apply authentication and candidate role check to all routes
router.use(authenticate);
router.use(candidateOnly);

// Validation rules
const updateProfileValidation = [
  body("first_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("First name must be less than 100 characters"),
  body("last_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Last name must be less than 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("current_salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current salary must be a positive number"),
  body("expected_salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be a positive number"),
  body("experience_years")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("linkedin_url")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid"),
  body("portfolio_url")
    .optional()
    .isURL()
    .withMessage("Portfolio URL must be valid"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("availability_status")
    .optional()
    .isIn(["available", "not_available", "interviewing"])
    .withMessage("Invalid availability status"),
  body("preferred_job_types")
    .optional()
    .isArray()
    .withMessage("Preferred job types must be an array"),
  body("preferred_locations")
    .optional()
    .isArray()
    .withMessage("Preferred locations must be an array"),
];

const browseJobsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  query("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  query("experience_min")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum experience must be non-negative"),
  query("experience_max")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum experience must be non-negative"),
];

const jobDetailsValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
];

const applyToJobValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
  body("cover_letter")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Cover letter must be less than 2000 characters"),
  body("expected_salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be positive"),
  body("availability_date")
    .optional()
    .isISO8601()
    .withMessage("Availability date must be valid"),
];

const getSubmissionsValidation = [
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
    .isIn([
      "submitted",
      "under_review",
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "hired",
      "rejected",
    ])
    .withMessage("Invalid status"),
];

const uploadResumeValidation = [
  body("resume_url").isURL().withMessage("Valid resume URL is required"),
];

// Routes

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, validate, updateProfile);

// Resume upload
router.post("/resume", uploadResumeValidation, validate, uploadResume);

// Job browsing and application
router.get("/jobs", browseJobsValidation, validate, browseJobs);
router.get("/jobs/:jobId", jobDetailsValidation, validate, getJobDetails);
router.post("/jobs/:jobId/apply", applyToJobValidation, validate, applyToJob);

// Application tracking
router.get(
  "/submissions",
  getSubmissionsValidation,
  validate,
  getMySubmissions
);

// Interview management
router.get("/interviews", getUpcomingInterviews);

// Onboarding checklist after hire
router.get("/onboarding", getOnboardingTasks);

export default router;
