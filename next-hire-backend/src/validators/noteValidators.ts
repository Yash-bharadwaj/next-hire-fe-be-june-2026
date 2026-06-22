import { body, param } from "express-validator";

export const noteCategories = ["technical", "behavioral", "feedback", "general"];

// The note/attachment validator chains for Interview, Placement, and
// BusinessPartner routes were byte-identical apart from the entity name in
// the id-param error message - these builders capture that once.
// (Submission's equivalents have genuinely different rules - a stricter
// content length cap and no inline id-param check, since that's already
// covered by a separate submissionDetailsValidation chain - so they're left
// as-is rather than forced into this shape.)

export const buildAddNoteValidation = (entityLabel: string) => [
  param("id").isUUID().withMessage(`Valid ${entityLabel} ID is required`),
  body("content").trim().notEmpty().withMessage("Note content is required"),
  body("title").optional().isString(),
  body("category").optional().isIn(noteCategories).withMessage("Invalid note category"),
  body("isPrivate").optional().isBoolean(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const buildUpdateNoteValidation = (entityLabel: string) => [
  param("id").isUUID().withMessage(`Valid ${entityLabel} ID is required`),
  param("noteId").notEmpty().withMessage("Valid note ID is required"),
  body("content").optional().trim().notEmpty().withMessage("Note content cannot be empty"),
  body("title").optional().isString(),
  body("category").optional().isIn(noteCategories).withMessage("Invalid note category"),
  body("isPrivate").optional().isBoolean(),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

export const buildNoteIdValidation = (entityLabel: string) => [
  param("id").isUUID().withMessage(`Valid ${entityLabel} ID is required`),
  param("noteId").notEmpty().withMessage("Valid note ID is required"),
];

export const buildAttachmentValidation = (entityLabel: string) => [
  param("id").isUUID().withMessage(`Valid ${entityLabel} ID is required`),
  body("url").optional().trim().notEmpty().withMessage("Attachment URL cannot be empty"),
  body("name").optional().isString(),
  body("document_type")
    .optional()
    .isIn(["PDF", "DOC", "DOCX", "IMG", "OTHER"])
    .withMessage("Invalid document type"),
  body("valid_from").optional().isISO8601().withMessage("Valid 'valid from' date required"),
  body("valid_to").optional().isISO8601().withMessage("Valid 'valid to' date required"),
];
