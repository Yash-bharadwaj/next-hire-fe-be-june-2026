import { Response } from "express";
import { Op } from "sequelize";
import { randomUUID } from "crypto";
import {
  Interview,
  Submission,
  Job,
  Candidate,
  User,
  Recruiter,
  BusinessPartner,
  BusinessPartnerContact,
  Experience,
  Education,
  CandidateSkill,
} from "../models";
import { isJobStaff } from "../utils/jobPermissions";
import { sequelize } from "../config/database";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/email";
import { scoreJobFit } from "../services/aiParsingService";
import { buildCandidateProfileText, buildJobEmbeddingText } from "./candidateSearchController";
import {
  formatUserName,
  normalizeNotesHistory,
  normalizeAttachments,
  prepareNotesAndAttachmentsForResponse as prepareInterviewForResponse,
} from "../utils/notesAndAttachments";

// Get interviews (role-based access)
export const getInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  const {
    page = 1,
    limit = 20,
    status,
    interview_type,
    date_from,
    date_to,
    search,
    submission_id,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  // Build where conditions
  const whereConditions: any = {};

  if (status) {
    whereConditions.status = status;
  }

  if (interview_type) {
    whereConditions.interview_type = interview_type;
  }

  if (submission_id) {
    whereConditions.submission_id = submission_id;
  }

  if (date_from && date_to) {
    whereConditions.scheduled_at = {
      [Op.between]: [new Date(date_from as string), new Date(date_to as string)],
    };
  } else if (date_from) {
    whereConditions.scheduled_at = {
      [Op.gte]: new Date(date_from as string),
    };
  } else if (date_to) {
    whereConditions.scheduled_at = {
      [Op.lte]: new Date(date_to as string),
    };
  }

  // Role-based filtering
  const andConditions: any[] = [];
  if (userRole === "recruiter") {
    // Recruiters see interviews for jobs they're staffed on (created,
    // assigned, or in a primary recruiter / account manager role)
    andConditions.push({
      [Op.or]: [
        { "$submission.job.created_by$": userId },
        { "$submission.job.assigned_to$": userId },
        { "$submission.job.primary_recruiter_id$": userId },
        { "$submission.job.account_manager_id$": userId },
      ],
    });
  } else if (userRole === "candidate") {
    // Candidates see their own interviews
    whereConditions["$submission.candidate.user_id$"] = userId;
  } else {
    throw createError("Access denied", 403);
  }

  const includeConditions: any[] = [
    {
      model: Submission,
      as: "submission",
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title", "company_name"],
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "first_name", "last_name", "phone"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email"],
            },
          ],
        },
      ],
    },
    {
      model: User,
      as: "interviewer",
      attributes: ["id", "email"],
      required: false,
      include: [
        {
          model: Recruiter,
          as: "recruiterProfile",
          attributes: ["first_name", "last_name"],
          required: false,
        },
      ],
    },
    {
      model: User,
      as: "creator",
      attributes: ["id", "email"],
      include: [
        {
          model: Recruiter,
          as: "recruiterProfile",
          attributes: ["first_name", "last_name"],
          required: false,
        },
      ],
    },
  ];

  // Add search functionality
  if (search) {
    andConditions.push({
      [Op.or]: [
        { "$submission.job.title$": { [Op.iLike]: `%${search}%` } },
        { "$submission.candidate.first_name$": { [Op.iLike]: `%${search}%` } },
        { "$submission.candidate.last_name$": { [Op.iLike]: `%${search}%` } },
      ],
    });
  }

  if (andConditions.length > 0) {
    whereConditions[Op.and] = andConditions;
  }

  const { count, rows: interviews } = await Interview.findAndCountAll({
    where: whereConditions,
    include: includeConditions,
    order: [["scheduled_at", "ASC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      interviews: await Promise.all(interviews.map((i) => prepareInterviewForResponse(i, req.user?.role))),
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: count,
        itemsPerPage: Number(limit),
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    },
  });
});

