export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => any;
};

const escapeCsv = (value: any) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const downloadCsv = <T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
) => {
  const header = columns.map((col) => escapeCsv(col.header)).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsv(col.accessor(row))).join(","))
    .join("\n");

  const csvContent = `${header}\n${body}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

