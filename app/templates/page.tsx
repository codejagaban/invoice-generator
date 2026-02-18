/**
 * Invoice Templates Page
 * Route: /templates
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, LayoutTemplate, Trash2 } from "lucide-react";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { InvoiceTemplate } from "@/app/lib/types";
import { getTemplates, deleteTemplate } from "@/app/lib/storage";
import { formatDate } from "@/app/lib/invoice";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getTemplates();
      setTemplates(data);
      setIsLoading(false);
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    await deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleUseTemplate = (template: InvoiceTemplate) => {
    // Store template in session for the create form to pick up
    sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
    // Redirect to create invoice page
    window.location.href = "/invoices/create";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Invoice Templates
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-6">
          {templates.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  No templates yet. Create an invoice and save it as a template
                  to reuse it.
                </p>
                <Link href="/invoices/create">
                  <Button variant="outline">
                    <FilePlus2 className="h-4 w-4 text-green-500" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    )}
                    <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-800">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Customer
                        </p>
                        <p className="font-medium text-black dark:text-white">
                          {template.customer.name || "Template"}
                        </p>
                      </div>
                      {template.items && template.items.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Items
                          </p>
                          <p className="font-medium text-black dark:text-white">
                            {template.items.length} item
                            {template.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Created
                        </p>
                        <p className="text-sm text-black dark:text-white">
                          {formatDate(template.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <LayoutTemplate className="h-4 w-4 text-blue-400" />
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
