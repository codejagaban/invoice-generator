/**
 * Invoice Templates Page
 * Route: /templates
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDbReady } from "@/app/components/DbScopeProvider";
import Link from "next/link";
import { FilePlus2, LayoutTemplate, Trash2, BookTemplate } from "lucide-react";
import Button from "@/app/components/shared/Button";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { InvoiceTemplate } from "@/app/lib/types";
import { getTemplates, deleteTemplate, incrementTemplateUsage } from "@/app/lib/storage";
import { formatDate } from "@/app/lib/invoice";
import { TemplateListSkeleton } from "@/app/components/shared/Skeleton";
import EmptyState from "@/app/components/shared/EmptyState";

export default function TemplatesPage() {
  const dbReady = useDbReady();
  const router = useRouter();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const data = await getTemplates();
      setTemplates(data);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    await deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleUseTemplate = async (template: InvoiceTemplate) => {
    // Increment usage count
    await incrementTemplateUsage(template.id);
    setTemplates((prev) =>
      prev.map((t) => t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t)
    );
    // Store template in session for the create form to pick up
    sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
    // Redirect to create invoice page
    router.push("/invoices/create");
  };

  return (
    <div className="min-h-screen bg-(--background)">
      <header className="border-b border-b-(--border) bg-(--surface)">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Invoice Templates
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {isLoading ? (
          <TemplateListSkeleton />
        ) :
        <div className="space-y-6">
          {templates.length === 0 ? (
            <Card>
              <EmptyState
                icon={BookTemplate}
                title="No templates yet"
                description="Create an invoice and save it as a template to reuse it."
              >
                <Link href="/invoices/create">
                  <Button variant="outline">
                    <FilePlus2 className="h-4 w-4 text-green-500" />
                    Create Invoice
                  </Button>
                </Link>
              </EmptyState>
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
                      <p className="text-sm text-(--muted)">
                        {template.description}
                      </p>
                    )}
                    <div className="space-y-2 border-t pt-3 border-(--border)">
                      <div>
                        <p className="text-xs text-(--muted)">Customer</p>
                        <p className="font-medium text-black dark:text-white">
                          {template.customer.name || "Template"}
                        </p>
                      </div>
                      <div>
                          <p className="text-xs text-(--muted)">Used</p>
                          <p className="font-medium text-black dark:text-white">
                            {template.usageCount} time
                            {template.usageCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      <div>
                        <p className="text-xs text-(--muted)">Created</p>
                        <p className="text-sm text-black dark:text-white">
                          {formatDate(template.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t pt-3 border-(--border)">
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
        }
      </main>
    </div>
  );
}
