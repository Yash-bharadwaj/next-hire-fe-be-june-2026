import { Response } from "express";
import { Op } from "sequelize";
import { randomUUID } from "crypto";
import {
  User,
  Recruiter,
  Vendor,
  Job,
  Submission,
  Candidate,
  CandidateSkill,
  Experience,
  Education,
  Interview,
  Task,
  Placement,
  BusinessPartner,
  BusinessPartnerContact,
  JobProfitability,
} from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/email";
import { isJobStaff } from "../utils/jobPermissions";
import { formatUserName, prepareNotesAndAttachmentsForResponse } from "../utils/notesAndAttachments";
import { scoreJobFit } from "../services/aiParsingService";
import { buildCandidateProfileText, buildJobEmbeddingText } from "./candidateSearchController";
import { estimatePayRate } from "../services/aiParsingService";
import {
  getSetting,
  setSetting,
  fillTemplate,
  PAY_RATE_PROMPT_KEY,
  DEFAULT_PAY_RATE_PROMPT,
} from "../services/settingsService";

// Shared `include` for resolving Job's people/client references to
// human-readable data instead of raw UUIDs.
const jobPersonAttributes = ["id", "email"];
const jobPersonInclude = (as: string) => ({
  model: User,
  as,
  attributes: jobPersonAttributes,
  required: false,
  include: [
    {
      model: Recruiter,
      as: "recruiterProfile",
      attributes: ["first_name", "last_name", "phone"],
      required: false,
    },
  ],
});

export const jobDetailIncludes = [
  jobPersonInclude("creator"),
  jobPersonInclude("assignee"),
  jobPersonInclude("primaryRecruiter"),
  jobPersonInclude("accountManager"),
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
];

// Get recruiter profile
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Recruiter,
          as: "recruiterProfile",
        },
      ],
    });

    if (!user || !(user as any).recruiterProfile) {
      throw createError("Recruiter profile not found", 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
        },
        profile: (user as any).recruiterProfile,
      },
    });
  }
);

// Update recruiter profile
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      first_name,
      last_name,
      phone,
      company_name,
      company_website,
      job_title,
      department,
      bio,
    } = req.body;

    const recruiter = await Recruiter.findOne({ where: { user_id: userId } });
    if (!recruiter) {
      throw createError("Recruiter profile not found", 404);
    }

    const updatedRecruiter = await recruiter.update({
      first_name,
      last_name,
      phone,
      company_name,
      company_website,
      job_title,
      department,
      bio,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedRecruiter,
    });
  }
);

// List recruiter users, for Primary Recruiter / Account Manager / Assigned To dropdowns
export const listTeamMembers = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const members = await User.findAll({
      where: { role: "recruiter", status: "active" },
      attributes: ["id", "email"],
      include: [
        {
          model: Recruiter,
          as: "recruiterProfile",
          attributes: ["first_name", "last_name"],
          required: false,
        },
      ],
      order: [["email", "ASC"]],
    });

    res.json({
      success: true,
      data: { members },
    });
  }
);

const WORK_SCHEDULE_LABELS: Record<string, string> = {
  day_shift: "Day shift",
  night_shift: "Night shift",
  rotating_shift: "Rotating shift",
  flexible: "Flexible",
};

