import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React, { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  children?: ReactNode;
  bordered?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  children,
  bordered = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        bordered && "border-b pb-4",
        className,
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-8 w-8 text-primary shrink-0" />}
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions || children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
