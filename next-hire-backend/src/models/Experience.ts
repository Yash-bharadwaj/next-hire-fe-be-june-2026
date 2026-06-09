import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Candidate } from "./Candidate";

export interface ExperienceAttributes {
  id: string;
  candidate_id: string;
  job_title: string;
  company_name: string;
  location?: string;
  start_date: Date;
  end_date?: Date; // null if current job
  is_current: boolean;
  description?: string;
  achievements?: string[]; // Array of key achievements
  technologies?: string[]; // Technologies used in this role
  created_at?: Date;
  updated_at?: Date;
}

export interface ExperienceCreationAttributes
  extends Optional<ExperienceAttributes, "id" | "created_at" | "updated_at"> {}

export class Experience
  extends Model<ExperienceAttributes, ExperienceCreationAttributes>
  implements ExperienceAttributes
{
  public id!: string;
  public candidate_id!: string;
  public job_title!: string;
  public company_name!: string;
  public location?: string;
  public start_date!: Date;
  public end_date?: Date;
  public is_current!: boolean;
  public description?: string;
  public achievements?: string[];
  public technologies?: string[];

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public candidate?: Candidate;
}

Experience.init(
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
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("achievements") as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue("achievements", JSON.stringify(value || []) as any);
      },
    },
    technologies: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("technologies") as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue("technologies", JSON.stringify(value || []) as any);
      },
    },
  },
  {
    sequelize,
    modelName: "Experience",
    tableName: "experiences",
    indexes: [
      {
        fields: ["candidate_id"],
      },
      {
        fields: ["start_date"],
      },
      {
        fields: ["is_current"],
      },
    ],
  }
);
