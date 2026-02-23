"use client";

/**
 * Invoice Form Component
 * Client-side form for creating and editing invoices
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Textarea from "@/app/components/shared/Textarea";
import DatePicker from "@/app/components/shared/DatePicker";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/app/components/shared/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shared/Select";
import type {
  Invoice,
  InvoiceItem,
  Customer,
  InvoiceTemplate,
} from "@/app/lib/types";
import {
  Building2,
  DollarSign,
  FileText,
  Hash,
  BookmarkPlus,
  Mail,
  Map,
  MapPin,
  Percent,
  Plus,
  CheckCircle2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { validateInvoiceForm, invoiceValidation } from "@/app/lib/validation";
import {
  calculateInvoiceSummary,
  generateInvoiceNumber,
  formatCurrency,
} from "@/app/lib/invoice";
import { createTemplate, getCustomers, getSettings } from "@/app/lib/storage";

const CURRENCIES = [
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
];

interface InvoiceFormProps {
  initialData?: Invoice;
  onSubmit: (data: Invoice) => Promise<void>;
}

const toLocalDateString = (date: Date) => date.toLocaleDateString("en-CA");

export default function InvoiceForm({
  initialData,
  onSubmit,
}: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || toLocalDateString(new Date()),
    dueDate:
      initialData?.dueDate ||
      toLocalDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    customerName: initialData?.customer.name || "",
    customerEmail: initialData?.customer.email || "",
    customerAddress: initialData?.customer.address || "",
    customerCity: initialData?.customer.city || "",
    customerState: initialData?.customer.state || "",
    customerZipCode: initialData?.customer.zipCode || "",
    currency: initialData?.currency || "GBP",
    notes: initialData?.notes || "",
    taxRate: initialData?.taxRate || 0,
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      {
        id: "1",
        description: "",
        quantity: 1,
        rate: 0,
      },
    ],
  );

  useEffect(() => {
    (async () => {
      const [storedCustomers, settings] = await Promise.all([
        getCustomers(),
        getSettings(),
      ]);
      setCustomers(storedCustomers);
      if (!initialData) {
        setFormData((prev) => ({ ...prev, currency: settings.defaultCurrency }));
      }
    })();
  }, []);

  // Load template from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const selectedTemplate = sessionStorage.getItem("selectedTemplate");
    if (selectedTemplate && !initialData) {
      try {
        const template: InvoiceTemplate = JSON.parse(selectedTemplate);

        // Populate form with template data
        setFormData((prev) => ({
          ...prev,
          customerName: template.customer.name || "",
          customerEmail: template.customer.email || "",
          customerAddress: template.customer.address || "",
          customerCity: template.customer.city || "",
          customerState: template.customer.state || "",
          customerZipCode: template.customer.zipCode || "",
          currency: template.currency,
          notes: template.notes || "",
          taxRate: template.taxRate || 0,
        }));

        // Populate items
        if (template.items && template.items.length > 0) {
          const populatedItems = template.items.map((item, index) => ({
            id: String(index + 1),
            description: item.description || "",
            quantity: item.quantity || 1,
            rate: item.rate || 0,
          }));
          setItems(populatedItems);
        }

        // Clear sessionStorage
        sessionStorage.removeItem("selectedTemplate");
      } catch (err) {
        console.error("Failed to load template:", err);
      }
    }
  }, [initialData]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);

    const selected = customers.find((customer) => customer.id === customerId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      customerName: selected.name,
      customerEmail: selected.email,
      customerAddress: selected.address,
      customerCity: selected.city,
      customerState: selected.state,
      customerZipCode: selected.zipCode,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(items.length + 1),
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    try {
      setIsSavingTemplate(true);

      const template: InvoiceTemplate = {
        id: String(Date.now()),
        name: templateName,
        description: templateDescription,
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          address: formData.customerAddress,
          city: formData.customerCity,
          state: formData.customerState,
          zipCode: formData.customerZipCode,
        },
        items,
        notes: formData.notes,
        taxRate: Number(formData.taxRate),
        currency: formData.currency,
        createdAt: new Date().toISOString(),
      };

      await createTemplate(template);
      alert("Template saved successfully!");
      setShowSaveTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
    } catch (error) {
      alert("Failed to save template. Please try again.");
      console.error(error);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      const formErrors = validateInvoiceForm({
        ...formData,
        items,
      });

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors);
        setIsLoading(false);
        return;
      }

      // Create invoice object
      const customerId =
        initialData?.customer.id || selectedCustomerId || String(Date.now());

      const invoice: Invoice = {
        id: initialData?.id || String(Date.now()),
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        status: initialData?.status || "draft",
        customer: {
          id: customerId,
          name: formData.customerName,
          email: formData.customerEmail,
          address: formData.customerAddress,
          city: formData.customerCity,
          state: formData.customerState,
          zipCode: formData.customerZipCode,
          country: "US", // TODO: Make this dynamic
        },
        items,
        notes: formData.notes,
        taxRate: Number(formData.taxRate),
        currency: formData.currency,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSubmit(invoice);
      setErrors({});
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to save invoice",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const summary = calculateInvoiceSummary(items, Number(formData.taxRate));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Invoice Number"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              error={errors.invoiceNumber}
              leadingIcon={<Hash className="h-4 w-4" />}
            />
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1">
                Currency
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.label} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="Invoice Date"
              value={formData.date}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, date: value }))
              }
            />
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, dueDate: value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1">
                Select Customer
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                  <User className="h-4 w-4" />
                </span>
                <Select
                  value={selectedCustomerId || undefined}
                  onValueChange={(value) => handleCustomerSelect(value)}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Choose an existing customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end">
              <Link
                href="/customers"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Manage customers
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              error={errors.customerName}
              required
              leadingIcon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleInputChange}
              error={errors.customerEmail}
              required
              leadingIcon={<Mail className="h-4 w-4" />}
            />
          </div>
          <Input
            label="Address"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleInputChange}
            leadingIcon={<MapPin className="h-4 w-4" />}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              name="customerCity"
              value={formData.customerCity}
              onChange={handleInputChange}
              leadingIcon={<Building2 className="h-4 w-4" />}
            />
            <Input
              label="State/Province"
              name="customerState"
              value={formData.customerState}
              onChange={handleInputChange}
              leadingIcon={<Map className="h-4 w-4" />}
            />
            <Input
              label="Zip/Postal Code"
              name="customerZipCode"
              value={formData.customerZipCode}
              onChange={handleInputChange}
              leadingIcon={<Hash className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] border-(--border)"
              >
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    leadingIcon={<FileText className="h-4 w-4" />}
                  />
                  <div className="grid gap-2 sm:grid-cols-[96px_1fr_auto]">
                    <div>
                      <span className="block text-xs text-(--muted)">Qty</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value),
                          )
                        }
                        min="0.01"
                        step="0.01"
                        leadingIcon={<Hash className="h-4 w-4" />}
                      />
                    </div>
                    <div>
                      <span className="block text-xs text-(--muted)">Rate</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.rate || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value),
                          )
                        }
                        min="0"
                        step="0.01"
                        leadingIcon={<DollarSign className="h-4 w-4" />}
                      />
                    </div>
                    <div className="flex items-end justify-end px-3 py-2 text-right font-semibold text-black dark:text-white">
                      {formatCurrency(
                        (item.quantity || 0) * (item.rate || 0),
                        formData.currency,
                      )}
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Tax & Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Tax & Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Tax Rate (%)"
              name="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              leadingIcon={<Percent className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2 border-t pt-4 border-(--border)">
            <div className="flex justify-between text-sm">
              <span className="text-(--muted)">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(summary.subtotal, formData.currency)}
              </span>
            </div>
            {summary.itemDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">Discount:</span>
                <span className="font-medium">
                  -{formatCurrency(summary.itemDiscount, formData.currency)}
                </span>
              </div>
            )}
            {summary.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-(--muted)">
                  Tax ({formData.taxRate}%):
                </span>
                <span className="font-medium">
                  {formatCurrency(summary.taxAmount, formData.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-lg font-bold border-(--border)">
              <span>Total:</span>
              <span>{formatCurrency(summary.total, formData.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            placeholder="Add any additional notes or terms..."
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading}>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowSaveTemplateModal(true)}
        >
          <BookmarkPlus className="h-4 w-4 text-blue-500" />
          Save as Template
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          <X className="h-4 w-4 text-red-500" />
          Cancel
        </Button>
      </div>

      {errors.submit && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.submit}
        </div>
      )}

      {/* Save Template Modal */}
      <Dialog
        open={showSaveTemplateModal}
        onOpenChange={setShowSaveTemplateModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Monthly Service Invoice"
              autoFocus
              leadingIcon={<FileText className="h-4 w-4" />}
            />
            <div>
              <label className="block text-sm font-medium text-(--muted) mb-1">
                Description (Optional)
              </label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Add any notes about this template..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-4 border-(--border)">
            <Button
              type="button"
              onClick={handleSaveAsTemplate}
              isLoading={isSavingTemplate}
              className="flex-1"
            >
              <BookmarkPlus className="h-4 w-4 text-blue-400" />
              Save Template
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSaveTemplateModal(false)}
              className="flex-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
