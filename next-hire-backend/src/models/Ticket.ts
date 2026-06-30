import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface TicketAttributes {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  reporter_id: string;
  assignee_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TicketCreationAttributes
  extends Optional<TicketAttributes, "id" | "status" | "priority" | "assignee_id" | "created_at" | "updated_at"> {}

export class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: string;
  public ticket_number!: string;
  public title!: string;
  public description!: string;
  public status!: TicketStatus;
  public priority!: TicketPriority;
  public category!: string;
  public reporter_id!: string;
  public assignee_id?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public reporter?: User;
  public assignee?: User;
}

Ticket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticket_number: {
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
    status: {
      type: DataTypes.ENUM("open", "in-progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    assignee_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    indexes: [
      { fields: ["reporter_id"] },
      { fields: ["assignee_id"] },
      { fields: ["status"] },
    ],
  }
);
