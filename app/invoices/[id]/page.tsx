/**
 * Invoice Detail Page
 * Route: /invoices/[id]
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
    const inv = getInvoiceById(id);
    setInvoice(inv);
    setIsLoading(false);
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      setIsDownloadingPDF(true);
      const company = getDefaultCompanyDetails();
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
    deleteInvoice(id);
    router.push("/invoices");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Invoice Not Found
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
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
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {formatDate(invoice.date, "long")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/invoices/${id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="danger" onClick={handleDelete}>
                Delete
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invoice Date
                  </p>
                  <p className="font-semibold text-black dark:text-white">
                    {formatDate(invoice.date, "long")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due Date
                  </p>
                  <p className="font-semibold text-black dark:text-white">
                    {formatDate(invoice.dueDate, "long")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Invoice Number
                  </p>
                  <p className="font-semibold text-black dark:text-white">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currency
                  </p>
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
                    className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-800"
                  >
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium text-black dark:text-white">
                  {formatCurrency(total, invoice.currency)}
                </span>
              </div>
              {invoice.taxRate! > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax ({invoice.taxRate!}%)
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {formatCurrency(taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold dark:border-gray-800">
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
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/invoices">
              <Button variant="secondary">Back to Invoices</Button>
            </Link>
            <Button onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
              {isDownloadingPDF ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button variant="secondary">Send Email (Coming Soon)</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
