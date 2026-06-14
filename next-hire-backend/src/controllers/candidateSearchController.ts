import { Response } from "express";
import { Op, QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs/promises";
import {
  User,
  Candidate,
  Experience,
  Education,
  CandidateSkill,
  CandidateResume,
  Submission,
  Job,
} from "../models";
import { sequelize } from "../config/database";
import { likeOp } from "../utils/searchOperators";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import {
  extractText,
  getEmbedding,
  parseResume,
  ParsedResume,
  UnsupportedFileTypeError,
  EmptyDocumentError,
  AIParsingError,
} from "../services/aiParsingService";
import { persistEmbedding, findTopMatches, MatchResult } from "../services/embeddingService";
import { uploadDocument } from "../services/storageService";

// Search candidates (for recruiters)
export const searchCandidates = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can search candidates", 403);
    }

    const {
      page = 1,
      limit = 20,
      search,
      location,
      skills,
      experience_min,
      experience_max,
      salary_min,
      salary_max,
      availability_status,
      education_level,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where conditions for candidates
    const candidateWhere: any = {};
    const userWhere: any = {
      role: "candidate",
      email_verified: true,
    };

    // Search in name and bio
    if (search) {
      candidateWhere[Op.or] = [
        { first_name: { [likeOp]: `%${search}%` } },
        { last_name: { [likeOp]: `%${search}%` } },
        { bio: { [likeOp]: `%${search}%` } },
      ];
    }

    // Location filter
    if (location) {
      candidateWhere.location = { [likeOp]: `%${location}%` };
    }

    // Experience filter
    if (experience_min) {
      candidateWhere.experience_years = {
        [Op.gte]: Number(experience_min),
      };
    }
    if (experience_max) {
      candidateWhere.experience_years = {
        ...candidateWhere.experience_years,
        [Op.lte]: Number(experience_max),
      };
    }

    // Salary filter
    if (salary_min) {
      candidateWhere.expected_salary = {
        [Op.gte]: Number(salary_min),
      };
    }
    if (salary_max) {
      candidateWhere.expected_salary = {
        ...candidateWhere.expected_salary,
        [Op.lte]: Number(salary_max),
      };
    }

    // Availability status filter
    if (availability_status) {
      candidateWhere.availability_status = availability_status;
    }

    // Skills filter (search in candidate skills)
    let skillsWhere: any = {};
    if (skills) {
      const skillsArray = (skills as string).split(",").map((s) => s.trim());
      skillsWhere = {
        skill_name: {
          [Op.in]: skillsArray,
        },
      };
    }

    // Build order clause
    const orderClause: any[] = [];
    if (sort_by === "name") {
      orderClause.push(["first_name", sort_order]);
    } else if (sort_by === "experience") {
      orderClause.push(["experience_years", sort_order]);
    } else if (sort_by === "salary") {
      orderClause.push(["expected_salary", sort_order]);
    } else {
      orderClause.push(["created_at", sort_order]);
    }

    const includeConditions: any[] = [
      {
        model: User,
        as: "user",
        where: userWhere,
        attributes: ["id", "email", "status", "created_at"],
      },
      {
        model: Experience,
        as: "experiences",
        required: false,
        order: [["start_date", "DESC"]],
        limit: 3, // Latest 3 experiences
      },
      {
        model: Education,
        as: "education",
        required: false,
        order: [["start_date", "DESC"]],
        limit: 2, // Latest 2 education entries
      },
      {
        model: CandidateSkill,
        as: "candidateSkills",
        required: skills ? true : false,
        where: skills ? skillsWhere : undefined,
        order: [["is_primary", "DESC"]],
      },
    ];

    const { count, rows: candidates } = await Candidate.findAndCountAll({
      where: candidateWhere,
      include: includeConditions,
      order: orderClause,
      limit: Number(limit),
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.json({
      success: true,
      data: {
        candidates,
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
  }
);

// Get candidate details with full profile (for recruiters)
export const getCandidateDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can view candidate details", 403);
    }

    const candidate = await Candidate.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "status", "created_at", "last_login_at"],
        },
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
          ],
        },
      ],
    });

    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    // Get candidate's submission history
    const submissions = await Submission.findAll({
      where: { candidate_id: id },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title", "company_name", "status"],
        },
      ],
      order: [["submitted_at", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        candidate,
        submissions,
      },
    });
  }
);

