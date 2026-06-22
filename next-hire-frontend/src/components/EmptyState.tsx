import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: ReactNode;
  titleAs?: "h3" | "p";
  titleClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  iconClassName = "h-12 w-12 text-gray-400 mx-auto mb-4",
  title,
  titleAs = "p",
  titleClassName = "text-gray-600",
  description,
  descriptionClassName = "text-gray-600 mb-4",
  action,
  className = "p-8 text-center",
}: EmptyStateProps) {
  const Title = titleAs;
  return (
    <div className={className}>
      <Icon className={iconClassName} />
      <Title className={titleClassName}>{title}</Title>
      {description && <p className={descriptionClassName}>{description}</p>}
      {action}
    </div>
  );
}
