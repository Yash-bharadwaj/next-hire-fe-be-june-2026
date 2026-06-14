import fs from "fs";
import path from "path";
import multer from "multer";
import { RequestHandler } from "express";
import { createError } from "./errorHandler";
import { AuthenticatedRequest } from "./auth";

const uploadsRoot = path.join(__dirname, "../../uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");
const resumesDir = path.join(uploadsRoot, "resumes");
const documentsTmpDir = path.join(uploadsRoot, "documents_tmp");

[avatarsDir, resumesDir, documentsTmpDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const makeStorage = (destination: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const userId =
        (req as unknown as AuthenticatedRequest).user?.userId || "anon";
      const ext = path.extname(file.originalname);
      cb(null, `${userId}-${Date.now()}${ext}`);
    },
  });

// multer's bundled @types/express differs from the project's, so its
// RequestHandler isn't directly assignable to express.Router methods.
const wrapUpload = (instance: multer.Multer) => ({
  single: (fieldName: string): RequestHandler =>
    instance.single(fieldName) as unknown as RequestHandler,
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const avatarUpload = wrapUpload(
  multer({
    storage: makeStorage(avatarsDir),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError("Only JPG, PNG, GIF, or WEBP images are allowed", 400));
      }
    },
  })
);

export const resumeUpload = wrapUpload(
  multer({
    storage: makeStorage(resumesDir),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError("Only PDF, DOC, or DOCX files are allowed", 400));
      }
    },
  })
);

// Accepts PDF/DOC/DOCX/TXT for AI parsing (résumés and job descriptions).
// .doc is allowed through here so aiParsingService can return a clear,
// user-facing "unsupported format" error instead of a generic multer rejection.
const ALLOWED_AI_DOCUMENT_TYPES = [
  ...ALLOWED_DOCUMENT_TYPES,
  "text/plain",
];

export const documentUpload = wrapUpload(
  multer({
    storage: makeStorage(documentsTmpDir),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_AI_DOCUMENT_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError("Only PDF, DOC, DOCX, or TXT files are allowed", 400));
      }
    },
  })
);
