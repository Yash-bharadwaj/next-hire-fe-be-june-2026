import { Router } from "express";
import { query, param, body } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  searchCandidates,
  getCandidateDetails,
  getCandidateStats,
  updateCandidateByRecruiter,
  createCandidate,
  deleteCandidate,
} from "../controllers/candidateSearchController";

const router = Router();

// Validation rules
const searchValidation = [
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
  query("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  query("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  query("sort_by")
    .optional()
    .isIn(["name", "experience", "salary", "created_at"])
    .withMessage("Invalid sort field"),
  query("sort_order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Sort order must be ASC or DESC"),
];

const candidateIdValidation = [
  param("id").isUUID().withMessage("Valid candidate ID is required"),
];

const createCandidateValidation = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 100 })
    .withMessage("First name must be less than 100 characters"),
  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 100 })
    .withMessage("Last name must be less than 100 characters"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional({ values: "falsy" }).isString(),
  body("location").optional({ values: "falsy" }).isString(),
  body("experience_years")
    .optional({ values: "falsy" })
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("expected_salary")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Expected salary must be positive"),
  body("availability_status")
    .optional({ values: "falsy" })
    .isIn(["available", "not_available", "interviewing"])
    .withMessage("Invalid availability status"),
];

// All routes require authentication
router.use(auth);

// Search candidates (recruiters only)
router.get("/search", searchValidation, validate, searchCandidates);

// Get candidate statistics (recruiters only)
router.get("/stats", getCandidateStats);

// Create a new candidate profile (recruiters only)
router.post("/", createCandidateValidation, validate, createCandidate);

// Get candidate details (recruiters only)
router.get("/:id", candidateIdValidation, validate, getCandidateDetails);

// Update candidate profile (recruiters only)
router.put("/:id", candidateIdValidation, validate, updateCandidateByRecruiter);

// Delete candidate profile (recruiters only)
router.delete("/:id", candidateIdValidation, validate, deleteCandidate);

export default router;
