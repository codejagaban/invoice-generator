/**
 * Input Component
 * A reusable text input component with optional label and error message
 */

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input(
  { label, error, helperText, className = "", ...props }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2 border rounded-lg bg-white text-black placeholder-gray-500 transition-colors dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
            : "border-gray-300 focus:border-black focus:ring-1 focus:ring-black dark:border-gray-700 dark:focus:border-white dark:focus:ring-white"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

export const InputWithRef = React.forwardRef(Input);
