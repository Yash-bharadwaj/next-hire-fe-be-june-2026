import { Sequelize } from "sequelize";
import { sequelize } from "../config/database";

// Sequelize has no dialect-agnostic "format this column as YYYY-MM" helper,
// so this 3-way branch was copy-pasted wherever a controller needed to
// GROUP BY month. Centralizing it means a 4th dialect (or a syntax fix)
// only needs to change in one place.
export const monthGroupExpr = (columnRef: string) => {
  const dialect = sequelize.getDialect();
  return dialect === "sqlite"
    ? Sequelize.fn("strftime", "%Y-%m", Sequelize.col(columnRef))
    : dialect === "postgres"
    ? Sequelize.fn("to_char", Sequelize.col(columnRef), "YYYY-MM")
    : Sequelize.fn("DATE_FORMAT", Sequelize.col(columnRef), "%Y-%m");
};
