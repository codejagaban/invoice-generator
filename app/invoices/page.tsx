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
import { InvoiceListSkeleton } from "@/app/components/shared/Skeleton";
import StatusBadge from "@/app/components/shared/StatusBadge";
import EmptyState from "@/app/components/shared/EmptyState";
import { FileText } from "lucide-react";

export default function InvoicesDashboardPage() {
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
    (async () => {
      const [data, settings] = await Promise.all([getInvoices(), getSettings()]);
      setInvoices(data);
      setDefaultCurrency(settings.defaultCurrency);
      setIsLoading(false);
    })();
  }, []);
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
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                  Total Invoices
                </p>
                <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                  {invoices.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
                  Total Amount
                </p>
                <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-black dark:text-white">
                  {formatCurrency(totalAmount, defaultCurrency)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">Paid</p>
                <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-green-600 dark:text-green-400">
                  {invoices.filter((inv) => inv.status === "paid").length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">Overdue</p>
                <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-red-600 dark:text-red-400">
                  {invoices.filter((inv) => isOverdue(inv.dueDate)).length}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
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
          </Card>

          {/* Invoice List */}
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
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => {
                const amount = invoice.items.reduce(
                  (sum, item) => sum + item.quantity * item.rate,
                  0,
                );
                const overdue = isOverdue(invoice.dueDate);
                const dueSoon = isDueSoon(invoice.dueDate);

                return (
                  <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                    <Card className="hover:border-black dark:hover:border-white cursor-pointer transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-black dark:text-white">
                              {invoice.invoiceNumber}
                            </h3>
                            <StatusBadge status={invoice.status} />
                            {overdue && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                Overdue
                              </span>
                            )}
                            {dueSoon && !overdue && (
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                Due Soon
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-(--muted) flex-wrap">
                            <span>{invoice.customer.name}</span>
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-black dark:text-white">
                              {formatCurrency(amount, invoice.currency)}
                            </p>
                            <p className="text-sm text-(--muted)">
                              Due: {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          {invoice.status !== "paid" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              onClick={(e) => handleMarkAsPaid(e, invoice.id)}
                              disabled={markingPaidId === invoice.id}
                              title="Mark as paid"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
