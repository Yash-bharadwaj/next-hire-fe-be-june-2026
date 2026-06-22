import { Loader2 } from "lucide-react";

interface PageLoadingStateProps {
  label: string;
  minHeightClassName?: string;
  iconClassName?: string;
  contentClassName?: string;
}

export function PageLoadingState({
  label,
  minHeightClassName = "min-h-screen",
  iconClassName = "h-6 w-6 animate-spin",
  contentClassName = "flex items-center space-x-2",
}: PageLoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${minHeightClassName}`}>
      <div className={contentClassName}>
        <Loader2 className={iconClassName} />
        <span>{label}</span>
      </div>
    </div>
  );
}
