import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Candidate } from "./Candidate";

export interface CandidateSkillAttributes {
  id: string;
  candidate_id: string;
  skill_name: string;
  category: "technical" | "soft" | "language" | "certification" | "other";
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience?: number;
  is_primary: boolean; // Mark as primary/featured skill
  endorsements?: number; // Number of endorsements (future feature)
  created_at?: Date;
  updated_at?: Date;
}

export interface CandidateSkillCreationAttributes
  extends Optional<CandidateSkillAttributes, "id" | "created_at" | "updated_at"> {}

export class CandidateSkill
  extends Model<CandidateSkillAttributes, CandidateSkillCreationAttributes>
  implements CandidateSkillAttributes
{
  public id!: string;
  public candidate_id!: string;
  public skill_name!: string;
  public category!: "technical" | "soft" | "language" | "certification" | "other";
  public proficiency_level!: "beginner" | "intermediate" | "advanced" | "expert";
  public years_of_experience?: number;
  public is_primary!: boolean;
  public endorsements?: number;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public candidate?: Candidate;
}

CandidateSkill.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    candidate_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Candidate,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    skill_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("technical", "soft", "language", "certification", "other"),
      allowNull: false,
      defaultValue: "technical",
    },
    proficiency_level: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced", "expert"),
      allowNull: false,
      defaultValue: "intermediate",
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50,
      },
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    endorsements: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: "CandidateSkill",
    tableName: "candidate_skills",
    indexes: [
      {
        fields: ["candidate_id"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["proficiency_level"],
      },
      {
        fields: ["is_primary"],
      },
      {
        unique: true,
        fields: ["candidate_id", "skill_name"], // Prevent duplicate skills per candidate
      },
    ],
  }
);
