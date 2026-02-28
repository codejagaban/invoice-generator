import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-24 w-full rounded-lg border bg-(--surface) px-3 py-2 text-sm text-black ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:ring-offset-[#111111] dark:focus-visible:ring-white border-(--border)",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export default Textarea;
