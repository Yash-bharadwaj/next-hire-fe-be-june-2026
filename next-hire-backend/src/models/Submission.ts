import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Job } from "./Job";
import { Candidate } from "./Candidate";

export interface SubmissionAttributes {
  id: string;
  job_id: string;
  candidate_id: string;
  submitted_by: string; // User ID who submitted (candidate or vendor)
  status:
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "interview_scheduled"
    | "interviewed"
    | "offered"
    | "hired"
    | "rejected";
  ai_score?: number; // AI matching score 0-100
  notes?: string; // Internal notes from recruiters
  cover_letter?: string;
  resume_url?: string;
  expected_salary?: number;
  availability_date?: Date;
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string; // User ID of reviewer
  created_at?: Date;
  updated_at?: Date;
  attachments?: any;
  notes_history?: any;
}

export interface SubmissionCreationAttributes
  extends Optional<
    SubmissionAttributes,
    "id" | "status" | "submitted_at" | "created_at" | "updated_at"
  > {}

export class Submission
  extends Model<SubmissionAttributes, SubmissionCreationAttributes>
  implements SubmissionAttributes
{
  public id!: string;
  public job_id!: string;
  public candidate_id!: string;
  public submitted_by!: string;
  public status!:
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "interview_scheduled"
    | "interviewed"
    | "offered"
    | "hired"
    | "rejected";
  public ai_score?: number;
  public notes?: string;
  public cover_letter?: string;
  public resume_url?: string;
  public expected_salary?: number;
  public availability_date?: Date;
  public submitted_at!: Date;
  public reviewed_at?: Date;
  public reviewed_by?: string;
  public attachments?: any;
  public notes_history?: any;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public job?: Job;
  public candidate?: Candidate;
  public submitter?: User;
  public reviewer?: User;
}

Submission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Job,
        key: "id",
      },
      onDelete: "CASCADE",
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
    submitted_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "submitted",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "offered",
        "hired",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "submitted",
    },
    ai_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expected_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    availability_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    attachments: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("attachments") as unknown as string;
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value: any[]) {
        this.setDataValue("attachments", JSON.stringify(value || []));
      },
    },
    notes_history: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("notes_history") as unknown as string;
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value: any[]) {
        this.setDataValue("notes_history", JSON.stringify(value || []));
      },
    },
  },
  {
    sequelize,
    modelName: "Submission",
    tableName: "submissions",
    indexes: [
      {
        unique: true,
        fields: ["job_id", "candidate_id"], // Prevent duplicate submissions
      },
      {
        fields: ["status"],
      },
      {
        fields: ["submitted_by"],
      },
      {
        fields: ["ai_score"],
      },
      {
        fields: ["submitted_at"],
      },
    ],
  }
);
