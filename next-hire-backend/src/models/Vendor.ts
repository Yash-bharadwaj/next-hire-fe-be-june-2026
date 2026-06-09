import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface VendorAttributes {
  id: string;
  user_id: string;
  company_name?: string;
  company_website?: string;
  contact_person_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  specializations?: string[]; // Array of specialization areas
  years_in_business?: number;
  bio?: string;
  status: "pending" | "approved" | "suspended";
  created_at?: Date;
  updated_at?: Date;
}

export interface VendorCreationAttributes
  extends Optional<
    VendorAttributes,
    "id" | "status" | "created_at" | "updated_at"
  > {}

export class Vendor
  extends Model<VendorAttributes, VendorCreationAttributes>
  implements VendorAttributes
{
  public id!: string;
  public user_id!: string;
  public company_name?: string;
  public company_website?: string;
  public contact_person_name?: string;
  public phone?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public specializations?: string[];
  public years_in_business?: number;
  public bio?: string;
  public status!: "pending" | "approved" | "suspended";

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public user?: User;
}

Vendor.init(
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
    contact_person_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
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
    },
    specializations: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const value = this.getDataValue("specializations") as unknown as string;
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue(
          "specializations",
          JSON.stringify(value || []) as any
        );
      },
    },
    years_in_business: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "suspended"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Vendor",
    tableName: "vendors",
    indexes: [
      {
        unique: true,
        fields: ["user_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["company_name"],
      },
    ],
  }
);
