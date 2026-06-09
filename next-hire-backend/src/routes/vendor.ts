import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getProfile,
  updateProfile,
  getVendorJobs,
  getJobDetails,
  submitCandidate,
  getMySubmissions,
  getSubmissionStatus,
  createCandidate,
  getMyCandidates,
} from "../controllers/vendorController";
import { authenticate, vendorOnly } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = Router();

// Apply authentication and vendor role check to all routes
router.use(authenticate);
router.use(vendorOnly);

// Validation rules
const updateProfileValidation = [
  body("company_website")
    .optional()
    .isURL()
    .withMessage("Company website must be valid URL"),
  body("contact_person_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Contact person name must be less than 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("specializations")
    .optional()
    .isArray()
    .withMessage("Specializations must be an array"),
  body("years_in_business")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Years in business must be between 0 and 100"),
];

const getVendorJobsValidation = [
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

const submitCandidateValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
  body("candidate_id").isUUID().withMessage("Valid candidate ID is required"),
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
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
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
  query("job_id").optional().isUUID().withMessage("Valid job ID is required"),
];

const submissionStatusValidation = [
  param("submissionId").isUUID().withMessage("Valid submission ID is required"),
];

const createCandidateValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("first_name")
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("First name is required and must be less than 100 characters"),
  body("last_name")
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("Last name is required and must be less than 100 characters"),
  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),
  body("current_salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Current salary must be positive"),
  body("expected_salary")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be positive"),
  body("experience_years")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("resume_url").optional().isURL().withMessage("Resume URL must be valid"),
  body("linkedin_url")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid"),
  body("portfolio_url")
    .optional()
    .isURL()
    .withMessage("Portfolio URL must be valid"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
];

const getCandidatesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("experience_min")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum experience must be non-negative"),
  query("experience_max")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Maximum experience must be non-negative"),
  query("availability_status")
    .optional()
    .isIn(["available", "not_available", "interviewing"])
    .withMessage("Invalid availability status"),
];

// Routes

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidation, validate, updateProfile);

// Job browsing and submission
router.get("/jobs", getVendorJobsValidation, validate, getVendorJobs);
router.get("/jobs/:jobId", jobDetailsValidation, validate, getJobDetails);
router.post(
  "/jobs/:jobId/submit",
  submitCandidateValidation,
  validate,
  submitCandidate
);

// Submission tracking
router.get(
  "/submissions",
  getSubmissionsValidation,
  validate,
  getMySubmissions
);
router.get(
  "/submissions/:submissionId",
  submissionStatusValidation,
  validate,
  getSubmissionStatus
);

// Candidate management
router.post(
  "/candidates",
  createCandidateValidation,
  validate,
  createCandidate
);
router.get("/candidates", getCandidatesValidation, validate, getMyCandidates);

export default router;
