import { Response } from "express";
import { Op, Sequelize } from "sequelize";
import { randomUUID } from "crypto";
import { BusinessPartner } from "../models/BusinessPartner";
import { BusinessPartnerContact } from "../models/BusinessPartnerContact";
import { User, Recruiter, Job, Placement, sequelize } from "../models";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";
import { formatUserName, prepareNotesAndAttachmentsForResponse } from "../utils/notesAndAttachments";

// A recruiter can act on a business partner they created or were assigned to manage.
const canManagePartner = (partner: BusinessPartner, userId?: string): boolean =>
  !!userId && (partner.created_by === userId || partner.assigned_to === userId);

// Helper function to include common associations
const includeAssociations = [
  {
    model: User,
    as: "creator",
    attributes: ["id", "email"],
    include: [
      {
        model: Recruiter,
        as: "recruiterProfile",
        attributes: ["first_name", "last_name"],
        required: false,
      },
    ],
  },
  {
    model: User,
    as: "assignee",
    attributes: ["id", "email"],
    include: [
      {
        model: Recruiter,
        as: "recruiterProfile",
        attributes: ["first_name", "last_name"],
        required: false,
      },
    ],
    required: false,
  },
];

export const getBusinessPartners = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      partner_type,
      source,
      priority,
      assigned_to,
      scope,
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

    // Role-based filtering. scope=all opts out of the "mine only" restriction
    // so any recruiter can pick any client when staffing a job - account
    // ownership (created_by/assigned_to) is still tracked, just not used to
    // hide other recruiters' clients from this lookup.
    if (userRole === "recruiter" && scope !== "all") {
      // Recruiters can see partners they created or are assigned to
      whereConditions[Op.or] = [
        { created_by: userId },
        { assigned_to: userId },
      ];
    }

    // Apply filters
    if (status) {
      whereConditions.status = status;
    }

    if (partner_type) {
      switch (partner_type) {
        case "lead":
          whereConditions.is_lead = true;
          break;
        case "client":
          whereConditions.is_client = true;
          break;
        case "vendor":
          whereConditions.is_vendor = true;
          break;
      }
    }

    if (source) {
      whereConditions.source = source;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    if (assigned_to) {
      whereConditions.assigned_to = assigned_to;
    }

    // Search functionality
    if (search) {
      whereConditions[Op.or] = [
        ...(whereConditions[Op.or] || []),
        { name: { [Op.like]: `%${search}%` } },
        { business_partner_number: { [Op.like]: `%${search}%` } },
        { primary_email: { [Op.like]: `%${search}%` } },
        { domain: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: businessPartners } = await BusinessPartner.findAndCountAll({
      where: whereConditions,
      include: includeAssociations,
      limit: Number(limit),
      offset,
      order: [[sort_by as string, sort_order as string]],
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.status(200).json({
      success: true,
      data: {
        businessPartners,
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
    logger.error("Error fetching business partners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business partners",
    });
  }
};

export const getBusinessPartnerById = async (req: AuthenticatedRequest, res: Response) => {
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

    const businessPartner = await BusinessPartner.findByPk(id, {
      include: includeAssociations,
    });

    if (!businessPartner) {
      return res.status(404).json({
        success: false,
        message: "Business partner not found",
      });
    }

    // Check permissions
    if (userRole === "recruiter" && 
        businessPartner.created_by !== userId && 
        businessPartner.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const businessPartnerData = await prepareNotesAndAttachmentsForResponse(businessPartner, userRole);

    res.status(200).json({
      success: true,
      data: { businessPartner: businessPartnerData },
    });
  } catch (error) {
    logger.error("Error fetching business partner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business partner",
    });
  }
};

export const createBusinessPartner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can create business partners",
      });
    }

    const {
      name,
      is_lead = false,
      is_client = false,
      is_vendor = false,
      address1,
      address2,
      city,
      state,
      country = "United States",
      postal_code,
      geocode,
      tax_id,
      primary_email,
      primary_phone,
      website,
      domain,
      industry,
      company_size,
      annual_revenue,
      source = "other",
      status = "prospect",
      priority = "medium",
      logo_url,
      notes,
      tags = [],
      assigned_to,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    const businessPartner = await BusinessPartner.create({
      name,
      is_lead,
      is_client,
      is_vendor,
      address1,
      address2,
      city,
      state,
      country,
      postal_code,
      geocode,
      tax_id,
      primary_email,
      primary_phone,
      website,
      domain,
      industry,
      company_size,
      annual_revenue,
      source,
      status,
      priority,
      logo_url,
      notes,
      tags: JSON.stringify(tags),
      created_by: userId,
      assigned_to: assigned_to || userId,
      last_activity_at: new Date(),
    });

    // Fetch the created business partner with associations
    const createdBusinessPartner = await BusinessPartner.findByPk(businessPartner.id, {
      include: includeAssociations,
    });

    logger.info(`Business partner created: ${businessPartner.id} by user ${userId}`);
    res.status(201).json({
      success: true,
      message: "Business partner created successfully",
      data: { businessPartner: createdBusinessPartner },
    });
  } catch (error) {
    logger.error("Error creating business partner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create business partner",
    });
  }
};

