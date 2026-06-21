import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// Generic admin-editable key/value settings store (e.g. AI prompt
// templates) - one row per setting key.
export interface AppSettingAttributes {
  id: string;
  key: string;
  value: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AppSettingCreationAttributes
  extends Optional<AppSettingAttributes, "id" | "created_at" | "updated_at"> {}

export class AppSetting
  extends Model<AppSettingAttributes, AppSettingCreationAttributes>
  implements AppSettingAttributes
{
  public id!: string;
  public key!: string;
  public value!: string;
  public updated_by?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AppSetting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
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
    modelName: "AppSetting",
    tableName: "app_settings",
    timestamps: true,
    underscored: true,
  }
);
