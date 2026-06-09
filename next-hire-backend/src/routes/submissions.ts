import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createSubmission,
  getCandidateSubmissions,
  getVendorSubmissions,
  getJobSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  withdrawSubmission,
} from "../controllers/submissionController";

const router = Router();

// Validation rules
const createSubmissionValidation = [
  body("job_id")
    .isUUID()
    .withMessage("Valid job ID is required"),
  body("candidate_id")
    .optional()
    .isUUID()
    .withMessage("Valid candidate ID is required"),
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
    .withMessage("Availability date must be a valid date"),
];

const updateStatusValidation = [
  param("id").isUUID().withMessage("Valid submission ID is required"),
  body("status")
    .isIn([
      "submitted",
      "under_review", 
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "hired",
      "rejected"
    ])
    .withMessage("Invalid status"),
  body("notes")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Notes must be less than 2000 characters"),
];

const submissionIdValidation = [
  param("id").isUUID().withMessage("Valid submission ID is required"),
];

const jobIdValidation = [
  param("jobId").isUUID().withMessage("Valid job ID is required"),
];

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
    .isIn([
      "submitted",
      "under_review", 
      "shortlisted",
      "interview_scheduled",
      "interviewed",
      "offered",
      "hired",
      "rejected"
    ])
    .withMessage("Invalid status filter"),
];

// All routes require authentication
router.use(auth);

// Create submission (apply to job)
router.post("/", createSubmissionValidation, validate, createSubmission);

// Get candidate's own submissions
router.get("/candidate/my-applications", paginationValidation, validate, getCandidateSubmissions);

// Get vendor's submissions
router.get("/vendor/my-submissions", paginationValidation, validate, getVendorSubmissions);

// Get submissions for a specific job (recruiters)
router.get("/job/:jobId", jobIdValidation, paginationValidation, validate, getJobSubmissions);

// Get single submission details
router.get("/:id", submissionIdValidation, validate, getSubmissionById);

// Update submission status (recruiters)
router.put("/:id/status", updateStatusValidation, validate, updateSubmissionStatus);

// Withdraw application (candidates)
router.delete("/:id/withdraw", submissionIdValidation, validate, withdrawSubmission);

export default router;