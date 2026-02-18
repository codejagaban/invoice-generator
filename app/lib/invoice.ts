/**
 * Invoice Calculation and Formatting Utilities
 * Functions for calculating totals, formatting currency, and invoice operations
 */

import type { Invoice, InvoiceItem, InvoiceSummary } from "./types";

/**
 * Calculate invoice totals including subtotal, tax, and final total
 */
export function calculateInvoiceSummary(
  items: InvoiceItem[],
  globalTaxRate: number = 0
): InvoiceSummary {
  let subtotal = 0;
  let itemDiscount = 0;
  let taxAmount = 0;

  // Calculate subtotal and item-level discounts
  for (const item of items) {
    const itemTotal = item.quantity * item.rate;
    const discount = item.discount ? (itemTotal * item.discount) / 100 : 0;
    const itemTaxBase = itemTotal - discount;

    subtotal += itemTotal;
    itemDiscount += discount;

    // Apply item-level tax rate if provided, otherwise use global rate
    const taxRate = item.taxRate ?? globalTaxRate;
    taxAmount += (itemTaxBase * taxRate) / 100;
  }

  const subtotalAfterDiscount = subtotal - itemDiscount;
  const total = subtotalAfterDiscount + taxAmount;

  return {
    subtotal,
    itemDiscount,
    subtotalAfterDiscount,
    taxAmount,
    total,
  };
}

/**
 * Format currency with proper locale and currency symbol
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is invalid
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, format: "short" | "long" = "short"): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

/**
 * Generate a valid invoice number if not provided
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${timestamp}${random}`;
}

/**
 * Calculate days until due date
 */
export function daysUntilDue(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if invoice is overdue
 */
export function isOverdue(dueDate: string): boolean {
  return daysUntilDue(dueDate) < 0;
}

/**
 * Check if invoice is due soon (within 7 days)
 */
export function isDueSoon(dueDate: string): boolean {
  const daysLeft = daysUntilDue(dueDate);
  return daysLeft >= 0 && daysLeft <= 7;
}
