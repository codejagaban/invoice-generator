/**
 * Invoice Detail Page
 * Route: /invoices/[id]
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft, FileDown, Mail, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/app/components/shared/StatusBadge";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Card from "@/app/components/shared/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/shared/Dialog";
import type { Invoice } from "@/app/lib/types";
import {
  getInvoiceById,
  deleteInvoice,
  updateInvoice,
  getDefaultCompanyDetails,
  getDefaultAccountDetails,
} from "@/app/lib/storage";
import {
  formatDate,
  formatCurrency,
  daysUntilDue,
  isOverdue,
  isDueSoon,
} from "@/app/lib/invoice";
import { downloadInvoicePDF, generateInvoiceEmailHTML, generateInvoicePDFBase64 } from "@/app/lib/pdf";
import { useDbReady } from "@/app/components/DbScopeProvider";

export default function InvoiceDetailPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipientEmail: "",
    subject: "",
    message: "",
  });
  const [emailResult, setEmailResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const inv = await getInvoiceById(id);
      setInvoice(inv);
      setIsLoading(false);
    })();
  }, [id, dbReady]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      setIsDownloadingPDF(true);
      const account = await getDefaultAccountDetails();
      const company = invoice.company || (await getDefaultCompanyDetails());
      await downloadInvoicePDF(invoice, company || undefined, account || undefined);
    } catch (error) {
      toast.error("Failed to download PDF. Please try again.");
      console.error(error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ description: "Are you sure you want to delete this invoice?", variant: "danger", confirmLabel: "Delete" });
    if (!ok) return;
    await deleteInvoice(id);
    router.push("/invoices");
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    setIsMarkingPaid(true);
    const updated = await updateInvoice(id, { status: "paid" });
    if (updated) setInvoice(updated);
    setIsMarkingPaid(false);
  };

  const openEmailDialog = () => {
    if (!invoice) return;
    setEmailForm({
      recipientEmail: invoice.customer.email || "",
      subject: `Invoice ${invoice.invoiceNumber}`,
      message: `Hi ${invoice.customer.name},\n\nPlease find your invoice ${invoice.invoiceNumber} below.\n\nThank you for your business.`,
    });
    setEmailResult(null);
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    setIsSendingEmail(true);
    setEmailResult(null);

    try {
      const account = await getDefaultAccountDetails();
      const company = invoice.company || (await getDefaultCompanyDetails());
      const invoiceHtml = generateInvoiceEmailHTML(invoice, company || undefined, account || undefined);
      const pdfBase64 = await generateInvoicePDFBase64(invoice, company || undefined, account || undefined);

      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: emailForm.recipientEmail,
          subject: emailForm.subject,
          message: emailForm.message,
          invoiceHtml,
          invoiceNumber: invoice.invoiceNumber,
          pdfBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailResult({ error: data.error || "Failed to send email" });
        return;
      }

      setEmailResult({ success: true });

      // Mark invoice as sent if it's still a draft
      if (invoice.status === "draft") {
        const updated = await updateInvoice(id, { status: "sent" });
        if (updated) setInvoice(updated);
      }
    } catch {
      setEmailResult({ error: "Network error. Please try again." });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-(--muted)">Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-(--background)">
        <header className="border-b border-b-(--border) bg-(--surface)">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Invoice Not Found
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">
          <p className="mb-4 text-(--muted)">
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
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {invoice.invoiceNumber}
              </h1>
              <p className="mt-1 text-(--muted)">
                {formatDate(invoice.date, "long")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/invoices/${id}/edit`}>
                <Button variant="ghost" size="sm" className="w-9 px-0" aria-label="Edit invoice">
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 px-0"
                onClick={handleDelete}
                aria-label="Delete invoice"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-6">
          {/* ── Hero: Total + Status + Actions ─────────────────── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Total Amount Card */}
            <Card className="lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-(--muted) mb-1">Total Amount</p>
                  <p className="text-4xl font-bold text-black dark:text-white tabular-nums tracking-tight">
                    {formatCurrency(totalWithTax, invoice.currency)}
                  </p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <StatusBadge status={invoice.status} size="md" />
                    {overdue && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        Overdue by {Math.abs(daysRemaining)} days
                      </span>
                    )}
                    {dueSoon && !overdue && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                        Due in {daysRemaining} days
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-(--muted) bg-(--surface) border border-(--border) rounded-md px-2 py-0.5">
                  {invoice.currency}
                </span>
              </div>
              {/* Quick stats */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-(--border)">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted)">Invoice #</p>
                  <p className="text-sm font-semibold text-black dark:text-white mt-0.5">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted)">Issued</p>
                  <p className="text-sm font-semibold text-black dark:text-white mt-0.5">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted)">Due Date</p>
                  <p className={`text-sm font-semibold mt-0.5 ${overdue ? "text-red-600 dark:text-red-400" : "text-black dark:text-white"}`}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted)">Items</p>
                  <p className="text-sm font-semibold text-black dark:text-white mt-0.5">{invoice.items.length}</p>
                </div>
              </div>
            </Card>

            {/* Actions + Customer Card */}
            <div className="space-y-4">
              {/* Actions */}
              <Card>
                <p className="text-xs font-medium uppercase tracking-wider text-(--muted) mb-3">Actions</p>
                <div className="space-y-2">
                  {invoice.status !== "paid" && (
                    <Button
                      onClick={handleMarkAsPaid}
                      disabled={isMarkingPaid}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isMarkingPaid ? "Updating..." : "Mark as Paid"}
                    </Button>
                  )}
                  <Button onClick={handleDownloadPDF} disabled={isDownloadingPDF} className="w-full justify-center" variant="outline">
                    <FileDown className="h-4 w-4" />
                    {isDownloadingPDF ? "Generating..." : "Download PDF"}
                  </Button>
                  <Button variant="outline" onClick={openEmailDialog} className="w-full justify-center">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </Button>
                  <Link href={`/invoices/${id}/edit`} className="block">
                    <Button variant="ghost" className="w-full justify-center">
                      <Pencil className="h-4 w-4" />
                      Edit Invoice
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* ── Bill To ───────────────────────────────────────── */}
          <Card>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 shrink-0">
                {invoice.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted) mb-1">Bill To</p>
                <p className="font-semibold text-black dark:text-white">{invoice.customer.name}</p>
                <p className="text-sm text-(--muted)">{invoice.customer.email}</p>
                {invoice.customer.address && (
                  <p className="text-sm text-(--muted) mt-1">
                    {invoice.customer.address}
                    {invoice.customer.city && <>, {invoice.customer.city}</>}
                    {invoice.customer.state && <>, {invoice.customer.state}</>}
                    {invoice.customer.zipCode && <> {invoice.customer.zipCode}</>}
                    {invoice.customer.country && <>, {invoice.customer.country}</>}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* ── Line Items Table ──────────────────────────────── */}
          <Card className="overflow-hidden p-0!">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-base font-bold text-black dark:text-white">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-(--border) bg-(--surface)">
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Description</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Qty</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Rate</th>
                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-(--muted)">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-black dark:text-white">{item.description}</p>
                        {item.type === "hours" && <p className="text-xs text-(--muted)">Hourly</p>}
                      </td>
                      <td className="px-5 py-3 text-right text-(--muted) tabular-nums">
                        {item.type === "hours" ? `${item.quantity} hrs` : item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-(--muted) tabular-nums">
                        {formatCurrency(item.rate, invoice.currency)}{item.type === "hours" ? "/hr" : ""}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-black dark:text-white tabular-nums">
                        {formatCurrency(item.quantity * item.rate, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals inside the card */}
            <div className="border-t border-(--border) px-5 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">Subtotal</span>
                <span className="font-medium text-black dark:text-white tabular-nums">{formatCurrency(total, invoice.currency)}</span>
              </div>
              {invoice.taxRate! > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-(--muted)">Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium text-black dark:text-white tabular-nums">{formatCurrency(taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-(--border) text-base font-bold">
                <span className="text-black dark:text-white">Total</span>
                <span className="text-black dark:text-white tabular-nums">{formatCurrency(totalWithTax, invoice.currency)}</span>
              </div>
            </div>
          </Card>

          {/* ── Notes ─────────────────────────────────────────── */}
          {invoice.notes && (
            <Card>
              <p className="text-[10px] font-medium uppercase tracking-wider text-(--muted) mb-2">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-(--muted) leading-relaxed">{invoice.notes}</p>
            </Card>
          )}

          {/* Back link */}
          <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-(--muted) hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Invoices
          </Link>
        </div>
      </main>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice via Email</DialogTitle>
            <DialogDescription>
              Send {invoice.invoiceNumber} to your client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1.5">
                Recipient Email
              </label>
              <Input
                type="email"
                value={emailForm.recipientEmail}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, recipientEmail: e.target.value }))
                }
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1.5">
                Subject
              </label>
              <Input
                type="text"
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, subject: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1.5">
                Message (optional)
              </label>
              <textarea
                value={emailForm.message}
                onChange={(e) =>
                  setEmailForm((prev) => ({ ...prev, message: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-2 text-sm text-black dark:text-white placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
              />
            </div>

            {emailResult?.error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {emailResult.error}
              </div>
            )}
            {emailResult?.success && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                Email sent successfully!
              </div>
            )}
          </div>

          <DialogFooter>
            {emailResult?.success ? (
              <Button onClick={() => setEmailDialogOpen(false)}>Done</Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setEmailDialogOpen(false)}
                  disabled={isSendingEmail}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !emailForm.recipientEmail}
                >
                  <Mail className="h-4 w-4" />
                  {isSendingEmail ? "Sending..." : "Send"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    <ConfirmDialogUI />
    </div>
  );
}
