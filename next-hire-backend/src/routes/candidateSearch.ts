import { Router } from "express";
import { query, param } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  searchCandidates,
  getCandidateDetails,
  getCandidateStats,
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

// All routes require authentication
router.use(auth);

// Search candidates (recruiters only)
router.get("/search", searchValidation, validate, searchCandidates);

// Get candidate statistics (recruiters only)
router.get("/stats", getCandidateStats);

// Get candidate details (recruiters only)
router.get("/:id", candidateIdValidation, validate, getCandidateDetails);

export default router;
