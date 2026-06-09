import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

// Use SQLite for local development, PostgreSQL for production
const isDevelopment = process.env.NODE_ENV !== "production";

const sequelize = new Sequelize(
  isDevelopment
    ? {
        // SQLite configuration for local development
        dialect: "sqlite",
        storage: "./database.sqlite",
        logging: (msg) => logger.debug(msg),
        define: {
          timestamps: true,
          underscored: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      }
    : {
        // PostgreSQL configuration for production
        database: process.env.DB_NAME!,
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          underscored: true,
          createdAt: "created_at",
          updatedAt: "updated_at",
        },
      }
);

export { sequelize };
