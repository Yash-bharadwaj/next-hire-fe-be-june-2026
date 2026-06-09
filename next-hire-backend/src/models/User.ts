import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: "candidate" | "recruiter" | "vendor" | "admin";
  status: "active" | "inactive" | "suspended";
  email_verified: boolean;
  email_verified_at?: Date;
  otp?: string;
  otp_expires_at?: Date;
  reset_token?: string;
  reset_token_expires_at?: Date;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "status" | "email_verified" | "created_at" | "updated_at"
  > {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public email!: string;
  public password!: string;
  public role!: "candidate" | "recruiter" | "vendor" | "admin";
  public status!: "active" | "inactive" | "suspended";
  public email_verified!: boolean;
  public email_verified_at?: Date;
  public otp?: string;
  public otp_expires_at?: Date;
  public reset_token?: string;
  public reset_token_expires_at?: Date;
  public last_login_at?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public candidate?: any;
  public recruiter?: any;
  public vendor?: any;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 255],
      },
    },
    role: {
      type: DataTypes.ENUM("candidate", "recruiter", "vendor", "admin"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "suspended"),
      allowNull: false,
      defaultValue: "inactive",
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);
