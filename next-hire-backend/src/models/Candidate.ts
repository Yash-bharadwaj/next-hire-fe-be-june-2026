import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface CandidateAttributes {
  id: string;
  user_id: string;
  created_by?: string | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  current_salary?: number;
  expected_salary?: number;
  experience_years?: number;
  resume_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[]; // Array of skill names
  availability_status: "available" | "not_available" | "interviewing";
  preferred_job_types?: string[]; // Array of job types
  preferred_locations?: string[]; // Array of locations
  bio?: string;
  embedding?: number[] | null; // Vector embedding for semantic matching
  created_at?: Date;
  updated_at?: Date;
}

export interface CandidateCreationAttributes
  extends Optional<
    CandidateAttributes,
    "id" | "availability_status" | "created_at" | "updated_at" | "created_by"
  > {}

export class Candidate
  extends Model<CandidateAttributes, CandidateCreationAttributes>
  implements CandidateAttributes
{
  public id!: string;
  public user_id!: string;
  public created_by?: string | null;
  public first_name?: string;
  public last_name?: string;
  public phone?: string;
  public location?: string;
  public current_salary?: number;
  public expected_salary?: number;
  public experience_years?: number;
  public resume_url?: string;
  public linkedin_url?: string;
  public portfolio_url?: string;
  public skills?: string[];
  public availability_status!: "available" | "not_available" | "interviewing";
  public preferred_job_types?: string[];
  public preferred_locations?: string[];
  public bio?: string;
  public embedding?: number[] | null;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public user?: User;

  // Hide the raw embedding vector from API responses - it's large and only
  // used internally for similarity search.
  public toJSON(): object {
    const values = { ...this.get() } as any;
    delete values.embedding;
    return values;
  }
}

Candidate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    expected_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50,
      },
    },
    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    portfolio_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("skills") as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue("skills", JSON.stringify(value || []) as any);
      },
    },
    availability_status: {
      type: DataTypes.ENUM("available", "not_available", "interviewing"),
      allowNull: false,
      defaultValue: "available",
    },
    preferred_job_types: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue(
          "preferred_job_types"
        ) as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue(
          "preferred_job_types",
          JSON.stringify(value || []) as any
        );
      },
    },
    preferred_locations: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue(
          "preferred_locations"
        ) as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue(
          "preferred_locations",
          JSON.stringify(value || []) as any
        );
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    embedding: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue("embedding") as unknown as string;
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      },
      set(value: number[] | null) {
        this.setDataValue("embedding", (value ? JSON.stringify(value) : null) as any);
      },
    },
  },
  {
    sequelize,
    modelName: "Candidate",
    tableName: "candidates",
    indexes: [
      {
        unique: true,
        fields: ["user_id"],
      },
      {
        fields: ["availability_status"],
      },
      {
        fields: ["location"],
      },
      {
        fields: ["experience_years"],
      },
      {
        fields: ["created_by"],
      },
    ],
  }
);
