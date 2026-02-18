/**
 * Invoice Generator Type Definitions
 * Core types for invoices, items, templates, and customers
 */

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discount?: number;
  taxRate?: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  customer: Customer;
  items: InvoiceItem[];
  notes?: string;
  taxRate?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  customer: Partial<Customer>;
  items: Partial<InvoiceItem>[];
  notes?: string;
  taxRate?: number;
  currency: string;
  createdAt: string;
}

export interface InvoiceSummary {
  subtotal: number;
  itemDiscount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  total: number;
}
