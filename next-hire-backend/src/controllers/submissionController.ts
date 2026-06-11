import { Response } from "express";
import { Op } from "sequelize";
import { Submission, Job, Candidate, User, Recruiter, Vendor, Interview } from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

// Apply to job (candidates and vendors)
export const createSubmission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!["candidate", "vendor"].includes(userRole!)) {
    throw createError("Only candidates and vendors can submit applications", 403);
  }

  const {
    job_id,
    candidate_id: providedCandidateId,
    cover_letter,
    resume_url,
    expected_salary,
    availability_date,
  } = req.body;

  // Verify job exists and is active
  const job = await Job.findByPk(job_id);
  if (!job) {
    throw createError("Job not found", 404);
  }

  if (job.status !== "active") {
    throw createError("Job is not accepting applications", 400);
  }

  // Check application deadline
  if (job.application_deadline && new Date() > job.application_deadline) {
    throw createError("Application deadline has passed", 400);
  }

  // For vendors, check if job is vendor-eligible
  if (userRole === "vendor" && !job.vendor_eligible) {
    throw createError("This job is not open to vendor submissions", 403);
  }

  // Get candidate ID based on user role
  let candidate_id: string;
  let candidate: any;

  if (userRole === "candidate") {
    // For candidates, find their own candidate profile
    candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }
    candidate_id = candidate.id;
  } else if (userRole === "vendor") {
    // For vendors, use the provided candidate_id
    if (!providedCandidateId) {
      throw createError("Valid candidate ID is required", 400);
    }
    candidate = await Candidate.findByPk(providedCandidateId);
    if (!candidate) {
      throw createError("Candidate not found", 404);
    }
    candidate_id = providedCandidateId;
  } else {
    throw createError("Invalid user role for submission", 403);
  }

  // Check if already applied
  const existingSubmission = await Submission.findOne({
    where: {
      job_id,
      candidate_id,
    },
  });

  if (existingSubmission) {
    throw createError("You have already applied to this job", 400);
  }

  // Check max submissions limit
  if (job.max_submissions_allowed) {
    const submissionCount = await Submission.count({
      where: { job_id },
    });

    if (submissionCount >= job.max_submissions_allowed) {
      throw createError("Maximum number of applications reached for this job", 400);
    }
  }

  // Create submission
  const submission = await Submission.create({
    job_id,
    candidate_id,
    submitted_by: userId!,
    status: "submitted",
    cover_letter,
    resume_url,
    expected_salary: expected_salary ? parseFloat(expected_salary) : undefined,
    availability_date: availability_date ? new Date(availability_date) : undefined,
    submitted_at: new Date(),
  });

  // Fetch created submission with associations
  const createdSubmission = await Submission.findByPk(submission.id, {
    include: [
      {
        model: Job,
        as: "job",
        attributes: ["id", "job_id", "title", "company_name", "location"],
      },
      {
        model: Candidate,
        as: "candidate",
        attributes: ["id", "first_name", "last_name", "phone"],
      },
      {
        model: User,
        as: "submitter",
        attributes: ["id", "email", "role"],
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: { submission: createdSubmission },
    message: "Application submitted successfully",
  });
});

