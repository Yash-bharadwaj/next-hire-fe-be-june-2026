import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Job } from "./Job";
import { Candidate } from "./Candidate";
import { Submission } from "./Submission";

export interface PlacementAttributes {
  id: string;
  placement_id: string; // Human readable placement ID like PL-2024-001
  job_id: string;
  candidate_id: string;
  submission_id: string;
  recruiter_id: string; // User ID of recruiter who made the placement
  vendor_id?: string; // User ID of vendor if placement was through vendor
  
  // Placement details
  start_date: Date;
  end_date?: Date; // For contract positions
  placement_type: "permanent" | "contract" | "temporary" | "temp_to_perm";
  
  // Financial details
  salary: number;
  salary_currency: string;
  billing_rate?: number; // For contract positions
  commission_amount?: number;
  commission_percentage?: number;
  
  // Status and tracking
  status: "active" | "completed" | "terminated" | "on_hold";
  termination_reason?: string;
  termination_date?: Date;
  
  // Additional details
  location: string;
  work_arrangement: "onsite" | "remote" | "hybrid";
  reporting_manager?: string;
  department?: string;
  notes?: string;
  
  // Onboarding tracking
  onboarding_status: "pending" | "in_progress" | "completed";
  onboarding_completed_at?: Date;
  
  // Performance tracking
  performance_rating?: number; // 1-5 scale
  performance_notes?: string;
  
  // Renewal tracking (for contracts)
  renewal_date?: Date;
  renewal_status?: "pending" | "renewed" | "not_renewed";
  
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlacementCreationAttributes
  extends Optional<PlacementAttributes, "id" | "placement_id" | "created_at" | "updated_at"> {}

export class Placement
  extends Model<PlacementAttributes, PlacementCreationAttributes>
  implements PlacementAttributes
{
  public id!: string;
  public placement_id!: string;
  public job_id!: string;
  public candidate_id!: string;
  public submission_id!: string;
  public recruiter_id!: string;
  public vendor_id?: string;
  
  public start_date!: Date;
  public end_date?: Date;
  public placement_type!: "permanent" | "contract" | "temporary" | "temp_to_perm";
  
  public salary!: number;
  public salary_currency!: string;
  public billing_rate?: number;
  public commission_amount?: number;
  public commission_percentage?: number;
  
  public status!: "active" | "completed" | "terminated" | "on_hold";
  public termination_reason?: string;
  public termination_date?: Date;
  
  public location!: string;
  public work_arrangement!: "onsite" | "remote" | "hybrid";
  public reporting_manager?: string;
  public department?: string;
  public notes?: string;
  
  public onboarding_status!: "pending" | "in_progress" | "completed";
  public onboarding_completed_at?: Date;
  
  public performance_rating?: number;
  public performance_notes?: string;
  
  public renewal_date?: Date;
  public renewal_status?: "pending" | "renewed" | "not_renewed";
  
  public created_by!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public job?: Job;
  public candidate?: Candidate;
  public submission?: Submission;
  public recruiter?: User;
  public vendor?: User;
  public creator?: User;
}

Placement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    placement_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "jobs",
        key: "id",
      },
    },
    candidate_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "candidates",
        key: "id",
      },
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "submissions",
        key: "id",
      },
    },
    recruiter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    placement_type: {
      type: DataTypes.ENUM("permanent", "contract", "temporary", "temp_to_perm"),
      allowNull: false,
      defaultValue: "permanent",
    },
    salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    salary_currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    billing_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    commission_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    commission_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "terminated", "on_hold"),
      allowNull: false,
      defaultValue: "active",
    },
    termination_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    termination_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_arrangement: {
      type: DataTypes.ENUM("onsite", "remote", "hybrid"),
      allowNull: false,
      defaultValue: "onsite",
    },
    reporting_manager: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    onboarding_status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    onboarding_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    performance_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    performance_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    renewal_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renewal_status: {
      type: DataTypes.ENUM("pending", "renewed", "not_renewed"),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Placement",
    tableName: "placements",
    indexes: [
      {
        unique: true,
        fields: ["placement_id"],
      },
      {
        fields: ["job_id"],
      },
      {
        fields: ["candidate_id"],
      },
      {
        fields: ["submission_id"],
      },
      {
        fields: ["recruiter_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["placement_type"],
      },
      {
        fields: ["start_date"],
      },
    ],
  }
);
