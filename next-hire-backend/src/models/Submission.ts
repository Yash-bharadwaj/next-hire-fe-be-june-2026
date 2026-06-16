import { DataTypes, Model, Optional, Op } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Job } from "./Job";
import { Candidate } from "./Candidate";

export interface SubmissionAttributes {
  id: string;
  submission_id: string; // Human readable ID like SUB-0001
  job_id: string;
  candidate_id: string;
  submitted_by: string; // User ID who submitted (candidate or vendor)
  status:
    | "new_candidate"
    | "initial_scanning"
    | "first_round"
    | "technical_round"
    | "final_round"
    | "hired"
    | "rejected"
    | "sourcing"
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "interview_scheduled"
    | "interviewed"
    | "offered";
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
    "id" | "submission_id" | "status" | "submitted_at" | "created_at" | "updated_at"
  > {}

export class Submission
  extends Model<SubmissionAttributes, SubmissionCreationAttributes>
  implements SubmissionAttributes
{
  public id!: string;
  public submission_id!: string;
  public job_id!: string;
  public candidate_id!: string;
  public submitted_by!: string;
  public status!:
    | "new_candidate"
    | "initial_scanning"
    | "first_round"
    | "technical_round"
    | "final_round"
    | "hired"
    | "rejected"
    | "sourcing"
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "interview_scheduled"
    | "interviewed"
    | "offered";
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
    submission_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
        "new_candidate",
        "initial_scanning",
        "first_round",
        "technical_round",
        "final_round",
        "hired",
        "rejected",
        "sourcing",
        "submitted",
        "under_review",
        "shortlisted",
        "interview_scheduled",
        "interviewed",
        "offered"
      ),
      allowNull: false,
      defaultValue: "new_candidate",
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
    hooks: {
      beforeCreate: async (submission: Submission) => {
        if (!submission.submission_id) {
          const lastSubmission = await Submission.findOne({
            where: {
              submission_id: {
                [Op.like]: `SUB-%`,
              },
            },
            order: [["created_at", "DESC"]],
          });
          let num = 1;
          if (lastSubmission) {
            const parts = lastSubmission.submission_id.split("-");
            num = parseInt(parts[parts.length - 1] || "0") + 1;
          }
          submission.submission_id = `SUB-${String(num).padStart(4, "0")}`;
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["submission_id"],
      },
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
