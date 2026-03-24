/**
 * Invoices Dashboard Page
 * Route: /invoices
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FilePlus2,
  Search,
  Pencil,
  FileDown,
  Trash2,
  CheckCircle2,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";
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
import {
  getInvoices,
  getSettings,
  updateInvoice,
  deleteInvoice,
  getDefaultCompanyDetails,
  getDefaultAccountDetails,
} from "@/app/lib/storage";
import { downloadInvoicePDF } from "@/app/lib/pdf";
import { prefetchRates, convertWithRates } from "@/app/lib/currency";
import {
  formatDate,
  formatCurrency,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { useDbReady } from "@/app/components/DbScopeProvider";
import { InvoiceListSkeleton } from "@/app/components/shared/Skeleton";

import EmptyState from "@/app/components/shared/EmptyState";
import MiniChart, { groupByDay } from "@/app/components/shared/MiniChart";
import { FileText } from "lucide-react";

export default function InvoicesDashboardPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "cancelled"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [defaultCurrency, setDefaultCurrency] = useState("GBP");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: Invoice["status"],
  ) => {
    setUpdatingStatusId(invoiceId);
    const updated = await updateInvoice(invoiceId, { status: newStatus });
    if (updated) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? updated : inv)),
      );
    }
    setUpdatingStatusId(null);
  };

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

  const [rates, setRates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (invoices.length === 0) return;
    (async () => {
      const currencies = [...new Set(invoices.map((inv) => inv.currency))];
      const r = await prefetchRates(currencies, defaultCurrency);
      setRates(r);
    })();
  }, [invoices, defaultCurrency]);

  const totalAmount = useMemo(() => {
    if (rates.size === 0) return 0;
    return filteredInvoices.reduce((sum, inv) => {
      const amount = inv.items.reduce(
        (s, item) => s + item.quantity * item.rate,
        0,
      );
      return sum + convertWithRates(amount, inv.currency, rates);
    }, 0);
  }, [filteredInvoices, rates]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / perPage));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const selectedInvoices = filteredInvoices.filter((inv) =>
    selectedIds.has(inv.id),
  );

  const toggleSelectAll = () => {
    const pageIds = paginatedInvoices.map((inv) => inv.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => new Set([...prev, ...pageIds]));
    }
  };

  const handleBulkDownload = async () => {
    setBulkActionInProgress(true);
    try {
      const [company, account] = await Promise.all([
        getDefaultCompanyDetails(),
        getDefaultAccountDetails(),
      ]);
      for (const inv of selectedInvoices) {
        const co = inv.company || company || undefined;
        await downloadInvoicePDF(inv, co, account || undefined);
        await new Promise((r) => setTimeout(r, 500));
      }
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkStatusChange = async (status: Invoice["status"]) => {
    setBulkActionInProgress(true);
    try {
      const updates = await Promise.all(
        selectedInvoices.map((inv) => updateInvoice(inv.id, { status })),
      );
      setInvoices((prev) =>
        prev.map((inv) => {
          const updated = updates.find((u) => u?.id === inv.id);
          return updated || inv;
        }),
      );
      setSelectedIds(new Set());
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      description: `Delete ${selectedInvoices.length} invoice${selectedInvoices.length !== 1 ? "s" : ""}? This cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    setBulkActionInProgress(true);
    try {
      await Promise.all(selectedInvoices.map((inv) => deleteInvoice(inv.id)));
      setInvoices((prev) => prev.filter((inv) => !selectedIds.has(inv.id)));
      setSelectedIds(new Set());
    } finally {
      setBulkActionInProgress(false);
    }
  };

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
                    <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                      Paid
                    </p>
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
                    <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                      Overdue
                    </p>
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
                  description={
                    searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Create your first invoice to get started."
                  }
                >
                  {!searchTerm && statusFilter === "all" && (
                    <Link href="/invoices/create">
                      <Button variant="secondary">
                        Create Your First Invoice
                      </Button>
                    </Link>
                  )}
                </EmptyState>
              </Card>
            ) : (
              <>
                {/* Bulk Action Bar */}
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--surface) px-4 py-3">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {selectedIds.size} selected
                    </span>
                    <div className="h-4 w-px bg-(--border)" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBulkDownload}
                      disabled={bulkActionInProgress}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Download PDFs
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBulkStatusChange("paid")}
                      disabled={bulkActionInProgress}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBulkStatusChange("sent")}
                      disabled={bulkActionInProgress}
                    >
                      <Send className="h-3.5 w-3.5 text-blue-600" />
                      Mark Sent
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBulkDelete}
                      disabled={bulkActionInProgress}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      Delete
                    </Button>
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                <Card className="overflow-hidden p-0!">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-(--border) bg-(--surface)">
                          <th
                            className="w-10 px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={
                                paginatedInvoices.length > 0 &&
                                paginatedInvoices.every((inv) =>
                                  selectedIds.has(inv.id),
                                )
                              }
                              onChange={toggleSelectAll}
                              className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Invoice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-(--muted)">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--border)">
                        {paginatedInvoices.map((invoice) => {
                          const amount = invoice.items.reduce(
                            (sum, item) => sum + item.quantity * item.rate,
                            0,
                          );
                          const overdue = isOverdue(invoice.dueDate);
                          const dueSoon = isDueSoon(invoice.dueDate);
                          const isSelected = selectedIds.has(invoice.id);

                          return (
                            <tr
                              key={invoice.id}
                              className={`cursor-pointer transition-colors hover:bg-(--border)/30 ${isSelected ? "bg-(--border)/20" : ""}`}
                              onClick={() =>
                                (window.location.href = `/invoices/${invoice.id}`)
                              }
                            >
                              <td
                                className="w-10 px-4 py-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(invoice.id)}
                                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-black dark:text-white">
                                  {invoice.invoiceNumber}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-(--muted)">
                                {invoice.customer.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-(--muted)">
                                {formatDate(invoice.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={
                                    overdue
                                      ? "text-red-600 dark:text-red-400 font-medium"
                                      : dueSoon
                                        ? "text-yellow-600 dark:text-yellow-400 font-medium"
                                        : "text-(--muted)"
                                  }
                                >
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
                              <td
                                className="px-6 py-4 whitespace-nowrap group/status"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label className="relative inline-flex items-center gap-1.5 cursor-pointer">
                                  <select
                                    value={invoice.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        invoice.id,
                                        e.target.value as Invoice["status"],
                                      )
                                    }
                                    disabled={updatingStatusId === invoice.id}
                                    className="appearance-none cursor-pointer border-0 bg-transparent p-0 text-xs font-medium focus:outline-none disabled:opacity-50"
                                    style={{
                                      color:
                                        invoice.status === "paid"
                                          ? "#16a34a"
                                          : invoice.status === "sent"
                                            ? "#2563eb"
                                            : invoice.status === "cancelled"
                                              ? "#dc2626"
                                              : "#666",
                                    }}
                                  >
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  <Pencil className="h-3 w-3 text-(--muted) opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none" />
                                </label>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-black dark:text-white">
                                {formatCurrency(amount, invoice.currency)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-(--muted)">
                      Showing {(currentPage - 1) * perPage + 1}–
                      {Math.min(currentPage * perPage, filteredInvoices.length)}{" "}
                      of {filteredInvoices.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--border) text-(--muted) hover:bg-(--surface) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1,
                        )
                        .reduce<(number | "...")[]>((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span
                              key={`dot-${i}`}
                              className="px-1 text-(--muted)"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                currentPage === p
                                  ? "bg-black text-white dark:bg-white dark:text-black"
                                  : "border border-(--border) text-(--muted) hover:bg-(--surface)"
                              }`}
                            >
                              {p}
                            </button>
                          ),
                        )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--border) text-(--muted) hover:bg-(--surface) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
      <ConfirmDialogUI />
    </div>
  );
}