// Get single interview (role-aware)
export const getInterviewById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;
  const { id } = req.params;

  if (!userRole || !userId) {
    throw createError("Unauthorized", 401);
  }

  const interview = await Interview.findByPk(id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            attributes: [
              "id", "job_id", "title", "company_name", "location",
              "job_type", "salary_min", "salary_max", "bill_rate_min", "bill_rate_max",
              "created_by", "assigned_to",
            ],
            include: [
              {
                model: BusinessPartner,
                as: "client",
                attributes: ["id", "name", "primary_email", "primary_phone"],
                required: false,
              },
              {
                model: BusinessPartnerContact,
                as: "clientContact",
                attributes: ["id", "name", "title", "email", "phone"],
                required: false,
              },
            ],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: [
              "id", "first_name", "last_name", "phone", "user_id", "location",
              "experience_years", "skills", "linkedin_url", "portfolio_url",
              "resume_url", "current_salary", "expected_salary",
            ],
            include: [
              { model: User, as: "user", attributes: ["id", "email"] },
            ],
          },
        ],
      },
      {
        model: User,
        as: "interviewer",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name"],
            required: false,
          },
        ],
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name"],
            required: false,
          },
        ],
      },
    ],
  });

  if (!interview) {
    throw createError("Interview not found", 404);
  }

  // Access control: recruiter on their job, candidate on their submission
  const submission = interview.submission;
  const job = submission?.job;
  const candidateUserId =
    submission?.candidate?.user_id ||
    submission?.candidate?.getDataValue("user_id");

  if (userRole === "recruiter") {
    if (job?.created_by !== userId && job?.assigned_to !== userId) {
      throw createError("Access denied", 403);
    }
  } else if (userRole === "candidate") {
    if (candidateUserId !== userId) {
      throw createError("Access denied", 403);
    }
  } else {
    throw createError("Access denied", 403);
  }

  // One-time migration: persist normalized notes/attachments so legacy
  // entries (created before richer fields existed) get a stable id from
  // here on, instead of a fresh random one on every read.
  const normalizedNotes = await normalizeNotesHistory((interview as any).notes_history);
  const normalizedAttachments = normalizeAttachments((interview as any).attachments);
  if (
    JSON.stringify(normalizedNotes) !== JSON.stringify((interview as any).notes_history) ||
    JSON.stringify(normalizedAttachments) !== JSON.stringify((interview as any).attachments)
  ) {
    await interview.update({ notes_history: normalizedNotes, attachments: normalizedAttachments } as any);
  }

  const responseInterview = interview.toJSON() as any;
  responseInterview.notes_history =
    userRole === "recruiter" ? normalizedNotes : normalizedNotes.filter((n) => !n.isPrivate);
  responseInterview.attachments = normalizedAttachments;

  res.json({
    success: true,
    data: { interview: responseInterview },
  });
});

