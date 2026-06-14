import { DataTypes } from "sequelize";
import { sequelize } from "../models";
import { logger } from "./logger";
import { EMBEDDING_DIMENSIONS } from "../services/aiParsingService";

/**
 * Lightweight, idempotent schema guards for environments that already have data.
 * SQLite cannot alter tables in-place when duplicate values violate constraints,
 * so we add/patch columns manually before Sequelize sync runs.
 */
export const ensureCandidateCreatedByColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables: string[] = await queryInterface.showAllTables();
    if (!tables.includes("candidates")) {
      logger.warn('Skipping ensureCandidateCreatedByColumn: "candidates" table not found yet.');
      return;
    }

    const tableDefinition = await queryInterface.describeTable("candidates");

    if (tableDefinition.created_by) {
      return; // Column already exists
    }

    logger.info("Adding candidates.created_by column (vendor support)");

    await queryInterface.addColumn("candidates", "created_by", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    // Backfill existing records so legacy candidate accounts continue to work
    await queryInterface.sequelize.query(
      "UPDATE candidates SET created_by = user_id WHERE created_by IS NULL"
    );

    logger.info("candidates.created_by column created and backfilled");
  } catch (error) {
    logger.error("ensureCandidateCreatedByColumn failed", error);
    throw error;
  }
};

/**
 * Ensure JSON/text columns exist for jobs and submissions (notes/attachments).
 * Designed to be idempotent and safe for SQLite.
 */
export const ensureJobAndSubmissionJsonColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();

  const ensureColumn = async (
    table: string,
    column: string,
    type: any,
    defaultValue: any
  ) => {
    const tables: string[] = await queryInterface.showAllTables();
    if (!tables.includes(table)) {
      logger.warn(`Skipping column check: table "${table}" not found yet.`);
      return;
    }

    const tableDefinition = await queryInterface.describeTable(table);
    if (tableDefinition[column]) return;
    logger.info(`Adding ${table}.${column} column`);
    await queryInterface.addColumn(table, column, {
      type,
      allowNull: true,
      defaultValue,
    });
    logger.info(`Added ${table}.${column}`);
  };

  try {
    await ensureColumn("jobs", "notes_history", DataTypes.TEXT, "[]");
    await ensureColumn("jobs", "attachments", DataTypes.TEXT, "[]");
    await ensureColumn("submissions", "notes_history", DataTypes.TEXT, "[]");
    await ensureColumn("submissions", "attachments", DataTypes.TEXT, "[]");
  } catch (error) {
    logger.error("ensureJobAndSubmissionJsonColumns failed", error);
    throw error;
  }
};

/**
 * Ensure candidate_skills schema/indexes are correct.
 * If we detect a legacy unique index on candidate_id (SQLite autoindex), rebuild the table
 * without that constraint and add the intended composite unique index (candidate_id, skill_name).
 */