// Update candidate profile (by recruiter)
export const updateCandidateByRecruiter = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can update candidate profiles", 403);
    }

    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    const allowedFields = [
      "first_name", "last_name", "phone", "location", "bio",
      "current_salary", "expected_salary", "experience_years",
      "availability_status", "linkedin_url", "portfolio_url",
    ];
    // Fields with Sequelize isUrl validation — empty string must become null
    const urlFields = new Set(["linkedin_url", "portfolio_url"]);

    const updateData: any = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const val = req.body[field];
        updateData[field] = urlFields.has(field) && val === "" ? null : val;
      }
    });

    await candidate.update(updateData);

    const updated = await Candidate.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "status"] },
        { model: Experience, as: "experiences", order: [["start_date", "DESC"]] },
        { model: Education, as: "education", order: [["start_date", "DESC"]] },
        { model: CandidateSkill, as: "candidateSkills", order: [["is_primary", "DESC"]] },
      ],
    });

    res.json({
      success: true,
      message: "Candidate profile updated successfully",
      data: { candidate: updated },
    });
  }
);

// Get candidate statistics (for dashboard)
export const getCandidateStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can view candidate statistics", 403);
    }

    // Get total candidates
    const totalCandidates = await Candidate.count({
      include: [
        {
          model: User,
          as: "user",
          where: { email_verified: true },
        },
      ],
    });

    // Get candidates by availability status
    const availabilityStats = await Candidate.findAll({
      attributes: [
        "availability_status",
        [sequelize.fn("COUNT", sequelize.col("Candidate.id")), "count"],
      ],
      include: [
        {
          model: User,
          as: "user",
          where: { email_verified: true },
          attributes: [],
        },
      ],
      group: ["availability_status"],
      raw: true,
    });

    // Get candidates by experience level
    const experienceStats = await sequelize.query(
      `
    SELECT 
      CASE 
        WHEN experience_years <= 2 THEN 'Entry Level'
        WHEN experience_years <= 5 THEN 'Mid Level'
        WHEN experience_years <= 10 THEN 'Senior Level'
        ELSE 'Executive Level'
      END as experience_level,
      COUNT(*) as count
    FROM candidates c
    INNER JOIN users u ON c.user_id = u.id
    WHERE u.email_verified = true
    GROUP BY experience_level
  `,
      { type: QueryTypes.SELECT }
    );

    // Get recent candidates (last 30 days)
    const recentCandidates = await Candidate.count({
      include: [
        {
          model: User,
          as: "user",
          where: {
            email_verified: true,
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      ],
    });

    // Get top skills
    const topSkills = await CandidateSkill.findAll({
      attributes: [
        "skill_name",
        [sequelize.fn("COUNT", sequelize.col("skill_name")), "count"],
      ],
      group: ["skill_name"],
      order: [[sequelize.fn("COUNT", sequelize.col("skill_name")), "DESC"]],
      limit: 10,
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalCandidates,
        recentCandidates,
        availabilityStats,
        experienceStats,
        topSkills,
      },
    });
  }
);

// Create a new candidate profile (by recruiter)
export const createCandidate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can add candidates", 403);
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      location,
      experience_years,
      expected_salary,
      availability_status,
    } = req.body;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      throw createError("A user with this email already exists", 409);
    }

    // Recruiter-added candidates are activated immediately so they
    // appear in search results without going through OTP verification.
    const tempPassword = crypto.randomBytes(9).toString("base64");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "candidate",
      status: "active",
      email_verified: true,
      email_verified_at: new Date(),
    });

    const candidate = await Candidate.create({
      user_id: user.id,
      created_by: req.user?.userId,
      first_name,
      last_name,
      phone,
      location,
      experience_years,
      expected_salary,
      availability_status: availability_status || "available",
    });

    const created = await Candidate.findByPk(candidate.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "status", "created_at"] },
      ],
    });

    logger.info(
      `Recruiter ${req.user?.userId} created candidate profile for ${email}`
    );

    res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      data: { candidate: created },
    });
  }
);

