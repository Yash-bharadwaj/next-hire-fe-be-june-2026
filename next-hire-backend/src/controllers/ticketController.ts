import { Response } from "express";
import { Op } from "sequelize";
import { Ticket, User, Candidate, Recruiter, Vendor } from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// Sequelize mutates include objects in place, so a fresh array must be
// built per usage - sharing one array reference across the reporter and
// assignee includes corrupts alias generation for the second one.
const profileIncludes = () => [
  { model: Candidate, as: "candidateProfile", attributes: ["first_name", "last_name"] },
  { model: Recruiter, as: "recruiterProfile", attributes: ["first_name", "last_name"] },
  { model: Vendor, as: "vendorProfile", attributes: ["company_name"] },
];

// Resolve a single display name for a User across whichever role profile it has
const resolveName = (user: any): string => {
  if (!user) return "Unknown";
  const candidate = user.candidateProfile;
  const recruiter = user.recruiterProfile;
  const vendor = user.vendorProfile;
  if (recruiter?.first_name) return `${recruiter.first_name} ${recruiter.last_name || ""}`.trim();
  if (candidate?.first_name) return `${candidate.first_name} ${candidate.last_name || ""}`.trim();
  if (vendor?.company_name) return vendor.company_name;
  return user.email;
};

const serializeTicket = (ticket: Ticket) => {
  const json = ticket.toJSON() as any;
  return {
    ...json,
    reporter_name: resolveName(json.reporter),
    assignee_name: json.assignee ? resolveName(json.assignee) : null,
  };
};

// List tickets visible to the current user - recruiters/admins see everything,
// everyone else only sees tickets they personally reported.
export const listTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const isStaff = userRole === "recruiter" || userRole === "admin";

  const tickets = await Ticket.findAll({
    where: isStaff ? {} : { reporter_id: userId },
    include: [
      { model: User, as: "reporter", attributes: ["id", "email"], include: profileIncludes() },
      { model: User, as: "assignee", attributes: ["id", "email"], include: profileIncludes() },
    ],
    order: [["created_at", "DESC"]],
  });

  res.json({ success: true, data: { tickets: tickets.map(serializeTicket) } });
});

const CATEGORIES = ["Technical", "Bug", "Feature Request", "Performance", "Integration", "Other"];

export const createTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const isStaff = userRole === "recruiter" || userRole === "admin";
  const { title, description, category, priority, assignee_id } = req.body;

  if (!CATEGORIES.includes(category)) {
    throw createError(`Category must be one of: ${CATEGORIES.join(", ")}`, 400);
  }

  // Only staff can assign a ticket directly at creation time
  let resolvedAssigneeId: string | undefined;
  if (isStaff && assignee_id) {
    const assignee = await User.findOne({ where: { id: assignee_id, role: "recruiter" } });
    if (!assignee) {
      throw createError("Assignee must be an existing recruiter", 400);
    }
    resolvedAssigneeId = assignee_id;
  }

  const count = await Ticket.count();
  const ticket_number = `TKT-${String(count + 1).padStart(3, "0")}`;

  const ticket = await Ticket.create({
    ticket_number,
    title,
    description,
    category,
    priority: priority || "medium",
    reporter_id: userId!,
    assignee_id: resolvedAssigneeId,
  });

  const created = await Ticket.findByPk(ticket.id, {
    include: [
      { model: User, as: "reporter", attributes: ["id", "email"], include: profileIncludes() },
      { model: User, as: "assignee", attributes: ["id", "email"], include: profileIncludes() },
    ],
  });

  res.status(201).json({ success: true, message: "Ticket created successfully", data: { ticket: serializeTicket(created!) } });
});

// Staff-only: update status, priority, category, assignee, title, description
export const updateTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { ticketId } = req.params;
  const { title, description, category, priority, status, assignee_id } = req.body;

  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    throw createError("Ticket not found", 404);
  }

  if (category !== undefined && !CATEGORIES.includes(category)) {
    throw createError(`Category must be one of: ${CATEGORIES.join(", ")}`, 400);
  }

  if (assignee_id !== undefined && assignee_id !== null) {
    const assignee = await User.findOne({ where: { id: assignee_id, role: "recruiter" } });
    if (!assignee) {
      throw createError("Assignee must be an existing recruiter", 400);
    }
  }

  await ticket.update({
    title: title !== undefined ? title : ticket.title,
    description: description !== undefined ? description : ticket.description,
    category: category !== undefined ? category : ticket.category,
    priority: priority !== undefined ? priority : ticket.priority,
    status: status !== undefined ? status : ticket.status,
    assignee_id: assignee_id !== undefined ? assignee_id : ticket.assignee_id,
  });

  const updated = await Ticket.findByPk(ticket.id, {
    include: [
      { model: User, as: "reporter", attributes: ["id", "email"], include: profileIncludes() },
      { model: User, as: "assignee", attributes: ["id", "email"], include: profileIncludes() },
    ],
  });

  res.json({ success: true, message: "Ticket updated successfully", data: { ticket: serializeTicket(updated!) } });
});

// Staff-only
export const deleteTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findByPk(ticketId);
  if (!ticket) {
    throw createError("Ticket not found", 404);
  }

  await ticket.destroy();

  res.json({ success: true, message: "Ticket deleted successfully" });
});

// Staff-only: recruiters available to assign tickets to
export const listAssignableUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const recruiters = await User.findAll({
    where: { role: "recruiter", status: "active" },
    attributes: ["id", "email"],
    include: [{ model: Recruiter, as: "recruiterProfile", attributes: ["first_name", "last_name"] }],
    order: [["email", "ASC"]],
  });

  const assignees = recruiters.map((user) => {
    const json = user.toJSON() as any;
    return { id: json.id, name: resolveName(json) };
  });

  res.json({ success: true, data: { assignees } });
});
