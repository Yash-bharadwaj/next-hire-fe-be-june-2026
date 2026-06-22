// "Jun 12, 2024" - shared by every service's formatDate(), which previously
// each reimplemented this exact toLocaleDateString call independently.
export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// "Jun 12, 2024, 03:45 PM" - shared by every service's formatDateTime().
export const formatDateTime = (dateString: string): string =>
  new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const PRIORITY_COLOR_MAP: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

// Shared by every service's getPriorityColor() - the color maps were
// byte-identical, just typed against each service's own priority union.
export const getPriorityColor = (priority: string): string =>
  PRIORITY_COLOR_MAP[priority] || "bg-gray-100 text-gray-800";

// "$120,000" - the full (non-compact) currency formatter shared by
// formatSalary()/formatSalaryRange() across services.
export const formatCurrency = (amount: number, currency: string = "USD"): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// Compact currency, e.g. 120000 -> "$120K", 1500000 -> "$1.5M", 95 -> "$95".
export const formatCompactCurrency = (
  amount?: number | string | null,
  currency: string = "USD"
): string | null => {
  if (amount === undefined || amount === null || amount === "") return null;
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(numeric);
};

// A min-max range on one line, e.g. "$120K - $150K" or "$95/hr - $130/hr".
// Falls back gracefully when only one bound is present.
export const formatCompactRange = (
  min?: number | string | null,
  max?: number | string | null,
  options: { suffix?: string; currency?: string } = {}
): string => {
  const { suffix = "", currency = "USD" } = options;
  const minFormatted = formatCompactCurrency(min, currency);
  const maxFormatted = formatCompactCurrency(max, currency);

  if (minFormatted && maxFormatted) {
    return `${minFormatted}${suffix} - ${maxFormatted}${suffix}`;
  }
  if (minFormatted) return `${minFormatted}${suffix}+`;
  if (maxFormatted) return `Up to ${maxFormatted}${suffix}`;
  return "Not specified";
};
