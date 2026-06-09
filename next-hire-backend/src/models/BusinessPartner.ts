import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface BusinessPartnerAttributes {
  id: string;
  business_partner_number: string; // BP001, BP002, etc.
  business_partner_guid: string;
  
  // Partner types
  is_lead: boolean;
  is_client: boolean;
  is_vendor: boolean;
  
  // Company information
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  geocode?: string; // lat,lng
  tax_id?: string;
  
  // Contact information
  primary_email?: string;
  primary_phone?: string;
  website?: string;
  domain?: string;
  
  // Business details
  industry?: string;
  company_size?: "startup" | "small" | "medium" | "large" | "enterprise";
  annual_revenue?: number;
  
  // Relationship details
  source: "referral" | "website" | "cold_call" | "trade_show" | "linkedin" | "email_campaign" | "other";
  status: "active" | "prospect" | "inactive" | "on_hold";
  priority: "low" | "medium" | "high";
  
  // Metadata
  logo_url?: string;
  notes?: string;
  tags?: string; // JSON array as string for SQLite
  
  // Tracking
  created_by: string; // User ID
  assigned_to?: string; // User ID of account manager
  last_activity_at?: Date;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface BusinessPartnerCreationAttributes
  extends Optional<
    BusinessPartnerAttributes,
    | "id"
    | "business_partner_number"
    | "business_partner_guid"
    | "created_at"
    | "updated_at"
  > {}

export class BusinessPartner
  extends Model<BusinessPartnerAttributes, BusinessPartnerCreationAttributes>
  implements BusinessPartnerAttributes
{
  public id!: string;
  public business_partner_number!: string;
  public business_partner_guid!: string;
  
  public is_lead!: boolean;
  public is_client!: boolean;
  public is_vendor!: boolean;
  
  public name!: string;
  public address1?: string;
  public address2?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public postal_code?: string;
  public geocode?: string;
  public tax_id?: string;
  
  public primary_email?: string;
  public primary_phone?: string;
  public website?: string;
  public domain?: string;
  
  public industry?: string;
  public company_size?: "startup" | "small" | "medium" | "large" | "enterprise";
  public annual_revenue?: number;
  
  public source!: "referral" | "website" | "cold_call" | "trade_show" | "linkedin" | "email_campaign" | "other";
  public status!: "active" | "prospect" | "inactive" | "on_hold";
  public priority!: "low" | "medium" | "high";
  
  public logo_url?: string;
  public notes?: string;
  public tags?: string;
  
  public created_by!: string;
  public assigned_to?: string;
  public last_activity_at?: Date;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public creator?: User;
  public assignee?: User;

  // Custom getters for JSON fields
  public get tagsArray(): string[] {
    if (!this.tags) return [];
    try {
      return JSON.parse(this.tags);
    } catch {
      return [];
    }
  }

  public set tagsArray(value: string[]) {
    this.tags = JSON.stringify(value);
  }
}

BusinessPartner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    business_partner_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    business_partner_guid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    is_lead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_vendor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address2: {
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
      defaultValue: "United States",
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    geocode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tax_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    primary_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company_size: {
      type: DataTypes.ENUM("startup", "small", "medium", "large", "enterprise"),
      allowNull: true,
    },
    annual_revenue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("referral", "website", "cold_call", "trade_show", "linkedin", "email_campaign", "other"),
      allowNull: false,
      defaultValue: "other",
    },
    status: {
      type: DataTypes.ENUM("active", "prospect", "inactive", "on_hold"),
      allowNull: false,
      defaultValue: "prospect",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    last_activity_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BusinessPartner",
    tableName: "business_partners",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["business_partner_number"],
      },
      {
        unique: true,
        fields: ["business_partner_guid"],
      },
      {
        fields: ["name"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["is_lead"],
      },
      {
        fields: ["is_client"],
      },
      {
        fields: ["is_vendor"],
      },
      {
        fields: ["created_by"],
      },
      {
        fields: ["assigned_to"],
      },
    ],
  }
);
