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
