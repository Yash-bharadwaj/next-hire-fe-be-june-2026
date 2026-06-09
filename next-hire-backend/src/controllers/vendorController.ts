import { Response } from "express";
import { Op } from "sequelize";
import { User, Vendor, Job, Submission, Candidate } from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

// Get vendor profile
export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Vendor,
          as: "vendor",
        },
      ],
    });

    if (!user || !user.vendor) {
      throw createError("Vendor profile not found", 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
        },
        profile: user.vendor,
      },
    });
  }
);

// Update vendor profile
export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const {
      company_name,
      company_website,
      contact_person_name,
      phone,
      address,
      city,
      state,
      country,
      specializations,
      years_in_business,
      bio,
    } = req.body;

    const vendor = await Vendor.findOne({ where: { user_id: userId } });
    if (!vendor) {
      throw createError("Vendor profile not found", 404);
    }

    const updatedVendor = await vendor.update({
      company_name,
      company_website,
      contact_person_name,
      phone,
      address,
      city,
      state,
      country,
      specializations,
      years_in_business,
      bio,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedVendor,
    });
  }
);

// Get jobs available to vendors
export const getVendorJobs = asyncHandler(
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

    // Build where conditions - only show vendor-eligible jobs
    const whereConditions: any = {
      status: "active",
      vendor_eligible: true,
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
        "positions_available",
        "max_submissions_allowed",
        "application_deadline",
        "created_at",
      ],
    });

    // Get submission counts for each job (by this vendor)
    const userId = req.user?.userId;
    const jobsWithSubmissionInfo = await Promise.all(
      jobs.map(async (job) => {
        const totalSubmissions = await Submission.count({
          where: { job_id: job.id },
        });
        const vendorSubmissions = await Submission.count({
          where: {
            job_id: job.id,
            submitted_by: userId,
          },
        });

        return {
          ...job.toJSON(),
          total_submissions: totalSubmissions,
          vendor_submissions: vendorSubmissions,
        };
      })
    );

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        jobs: jobsWithSubmissionInfo,
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

// Get job details (vendor view)
export const getJobDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;

    const job = await Job.findByPk(jobId);

    if (!job) {
      throw createError("Job not found", 404);
    }

    if (job.status !== "active" || !job.vendor_eligible) {
      throw createError("Job is not available for vendors", 403);
    }

    // Check if application deadline has passed
    if (job.application_deadline && new Date() > job.application_deadline) {
      throw createError("Application deadline has passed", 403);
    }

    // Get vendor's submissions for this job
    const vendorSubmissions = await Submission.findAll({
      where: {
        job_id: jobId,
        submitted_by: userId,
      },
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "first_name", "last_name", "experience_years"],
        },
      ],
    });

    const totalSubmissions = await Submission.count({
      where: { job_id: jobId },
    });

    res.json({
      success: true,
      data: {
        job,
        vendor_submissions: vendorSubmissions,
        total_submissions: totalSubmissions,
        can_submit_more:
          !job.max_submissions_allowed ||
          totalSubmissions < job.max_submissions_allowed,
      },
    });
  }
);

// Submit a candidate to a job
export const submitCandidate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { jobId } = req.params;
    const userId = req.user?.userId;
    const {
      candidate_id,
      cover_letter,
      expected_salary,
      availability_date,
      notes,
    } = req.body;

    // Check if job exists and is vendor-eligible
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    if (job.status !== "active" || !job.vendor_eligible) {
      throw createError("Job is not accepting vendor submissions", 403);
    }

    // Check application deadline
    if (job.application_deadline && new Date() > job.application_deadline) {
      throw createError("Application deadline has passed", 403);
    }

    // Check if candidate exists
    const candidate = await Candidate.findByPk(candidate_id);
    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    // Check if candidate has already been submitted to this job
    const existingSubmission = await Submission.findOne({
      where: {
        job_id: jobId,
        candidate_id: candidate_id,
      },
    });

    if (existingSubmission) {
      throw createError(
        "This candidate has already been submitted to this job",
        409
      );
    }

    // Check max submissions limit
    if (job.max_submissions_allowed) {
      const submissionCount = await Submission.count({
        where: { job_id: jobId },
      });

      if (submissionCount >= job.max_submissions_allowed) {
        throw createError(
          "Maximum number of submissions reached for this job",
          403
        );
      }
    }

    // Create submission
    const submissionData: any = {
      job_id: jobId!,
      candidate_id: candidate_id,
      submitted_by: userId!,
      cover_letter,
      expected_salary,
      availability_date,
      notes,
    };

    if (candidate.resume_url) {
      submissionData.resume_url = candidate.resume_url;
    }

    const submission = await Submission.create(submissionData);

    logger.info(
      `Vendor ${userId} submitted candidate ${candidate_id} to job ${jobId}`
    );

    res.status(201).json({
      success: true,
      message: "Candidate submitted successfully",
      data: {
        submission_id: submission.id,
        status: submission.status,
        submitted_at: submission.submitted_at,
      },
    });
  }
);

