import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Submission } from "./Submission";

export interface InterviewAttributes {
  id: string;
  submission_id: string;
  interviewer_id: string;
  interview_type: "phone" | "video" | "in_person" | "technical" | "behavioral";
  scheduled_at: Date;
  duration_minutes: number;
  location?: string; // Physical location
  meeting_link?: string; // Video meeting link
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  notes?: string;
  rating?: number; // 1-5 rating
  feedback?: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface InterviewCreationAttributes
  extends Optional<
    InterviewAttributes,
    "id" | "status" | "duration_minutes" | "created_at" | "updated_at"
  > {}

export class Interview
  extends Model<InterviewAttributes, InterviewCreationAttributes>
  implements InterviewAttributes
{
  public id!: string;
  public submission_id!: string;
  public interviewer_id!: string;
  public interview_type!: "phone" | "video" | "in_person" | "technical" | "behavioral";
  public scheduled_at!: Date;
  public duration_minutes!: number;
  public location?: string;
  public meeting_link?: string;
  public status!: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  public notes?: string;
  public rating?: number;
  public feedback?: string;
  public created_by!: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public submission?: Submission;
  public interviewer?: User;
  public creator?: User;
}

Interview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Submission,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    interviewer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    interview_type: {
      type: DataTypes.ENUM("phone", "video", "in_person", "technical", "behavioral"),
      allowNull: false,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: 15,
        max: 480, // 8 hours max
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "in_progress", "completed", "cancelled", "no_show"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
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
    modelName: "Interview",
    tableName: "interviews",
    indexes: [
      {
        fields: ["submission_id"],
      },
      {
        fields: ["interviewer_id"],
      },
      {
        fields: ["scheduled_at"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["created_by"],
      },
    ],
  }
);