export const updateBusinessPartner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update business partners",
      });
    }

    const businessPartner = await BusinessPartner.findByPk(id);

    if (!businessPartner) {
      return res.status(404).json({
        success: false,
        message: "Business partner not found",
      });
    }

    // Check permissions
    if (businessPartner.created_by !== userId && businessPartner.assigned_to !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.business_partner_number;
    delete updateData.business_partner_guid;
    delete updateData.created_by;

    // Handle tags array
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    // Update last activity
    updateData.last_activity_at = new Date();

    await businessPartner.update(updateData);

    // Fetch updated business partner with associations
    const updatedBusinessPartner = await BusinessPartner.findByPk(id, {
      include: includeAssociations,
    });

    logger.info(`Business partner updated: ${businessPartner.id} by user ${userId}`);
    res.status(200).json({
      success: true,
      message: "Business partner updated successfully",
      data: { businessPartner: updatedBusinessPartner },
    });
  } catch (error) {
    logger.error("Error updating business partner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update business partner",
    });
  }
};

export const deleteBusinessPartner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can delete business partners",
      });
    }

    const businessPartner = await BusinessPartner.findByPk(id);

    if (!businessPartner) {
      return res.status(404).json({
        success: false,
        message: "Business partner not found",
      });
    }

    // Check permissions
    if (businessPartner.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this business partner",
      });
    }

    await businessPartner.destroy();

    logger.info(`Business partner deleted: ${businessPartner.id} by user ${userId}`);
    res.status(200).json({
      success: true,
      message: "Business partner deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting business partner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete business partner",
    });
  }
};

export const getBusinessPartnerStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can view business partner statistics",
      });
    }

    const whereConditions: any = {
      [Op.or]: [
        { created_by: userId },
        { assigned_to: userId },
      ],
    };

    const [
      totalPartners,
      leads,
      clients,
      vendors,
      activePartners,
      prospectPartners,
      inactivePartners,
      sourceStats,
      priorityStats,
    ] = await Promise.all([
      BusinessPartner.count({ where: whereConditions }),
      BusinessPartner.count({ where: { ...whereConditions, is_lead: true } }),
      BusinessPartner.count({ where: { ...whereConditions, is_client: true } }),
      BusinessPartner.count({ where: { ...whereConditions, is_vendor: true } }),
      BusinessPartner.count({ where: { ...whereConditions, status: "active" } }),
      BusinessPartner.count({ where: { ...whereConditions, status: "prospect" } }),
      BusinessPartner.count({ where: { ...whereConditions, status: "inactive" } }),
      BusinessPartner.findAll({
        where: whereConditions,
        attributes: [
          "source",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["source"],
        raw: true,
      }),
      BusinessPartner.findAll({
        where: whereConditions,
        attributes: [
          "priority",
          [require("sequelize").fn("COUNT", "*"), "count"],
        ],
        group: ["priority"],
        raw: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPartners,
        leads,
        clients,
        vendors,
        activePartners,
        prospectPartners,
        inactivePartners,
        sourceStats,
        priorityStats,
      },
    });
  } catch (error) {
    logger.error("Error fetching business partner statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business partner statistics",
    });
  }
};

// List contacts for a business partner (client). Any recruiter can view -
// contacts are looked up while staffing a job for any client, not just ones
// the current recruiter personally owns.
export const getBusinessPartnerContacts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({
        success: false,
        message: "Business partner not found",
      });
    }

    const contacts = await BusinessPartnerContact.findAll({
      where: { business_partner_id: id },
      order: [
        ["is_primary", "DESC"],
        ["name", "ASC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: { contacts },
    });
  } catch (error) {
    logger.error("Error fetching business partner contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business partner contacts",
    });
  }
};

