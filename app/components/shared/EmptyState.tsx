import { cn } from "@/app/lib/utils";
import type { LucideIcon } from "lucide-react";
import { FileX2 } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon = FileX2,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-7 w-7 text-(--muted)" />
      </div>
      <h3 className="text-lg font-semibold text-black dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-(--muted)">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
