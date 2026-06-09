import { Request, Response } from "express";
import { CandidateSkill, Candidate } from "../models";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middleware/auth";

// Get all skills for a candidate
export const getSkills = async (req: AuthRequest, res: Response) => {
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

    const skills = await CandidateSkill.findAll({
      where: { candidate_id: candidate.id },
      order: [
        ["is_primary", "DESC"], // Primary skills first
        ["category", "ASC"],
        ["skill_name", "ASC"],
      ],
    });

    // Group skills by category
    const skillsByCategory = skills.reduce((acc: any, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { 
        skills,
        skillsByCategory,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
};

// Create new skill
export const createSkill = async (req: AuthRequest, res: Response) => {
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
      skill_name,
      category,
      proficiency_level,
      years_of_experience,
      is_primary,
    } = req.body;

    // Check if skill already exists for this candidate
    const existingSkill = await CandidateSkill.findOne({
      where: { 
        candidate_id: candidate.id, 
        skill_name: skill_name.toLowerCase().trim(),
      },
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists",
      });
    }

    const skill = await CandidateSkill.create({
      candidate_id: candidate.id,
      skill_name: skill_name.trim(),
      category: category || "technical",
      proficiency_level: proficiency_level || "intermediate",
      years_of_experience,
      is_primary: is_primary || false,
    });

    res.status(201).json({
      success: true,
      data: { skill },
      message: "Skill added successfully",
    });
  } catch (error: any) {
    logger.error("Error creating skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create skill",
    });
  }
};

// Update skill
export const updateSkill = async (req: AuthRequest, res: Response) => {
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

    // Find skill
    const skill = await CandidateSkill.findOne({
      where: { id, candidate_id: candidate.id },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const {
      skill_name,
      category,
      proficiency_level,
      years_of_experience,
      is_primary,
    } = req.body;

    // If skill name is being changed, check for duplicates
    if (skill_name && skill_name.toLowerCase().trim() !== skill.skill_name.toLowerCase()) {
      const existingSkill = await CandidateSkill.findOne({
        where: { 
          candidate_id: candidate.id, 
          skill_name: skill_name.toLowerCase().trim(),
        },
      });

      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: "Skill with this name already exists",
        });
      }
    }

    await skill.update({
      skill_name: skill_name ? skill_name.trim() : skill.skill_name,
      category: category || skill.category,
      proficiency_level: proficiency_level || skill.proficiency_level,
      years_of_experience: years_of_experience !== undefined ? years_of_experience : skill.years_of_experience,
      is_primary: is_primary !== undefined ? is_primary : skill.is_primary,
    });

    res.json({
      success: true,
      data: { skill },
      message: "Skill updated successfully",
    });
  } catch (error: any) {
    logger.error("Error updating skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update skill",
    });
  }
};

// Delete skill
export const deleteSkill = async (req: AuthRequest, res: Response) => {
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

    // Find and delete skill
    const skill = await CandidateSkill.findOne({
      where: { id, candidate_id: candidate.id },
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    await skill.destroy();

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting skill:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete skill",
    });
  }
};

// Bulk update skills (for migrating from old simple skills array)
export const bulkUpdateSkills = async (req: AuthRequest, res: Response) => {
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

    const { skills } = req.body; // Array of skill objects

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    // Delete existing skills
    await CandidateSkill.destroy({
      where: { candidate_id: candidate.id },
    });

    // Create new skills
    const createdSkills = [];
    for (const skillData of skills) {
      const skill = await CandidateSkill.create({
        candidate_id: candidate.id,
        skill_name: skillData.skill_name || skillData.name,
        category: skillData.category || "technical",
        proficiency_level: skillData.proficiency_level || "intermediate",
        years_of_experience: skillData.years_of_experience,
        is_primary: skillData.is_primary || false,
      });
      createdSkills.push(skill);
    }

    res.json({
      success: true,
      data: { skills: createdSkills },
      message: "Skills updated successfully",
    });
  } catch (error: any) {
    logger.error("Error bulk updating skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update skills",
    });
  }
};
