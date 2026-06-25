import { Response } from "express";
import { Op } from "sequelize";
import {
  User,
  Candidate,
  Recruiter,
  Vendor,
  Job,
  Submission,
  Interview,
  Placement,
} from "../models";
import { sequelize } from "../config/database";
import { createError, asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { hoursDiffExpr } from "../utils/dateGrouping";

// Get dashboard statistics based on user role
export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let stats: any = {};

    switch (userRole) {
      case "recruiter":
        stats = await getRecruiterStats(userId!);
        break;
      case "candidate":
        stats = await getCandidateStats(userId!);
        break;
      case "vendor":
        stats = await getVendorStats(userId!);
        break;
      default:
        throw createError("Invalid user role", 400);
    }

    res.json({
      success: true,
      data: stats,
    });
  }
);

// Get recruiter dashboard statistics
const getRecruiterStats = async (userId: string) => {
  try {
    logger.info(`Getting recruiter stats for userId: ${userId}`);

    // First, check if recruiter profile exists
    const recruiter = await Recruiter.findOne({
      where: { user_id: userId },
    });

    logger.info(
      `Recruiter profile found: ${recruiter ? recruiter.id : "not found"}`
    );

    // Recruiter can see jobs they created or are assigned to
    const jobScope = {
      [Op.or]: [{ created_by: userId }, { assigned_to: userId }],
    };

    // Get recruiter's jobs (simplified query)
    const totalJobs = await Job.count({
      where: jobScope,
    });

    logger.info(`Total jobs found with scope: ${totalJobs}`);

    // If no jobs found with the scope, let's check all jobs (for debugging)
    if (totalJobs === 0) {
      const allJobsCount = await Job.count();
      logger.info(`Total jobs in database: ${allJobsCount}`);

      // Check if there are any jobs at all
      if (allJobsCount > 0) {
        // For now, let's return all jobs for the recruiter to see
        // This is a temporary fix - you should update the created_by field in your jobs
        const allJobs = await Job.findAll({
          attributes: ["id", "created_by", "assigned_to", "title"],
          limit: 5,
        });
        logger.info(
          `Sample jobs: ${JSON.stringify(
            allJobs.map((j) => ({
              id: j.id,
              created_by: j.created_by,
              assigned_to: j.assigned_to,
            }))
          )}`
        );
      }
    }

    const activeJobs = await Job.count({
      where: {
        [Op.and]: [jobScope, { status: "active" }],
      },
    });

    // Get submissions for recruiter's jobs (simplified)
    const recruiterJobs = await Job.findAll({
      where: jobScope,
      attributes: ["id"],
    });

    const jobIds = recruiterJobs.map((job) => job.id);
    logger.info(`Job IDs found: ${jobIds.length}`);

    // TEMPORARY FIX: If no jobs found, show all jobs and submissions
    // TODO: Update jobs in database to have correct created_by and assigned_to values
    let finalJobIds = jobIds;
    let showAllData = false;

    if (jobIds.length === 0) {
      logger.warn(
        `No jobs found for recruiter ${userId}. Showing all jobs as fallback.`
      );
      const allJobs = await Job.findAll({
        attributes: ["id"],
      });
      finalJobIds = allJobs.map((job) => job.id);
      showAllData = true;
    }

    const totalSubmissions =
      finalJobIds.length > 0
        ? await Submission.count({
            where: { job_id: { [Op.in]: finalJobIds } },
          })
        : 0;

    logger.info(`Total submissions found: ${totalSubmissions}`);

    const newSubmissions =
      finalJobIds.length > 0
        ? await Submission.count({
            where: {
              job_id: { [Op.in]: finalJobIds },
              status: "submitted",
              submitted_at: {
                [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          })
        : 0;

    // Interviews this recruiter is the interviewer for - scoped directly by
    // interviewer_id, no join needed.
    const totalInterviews = await Interview.count({ where: { interviewer_id: userId } });
    const upcomingInterviews = await Interview.count({
      where: { interviewer_id: userId, status: "scheduled", scheduled_at: { [Op.gte]: new Date() } },
    });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const interviewsToday = await Interview.count({
      where: { interviewer_id: userId, scheduled_at: { [Op.gte]: todayStart, [Op.lte]: todayEnd } },
    });

    // Active candidates = available in the shared candidate pool (not scoped
    // to this recruiter - candidates aren't owned by a single recruiter).
    const activeCandidates = await Candidate.count({ where: { availability_status: "available" } });

    // Pending submissions = not yet reviewed and not already at a final outcome.
    const pendingSubmissions =
      finalJobIds.length > 0
        ? await Submission.count({
            where: {
              job_id: { [Op.in]: finalJobIds },
              reviewed_at: { [Op.is]: null } as any,
              status: { [Op.notIn]: ["hired", "rejected"] },
            },
          })
        : 0;

    // Get placements
    const totalPlacements =
      finalJobIds.length > 0
        ? await Submission.count({
            where: {
              job_id: { [Op.in]: finalJobIds },
              status: "hired",
            },
          })
        : 0;

    // Get recent submissions (simplified - without includes to avoid errors)
    const recentSubmissions: any[] = [];

    logger.info(`Recent submissions found: ${recentSubmissions.length}`);

    // Recalculate job counts using finalJobIds if we're showing all data
    const finalTotalJobs = showAllData ? finalJobIds.length : totalJobs;
    const finalActiveJobs = showAllData
      ? await Job.count({
          where: {
            id: { [Op.in]: finalJobIds },
            status: "active",
          },
        })
      : activeJobs;

    logger.info(
      `Final stats - Jobs: ${finalTotalJobs}, Active: ${finalActiveJobs}, Submissions: ${totalSubmissions}`
    );

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Revenue = commission earned on placements this recruiter made,
    // compared against last month for the trend arrow shown on the card.
    const revenueForRange = async (from: Date, to: Date) => {
      const rows = await Placement.findAll({
        where: { recruiter_id: userId, start_date: { [Op.gte]: from, [Op.lt]: to } },
        attributes: ["commission_amount", "salary_currency"],
        raw: true,
      });
      const total = rows.reduce((sum, r: any) => sum + (Number(r.commission_amount) || 0), 0);
      return { total, rows };
    };
    const thisMonth = await revenueForRange(startOfThisMonth, now);
    const lastMonth = await revenueForRange(startOfLastMonth, startOfThisMonth);
    const totalRevenue = thisMonth.total;
    const lastMonthRevenue = lastMonth.total;
    const revenueChangePercent = lastMonthRevenue > 0
      ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : null;
    // null when this month's placements span more than one currency - a sum
    // can't be labeled with a single currency symbol in that case.
    const revenueCurrencies = new Set(thisMonth.rows.map((r: any) => r.salary_currency || "USD"));
    const revenueCurrency = revenueCurrencies.size === 1 ? [...revenueCurrencies][0] : null;

    // Response time = average hours between a submission coming in and the
    // recruiter first reviewing it, for submissions on this recruiter's jobs.
    const avgResponseHoursForRange = async (from: Date, to: Date) => {
      if (finalJobIds.length === 0) return null;
      const result: any = await Submission.findOne({
        where: {
          job_id: { [Op.in]: finalJobIds },
          // No explicit "is not null" needed - a NULL reviewed_at never
          // satisfies the gte/lt range comparison below.
          reviewed_at: { [Op.gte]: from, [Op.lt]: to },
        },
        attributes: [
          [sequelize.fn("AVG", sequelize.literal(hoursDiffExpr("reviewed_at", "submitted_at"))), "avgHours"],
        ],
        raw: true,
      });
      const avg = result?.avgHours;
      return avg !== null && avg !== undefined ? Number(avg) : null;
    };
    const avgResponseHours = await avgResponseHoursForRange(startOfThisMonth, now);
    const lastMonthAvgResponseHours = await avgResponseHoursForRange(startOfLastMonth, startOfThisMonth);
    const responseTimeChangePercent = avgResponseHours !== null && lastMonthAvgResponseHours
      ? Math.round(((avgResponseHours - lastMonthAvgResponseHours) / lastMonthAvgResponseHours) * 1000) / 10
      : null;

    return {
      overview: {
        totalJobs: finalTotalJobs,
        activeJobs: finalActiveJobs,
        totalSubmissions,
        newSubmissions,
        totalInterviews,
        upcomingInterviews,
        interviewsToday,
        activeCandidates,
        pendingSubmissions,
        totalPlacements,
        totalRevenue,
        revenueCurrency,
        revenueChangePercent,
        avgResponseHours,
        responseTimeChangePercent,
      },
      submissionsByStatus: [],
      recentSubmissions,
      topJobs: [],
    };
  } catch (error) {
    console.error("Error in getRecruiterStats:", error);
    // Return default stats if there's an error
    return {
      overview: {
        totalJobs: 0,
        activeJobs: 0,
        totalSubmissions: 0,
        newSubmissions: 0,
        totalInterviews: 0,
        upcomingInterviews: 0,
        interviewsToday: 0,
        activeCandidates: 0,
        pendingSubmissions: 0,
        totalPlacements: 0,
        totalRevenue: 0,
        revenueCurrency: null,
        revenueChangePercent: null,
        avgResponseHours: null,
        responseTimeChangePercent: null,
      },
      submissionsByStatus: [],
      recentSubmissions: [],
      topJobs: [],
    };
  }
};

// Get candidate dashboard statistics
const getCandidateStats = async (userId: string) => {
  try {
    // Get candidate profile
    const candidate = await Candidate.findOne({
      where: { user_id: userId },
    });

    if (!candidate) {
      throw createError("Candidate profile not found", 404);
    }

    // Get candidate's submissions (simplified)
    const totalApplications = await Submission.count({
      where: { candidate_id: candidate.id },
    });

    const activeApplications = await Submission.count({
      where: {
        candidate_id: candidate.id,
        status: {
          [Op.in]: [
            "submitted",
            "under_review",
            "shortlisted",
            "interview_scheduled",
            "interviewed",
            "offered",
          ],
        },
      },
    });

    const offers = await Submission.count({
      where: {
        candidate_id: candidate.id,
        status: "offered",
      },
    });

    const placements = await Submission.count({
      where: {
        candidate_id: candidate.id,
        status: "hired",
      },
    });

    // Simplified interview counts (skip complex queries for now)
    const interviews = 0;
    const upcomingInterviews = 0;

    // Get recent applications
    const recentApplications = await Submission.findAll({
      where: { candidate_id: candidate.id },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title", "company_name", "location"],
        },
      ],
      order: [["submitted_at", "DESC"]],
      limit: 10,
    });

    return {
      overview: {
        totalApplications,
        activeApplications,
        interviews,
        upcomingInterviews,
        offers,
        placements,
      },
      applicationsByStatus: [],
      recentApplications,
      upcomingInterviews: [],
    };
  } catch (error) {
    console.error("Error in getCandidateStats:", error);
    return {
      overview: {
        totalApplications: 0,
        activeApplications: 0,
        interviews: 0,
        upcomingInterviews: 0,
        offers: 0,
        placements: 0,
      },
      applicationsByStatus: [],
      recentApplications: [],
      upcomingInterviews: [],
    };
  }
};

// Get vendor dashboard statistics
const getVendorStats = async (userId: string) => {
  try {
    // Get vendor's submissions
    const totalSubmissions = await Submission.count({
      where: { submitted_by: userId },
    });

    const activeSubmissions = await Submission.count({
      where: {
        submitted_by: userId,
        status: {
          [Op.in]: [
            "submitted",
            "under_review",
            "shortlisted",
            "interview_scheduled",
            "interviewed",
            "offered",
          ],
        },
      },
    });

    const placements = await Submission.count({
      where: {
        submitted_by: userId,
        status: "hired",
      },
    });

    // Get recent submissions
    const recentSubmissions = await Submission.findAll({
      where: { submitted_by: userId },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "job_id", "title", "company_name"],
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [["submitted_at", "DESC"]],
      limit: 10,
    });

    // Get available jobs for vendors
    const availableJobs = await Job.count({
      where: {
        status: "active",
        vendor_eligible: true,
      },
    });

    return {
      overview: {
        totalSubmissions,
        activeSubmissions,
        placements,
        availableJobs,
      },
      submissionsByStatus: [],
      recentSubmissions,
    };
  } catch (error) {
    console.error("Error in getVendorStats:", error);
    return {
      overview: {
        totalSubmissions: 0,
        activeSubmissions: 0,
        placements: 0,
        availableJobs: 0,
      },
      submissionsByStatus: [],
      recentSubmissions: [],
    };
  }
};

