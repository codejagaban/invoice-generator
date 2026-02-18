/**
 * Invoices Dashboard Page
 * Route: /invoices
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
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
import { getInvoices } from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";

export default function InvoicesDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "sent" | "paid" | "cancelled"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");

  useEffect(() => {
    const data = getInvoices();
    setInvoices(data);
  }, []);
  useEffect(() => {
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
    if (sortBy === "date") {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    } else if (sortBy === "amount") {
      filtered.sort((a, b) => {
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
      filtered.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

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
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
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
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {invoices.length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {formatCurrency(totalAmount, "USD")}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {invoices.filter((inv) => inv.status === "paid").length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
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
              />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as "all" | "draft" | "sent" | "paid" | "cancelled",
                  )
                }
              >
                <SelectTrigger className="sm:w-[180px]">
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
                <SelectTrigger className="sm:w-[180px]">
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
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No invoices found.
                </p>
                <Link href="/invoices/create">
                  <Button variant="secondary" className="mt-4">
                    Create Your First Invoice
                  </Button>
                </Link>
              </div>
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
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}
                            >
                              {invoice.status}
                            </span>
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
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <span>{invoice.customer.name}</span>
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black dark:text-white">
                            {formatCurrency(amount, invoice.currency)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