// Get vendor's submissions
export const getMySubmissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const { page = 1, limit = 20, status, job_id } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where conditions
    const whereConditions: any = {
      submitted_by: userId,
    };

    if (status) {
      whereConditions.status = status;
    }

    if (job_id) {
      whereConditions.job_id = job_id;
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
          {
            model: Candidate,
            as: "candidate",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "experience_years",
              "skills",
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

// Get submission status/details
export const getSubmissionStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user?.userId;

    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title", "company_name"],
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "first_name", "last_name", "experience_years"],
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

    // Check if vendor owns this submission
    if (submission.submitted_by !== userId) {
      throw createError(
        "You do not have permission to view this submission",
        403
      );
    }

    res.json({
      success: true,
      data: submission,
    });
  }
);

// Create a candidate profile (for vendors to add candidates to their pool)
export const createCandidate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const vendorUserId = req.user?.userId;
    if (!vendorUserId) {
      throw createError("Unable to identify vendor user", 401);
    }

    const {
      email,
      first_name,
      last_name,
      phone,
      location,
      current_salary,
      expected_salary,
      experience_years,
      resume_url,
      linkedin_url,
      portfolio_url,
      skills,
      bio,
    } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      throw createError("A user with this email already exists", 409);
    }

    // Create user account for the candidate (inactive, no password)
    const user = await User.create({
      email: email.toLowerCase(),
      password: "temp_password_" + Date.now(), // Temporary password
      role: "candidate",
      status: "inactive", // Candidate will need to activate their account later
      email_verified: false,
    });

    // Create candidate profile
    const candidate = await Candidate.create({
      user_id: user.id,
      created_by: vendorUserId,
      first_name,
      last_name,
      phone,
      location,
      current_salary,
      expected_salary,
      experience_years,
      resume_url,
      linkedin_url,
      portfolio_url,
      skills: skills || [],
      availability_status: "available",
      bio,
    });

    logger.info(
      `Vendor ${req.user?.userId} created candidate profile for ${email}`
    );

    res.status(201).json({
      success: true,
      message: "Candidate profile created successfully",
      data: {
        candidate_id: candidate.id,
        user_id: user.id,
        email: user.email,
        profile: candidate,
      },
    });
  }
);

// List vendor's candidate pool
export const getMyCandidates = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const vendorUserId = req.user?.userId;
    if (!vendorUserId) {
      throw createError("Unable to identify vendor user", 401);
    }

    const {
      page = 1,
      limit = 20,
      search,
      skills,
      experience_min,
      experience_max,
      availability_status,
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where conditions for candidates created by this vendor
    // Note: In a real system, you'd need to track which vendor created which candidate
    // For now, we'll show all candidates (this would need to be refined)
    const whereConditions: any = {
      created_by: vendorUserId,
    };

    if (search) {
      whereConditions[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      whereConditions.skills = { [Op.overlap]: skillsArray };
    }

    if (experience_min) {
      whereConditions.experience_years = {
        [Op.gte]: parseInt(experience_min as string),
      };
    }

    if (experience_max) {
      whereConditions.experience_years = {
        [Op.lte]: parseInt(experience_max as string),
      };
    }

    if (availability_status) {
      whereConditions.availability_status = availability_status;
    }

    const { rows: candidates, count: total } = await Candidate.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit as string),
      offset,
    });

    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        candidates,
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
