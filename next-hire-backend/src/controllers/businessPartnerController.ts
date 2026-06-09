import { Response } from "express";
import { Op } from "sequelize";
import { BusinessPartner } from "../models/BusinessPartner";
import { User, Recruiter } from "../models";
import { logger } from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth";

// Helper function to generate business partner number
const generateBusinessPartnerNumber = async (): Promise<string> => {
  const count = await BusinessPartner.count();
  const number = (count + 1).toString().padStart(3, "0");
  return `BP${number}`;
};

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

    res.status(200).json({
      success: true,
      data: { businessPartner },
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

    // Generate business partner number
    const business_partner_number = await generateBusinessPartnerNumber();

    const businessPartner = await BusinessPartner.create({
      business_partner_number,
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
