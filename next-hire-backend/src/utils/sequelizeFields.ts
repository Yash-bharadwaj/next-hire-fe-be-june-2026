import { DataTypes } from "sequelize";

interface JsonArrayColumnOptions {
  allowNull?: boolean;
  // Some older fields parse without a try/catch (so malformed JSON throws
  // instead of falling back to []) - default false matches the majority
  // (notes_history/attachments/status_history) pattern; pass true only to
  // reproduce a field's pre-existing non-try/catch behavior exactly.
  unsafeParse?: boolean;
}

// A reusable Sequelize field definition for a JSON array stored in a TEXT
// column (tags/skills/notes_history/attachments/status_history, etc.).
// Centralizes the JSON.parse/stringify get/set pair that was previously
// copy-pasted per field per model - every instance was byte-identical
// except for the column name.
// `as any` on `this` below matches how these getters/setters are actually
// invoked (Sequelize calls them bound to the model instance) without
// fighting each model's generated Attributes type, which doesn't know about
// a column name received as a runtime string parameter.
export const jsonArrayColumn = (columnName: string, options: JsonArrayColumnOptions = {}): any => {
  const { allowNull = true, unsafeParse = false } = options;

  return {
    type: DataTypes.TEXT,
    allowNull,
    defaultValue: "[]",
    get() {
      const value = (this as any).getDataValue(columnName) as unknown as string;
      if (unsafeParse) {
        return value ? JSON.parse(value) : [];
      }
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    },
    set(value: any[]) {
      (this as any).setDataValue(columnName, JSON.stringify(value || []));
    },
  };
};
