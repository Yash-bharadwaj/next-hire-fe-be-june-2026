import { Response } from "express";
import { Op, Sequelize } from "sequelize";
import { randomUUID } from "crypto";
import {
  Placement,
  Job,
  Candidate,
  Submission,
  User,
  Recruiter,
  BusinessPartner,
  BusinessPartnerContact,
  sequelize,
} from "../models";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";
import { formatUserName, prepareNotesAndAttachmentsForResponse } from "../utils/notesAndAttachments";

// Get placements with filters and pagination
export const getPlacements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      placement_type,
      recruiter_id,
      search,
      start_date_from,
      start_date_to,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const whereConditions: any = {};

    // Role-based filtering
    if (userRole === "recruiter") {
      whereConditions.recruiter_id = userId;
    } else if (userRole === "vendor") {
      whereConditions.vendor_id = userId;
    } else if (userRole === "candidate") {
      // Candidates can only see their own placements
      const candidateProfile = await Candidate.findOne({
        where: { user_id: userId },
      });
      if (candidateProfile) {
        whereConditions.candidate_id = candidateProfile.id;
      } else {
        return res.status(200).json({
          success: true,
          data: {
            placements: [],
            pagination: {
              currentPage: Number(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: Number(limit),
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        });
      }
    }

    // Apply filters
    if (status) {
      whereConditions.status = status;
    }

    if (placement_type) {
      whereConditions.placement_type = placement_type;
    }

    if (recruiter_id && userRole !== "candidate") {
      whereConditions.recruiter_id = recruiter_id;
    }

    if (start_date_from || start_date_to) {
      whereConditions.start_date = {};
      if (start_date_from) {
        whereConditions.start_date[Op.gte] = new Date(start_date_from as string);
      }
      if (start_date_to) {
        whereConditions.start_date[Op.lte] = new Date(start_date_to as string);
      }
    }

    // Search functionality
    if (search) {
      whereConditions[Op.or] = [
        { placement_id: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: placements } = await Placement.findAndCountAll({
      where: whereConditions,
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
        {
          model: Submission,
          as: "submission",
          attributes: ["id", "status", "submitted_at"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "email"],
          include: [
            {
              model: Recruiter,
              as: "recruiterProfile",
              attributes: ["first_name", "last_name"],
            },
          ],
        },
        {
          model: User,
          as: "vendor",
          attributes: ["id", "email"],
          required: false,
        },
      ],
      limit: Number(limit),
      offset,
      order: [[sort_by as string, sort_order as string]],
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.status(200).json({
      success: true,
      data: {
        placements,
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
  } catch (error) {
    logger.error("Error fetching placements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placements",
    });
  }
};

// Get placement by ID
export const getPlacementById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );

    const placement = await Placement.findOne({
      where: isUuid ? { id } : { placement_id: id },
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "job_id",
            "title",
            "description",
            "company_name",
            "location",
            "job_type",
            "salary_min",
            "salary_max",
            "salary_currency",
            "bill_rate_min",
            "bill_rate_max",
          ],
          include: [
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
          ],
        },
        {
          model: Candidate,
          as: "candidate",
          attributes: [
            "id",
            "candidate_id",
            "first_name",
            "last_name",
            "phone",
            "location",
            "experience_years",
            "skills",
            "linkedin_url",
            "portfolio_url",
            "resume_url",
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
          model: Submission,
          as: "submission",
          attributes: ["id", "submission_id", "status", "submitted_at", "ai_score", "ai_reasoning", "notes", "job_id"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "email"],
          include: [
            {
              model: Recruiter,
              as: "recruiterProfile",
              attributes: ["first_name", "last_name", "phone"],
            },
          ],
        },
        {
          model: User,
          as: "vendor",
          attributes: ["id", "email"],
          required: false,
        },
      ],
    });

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    // Check permissions
    if (userRole === "candidate") {
      const candidateProfile = await Candidate.findOne({
        where: { user_id: userId },
      });
      if (!candidateProfile || placement.candidate_id !== candidateProfile.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (userRole === "recruiter" && placement.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    } else if (userRole === "vendor" && placement.vendor_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const placementData = await prepareNotesAndAttachmentsForResponse(placement, userRole);

    res.status(200).json({
      success: true,
      data: { placement: placementData },
    });
  } catch (error) {
    logger.error("Error fetching placement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement",
    });
  }
};

// Create placement
export const createPlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      job_id,
      candidate_id,
      submission_id,
      start_date,
      end_date,
      placement_type = "permanent",
      salary,
      salary_currency = "USD",
      billing_rate,
      commission_amount,
      commission_percentage,
      location,
      work_arrangement = "onsite",
      reporting_manager,
      department,
      notes,
    } = req.body;

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can create placements",
      });
    }

    // Validate required fields
    if (!job_id || !candidate_id || !submission_id || !start_date || !salary || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify the submission exists and belongs to the job and candidate
    const submission = await Submission.findOne({
      where: {
        id: submission_id,
        job_id,
        candidate_id,
      },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "created_by", "assigned_to"],
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or invalid",
      });
    }

    // Check if recruiter has permission to create placement for this job
    const job = submission.job as any;
    if (job.created_by !== userId && job.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this job",
      });
    }

    // Generate placement ID
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
    if (submission.submitted_by !== candidate_id) {
      const submitter = await User.findByPk(submission.submitted_by);
      if (submitter && submitter.role === "vendor") {
        vendor_id = submitter.id;
      }
    }

    const placement = await Placement.create({
      placement_id,
      job_id,
      candidate_id,
      submission_id,
      recruiter_id: userId!,
      vendor_id,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : undefined,
      placement_type,
      salary: Number(salary),
      salary_currency,
      billing_rate: billing_rate ? Number(billing_rate) : undefined,
      commission_amount: commission_amount ? Number(commission_amount) : undefined,
      commission_percentage: commission_percentage ? Number(commission_percentage) : undefined,
      location,
      work_arrangement,
      reporting_manager,
      department,
      notes,
      status: "active",
      onboarding_status: "pending",
      created_by: userId!,
    });

    // Update submission status to hired
    await submission.update({
      status: "hired",
      reviewed_by: userId,
      reviewed_at: new Date(),
    });

    // Fetch the created placement with associations
    const createdPlacement = await Placement.findByPk(placement.id, {
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
        {
          model: Submission,
          as: "submission",
          attributes: ["id", "status"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Placement created successfully",
      data: { placement: createdPlacement },
    });
  } catch (error) {
    logger.error("Error creating placement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create placement",
    });
  }
};

