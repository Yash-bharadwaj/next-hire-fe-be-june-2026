import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getPlacements,
  getPlacementById,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementStats,
  terminatePlacement,
  updateOnboardingStatus,
} from "../controllers/placementController";

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
    .isIn(["active", "completed", "terminated", "on_hold"])
    .withMessage("Invalid status"),
  query("placement_type")
    .optional()
    .isIn(["permanent", "contract", "temporary", "temp_to_perm"])
    .withMessage("Invalid placement type"),
  query("start_date_from")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for start_date_from"),
  query("start_date_to")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for start_date_to"),
  query("sort_by")
    .optional()
    .isIn(["created_at", "start_date", "salary", "status", "placement_type"])
    .withMessage("Invalid sort field"),
  query("sort_order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Sort order must be ASC or DESC"),
];

const createPlacementValidation = [
  body("job_id")
    .isUUID()
    .withMessage("Valid job ID is required"),
  body("candidate_id")
    .isUUID()
    .withMessage("Valid candidate ID is required"),
  body("submission_id")
    .isUUID()
    .withMessage("Valid submission ID is required"),
  body("start_date")
    .isISO8601()
    .withMessage("Valid start date is required"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("Valid end date required if provided"),
  body("placement_type")
    .optional()
    .isIn(["permanent", "contract", "temporary", "temp_to_perm"])
    .withMessage("Invalid placement type"),
  body("salary")
    .isNumeric()
    .withMessage("Valid salary amount is required"),
  body("salary_currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("billing_rate")
    .optional()
    .isNumeric()
    .withMessage("Billing rate must be numeric"),
  body("commission_amount")
    .optional()
    .isNumeric()
    .withMessage("Commission amount must be numeric"),
  body("commission_percentage")
    .optional()
    .isNumeric()
    .withMessage("Commission percentage must be numeric"),
  body("location")
    .notEmpty()
    .withMessage("Location is required"),
  body("work_arrangement")
    .optional()
    .isIn(["onsite", "remote", "hybrid"])
    .withMessage("Invalid work arrangement"),
];

const updatePlacementValidation = [
  param("id").isUUID().withMessage("Valid placement ID is required"),
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Valid start date required if provided"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("Valid end date required if provided"),
  body("placement_type")
    .optional()
    .isIn(["permanent", "contract", "temporary", "temp_to_perm"])
    .withMessage("Invalid placement type"),
  body("salary")
    .optional()
    .isNumeric()
    .withMessage("Salary must be numeric"),
  body("salary_currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("billing_rate")
    .optional()
    .isNumeric()
    .withMessage("Billing rate must be numeric"),
  body("commission_amount")
    .optional()
    .isNumeric()
    .withMessage("Commission amount must be numeric"),
  body("commission_percentage")
    .optional()
    .isNumeric()
    .withMessage("Commission percentage must be numeric"),
  body("status")
    .optional()
    .isIn(["active", "completed", "terminated", "on_hold"])
    .withMessage("Invalid status"),
  body("work_arrangement")
    .optional()
    .isIn(["onsite", "remote", "hybrid"])
    .withMessage("Invalid work arrangement"),
  body("onboarding_status")
    .optional()
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid onboarding status"),
  body("performance_rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Performance rating must be between 1 and 5"),
  body("renewal_status")
    .optional()
    .isIn(["pending", "renewed", "not_renewed"])
    .withMessage("Invalid renewal status"),
];

const placementIdValidation = [
  param("id").isUUID().withMessage("Valid placement ID is required"),
];

const terminatePlacementValidation = [
  param("id").isUUID().withMessage("Valid placement ID is required"),
  body("termination_reason")
    .notEmpty()
    .withMessage("Termination reason is required"),
  body("termination_date")
    .optional()
    .isISO8601()
    .withMessage("Valid termination date required if provided"),
];

const onboardingStatusValidation = [
  param("id").isUUID().withMessage("Valid placement ID is required"),
  body("onboarding_status")
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid onboarding status"),
];

// All routes require authentication
router.use(auth);

// Get placements with filters and pagination
router.get("/", paginationValidation, validate, getPlacements);

// Get placement statistics
router.get("/stats", getPlacementStats);

// Get placement by ID
router.get("/:id", placementIdValidation, validate, getPlacementById);

// Create placement (recruiters only)
router.post("/", createPlacementValidation, validate, createPlacement);

// Update placement (recruiters only)
router.put("/:id", updatePlacementValidation, validate, updatePlacement);

// Delete placement (recruiters only)
router.delete("/:id", placementIdValidation, validate, deletePlacement);

// Terminate placement (recruiters only)
router.patch("/:id/terminate", terminatePlacementValidation, validate, terminatePlacement);

// Update onboarding status (recruiters only)
router.patch("/:id/onboarding", onboardingStatusValidation, validate, updateOnboardingStatus);

export default router;
