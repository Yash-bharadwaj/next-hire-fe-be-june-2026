import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

// Use PostgreSQL (e.g. the AWS RDS instance) whenever DB_HOST is configured,
// SQLite otherwise. This lets local dev point at the same Postgres database
// as production without flipping NODE_ENV (which also gates CORS/logging).
const usePostgres = !!process.env.DB_HOST;

const sequelize = new Sequelize(
  usePostgres
    ? {
        // PostgreSQL configuration (RDS)
        database: process.env.DB_NAME!,
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
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
    : {
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
);

export { sequelize };
