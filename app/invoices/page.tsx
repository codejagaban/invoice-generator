/**
 * Invoices Dashboard Page
 * Route: /invoices
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus2, CheckCircle2, Search } from "lucide-react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Card from "@/app/components/shared/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import type { Invoice } from "@/app/lib/types";
import { getInvoices, getSettings, updateInvoice } from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { useDbReady } from "@/app/components/DbScopeProvider";
import { InvoiceListSkeleton } from "@/app/components/shared/Skeleton";
import StatusBadge from "@/app/components/shared/StatusBadge";
import EmptyState from "@/app/components/shared/EmptyState";
import MiniChart, { groupByDay } from "@/app/components/shared/MiniChart";
import { FileText } from "lucide-react";

export default function InvoicesDashboardPage() {
  const dbReady = useDbReady();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "cancelled"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const handleMarkAsPaid = async (e: React.MouseEvent, invoiceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMarkingPaidId(invoiceId);
    const updated = await updateInvoice(invoiceId, { status: "paid" });
    if (updated) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? updated : inv)),
      );
    }
    setMarkingPaidId(null);
  };

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [data, settings] = await Promise.all([getInvoices(), getSettings()]);
      setInvoices(data);
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, [dbReady]);
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          inv.customer.name.toLowerCase().includes(term) ||
          inv.customer.email.toLowerCase().includes(term),
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "date") {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => {
        const amountA = a.items.reduce(
          (sum, item) => sum + item.quantity * item.rate,
          0,
        );
        const amountB = b.items.reduce(
          (sum, item) => sum + item.quantity * item.rate,
          0,
        );
        return amountB - amountA;
      });
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
    }

    return sorted;
  }, [invoices, searchTerm, statusFilter, sortBy]);


  const totalAmount = filteredInvoices.reduce((sum, inv) => {
    return (
      sum +
      inv.items.reduce(
        (itemSum, item) => itemSum + item.quantity * item.rate,
        0,
      )
    );
  }, 0);

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Invoices
            </h1>
            <Link href="/invoices/create">
              <Button variant="outline">
                <FilePlus2 className="h-4 w-4 text-green-500" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {isLoading ? (
          <InvoiceListSkeleton />
        ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                    Total Invoices
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                    {invoices.length}
                  </p>
                </div>
                <MiniChart
                  data={groupByDay(invoices.map((inv) => inv.createdAt))}
                  color="#8b5cf6"
                  className="w-20"
                />
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                    Total Amount
                  </p>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                    {formatCurrency(totalAmount, defaultCurrency)}
                  </p>
                </div>
                <MiniChart
                  data={groupByDay(invoices.map((inv) => inv.createdAt))}
                  color="#0ea5e9"
                  className="w-20"
                />
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">Paid</p>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                    {invoices.filter((inv) => inv.status === "paid").length}
                  </p>
                </div>
                <MiniChart
                  data={groupByDay(
                    invoices
                      .filter((inv) => inv.status === "paid")
                      .map((inv) => inv.updatedAt),
                  )}
                  color="#10b981"
                  className="w-20"
                />
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">Overdue</p>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                    {invoices.filter((inv) => isOverdue(inv.dueDate)).length}
                  </p>
                </div>
                <MiniChart
                  data={groupByDay(
                    invoices
                      .filter((inv) => isOverdue(inv.dueDate))
                      .map((inv) => inv.dueDate),
                  )}
                  color="#f43f5e"
                  className="w-20"
                />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-10">
            <div className="space-y-4 sm:flex sm:gap-4 sm:space-y-0">
              <Input
                type="text"
                placeholder="Search by invoice #, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                leadingIcon={<Search className="h-4 w-4" />}
              />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as "all" | "draft" | "sent" | "paid" | "cancelled",
                  )
                }
              >
                <SelectTrigger className="sm:w-45">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "date" | "amount" | "name")
                }
              >
                <SelectTrigger className="sm:w-45">
                  <SelectValue placeholder="Sort by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="amount">Sort by Amount</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Table */}
          {filteredInvoices.length === 0 ? (
            <Card>
              <EmptyState
                icon={FileText}
                title="No invoices found"
                description={searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters." : "Create your first invoice to get started."}
              >
                {!searchTerm && statusFilter === "all" && (
                  <Link href="/invoices/create">
                    <Button variant="secondary">Create Your First Invoice</Button>
                  </Link>
                )}
              </EmptyState>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0!">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--border) bg-(--surface)">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-(--muted)">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-(--muted)"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {filteredInvoices.map((invoice) => {
                      const amount = invoice.items.reduce(
                        (sum, item) => sum + item.quantity * item.rate,
                        0,
                      );
                      const overdue = isOverdue(invoice.dueDate);
                      const dueSoon = isDueSoon(invoice.dueDate);

                      return (
                        <tr
                          key={invoice.id}
                          className="cursor-pointer transition-colors hover:bg-(--border)/30"
                          onClick={() => window.location.href = `/invoices/${invoice.id}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-black dark:text-white">{invoice.invoiceNumber}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-(--muted)">
                            {invoice.customer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-(--muted)">
                            {formatDate(invoice.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={overdue ? "text-red-600 dark:text-red-400 font-medium" : dueSoon ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-(--muted)"}>
                              {formatDate(invoice.dueDate)}
                            </span>
                            {overdue && (
                              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                OVERDUE
                              </span>
                            )}
                            {dueSoon && !overdue && (
                              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                DUE SOON
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={invoice.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-black dark:text-white">
                            {formatCurrency(amount, invoice.currency)}
                          </td>
                          <td className="px-6 py-0 whitespace-nowrap text-right">
                            {invoice.status !== "paid" && (
                              <button
                                className="inline-flex items-center justify-center rounded p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                                onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(e, invoice.id); }}
                                disabled={markingPaidId === invoice.id}
                                title="Mark as paid"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