const formatExperienceLevel = (min?: number, max?: number): string => {
  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${min}-${max} years`;
  }
  if (min !== undefined && min !== null) return `Minimum ${min} years`;
  if (max !== undefined && max !== null) return `Up to ${max} years`;
  return "Not specified";
};

// Estimates a market pay/bill rate range for a job via Gemini, using the
// admin-editable prompt template, and persists it on the job. Non-fatal:
// if AI estimation fails or is unavailable, the job is left without an
// estimate rather than blocking the caller.
export async function triggerPayRateEstimation(jobId: string): Promise<void> {
  const job = await Job.findByPk(jobId);
  if (!job) return;

  const promptTemplate = await getSetting(PAY_RATE_PROMPT_KEY, DEFAULT_PAY_RATE_PROMPT);
  const instructions = fillTemplate(promptTemplate, {
    job_title: job.title || "this role",
    location: job.location || "Not specified",
    skills: (job.required_skills || []).join(", ") || "Not specified",
    experience_level: formatExperienceLevel(job.experience_min, job.experience_max),
    work_schedule: job.work_schedule ? WORK_SCHEDULE_LABELS[job.work_schedule] : "Not specified",
    job_description: (job.description || "").slice(0, 3000),
  });

  const estimate = await estimatePayRate(instructions);
  if (!estimate) return;

  await job.update({
    ai_estimated_pay_min: estimate.min,
    ai_estimated_pay_max: estimate.max,
    ai_estimated_pay_currency: estimate.currency,
    ai_estimated_pay_basis: estimate.basis,
    ai_estimated_pay_rationale: estimate.rationale,
    ai_estimated_pay_at: new Date(),
  } as any);
}

// Get the current (or default) pay-rate-estimation prompt template
export const getPayRatePrompt = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const prompt = await getSetting(PAY_RATE_PROMPT_KEY, DEFAULT_PAY_RATE_PROMPT);
    res.json({ success: true, data: { prompt, default: DEFAULT_PAY_RATE_PROMPT } });
  }
);

// Update the pay-rate-estimation prompt template (admin/recruiter editable)
export const updatePayRatePrompt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { prompt } = req.body;
    const saved = await setSetting(PAY_RATE_PROMPT_KEY, prompt, userId);
    res.json({ success: true, message: "Prompt updated successfully", data: { prompt: saved } });
  }
);

// Re-run the AI pay rate estimate for an existing job (manual refresh)
export const reestimateJobPayRate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }
    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to update this job", 403);
    }

    await triggerPayRateEstimation(jobId);
    const updatedJob = await Job.findByPk(jobId);

    res.json({
      success: true,
      message: "Pay rate estimate updated",
      data: {
        ai_estimated_pay_min: updatedJob?.ai_estimated_pay_min,
        ai_estimated_pay_max: updatedJob?.ai_estimated_pay_max,
        ai_estimated_pay_currency: updatedJob?.ai_estimated_pay_currency,
        ai_estimated_pay_basis: updatedJob?.ai_estimated_pay_basis,
        ai_estimated_pay_rationale: updatedJob?.ai_estimated_pay_rationale,
        ai_estimated_pay_at: updatedJob?.ai_estimated_pay_at,
      },
    });
  }
);

// Create a new job
export const createJob = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      title,
      description,
      external_description,
      company_name,
      location,
      city,
      state,
      country,
      job_type,
      salary_min,
      salary_max,
      salary_currency,
      bill_rate_min,
      bill_rate_max,
      experience_min,
      experience_max,
      required_skills,
      preferred_skills,
      education_requirements,
      work_schedule,
      priority,
      positions_available,
      max_submissions_allowed,
      vendor_eligible,
      remote_work_allowed,
      start_date,
      end_date,
      application_deadline,
      assigned_to,
      business_partner_id,
      client_contact_id,
      primary_recruiter_id,
      account_manager_id,
      status, // Allow status to be set from frontend
    } = req.body;

    // The Client dropdown sends business_partner_id; company_name (used by
    // every other job listing/display) is kept in sync from the partner's
    // name rather than trusted from the client, so the two can never drift.
    let resolvedCompanyName = company_name;
    if (business_partner_id) {
      const client = await BusinessPartner.findByPk(business_partner_id);
      if (!client) {
        throw createError("Selected client was not found", 400);
      }
      resolvedCompanyName = client.name;
    }

    // Generate job_id if not provided
    let job_id: string;
    try {
      const year = new Date().getFullYear();
      // Find the highest job number for this year
      const lastJob = await Job.findOne({
        where: {
          job_id: {
            [Op.like]: `JOB-${year}-%`,
          },
        },
        order: [["created_at", "DESC"]],
        attributes: ["job_id"],
      });

      let jobNumber = 1;
      if (lastJob && lastJob.job_id) {
        const parts = lastJob.job_id.split("-");
        if (parts.length >= 3) {
          const lastJobNumber = parseInt(parts[2] || "0");
          if (!isNaN(lastJobNumber)) {
            jobNumber = lastJobNumber + 1;
          }
        }
      }

      // Format: JOB-YYYY-XXX (e.g., JOB-2024-001)
      job_id = `JOB-${year}-${String(jobNumber).padStart(3, "0")}`;
    } catch (error: any) {
      logger.error(`Error generating job_id: ${error.message}`);
      // Fallback: use timestamp-based ID
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      job_id = `JOB-${year}-${timestamp}`;
    }

    try {
      logger.info(`Creating job with job_id: ${job_id} for user ${userId}`);
      
      const job = await Job.create({
        job_id, // Set the generated job_id
        title,
        description,
        external_description,
        company_name: resolvedCompanyName,
        business_partner_id: business_partner_id || undefined,
        client_contact_id: client_contact_id || undefined,
        location,
        city,
        state,
        country: country || "US",
        job_type,
        salary_min,
        salary_max,
        salary_currency: salary_currency || "USD",
        bill_rate_min,
        bill_rate_max,
        experience_min,
        experience_max,
        required_skills: required_skills || [],
        preferred_skills: preferred_skills || [],
        education_requirements,
        work_schedule: work_schedule || undefined,
        priority: priority || "medium",
        positions_available: positions_available || 1,
        max_submissions_allowed,
        vendor_eligible: vendor_eligible !== false, // Default to true
        remote_work_allowed: remote_work_allowed || false,
        start_date,
        end_date,
        application_deadline,
        created_by: userId!,
        primary_recruiter_id: primary_recruiter_id || undefined,
        account_manager_id: account_manager_id || undefined,
        // "Assigned To" defaults to the Primary Recruiter when not set
        // explicitly, falling back to whoever is creating the job.
        assigned_to: assigned_to || primary_recruiter_id || userId,
        status: status || "active", // Use provided status or default to active
      });

      logger.info(`Job created successfully: ${job.job_id} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: "Job created successfully",
        data: job,
      });

      // Fire-and-forget: don't make job creation wait on the AI call.
      triggerPayRateEstimation(job.id).catch((err) =>
        logger.error(`Pay rate estimation failed for job ${job.id}`, err)
      );
    } catch (error: any) {
      logger.error(`Error creating job: ${error.message}`, error);
      throw error; // Let asyncHandler handle it
    }
  }
);

