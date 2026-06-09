import { Response } from "express";
import { Op } from "sequelize";
import { Job, User, Recruiter, Submission, Candidate } from "../models";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

// Get all jobs with filters (for candidates and public view)
export const getJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    search,
    location,
    job_type,
    salary_min,
    salary_max,
    experience_min,
    experience_max,
    remote_work_allowed,
    skills,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  
  // Build where conditions
  const whereConditions: any = {
    status: "active", // Only show active jobs to candidates
  };

  // Build OR conditions array
  const orConditions: any[] = [];

  if (search) {
    orConditions.push(
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { company_name: { [Op.like]: `%${search}%` } }
    );
  }

  if (location) {
    orConditions.push(
      { location: { [Op.like]: `%${location}%` } },
      { city: { [Op.like]: `%${location}%` } },
      { state: { [Op.like]: `%${location}%` } }
    );
  }

  if (job_type) {
    whereConditions.job_type = job_type;
  }

  if (salary_min) {
    whereConditions.salary_min = { [Op.gte]: Number(salary_min) };
  }

  if (salary_max) {
    whereConditions.salary_max = { [Op.lte]: Number(salary_max) };
  }

  if (experience_min) {
    whereConditions.experience_min = { [Op.gte]: Number(experience_min) };
  }

  if (experience_max) {
    whereConditions.experience_max = { [Op.lte]: Number(experience_max) };
  }

  if (remote_work_allowed === "true") {
    whereConditions.remote_work_allowed = true;
  }

  // Skills filtering (if skills are provided as comma-separated string)
  if (skills) {
    const skillsArray = (skills as string).split(",").map(s => s.trim());
    skillsArray.forEach(skill => {
      orConditions.push(
        { required_skills: { [Op.like]: `%${skill}%` } },
        { preferred_skills: { [Op.like]: `%${skill}%` } }
      );
    });
  }

  // Add OR conditions if any exist
  if (orConditions.length > 0) {
    whereConditions[Op.or] = orConditions;
  }

  const { count, rows: jobs } = await Job.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      jobs,
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

// Get single job by ID
export const getJobById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await Job.findByPk(id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
  });

  if (!job) {
    throw createError("Job not found", 404);
  }

  // Only show active jobs to non-recruiters
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter" && job.status !== "active") {
    throw createError("Job not found", 404);
  }

  // For recruiters, check if they have access to this job
  if (userRole === "recruiter" && job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  res.json({
    success: true,
    data: { job },
  });
});

// Create new job (recruiters only)
export const createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can create jobs", 403);
  }

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
    experience_min,
    experience_max,
    required_skills,
    preferred_skills,
    education_requirements,
    status,
    priority,
    positions_available,
    max_submissions_allowed,
    vendor_eligible,
    remote_work_allowed,
    start_date,
    end_date,
    application_deadline,
    assigned_to,
  } = req.body;

  // Generate job ID like JOB-2024-001
  const year = new Date().getFullYear();
  const count = await Job.count({
    where: {
      job_id: {
        [Op.like]: `JOB-${year}-%`,
      },
    },
  });
  const job_id = `JOB-${year}-${String(count + 1).padStart(3, "0")}`;

  const job = await Job.create({
    job_id,
    title,
    description,
    external_description,
    company_name,
    location,
    city,
    state,
    country: country || "US",
    job_type,
    salary_min: salary_min ? parseFloat(salary_min) : undefined,
    salary_max: salary_max ? parseFloat(salary_max) : undefined,
    salary_currency: salary_currency || "USD",
    experience_min: experience_min ? parseInt(experience_min) : undefined,
    experience_max: experience_max ? parseInt(experience_max) : undefined,
    required_skills: required_skills || [],
    preferred_skills: preferred_skills || [],
    education_requirements,
    status: status || "draft",
    priority: priority || "medium",
    positions_available: positions_available || 1,
    max_submissions_allowed,
    vendor_eligible: vendor_eligible !== undefined ? vendor_eligible : true,
    remote_work_allowed: remote_work_allowed || false,
    start_date: start_date ? new Date(start_date) : undefined,
    end_date: end_date ? new Date(end_date) : undefined,
    application_deadline: application_deadline ? new Date(application_deadline) : undefined,
    created_by: userId!,
    assigned_to: assigned_to || userId,
  });

  // Fetch the created job with associations
  const createdJob = await Job.findByPk(job.id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: { job: createdJob },
    message: "Job created successfully",
  });
});

