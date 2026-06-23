import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Job } from "./Job";

// Free-form team roster for a job, beyond the 4 fixed singular roles already
// on Job (created_by/assigned_to/primary_recruiter_id/account_manager_id).
// Lets multiple people of any role (sourcers, coordinators, a second
// recruiter, etc.) be added to or removed from a job's team.
export type JobTeamMemberRole =
  | "recruiter"
  | "sourcer"
  | "account_manager"
  | "coordinator"
  | "other";

export interface JobTeamMemberAttributes {
  id: string;
  job_id: string;
  user_id: string;
  role: JobTeamMemberRole;
  added_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface JobTeamMemberCreationAttributes
  extends Optional<JobTeamMemberAttributes, "id" | "role" | "created_at" | "updated_at"> {}

export class JobTeamMember
  extends Model<JobTeamMemberAttributes, JobTeamMemberCreationAttributes>
  implements JobTeamMemberAttributes
{
  public id!: string;
  public job_id!: string;
  public user_id!: string;
  public role!: JobTeamMemberRole;
  public added_by!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public member?: User;
  public addedBy?: User;
}

JobTeamMember.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    role: {
      type: DataTypes.ENUM("recruiter", "sourcer", "account_manager", "coordinator", "other"),
      allowNull: false,
      defaultValue: "other",
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "JobTeamMember",
    tableName: "job_team_members",
    indexes: [
      { fields: ["job_id"] },
      { unique: true, fields: ["job_id", "user_id"] },
    ],
  }
);