// Update a job
export const updateJob = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    // Check if user has permission to update this job
    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to update this job", 403);
    }

    const updateData = { ...req.body };

    // Keep company_name in sync with the selected client (see createJob).
    if (updateData.business_partner_id) {
      const client = await BusinessPartner.findByPk(updateData.business_partner_id);
      if (!client) {
        throw createError("Selected client was not found", 400);
      }
      updateData.company_name = client.name;
    }

    await job.update(updateData);

    const updatedJob = await Job.findByPk(jobId, { include: jobDetailIncludes });

    res.json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });
  }
);

// List jobs with filters and pagination
export const listJobs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      page = 1,
      limit = 20,
      status,
      search,
      priority,
      job_type,
      created_by_me,
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where conditions
    const whereConditions: any = {};

    // Show jobs created by, assigned to, or staffed (as primary recruiter /
    // account manager) by the current user
    if (created_by_me === "true") {
      whereConditions.created_by = userId;
    } else {
      whereConditions[Op.or] = [
        { created_by: userId },
        { assigned_to: userId },
        { primary_recruiter_id: userId },
        { account_manager_id: userId },
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    if (job_type) {
      whereConditions.job_type = job_type;
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { company_name: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: jobs, count: total } = await Job.findAndCountAll({
      where: whereConditions,
      include: jobDetailIncludes,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit as string),
      offset,
    });

    // Get submission counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const submissionCount = await Submission.count({
          where: { job_id: job.id },
        });
        return {
          ...job.toJSON(),
          submission_count: submissionCount,
        };
      })
    );

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        jobs: jobsWithCounts,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit as string),
        },
      },
    });
  }
);

// Export jobs as CSV
export const exportJobsCsv = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { status, search, priority, job_type } = req.query;
    const userId = req.user?.userId;

    const whereConditions: any = {
      [Op.or]: [{ created_by: userId }, { assigned_to: userId }],
    };

    if (status) whereConditions.status = status;
    if (priority) whereConditions.priority = priority;
    if (job_type) whereConditions.job_type = job_type;
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { company_name: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const jobs = await Job.findAll({
      where: whereConditions,
      order: [["created_at", "DESC"]],
    });

    const header = [
      "job_id",
      "title",
      "company_name",
      "location",
      "job_type",
      "status",
      "priority",
      "salary_min",
      "salary_max",
      "experience_min",
      "experience_max",
      "vendor_eligible",
      "remote_work_allowed",
      "created_at",
    ];

    const rows = jobs.map((job) =>
      [
        job.job_id,
        job.title,
        job.company_name,
        job.location,
        job.job_type,
        job.status,
        job.priority,
        job.salary_min ?? "",
        job.salary_max ?? "",
        job.experience_min ?? "",
        job.experience_max ?? "",
        job.vendor_eligible,
        job.remote_work_allowed,
        job.created_at?.toISOString() ?? "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="jobs_export.csv"'
    );
    res.send(csv);
  }
);

// Get job details with submissions
export const getJobDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId, { include: jobDetailIncludes });

    if (!job) {
      throw createError("Job not found", 404);
    }

    // Check if user has permission to view this job
    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to view this job", 403);
    }

    // Get submission count
    const submissionCount = await Submission.count({
      where: { job_id: jobId },
    });

    res.json({
      success: true,
      data: {
        job,
        submission_count: submissionCount,
      },
    });
  }
);

