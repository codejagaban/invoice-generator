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
  logo?: string;
}

export type InvoiceItemType = "item" | "hours";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  type?: InvoiceItemType;
  discount?: number;
  taxRate?: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export type DiscountType = "percentage" | "fixed";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  customer: Customer;
  company?: CompanyDetails;
  items: InvoiceItem[];
  notes?: string;
  taxRate?: number;
  discountType?: DiscountType;
  discountValue?: number;
  currency: string;
  templateId?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  customer: Partial<Customer>;
  company?: Partial<CompanyDetails>;
  accountId?: string;
  items: Partial<InvoiceItem>[];
  notes?: string;
  taxRate?: number;
  currency: string;
  usageCount: number;
  createdAt: string;
}

export interface InvoiceSummary {
  subtotal: number;
  itemDiscount: number;
  subtotalAfterDiscount: number;
  globalDiscount: number;
  subtotalAfterAllDiscounts: number;
  taxAmount: number;
  total: number;
}

export interface AccountDetails {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  sortCode?: string;
  routingNumber?: string;
  iban?: string;
  swiftBic?: string;
  currency?: string;
  paymentReference?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: "default";
  defaultCurrency: string;
  updatedAt: string;
}

export interface CompanyDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website?: string;
  taxId?: string;
  logo?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