// Create interview (recruiters only)
export const createInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can create interviews", 403);
  }

  const {
    submission_id,
    interview_type,
    scheduled_at,
    duration_minutes,
    location,
    meeting_link,
    interviewer_id,
    notes,
  } = req.body;

  // Verify submission exists and recruiter has access
  const submission = await Submission.findByPk(submission_id, {
    include: [
      {
        model: Job,
        as: "job",
        where: {
          [Op.or]: [
            { created_by: userId },
            { assigned_to: userId },
          ],
        },
      },
    ],
  });

  if (!submission) {
    throw createError("Submission not found or access denied", 404);
  }

  const sanitizedLink = (meeting_link || "").trim();
  const finalMeetingLink =
    sanitizedLink ||
    `https://meet.jit.si/next-hire-${submission_id}-${Date.now()}`;

  // Upsert: if an interview already exists for this submission in scheduled state, update it instead
  const existingInterview = await Interview.findOne({
    where: { submission_id, status: "scheduled" },
  });

  let interview: Interview;
  if (existingInterview) {
    interview = await existingInterview.update({
      interview_type: interview_type || existingInterview.interview_type || "phone",
      scheduled_at: new Date(scheduled_at),
      duration_minutes: duration_minutes || existingInterview.duration_minutes || 60,
      location,
      meeting_link: finalMeetingLink,
      interviewer_id: interviewer_id || existingInterview.interviewer_id || userId!,
      notes,
      updated_at: new Date(),
    });
  } else {
    interview = await Interview.create({
      submission_id,
      interview_type: interview_type || "phone",
      scheduled_at: new Date(scheduled_at),
      duration_minutes: duration_minutes || 60,
      location,
      meeting_link: finalMeetingLink,
      interviewer_id: interviewer_id || userId!,
      notes,
      status: "scheduled",
      created_by: userId!,
    });
  }

  // Update submission status when scheduling (unless already terminal)
  if (!["offered", "hired", "rejected"].includes((submission.status || "").toLowerCase())) {
    await submission.update({ status: "interview_scheduled" });
  }

  // Fetch created interview with associations
  const createdInterview = await Interview.findByPk(interview.id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            attributes: ["id", "job_id", "title", "company_name"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "first_name", "last_name", "phone"],
          },
        ],
      },
      {
        model: User,
        as: "interviewer",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name"],
            required: false,
          },
        ],
      },
    ],
  });

  // Email candidate with meeting info if available
  const candidateEmail = createdInterview?.submission?.candidate?.user?.email || submission.candidate?.user?.email;
  if (candidateEmail) {
    await sendEmail({
      to: candidateEmail,
      subject: "Interview Scheduled",
      text: `Your interview for ${submission.job?.title} is scheduled at ${scheduled_at}. Meeting link: ${finalMeetingLink}`,
    });
  }

  res.status(existingInterview ? 200 : 201).json({
    success: true,
    data: { interview: createdInterview },
    message: existingInterview ? "Interview updated successfully" : "Interview scheduled successfully",
  });
});

// Send a reminder email to the candidate about an upcoming interview
export const sendInterviewReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can send interview reminders", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            attributes: ["id", "title", "company_name", "created_by", "assigned_to"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "first_name", "last_name"],
            include: [{ model: User, as: "user", attributes: ["id", "email"] }],
          },
        ],
      },
    ],
  });

  if (!interview) {
    throw createError("Interview not found", 404);
  }

  const job = interview.submission?.job;
  if (job && job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  if (interview.status !== "scheduled") {
    throw createError("Reminders can only be sent for scheduled interviews", 400);
  }

  const candidateEmail = interview.submission?.candidate?.user?.email;
  if (!candidateEmail) {
    throw createError("Candidate does not have an email on file", 400);
  }

  const candidateName = interview.submission?.candidate?.first_name || "there";
  const jobTitle = job?.title || "your position";
  const scheduledAt = new Date(interview.scheduled_at).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const where = interview.meeting_link || interview.location;

  const sent = await sendEmail({
    to: candidateEmail,
    subject: `Reminder: Upcoming interview for ${jobTitle}`,
    text: `Hi ${candidateName},\n\nThis is a reminder that your ${interview.interview_type} interview for ${jobTitle} is scheduled for ${scheduledAt}.${
      where ? `\n\n${interview.meeting_link ? "Meeting link" : "Location"}: ${where}` : ""
    }\n\nSee you then!`,
  });

  if (!sent) {
    throw createError("Failed to send reminder email", 502);
  }

  res.json({
    success: true,
    message: `Reminder sent to ${candidateEmail}`,
  });
});