// Add internal note to a job
export const addJobNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const { note } = req.body;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to update this job", 403);
    }

    const history = (job as any).notes_history || [];
    history.push({
      note,
      by: userId,
      at: new Date().toISOString(),
    });

    await job.update({ notes_history: history });

    res.json({
      success: true,
      message: "Note added successfully",
      data: { notes_history: history },
    });
  }
);

// Add attachment to a job (URL-based or file upload)
export const addJobAttachment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to update this job", 403);
    }

    let attachmentUrl: string;
    let attachmentName: string;

    if ((req as any).file) {
      // File upload path: serve from /uploads/documents_tmp
      const file = (req as any).file;
      const serverBase = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
      attachmentUrl = `${serverBase}/uploads/documents_tmp/${file.filename}`;
      attachmentName = req.body.name || file.originalname;
    } else {
      const { url, name } = req.body;
      if (!url) throw createError("url or file is required", 400);
      attachmentUrl = url;
      attachmentName = name || url;
    }

    const attachments = (job as any).attachments || [];
    attachments.push({
      url: attachmentUrl,
      name: attachmentName,
      by: userId,
      at: new Date().toISOString(),
    });

    await job.update({ attachments });

    res.json({
      success: true,
      message: "Attachment added successfully",
      data: { attachments },
    });
  }
);

// Get a job's profitability breakdown (creates a zeroed-out row on first view)
export const getJobProfitability = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }
    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to view this job", 403);
    }

    let profitability = await JobProfitability.findOne({ where: { job_id: jobId } });
    if (!profitability) {
      profitability = await JobProfitability.create({ job_id: jobId, updated_by: userId });
    }

    res.json({
      success: true,
      data: { profitability },
    });
  }
);

// Create or update a job's profitability breakdown
export const updateJobProfitability = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;
    const { revenue, direct_cost, overheads, one_time_costs } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }
    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to update this job", 403);
    }

    let profitability = await JobProfitability.findOne({ where: { job_id: jobId } });
    if (!profitability) {
      profitability = await JobProfitability.create({ job_id: jobId, updated_by: userId });
    }

    await profitability.update({
      revenue: revenue !== undefined ? revenue : profitability.revenue,
      direct_cost: direct_cost !== undefined ? direct_cost : profitability.direct_cost,
      overheads: overheads !== undefined ? overheads : profitability.overheads,
      one_time_costs: one_time_costs !== undefined ? one_time_costs : profitability.one_time_costs,
      updated_by: userId,
    } as any);

    res.json({
      success: true,
      message: "Profitability updated successfully",
      data: { profitability },
    });
  }
);

// Source candidates into a job's sourcing funnel (recruiter-initiated)
export const sourceCandidates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const { candidate_ids, ai_scores } = req.body as {
      candidate_ids: string[];
      ai_scores?: Record<string, number>;
    };
    const userId = req.user?.userId;

    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      throw createError("candidate_ids array is required", 400);
    }

    const job = await Job.findByPk(jobId);
    if (!job) throw createError("Job not found", 404);

    if (!isJobStaff(job, userId)) {
      throw createError("You do not have permission to source candidates for this job", 403);
    }

    const results: any[] = [];
    const skipped: string[] = [];

    for (const candidateId of candidate_ids) {
      const candidate = await Candidate.findByPk(candidateId);
      if (!candidate) {
        skipped.push(candidateId);
        continue;
      }

      const existing = await Submission.findOne({
        where: { job_id: jobId, candidate_id: candidateId },
      });

      if (existing) {
        skipped.push(candidateId);
        continue;
      }

      const score = ai_scores?.[candidateId];

      const submission = await Submission.create({
        job_id: jobId,
        candidate_id: candidateId,
        submitted_by: userId!,
        status: "new_candidate",
        submitted_at: new Date(),
        ai_score: typeof score === "number" ? Math.round(score) : undefined,
      });

      results.push(submission);
    }

    res.json({
      success: true,
      message: `${results.length} candidate(s) added to sourcing funnel`,
      data: { added: results, skipped },
    });
  }
);

// Get submissions for a job
export const getJobSubmissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;
    const {
      page = 1,
      limit = 20,
      status,
      sort_by = "submitted_at",
      sort_order = "DESC",
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Check if user has permission to view this job
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    if (!isJobStaff(job, userId)) {
      throw createError(
        "You do not have permission to view submissions for this job",
        403
      );
    }

    // Build where conditions
    const whereConditions: any = { job_id: jobId };
    if (status) {
      whereConditions.status = status;
    }

    const { rows: submissions, count: total } =
      await Submission.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Candidate,
            as: "candidate",
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
            attributes: ["id", "email"],
          },
        ],
        order: [[sort_by as string, sort_order as string]],
        limit: parseInt(limit as string),
        offset,
      });

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit as string),
        },
      },
    });
  }
);

