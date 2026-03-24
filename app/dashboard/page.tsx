/**
 * Analytics Dashboard
 * Route: /dashboard
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Button from "@/app/components/shared/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/shared/Select";
import Card from "@/app/components/shared/Card";
import type { Invoice } from "@/app/lib/types";
import { getInvoices, getSettings, saveSettings } from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { useDbReady } from "@/app/components/DbScopeProvider";
import { InvoiceListSkeleton } from "@/app/components/shared/Skeleton";

import { prefetchRates, convertWithRates } from "@/app/lib/currency";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMonthLabel(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleString("en-GB", { month: "short" });
}

function getInvoiceAmount(inv: Invoice): number {
  return inv.items.reduce((s, i) => s + i.quantity * i.rate, 0);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function isLastMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return (
    d.getMonth() === lastMonth.getMonth() &&
    d.getFullYear() === lastMonth.getFullYear()
  );
}

// ─── Line Chart Component ───────────────────────────────────────────────────

function formatYLabel(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return String(Math.round(v));
}

function LineChart({
  data,
  labels,
  color = "#6366f1",
  formatValue,
}: {
  data: number[];
  labels: string[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 700;
  const height = 200;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 25;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...data, 1);

  const points = data.map((v, i) => ({
    x: padLeft + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padTop + chartH - (v / max) * chartH,
  }));

  // Smooth bezier path with clamped control points
  const clampY = (y: number) => Math.max(padTop, Math.min(padTop + chartH, y));
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const t = 0.3;
    const cp1y = clampY(p1.y + (p2.y - p0.y) * t);
    const cp2y = clampY(p2.y - (p3.y - p1.y) * t);
    linePath += ` C ${p1.x + (p2.x - p0.x) * t} ${cp1y}, ${p2.x - (p3.x - p1.x) * t} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const fillPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;
  const fmtVal = formatValue || ((v: number) => formatYLabel(v));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" fill="none" onMouseLeave={() => setHoveredIdx(null)}>
      <defs>
        <linearGradient id="line-chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id="chart-clip">
          <rect x={padLeft} y={padTop} width={chartW} height={chartH} />
        </clipPath>
      </defs>
      {/* Grid lines + Y labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padTop + chartH * (1 - pct);
        return (
          <g key={pct}>
            <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-800" />
            <text x={padLeft + 4} y={y - 4} className="text-[8px] fill-gray-400 dark:fill-gray-500" style={{ fontFamily: "system-ui" }}>
              {formatYLabel(max * pct)}
            </text>
          </g>
        );
      })}
      {/* Fill */}
      <path d={fillPath} fill="url(#line-chart-grad)" clipPath="url(#chart-clip)" />
      {/* Line */}
      <path d={linePath} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chart-clip)" />
      {/* Hover vertical line */}
      {hoveredIdx !== null && (
        <line
          x1={points[hoveredIdx].x}
          y1={padTop}
          x2={points[hoveredIdx].x}
          y2={padTop + chartH}
          stroke={color}
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.4"
        />
      )}
      {/* Dots, X labels, and hover targets */}
      {points.map((p, i) => (
        <g key={i}>
          {/* Invisible wider hit area */}
          <rect
            x={p.x - (chartW / data.length) / 2}
            y={padTop}
            width={chartW / data.length}
            height={chartH + padBottom}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: "crosshair" }}
          />
          {/* Dot */}
          <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3.5} fill={color} className="transition-all duration-150" />
          <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 2.5 : 1.5} fill="white" className="transition-all duration-150" />
          {/* Tooltip */}
          {hoveredIdx === i && (
            <g>
              <rect
                x={p.x - 40}
                y={p.y - 28}
                width={80}
                height={20}
                rx={6}
                fill={color}
              />
              <text
                x={p.x}
                y={p.y - 15}
                textAnchor="middle"
                className="text-[9px] font-semibold"
                fill="white"
                style={{ fontFamily: "system-ui" }}
              >
                {fmtVal(data[i])}
              </text>
            </g>
          )}
          {/* X label */}
          <text
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            className={`text-[9px] ${hoveredIdx === i ? "font-semibold fill-black dark:fill-white" : "fill-gray-500 dark:fill-gray-400"}`}
            style={{ fontFamily: "system-ui" }}
          >
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Bar Chart Component ────────────────────────────────────────────────────