// Add a contact to a business partner (client). Used for the quick "+ Add
// contact" affordance on the Job form's Client Contact dropdown.
export const createBusinessPartnerContact = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can add business partner contacts",
      });
    }

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({
        success: false,
        message: "Business partner not found",
      });
    }

    const { name, title, email, phone, is_primary = false } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    const contact = await BusinessPartnerContact.create({
      business_partner_id: id,
      name,
      title,
      email,
      phone,
      is_primary,
      created_by: userId,
    });

    logger.info(`Business partner contact created: ${contact.id} for partner ${id} by user ${userId}`);
    res.status(201).json({
      success: true,
      message: "Contact added successfully",
      data: { contact },
    });
  } catch (error) {
    logger.error("Error creating business partner contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add contact",
    });
  }
};

// Edit a contact
export const updateBusinessPartnerContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, contactId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can edit business partner contacts" });
    }

    const contact = await BusinessPartnerContact.findOne({ where: { id: contactId, business_partner_id: id } });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    const { name, title, email, phone, is_primary } = req.body;
    await contact.update({
      name: name !== undefined ? name : contact.name,
      title: title !== undefined ? title : contact.title,
      email: email !== undefined ? email : contact.email,
      phone: phone !== undefined ? phone : contact.phone,
      is_primary: is_primary !== undefined ? is_primary : contact.is_primary,
    });

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: { contact },
    });
  } catch (error) {
    logger.error("Error updating business partner contact:", error);
    res.status(500).json({ success: false, message: "Failed to update contact" });
  }
};

// Delete a contact
export const deleteBusinessPartnerContact = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, contactId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can delete business partner contacts" });
    }

    const contact = await BusinessPartnerContact.findOne({ where: { id: contactId, business_partner_id: id } });
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    await contact.destroy();

    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    logger.error("Error deleting business partner contact:", error);
    res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
};

// Recent job postings raised by this client - the real equivalent of the
// reference UI's fabricated "What's New" news feed.
export const getBusinessPartnerJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }

    const jobs = await Job.findAll({
      where: { business_partner_id: id },
      attributes: ["id", "job_id", "title", "status", "job_type", "location", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 20,
    });

    res.status(200).json({ success: true, data: { jobs } });
  } catch (error) {
    logger.error("Error fetching business partner jobs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch business partner jobs" });
  }
};

// Real per-partner metrics, derived from this partner's actual jobs/placements/contacts
// rather than the hardcoded demo numbers the reference UI used.
export const getBusinessPartnerDetailStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }

    const [activeJobs, totalJobs, totalContacts, placements] = await Promise.all([
      Job.count({ where: { business_partner_id: id, status: "active" } }),
      Job.count({ where: { business_partner_id: id } }),
      BusinessPartnerContact.count({ where: { business_partner_id: id } }),
      Placement.findAll({
        include: [{ model: Job, as: "job", where: { business_partner_id: id }, attributes: [] }],
        attributes: ["id", "salary", "commission_amount"],
      }),
    ]);

    const totalPlacements = placements.length;
    const revenueGenerated = placements.reduce(
      (sum, p) => sum + (Number((p as any).commission_amount) || Number((p as any).salary) || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: { activeJobs, totalJobs, totalPlacements, totalContacts, revenueGenerated },
    });
  } catch (error) {
    logger.error("Error fetching business partner detail stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch business partner stats" });
  }
};