export const ensureCandidateSkillsSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    const tables: string[] = await queryInterface.showAllTables();
    if (!tables.includes("candidate_skills")) {
      logger.warn('Skipping ensureCandidateSkillsSchema: "candidate_skills" table not found yet.');
      return;
    }

    const indexes = (await queryInterface.showIndex("candidate_skills")) as any[];
    const hasBadUnique = indexes.some((idx: any) => {
      const fields = idx.fields?.map((f: any) => f.attribute || f.column) || [];
      return (
        idx.unique &&
        fields.length === 1 &&
        fields[0] === "candidate_id" &&
        String(idx.name || "").startsWith("sqlite_autoindex")
      );
    });

    // Rebuild table if there is an immutable autoindex on candidate_id
    if (hasBadUnique) {
      logger.warn(
        "Rebuilding candidate_skills to remove legacy unique constraint on candidate_id"
      );
      await sequelize.query("PRAGMA foreign_keys=OFF;");
      await sequelize.query(
        "CREATE TABLE IF NOT EXISTS candidate_skills_backup AS SELECT * FROM candidate_skills;"
      );

      await queryInterface.dropTable("candidate_skills");

      await queryInterface.createTable("candidate_skills", {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        candidate_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "candidates",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        skill_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        category: {
          type: DataTypes.ENUM(
            "technical",
            "soft",
            "language",
            "certification",
            "other"
          ),
          allowNull: false,
          defaultValue: "technical",
        },
        proficiency_level: {
          type: DataTypes.ENUM("beginner", "intermediate", "advanced", "expert"),
          allowNull: false,
          defaultValue: "intermediate",
        },
        years_of_experience: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        is_primary: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        endorsements: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      });

      await queryInterface.addIndex("candidate_skills", ["candidate_id"]);
      await queryInterface.addIndex(
        "candidate_skills",
        ["candidate_id", "skill_name"],
        {
          unique: true,
          name: "candidate_skills_candidate_id_skill_name",
        }
      );

      await sequelize.query(
        "INSERT OR IGNORE INTO candidate_skills (id,candidate_id,skill_name,category,proficiency_level,years_of_experience,is_primary,endorsements,created_at,updated_at) SELECT id,candidate_id,skill_name,category,proficiency_level,years_of_experience,is_primary,endorsements,created_at,updated_at FROM candidate_skills_backup;"
      );
      await sequelize.query("DROP TABLE IF EXISTS candidate_skills_backup;");
      await sequelize.query("PRAGMA foreign_keys=ON;");
      logger.info("candidate_skills table rebuilt without legacy unique constraint");
      return;
    }

    // Ensure composite unique index exists (idempotent)
    const hasComposite = indexes.some((idx: any) => {
      const fields = idx.fields?.map((f: any) => f.attribute || f.column) || [];
      return (
        idx.unique &&
        fields.length === 2 &&
        fields.includes("candidate_id") &&
        fields.includes("skill_name")
      );
    });

    if (!hasComposite) {
      logger.info("Adding composite unique index on candidate_skills (candidate_id, skill_name)");
      await queryInterface.addIndex("candidate_skills", ["candidate_id", "skill_name"], {
        unique: true,
        name: "candidate_skills_candidate_id_skill_name",
      });
    }
  } catch (error) {
    logger.error("ensureCandidateSkillsSchema failed", error);
    throw error;
  }
};

/**
 * On Postgres, enable pgvector and add a shadow `embedding_vector` column +
 * HNSW cosine index on candidates/jobs for fast similarity search. The
 * portable `embedding` TEXT (JSON) column is created by sequelize.sync and
 * is the source of truth on SQLite; this is purely additive and idempotent.
 * No-op on SQLite (dev), where matching falls back to in-memory cosine similarity.
 */
