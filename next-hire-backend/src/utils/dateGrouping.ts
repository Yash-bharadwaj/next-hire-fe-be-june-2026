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

// Dialect-agnostic "hours between two timestamp columns" expression, e.g.
// for response-time metrics (time between a record being created and being
// reviewed). Returns a raw SQL fragment suitable for Sequelize.literal.
export const hoursDiffExpr = (laterCol: string, earlierCol: string) => {
  const dialect = sequelize.getDialect();
  if (dialect === "sqlite") {
    return `(julianday("${laterCol}") - julianday("${earlierCol}")) * 24`;
  }
  if (dialect === "postgres") {
    return `(EXTRACT(EPOCH FROM "${laterCol}") - EXTRACT(EPOCH FROM "${earlierCol}")) / 3600`;
  }
  return `(TIMESTAMPDIFF(SECOND, \`${earlierCol}\`, \`${laterCol}\`)) / 3600`;
};
