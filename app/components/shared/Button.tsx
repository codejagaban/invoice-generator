/**
 * Button Component (shadcn/ui)
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-white",
  {
    variants: {
      variant: {
        primary:
          "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100",
        secondary:
          "bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-500",
        "danger-soft":
          "border border-red-300 bg-red-50 text-black hover:bg-red-100 [&>svg]:text-red-500 dark:border-red-800 dark:bg-red-950/40 dark:text-white dark:hover:bg-red-950/70 dark:[&>svg]:text-red-400",
        ghost:
          "bg-transparent text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-900",
        outline:
          "border border-black bg-transparent text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-900",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export default function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { buttonVariants };
