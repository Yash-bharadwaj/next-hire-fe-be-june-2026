import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Job } from "./Job";
import { Submission } from "./Submission";

export interface TaskAttributes {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  created_by: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: Date;
  job_id?: string; // Optional link to job
  submission_id?: string; // Optional link to submission
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface TaskCreationAttributes
  extends Optional<
    TaskAttributes,
    "id" | "priority" | "status" | "created_at" | "updated_at"
  > {}

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: string;
  public title!: string;
  public description?: string;
  public assigned_to!: string;
  public created_by!: string;
  public priority!: "low" | "medium" | "high";
  public status!: "pending" | "in_progress" | "completed" | "cancelled";
  public due_date?: Date;
  public job_id?: string;
  public submission_id?: string;
  public completed_at?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public assignee?: User;
  public creator?: User;
  public job?: Job;
  public submission?: Submission;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      allowNull: true,
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
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
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Job,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Submission,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    hooks: {
      beforeUpdate: (task: Task) => {
        if (task.status === "completed" && !task.completed_at) {
          task.completed_at = new Date();
        }
        if (task.status !== "completed" && task.completed_at) {
          task.completed_at = null as any;
        }
      },
    },
    indexes: [
      {
        fields: ["assigned_to"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["priority"],
      },
      {
        fields: ["due_date"],
      },
      {
        fields: ["job_id"],
      },
      {
        fields: ["submission_id"],
      },
    ],
  }
);
