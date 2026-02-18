"use client";

/**
 * Invoice Form Component
 * Client-side form for creating and editing invoices
 */

import { useState } from "react";
import Button from "@/app/components/shared/Button";
import { InputWithRef as Input } from "@/app/components/shared/Input";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/shared/Card";
import type { Invoice, InvoiceItem, Customer } from "@/app/lib/types";
import { validateInvoiceForm, invoiceValidation } from "@/app/lib/validation";
import {
  calculateInvoiceSummary,
  generateInvoiceNumber,
  formatCurrency,
} from "@/app/lib/invoice";

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

export default function InvoiceForm({
  initialData,
  onSubmit,
}: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    invoiceNumber: initialData?.invoiceNumber || generateInvoiceNumber(),
    date: initialData?.date || new Date().toISOString().split("T")[0],
    dueDate:
      initialData?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
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
    value: any,
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
      const invoice: Invoice = {
        id: initialData?.id || String(Date.now()),
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        status: initialData?.status || "draft",
        customer: {
          id: initialData?.customer.id || String(Date.now()),
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
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Invoice Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
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
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              error={errors.customerName}
              required
            />
            <Input
              label="Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleInputChange}
              error={errors.customerEmail}
              required
            />
          </div>
          <Input
            label="Address"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleInputChange}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              name="customerCity"
              value={formData.customerCity}
              onChange={handleInputChange}
            />
            <Input
              label="State/Province"
              name="customerState"
              value={formData.customerState}
              onChange={handleInputChange}
            />
            <Input
              label="Zip/Postal Code"
              name="customerZipCode"
              value={formData.customerZipCode}
              onChange={handleInputChange}
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
                className="flex gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-800"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 text-black placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Qty"
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
                      className="w-20 px-3 py-2 rounded border border-gray-300 text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
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
                      className="flex-1 px-3 py-2 rounded border border-gray-300 text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    <div className="px-3 py-2 text-right font-semibold text-black dark:text-white">
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
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addItem}>
            + Add Item
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
            />
          </div>
          <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal:
              </span>
              <span className="font-medium">
                {formatCurrency(summary.subtotal, formData.currency)}
              </span>
            </div>
            {summary.itemDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Discount:
                </span>
                <span className="font-medium">
                  -{formatCurrency(summary.itemDiscount, formData.currency)}
                </span>
              </div>
            )}
            {summary.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax ({formData.taxRate}%):
                </span>
                <span className="font-medium">
                  {formatCurrency(summary.taxAmount, formData.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold dark:border-gray-800">
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
          <textarea
            name="notes"
            placeholder="Add any additional notes or terms..."
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded border border-gray-300 px-4 py-2 text-black placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      </div>

      {errors.submit && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {errors.submit}
        </div>
      )}
    </form>
  );
}