// Update placement
export const updatePlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update placements",
      });
    }

    const placement = await Placement.findByPk(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    // Check permissions
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.placement_id;
    delete updateData.job_id;
    delete updateData.candidate_id;
    delete updateData.submission_id;
    delete updateData.recruiter_id;
    delete updateData.created_by;

    // Convert date strings to Date objects
    if (updateData.start_date) {
      updateData.start_date = new Date(updateData.start_date);
    }
    if (updateData.end_date) {
      updateData.end_date = new Date(updateData.end_date);
    }
    if (updateData.termination_date) {
      updateData.termination_date = new Date(updateData.termination_date);
    }
    if (updateData.onboarding_completed_at) {
      updateData.onboarding_completed_at = new Date(updateData.onboarding_completed_at);
    }
    if (updateData.renewal_date) {
      updateData.renewal_date = new Date(updateData.renewal_date);
    }

    await placement.update(updateData);

    // Fetch updated placement with associations
    const updatedPlacement = await Placement.findByPk(id, {
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

    res.status(200).json({
      success: true,
      message: "Placement updated successfully",
      data: { placement: updatedPlacement },
    });
  } catch (error) {
    logger.error("Error updating placement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update placement",
    });
  }
};

// Delete placement
export const deletePlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can delete placements",
      });
    }

    const placement = await Placement.findByPk(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    // Check permissions
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await placement.destroy();

    res.status(200).json({
      success: true,
      message: "Placement deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting placement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete placement",
    });
  }
};

// Get placement statistics
export const getPlacementStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can view placement statistics",
      });
    }

    const whereConditions: any = { recruiter_id: userId };

    // Check database dialect for date formatting
    const dialect = sequelize.getDialect();
    const dateFormatFn =
      dialect === "sqlite"
        ? Sequelize.fn("strftime", "%Y-%m", Sequelize.col("created_at"))
        : dialect === "postgres"
        ? Sequelize.fn("to_char", Sequelize.col("created_at"), "YYYY-MM")
        : Sequelize.fn("DATE_FORMAT", Sequelize.col("created_at"), "%Y-%m");

    const [
      totalPlacements,
      activePlacements,
      completedPlacements,
      terminatedPlacements,
      statusStats,
      typeStats,
      monthlyStats,
    ] = await Promise.all([
      Placement.count({ where: whereConditions }),
      Placement.count({ where: { ...whereConditions, status: "active" } }),
      Placement.count({ where: { ...whereConditions, status: "completed" } }),
      Placement.count({ where: { ...whereConditions, status: "terminated" } }),
      Placement.findAll({
        where: whereConditions,
        attributes: [
          "status",
          [Sequelize.literal("COUNT(*)"), "count"],
        ],
        group: ["status"],
        raw: true,
      }),
      Placement.findAll({
        where: whereConditions,
        attributes: [
          "placement_type",
          [Sequelize.literal("COUNT(*)"), "count"],
        ],
        group: ["placement_type"],
        raw: true,
      }),
      Placement.findAll({
        where: {
          ...whereConditions,
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1), // This year
          },
        },
        attributes: [
          [dateFormatFn, "month"],
          [Sequelize.literal("COUNT(*)"), "count"],
        ],
        group: [dateFormatFn],
        raw: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPlacements,
        activePlacements,
        completedPlacements,
        terminatedPlacements,
        statusStats,
        typeStats,
        monthlyStats,
      },
    });
  } catch (error) {
    logger.error("Error fetching placement statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement statistics",
    });
  }
};

