import { Router } from "express";
import { body } from "express-validator";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  bulkUpdateSkills,
} from "../controllers/skillsController";

const router = Router();

// Validation rules
const createSkillValidation = [
  body("skill_name")
    .notEmpty()
    .withMessage("Skill name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),
  body("category")
    .optional()
    .isIn(["technical", "soft", "language", "certification", "other"])
    .withMessage("Category must be one of: technical, soft, language, certification, other"),
  body("proficiency_level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Proficiency level must be one of: beginner, intermediate, advanced, expert"),
  body("years_of_experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Years of experience must be between 0 and 50"),
  body("is_primary")
    .optional()
    .isBoolean()
    .withMessage("is_primary must be a boolean"),
];

const updateSkillValidation = [
  body("skill_name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),
  body("category")
    .optional()
    .isIn(["technical", "soft", "language", "certification", "other"])
    .withMessage("Category must be one of: technical, soft, language, certification, other"),
  body("proficiency_level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Proficiency level must be one of: beginner, intermediate, advanced, expert"),
  body("years_of_experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Years of experience must be between 0 and 50"),
  body("is_primary")
    .optional()
    .isBoolean()
    .withMessage("is_primary must be a boolean"),
];

const bulkUpdateSkillsValidation = [
  body("skills")
    .isArray()
    .withMessage("Skills must be an array"),
  body("skills.*.skill_name")
    .notEmpty()
    .withMessage("Each skill must have a name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Skill name must be between 2 and 50 characters"),
  body("skills.*.category")
    .optional()
    .isIn(["technical", "soft", "language", "certification", "other"])
    .withMessage("Category must be one of: technical, soft, language, certification, other"),
  body("skills.*.proficiency_level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "expert"])
    .withMessage("Proficiency level must be one of: beginner, intermediate, advanced, expert"),
  body("skills.*.years_of_experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Years of experience must be between 0 and 50"),
  body("skills.*.is_primary")
    .optional()
    .isBoolean()
    .withMessage("is_primary must be a boolean"),
];

// Routes
router.get("/", auth, getSkills);
router.post("/", auth, createSkillValidation, validate, createSkill);
router.put("/:id", auth, updateSkillValidation, validate, updateSkill);
router.delete("/:id", auth, deleteSkill);
router.post("/bulk", auth, bulkUpdateSkillsValidation, validate, bulkUpdateSkills);

export default router;
