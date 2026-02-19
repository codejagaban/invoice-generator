"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";
import { cn } from "@/app/lib/utils";
import { buttonVariants } from "@/app/components/shared/Button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarDayButton({
  day: _day,
  modifiers,
  className,
  ...props
}: DayButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        className,
        modifiers.selected &&
          "bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white",
      )}
      {...props}
    />
  );
}

function CalendarNavButton({
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} />;
}

export default function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        ...defaultClassNames,
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-9 w-9 p-0 font-normal",
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100",
        ),
        selected: "",
        today: "bg-gray-100 text-black dark:bg-gray-900 dark:text-white",
        outside: "text-(--muted) opacity-50",
        disabled: "text-gray-400 opacity-50",
        range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-black dark:aria-selected:bg-gray-900 dark:aria-selected:text-white",
        ...classNames,
      }}
      components={{
        DayButton: CalendarDayButton,
        PreviousMonthButton: CalendarNavButton,
        NextMonthButton: CalendarNavButton,
      }}
      {...props}
    />
  );
}