export const ensurePgVectorSupport = async () => {
  if (sequelize.getDialect() !== "postgres") return;

  try {
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector");

    for (const table of ["candidates", "jobs"]) {
      await sequelize.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS embedding_vector vector(${EMBEDDING_DIMENSIONS})`
      );
      await sequelize.query(
        `CREATE INDEX IF NOT EXISTS ${table}_embedding_idx ON ${table} USING hnsw (embedding_vector vector_cosine_ops)`
      );
    }

    logger.info("pgvector extension, embedding_vector columns, and HNSW indexes are ready");
  } catch (error) {
    logger.error("ensurePgVectorSupport failed", error);
  }
};

/**
 * Ensure candidates.embedding / jobs.embedding (JSON-encoded number[] vector)
 * exist. Portable across SQLite/Postgres - the Postgres-only shadow
 * `embedding_vector` column is handled separately by ensurePgVectorSupport.
 */
export const ensureEmbeddingColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables: string[] = await queryInterface.showAllTables();

    for (const table of ["candidates", "jobs"]) {
      if (!tables.includes(table)) {
        logger.warn(`Skipping ensureEmbeddingColumns: "${table}" table not found yet.`);
        continue;
      }

      const tableDefinition = await queryInterface.describeTable(table);
      if (tableDefinition.embedding) continue;

      logger.info(`Adding ${table}.embedding column (vector embedding for semantic matching)`);
      await queryInterface.addColumn(table, "embedding", {
        type: DataTypes.TEXT,
        allowNull: true,
      });
    }
  } catch (error) {
    logger.error("ensureEmbeddingColumns failed", error);
    throw error;
  }
};

/**
 * Ensure users.profile_image_url exists (profile photo uploads, all roles).
 */
export const ensureUserProfileImageColumn = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables: string[] = await queryInterface.showAllTables();
    if (!tables.includes("users")) {
      logger.warn('Skipping ensureUserProfileImageColumn: "users" table not found yet.');
      return;
    }

    const tableDefinition = await queryInterface.describeTable("users");
    if (tableDefinition.profile_image_url) {
      return; // Column already exists
    }

    logger.info("Adding users.profile_image_url column (profile photo upload)");
    await queryInterface.addColumn("users", "profile_image_url", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  } catch (error) {
    logger.error("ensureUserProfileImageColumn failed", error);
    throw error;
  }
};

/**
 * Ensure submissions schema/indexes are correct.
 * Some legacy schemas created immutable autoindexes on job_id and candidate_id individually,
 * which block multiple applications per candidate across different jobs.
 *
 * We detect this and rebuild the table while preserving existing data.
 */
export const ensureSubmissionsSchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    const tables: string[] = await queryInterface.showAllTables();
    if (!tables.includes("submissions")) {
      logger.warn('Skipping ensureSubmissionsSchema: "submissions" table not found yet.');
      return;
    }

    const indexes = (await queryInterface.showIndex("submissions")) as any[];

    const hasBadAutoIndex = indexes.some((idx: any) => {
      const name = String(idx.name || "");
      const fields = idx.fields?.map((f: any) => f.attribute || f.column) || [];
      // Detect legacy unique indexes on job_id or candidate_id only
      return (
        idx.unique &&
        name.startsWith("sqlite_autoindex_submissions_") &&
        fields.length === 1 &&
        (fields[0] === "job_id" || fields[0] === "candidate_id")
      );
    });

    if (!hasBadAutoIndex) {
      return;
    }

    logger.warn(
      "Rebuilding submissions to remove legacy unique constraints on job_id/candidate_id"
    );

    await sequelize.query("PRAGMA foreign_keys=OFF;");

    // Backup existing data
    await sequelize.query(
      "CREATE TABLE IF NOT EXISTS submissions_backup AS SELECT * FROM submissions;"
    );

    // Drop and recreate table via Sequelize model definition
    await queryInterface.dropTable("submissions");

    await queryInterface.createTable("submissions", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      candidate_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "candidates",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      submitted_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM(
          "submitted",
          "under_review",
          "shortlisted",
          "interview_scheduled",
          "interviewed",
          "offered",
          "hired",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "submitted",
      },
      ai_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cover_letter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resume_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expected_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      availability_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      attachments: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "[]",
      },
      notes_history: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "[]",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    // Re-add intended indexes
    await queryInterface.addIndex("submissions", ["job_id", "candidate_id"], {
      unique: true,
      name: "submissions_job_id_candidate_id",
    });
    await queryInterface.addIndex("submissions", ["status"]);
    await queryInterface.addIndex("submissions", ["submitted_by"]);
    await queryInterface.addIndex("submissions", ["ai_score"]);
    await queryInterface.addIndex("submissions", ["submitted_at"]);

    // Restore data, ignoring duplicates that violate the new composite unique constraint
    await sequelize.query(
      "INSERT OR IGNORE INTO submissions (id,job_id,candidate_id,submitted_by,status,ai_score,notes,cover_letter,resume_url,expected_salary,availability_date,submitted_at,reviewed_at,reviewed_by,attachments,notes_history,created_at,updated_at) SELECT id,job_id,candidate_id,submitted_by,status,ai_score,notes,cover_letter,resume_url,expected_salary,availability_date,submitted_at,reviewed_at,reviewed_by,attachments,notes_history,created_at,updated_at FROM submissions_backup;"
    );

    await sequelize.query("DROP TABLE IF EXISTS submissions_backup;");
    await sequelize.query("PRAGMA foreign_keys=ON;");
    logger.info("submissions table rebuilt without legacy unique constraints");
  } catch (error) {
    logger.error("ensureSubmissionsSchema failed", error);
    throw error;
  }
};

