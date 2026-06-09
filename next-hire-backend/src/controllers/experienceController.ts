import { Request, Response } from "express";
import { Experience, Candidate } from "../models";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middleware/auth";

// Get all experiences for a candidate
export const getExperiences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find candidate profile
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    const experiences = await Experience.findAll({
      where: { candidate_id: candidate.id },
      order: [["start_date", "DESC"]], // Most recent first
    });

    res.json({
      success: true,
      data: { experiences },
    });
  } catch (error: any) {
    logger.error("Error fetching experiences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch experiences",
    });
  }
};

// Create new experience
export const createExperience = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find candidate profile
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    const {
      job_title,
      company_name,
      location,
      start_date,
      end_date,
      is_current,
      description,
      achievements,
      technologies,
    } = req.body;

    // If this is current job, set end_date to null and update any other current jobs
    if (is_current) {
      await Experience.update(
        { is_current: false },
        { where: { candidate_id: candidate.id, is_current: true } }
      );
    }

    const experience = await Experience.create({
      candidate_id: candidate.id,
      job_title,
      company_name,
      location,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : undefined,
      is_current: is_current || false,
      description,
      achievements: achievements || [],
      technologies: technologies || [],
    });

    res.status(201).json({
      success: true,
      data: { experience },
      message: "Experience added successfully",
    });
  } catch (error: any) {
    logger.error("Error creating experience:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create experience",
    });
  }
};

// Update experience
export const updateExperience = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find candidate profile
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    // Find experience
    const experience = await Experience.findOne({
      where: { id, candidate_id: candidate.id },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const {
      job_title,
      company_name,
      location,
      start_date,
      end_date,
      is_current,
      description,
      achievements,
      technologies,
    } = req.body;

    // If this is being set as current job, update any other current jobs
    if (is_current && !experience.is_current) {
      await Experience.update(
        { is_current: false },
        { where: { candidate_id: candidate.id, is_current: true } }
      );
    }

    await experience.update({
      job_title: job_title || experience.job_title,
      company_name: company_name || experience.company_name,
      location: location !== undefined ? location : experience.location,
      start_date: start_date ? new Date(start_date) : experience.start_date,
      end_date: end_date ? new Date(end_date) : is_current ? undefined : experience.end_date,
      is_current: is_current !== undefined ? is_current : experience.is_current,
      description: description !== undefined ? description : experience.description,
      achievements: achievements !== undefined ? achievements : experience.achievements,
      technologies: technologies !== undefined ? technologies : experience.technologies,
    });

    res.json({
      success: true,
      data: { experience },
      message: "Experience updated successfully",
    });
  } catch (error: any) {
    logger.error("Error updating experience:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update experience",
    });
  }
};

// Delete experience
export const deleteExperience = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find candidate profile
    const candidate = await Candidate.findOne({ where: { user_id: userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    // Find and delete experience
    const experience = await Experience.findOne({
      where: { id, candidate_id: candidate.id },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    await experience.destroy();

    res.json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting experience:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete experience",
    });
  }
};
