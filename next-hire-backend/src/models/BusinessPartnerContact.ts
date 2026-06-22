import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { BusinessPartner } from "./BusinessPartner";

export interface BusinessPartnerContactAttributes {
  id: string;
  business_partner_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  comments?: string;
  is_primary: boolean;
  created_by: string; // User ID
  created_at?: Date;
  updated_at?: Date;
}

export interface BusinessPartnerContactCreationAttributes
  extends Optional<
    BusinessPartnerContactAttributes,
    "id" | "is_primary" | "created_at" | "updated_at"
  > {}

export class BusinessPartnerContact
  extends Model<BusinessPartnerContactAttributes, BusinessPartnerContactCreationAttributes>
  implements BusinessPartnerContactAttributes
{
  public id!: string;
  public business_partner_id!: string;
  public name!: string;
  public title?: string;
  public email?: string;
  public phone?: string;
  public comments?: string;
  public is_primary!: boolean;
  public created_by!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public businessPartner?: BusinessPartner;
}

BusinessPartnerContact.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_partner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BusinessPartner,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "BusinessPartnerContact",
    tableName: "business_partner_contacts",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["business_partner_id"],
      },
    ],
  }
);