// Delete a candidate profile (by recruiter)
export const deleteCandidate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== "recruiter") {
      throw createError("Only recruiters can delete candidates", 403);
    }

    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      throw createError("Candidate not found", 404);
    }

    const submissionCount = await Submission.count({
      where: { candidate_id: id },
    });
    if (submissionCount > 0) {
      throw createError(
        "Cannot delete a candidate with existing submissions",
        409
      );
    }

    const userId = candidate.user_id;

    await CandidateSkill.destroy({ where: { candidate_id: id } });
    await Experience.destroy({ where: { candidate_id: id } });
    await Education.destroy({ where: { candidate_id: id } });
    await candidate.destroy();
    await User.destroy({ where: { id: userId } });

    logger.info(`Recruiter ${req.user?.userId} deleted candidate ${id}`);

    res.json({
      success: true,
      message: "Candidate deleted successfully",
    });
  }
);

const buildCandidateEmbeddingText = (parsed: ParsedResume): string =>
  [
    parsed.name,
    parsed.current_job_title,
    parsed.current_employer,
    parsed.location,
    parsed.summary,
    parsed.skills.join(", "),
    parsed.certifications.join(", "),
  ]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(". ");

// Upload + AI-parse a resume and create a full candidate record from it (recruiter-only)
export const parseResumeAndCreateCandidate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "recruiter") {
      throw createError("Only recruiters can parse resumes", 403);
    }

    if (!req.file) {
      throw createError("A resume file (PDF, DOCX, or TXT) is required", 400);
    }

    const tempFilePath = req.file.path;
    const cleanupTempFile = () => fs.unlink(tempFilePath).catch(() => {});

    let text: string;
    try {
      text = await extractText(tempFilePath, req.file.originalname);
    } catch (error) {
      await cleanupTempFile();
      if (error instanceof UnsupportedFileTypeError || error instanceof EmptyDocumentError) {
        throw createError(error.message, 400);
      }
      throw error;
    }

    let parsed: ParsedResume;
    try {
      parsed = await parseResume(text);
    } catch (error) {
      await cleanupTempFile();
      if (error instanceof AIParsingError) {
        throw createError(error.message, 502);
      }
      throw error;
    }

    if (!parsed.email) {
      await cleanupTempFile();
      throw createError(
        "Could not find an email address in this resume. Please add this candidate manually.",
        400
      );
    }

    const email = parsed.email.toLowerCase();
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await cleanupTempFile();

      if (existingUser.role === "candidate") {
        const existingCandidate = await Candidate.findOne({ where: { user_id: existingUser.id } });
        res.status(409).json({
          success: false,
          message: `A candidate with email ${email} already exists.`,
          data: { existing_candidate_id: existingCandidate?.id || null },
        });
        return;
      }

      // The email belongs to a non-candidate account (recruiter/vendor/admin).
      // Since emails are unique across all users, a new candidate profile
      // can't be created for it - and it won't show up in the Candidates
      // table either, since there's no Candidate record for this user.
      res.status(409).json({
        success: false,
        message: `The email ${email} is already registered to an existing ${existingUser.role} account, so it can't be used for a new candidate profile. Please upload a resume with a different email address.`,
        data: { existing_candidate_id: null },
      });
      return;
    }

    const nameParts = (parsed.name || email.split("@")[0]).trim().split(/\s+/).filter(Boolean);
    const first_name = nameParts[0] || "New";
    const last_name = nameParts.slice(1).join(" ") || "Candidate";

    // Recruiter-added candidates are activated immediately, same as createCandidate.
    const tempPassword = crypto.randomBytes(9).toString("base64");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "candidate",
      status: "active",
      email_verified: true,
      email_verified_at: new Date(),
    });

    const experienceYears =
      parsed.total_experience_years !== undefined
        ? Math.max(0, Math.min(50, Math.round(parsed.total_experience_years)))
        : undefined;

    const candidate = await Candidate.create({
      user_id: user.id,
      created_by: req.user?.userId,
      first_name,
      last_name,
      phone: parsed.phone,
      location: parsed.location,
      experience_years: experienceYears,
      skills: parsed.skills,
      bio: parsed.summary,
      availability_status: "available",
    });

    const uploaded = await uploadDocument(tempFilePath, req.file.filename, req.file.mimetype);
    await CandidateResume.create({
      candidate_id: candidate.id,
      file_url: uploaded.key,
      file_name: req.file.originalname,
      is_primary: true,
    });
    await candidate.update({ resume_url: uploaded.key });

    const embedding = await getEmbedding(buildCandidateEmbeddingText(parsed));
    await persistEmbedding(candidate, "candidates", embedding);

    const created = await Candidate.findByPk(candidate.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "status", "created_at"] },
      ],
    });

    logger.info(`Recruiter ${req.user?.userId} created candidate ${email} via resume parsing`);

    res.status(201).json({
      success: true,
      message: "Resume parsed and candidate created successfully",
      data: {
        candidate: created,
        resume_url: uploaded.url,
        parsed,
      },
    });
  }
);

