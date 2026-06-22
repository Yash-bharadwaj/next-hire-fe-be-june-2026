import { forwardRef } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

interface ActionsMenuTriggerProps extends ButtonProps {
  iconClassName?: string;
  chevronClassName?: string;
}

// Forwards ref and spreads all extra props (onClick, aria-*, data-state, etc.)
// through to the underlying Button, since Radix's <DropdownMenuTrigger asChild>
// clones this element and injects those props - dropping them silently breaks
// the dropdown's open/close behavior.
export const ActionsMenuTrigger = forwardRef<HTMLButtonElement, ActionsMenuTriggerProps>(
  ({ iconClassName = "h-4 w-4 mr-2", chevronClassName = "h-3 w-3 ml-1", ...buttonProps }, ref) => {
    return (
      <Button ref={ref} {...buttonProps}>
        <MoreHorizontal className={iconClassName} />
        Actions
        <ChevronDown className={chevronClassName} />
      </Button>
    );
  }
);
ActionsMenuTrigger.displayName = "ActionsMenuTrigger";
