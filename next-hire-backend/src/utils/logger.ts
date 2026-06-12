import winston from "winston";
import path from "path";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "next-hire-backend" },
  transports: isProduction
    ? [
        // In production (App Runner), the filesystem is ephemeral and not
        // accessible - log to stdout/stderr so CloudWatch captures it.
        new winston.transports.Console(),
      ]
    : [
        new winston.transports.File({
          filename: path.join(process.cwd(), "logs", "error.log"),
          level: "error",
        }),
        new winston.transports.File({
          filename: path.join(process.cwd(), "logs", "combined.log"),
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
});

export { logger };
