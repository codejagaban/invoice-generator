/**
 * Create Invoice Page
 * Route: /invoices/create
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InvoiceForm from "@/app/components/InvoiceForm";
import type { Invoice } from "@/app/lib/types";
import { createInvoice, incrementTemplateUsage } from "@/app/lib/storage";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (invoice: Invoice) => {
    try {
      setError(null);
      await createInvoice(invoice);
      if (invoice.templateId) {
        await incrementTemplateUsage(invoice.templateId);
      }
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    }
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Invoice
          </h1>
          <p className="mt-2 text-sm text-(--muted)">
            Fill out the form below to create a new invoice. You can{" "}
            <Link href="/templates" className="font-medium hover:underline">
              load a template
            </Link>{" "}
            to get started faster.
          </p>
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
