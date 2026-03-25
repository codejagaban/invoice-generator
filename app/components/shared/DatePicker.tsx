"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Button from "@/app/components/shared/Button";
import Calendar from "@/app/components/shared/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/shared/Popover";
import { cn } from "@/app/lib/utils";

interface DatePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
}: DatePickerProps) {
  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  const handleSelect = (selected?: Date) => {
    if (!selected) return;
    onChange(format(selected, "yyyy-MM-dd"));
  };

  return (
    <div className="w-full p-1">
      <label className="block text-sm font-medium text-black dark:text-white mb-2">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            data-empty={!date}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-(--muted)",
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
