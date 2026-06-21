import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ExpandableBadgeListProps {
  items: string[];
  initialCount?: number;
  badgeClassName?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
}

// Shows the first N badges (skills, etc.) plus a "+X more" badge that
// expands the full list in place, so a long skill set doesn't push the rest
// of the page down before the user has seen anything else.
export const ExpandableBadgeList = ({
  items,
  initialCount = 8,
  badgeClassName,
  badgeVariant,
}: ExpandableBadgeListProps) => {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const hiddenCount = items.length - initialCount;
  const visibleItems = expanded ? items : items.slice(0, initialCount);

  return (
    <div className="flex flex-wrap gap-2">
      {visibleItems.map((item, index) => (
        <Badge key={index} variant={badgeVariant} className={badgeClassName}>
          {item}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge
          onClick={() => setExpanded((prev) => !prev)}
          variant="outline"
          className="cursor-pointer text-gray-600 hover:bg-gray-100"
        >
          {expanded ? "Show less" : `+${hiddenCount} more`}
        </Badge>
      )}
    </div>
  );
};