// Update interview
export const updateInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  const interview = await Interview.findByPk(id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
          },
        ],
      },
    ],
  });

  if (!interview) {
    throw createError("Interview not found", 404);
  }

  // Check permissions
  if (userRole === "recruiter") {
    const job = interview.submission?.job;
    if (job && job.created_by !== userId && job.assigned_to !== userId) {
      throw createError("Access denied", 403);
    }
  } else if (userRole === "candidate") {
    // Candidates can only update certain fields
    const allowedFields = ["notes"];
    const updateFields = Object.keys(req.body);
    const hasDisallowedFields = updateFields.some(field => !allowedFields.includes(field));
    
    if (hasDisallowedFields) {
      throw createError("Candidates can only update notes", 403);
    }
  } else {
    throw createError("Access denied", 403);
  }

  const {
    interview_type,
    scheduled_at,
    duration_minutes,
    location,
    meeting_link,
    interviewer_id,
    notes,
    status,
    feedback,
    rating,
  } = req.body;

  await interview.update({
    interview_type: interview_type || interview.interview_type,
    scheduled_at: scheduled_at ? new Date(scheduled_at) : interview.scheduled_at,
    duration_minutes: duration_minutes !== undefined ? duration_minutes : interview.duration_minutes,
    location: location !== undefined ? location : interview.location,
    meeting_link: meeting_link !== undefined ? meeting_link : interview.meeting_link,
    interviewer_id: interviewer_id !== undefined ? interviewer_id : interview.interviewer_id,
    notes: notes !== undefined ? notes : interview.notes,
    status: status || interview.status,
    feedback: feedback !== undefined ? feedback : interview.feedback,
    rating: rating !== undefined ? rating : interview.rating,
  });

  // Update submission status based on interview status
  if (status === "completed" && interview.submission) {
    await interview.submission.update({ status: "interviewed" });
  }

  // Fetch updated interview
  const updatedInterview = await Interview.findByPk(interview.id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            attributes: ["id", "job_id", "title", "company_name"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
      {
        model: User,
        as: "interviewer",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name"],
            required: false,
          },
        ],
      },
    ],
  });

  res.json({
    success: true,
    data: { interview: updatedInterview },
    message: "Interview updated successfully",
  });
});

// Add a note to an interview (recruiters who staff the underlying job)
export const addInterviewNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, category, isPrivate, tags } = req.body;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can add interview notes", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [{ model: Submission, as: "submission", include: [{ model: Job, as: "job" }] }],
  });
  if (!interview) {
    throw createError("Interview not found", 404);
  }
  if (!isJobStaff(interview.submission?.job, userId)) {
    throw createError("You do not have permission to update this interview", 403);
  }

  const authorName = await formatUserName(userId);
  const history = (interview as any).notes_history || [];
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
  await interview.update({ notes_history: history, notes: entry.content } as any);

  res.json({
    success: true,
    message: "Note added successfully",
    data: { notes_history: history },
  });
});

// Edit an existing note (recruiters who staff the underlying job)
export const updateInterviewNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, noteId } = req.params;
  const { title, content, category, isPrivate, tags } = req.body;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can edit interview notes", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [{ model: Submission, as: "submission", include: [{ model: Job, as: "job" }] }],
  });
  if (!interview) {
    throw createError("Interview not found", 404);
  }
  if (!isJobStaff(interview.submission?.job, userId)) {
    throw createError("You do not have permission to update this interview", 403);
  }

  const history = (interview as any).notes_history || [];
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
    tags: Array.isArray(tags)
      ? tags.filter((t: any) => typeof t === "string" && t.trim())
      : existing.tags,
    edited_at: new Date().toISOString(),
  };

  await interview.update({ notes_history: history } as any);

  res.json({
    success: true,
    message: "Note updated successfully",
    data: { notes_history: history },
  });
});

// Add a document to an interview - either an uploaded file or a pasted URL
export const addInterviewAttachment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, document_type, valid_from, valid_to } = req.body;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can add interview attachments", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [{ model: Submission, as: "submission", include: [{ model: Job, as: "job" }] }],
  });
  if (!interview) {
    throw createError("Interview not found", 404);
  }
  if (!isJobStaff(interview.submission?.job, userId)) {
    throw createError("You do not have permission to update this interview", 403);
  }

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

  const attachments = (interview as any).attachments || [];
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
  await interview.update({ attachments } as any);

  res.json({
    success: true,
    message: "Document uploaded successfully",
    data: { attachments },
  });
});

