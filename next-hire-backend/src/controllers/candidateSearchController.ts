import { Response } from "express";
import { Op, QueryTypes } from "sequelize";
import {
  User,
  Candidate,
  Experience,
  Education,
  CandidateSkill,
  Submission,
  Job,
} from "../models";
import { sequelize } from "../config/database";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

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
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Location filter
    if (location) {
      candidateWhere.location = { [Op.iLike]: `%${location}%` };
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