// Get submissions for a candidate (their applications)
export const getCandidateSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "candidate") {
    throw createError("Only candidates can access this endpoint", 403);
  }

  // Find candidate profile
  const candidate = await Candidate.findOne({ where: { user_id: userId } });
  if (!candidate) {
    throw createError("Candidate profile not found", 404);
  }

  const {
    page = 1,
    limit = 10,
    status,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const whereConditions: any = {
    candidate_id: candidate.id,
  };

  if (status) {
    whereConditions.status = status;
  }

  const { count, rows: submissions } = await Submission.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Job,
        as: "job",
        attributes: [
          "id", "job_id", "title", "company_name", "location", 
          "job_type", "salary_min", "salary_max", "status"
        ],
      },
    ],
    order: [["submitted_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  // Attach latest scheduled interview (if any) to each submission for candidate visibility
  const submissionIds = submissions.map((s) => s.id);
  if (submissionIds.length > 0) {
    const interviews = await Interview.findAll({
      where: {
        submission_id: submissionIds,
        status: "scheduled",
      },
      order: [["scheduled_at", "DESC"]],
    });
    const latestBySubmission = new Map<string, any>();
    interviews.forEach((iv: Interview) => {
      if (!latestBySubmission.has(iv.submission_id)) {
        latestBySubmission.set(iv.submission_id, iv);
      }
    });
    submissions.forEach((s: any) => {
      const iv = latestBySubmission.get(s.id);
      if (iv) {
        s.setDataValue("latestInterview", {
          id: iv.id,
          scheduled_at: iv.scheduled_at,
          meeting_link: iv.meeting_link,
          interview_type: iv.interview_type,
          duration_minutes: iv.duration_minutes,
        });
      }
    });
  }

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      submissions,
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

// Get submissions for a vendor (their submissions)
export const getVendorSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "vendor") {
    throw createError("Only vendors can access this endpoint", 403);
  }

  const {
    page = 1,
    limit = 10,
    status,
    job_id,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const whereConditions: any = {
    submitted_by: userId,
  };

  if (status) {
    whereConditions.status = status;
  }

  if (job_id) {
    whereConditions.job_id = job_id;
  }

  const { count, rows: submissions } = await Submission.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: Job,
        as: "job",
        attributes: [
          "id", "job_id", "title", "company_name", "location", 
          "job_type", "salary_min", "salary_max", "status"
        ],
      },
      {
        model: Candidate,
        as: "candidate",
        attributes: ["id", "first_name", "last_name", "phone"],
      },
    ],
    order: [["submitted_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      submissions,
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

// Get submissions for a job (recruiters)
export const getJobSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can access job submissions", 403);
  }

  // Verify job exists and recruiter has access
  const job = await Job.findByPk(jobId);
  if (!job) {
    throw createError("Job not found", 404);
  }

  if (job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  const {
    page = 1,
    limit = 10,
    status,
    search,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const whereConditions: any = {
    job_id: jobId,
  };

  if (status) {
    whereConditions.status = status;
  }

  const includeConditions: any = [
    {
      model: Job,
      as: "job",
      attributes: ["id", "job_id", "title", "company_name"],
    },
    {
      model: Candidate,
      as: "candidate",
      attributes: ["id", "first_name", "last_name", "phone", "location", "experience_years"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
    },
    {
      model: User,
      as: "submitter",
      attributes: ["id", "email", "role"],
      include: [
        {
          model: Vendor,
          as: "vendorProfile",
          attributes: ["company_name", "contact_person_name"],
          required: false,
        },
      ],
    },
  ];

  // Add search functionality
  if (search) {
    includeConditions[1].where = {
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ],
    };
  }

  const { count, rows: submissions } = await Submission.findAndCountAll({
    where: whereConditions,
    include: includeConditions,
    order: [["submitted_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      submissions,
      job,
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

// Get single submission details
export const getSubmissionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  const submission = await Submission.findByPk(id, {
    include: [
      {
        model: Job,
        as: "job",
        attributes: [
          "id", "job_id", "title", "description", "company_name", "location",
          "job_type", "salary_min", "salary_max", "required_skills", "preferred_skills",
          "created_by", "assigned_to"
        ],
      },
      {
        model: Candidate,
        as: "candidate",
        attributes: [
          "id", "first_name", "last_name", "phone", "location",
          "current_salary", "expected_salary", "experience_years", "skills",
          "resume_url", "linkedin_url", "portfolio_url", "bio"
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
        ],
      },
      {
        model: User,
        as: "submitter",
        attributes: ["id", "email", "role"],
        include: [
          {
            model: Vendor,
            as: "vendorProfile",
            attributes: ["company_name", "contact_person_name"],
            required: false,
          },
        ],
      },
      {
        model: User,
        as: "reviewer",
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
    ],
  });

  if (!submission) {
    throw createError("Submission not found", 404);
  }

  // Check access permissions
  if (userRole === "candidate") {
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate || submission.candidate_id !== candidate.id) {
      throw createError("Access denied", 403);
    }
  } else if (userRole === "vendor") {
    if (submission.submitted_by !== userId) {
      throw createError("Access denied", 403);
    }
  } else if (userRole === "recruiter") {
    const job = submission.job;
    if (job && job.created_by !== userId && job.assigned_to !== userId) {
      throw createError("Access denied", 403);
    }
  }

  res.json({
    success: true,
    data: { submission },
  });
});

// Update submission status (recruiters only)
export const updateSubmissionStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can update submission status", 403);
  }

  const { status, notes } = req.body;

  const submission = await Submission.findByPk(id, {
    include: [
      {
        model: Job,
        as: "job",
        attributes: ["id", "created_by", "assigned_to"],
      },
    ],
  });

  if (!submission) {
    throw createError("Submission not found", 404);
  }

  // Check if recruiter has access to this job
  const job = submission.job;
  if (job && job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    submitted: ["under_review", "rejected"],
    under_review: ["shortlisted", "rejected"],
    shortlisted: ["interview_scheduled", "rejected"],
    interview_scheduled: ["interviewed", "rejected"],
    interviewed: ["offered", "rejected"],
    offered: ["hired", "rejected"],
    hired: [], // Final state
    rejected: [], // Final state
  };

  const currentStatus = submission.status;
  if (!validTransitions[currentStatus]?.includes(status)) {
    throw createError(`Cannot transition from ${currentStatus} to ${status}`, 400);
  }

  await submission.update({
    status,
    notes: notes !== undefined ? notes : submission.notes,
    reviewed_at: new Date(),
    reviewed_by: userId,
  });

  // Fetch updated submission with associations
  const updatedSubmission = await Submission.findByPk(submission.id, {
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
  });

  res.json({
    success: true,
    data: { submission: updatedSubmission },
    message: "Submission status updated successfully",
  });
});

// Withdraw application (candidates only)
export const withdrawSubmission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "candidate") {
    throw createError("Only candidates can withdraw their applications", 403);
  }

  const submission = await Submission.findByPk(id);
  if (!submission) {
    throw createError("Submission not found", 404);
  }

  // Find candidate profile
  const candidate = await Candidate.findOne({ where: { user_id: userId } });
  if (!candidate || submission.candidate_id !== candidate.id) {
    throw createError("Access denied", 403);
  }

  // Check if withdrawal is allowed
  if (["hired", "rejected"].includes(submission.status)) {
    throw createError("Cannot withdraw application in current status", 400);
  }

  await submission.update({
    status: "rejected",
    notes: (submission.notes || "") + "\n[WITHDRAWN BY CANDIDATE]",
  });

  res.json({
    success: true,
    message: "Application withdrawn successfully",
  });
});