// "Assign to AI Agent" - have Gemini (re-)evaluate this candidate against the
// job and persist the result as the submission's real ai_score, the same
// scoring path Manual Search uses (buildJobEmbeddingText/buildCandidateProfileText
// + scoreJobFit), so this is never a fabricated number.
export const assignInterviewAiAgent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can assign the AI agent", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          { model: Job, as: "job" },
          {
            model: Candidate,
            as: "candidate",
            include: [
              { model: Experience, as: "experiences", required: false, order: [["start_date", "DESC"]], limit: 3 },
              { model: Education, as: "education", required: false, order: [["start_date", "DESC"]], limit: 2 },
              { model: CandidateSkill, as: "candidateSkills", required: false },
            ],
          },
        ],
      },
    ],
  });

  if (!interview) {
    throw createError("Interview not found", 404);
  }

  const job = interview.submission?.job;
  const candidate = interview.submission?.candidate;
  if (!isJobStaff(job, userId)) {
    throw createError("You do not have permission to update this interview", 403);
  }
  if (!job || !candidate) {
    throw createError("Job or candidate information is missing for this interview", 400);
  }

  const result = await scoreJobFit(buildJobEmbeddingText(job), buildCandidateProfileText(candidate.toJSON()));
  if (!result) {
    throw createError("AI scoring is temporarily unavailable. Please try again later.", 503);
  }

  await interview.submission!.update({ ai_score: Math.round(result.score) });

  res.json({
    success: true,
    message: `AI agent scored this candidate at ${Math.round(result.score)}%`,
    data: { ai_score: Math.round(result.score), reasoning: result.reasoning },
  });
});

// Delete interview (recruiters only)
export const deleteInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can delete interviews", 403);
  }

  const interview = await Interview.findByPk(id, {
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
          },
        ],
      },
    ],
  });

  if (!interview) {
    throw createError("Interview not found", 404);
  }

  // Check permissions
  const job = interview.submission?.job;
  if (job && job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  await interview.destroy();

  res.json({
    success: true,
    message: "Interview deleted successfully",
  });
});

// Get interview statistics
export const getInterviewStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can view interview statistics", 403);
  }

  // Total interviews for recruiter's jobs
  const totalInterviews = await Interview.count({
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            where: {
              [Op.or]: [
                { created_by: userId },
                { assigned_to: userId },
              ],
            },
          },
        ],
      },
    ],
  });

  // Interviews by status
  const statusStats = await Interview.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("Interview.id")), "count"],
    ],
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            where: {
              [Op.or]: [
                { created_by: userId },
                { assigned_to: userId },
              ],
            },
            attributes: [],
          },
        ],
        attributes: [],
      },
    ],
    group: ["Interview.status"],
    raw: true,
  });

  // Interviews by type
  const typeStats = await Interview.findAll({
    attributes: [
      "interview_type",
      [sequelize.fn("COUNT", sequelize.col("Interview.id")), "count"],
    ],
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            where: {
              [Op.or]: [
                { created_by: userId },
                { assigned_to: userId },
              ],
            },
            attributes: [],
          },
        ],
        attributes: [],
      },
    ],
    group: ["Interview.interview_type"],
    raw: true,
  });

  // Upcoming interviews (next 7 days)
  const upcomingInterviews = await Interview.count({
    where: {
      scheduled_at: {
        [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
      },
      status: "scheduled",
    },
    include: [
      {
        model: Submission,
        as: "submission",
        include: [
          {
            model: Job,
            as: "job",
            where: {
              [Op.or]: [
                { created_by: userId },
                { assigned_to: userId },
              ],
            },
          },
        ],
      },
    ],
  });

  res.json({
    success: true,
    data: {
      totalInterviews,
      upcomingInterviews,
      statusStats,
      typeStats,
    },
  });
});
