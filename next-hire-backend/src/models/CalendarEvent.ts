import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export type CalendarEventType = "interview" | "meeting" | "screening" | "call" | "deadline" | "other";
export type CalendarEventStatus = "confirmed" | "pending" | "completed";
export type CalendarEventTaskType = "my-task" | "follow-up";

export interface CalendarEventAttributes {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  event_type: CalendarEventType;
  status: CalendarEventStatus;
  task_type: CalendarEventTaskType;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CalendarEventCreationAttributes
  extends Optional<
    CalendarEventAttributes,
    "id" | "event_type" | "status" | "task_type" | "created_at" | "updated_at"
  > {}

export class CalendarEvent
  extends Model<CalendarEventAttributes, CalendarEventCreationAttributes>
  implements CalendarEventAttributes
{
  public id!: string;
  public title!: string;
  public description?: string;
  public date!: string;
  public start_time!: string;
  public end_time!: string;
  public event_type!: CalendarEventType;
  public status!: CalendarEventStatus;
  public task_type!: CalendarEventTaskType;
  public created_by!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public creator?: User;
}

CalendarEvent.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.ENUM("interview", "meeting", "screening", "call", "deadline", "other"),
      allowNull: false,
      defaultValue: "other",
    },
    status: {
      type: DataTypes.ENUM("confirmed", "pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    task_type: {
      type: DataTypes.ENUM("my-task", "follow-up"),
      allowNull: false,
      defaultValue: "my-task",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "CalendarEvent",
    tableName: "calendar_events",
    indexes: [
      { fields: ["created_by"] },
      { fields: ["date"] },
    ],
  }
);
