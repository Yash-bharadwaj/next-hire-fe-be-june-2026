import { Router } from "express";
import { body, param, query } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { generalDocumentUpload } from "../middleware/upload";
import {
  getBusinessPartners,
  getBusinessPartnerById,
  createBusinessPartner,
  updateBusinessPartner,
  deleteBusinessPartner,
  getBusinessPartnerStats,
  getBusinessPartnerDetailStats,
  getBusinessPartnerActivity,
  getBusinessPartnerRevenueTrend,
  getBusinessPartnerJobs,
  getBusinessPartnerContacts,
  createBusinessPartnerContact,
  updateBusinessPartnerContact,
  deleteBusinessPartnerContact,
  addBusinessPartnerNote,
  updateBusinessPartnerNote,
  deleteBusinessPartnerNote,
  addBusinessPartnerAttachment,
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

const createContactValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  body("name").notEmpty().withMessage("Contact name is required"),
  body("title").optional().isString(),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().isString(),
  body("is_primary").optional().isBoolean().withMessage("is_primary must be a boolean"),
];

const updateContactValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  param("contactId").isUUID().withMessage("Valid contact ID is required"),
  body("name").optional().notEmpty().withMessage("Contact name cannot be empty"),
  body("title").optional().isString(),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("phone").optional().isString(),
  body("is_primary").optional().isBoolean().withMessage("is_primary must be a boolean"),
];

const contactIdValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  param("contactId").isUUID().withMessage("Valid contact ID is required"),
];

const noteCategories = ["technical", "behavioral", "feedback", "general"];

const addNoteValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  body("content").trim().notEmpty().withMessage("Note content is required"),
  body("title").optional().isString(),
  body("category").optional().isIn(noteCategories).withMessage("Invalid note category"),
  body("isPrivate").optional().isBoolean(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

const updateNoteValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  param("noteId").notEmpty().withMessage("Valid note ID is required"),
  body("content").optional().trim().notEmpty().withMessage("Note content cannot be empty"),
  body("title").optional().isString(),
  body("category").optional().isIn(noteCategories).withMessage("Invalid note category"),
  body("isPrivate").optional().isBoolean(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

const noteIdValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  param("noteId").notEmpty().withMessage("Valid note ID is required"),
];

const attachmentValidation = [
  param("id").isUUID().withMessage("Valid business partner ID is required"),
  body("url").optional().trim().notEmpty().withMessage("Attachment URL cannot be empty"),
  body("name").optional().isString(),
  body("document_type")
    .optional()
    .isIn(["PDF", "DOC", "DOCX", "IMG", "OTHER"])
    .withMessage("Invalid document type"),
  body("valid_from").optional().isISO8601().withMessage("Valid 'valid from' date required"),
  body("valid_to").optional().isISO8601().withMessage("Valid 'valid to' date required"),
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
  query("scope")
    .optional()
    .isIn(["all", "mine"])
    .withMessage("Invalid scope"),
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

// List contacts for a business partner (client)
router.get("/:id/contacts", businessPartnerIdValidation, validate, getBusinessPartnerContacts);

// Add a contact to a business partner (Recruiters only)
router.post("/:id/contacts", createContactValidation, validate, createBusinessPartnerContact);

// Edit/delete a contact (Recruiters only)
router.put("/:id/contacts/:contactId", updateContactValidation, validate, updateBusinessPartnerContact);
router.delete("/:id/contacts/:contactId", contactIdValidation, validate, deleteBusinessPartnerContact);

// Real per-partner metrics, activity feed, and revenue trend
router.get("/:id/detail-stats", businessPartnerIdValidation, validate, getBusinessPartnerDetailStats);
router.get("/:id/activity", businessPartnerIdValidation, validate, getBusinessPartnerActivity);
router.get("/:id/revenue-trend", businessPartnerIdValidation, validate, getBusinessPartnerRevenueTrend);
router.get("/:id/jobs", businessPartnerIdValidation, validate, getBusinessPartnerJobs);

// Notes
router.post("/:id/notes", addNoteValidation, validate, addBusinessPartnerNote);
router.put("/:id/notes/:noteId", updateNoteValidation, validate, updateBusinessPartnerNote);
router.delete("/:id/notes/:noteId", noteIdValidation, validate, deleteBusinessPartnerNote);

// Documents (uploaded file or pasted URL)
router.post(
  "/:id/attachments",
  generalDocumentUpload.single("file"),
  attachmentValidation,
  validate,
  addBusinessPartnerAttachment
);

export default router;