// Load Candidate+User (+experience/education/skills) records for matched IDs,
// preserving the score-sorted order from findTopMatches and attaching matchScore.
const loadScoredCandidates = async (matches: MatchResult[]) => {
  if (matches.length === 0) return [];

  const candidates = await Candidate.findAll({
    where: { id: { [Op.in]: matches.map((m) => m.id) } },
    include: [
      {
        model: User,
        as: "user",
        where: { role: "candidate", email_verified: true },
        attributes: ["id", "email", "status", "created_at"],
      },
      {
        model: Experience,
        as: "experiences",
        required: false,
        order: [["start_date", "DESC"]],
        limit: 3,
      },
      {
        model: Education,
        as: "education",
        required: false,
        order: [["start_date", "DESC"]],
        limit: 2,
      },
      {
        model: CandidateSkill,
        as: "candidateSkills",
        required: false,
        order: [["is_primary", "DESC"]],
      },
    ],
  });

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));
  const scoreMap = new Map(matches.map((m) => [m.id, m.score]));

  return matches
    .map((m) => candidateMap.get(m.id))
    .filter((c): c is Candidate => !!c)
    .map((c) => {
      const json = c.toJSON() as any;
      json.matchScore = Math.round((scoreMap.get(c.id) || 0) * 100);
      return json;
    });
};

const buildJobEmbeddingText = (job: Job): string =>
  [
    job.title,
    job.company_name,
    job.location,
    job.description,
    (job.required_skills || []).join(", "),
    (job.preferred_skills || []).join(", "),
  ]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(". ");

// Rank candidates by semantic similarity to a job (recruiter-only)
export const matchCandidatesForJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "recruiter") {
      throw createError("Only recruiters can match candidates", 403);
    }

    const { jobId } = req.params;
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw createError("Job not found", 404);
    }

    let queryVector = job.embedding ?? null;
    if (!queryVector) {
      queryVector = await getEmbedding(buildJobEmbeddingText(job));
      if (queryVector) {
        await persistEmbedding(job, "jobs", queryVector);
      }
    }

    if (!queryVector) {
      res.json({
        success: true,
        message: "AI matching is temporarily unavailable for this job.",
        data: {
          job: { id: job.id, job_id: job.job_id, title: job.title },
          candidates: [],
          skipped_count: 0,
        },
      });
      return;
    }

    const { matches, skippedCount } = await findTopMatches("candidates", queryVector, 50);
    const candidates = await loadScoredCandidates(matches);

    res.json({
      success: true,
      data: {
        job: { id: job.id, job_id: job.job_id, title: job.title },
        candidates,
        skipped_count: skippedCount,
      },
    });
  }
);

// Rank candidates by semantic similarity to free-form text (AI-prompt search box, recruiter-only)
export const matchCandidatesByText = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "recruiter") {
      throw createError("Only recruiters can match candidates", 403);
    }

    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      throw createError("Search text is required", 400);
    }

    const queryVector = await getEmbedding(text.trim());
    if (!queryVector) {
      throw createError(
        "AI matching is temporarily unavailable. Please try again later.",
        502
      );
    }

    const { matches, skippedCount } = await findTopMatches("candidates", queryVector, 50);
    const candidates = await loadScoredCandidates(matches);

    res.json({
      success: true,
      data: { candidates, skipped_count: skippedCount },
    });
  }
);
