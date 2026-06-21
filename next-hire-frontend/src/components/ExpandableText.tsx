import { useState } from "react";

interface ExpandableTextProps {
  text?: string | null;
  maxLength?: number;
  className?: string;
}

// Truncates long body text (job descriptions, summaries, bios) to a preview
// with a "Show more"/"Show less" toggle, so detail pages surface more useful
// content above the fold instead of one section eating the whole page.
export const ExpandableText = ({
  text,
  maxLength = 320,
  className = "",
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > maxLength;
  const visibleText = isLong && !expanded ? `${text.slice(0, maxLength).trimEnd()}…` : text;

  return (
    <p className={className}>
      {visibleText}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="ml-1.5 text-green-700 hover:text-green-800 font-medium whitespace-nowrap"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </p>
  );
};
