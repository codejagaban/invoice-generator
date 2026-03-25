/**
 * Invoice Templates Page
 * Route: /templates
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDbReady } from "@/app/components/DbScopeProvider";
import Link from "next/link";
import { FilePlus2, LayoutTemplate, Trash2, BookTemplate, Pencil, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useConfirm } from "@/app/components/shared/ConfirmDialog";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/shared/Select";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { InvoiceTemplate, InvoiceItem, AccountDetails } from "@/app/lib/types";
import { getTemplates, deleteTemplate, updateTemplate, getAccountDetails } from "@/app/lib/storage";
import { formatDate } from "@/app/lib/invoice";
import { TemplateListSkeleton } from "@/app/components/shared/Skeleton";
import EmptyState from "@/app/components/shared/EmptyState";

export default function TemplatesPage() {
  const [confirm, ConfirmDialogUI] = useConfirm();
  const dbReady = useDbReady();
  const router = useRouter();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const [data, accs] = await Promise.all([getTemplates(), getAccountDetails()]);
      setTemplates(data);
      setAccounts(accs);
      setIsLoading(false);
    })();
  }, [dbReady]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ description: "Are you sure you want to delete this template?", variant: "danger", confirmLabel: "Delete" });
    if (!ok) return;
    await deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const [accounts, setAccounts] = useState<AccountDetails[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    customerCity: "",
    customerState: "",
    customerZipCode: "",
    customerCountry: "",
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZipCode: "",
    companyCountry: "",
    companyLogo: "",
    companyTaxId: "",
    accountId: "",
    notes: "",
    taxRate: 0,
    currency: "GBP",
    items: [] as Partial<InvoiceItem>[],
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEdit = (template: InvoiceTemplate) => {
    setEditForm({
      name: template.name,
      description: template.description || "",
      customerName: template.customer.name || "",
      customerEmail: template.customer.email || "",
      customerAddress: template.customer.address || "",
      customerCity: template.customer.city || "",
      customerState: template.customer.state || "",
      customerZipCode: template.customer.zipCode || "",
      customerCountry: template.customer.country || "",
      companyName: template.company?.name || "",
      companyEmail: template.company?.email || "",
      companyPhone: template.company?.phone || "",
      companyAddress: template.company?.address || "",
      companyCity: template.company?.city || "",
      companyState: template.company?.state || "",
      companyZipCode: template.company?.zipCode || "",
      companyCountry: template.company?.country || "",
      companyLogo: template.company?.logo || "",
      companyTaxId: template.company?.taxId || "",
      accountId: template.accountId || "",
      notes: template.notes || "",
      taxRate: template.taxRate || 0,
      currency: template.currency,
      items: template.items.length > 0 ? template.items : [{ description: "", quantity: 1, rate: 0 }],
    });
    setEditingTemplate(template);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    if (!editForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    setIsSaving(true);
    try {
      const updates: Partial<InvoiceTemplate> = {
        name: editForm.name,
        description: editForm.description || undefined,
        customer: {
          name: editForm.customerName,
          email: editForm.customerEmail,
          address: editForm.customerAddress,
          city: editForm.customerCity,
          state: editForm.customerState,
          zipCode: editForm.customerZipCode,
          country: editForm.customerCountry,
        },
        company: editForm.companyName ? {
          name: editForm.companyName,
          email: editForm.companyEmail,
          phone: editForm.companyPhone || undefined,
          address: editForm.companyAddress,
          city: editForm.companyCity,
          state: editForm.companyState,
          zipCode: editForm.companyZipCode,
          country: editForm.companyCountry,
          logo: editForm.companyLogo || undefined,
          taxId: editForm.companyTaxId || undefined,
        } : undefined,
        accountId: editForm.accountId && editForm.accountId !== "none" ? editForm.accountId : undefined,
        items: editForm.items,
        notes: editForm.notes || undefined,
        taxRate: editForm.taxRate,
        currency: editForm.currency,
      };
      const updated = await updateTemplate(editingTemplate.id, updates);
      if (updated) {
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success("Template updated");
      }
      setEditingTemplate(null);
    } catch {
      toast.error("Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  const addEditItem = () => {
    setEditForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, rate: 0 }],
    }));
  };

  const removeEditItem = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateEditItem = (index: number, field: string, value: string | number) => {
    setEditForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleUseTemplate = (template: InvoiceTemplate) => {
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
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="h-4 w-4" />
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

      {/* Edit Template Modal */}
      <AnimatePresence>
      {editingTemplate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[3px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTemplate(null); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-(--border) bg-white dark:bg-[#1a1a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
              <h2 className="text-lg font-semibold text-black dark:text-white">Edit Template</h2>
              <button onClick={() => setEditingTemplate(null)} className="text-(--muted) hover:text-black dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {/* Template Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-(--muted)">Template Name *</label>
                  <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-(--muted)">Description</label>
                  <Input value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Customer</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Name</label>
                    <Input value={editForm.customerName} onChange={(e) => setEditForm((p) => ({ ...p, customerName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Email</label>
                    <Input value={editForm.customerEmail} onChange={(e) => setEditForm((p) => ({ ...p, customerEmail: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Address</label>
                    <Input value={editForm.customerAddress} onChange={(e) => setEditForm((p) => ({ ...p, customerAddress: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">City</label>
                    <Input value={editForm.customerCity} onChange={(e) => setEditForm((p) => ({ ...p, customerCity: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">State</label>
                    <Input value={editForm.customerState} onChange={(e) => setEditForm((p) => ({ ...p, customerState: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Zip Code</label>
                    <Input value={editForm.customerZipCode} onChange={(e) => setEditForm((p) => ({ ...p, customerZipCode: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Country</label>
                    <Input value={editForm.customerCountry} onChange={(e) => setEditForm((p) => ({ ...p, customerCountry: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-black dark:text-white">Line Items</h3>
                  <Button size="sm" variant="ghost" onClick={addEditItem}>
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {editForm.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        placeholder="Description"
                        value={item.description || ""}
                        onChange={(e) => updateEditItem(i, "description", e.target.value)}
                      />
                      <Input
                        className="w-20"
                        type="number"
                        placeholder="Qty"
                        value={item.quantity ?? ""}
                        onChange={(e) => updateEditItem(i, "quantity", Number(e.target.value))}
                      />
                      <Input
                        className="w-24"
                        type="number"
                        placeholder="Rate"
                        value={item.rate ?? ""}
                        onChange={(e) => updateEditItem(i, "rate", Number(e.target.value))}
                      />
                      {editForm.items.length > 1 && (
                        <button onClick={() => removeEditItem(i)} className="text-red-500 hover:text-red-700 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Company</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Name</label>
                    <Input value={editForm.companyName} onChange={(e) => setEditForm((p) => ({ ...p, companyName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Email</label>
                    <Input value={editForm.companyEmail} onChange={(e) => setEditForm((p) => ({ ...p, companyEmail: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Phone</label>
                    <Input value={editForm.companyPhone} onChange={(e) => setEditForm((p) => ({ ...p, companyPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Address</label>
                    <Input value={editForm.companyAddress} onChange={(e) => setEditForm((p) => ({ ...p, companyAddress: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">City</label>
                    <Input value={editForm.companyCity} onChange={(e) => setEditForm((p) => ({ ...p, companyCity: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Country</label>
                    <Input value={editForm.companyCountry} onChange={(e) => setEditForm((p) => ({ ...p, companyCountry: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-(--muted)">Tax ID</label>
                    <Input value={editForm.companyTaxId} onChange={(e) => setEditForm((p) => ({ ...p, companyTaxId: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Bank Account */}
              {accounts.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-(--muted)">Bank Account</label>
                  <Select value={editForm.accountId || "none"} onValueChange={(value) => setEditForm((p) => ({ ...p, accountId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="No bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No bank account</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.bankName} — {acc.accountNumber}{acc.isDefault ? " (Default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Other */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-(--muted)">Currency</label>
                  <Select value={editForm.currency} onValueChange={(value) => setEditForm((p) => ({ ...p, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { code: "USD", label: "US Dollar" },
                        { code: "EUR", label: "Euro" },
                        { code: "GBP", label: "British Pound" },
                        { code: "CAD", label: "Canadian Dollar" },
                        { code: "AUD", label: "Australian Dollar" },
                        { code: "JPY", label: "Japanese Yen" },
                        { code: "CHF", label: "Swiss Franc" },
                        { code: "CNY", label: "Chinese Yuan" },
                        { code: "INR", label: "Indian Rupee" },
                        { code: "MXN", label: "Mexican Peso" },
                        { code: "NGN", label: "Nigerian Naira" },
                      ].map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.label} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-(--muted)">Notes</label>
                  <Input value={editForm.notes} onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-(--muted)">Tax Rate (%)</label>
                  <Input type="number" value={editForm.taxRate} onChange={(e) => setEditForm((p) => ({ ...p, taxRate: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-(--border) px-6 py-4">
              <Button variant="ghost" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      <ConfirmDialogUI />
    </div>
  );
}
