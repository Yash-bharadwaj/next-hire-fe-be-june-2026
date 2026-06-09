import { body } from "express-validator";

export const createBusinessPartnerSchema = [
  body("name")
    .notEmpty()
    .withMessage("Business partner name is required")
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),

  body("primary_email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email address is required"),

  body("primary_phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),

  body("website")
    .optional()
    .isURL()
    .withMessage("Valid website URL is required"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "prospect", "on_hold"])
    .withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority value"),

  body("is_lead")
    .optional()
    .isBoolean()
    .withMessage("is_lead must be a boolean"),

  body("is_client")
    .optional()
    .isBoolean()
    .withMessage("is_client must be a boolean"),

  body("is_vendor")
    .optional()
    .isBoolean()
    .withMessage("is_vendor must be a boolean"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City must be less than 100 characters"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State must be less than 100 characters"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),

  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("assigned_to must be a valid UUID"),
];

export const updateBusinessPartnerSchema = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage("Name must be between 2 and 255 characters"),

  body("primary_email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email address is required"),

  body("primary_phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),

  body("website")
    .optional()
    .isURL()
    .withMessage("Valid website URL is required"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "prospect", "on_hold"])
    .withMessage("Invalid status value"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority value"),

  body("is_lead")
    .optional()
    .isBoolean()
    .withMessage("is_lead must be a boolean"),

  body("is_client")
    .optional()
    .isBoolean()
    .withMessage("is_client must be a boolean"),

  body("is_vendor")
    .optional()
    .isBoolean()
    .withMessage("is_vendor must be a boolean"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City must be less than 100 characters"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State must be less than 100 characters"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country must be less than 100 characters"),

  body("assigned_to")
    .optional()
    .isUUID()
    .withMessage("assigned_to must be a valid UUID"),
];
