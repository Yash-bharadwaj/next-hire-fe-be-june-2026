import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getBusinessPartners,
  getBusinessPartnerById,
  createBusinessPartner,
  updateBusinessPartner,
  deleteBusinessPartner,
  getBusinessPartnerStats,
} from "../controllers/businessPartnerController";

const router = Router();

// Validation rules
const createBusinessPartnerValidation = [
  body("name").notEmpty().withMessage("Company name is required"),
  body("is_lead").optional().isBoolean().withMessage("is_lead must be a boolean"),
  body("is_client").optional().isBoolean().withMessage("is_client must be a boolean"),
  body("is_vendor").optional().isBoolean().withMessage("is_vendor must be a boolean"),
  body("primary_email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),
  body("website")
    .optional()
    .isURL()
    .withMessage("Valid website URL is required"),
  body("source")
    .optional()
    .isIn(["referral", "website", "cold_call", "trade_show", "linkedin", "email_campaign", "other"])
    .withMessage("Invalid source"),
  body("status")
    .optional()
    .isIn(["active", "prospect", "inactive", "on_hold"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("company_size")
    .optional()
    .isIn(["startup", "small", "medium", "large", "enterprise"])
    .withMessage("Invalid company size"),
  body("annual_revenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Annual revenue must be a positive number"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("Valid assigned_to user ID is required"),
];

const updateBusinessPartnerValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  body("name").optional().notEmpty().withMessage("Company name cannot be empty"),
  body("is_lead").optional().isBoolean().withMessage("is_lead must be a boolean"),
  body("is_client").optional().isBoolean().withMessage("is_client must be a boolean"),
  body("is_vendor").optional().isBoolean().withMessage("is_vendor must be a boolean"),
  body("primary_email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),
  body("website")
    .optional()
    .isURL()
    .withMessage("Valid website URL is required"),
  body("source")
    .optional()
    .isIn(["referral", "website", "cold_call", "trade_show", "linkedin", "email_campaign", "other"])
    .withMessage("Invalid source"),
  body("status")
    .optional()
    .isIn(["active", "prospect", "inactive", "on_hold"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("company_size")
    .optional()
    .isIn(["startup", "small", "medium", "large", "enterprise"])
    .withMessage("Invalid company size"),
  body("annual_revenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Annual revenue must be a positive number"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("Valid assigned_to user ID is required"),
];

const businessPartnerIdValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
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
    .isIn(["active", "prospect", "inactive", "on_hold"])
    .withMessage("Invalid status"),
  query("partner_type")
    .optional()
    .isIn(["lead", "client", "vendor"])
    .withMessage("Invalid partner type"),
  query("source")
    .optional()
    .isIn(["referral", "website", "cold_call", "trade_show", "linkedin", "email_campaign", "other"])
    .withMessage("Invalid source"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  query("assigned_to")
    .optional()
    .isUUID()
    .withMessage("Valid assigned_to user ID is required"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("sort_by")
    .optional()
    .isIn(["name", "created_at", "last_activity_at", "status", "priority"])
    .withMessage("Invalid sort field"),
  query("sort_order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Sort order must be ASC or DESC"),
];

// All routes require authentication
router.use(auth);

// Get business partner statistics
router.get("/stats", getBusinessPartnerStats);

// Get all business partners with filters
router.get("/", paginationValidation, validate, getBusinessPartners);

// Get a single business partner by ID
router.get("/:id", businessPartnerIdValidation, validate, getBusinessPartnerById);

// Create a new business partner (Recruiters only)
router.post("/", createBusinessPartnerValidation, validate, createBusinessPartner);

// Update a business partner (Recruiters only)
router.put("/:id", updateBusinessPartnerValidation, validate, updateBusinessPartner);

// Delete a business partner (Recruiters only)
router.delete("/:id", businessPartnerIdValidation, validate, deleteBusinessPartner);

export default router;