// Get submission details
export const getSubmissionDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Job,
          as: "job",
          include: [
            {
              model: BusinessPartner,
              as: "client",
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
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email"],
            },
            {
              model: CandidateSkill,
              as: "candidateSkills",
              required: false,
            },
          ],
        },
        {
          model: User,
          as: "submitter",
          attributes: ["id", "email"],
          include: [
            { model: Recruiter, as: "recruiterProfile", attributes: ["first_name", "last_name"], required: false },
            { model: Vendor, as: "vendorProfile", attributes: ["company_name", "contact_person_name"], required: false },
          ],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "email"],
          include: [
            { model: Recruiter, as: "recruiterProfile", attributes: ["first_name", "last_name"], required: false },
          ],
        },
      ],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }

    // Check if user has permission to view this submission
    if (!isJobStaff(submission.job, userId)) {
      throw createError(
        "You do not have permission to view this submission",
        403
      );
    }

    // Get interviews for this submission
    const interviews = await Interview.findAll({
      where: { submission_id: submissionId },
      include: [
        {
          model: User,
          as: "interviewer",
          attributes: ["id", "email"],
        },
      ],
      order: [["scheduled_at", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        submission: await prepareNotesAndAttachmentsForResponse(submission, req.user?.role),
        interviews,
      },
    });
  }
);

// Add note to submission
export const addSubmissionNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }

    if (!isJobStaff(submission.job, userId)) {
      throw createError(
        "You do not have permission to update this submission",
        403
      );
    }

    const authorName = await formatUserName(userId);
    const notesHistory = (submission as any).notes_history || [];
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
    notesHistory.push(entry);

    await submission.update({
      notes: entry.content, // keep latest note in notes field for quick view
      notes_history: notesHistory,
    } as any);

    res.json({
      success: true,
      message: "Note added successfully",
      data: { notes_history: notesHistory },
    });
  }
);

// Edit an existing submission note
export const updateSubmissionNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId, noteId } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }
    if (!isJobStaff(submission.job, userId)) {
      throw createError("You do not have permission to update this submission", 403);
    }

    const notesHistory = (submission as any).notes_history || [];
    const noteIndex = notesHistory.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      throw createError("Note not found", 404);
    }

    const existing = notesHistory[noteIndex];
    notesHistory[noteIndex] = {
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

    await submission.update({ notes_history: notesHistory } as any);

    res.json({
      success: true,
      message: "Note updated successfully",
      data: { notes_history: notesHistory },
    });
  }
);

// Delete a note from a submission
export const deleteSubmissionNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId, noteId } = req.params;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }
    if (!isJobStaff(submission.job, userId)) {
      throw createError("You do not have permission to update this submission", 403);
    }

    const notesHistory = (submission as any).notes_history || [];
    const noteIndex = notesHistory.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      throw createError("Note not found", 404);
    }

    notesHistory.splice(noteIndex, 1);
    await submission.update({ notes_history: notesHistory } as any);

    res.json({
      success: true,
      message: "Note deleted successfully",
      data: { notes_history: notesHistory },
    });
  }
);

// Add a document to a submission - either an uploaded file or a pasted URL
export const addSubmissionAttachment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const { name, document_type, valid_from, valid_to } = req.body;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }

    if (!isJobStaff(submission.job, userId)) {
      throw createError(
        "You do not have permission to update this submission",
        403
      );
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

    const attachments = (submission as any).attachments || [];
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

    await submission.update({ attachments } as any);

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: { attachments },
    });
  }
);

// "Assign to AI Agent" - have Gemini (re-)evaluate this candidate against the
// job and persist the result as ai_score/ai_reasoning, reusing the exact same
// scoring path Manual Search uses (buildJobEmbeddingText/buildCandidateProfileText
// + scoreJobFit), so this is never a fabricated number or narrative.
export const assignSubmissionAiAgent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
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
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }
    if (!isJobStaff(submission.job, userId)) {
      throw createError("You do not have permission to update this submission", 403);
    }

    const job = submission.job!;
    const candidate = submission.candidate!;

    const result = await scoreJobFit(buildJobEmbeddingText(job), buildCandidateProfileText(candidate.toJSON()));
    if (!result) {
      throw createError("AI scoring is temporarily unavailable. Please try again later.", 503);
    }

    await submission.update({
      ai_score: Math.round(result.score),
      ai_reasoning: result.reasoning,
    } as any);

    res.json({
      success: true,
      message: `AI agent scored this candidate at ${Math.round(result.score)}%`,
      data: { ai_score: Math.round(result.score), ai_reasoning: result.reasoning },
    });
  }
);

