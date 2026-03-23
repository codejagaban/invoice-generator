/**
 * Data Storage Utilities
 * All data goes through Postgres via /api/data.
 * Both authenticated users and anonymous guests use the same path.
 */

import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";
import { getDbScope } from "./db";

/**
 * Call the /api/data endpoint for Postgres operations.
 * Sends the current user scope (real user ID or anonymous guest ID)
 * so the server knows whose data to access.
 */
async function pgCall<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  const { result } = await res.json();
  return result as T;
}

// ============ INVOICE STORAGE ============

export async function getInvoices(): Promise<Invoice[]> {
  return pgCall({ store: "invoices", action: "getAll" });
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  return pgCall({ store: "invoices", action: "getOne", id });
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  return pgCall({ store: "invoices", action: "create", data: invoice });
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
): Promise<Invoice | null> {
  return pgCall({ store: "invoices", action: "update", id, updates });
}

export async function deleteInvoice(id: string): Promise<boolean> {
  return pgCall({ store: "invoices", action: "delete", id });
}

// ============ CUSTOMER STORAGE ============

export async function getCustomers(): Promise<Customer[]> {
  return pgCall({ store: "customers", action: "getAll" });
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return pgCall({ store: "customers", action: "getOne", id });
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  return pgCall({ store: "customers", action: "create", data: customer });
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> {
  return pgCall({ store: "customers", action: "update", id, updates });
}

export async function deleteCustomer(id: string): Promise<boolean> {
  return pgCall({ store: "customers", action: "delete", id });
}

// ============ TEMPLATE STORAGE ============

export async function getTemplates(): Promise<InvoiceTemplate[]> {
  return pgCall({ store: "templates", action: "getAll" });
}

export async function getTemplateById(
  id: string,
): Promise<InvoiceTemplate | null> {
  return pgCall({ store: "templates", action: "getOne", id });
}

export async function createTemplate(
  template: InvoiceTemplate,
): Promise<InvoiceTemplate> {
  return pgCall({ store: "templates", action: "create", data: template });
}

export async function updateTemplate(
  id: string,
  updates: Partial<InvoiceTemplate>,
): Promise<InvoiceTemplate | null> {
  return pgCall({ store: "templates", action: "update", id, updates });
}

export async function deleteTemplate(id: string): Promise<boolean> {
  return pgCall({ store: "templates", action: "delete", id });
}

// ============ COMPANY DETAILS STORAGE ============

export async function getCompanyDetails(): Promise<CompanyDetails[]> {
  return pgCall({ store: "company_details", action: "getAll" });
}

export async function getDefaultCompanyDetails(): Promise<CompanyDetails | null> {
  return pgCall({ store: "company_details", action: "getDefault" });
}

export async function getCompanyById(
  id: string,
): Promise<CompanyDetails | null> {
  return pgCall({ store: "company_details", action: "getOne", id });
}

export async function createCompany(
  company: CompanyDetails,
): Promise<CompanyDetails> {
  return pgCall({ store: "company_details", action: "create", data: company });
}

export async function updateCompany(
  id: string,
  updates: Partial<CompanyDetails>,
): Promise<CompanyDetails | null> {
  return pgCall({ store: "company_details", action: "update", id, updates });
}

export async function deleteCompany(id: string): Promise<boolean> {
  return pgCall({ store: "company_details", action: "delete", id });
}

export async function setDefaultCompany(id: string): Promise<boolean> {
  return pgCall({ store: "company_details", action: "setDefault", id });
}

// ============ ACCOUNT DETAILS STORAGE ============

export async function getAccountDetails(): Promise<AccountDetails[]> {
  return pgCall({ store: "account_details", action: "getAll" });
}

export async function getDefaultAccountDetails(): Promise<AccountDetails | null> {
  return pgCall({ store: "account_details", action: "getDefault" });
}

export async function getAccountById(
  id: string,
): Promise<AccountDetails | null> {
  return pgCall({ store: "account_details", action: "getOne", id });
}

export async function createAccount(
  account: AccountDetails,
): Promise<AccountDetails> {
  return pgCall({ store: "account_details", action: "create", data: account });
}

export async function updateAccount(
  id: string,
  updates: Partial<AccountDetails>,
): Promise<AccountDetails | null> {
  return pgCall({ store: "account_details", action: "update", id, updates });
}

export async function deleteAccount(id: string): Promise<boolean> {
  return pgCall({ store: "account_details", action: "delete", id });
}

export async function setDefaultAccount(id: string): Promise<boolean> {
  return pgCall({ store: "account_details", action: "setDefault", id });
}

// ============ SETTINGS STORAGE ============

export async function getSettings(): Promise<Settings> {
  return pgCall({ store: "settings", action: "get" });
}

export async function saveSettings(
  updates: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
  return pgCall({ store: "settings", action: "save", updates });
}
