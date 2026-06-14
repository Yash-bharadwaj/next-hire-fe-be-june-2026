import { DataTypes, Model, Optional, Op } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface JobAttributes {
  id: string;
  job_id: string; // Human readable job ID like JOB-2024-001
  title: string;
  description: string;
  external_description?: string;
  company_name: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  job_type: "full_time" | "part_time" | "contract" | "temporary";
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  experience_min?: number;
  experience_max?: number;
  required_skills: string[]; // Array of required skills
  preferred_skills?: string[]; // Array of preferred skills
  education_requirements?: string;
  status: "draft" | "active" | "paused" | "closed";
  priority: "low" | "medium" | "high";
  positions_available: number;
  max_submissions_allowed?: number;
  vendor_eligible: boolean; // Whether vendors can submit to this job
  remote_work_allowed: boolean;
  start_date?: Date;
  end_date?: Date;
  application_deadline?: Date;
  created_by: string; // User ID of recruiter who created this job
  assigned_to?: string; // User ID of recruiter assigned to this job
  created_at?: Date;
  updated_at?: Date;
  notes_history?: any;
  attachments?: any;
  embedding?: number[] | null; // Vector embedding for semantic matching
}

export interface JobCreationAttributes
  extends Optional<
    JobAttributes,
    | "id"
    | "job_id"
    | "status"
    | "priority"
    | "positions_available"
    | "vendor_eligible"
    | "remote_work_allowed"
    | "salary_currency"
    | "created_at"
    | "updated_at"
  > {}

export class Job
  extends Model<JobAttributes, JobCreationAttributes>
  implements JobAttributes
{
  public id!: string;
  public job_id!: string;
  public title!: string;
  public description!: string;
  public external_description?: string;
  public company_name!: string;
  public location!: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public job_type!: "full_time" | "part_time" | "contract" | "temporary";
  public salary_min?: number;
  public salary_max?: number;
  public salary_currency!: string;
  public experience_min?: number;
  public experience_max?: number;
  public required_skills!: string[];
  public preferred_skills?: string[];
  public education_requirements?: string;
  public status!: "draft" | "active" | "paused" | "closed";
  public priority!: "low" | "medium" | "high";
  public positions_available!: number;
  public max_submissions_allowed?: number;
  public vendor_eligible!: boolean;
  public remote_work_allowed!: boolean;
  public start_date?: Date;
  public end_date?: Date;
  public application_deadline?: Date;
  public created_by!: string;
  public assigned_to?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public notes_history?: any;
  public attachments?: any;
  public embedding?: number[] | null;

  // Associations
  public creator?: User;
  public assignee?: User;

  // Hide the raw embedding vector from API responses - it's large and only
  // used internally for similarity search.
  public toJSON(): object {
    const values = { ...this.get() } as any;
    delete values.embedding;
    return values;
  }
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    external_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "US",
    },
    job_type: {
      type: DataTypes.ENUM("full_time", "part_time", "contract", "temporary"),
      allowNull: false,
    },
    salary_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    salary_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    salary_currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    experience_min: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50,
      },
    },
    experience_max: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50,
      },
    },
    required_skills: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("required_skills") as unknown as string;
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value: string[]) {
        this.setDataValue(
          "required_skills",
          JSON.stringify(value || []) as any
        );
      },
    },
    preferred_skills: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("preferred_skills") as unknown as string;
        if (!value) return [];
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      },
      set(value: string[]) {
        this.setDataValue(
          "preferred_skills",
          JSON.stringify(value || []) as any
        );
      },
    },
    education_requirements: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "paused", "closed"),
      allowNull: false,
      defaultValue: "draft",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    positions_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    max_submissions_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendor_eligible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    remote_work_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    application_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
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
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Job",
    tableName: "jobs",
    hooks: {
      beforeCreate: async (job: Job) => {
        // Generate job_id if not provided
        if (!job.job_id) {
          const year = new Date().getFullYear();
          // Find the highest job number for this year
          const lastJob = await Job.findOne({
            where: {
              job_id: {
                [Op.like]: `JOB-${year}-%`,
              },
            },
            order: [["created_at", "DESC"]],
          });

          let jobNumber = 1;
          if (lastJob) {
            const lastJobNumber = parseInt(
              lastJob.job_id.split("-")[2] || "0"
            );
            jobNumber = lastJobNumber + 1;
          }

          // Format: JOB-YYYY-XXX (e.g., JOB-2024-001)
          job.job_id = `JOB-${year}-${String(jobNumber).padStart(3, "0")}`;
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["job_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["job_type"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["vendor_eligible"],
      },
      {
        fields: ["location"],
      },
    ],
  }
);
