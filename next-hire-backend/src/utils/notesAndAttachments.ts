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

// A few entities (Placement, ...) predate notes_history and only ever had a
// flat `notes` string column - a single overwritable field, not a real
// comment list. If a record still has old text sitting there and has never
// had a notes_history entry, migrate it into one (persisted, once) so it's
// visible, editable, and deletable like any other note instead of being
// stuck behind a single textbox forever.
const migrateLegacyFlatNote = async (record: any, plain: any) => {
  if (typeof record.update !== "function" || (plain.notes_history?.length ?? 0) > 0 || !plain.notes) return;
  const migratedNote = {
    id: randomUUID(),
    title: "",
    content: plain.notes,
    category: "general",
    isPrivate: false,
    tags: [],
    by: plain.created_by || plain.recruiter_id,
    at: plain.updated_at || plain.created_at || new Date().toISOString(),
  };
  await record.update({ notes_history: [migratedNote] });
  plain.notes_history = [migratedNote];
};

// Normalizes a record's notes_history/attachments to their current shape and,
// for non-staff viewers (e.g. candidates), strips notes marked private.
export const prepareNotesAndAttachmentsForResponse = async (
  record: { toJSON?: () => any; notes_history?: any; attachments?: any },
  userRole?: string
) => {
  const plain = record.toJSON ? record.toJSON() : record;
  await migrateLegacyFlatNote(record, plain);
  plain.notes_history = await normalizeNotesHistory(plain.notes_history);
  plain.attachments = normalizeAttachments(plain.attachments);
  if (userRole !== "recruiter" && userRole !== "vendor") {
    plain.notes_history = plain.notes_history.filter((n: any) => !n.isPrivate);
  }
  return plain;
};
