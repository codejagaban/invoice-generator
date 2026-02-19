/**
 * Invoice Detail Page
 * Route: /invoices/[id]
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft, FileDown, Mail } from "lucide-react";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { Invoice } from "@/app/lib/types";
import {
  getInvoiceById,
  deleteInvoice,
  getDefaultCompanyDetails,
} from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  daysUntilDue,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { downloadInvoicePDF } from "@/app/lib/pdf";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    (async () => {
      const inv = await getInvoiceById(id);
      setInvoice(inv);
      setIsLoading(false);
    })();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      setIsDownloadingPDF(true);
      const company = await getDefaultCompanyDetails();
      await downloadInvoicePDF(invoice, company || undefined);
    } catch (error) {
      alert("Failed to download PDF. Please try again.");
      console.error(error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    await deleteInvoice(id);
    router.push("/invoices");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-b-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Invoice Not Found
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">
          <p className="mb-4 text-[var(--muted)]">
            The invoice you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/invoices"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Invoices
          </Link>
        </main>
      </div>
    );
  }

  const daysRemaining = daysUntilDue(invoice.dueDate);
  const overdue = isOverdue(invoice.dueDate);
  const dueSoon = isDueSoon(invoice.dueDate);

  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const taxAmount = (total * (invoice.taxRate || 0)) / 100;
  const totalWithTax = total + taxAmount;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-b-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-[var(--muted)]">
                {formatDate(invoice.date, "long")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/invoices/${id}/edit`}>
                <Button variant="ghost" size="sm" className="w-9 px-0">
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 px-0"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full font-medium text-white ${
                invoice.status === "paid"
                  ? "bg-green-600"
                  : invoice.status === "sent"
                    ? "bg-blue-600"
                    : "bg-gray-600"
              }`}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
            {overdue && (
              <div className="px-4 py-2 rounded-full bg-red-100 font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                Overdue by {Math.abs(daysRemaining)} days
              </div>
            )}
            {dueSoon && !overdue && (
              <div className="px-4 py-2 rounded-full bg-yellow-100 font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                Due in {daysRemaining} days
              </div>
            )}
          </div>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-black dark:text-white">
              <p className="font-semibold">{invoice.customer.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {invoice.customer.email}
              </p>
              {invoice.customer.address && (
                <>
                  <p className="text-sm">{invoice.customer.address}</p>
                  <p className="text-sm">
                    {invoice.customer.city}, {invoice.customer.state}{" "}
                    {invoice.customer.zipCode}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">Invoice Date</p>
                  <p className="font-semibold text-black dark:text-white">
                    {formatDate(invoice.date, "long")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Due Date</p>
                  <p className="font-semibold text-black dark:text-white">
                    {formatDate(invoice.dueDate, "long")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">Invoice Number</p>
                  <p className="font-semibold text-black dark:text-white">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Currency</p>
                  <p className="font-semibold text-black dark:text-white">
                    {invoice.currency}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b py-2 [border-color:var(--border)]"
                  >
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {item.quantity} ×{" "}
                        {formatCurrency(item.rate, invoice.currency)}
                      </p>
                    </div>
                    <p className="font-semibold text-black dark:text-white">
                      {formatCurrency(
                        item.quantity * item.rate,
                        invoice.currency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Subtotal</span>
                <span className="font-medium text-black dark:text-white">
                  {formatCurrency(total, invoice.currency)}
                </span>
              </div>
              {invoice.taxRate! > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">
                    Tax ({invoice.taxRate!}%)
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {formatCurrency(taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg font-bold [border-color:var(--border)]">
                <span className="text-black dark:text-white">Total</span>
                <span className="text-black dark:text-white">
                  {formatCurrency(totalWithTax, invoice.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-[var(--muted)]">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/invoices">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>
            <Button onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
              <FileDown className="h-4 w-4" />
              {isDownloadingPDF ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button variant="secondary" disabled>
              <Mail className="h-4 w-4" />
              Send Email{" "}
              <span className="text-xs text-[var(--muted)]">(Coming Soon)</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
