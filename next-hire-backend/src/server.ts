import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { sequelize, applyAssociations } from "./models";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import {
  ensureCandidateCreatedByColumn,
  ensureJobAndSubmissionJsonColumns,
  ensureCandidateSkillsSchema,
  ensureSubmissionsSchema,
  ensureUserProfileImageColumn,
  ensureEmbeddingColumns,
  ensurePgVectorSupport,
} from "./utils/schemaPatcher";

// Routes
import authRoutes from "./routes/auth";
import candidateRoutes from "./routes/candidate";
import recruiterRoutes from "./routes/recruiter";
import vendorRoutes from "./routes/vendor";
import jobRoutes from "./routes/jobs";
import submissionRoutes from "./routes/submissions";
import experienceRoutes from "./routes/experience";
import skillsRoutes from "./routes/skills";
import candidateSearchRoutes from "./routes/candidateSearch";
import interviewRoutes from "./routes/interviews";
import placementRoutes from "./routes/placements";
import businessPartnerRoutes from "./routes/businessPartners";
import dashboardRoutes from "./routes/dashboard";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const API_VERSION = process.env.API_VERSION || "v1";

// Trust the App Runner load balancer's X-Forwarded-For header so req.ip is
// the real client IP. Without this, every request appears to come from the
// load balancer's address, so express-rate-limit pools ALL users into a
// single shared bucket - exhausting it quickly and causing spurious
// "Too many requests" errors (e.g. on login) for unrelated users.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || "100"), // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? (origin, callback) => {
            // Allow server-to-server / health-check requests with no Origin header,
            // any Amplify-hosted frontend (*.amplifyapp.com), and an optional
            // explicit FRONTEND_URL override (e.g. for a future custom domain).
            if (
              !origin ||
              /\.amplifyapp\.com$/.test(origin) ||
              origin === process.env.FRONTEND_URL
            ) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          }
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
          ],
    credentials: true,
  })
);
app.use(compression() as any);
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(limiter);

// Serve uploaded files (avatars, resumes, etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/candidate`, candidateRoutes);
app.use(`/api/${API_VERSION}/recruiter`, recruiterRoutes);
app.use(`/api/${API_VERSION}/vendor`, vendorRoutes);
app.use(`/api/${API_VERSION}/jobs`, jobRoutes);
app.use(`/api/${API_VERSION}/submissions`, submissionRoutes);
app.use(`/api/${API_VERSION}/experience`, experienceRoutes);
app.use(`/api/${API_VERSION}/skills`, skillsRoutes);
app.use(`/api/${API_VERSION}/candidate-search`, candidateSearchRoutes);
app.use(`/api/${API_VERSION}/interviews`, interviewRoutes);
app.use(`/api/${API_VERSION}/placements`, placementRoutes);
app.use(`/api/${API_VERSION}/business-partners`, businessPartnerRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await ensureCandidateCreatedByColumn();
    await ensureJobAndSubmissionJsonColumns();
    await ensureCandidateSkillsSchema();
    await ensureSubmissionsSchema();
    await ensureUserProfileImageColumn();
    await ensureEmbeddingColumns();
    applyAssociations();
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");

    // Sync database schema (no migration framework is in use yet, so this
    // also runs in production to keep tables up to date on every deploy).
    try {
      // Use alter: true to preserve existing data while updating schema
      // IMPORTANT: Do NOT use force: true as it drops all tables and data!
      await sequelize.sync({ alter: true });
      logger.info("Database synchronized successfully.");

      // No-op on SQLite; on Postgres enables pgvector + similarity indexes.
      await ensurePgVectorSupport();
    } catch (syncError) {
      logger.error("Database sync failed:", syncError);
      logger.warn(
        "Database sync failed. If you need to recreate the database, run: npm run db:reset"
      );
      // Don't automatically drop the database - user data is important!
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Version: ${API_VERSION}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

startServer();

export default app;
