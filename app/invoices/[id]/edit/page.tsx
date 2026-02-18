/**
 * Edit Invoice Page
 * Route: /invoices/[id]/edit
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InvoiceForm from "@/app/components/InvoiceForm";
import type { Invoice } from "@/app/lib/types";
import { getInvoiceById, updateInvoice } from "@/app/lib/storage";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const inv = await getInvoiceById(id);
      if (!inv) {
        setError("Invoice not found");
      }
      setInvoice(inv);
      setIsLoading(false);
    })();
  }, [id]);

  const handleSubmit = async (updatedInvoice: Invoice) => {
    try {
      setError(null);
      await updateInvoice(id, updatedInvoice);
      router.push(`/invoices/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invoice");
    }
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
      <div className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-b-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Invoice Not Found
            </h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-b-[var(--border)] bg-[var(--surface)]">
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
