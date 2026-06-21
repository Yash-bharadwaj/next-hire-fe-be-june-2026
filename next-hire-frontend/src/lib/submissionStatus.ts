// Shared status display metadata for submissions, covering both the
// sourcing/pipeline stages (new_candidate, initial_scanning, ...) and the
// candidate/vendor-facing application stages (submitted, interviewed, ...)
// so any view grouping or labeling submissions by status stays consistent.
export const SUBMISSION_STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  new_candidate: { label: "Pipeline", color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
  initial_scanning: { label: "Initial Scanning", color: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
  first_round: { label: "First Round", color: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  technical_round: { label: "Technical Manager Round", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  final_round: { label: "Final Round", color: "bg-orange-100 text-orange-800", dot: "bg-orange-400" },
  sourcing: { label: "Sourcing", color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800", dot: "bg-blue-400" },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-400" },
  shortlisted: { label: "Shortlisted", color: "bg-green-100 text-green-800", dot: "bg-green-400" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  interviewed: { label: "Interviewed", color: "bg-indigo-100 text-indigo-800", dot: "bg-indigo-400" },
  offered: { label: "Offered", color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-400" },
  hired: { label: "Hired", color: "bg-green-100 text-green-800", dot: "bg-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", dot: "bg-red-400" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-800", dot: "bg-gray-400" },
};

export const getSubmissionStatusMeta = (status?: string | null) =>
  SUBMISSION_STATUS_META[status || ""] || {
    label: status || "Unknown",
    color: "bg-gray-100 text-gray-800",
    dot: "bg-gray-400",
  };