// Terminate placement
export const terminatePlacement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { termination_reason, termination_date } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can terminate placements",
      });
    }

    const placement = await Placement.findByPk(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    if (placement.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await placement.update({
      status: "terminated",
      termination_reason,
      termination_date: termination_date ? new Date(termination_date) : new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Placement terminated successfully",
      data: { placement },
    });
  } catch (error) {
    logger.error("Error terminating placement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to terminate placement",
    });
  }
};

// Update onboarding status
export const updateOnboardingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { onboarding_status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update onboarding status",
      });
    }

    const placement = await Placement.findByPk(id);

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    if (placement.recruiter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updateData: any = { onboarding_status };
    if (onboarding_status === "completed") {
      updateData.onboarding_completed_at = new Date();
    }

    await placement.update(updateData);

    res.status(200).json({
      success: true,
      message: "Onboarding status updated successfully",
      data: { placement },
    });
  } catch (error) {
    logger.error("Error updating onboarding status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update onboarding status",
    });
  }
};

// Add a note to a placement
export const addPlacementNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can add placement notes",
      });
    }

    const placement = await Placement.findByPk(id);
    if (!placement) {
      return res.status(404).json({ success: false, message: "Placement not found" });
    }
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const authorName = await formatUserName(userId);
    const history = (placement as any).notes_history || [];
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
    history.push(entry);
    await placement.update({ notes_history: history } as any);

    res.json({
      success: true,
      message: "Note added successfully",
      data: { notes_history: history },
    });
  } catch (error) {
    logger.error("Error adding placement note:", error);
    res.status(500).json({ success: false, message: "Failed to add note" });
  }
};

// Edit an existing placement note
export const updatePlacementNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, noteId } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can edit placement notes",
      });
    }

    const placement = await Placement.findByPk(id);
    if (!placement) {
      return res.status(404).json({ success: false, message: "Placement not found" });
    }
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const history = (placement as any).notes_history || [];
    const noteIndex = history.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    const existing = history[noteIndex];
    history[noteIndex] = {
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

    await placement.update({ notes_history: history } as any);

    res.json({
      success: true,
      message: "Note updated successfully",
      data: { notes_history: history },
    });
  } catch (error) {
    logger.error("Error updating placement note:", error);
    res.status(500).json({ success: false, message: "Failed to update note" });
  }
};

// Delete a note from a placement
export const deletePlacementNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, noteId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can delete placement notes",
      });
    }

    const placement = await Placement.findByPk(id);
    if (!placement) {
      return res.status(404).json({ success: false, message: "Placement not found" });
    }
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const history = (placement as any).notes_history || [];
    const noteIndex = history.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    history.splice(noteIndex, 1);
    await placement.update({ notes_history: history } as any);

    res.json({
      success: true,
      message: "Note deleted successfully",
      data: { notes_history: history },
    });
  } catch (error) {
    logger.error("Error deleting placement note:", error);
    res.status(500).json({ success: false, message: "Failed to delete note" });
  }
};

// Add a document to a placement - either an uploaded file or a pasted URL
export const addPlacementAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, document_type, valid_from, valid_to } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can add placement attachments",
      });
    }

    const placement = await Placement.findByPk(id);
    if (!placement) {
      return res.status(404).json({ success: false, message: "Placement not found" });
    }
    if (placement.recruiter_id !== userId) {
      return res.status(403).json({ success: false, message: "Access denied" });
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
      return res.status(400).json({ success: false, message: "A file or url is required" });
    }

    const attachments = (placement as any).attachments || [];
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
    await placement.update({ attachments } as any);

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: { attachments },
    });
  } catch (error) {
    logger.error("Error adding placement attachment:", error);
    res.status(500).json({ success: false, message: "Failed to add attachment" });
  }
};
