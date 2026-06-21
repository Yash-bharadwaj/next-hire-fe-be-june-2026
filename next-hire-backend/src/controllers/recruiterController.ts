import { Response } from "express";
import { Op } from "sequelize";
import {
  User,
  Recruiter,
  Job,
  Submission,
  Candidate,
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
    const { candidate_ids } = req.body as { candidate_ids: string[] };
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

      const submission = await Submission.create({
        job_id: jobId,
        candidate_id: candidateId,
        submitted_by: userId!,
        status: "new_candidate",
        submitted_at: new Date(),
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
          ],
        },
        {
          model: User,
          as: "submitter",
          attributes: ["id", "email"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "email"],
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
        submission,
        interviews,
      },
    });
  }
);

// Add note to submission
export const addSubmissionNote = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const { note } = req.body;
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

    const notesHistory = (submission as any).notes_history || [];
    notesHistory.push({
      note,
      by: userId,
      at: new Date().toISOString(),
    });

    await submission.update({
      notes: note, // keep latest note in notes field for quick view
      notes_history: notesHistory,
    } as any);

    res.json({
      success: true,
      message: "Note added successfully",
      data: { notes_history: notesHistory },
    });
  }
);

// Add attachment to submission
export const addSubmissionAttachment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const { url, name } = req.body;
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

    const attachments = (submission as any).attachments || [];
    attachments.push({
      url,
      name: name || url,
      by: userId,
      at: new Date().toISOString(),
    });

    await submission.update({ attachments } as any);

    res.json({
      success: true,
      message: "Attachment added successfully",
      data: { attachments },
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

    const updatedSubmission = await submission.update({
      status,
      notes: notes || submission.notes,
      reviewed_by: userId!,
      reviewed_at: new Date(),
    });

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

    const task = await Task.create({
      title,
      description,
      assigned_to: assigned_to || userId,
      created_by: userId!,
      priority: priority || "medium",
      due_date,
      job_id,
      submission_id,
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
