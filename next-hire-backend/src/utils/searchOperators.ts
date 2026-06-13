import { Op } from "sequelize";
import { sequelize } from "../config/database";

// SQLite has no ILIKE operator (it errors with a syntax error), and its
// default LIKE is already case-insensitive for ASCII. Postgres needs
// ILIKE for case-insensitive matching. Pick the right operator per dialect
// so search filters work in both dev (SQLite) and production (Postgres).
export const likeOp =
  sequelize.getDialect() === "postgres" ? Op.iLike : Op.like;
