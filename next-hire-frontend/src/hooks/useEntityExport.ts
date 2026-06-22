import { useState } from "react";
import { toast } from "sonner";
import { downloadCsv, type CsvColumn } from "@/utils/csv";
import { downloadPdf, downloadExcel, exportToGoogleSheets } from "@/utils/exportData";

interface UseEntityExportOptions<T> {
  rows: T[];
  columns: CsvColumn<T>[];
  // e.g. "jobs", "business-partners" - used in the downloaded filename.
  filenameSlug: string;
  // e.g. "Jobs", "Business Partners" - passed through to the PDF/Excel doc title.
  docTitle: string;
  // e.g. "Jobs", "Business partners" - plural, used in toast copy
  // ("{toastLabel} exported as CSV" / "No {toastLabel.toLowerCase()} to export").
  toastLabel: string;
  // e.g. "Job", "Business partner" - singular, used in the Sheets-copy toast.
  toastLabelSingular: string;
  // Some pages (e.g. Placements) re-check the user's role inside each
  // handler even though the Export button is already only rendered for
  // that role - an extra defensive guard, preserved exactly where it
  // existed rather than dropped or added elsewhere.
  guard?: { check: () => boolean; message: string };
}

// The CSV/PDF/Excel/Sheets export handlers (and their "nothing to export"/
// success/failure toast copy) were duplicated near-identically across every
// list page that has an Export dropdown. This captures that once; each page
// still owns its own column definitions and exact label strings, since those
// genuinely differ.
export function useEntityExport<T>({
  rows,
  columns,
  filenameSlug,
  docTitle,
  toastLabel,
  toastLabelSingular,
  guard,
}: UseEntityExportOptions<T>) {
  const [exporting, setExporting] = useState(false);
  const emptyMessage = `No ${toastLabel.toLowerCase()} to export`;
  const timestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

  const passesGuard = () => {
    if (guard && !guard.check()) {
      toast.error(guard.message);
      return false;
    }
    return true;
  };

  const handleExportCsv = () => {
    if (!passesGuard()) return;
    if (!rows.length) {
      toast.error(emptyMessage);
      return;
    }
    try {
      setExporting(true);
      downloadCsv(`${filenameSlug}-export-${timestamp()}.csv`, rows, columns);
      toast.success(`${toastLabel} exported as CSV`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to export ${toastLabel.toLowerCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = () => {
    if (!passesGuard()) return;
    if (!rows.length) {
      toast.error(emptyMessage);
      return;
    }
    downloadPdf(`${filenameSlug}-export-${timestamp()}.pdf`, docTitle, rows, columns);
    toast.success(`${toastLabel} exported as PDF`);
  };

  const handleExportExcel = () => {
    if (!passesGuard()) return;
    if (!rows.length) {
      toast.error(emptyMessage);
      return;
    }
    downloadExcel(`${filenameSlug}-export-${timestamp()}.xlsx`, docTitle, rows, columns);
    toast.success(`${toastLabel} exported as Excel`);
  };

  const handleExportGoogleSheets = async () => {
    if (!passesGuard()) return;
    if (!rows.length) {
      toast.error(emptyMessage);
      return;
    }
    try {
      await exportToGoogleSheets(rows, columns);
      toast.success(`${toastLabelSingular} data copied — paste (Cmd/Ctrl+V) into the new sheet`);
    } catch {
      toast.error("Couldn't copy to clipboard. Try CSV or Excel export instead.");
    }
  };

  return { exporting, handleExportCsv, handleExportPdf, handleExportExcel, handleExportGoogleSheets };
}
