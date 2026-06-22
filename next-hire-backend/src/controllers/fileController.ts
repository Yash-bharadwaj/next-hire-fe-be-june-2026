import { Response } from "express";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { getFileUrl } from "../services/storageService";

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
