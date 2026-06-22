import { DataTypes, Model, Optional, Op } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { jsonArrayColumn } from "../utils/sequelizeFields";

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
  bill_rate_min?: number;
  bill_rate_max?: number;
  experience_min?: number;
  experience_max?: number;
  required_skills: string[]; // Array of required skills
  preferred_skills?: string[]; // Array of preferred skills
  education_requirements?: string;
  work_schedule?: "day_shift" | "night_shift" | "rotating_shift" | "flexible";
  // AI-estimated market pay/bill rate range (see aiPayRateService) - kept
  // separate from the recruiter-entered salary_min/max / bill_rate_min/max,
  // which are what's actually posted for the role.
  ai_estimated_pay_min?: number;
  ai_estimated_pay_max?: number;
  ai_estimated_pay_currency?: string;
  ai_estimated_pay_basis?: "hourly" | "annual";
  ai_estimated_pay_rationale?: string;
  ai_estimated_pay_at?: Date;
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
  assigned_to?: string; // User ID of recruiter assigned to this job (shown as "Assigned To" in the header)
  business_partner_id?: string; // Client (BusinessPartner with is_client=true) this job is for
  client_contact_id?: string; // Contact at the client (BusinessPartnerContact)
  primary_recruiter_id?: string; // User ID of the recruiter who owns sourcing for this job
  account_manager_id?: string; // User ID of the account manager who owns the client relationship
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
  public bill_rate_min?: number;
  public bill_rate_max?: number;
  public experience_min?: number;
  public experience_max?: number;
  public required_skills!: string[];
  public preferred_skills?: string[];
  public education_requirements?: string;
  public work_schedule?: "day_shift" | "night_shift" | "rotating_shift" | "flexible";
  public ai_estimated_pay_min?: number;
  public ai_estimated_pay_max?: number;
  public ai_estimated_pay_currency?: string;
  public ai_estimated_pay_basis?: "hourly" | "annual";
  public ai_estimated_pay_rationale?: string;
  public ai_estimated_pay_at?: Date;
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
  public business_partner_id?: string;
  public client_contact_id?: string;
  public primary_recruiter_id?: string;
  public account_manager_id?: string;

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
      allowNull: true,
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
    bill_rate_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    bill_rate_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
    required_skills: jsonArrayColumn("required_skills", { allowNull: false }),
    preferred_skills: jsonArrayColumn("preferred_skills"),
    education_requirements: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    work_schedule: {
      type: DataTypes.ENUM("day_shift", "night_shift", "rotating_shift", "flexible"),
      allowNull: true,
    },
    ai_estimated_pay_min: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ai_estimated_pay_max: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    ai_estimated_pay_currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ai_estimated_pay_basis: {
      type: DataTypes.ENUM("hourly", "annual"),
      allowNull: true,
    },
    ai_estimated_pay_rationale: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_estimated_pay_at: {
      type: DataTypes.DATE,
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
    notes_history: jsonArrayColumn("notes_history"),
    attachments: jsonArrayColumn("attachments"),
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
    business_partner_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "business_partners",
        key: "id",
      },
    },
    client_contact_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "business_partner_contacts",
        key: "id",
      },
    },
    primary_recruiter_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    account_manager_id: {
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
            order: [["job_id", "DESC"]],
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
      {
        fields: ["business_partner_id"],
      },
      {
        fields: ["client_contact_id"],
      },
      {
        fields: ["primary_recruiter_id"],
      },
      {
        fields: ["account_manager_id"],
      },
    ],
  }
);
