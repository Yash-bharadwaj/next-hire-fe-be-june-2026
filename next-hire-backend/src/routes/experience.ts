import { Router } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experienceController";

const router = Router();

// Validation rules
const createExperienceValidation = [
  body("job_title")
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Job title must be between 2 and 100 characters"),
  body("company_name")
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  body("is_current")
    .optional()
    .isBoolean()
    .withMessage("is_current must be a boolean"),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("achievements")
    .optional()
    .isArray()
    .withMessage("Achievements must be an array"),
  body("achievements.*")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Each achievement must be less than 500 characters"),
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array"),
  body("technologies.*")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Each technology must be less than 50 characters"),
];

const updateExperienceValidation = [
  body("job_title")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Job title must be between 2 and 100 characters"),
  body("company_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("location")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  body("is_current")
    .optional()
    .isBoolean()
    .withMessage("is_current must be a boolean"),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("achievements")
    .optional()
    .isArray()
    .withMessage("Achievements must be an array"),
  body("achievements.*")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Each achievement must be less than 500 characters"),
  body("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array"),
  body("technologies.*")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Each technology must be less than 50 characters"),
];

// Routes
router.get("/", auth, getExperiences);
router.post("/", auth, createExperienceValidation, validate, createExperience);
router.put("/:id", auth, updateExperienceValidation, validate, updateExperience);
router.delete("/:id", auth, deleteExperience);

export default router;