// Update job (recruiters only)
export const updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can update jobs", 403);
  }

  const job = await Job.findByPk(id);
  if (!job) {
    throw createError("Job not found", 404);
  }

  // Check if recruiter has access to this job
  if (job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

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
    experience_min,
    experience_max,
    required_skills,
    preferred_skills,
    education_requirements,
    status,
    priority,
    positions_available,
    max_submissions_allowed,
    vendor_eligible,
    remote_work_allowed,
    start_date,
    end_date,
    application_deadline,
    assigned_to,
  } = req.body;

  await job.update({
    title: title || job.title,
    description: description || job.description,
    external_description: external_description !== undefined ? external_description : job.external_description,
    company_name: company_name || job.company_name,
    location: location || job.location,
    city: city !== undefined ? city : job.city,
    state: state !== undefined ? state : job.state,
    country: country !== undefined ? country : job.country,
    job_type: job_type || job.job_type,
    salary_min: salary_min !== undefined ? parseFloat(salary_min) : job.salary_min,
    salary_max: salary_max !== undefined ? parseFloat(salary_max) : job.salary_max,
    salary_currency: salary_currency || job.salary_currency,
    experience_min: experience_min !== undefined ? parseInt(experience_min) : job.experience_min,
    experience_max: experience_max !== undefined ? parseInt(experience_max) : job.experience_max,
    required_skills: required_skills !== undefined ? required_skills : job.required_skills,
    preferred_skills: preferred_skills !== undefined ? preferred_skills : job.preferred_skills,
    education_requirements: education_requirements !== undefined ? education_requirements : job.education_requirements,
    status: status || job.status,
    priority: priority || job.priority,
    positions_available: positions_available !== undefined ? positions_available : job.positions_available,
    max_submissions_allowed: max_submissions_allowed !== undefined ? max_submissions_allowed : job.max_submissions_allowed,
    vendor_eligible: vendor_eligible !== undefined ? vendor_eligible : job.vendor_eligible,
    remote_work_allowed: remote_work_allowed !== undefined ? remote_work_allowed : job.remote_work_allowed,
    start_date: start_date !== undefined ? (start_date ? new Date(start_date) : undefined) : job.start_date,
    end_date: end_date !== undefined ? (end_date ? new Date(end_date) : undefined) : job.end_date,
    application_deadline: application_deadline !== undefined ? (application_deadline ? new Date(application_deadline) : undefined) : job.application_deadline,
    assigned_to: assigned_to !== undefined ? assigned_to : job.assigned_to,
  });

  // Fetch updated job with associations
  const updatedJob = await Job.findByPk(job.id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
  });

  res.json({
    success: true,
    data: { job: updatedJob },
    message: "Job updated successfully",
  });
});

// Delete job (recruiters only)
export const deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can delete jobs", 403);
  }

  const job = await Job.findByPk(id);
  if (!job) {
    throw createError("Job not found", 404);
  }

  // Check if recruiter has access to this job
  if (job.created_by !== userId && job.assigned_to !== userId) {
    throw createError("Access denied", 403);
  }

  // Check if job has submissions
  const submissionCount = await Submission.count({ where: { job_id: id } });
  if (submissionCount > 0) {
    throw createError("Cannot delete job with existing submissions. Please close the job instead.", 400);
  }

  await job.destroy();

  res.json({
    success: true,
    message: "Job deleted successfully",
  });
});

// Get jobs for recruiter (their own jobs)
export const getRecruiterJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (userRole !== "recruiter") {
    throw createError("Only recruiters can access this endpoint", 403);
  }

  const {
    page = 1,
    limit = 10,
    status,
    priority,
    search,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  // Build where conditions
  const whereConditions: any = {
    [Op.or]: [
      { created_by: userId },
      { assigned_to: userId },
    ],
  };

  if (status) {
    whereConditions.status = status;
  }

  if (priority) {
    whereConditions.priority = priority;
  }

  if (search) {
    whereConditions[Op.and] = [
      ...(whereConditions[Op.and] || []),
      {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { job_id: { [Op.iLike]: `%${search}%` } },
          { company_name: { [Op.iLike]: `%${search}%` } },
        ],
      },
    ];
  }

  const { count, rows: jobs } = await Job.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      jobs,
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

// Get jobs eligible for vendors
export const getVendorEligibleJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userRole = req.user?.role;

  if (userRole !== "vendor") {
    throw createError("Only vendors can access this endpoint", 403);
  }

  const {
    page = 1,
    limit = 10,
    search,
    location,
    job_type,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  // Build where conditions
  const whereConditions: any = {
    status: "active",
    vendor_eligible: true,
  };

  if (search) {
    whereConditions[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { company_name: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (location) {
    whereConditions[Op.or] = [
      ...(whereConditions[Op.or] || []),
      { location: { [Op.iLike]: `%${location}%` } },
      { city: { [Op.iLike]: `%${location}%` } },
    ];
  }

  if (job_type) {
    whereConditions.job_type = job_type;
  }

  const { count, rows: jobs } = await Job.findAndCountAll({
    where: whereConditions,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "email"],
        include: [
          {
            model: Recruiter,
            as: "recruiterProfile",
            attributes: ["first_name", "last_name", "company_name"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: Number(limit),
    offset,
  });

  const totalPages = Math.ceil(count / Number(limit));

  res.json({
    success: true,
    data: {
      jobs,
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
