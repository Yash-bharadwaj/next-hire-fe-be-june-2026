import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Candidate } from "./Candidate";

export interface CandidateResumeAttributes {
  id: string;
  candidate_id: string;
  file_url: string;
  file_name: string;
  is_primary: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CandidateResumeCreationAttributes
  extends Optional<CandidateResumeAttributes, "id" | "is_primary" | "created_at" | "updated_at"> {}

export class CandidateResume
  extends Model<CandidateResumeAttributes, CandidateResumeCreationAttributes>
  implements CandidateResumeAttributes
{
  public id!: string;
  public candidate_id!: string;
  public file_url!: string;
  public file_name!: string;
  public is_primary!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public candidate?: Candidate;
}

CandidateResume.init(
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
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "CandidateResume",
    tableName: "candidate_resumes",
    indexes: [
      {
        fields: ["candidate_id"],
      },
    ],
  }
);