// Other active jobs that might suit this candidate, ranked by real
// required/preferred skill overlap (deterministic, no AI call) - used by the
// Pitch tab's "Other Jobs of Interest" section.
export const getRelatedJobsForSubmission = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Job, as: "job" },
        {
          model: Candidate,
          as: "candidate",
          include: [{ model: CandidateSkill, as: "candidateSkills", required: false }],
        },
      ],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }
    if (!isJobStaff(submission.job, userId)) {
      throw createError("You do not have permission to view this submission", 403);
    }

    const candidate = submission.candidate;
    const candidateSkillNames: string[] = (candidate as any)?.candidateSkills?.length
      ? (candidate as any).candidateSkills.map((s: any) => s.skill_name)
      : candidate?.skills || [];
    const candidateSkills = new Set(candidateSkillNames.map((s) => s.toLowerCase()));

    const otherJobs = await Job.findAll({
      where: { status: "active", id: { [Op.ne]: submission.job_id } },
      attributes: [
        "id",
        "job_id",
        "title",
        "company_name",
        "location",
        "job_type",
        "salary_min",
        "salary_max",
        "required_skills",
        "preferred_skills",
      ],
      limit: 50,
    });

    const ranked = otherJobs
      .map((job) => {
        const skills = [...(job.required_skills || []), ...(job.preferred_skills || [])];
        const matchedSkills = skills.filter((s) => candidateSkills.has(s.toLowerCase()));
        const matchScore = skills.length ? Math.round((matchedSkills.length / skills.length) * 100) : 0;
        return { job, matchScore, matchedSkills };
      })
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    res.json({
      success: true,
      data: { jobs: ranked },
    });
  }
);

// Update submission status
export const updateSubmissionStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [{ model: Job, as: "job" }],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }

    // Check if user has permission to update this submission
    if (!isJobStaff(submission.job, userId)) {
      throw createError(
        "You do not have permission to update this submission",
        403
      );
    }

    const statusHistory = (submission as any).status_history || [];
    if (status !== submission.status) {
      statusHistory.push({
        from: submission.status,
        to: status,
        by: userId,
        at: new Date().toISOString(),
        notes: notes || undefined,
      });
    }

    const updatedSubmission = await submission.update({
      status,
      notes: notes || submission.notes,
      status_history: statusHistory,
      reviewed_by: userId!,
      reviewed_at: new Date(),
    } as any);

    // Auto-create or update placement for offer/hire
    if (status === "offered" || status === "hired") {
      const existingPlacement = await Placement.findOne({
        where: { submission_id: submissionId },
      });

      const job = submission.job!;
      const year = new Date().getFullYear();
      const count = await Placement.count({
        where: {
          placement_id: {
            [Op.like]: `PL-${year}-%`,
          },
        },
      });
      const placement_id = `PL-${year}-${String(count + 1).padStart(3, "0")}`;

      // Determine vendor_id if submission was made by vendor
      let vendor_id: string | undefined = undefined;
      if (submission.submitted_by !== submission.candidate_id) {
        const submitter = await User.findByPk(submission.submitted_by);
        if (submitter && submitter.role === "vendor") {
          vendor_id = submitter.id;
        }
      }

      if (!existingPlacement && status === "offered") {
        const placement = await Placement.create({
          placement_id,
          job_id: job.id,
          candidate_id: submission.candidate_id,
          submission_id: submission.id,
          recruiter_id: job.assigned_to || job.created_by || userId!,
          vendor_id,
          start_date: new Date(),
          placement_type: "permanent",
          salary: submission.expected_salary || job.salary_min || 0,
          salary_currency: (job as any).salary_currency || "USD",
          status: "on_hold", // offered but not started
          location: job.location,
          work_arrangement: job.remote_work_allowed ? "remote" : "onsite",
          created_by: userId!,
          onboarding_status: "pending",
        } as any);
        logger.info(
          `Placement created (on_hold) ${placement.id} for submission ${submissionId}`
        );
      } else if (existingPlacement && status === "hired") {
        await existingPlacement.update({
          status: "active",
          start_date: new Date(),
        });
        logger.info(
          `Placement ${existingPlacement.id} activated for submission ${submissionId}`
        );
      } else if (!existingPlacement && status === "hired") {
        const placement = await Placement.create({
          placement_id,
          job_id: job.id,
          candidate_id: submission.candidate_id,
          submission_id: submission.id,
          recruiter_id: job.assigned_to || job.created_by || userId!,
          vendor_id,
          start_date: new Date(),
          placement_type: "permanent",
          salary: submission.expected_salary || job.salary_min || 0,
          salary_currency: (job as any).salary_currency || "USD",
          status: "active",
          location: job.location,
          work_arrangement: job.remote_work_allowed ? "remote" : "onsite",
          created_by: userId!,
          onboarding_status: "pending",
        } as any);
        logger.info(
          `Placement created ${placement.id} for submission ${submissionId}`
        );
      }
    }

    logger.info(
      `Submission ${submissionId} status updated to ${status} by user ${userId}`
    );

    res.json({
      success: true,
      message: "Submission status updated successfully",
      data: updatedSubmission,
    });
  }
);

