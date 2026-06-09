import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface RecruiterAttributes {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  company_website?: string;
  job_title?: string;
  department?: string;
  bio?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RecruiterCreationAttributes
  extends Optional<RecruiterAttributes, "id" | "created_at" | "updated_at"> {}

export class Recruiter
  extends Model<RecruiterAttributes, RecruiterCreationAttributes>
  implements RecruiterAttributes
{
  public id!: string;
  public user_id!: string;
  public first_name?: string;
  public last_name?: string;
  public phone?: string;
  public company_name?: string;
  public company_website?: string;
  public job_title?: string;
  public department?: string;
  public bio?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public user?: User;
}

Recruiter.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Recruiter",
    tableName: "recruiters",
    indexes: [
      {
        unique: true,
        fields: ["user_id"],
      },
      {
        fields: ["company_name"],
      },
    ],
  }
);
