import { Response } from "express";
import { randomUUID } from "crypto";
import { Model } from "sequelize";
import { AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { formatUserName } from "./notesAndAttachments";

interface NoteableRecord extends Model {
  notes_history?: any;
  update: (data: any) => Promise<any>;
}

interface NoteHandlersOptions<T extends NoteableRecord> {
  // Route param holding this record's id - "id" for most entities,
  // "submissionId" for the submission notes routes.
  idParam?: string;
  // Used in error messages, e.g. "interview", "placement".
  entityLabel: string;
  // Loads the record (with whatever includes canManage needs), or null.
  findRecord: (id: string) => Promise<T | null>;
  // Whether userId may add/edit/delete notes on this record.
  canManage: (record: T, userId: string | undefined) => boolean;
  // Interview/Submission also mirror the latest note's content into a flat
  // `notes` field on add, for a quick-glance view; Placement/BusinessPartner
  // don't.
  mirrorToNotesField?: boolean;
  // BusinessPartner also touches last_activity_at on addNote/addAttachment
  // (not on edit/delete) - other entities have no equivalent field.
  extraFieldsOnWrite?: () => Record<string, any>;
  // Interview/Placement/BusinessPartner reject non-recruiters before even
  // looking up the record; Submission relies solely on canManage (isJobStaff)
  // with no separate role pre-check. Default true matches the majority.
  requireRecruiterRole?: boolean;
}

// Add/update/delete-note endpoints were copy-pasted near-identically across
// Interview, Submission, Placement, and BusinessPartner controllers - this
// factory captures the shared shape once, parameterized by what genuinely
// differs per entity (the record lookup/include tree and the permission
// check, both already isolated as plain functions per entity).
export function createNoteHandlers<T extends NoteableRecord>(opts: NoteHandlersOptions<T>) {
  const idParam = opts.idParam || "id";
  const label = opts.entityLabel;
  const notFoundMessage = `${label.charAt(0).toUpperCase()}${label.slice(1)} not found`;
  const accessDeniedMessage = `You do not have permission to update this ${label}`;

  const requireRecruiterRole = opts.requireRecruiterRole ?? true;

  const loadAuthorizedRecord = async (req: AuthenticatedRequest) => {
    const id = req.params[idParam];
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (requireRecruiterRole && userRole !== "recruiter") {
      throw createError(`Only recruiters can manage ${label} notes`, 403);
    }

    const record = await opts.findRecord(id);
    if (!record) {
      throw createError(notFoundMessage, 404);
    }
    if (!opts.canManage(record, userId)) {
      throw createError(accessDeniedMessage, 403);
    }

    return { record, userId };
  };

  const addNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { record, userId } = await loadAuthorizedRecord(req);
    const { title, content, category, isPrivate, tags } = req.body;

    const authorName = await formatUserName(userId);
    const history = record.notes_history || [];
    const entry = {
      id: randomUUID(),
      title: (title || "").trim(),
      content: content.trim(),
      category: category || "general",
      isPrivate: !!isPrivate,
      tags: Array.isArray(tags) ? tags.filter((t: any) => typeof t === "string" && t.trim()) : [],
      author: authorName,
      by: userId,
      at: new Date().toISOString(),
    };
    history.push(entry);

    const updateData: any = { notes_history: history, ...opts.extraFieldsOnWrite?.() };
    if (opts.mirrorToNotesField) updateData.notes = entry.content;
    await record.update(updateData);

    res.json({
      success: true,
      message: "Note added successfully",
      data: { notes_history: history },
    });
  });

  const updateNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { record } = await loadAuthorizedRecord(req);
    const { noteId } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;

    const history = record.notes_history || [];
    const noteIndex = history.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      throw createError("Note not found", 404);
    }

    const existing = history[noteIndex];
    history[noteIndex] = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      content: content !== undefined ? content.trim() : existing.content,
      category: category !== undefined ? category : existing.category,
      isPrivate: isPrivate !== undefined ? !!isPrivate : existing.isPrivate,
      tags: Array.isArray(tags) ? tags.filter((t: any) => typeof t === "string" && t.trim()) : existing.tags,
      edited_at: new Date().toISOString(),
    };

    await record.update({ notes_history: history });

    res.json({
      success: true,
      message: "Note updated successfully",
      data: { notes_history: history },
    });
  });

  const deleteNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { record } = await loadAuthorizedRecord(req);
    const { noteId } = req.params;

    const history = record.notes_history || [];
    const noteIndex = history.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      throw createError("Note not found", 404);
    }

    history.splice(noteIndex, 1);
    await record.update({ notes_history: history });

    res.json({
      success: true,
      message: "Note deleted successfully",
      data: { notes_history: history },
    });
  });

  const addAttachment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { record, userId } = await loadAuthorizedRecord(req);
    const { name, document_type, valid_from, valid_to } = req.body;

    let url: string;
    let size: number | undefined;
    const file = (req as any).file;
    if (file) {
      const serverBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
      url = `${serverBase}/uploads/documents_tmp/${file.filename}`;
      size = file.size;
    } else if (req.body.url) {
      url = req.body.url;
    } else {
      throw createError("A file or url is required", 400);
    }

    const attachments = (record as any).attachments || [];
    attachments.push({
      id: randomUUID(),
      url,
      name: name || file?.originalname || url,
      document_type: document_type || "OTHER",
      size,
      valid_from: valid_from || new Date().toISOString(),
      valid_to: valid_to || undefined,
      by: userId,
      at: new Date().toISOString(),
    });
    await record.update({ attachments, ...opts.extraFieldsOnWrite?.() });

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: { attachments },
    });
  });

  return { addNote, updateNote, deleteNote, addAttachment };
}
