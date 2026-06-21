import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { CsvColumn } from "./csv";

export const downloadPdf = <T>(
  filename: string,
  title: string,
  rows: T[],
  columns: CsvColumn<T>[]
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  autoTable(doc, {
    startY: 20,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => String(col.accessor(row) ?? ""))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 122, 87] },
  });
  doc.save(filename);
};

export const downloadExcel = <T>(
  filename: string,
  sheetName: string,
  rows: T[],
  columns: CsvColumn<T>[]
) => {
  const data = rows.map((row) => {
    const record: Record<string, any> = {};
    columns.forEach((col) => {
      record[col.header] = col.accessor(row);
    });
    return record;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * No Google OAuth/Sheets API credentials are configured for this app, so
 * this can't create or populate a sheet automatically. Instead it copies
 * the data as tab-separated values (so a paste lands in the right columns)
 * and opens a blank Google Sheet for the user to paste into.
 */
export const exportToGoogleSheets = async <T>(rows: T[], columns: CsvColumn<T>[]) => {
  const escapeCell = (value: any) => String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
  const header = columns.map((col) => escapeCell(col.header)).join("\t");
  const body = rows.map((row) => columns.map((col) => escapeCell(col.accessor(row))).join("\t")).join("\n");
  const tsv = `${header}\n${body}`;

  await navigator.clipboard.writeText(tsv);
  window.open("https://sheets.new", "_blank", "noopener,noreferrer");
};