// Get recent activity feed
export const getRecentActivity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const { limit = 20 } = req.query;

    let activities: any[] = [];

    if (userRole === "recruiter") {
      // Get recent submissions for recruiter's jobs
      const submissions = await Submission.findAll({
        include: [
          {
            model: Job,
            as: "job",
            where: {
              [Op.or]: [{ created_by: userId }, { assigned_to: userId }],
            },
            attributes: ["id", "job_id", "title"],
          },
          {
            model: Candidate,
            as: "candidate",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
        order: [["updated_at", "DESC"]],
        limit: Number(limit),
      });

      activities = submissions.map((submission) => ({
        type: "submission",
        action: `New application for ${submission.job?.title}`,
        candidate: `${submission.candidate?.first_name} ${submission.candidate?.last_name}`,
        job: submission.job?.title,
        status: submission.status,
        timestamp: submission.updated_at,
      }));
    } else if (userRole === "candidate") {
      // Get candidate's recent submissions
      const candidate = await Candidate.findOne({ where: { user_id: userId } });
      if (candidate) {
        const submissions = await Submission.findAll({
          where: { candidate_id: candidate.id },
          include: [
            {
              model: Job,
              as: "job",
              attributes: ["id", "job_id", "title", "company_name"],
            },
          ],
          order: [["updated_at", "DESC"]],
          limit: Number(limit),
        });

        activities = submissions.map((submission) => ({
          type: "application",
          action: `Application status updated`,
          job: submission.job?.title,
          company: submission.job?.company_name,
          status: submission.status,
          timestamp: submission.updated_at,
        }));
      }
    }

    res.json({
      success: true,
      data: { activities },
    });
  }
);