// Schedule an interview
export const scheduleInterview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const {
      interviewer_id,
      interview_type,
      scheduled_at,
      duration_minutes,
      location,
      meeting_link,
    } = req.body;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Job, as: "job" },
        {
          model: Candidate,
          as: "candidate",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!submission) {
      throw createError("Submission not found", 404);
    }

    // Check if user has permission
    if (!isJobStaff(submission.job, userId)) {
      throw createError(
        "You do not have permission to schedule interviews for this submission",
        403
      );
    }

    const sanitizedLink = (meeting_link || "").trim();
    const generatedLink =
      sanitizedLink ||
      `https://meet.jit.si/next-hire-${submissionId}-${Date.now()}`;

    // Upsert: if an interview already exists for this submission, update it instead of creating another
    const existingInterview = await Interview.findOne({
      where: { submission_id: submissionId, status: "scheduled" },
    });

    let interview;
    if (existingInterview) {
      interview = await existingInterview.update({
        interviewer_id: interviewer_id || userId!,
        interview_type,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        location,
        meeting_link: generatedLink,
        updated_at: new Date(),
      });
    } else {
      interview = await Interview.create({
        submission_id: submissionId!,
        interviewer_id: interviewer_id || userId!,
        interview_type,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        location,
        meeting_link: generatedLink,
        status: "scheduled",
        created_by: userId!,
      });
    }

    // Always move submission to interview_scheduled unless already beyond
    if (
      !["offered", "hired", "rejected"].includes(
        (submission.status || "").toLowerCase()
      )
    ) {
      await submission.update({ status: "interview_scheduled" });
    }

    logger.info(
      `Interview scheduled/updated for submission ${submissionId} by user ${userId}`
    );

    // Email notification to candidate
    if (submission.candidate?.user?.email) {
      await sendEmail({
        to: submission.candidate.user.email,
        subject: "Interview Scheduled",
        text: `Your interview for ${submission.job?.title} is scheduled at ${scheduled_at}. Meeting link: ${generatedLink}`,
      });
    }

    res.status(existingInterview ? 200 : 201).json({
      success: true,
      message: existingInterview
        ? "Interview updated successfully"
        : "Interview scheduled successfully",
      data: interview,
    });
  }
);

// Create a task
export const createTask = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      title,
      description,
      assigned_to,
      priority,
      due_date,
      job_id,
      submission_id,
      business_partner_id,
    } = req.body;

    if (job_id) {
      const job = await Job.findByPk(job_id);
      if (!job) {
        throw createError("Job not found", 404);
      }
      if (!isJobStaff(job, userId)) {
        throw createError("You do not have permission to add tasks to this job", 403);
      }
    }

    if (submission_id) {
      const submission = await Submission.findByPk(submission_id, {
        include: [{ model: Job, as: "job" }],
      });
      if (!submission) {
        throw createError("Submission not found", 404);
      }
      if (!isJobStaff(submission.job, userId)) {
        throw createError("You do not have permission to add tasks to this submission", 403);
      }
    }

    if (business_partner_id) {
      const partner = await BusinessPartner.findByPk(business_partner_id);
      if (!partner) {
        throw createError("Business partner not found", 404);
      }
      if (partner.created_by !== userId && partner.assigned_to !== userId) {
        throw createError("You do not have permission to add tasks to this business partner", 403);
      }
    }

    const task = await Task.create({
      title,
      description,
      assigned_to: assigned_to || userId,
      created_by: userId!,
      priority: priority || "medium",
      due_date,
      job_id,
      submission_id,
      business_partner_id,
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [jobPersonInclude("assignee"), jobPersonInclude("creator")],
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: createdTask,
    });
  }
);

