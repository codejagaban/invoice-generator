/**
 * Analytics Dashboard
 * Route: /dashboard
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Button from "@/app/components/shared/Button";
import Card from "@/app/components/shared/Card";
import type { Invoice } from "@/app/lib/types";
import { getInvoices, getSettings } from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { useDbReady } from "@/app/components/DbScopeProvider";
import { InvoiceListSkeleton } from "@/app/components/shared/Skeleton";
import MiniChart from "@/app/components/shared/MiniChart";

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
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isLastMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
}

// ─── Line Chart Component ───────────────────────────────────────────────────

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
  const width = 500;
  const height = 160;
  const padX = 40;
  const padTop = 20;
  const padBottom = 24;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...data, 1);

  const points = data.map((v, i) => ({
    x: padX + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padTop + chartH - (v / max) * chartH,
  }));

  // Smooth bezier path
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const t = 0.3;
    linePath += ` C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t}, ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t}, ${p2.x} ${p2.y}`;
  }

  const fillPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" fill="none">
      <defs>
        <linearGradient id="line-chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id="chart-clip">
          <rect x={padX} y={padTop} width={chartW} height={chartH} />
        </clipPath>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={padX}
          y1={padTop + chartH * (1 - pct)}
          x2={width - padX}
          y2={padTop + chartH * (1 - pct)}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-200 dark:text-gray-800"
        />
      ))}
      {/* Fill */}
      <path d={fillPath} fill="url(#line-chart-grad)" clipPath="url(#chart-clip)" />
      {/* Line */}
      <path d={linePath} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#chart-clip)" />
      {/* Dots and labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
          <circle cx={p.x} cy={p.y} r="2" fill="white" />
          {/* Value */}
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] fill-gray-500 dark:fill-gray-400" style={{ fontFamily: "system-ui" }}>
            {formatValue ? formatValue(data[i]) : data[i]}
          </text>
          {/* Label */}
          <text x={p.x} y={height - 4} textAnchor="middle" className="text-[10px] fill-gray-500 dark:fill-gray-400" style={{ fontFamily: "system-ui" }}>
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
  formatValue,
}: {
  data: number[];
  labels: string[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  const width = 500;
  const height = 160;
  const padX = 30;
  const padTop = 20;
  const padBottom = 24;
  const chartH = height - padTop - padBottom;
  const max = Math.max(...data, 1);
  const barCount = data.length;
  const gap = 12;
  const totalGap = gap * (barCount - 1);
  const barW = (width - padX * 2 - totalGap) / barCount;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44" fill="none">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={padX}
          y1={padTop + chartH * (1 - pct)}
          x2={width - padX}
          y2={padTop + chartH * (1 - pct)}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-200 dark:text-gray-800"
        />
      ))}
      {data.map((value, i) => {
        const barH = Math.max((value / max) * chartH, 2);
        const x = padX + i * (barW + gap);
        const y = padTop + chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={color}
              opacity={i === data.length - 1 ? 1 : 0.6}
            />
            {/* Value */}
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="text-[9px] fill-gray-500 dark:fill-gray-400"
              style={{ fontFamily: "system-ui" }}
            >
              {formatValue ? formatValue(value) : value}
            </text>
            {/* Label */}
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              className="text-[10px] fill-gray-500 dark:fill-gray-400"
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
    acc.push(i === 0 ? 0 : acc[i - 1] + (segments[i - 1].value / total) * circumference);
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

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  sparkData,
  sparkColor,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string;
  change: number | null;
  sparkData: number[];
  sparkColor: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
              {label}
            </p>
          </div>
          <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-black dark:text-white">
            {value}
          </p>
          {change !== null && (
            <div className="flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
              >
                {change >= 0 ? "+" : ""}
                {change}% vs last month
              </span>
            </div>
          )}
        </div>
        <MiniChart data={sparkData} color={sparkColor} className="w-20" />
      </div>
    </Card>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dbReady = useDbReady();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [data, settings] = await Promise.all([getInvoices(), getSettings()]);
      setInvoices(data);
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const metrics = useMemo(() => {
    const thisMonth = invoices.filter((inv) => isThisMonth(inv.date));
    const lastMonth = invoices.filter((inv) => isLastMonth(inv.date));

    const thisMonthRevenue = thisMonth.reduce((s, inv) => s + getInvoiceAmount(inv), 0);
    const lastMonthRevenue = lastMonth.reduce((s, inv) => s + getInvoiceAmount(inv), 0);

    const thisMonthPaid = thisMonth.filter((inv) => inv.status === "paid");
    const lastMonthPaid = lastMonth.filter((inv) => inv.status === "paid");
    const thisMonthPaidAmount = thisMonthPaid.reduce((s, inv) => s + getInvoiceAmount(inv), 0);
    const lastMonthPaidAmount = lastMonthPaid.reduce((s, inv) => s + getInvoiceAmount(inv), 0);

    const thisMonthSent = thisMonth.filter((inv) => inv.status === "sent").length;
    const lastMonthSent = lastMonth.filter((inv) => inv.status === "sent").length;

    const overdueInvoices = invoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled" && isOverdue(inv.dueDate),
    );
    const overdueAmount = overdueInvoices.reduce((s, inv) => s + getInvoiceAmount(inv), 0);

    const dueSoonInvoices = invoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled" && isDueSoon(inv.dueDate) && !isOverdue(inv.dueDate),
    );

    const unpaidInvoices = invoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled",
    );
    const unpaidAmount = unpaidInvoices.reduce((s, inv) => s + getInvoiceAmount(inv), 0);

    // Monthly revenue for bar chart (last 6 months)
    const monthlyRevenue: number[] = [];
    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthInvoices = invoices.filter((inv) => {
        const id = new Date(inv.date);
        return id.getMonth() === m && id.getFullYear() === y;
      });
      monthlyRevenue.push(monthInvoices.reduce((s, inv) => s + getInvoiceAmount(inv), 0));
      monthLabels.push(getMonthLabel(i));
    }

    // Monthly invoice count for bar chart (last 6 months)
    const monthlyCount: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      monthlyCount.push(
        invoices.filter((inv) => {
          const id = new Date(inv.date);
          return id.getMonth() === m && id.getFullYear() === y;
        }).length,
      );
    }

    // Status breakdown
    const statusCounts = {
      draft: invoices.filter((inv) => inv.status === "draft").length,
      sent: invoices.filter((inv) => inv.status === "sent").length,
      paid: invoices.filter((inv) => inv.status === "paid").length,
      cancelled: invoices.filter((inv) => inv.status === "cancelled").length,
    };

    // Spark data (last 7 days)
    const now = new Date();
    const sparkRevenue = Array(7).fill(0);
    const sparkCount = Array(7).fill(0);
    const sparkPaid = Array(7).fill(0);
    for (const inv of invoices) {
      const d = new Date(inv.date);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        sparkRevenue[6 - diff] += getInvoiceAmount(inv);
        sparkCount[6 - diff]++;
        if (inv.status === "paid") sparkPaid[6 - diff] += getInvoiceAmount(inv);
      }
    }

    // Recent invoices (last 5)
    const recentInvoices = [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange: pctChange(thisMonthRevenue, lastMonthRevenue),
      thisMonthCount: thisMonth.length,
      lastMonthCount: lastMonth.length,
      countChange: pctChange(thisMonth.length, lastMonth.length),
      thisMonthPaidAmount,
      lastMonthPaidAmount,
      paidChange: pctChange(thisMonthPaidAmount, lastMonthPaidAmount),
      thisMonthSent,
      lastMonthSent,
      sentChange: pctChange(thisMonthSent, lastMonthSent),
      overdueInvoices,
      overdueAmount,
      dueSoonInvoices,
      unpaidAmount,
      unpaidInvoices,
      monthlyRevenue,
      monthlyCount,
      monthLabels,
      statusCounts,
      sparkRevenue,
      sparkCount,
      sparkPaid,
      recentInvoices,
      totalInvoices: invoices.length,
    };
  }, [invoices]);

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
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
          <div className="space-y-8">
            {/* ── Top Metric Cards ─────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Revenue This Month"
                value={formatCurrency(metrics.thisMonthRevenue, defaultCurrency)}
                change={metrics.revenueChange}
                sparkData={metrics.sparkRevenue}
                sparkColor="#6366f1"
                icon={TrendingUp}
                iconColor="bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
              />
              <MetricCard
                label="Invoices This Month"
                value={String(metrics.thisMonthCount)}
                change={metrics.countChange}
                sparkData={metrics.sparkCount}
                sparkColor="#0ea5e9"
                icon={FilePlus2}
                iconColor="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
              />
              <MetricCard
                label="Collected This Month"
                value={formatCurrency(metrics.thisMonthPaidAmount, defaultCurrency)}
                change={metrics.paidChange}
                sparkData={metrics.sparkPaid}
                sparkColor="#10b981"
                icon={TrendingUp}
                iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
              />
              <MetricCard
                label="Outstanding"
                value={formatCurrency(metrics.unpaidAmount, defaultCurrency)}
                change={null}
                sparkData={[]}
                sparkColor="#f59e0b"
                icon={Clock}
                iconColor="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
              />
            </div>

            {/* ── Charts Row ──────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Monthly Revenue */}
              <Card className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
                  Monthly Revenue (Last 6 Months)
                </h3>
                <LineChart
                  data={metrics.monthlyRevenue}
                  labels={metrics.monthLabels}
                  color="#6366f1"
                  formatValue={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                />
              </Card>

              {/* Status Breakdown */}
              <Card>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
                  Invoice Status
                </h3>
                <StatusDonut
                  segments={[
                    { label: "Paid", value: metrics.statusCounts.paid, color: "#10b981" },
                    { label: "Sent", value: metrics.statusCounts.sent, color: "#3b82f6" },
                    { label: "Draft", value: metrics.statusCounts.draft, color: "#9ca3af" },
                    { label: "Cancelled", value: metrics.statusCounts.cancelled, color: "#ef4444" },
                  ]}
                />
              </Card>
            </div>

            {/* ── Alerts & Activity Row ───────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Overdue & Due Soon */}
              <Card>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
                  Attention Required
                </h3>
                <div className="space-y-3">
                  {metrics.overdueInvoices.length === 0 && metrics.dueSoonInvoices.length === 0 ? (
                    <p className="text-sm text-(--muted) py-4">All invoices are on track.</p>
                  ) : (
                    <>
                      {metrics.overdueInvoices.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:hover:bg-red-950/40"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                {inv.invoiceNumber} — {inv.customer.name}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                Due {formatDate(inv.dueDate)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                            {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                          </span>
                        </Link>
                      ))}
                      {metrics.dueSoonInvoices.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 transition-colors hover:bg-yellow-100 dark:border-yellow-900/40 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/40"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                {inv.invoiceNumber} — {inv.customer.name}
                              </p>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                Due {formatDate(inv.dueDate)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                            {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                  {metrics.overdueInvoices.length > 0 && (
                    <div className="pt-2 border-t border-(--border)">
                      <p className="text-xs text-(--muted)">
                        Total overdue:{" "}
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(metrics.overdueAmount, defaultCurrency)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Invoices */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-black dark:text-white">
                    Recent Invoices
                  </h3>
                  <Link
                    href="/invoices"
                    className="text-xs text-(--muted) hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {metrics.recentInvoices.length === 0 ? (
                    <p className="text-sm text-(--muted) py-4">No invoices yet.</p>
                  ) : (
                    metrics.recentInvoices.map((inv) => (
                      <Link
                        key={inv.id}
                        href={`/invoices/${inv.id}`}
                        className="flex items-center justify-between py-2 border-b border-(--border) last:border-0 hover:bg-(--border)/20 -mx-2 px-2 rounded transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">
                            {inv.invoiceNumber}
                          </p>
                          <p className="text-xs text-(--muted)">
                            {inv.customer.name} · {formatDate(inv.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-black dark:text-white tabular-nums">
                            {formatCurrency(getInvoiceAmount(inv), inv.currency)}
                          </p>
                          <span
                            className={`text-[10px] font-semibold uppercase ${
                              inv.status === "paid"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : inv.status === "sent"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : inv.status === "cancelled"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-(--muted)"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* ── Monthly Invoice Count ───────────────────────────── */}
            <Card>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4">
                Invoices Created (Last 6 Months)
              </h3>
              <BarChart
                data={metrics.monthlyCount}
                labels={metrics.monthLabels}
                color="#0ea5e9"
              />
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
