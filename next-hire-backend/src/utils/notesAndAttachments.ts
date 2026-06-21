import { randomUUID } from "crypto";
import { User, Recruiter } from "../models";

// notes_history/attachments are JSON-array blobs on Interview and Submission,
// so entries created before notes/documents gained richer fields (id, category,
// tags, document_type, ...) only have the old shape. Normalizing fills in
// defaults so every entry is safe for the frontend to render, and resolves
// "author" display names from the stored user id for entries that predate
// that field.

export const formatUserName = async (userId?: string): Promise<string> => {
  if (!userId) return "Unknown";
  const user = await User.findByPk(userId, {
    include: [{ model: Recruiter, as: "recruiterProfile", attributes: ["first_name", "last_name"], required: false }],
  });
  if (!user) return "Unknown";
  const profile = (user as any).recruiterProfile;
  const name = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() : "";
  return name || user.email;
};

export const normalizeNotesHistory = async (history: any[]): Promise<any[]> => {
  if (!Array.isArray(history) || history.length === 0) return [];
  const missingAuthorIds = Array.from(new Set(history.filter((n) => !n.author && n.by).map((n) => n.by)));
  const authorNames = await Promise.all(missingAuthorIds.map((id) => formatUserName(id)));
  const authorMap = new Map(missingAuthorIds.map((id, i) => [id, authorNames[i]]));

  return history.map((n) => ({
    id: n.id || randomUUID(),
    title: n.title || "",
    content: n.content || n.note || "",
    category: n.category || "general",
    isPrivate: !!n.isPrivate,
    tags: Array.isArray(n.tags) ? n.tags : [],
    author: n.author || authorMap.get(n.by) || "Unknown",
    by: n.by,
    at: n.at,
    edited_at: n.edited_at,
  }));
};

export const normalizeAttachments = (attachments: any[]): any[] => {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  return attachments.map((a) => ({
    id: a.id || randomUUID(),
    url: a.url,
    name: a.name || a.url,
    document_type: a.document_type || "OTHER",
    size: a.size,
    valid_from: a.valid_from || a.at,
    valid_to: a.valid_to,
    by: a.by,
    at: a.at,
  }));
};

// Normalizes a record's notes_history/attachments to their current shape and,
// for non-staff viewers (e.g. candidates), strips notes marked private.
export const prepareNotesAndAttachmentsForResponse = async (
  record: { toJSON?: () => any; notes_history?: any; attachments?: any },
  userRole?: string
) => {
  const plain = record.toJSON ? record.toJSON() : record;
  plain.notes_history = await normalizeNotesHistory(plain.notes_history);
  plain.attachments = normalizeAttachments(plain.attachments);
  if (userRole !== "recruiter" && userRole !== "vendor") {
    plain.notes_history = plain.notes_history.filter((n: any) => !n.isPrivate);
  }
  return plain;
};
