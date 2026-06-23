import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { Job } from "./Job";

interface RateAndHours {
  rate: number;
  hours: number;
}

export interface JobRevenue {
  billRate: RateAndHours;
  overTime: RateAndHours;
  incentives: { amount: number };
}

export interface JobDirectCost {
  payRate: RateAndHours;
  otPayRate: RateAndHours;
  discount: { amount: number };
  vendorCommission: { amount: number };
}

export interface JobOverheads {
  recruiterCommission: number;
  employeeBenefits: number;
  perDiems: number;
  employerTaxes: number;
}

export interface JobOneTimeCost {
  label: string;
  amount: number;
}

export interface JobProfitabilityAttributes {
  id: string;
  job_id: string;
  revenue: JobRevenue;
  direct_cost: JobDirectCost;
  overheads: JobOverheads;
  one_time_costs: JobOneTimeCost[];
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface JobProfitabilityCreationAttributes
  extends Optional<
    JobProfitabilityAttributes,
    "id" | "revenue" | "direct_cost" | "overheads" | "one_time_costs" | "created_at" | "updated_at"
  > {}

const DEFAULT_REVENUE: JobRevenue = {
  billRate: { rate: 0, hours: 0 },
  overTime: { rate: 0, hours: 0 },
  incentives: { amount: 0 },
};

const DEFAULT_DIRECT_COST: JobDirectCost = {
  payRate: { rate: 0, hours: 0 },
  otPayRate: { rate: 0, hours: 0 },
  discount: { amount: 0 },
  vendorCommission: { amount: 0 },
};

const DEFAULT_OVERHEADS: JobOverheads = {
  recruiterCommission: 0,
  employeeBenefits: 0,
  perDiems: 0,
  employerTaxes: 0,
};

export class JobProfitability
  extends Model<JobProfitabilityAttributes, JobProfitabilityCreationAttributes>
  implements JobProfitabilityAttributes
{
  public id!: string;
  public job_id!: string;
  public revenue!: JobRevenue;
  public direct_cost!: JobDirectCost;
  public overheads!: JobOverheads;
  public one_time_costs!: JobOneTimeCost[];
  public updated_by?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations
  public job?: Job;
}

const jsonField = (columnName: string, defaultValue: any) => ({
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: JSON.stringify(defaultValue),
  get(this: Model) {
    const value = this.getDataValue(columnName) as unknown as string;
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  },
  set(this: Model, value: any) {
    this.setDataValue(columnName, JSON.stringify(value ?? defaultValue) as any);
  },
});

JobProfitability.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: Job,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    revenue: jsonField("revenue", DEFAULT_REVENUE) as any,
    direct_cost: jsonField("direct_cost", DEFAULT_DIRECT_COST) as any,
    overheads: jsonField("overheads", DEFAULT_OVERHEADS) as any,
    one_time_costs: jsonField("one_time_costs", []) as any,
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "JobProfitability",
    tableName: "job_profitability",
    timestamps: true,
    underscored: true,
  }
);
