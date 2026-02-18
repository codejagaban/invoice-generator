/**
 * Create Invoice Page
 * Route: /invoices/create
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import InvoiceForm from "@/app/components/InvoiceForm";
import type { Invoice } from "@/app/lib/types";
import { createInvoice } from "@/app/lib/storage";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (invoice: Invoice) => {
    try {
      setError(null);
      createInvoice(invoice);
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Invoice
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <InvoiceForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
