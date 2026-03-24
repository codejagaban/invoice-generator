/**
 * Edit Invoice Page
 * Route: /invoices/[id]/edit
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import InvoiceForm from "@/app/components/InvoiceForm";
import type { Invoice } from "@/app/lib/types";
import { getInvoiceById, updateInvoice } from "@/app/lib/storage";
import { useDbReady } from "@/app/components/DbScopeProvider";

export default function EditInvoicePage() {
  const dbReady = useDbReady();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const inv = await getInvoiceById(id);
      if (!inv) {
        setError("Invoice not found");
      }
      setInvoice(inv);
      setIsLoading(false);
    })();
  }, [id, dbReady]);

  const handleSubmit = async (updatedInvoice: Invoice) => {
    try {
      setError(null);
      await updateInvoice(id, updatedInvoice);
      router.push(`/invoices/${id}`);
    } catch (err) {
      console.error("[EditInvoice]", err);
      setError("Failed to update invoice. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-(--border) border-t-black dark:border-t-white" />
          <p className="text-sm text-(--muted)">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <FileText className="h-7 w-7 text-(--muted)" />
          </div>
          <h2 className="text-xl font-semibold text-black dark:text-white">Invoice not found</h2>
          <p className="mt-2 text-sm text-(--muted)">
            This invoice may have been deleted or the link is incorrect.
          </p>
          <Link href="/invoices" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-black dark:text-white hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Edit Invoice {invoice.invoiceNumber}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <InvoiceForm initialData={invoice} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
