"use client";

import { cn } from "@/app/lib/utils";

interface MiniChartProps {
  data: number[];
  color?: string;
  className?: string;
}

export default function MiniChart({
  data,
  color = "currentColor",
  className,
}: MiniChartProps) {
  const width = 120;
  const height = 40;
  const padding = 4;

  const max = Math.max(...data, 1);
  const points = data.map((value, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (value / max) * (height - padding * 2);
    return { x, y };
  });

  const isEmpty = data.length === 0 || data.every((v) => v === 0);

  if (isEmpty) {
    const midY = height / 2 + 4;
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={cn("h-10", className)}
        fill="none"
      >
        <line
          x1={padding}
          y1={midY}
          x2={width - padding}
          y2={midY}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="text-gray-200 dark:text-gray-700"
        />
      </svg>
    );
  }

  // Smooth curve using cubic bezier
  const linePath = buildSmoothPath(points);

  // Area fill path
  const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-10", className)}
      fill="none"
      style={{ color }}
    >
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={fillPath}
        fill={`url(#grad-${color})`}
      />
      <path
        d={linePath}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dot on latest data point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill="currentColor"
      />
    </svg>
  );
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Groups dates by day for the last N days and returns counts.
 */
export function groupByDay(
  dates: string[],
  days: number = 7,
): number[] {
  const now = new Date();
  const buckets = new Array(days).fill(0);

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < days) {
      buckets[days - 1 - diffDays]++;
    }
  }

  return buckets;
}

/**
 * Groups dates by month for the last N months and returns counts.
 */
export function groupByMonth(
  dates: string[],
  months: number = 6,
): number[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const buckets = new Array(months).fill(0);

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    const monthDiff =
      (currentYear - date.getFullYear()) * 12 +
      (currentMonth - date.getMonth());
    if (monthDiff >= 0 && monthDiff < months) {
      buckets[months - 1 - monthDiff]++;
    }
  }

  return buckets;
}
