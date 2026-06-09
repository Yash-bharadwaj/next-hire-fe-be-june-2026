import { Response } from "express";
import { Op } from "sequelize";
import { Interview, Submission, Job, Candidate, User, Recruiter } from "../models";
import { sequelize } from "../config/database";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/email";

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
  if (userRole === "recruiter") {
    // Recruiters see interviews for their jobs
    whereConditions["$submission.job.created_by$"] = userId;
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
    whereConditions[Op.or] = [
      { "$submission.job.title$": { [Op.iLike]: `%${search}%` } },
      { "$submission.candidate.first_name$": { [Op.iLike]: `%${search}%` } },
      { "$submission.candidate.last_name$": { [Op.iLike]: `%${search}%` } },
    ];
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
      interviews,
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
            attributes: ["id", "job_id", "title", "company_name", "location", "created_by", "assigned_to"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "first_name", "last_name", "phone", "user_id"],
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

  res.json({
    success: true,
    data: { interview },
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