function BarChart({
  data,
  labels,
  color = "#6366f1",
}: {
  data: number[];
  labels: string[];
  color?: string;
}) {
  const width = 700;
  const height = 200;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 15;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...data, 1);
  const barCount = data.length;
  const gap = 6;
  const totalGap = gap * (barCount - 1);
  const barW = (chartW - totalGap) / barCount;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64" fill="none">
      {/* Grid lines + Y labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padTop + chartH * (1 - pct);
        return (
          <g key={pct}>
            <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-800" />
            <text x={padLeft + 4} y={y - 4} className="text-[8px] fill-gray-400 dark:fill-gray-500" style={{ fontFamily: "system-ui" }}>
              {formatYLabel(max * pct)}
            </text>
          </g>
        );
      })}
      {data.map((value, i) => {
        const barH = Math.max((value / max) * chartH, 2);
        const x = padLeft + i * (barW + gap);
        const y = padTop + chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.6}
            />
            {/* Label */}
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              className="text-[9px] fill-gray-500 dark:fill-gray-400"
              style={{ fontFamily: "system-ui" }}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Status Donut ───────────────────────────────────────────────────────────

function StatusDonut({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-(--muted)">No invoices yet</p>
      </div>
    );
  }

  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offsets = segments.reduce<number[]>((acc, _seg, i) => {
    acc.push(
      i === 0
        ? 0
        : acc[i - 1] + (segments[i - 1].value / total) * circumference,
    );
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {segments.map((seg, i) => {
          const dashLength = (seg.value / total) * circumference;
          const dashOffset = -offsets[i];
          return (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          );
        })}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-bold fill-black dark:fill-white"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-(--muted)">{seg.label}</span>
            <span className="font-semibold text-black dark:text-white ml-auto tabular-nums">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

type TimePeriod = "this-month" | "last-month" | "3-months" | "6-months" | "year" | "all";
type StatusFilter = "all" | "draft" | "sent" | "paid" | "cancelled";

function filterByPeriod(invoices: Invoice[], period: TimePeriod): Invoice[] {
  if (period === "all") return invoices;
  const now = new Date();
  const start = new Date();
  if (period === "this-month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
  else if (period === "last-month") { start.setMonth(now.getMonth() - 1); start.setDate(1); start.setHours(0, 0, 0, 0); }
  else if (period === "3-months") { start.setMonth(now.getMonth() - 3); }
  else if (period === "6-months") { start.setMonth(now.getMonth() - 6); }
  else if (period === "year") { start.setFullYear(now.getFullYear() - 1); }

  if (period === "last-month") {
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d >= start && d < end;
    });
  }
  return invoices.filter((inv) => new Date(inv.date) >= start);
}

export default function DashboardPage() {
  const dbReady = useDbReady();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");
  const [period, setPeriod] = useState<TimePeriod>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [data, settings] = await Promise.all([
        getInvoices(),
        getSettings(),
      ]);
      setInvoices(data);
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, [dbReady]);

  type Metrics = {
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueChange: number | null;
    thisMonthCount: number;
    lastMonthCount: number;
    countChange: number | null;
    thisMonthPaidAmount: number;
    lastMonthPaidAmount: number;
    paidChange: number | null;
    overdueInvoices: Invoice[];
    overdueAmount: number;
    overdueCount: number;
    dueSoonInvoices: Invoice[];
    unpaidAmount: number;
    unpaidCount: number;
    monthlyRevenue: number[];
    monthlyCount: number[];
    monthLabels: string[];
    statusCounts: {
      draft: number;
      sent: number;
      paid: number;
      cancelled: number;
    };
    recentInvoices: Invoice[];
    totalInvoices: number;
    totalCustomers: number;
  };

  const emptyMetrics: Metrics = {
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    revenueChange: null,
    thisMonthCount: 0,
    lastMonthCount: 0,
    countChange: null,
    thisMonthPaidAmount: 0,
    lastMonthPaidAmount: 0,
    paidChange: null,
    overdueInvoices: [],
    overdueAmount: 0,
    overdueCount: 0,
    dueSoonInvoices: [],
    unpaidAmount: 0,
    unpaidCount: 0,
    monthlyRevenue: Array(12).fill(0) as number[],
    monthlyCount: Array(12).fill(0) as number[],
    monthLabels: Array.from({ length: 12 }, (_, i) => getMonthLabel(11 - i)),
    statusCounts: { draft: 0, sent: 0, paid: 0, cancelled: 0 },
    recentInvoices: [],
    totalInvoices: 0,
    totalCustomers: 0,
  };

  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);

  useEffect(() => {
    if (invoices.length === 0) return;

    (async () => {
      // Apply filters
      let filtered = filterByPeriod(invoices, period);
      if (statusFilter !== "all") {
        filtered = filtered.filter((inv) => inv.status === statusFilter);
      }

      // Prefetch all exchange rates needed
      const currencies = [...new Set(invoices.map((inv) => inv.currency))];
      const rates = await prefetchRates(currencies, defaultCurrency);

      const convert = (inv: Invoice) =>
        convertWithRates(getInvoiceAmount(inv), inv.currency, rates);

      const thisMonth = filtered.filter((inv) => isThisMonth(inv.date));
      const lastMonth = filtered.filter((inv) => isLastMonth(inv.date));

      const thisMonthRevenue = thisMonth.reduce(
        (s, inv) => s + convert(inv),
        0,
      );
      const lastMonthRevenue = lastMonth.reduce(
        (s, inv) => s + convert(inv),
        0,
      );

      const thisMonthPaid = thisMonth.filter((inv) => inv.status === "paid");
      const lastMonthPaid = lastMonth.filter((inv) => inv.status === "paid");
      const thisMonthPaidAmount = thisMonthPaid.reduce(
        (s, inv) => s + convert(inv),
        0,
      );
      const lastMonthPaidAmount = lastMonthPaid.reduce(
        (s, inv) => s + convert(inv),
        0,
      );

      const overdueInvoices = filtered.filter(
        (inv) =>
          inv.status !== "paid" &&
          inv.status !== "cancelled" &&
          isOverdue(inv.dueDate),
      );
      const overdueAmount = overdueInvoices.reduce(
        (s, inv) => s + convert(inv),
        0,
      );

      const dueSoonInvoices = filtered.filter(
        (inv) =>
          inv.status !== "paid" &&
          inv.status !== "cancelled" &&
          isDueSoon(inv.dueDate) &&
          !isOverdue(inv.dueDate),
      );

      const unpaidInvoices = filtered.filter(
        (inv) => inv.status !== "paid" && inv.status !== "cancelled",
      );
      const unpaidAmount = unpaidInvoices.reduce(
        (s, inv) => s + convert(inv),
        0,
      );

      // Chart data source: use filtered when filters are active, all invoices otherwise
      const isDefaultFilter = period === "all" && statusFilter === "all";
      const chartSource = isDefaultFilter ? invoices : filtered;

      // Determine chart month range
      const now = new Date();
      let monthsBack = 11; // default: last 12 months
      if (chartSource.length > 0 && (period === "all" || period === "year")) {
        const earliest = chartSource.reduce((min, inv) => {
          const d = new Date(inv.date);
          return d < min ? d : min;
        }, new Date());
        const diffMonths = (now.getFullYear() - earliest.getFullYear()) * 12 + (now.getMonth() - earliest.getMonth());
        monthsBack = Math.max(11, diffMonths);
      }

      // Monthly revenue
      const monthlyRevenue: number[] = [];
      const monthLabels: string[] = [];
      for (let i = monthsBack; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        const monthInvoices = chartSource.filter((inv) => {
          const id = new Date(inv.date);
          return id.getMonth() === m && id.getFullYear() === y;
        });
        monthlyRevenue.push(
          monthInvoices.reduce((s, inv) => s + convert(inv), 0),
        );
        monthLabels.push(getMonthLabel(i));
      }

      // Monthly invoice count
      const monthlyCount: number[] = [];
      for (let i = monthsBack; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth();
        const y = d.getFullYear();
        monthlyCount.push(
          chartSource.filter((inv) => {
            const id = new Date(inv.date);
            return id.getMonth() === m && id.getFullYear() === y;
          }).length,
        );
      }

      // Status breakdown
      const statusSource = isDefaultFilter ? invoices : filtered;
      const statusCounts = {
        draft: statusSource.filter((inv) => inv.status === "draft").length,
        sent: statusSource.filter((inv) => inv.status === "sent").length,
        paid: statusSource.filter((inv) => inv.status === "paid").length,
        cancelled: statusSource.filter((inv) => inv.status === "cancelled").length,
      };

      // Recent invoices (last 5)
      const recentInvoices = [...filtered]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      // Unique customers
      const totalCustomers = new Set(filtered.map((inv) => inv.customer.name)).size;

      setMetrics({
        thisMonthRevenue,
        lastMonthRevenue,
        revenueChange: pctChange(thisMonthRevenue, lastMonthRevenue),
        thisMonthCount: thisMonth.length,
        lastMonthCount: lastMonth.length,
        countChange: pctChange(thisMonth.length, lastMonth.length),
        thisMonthPaidAmount,
        lastMonthPaidAmount,
        paidChange: pctChange(thisMonthPaidAmount, lastMonthPaidAmount),
        overdueInvoices,
        overdueAmount,
        overdueCount: overdueInvoices.length,
        dueSoonInvoices,
        unpaidAmount,
        unpaidCount: unpaidInvoices.length,
        monthlyRevenue,
        monthlyCount,
        monthLabels,
        statusCounts,
        recentInvoices,
        totalInvoices: filtered.length,
        totalCustomers,
      });
    })();
  }, [invoices, defaultCurrency, isLoading, period, statusFilter]);

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-(--muted)">
                Overview of your invoicing activity
              </p>
            </div>
            <Link href="/invoices/create">
              <Button variant="outline">
                <FilePlus2 className="h-4 w-4 text-green-500" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading ? (
          <InvoiceListSkeleton />
        ) : (
          <div className="space-y-6">
            {/* ── Filters ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 sm:justify-end">
              <div className="flex items-center gap-1.5 text-sm text-(--muted)">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Filters</span>
              </div>
              <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-months">Last 3 Months</SelectItem>
                  <SelectItem value="6-months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={defaultCurrency} onValueChange={async (v) => {
                setDefaultCurrency(v);
                await saveSettings({ defaultCurrency: v, updatedAt: new Date().toISOString() });
              }}>
                <SelectTrigger className="flex-1 sm:flex-none sm:w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { code: "USD", label: "USD" },
                    { code: "EUR", label: "EUR" },
                    { code: "GBP", label: "GBP" },
                    { code: "CAD", label: "CAD" },
                    { code: "AUD", label: "AUD" },
                    { code: "JPY", label: "JPY" },
                    { code: "CHF", label: "CHF" },
                    { code: "CNY", label: "CNY" },
                    { code: "INR", label: "INR" },
                    { code: "MXN", label: "MXN" },
                    { code: "NGN", label: "NGN" },
                  ].map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(period !== "all" || statusFilter !== "all") && (
                <button
                  onClick={() => { setPeriod("all"); setStatusFilter("all"); }}
                  className="text-xs text-(--muted) hover:text-black dark:hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* ── Top Metric Cards (FinSet-style) ─────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Revenue Card */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-(--muted)">Total Revenue</h3>
                  <span className="text-[11px] text-(--muted) bg-(--surface) border border-(--border) rounded-md px-2 py-0.5">{defaultCurrency}</span>
                </div>
                <p className="text-3xl font-bold text-black dark:text-white tabular-nums tracking-tight">
                  {formatCurrency(metrics.thisMonthRevenue, defaultCurrency)}
                  <span className="text-lg font-normal text-(--muted)">.{(metrics.thisMonthRevenue % 1).toFixed(2).slice(2)}</span>
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {metrics.revenueChange !== null && (
                    <span className={`inline-flex items-center gap-1 font-medium ${metrics.revenueChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {metrics.revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {metrics.revenueChange >= 0 ? "+" : ""}{metrics.revenueChange}%
                    </span>
                  )}
                  <span className="text-(--muted)">{metrics.thisMonthCount} invoices</span>
                </div>
                <p className="mt-2 text-xs text-(--muted)">
                  {metrics.lastMonthRevenue > 0
                    ? metrics.thisMonthRevenue >= metrics.lastMonthRevenue
                      ? `You earned extra ${formatCurrency(metrics.thisMonthRevenue - metrics.lastMonthRevenue, defaultCurrency)} compared to last month`
                      : `Down ${formatCurrency(metrics.lastMonthRevenue - metrics.thisMonthRevenue, defaultCurrency)} compared to last month`
                    : "No data from last month"}
                </p>
              </Card>

              {/* Collected Card */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-(--muted)">Collected</h3>
                  <span className="text-[11px] text-(--muted) bg-(--surface) border border-(--border) rounded-md px-2 py-0.5">{defaultCurrency}</span>
                </div>
                <p className="text-3xl font-bold text-black dark:text-white tabular-nums tracking-tight">
                  {formatCurrency(metrics.thisMonthPaidAmount, defaultCurrency)}
                  <span className="text-lg font-normal text-(--muted)">.{(metrics.thisMonthPaidAmount % 1).toFixed(2).slice(2)}</span>
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {metrics.paidChange !== null && (
                    <span className={`inline-flex items-center gap-1 font-medium ${metrics.paidChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {metrics.paidChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {metrics.paidChange >= 0 ? "+" : ""}{metrics.paidChange}%
                    </span>
                  )}
                  <span className="text-(--muted)">{metrics.statusCounts.paid} paid</span>
                </div>
                <p className="mt-2 text-xs text-(--muted)">
                  {metrics.lastMonthPaidAmount > 0
                    ? metrics.thisMonthPaidAmount >= metrics.lastMonthPaidAmount
                      ? `Collected extra ${formatCurrency(metrics.thisMonthPaidAmount - metrics.lastMonthPaidAmount, defaultCurrency)} compared to last month`
                      : `Down ${formatCurrency(metrics.lastMonthPaidAmount - metrics.thisMonthPaidAmount, defaultCurrency)} compared to last month`
                    : "No collections last month"}
                </p>
              </Card>

              {/* Outstanding Card */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-(--muted)">Outstanding</h3>
                  <span className="text-[11px] text-(--muted) bg-(--surface) border border-(--border) rounded-md px-2 py-0.5">{defaultCurrency}</span>
                </div>
                <p className="text-3xl font-bold text-black dark:text-white tabular-nums tracking-tight">
                  {formatCurrency(metrics.unpaidAmount, defaultCurrency)}
                  <span className="text-lg font-normal text-(--muted)">.{(metrics.unpaidAmount % 1).toFixed(2).slice(2)}</span>
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="text-(--muted)">{metrics.unpaidCount} unpaid</span>
                  {metrics.overdueCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      {metrics.overdueCount} overdue
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-(--muted)">
                  {metrics.overdueAmount > 0
                    ? `${formatCurrency(metrics.overdueAmount, defaultCurrency)} is overdue`
                    : "All invoices are on track"}
                </p>
              </Card>
            </div>

            {/* ── Revenue Overview + Statistics ────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue Overview - large chart */}
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-black dark:text-white">Revenue Overview</h3>
                  <div className="flex items-center gap-3 text-xs text-(--muted)">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      This period
                    </span>
                  </div>
                </div>
                <p className="text-xs text-(--muted) mb-4">{
                  period === "this-month" ? "This month" :
                  period === "last-month" ? "Last month" :
                  period === "3-months" ? "Last 3 months" :
                  period === "6-months" ? "Last 6 months" :
                  period === "year" ? "Last year" :
                  period === "all" ? "All time" : "Last 12 months"
                }</p>
                <LineChart
                  data={metrics.monthlyRevenue}
                  labels={metrics.monthLabels}
                  color="#6366f1"
                  formatValue={(v) => formatCurrency(v, defaultCurrency)}
                />
              </Card>

              {/* Statistics - Donut + summary */}
              <Card>
                <h3 className="text-base font-bold text-black dark:text-white mb-1">Statistics</h3>
                <p className="text-xs text-(--muted) mb-4">Invoice breakdown by status</p>
                <StatusDonut
                  segments={[
                    { label: "Paid", value: metrics.statusCounts.paid, color: "#10b981" },
                    { label: "Sent", value: metrics.statusCounts.sent, color: "#6366f1" },
                    { label: "Draft", value: metrics.statusCounts.draft, color: "#9ca3af" },
                    { label: "Cancelled", value: metrics.statusCounts.cancelled, color: "#ef4444" },
                  ]}
                />
                <div className="mt-4 pt-4 border-t border-(--border) text-center">
                  <p className="text-xs text-(--muted)">Total invoices</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{metrics.totalInvoices}</p>
                </div>
              </Card>
            </div>

            {/* ── Invoices Created + Attention Required ────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Invoices Created bar chart */}
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-black dark:text-white">Invoices Created</h3>
                </div>
                <p className="text-xs text-(--muted) mb-4">{
                  period === "this-month" ? "This month" :
                  period === "last-month" ? "Last month" :
                  period === "3-months" ? "Last 3 months" :
                  period === "6-months" ? "Last 6 months" :
                  period === "year" ? "Last year" :
                  period === "all" ? "All time" : "Last 12 months"
                }</p>
                <BarChart
                  data={metrics.monthlyCount}
                  labels={metrics.monthLabels}
                  color="#6366f1"
                />
              </Card>

              {/* Attention Required */}
              <Card>
                <h3 className="text-base font-bold text-black dark:text-white mb-1">Attention</h3>
                <p className="text-xs text-(--muted) mb-4">Overdue & due soon</p>
                <div className="space-y-2">
                  {metrics.overdueInvoices.length === 0 && metrics.dueSoonInvoices.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-black dark:text-white">All clear</p>
                      <p className="text-xs text-(--muted)">No overdue invoices</p>
                    </div>
                  ) : (
                    <>
                      {metrics.overdueInvoices.slice(0, 3).map((inv) => (
                        <Link key={inv.id} href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:hover:bg-red-950/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-red-800 dark:text-red-300 truncate">{inv.invoiceNumber}</p>
                              <p className="text-[10px] text-red-600 dark:text-red-400 truncate">{inv.customer.name}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-red-700 dark:text-red-300 shrink-0 ml-2">
                            {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                          </span>
                        </Link>
                      ))}
                      {metrics.dueSoonInvoices.slice(0, 3).map((inv) => (
                        <Link key={inv.id} href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5 transition-colors hover:bg-yellow-100 dark:border-yellow-900/40 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/40"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 truncate">{inv.invoiceNumber}</p>
                              <p className="text-[10px] text-yellow-600 dark:text-yellow-400 truncate">{inv.customer.name}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 shrink-0 ml-2">
                            {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                          </span>
                        </Link>
                      ))}
                      {(metrics.overdueInvoices.length + metrics.dueSoonInvoices.length) > 6 && (
                        <Link href="/invoices" className="block text-center text-xs text-(--muted) hover:text-black dark:hover:text-white pt-1">
                          View all →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Recent Invoices ─────────────────────────────────── */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">Recent Invoices</h3>
                  <p className="text-xs text-(--muted)">Latest activity across all invoices</p>
                </div>
                <Link
                  href="/invoices"
                  className="text-xs font-medium text-(--muted) hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-(--border)">
                {metrics.recentInvoices.length === 0 ? (
                  <p className="text-sm text-(--muted) py-6 text-center">No invoices yet.</p>
                ) : (
                  metrics.recentInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center justify-between py-3 hover:bg-(--border)/10 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          inv.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : inv.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : inv.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {inv.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">{inv.customer.name}</p>
                          <p className="text-xs text-(--muted)">{inv.invoiceNumber} · {formatDate(inv.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-black dark:text-white tabular-nums">
                          {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                        </p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          inv.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : inv.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : inv.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
