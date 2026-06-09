import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Candidate } from "./Candidate";

export interface EducationAttributes {
  id: string;
  candidate_id: string;
  institution_name: string;
  degree: string;
  field_of_study?: string;
  start_date: Date;
  end_date?: Date; // null if currently studying
  is_current: boolean;
  grade?: string; // GPA, percentage, etc.
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EducationCreationAttributes
  extends Optional<EducationAttributes, "id" | "created_at" | "updated_at"> {}

export class Education
  extends Model<EducationAttributes, EducationCreationAttributes>
  implements EducationAttributes
{
  public id!: string;
  public candidate_id!: string;
  public institution_name!: string;
  public degree!: string;
  public field_of_study?: string;
  public start_date!: Date;
  public end_date?: Date;
  public is_current!: boolean;
  public grade?: string;
  public description?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public candidate?: Candidate;
}

Education.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    field_of_study: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Education",
    tableName: "education",
    indexes: [
      {
        fields: ["candidate_id"],
      },
      {
        fields: ["start_date"],
      },
      {
        fields: ["is_current"],
      },
    ],
  }
);
