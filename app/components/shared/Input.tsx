/**
 * Input Component (shadcn/ui)
 */

import * as React from "react";
import { cn } from "@/app/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leadingIcon, className, type, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-black dark:text-white mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {leadingIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm text-black ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:ring-offset-[#111111] dark:focus-visible:ring-white",
              leadingIcon ? "pl-9" : "",
              error
                ? "border-red-500 focus-visible:ring-red-500"
                : "[border-color:var(--border)]",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
export const InputWithRef = Input;
