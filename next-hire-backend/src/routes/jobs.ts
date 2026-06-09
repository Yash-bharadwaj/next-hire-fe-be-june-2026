import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  getVendorEligibleJobs,
} from "../controllers/jobController";

const router = Router();

// Validation rules
const searchJobsValidation = [
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
  query("job_type")
    .optional()
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Invalid job type"),
];

const createJobValidation = [
  body("title")
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Job title must be between 2 and 200 characters"),
  body("description")
    .notEmpty()
    .withMessage("Job description is required")
    .isLength({ min: 10 })
    .withMessage("Job description must be at least 10 characters"),
  body("company_name")
    .notEmpty()
    .withMessage("Company name is required"),
  body("location")
    .notEmpty()
    .withMessage("Location is required"),
  body("job_type")
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Invalid job type"),
  body("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  body("experience_min")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Minimum experience must be between 0 and 50"),
  body("experience_max")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Maximum experience must be between 0 and 50"),
  body("required_skills")
    .optional()
    .isArray()
    .withMessage("Required skills must be an array"),
  body("preferred_skills")
    .optional()
    .isArray()
    .withMessage("Preferred skills must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "active", "paused", "closed"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("positions_available")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Positions available must be at least 1"),
  body("vendor_eligible")
    .optional()
    .isBoolean()
    .withMessage("Vendor eligible must be a boolean"),
  body("remote_work_allowed")
    .optional()
    .isBoolean()
    .withMessage("Remote work allowed must be a boolean"),
];

const updateJobValidation = [
  param("id").isUUID().withMessage("Valid job ID is required"),
  body("title")
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage("Job title must be between 2 and 200 characters"),
  body("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Job description must be at least 10 characters"),
  body("job_type")
    .optional()
    .isIn(["full_time", "part_time", "contract", "temporary"])
    .withMessage("Invalid job type"),
  body("salary_min")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be positive"),
  body("salary_max")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be positive"),
  body("experience_min")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Minimum experience must be between 0 and 50"),
  body("experience_max")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Maximum experience must be between 0 and 50"),
  body("required_skills")
    .optional()
    .isArray()
    .withMessage("Required skills must be an array"),
  body("preferred_skills")
    .optional()
    .isArray()
    .withMessage("Preferred skills must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "active", "paused", "closed"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("positions_available")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Positions available must be at least 1"),
  body("vendor_eligible")
    .optional()
    .isBoolean()
    .withMessage("Vendor eligible must be a boolean"),
  body("remote_work_allowed")
    .optional()
    .isBoolean()
    .withMessage("Remote work allowed must be a boolean"),
];

const jobIdValidation = [
  param("id").isUUID().withMessage("Valid job ID is required"),
];

// Public routes (no authentication required)
router.get("/", searchJobsValidation, validate, getJobs);
router.get("/:id/public", jobIdValidation, validate, getJobById);

// Protected routes (authentication required)
router.get("/:id", auth, jobIdValidation, validate, getJobById);
router.post("/", auth, createJobValidation, validate, createJob);
router.put("/:id", auth, updateJobValidation, validate, updateJob);
router.delete("/:id", auth, jobIdValidation, validate, deleteJob);

// Recruiter-specific routes
router.get("/recruiter/my-jobs", auth, searchJobsValidation, validate, getRecruiterJobs);

// Vendor-specific routes
router.get("/vendor/eligible", auth, searchJobsValidation, validate, getVendorEligibleJobs);

export default router;