// List tasks
export const listTasks = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assigned_to_me,
      job_id,
      submission_id,
      business_partner_id,
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where conditions
    const whereConditions: any = {};

    if (job_id) {
      // Job-scoped view (e.g. the job's ToDos tab): visible to everyone
      // staffed on the job, not just the task's own assignee/creator.
      const job = await Job.findByPk(job_id as string);
      if (!job) {
        throw createError("Job not found", 404);
      }
      if (!isJobStaff(job, userId)) {
        throw createError("You do not have permission to view this job's tasks", 403);
      }
      whereConditions.job_id = job_id;
    } else if (submission_id) {
      // Submission-scoped view (e.g. the interview's ToDo tab): visible to
      // everyone staffed on the underlying job.
      const submission = await Submission.findByPk(submission_id as string, {
        include: [{ model: Job, as: "job" }],
      });
      if (!submission) {
        throw createError("Submission not found", 404);
      }
      if (!isJobStaff(submission.job, userId)) {
        throw createError("You do not have permission to view this submission's tasks", 403);
      }
      whereConditions.submission_id = submission_id;
    } else if (business_partner_id) {
      // Business partner-scoped view (e.g. the client's To dos tab): visible
      // to whoever created or manages that partner record.
      const partner = await BusinessPartner.findByPk(business_partner_id as string);
      if (!partner) {
        throw createError("Business partner not found", 404);
      }
      if (partner.created_by !== userId && partner.assigned_to !== userId) {
        throw createError("You do not have permission to view this partner's tasks", 403);
      }
      whereConditions.business_partner_id = business_partner_id;
    } else if (assigned_to_me === "true") {
      whereConditions.assigned_to = userId;
    } else {
      whereConditions[Op.or] = [
        { assigned_to: userId },
        { created_by: userId },
      ];
    }

    if (status) {
      whereConditions.status = status;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    const { rows: tasks, count: total } = await Task.findAndCountAll({
      where: whereConditions,
      include: [
        jobPersonInclude("assignee"),
        jobPersonInclude("creator"),
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title"],
        },
        {
          model: Submission,
          as: "submission",
          attributes: ["id", "status"],
        },
        {
          model: BusinessPartner,
          as: "businessPartner",
          attributes: ["id", "business_partner_number", "name"],
        },
      ],
      order: [["due_date", "ASC"], ["created_at", "DESC"]],
      limit: parseInt(limit as string),
      offset,
    });

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit as string),
        },
      },
    });
  }
);

// Update a task's mutable fields (title, description, assignee, priority, due date, status)
export const updateTask = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    const task = await Task.findByPk(taskId, {
      include: [
        { model: Job, as: "job" },
        { model: Submission, as: "submission", include: [{ model: Job, as: "job" }] },
      ],
    });
    if (!task) {
      throw createError("Task not found", 404);
    }

    const governingJob = task.job || task.submission?.job;
    const canManage = governingJob
      ? isJobStaff(governingJob, userId)
      : task.assigned_to === userId || task.created_by === userId;
    if (!canManage) {
      throw createError("You do not have permission to update this task", 403);
    }

    const { title, description, assigned_to, priority, due_date, status } = req.body;

    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      assigned_to: assigned_to !== undefined ? assigned_to : task.assigned_to,
      priority: priority !== undefined ? priority : task.priority,
      due_date: due_date !== undefined ? due_date : task.due_date,
      status: status !== undefined ? status : task.status,
      completed_at: status === "completed" ? new Date() : status !== undefined ? null : task.completed_at,
    } as any);

    const updatedTask = await Task.findByPk(taskId, {
      include: [jobPersonInclude("assignee"), jobPersonInclude("creator")],
    });

    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  }
);

// Delete a task
export const deleteTask = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    const task = await Task.findByPk(taskId, {
      include: [
        { model: Job, as: "job" },
        { model: Submission, as: "submission", include: [{ model: Job, as: "job" }] },
      ],
    });
    if (!task) {
      throw createError("Task not found", 404);
    }

    const governingJob = task.job || task.submission?.job;
    const canManage = governingJob
      ? isJobStaff(governingJob, userId)
      : task.assigned_to === userId || task.created_by === userId;
    if (!canManage) {
      throw createError("You do not have permission to delete this task", 403);
    }

    await task.destroy();

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  }
);

// Update task status
export const updateTaskStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    const task = await Task.findByPk(taskId);
    if (!task) {
      throw createError("Task not found", 404);
    }

    // Check if user has permission to update this task
    if (task.assigned_to !== userId && task.created_by !== userId) {
      throw createError("You do not have permission to update this task", 403);
    }

    const updatedTask = await task.update({ status });

    res.json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  }
);
