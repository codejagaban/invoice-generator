import { cn } from "@/app/lib/utils";
import type { InvoiceStatus } from "@/app/lib/types";

const statusStyles: Record<InvoiceStatus, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusBadge({
  status,
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block font-medium rounded-full capitalize",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
