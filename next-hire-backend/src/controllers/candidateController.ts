import { Response } from "express";
import { Op } from "sequelize";
import {
  User,
  Candidate,
  Job,
  Submission,
  Interview,
  Experience,
  Education,
  CandidateSkill,
  Placement,
  Task,
} from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

// Get candidate profile
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Candidate,
          as: "candidateProfile",
          include: [
            {
              model: Experience,
              as: "experiences",
              order: [["start_date", "DESC"]],
            },
            {
              model: Education,
              as: "education",
              order: [["start_date", "DESC"]],
            },
            {
              model: CandidateSkill,
              as: "candidateSkills",
              order: [
                ["is_primary", "DESC"],
                ["category", "ASC"],
                ["skill_name", "ASC"],
              ],
            },
          ],
        },
      ],
    });

    if (!user || !(user as any).candidateProfile) {
      throw createError("Candidate profile not found", 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
          email_verified: user.email_verified,
        },
        profile: (user as any).candidateProfile,
      },
    });
  }
);

// Update candidate profile
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      first_name,
      last_name,
      phone,
      location,
      current_salary,
      expected_salary,
      experience_years,
      linkedin_url,
      portfolio_url,
      skills,
      availability_status,
      preferred_job_types,
      preferred_locations,
      bio,
    } = req.body;

    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    const updatedCandidate = await candidate.update({
      first_name,
      last_name,
      phone,
      location,
      current_salary,
      expected_salary,
      experience_years,
      linkedin_url,
      portfolio_url,
      skills,
      availability_status,
      preferred_job_types,
      preferred_locations,
      bio,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedCandidate,
    });
  }
);

// Browse jobs with filters and pagination
export const browseJobs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      search,
      job_type,
      location,
      salary_min,
      salary_max,
      experience_min,
      experience_max,
      skills,
      remote_work_allowed,
      company_name,
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where conditions
    const whereConditions: any = {
      status: "active", // Only show active jobs
      application_deadline: {
        [Op.or]: [{ [Op.is]: null }, { [Op.gte]: new Date() }],
      },
    };

    // Search in title, description, and company name
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { company_name: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (job_type) {
      whereConditions.job_type = job_type;
    }

    if (location) {
      whereConditions[Op.or] = [
        { location: { [Op.iLike]: `%${location}%` } },
        { city: { [Op.iLike]: `%${location}%` } },
        { state: { [Op.iLike]: `%${location}%` } },
      ];
    }

    if (salary_min) {
      whereConditions.salary_min = {
        [Op.gte]: parseFloat(salary_min as string),
      };
    }

    if (salary_max) {
      whereConditions.salary_max = {
        [Op.lte]: parseFloat(salary_max as string),
      };
    }

    if (experience_min) {
      whereConditions.experience_min = {
        [Op.gte]: parseInt(experience_min as string),
      };
    }

    if (experience_max) {
      whereConditions.experience_max = {
        [Op.lte]: parseInt(experience_max as string),
      };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      whereConditions.required_skills = { [Op.overlap]: skillsArray };
    }

    if (remote_work_allowed === "true") {
      whereConditions.remote_work_allowed = true;
    }

    if (company_name) {
      whereConditions.company_name = { [Op.iLike]: `%${company_name}%` };
    }

    const { rows: jobs, count: total } = await Job.findAndCountAll({
      where: whereConditions,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit as string),
      offset,
      attributes: [
        "id",
        "job_id",
        "title",
        "company_name",
        "location",
        "city",
        "state",
        "job_type",
        "salary_min",
        "salary_max",
        "salary_currency",
        "experience_min",
        "experience_max",
        "required_skills",
        "remote_work_allowed",
        "created_at",
      ],
    });

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        jobs,
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

// Get job details
export const getJobDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "email"],
        },
      ],
    });

    if (!job) {
      throw createError("Job not found", 404);
    }

    if (job.status !== "active") {
      throw createError("Job is not available", 403);
    }

    // Check if candidate has already applied
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    let hasApplied = false;

    if (candidate) {
      const existingSubmission = await Submission.findOne({
        where: {
          job_id: jobId,
          candidate_id: candidate.id,
        },
      });
      hasApplied = !!existingSubmission;
    }

    res.json({
      success: true,
      data: {
        job,
        has_applied: hasApplied,
      },
    });
  }
);