// A real activity feed for this partner, merged from jobs created, placements
// made, and contacts added - replacing the reference UI's hardcoded timeline.
export const getBusinessPartnerActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }

    const [jobs, placements, contacts] = await Promise.all([
      Job.findAll({
        where: { business_partner_id: id },
        attributes: ["id", "job_id", "title", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 10,
      }),
      Placement.findAll({
        include: [{ model: Job, as: "job", where: { business_partner_id: id }, attributes: ["title"] }],
        attributes: ["id", "placement_id", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 10,
      }),
      BusinessPartnerContact.findAll({
        where: { business_partner_id: id },
        attributes: ["id", "name", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 10,
      }),
    ]);

    const activity = [
      ...jobs.map((j) => ({
        id: `job-${j.id}`,
        type: "job" as const,
        description: `New job posted: ${j.title}`,
        at: j.created_at,
      })),
      ...placements.map((p: any) => ({
        id: `placement-${p.id}`,
        type: "placement" as const,
        description: `New placement made for ${p.job?.title || "a role"}`,
        at: p.created_at,
      })),
      ...contacts.map((c) => ({
        id: `contact-${c.id}`,
        type: "contact" as const,
        description: `New contact added: ${c.name}`,
        at: c.created_at,
      })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 15);

    res.status(200).json({ success: true, data: { activity } });
  } catch (error) {
    logger.error("Error fetching business partner activity:", error);
    res.status(500).json({ success: false, message: "Failed to fetch business partner activity" });
  }
};

// Real monthly placement/revenue trend for this partner's jobs (last 6 months),
// replacing the reference UI's hardcoded chart data.
export const getBusinessPartnerRevenueTrend = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const dialect = sequelize.getDialect();
    const monthExpr =
      dialect === "sqlite"
        ? Sequelize.fn("strftime", "%Y-%m", Sequelize.col("Placement.created_at"))
        : dialect === "postgres"
        ? Sequelize.fn("to_char", Sequelize.col("Placement.created_at"), "YYYY-MM")
        : Sequelize.fn("DATE_FORMAT", Sequelize.col("Placement.created_at"), "%Y-%m");

    const placements = await Placement.findAll({
      include: [{ model: Job, as: "job", where: { business_partner_id: id }, attributes: [] }],
      attributes: [
        [monthExpr, "month"],
        [Sequelize.literal("COUNT(*)"), "placements"],
        [Sequelize.literal('SUM(COALESCE("commission_amount", "salary", 0))'), "revenue"],
      ],
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      group: [monthExpr as any],
      order: [[monthExpr as any, "ASC"]],
      raw: true,
    });

    const trend = (placements as any[]).map((row) => ({
      month: row.month,
      placements: Number(row.placements) || 0,
      revenue: Number(row.revenue) || 0,
    }));

    res.status(200).json({ success: true, data: { trend } });
  } catch (error) {
    logger.error("Error fetching business partner revenue trend:", error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue trend" });
  }
};

// Add a note to a business partner
export const addBusinessPartnerNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can add notes" });
    }

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }
    if (!canManagePartner(businessPartner, userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const authorName = await formatUserName(userId);
    const history = (businessPartner as any).notes_history || [];
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
    await businessPartner.update({ notes_history: history, last_activity_at: new Date() } as any);

    res.json({ success: true, message: "Note added successfully", data: { notes_history: history } });
  } catch (error) {
    logger.error("Error adding business partner note:", error);
    res.status(500).json({ success: false, message: "Failed to add note" });
  }
};

// Edit an existing note
export const updateBusinessPartnerNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, noteId } = req.params;
    const { title, content, category, isPrivate, tags } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can edit notes" });
    }

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }
    if (!canManagePartner(businessPartner, userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const history = (businessPartner as any).notes_history || [];
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
      tags: Array.isArray(tags) ? tags.filter((t: any) => typeof t === "string" && t.trim()) : existing.tags,
      edited_at: new Date().toISOString(),
    };

    await businessPartner.update({ notes_history: history } as any);

    res.json({ success: true, message: "Note updated successfully", data: { notes_history: history } });
  } catch (error) {
    logger.error("Error updating business partner note:", error);
    res.status(500).json({ success: false, message: "Failed to update note" });
  }
};

// Delete a note
export const deleteBusinessPartnerNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, noteId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can delete notes" });
    }

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }
    if (!canManagePartner(businessPartner, userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const history = (businessPartner as any).notes_history || [];
    const noteIndex = history.findIndex((n: any) => n.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    history.splice(noteIndex, 1);
    await businessPartner.update({ notes_history: history } as any);

    res.json({ success: true, message: "Note deleted successfully", data: { notes_history: history } });
  } catch (error) {
    logger.error("Error deleting business partner note:", error);
    res.status(500).json({ success: false, message: "Failed to delete note" });
  }
};

// Add a document to a business partner - either an uploaded file or a pasted URL
export const addBusinessPartnerAttachment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, document_type, valid_from, valid_to } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== "recruiter") {
      return res.status(403).json({ success: false, message: "Only recruiters can add attachments" });
    }

    const businessPartner = await BusinessPartner.findByPk(id);
    if (!businessPartner) {
      return res.status(404).json({ success: false, message: "Business partner not found" });
    }
    if (!canManagePartner(businessPartner, userId)) {
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

    const attachments = (businessPartner as any).attachments || [];
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
    await businessPartner.update({ attachments, last_activity_at: new Date() } as any);

    res.json({ success: true, message: "Document uploaded successfully", data: { attachments } });
  } catch (error) {
    logger.error("Error adding business partner attachment:", error);
    res.status(500).json({ success: false, message: "Failed to add attachment" });
  }
};
