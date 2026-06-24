import { Response } from "express";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { getFileUrl, readDocumentBuffer } from "../services/storageService";
import {
  extractTextFromBuffer,
  UnsupportedFileTypeError,
  EmptyDocumentError,
} from "../services/aiParsingService";

// Stored document keys/paths can go stale (S3 presigned URLs expire after an
// hour; old code paths also sometimes stored a bare relative path). Rather
// than trust whatever URL was persisted at upload time, every "view/download
// a document" action in the app calls this first to get a fresh, currently-
// valid URL, then navigates the browser there directly. It returns JSON
// (not a redirect) because the browser navigation to the file itself must
// be unauthenticated (S3 presigned URLs / static local paths carry no
// Authorization header), while this lookup needs the caller's Bearer token
// to know it's a legitimate, logged-in request.
export const resolveFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { key } = req.query;

  if (!key || typeof key !== "string") {
    throw createError("A file key is required", 400);
  }

  const url = await getFileUrl(key);
  res.json({ success: true, data: { url } });
});

// Browsers can't render DOCX/legacy DOC inline (and a plain <iframe> on a
// .txt file depends on the storage layer having set the right Content-Type),
// so the "View" preview dialog falls back to this for anything that isn't a
// PDF/image: extract text server-side with the same libraries already used
// for résumé parsing, and let the frontend render it as plain text instead
// of a dead end. Capped well under request/response size limits - this is
// for previewing a résumé/JD, not processing arbitrary large files.
const MAX_PREVIEW_TEXT_LENGTH = 50_000;

export const previewFileText = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { key } = req.query;

  if (!key || typeof key !== "string") {
    throw createError("A file key is required", 400);
  }

  let buffer: Buffer;
  try {
    buffer = await readDocumentBuffer(key);
  } catch {
    throw createError("Could not read this file", 404);
  }

  try {
    const text = await extractTextFromBuffer(buffer, key);
    const truncated = text.length > MAX_PREVIEW_TEXT_LENGTH;
    res.json({
      success: true,
      data: {
        text: truncated ? text.slice(0, MAX_PREVIEW_TEXT_LENGTH) : text,
        truncated,
      },
    });
  } catch (error: any) {
    if (error instanceof UnsupportedFileTypeError || error instanceof EmptyDocumentError) {
      throw createError(error.message, 422);
    }
    throw error;
  }
});