// Apply to a job
export const applyToJob = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;
    const { cover_letter, expected_salary, availability_date } = req.body;

    if (!jobId) {
      throw createError("Job ID is required", 400);
    }

    if (!userId) {
      throw createError("User authentication required", 401);
    }

    // Get candidate profile
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    // Check if job exists and is active
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    if (job.status !== "active") {
      throw createError("Job is not accepting applications", 403);
    }

    // Check application deadline
    if (job.application_deadline && new Date() > job.application_deadline) {
      throw createError("Application deadline has passed", 403);
    }

    // Check if already applied
    const existingSubmission = await Submission.findOne({
      where: {
        job_id: jobId,
        candidate_id: candidate.id,
      },
    });

    if (existingSubmission) {
      // Idempotent response instead of error
      return res.status(200).json({
        success: true,
        message: "You have already applied to this job",
        data: {
          submission_id: existingSubmission.id,
          status: existingSubmission.status,
          submitted_at: existingSubmission.submitted_at,
        },
      });
    }

    // Check max submissions limit
    if (job.max_submissions_allowed) {
      const submissionCount = await Submission.count({
        where: { job_id: jobId },
      });

      if (submissionCount >= job.max_submissions_allowed) {
        throw createError(
          "Maximum number of applications reached for this job",
          403
        );
      }
    }

    // Create submission
    const submissionData: any = {
      job_id: jobId,
      candidate_id: candidate.id,
      submitted_by: userId,
      cover_letter,
      expected_salary,
      availability_date,
    };

    if (candidate.resume_url) {
      submissionData.resume_url = candidate.resume_url;
    }

    let submission;
    try {
      submission = await Submission.create(submissionData);
    } catch (err: any) {
      // If the unique constraint somehow trips, treat as duplicate in an idempotent way
      if (err?.name === "SequelizeUniqueConstraintError") {
        logger.warn(
          `Unique constraint hit while applying to job ${jobId} for candidate ${candidate.id}, treating as already applied`
        );

        const duplicate = await Submission.findOne({
          where: {
            job_id: jobId,
            candidate_id: candidate.id,
          },
        });

        if (duplicate) {
          return res.status(200).json({
            success: true,
            message: "You have already applied to this job",
            data: {
              submission_id: duplicate.id,
              status: duplicate.status,
              submitted_at: duplicate.submitted_at,
            },
          });
        }

        // If we can't find the duplicate for some reason, fall back to a generic idempotent response
        return res.status(200).json({
          success: true,
          message: "You have already applied to this job",
        });
      }
      throw err;
    }

    logger.info(`Candidate ${candidate.id} applied to job ${jobId}`);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: {
        submission_id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at,
      },
    });
  }
);

// Get candidate's submissions/applications
export const getMySubmissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { page = 1, limit = 20, status } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get candidate
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    // Build where conditions
    const whereConditions: any = {
      candidate_id: candidate.id,
    };

    if (status) {
      whereConditions.status = status;
    }

    const { rows: submissions, count: total } =
      await Submission.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Job,
            as: "job",
            attributes: [
              "id",
              "job_id",
              "title",
              "company_name",
              "location",
              "job_type",
              "salary_min",
              "salary_max",
              "salary_currency",
            ],
          },
        ],
        order: [["submitted_at", "DESC"]],
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

// Get upcoming interviews
export const getUpcomingInterviews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    // Get candidate
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    const interviews = await Interview.findAll({
      include: [
        {
          model: Submission,
          as: "submission",
          where: { candidate_id: candidate.id },
          include: [
            {
              model: Job,
              as: "job",
              attributes: ["id", "job_id", "title", "company_name"],
            },
          ],
        },
        {
          model: User,
          as: "interviewer",
          attributes: ["id", "email"],
        },
      ],
      where: {
        scheduled_at: { [Op.gte]: new Date() },
        status: "scheduled",
      },
      order: [["scheduled_at", "ASC"]],
    });

    res.json({
      success: true,
      data: { interviews },
    });
  }
);

// Onboarding tasks for hired candidates
export const getOnboardingTasks = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    // Placements for the candidate (active or onboarding)
    const placements = await Placement.findAll({
      where: { candidate_id: candidate.id },
      order: [["created_at", "DESC"]],
    });

    // Tasks assigned to this user that are linked to a job/submission (lightweight onboarding checklist)
    const tasks = await Task.findAll({
      where: {
        assigned_to: userId,
        status: { [Op.ne]: "completed" },
      },
      order: [["due_date", "ASC"]],
    });

    res.json({
      success: true,
      data: {
        placements,
        tasks,
      },
    });
  }
);

// Upload resume (placeholder - would integrate with file upload service)
export const uploadResume = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { resume_url } = req.body; // In real implementation, this would come from file upload

    if (!resume_url) {
      throw createError("Resume URL is required", 400);
    }

    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    await candidate.update({ resume_url });

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      data: { resume_url },
    });
  }
);
