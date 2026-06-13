import fs from "fs";
import path from "path";
import multer from "multer";
import { RequestHandler } from "express";
import { createError } from "./errorHandler";
import { AuthenticatedRequest } from "./auth";

const uploadsRoot = path.join(__dirname, "../../uploads");
const avatarsDir = path.join(uploadsRoot, "avatars");
const resumesDir = path.join(uploadsRoot, "resumes");

[avatarsDir, resumesDir].forEach((dir) => {
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
