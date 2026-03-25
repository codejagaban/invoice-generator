/**
 * Data Storage Utilities
 * Routes to IndexedDB for guests or Postgres for authenticated users.
 */

import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";
import { isUserAuthenticated } from "./db";
import * as idb from "./idb-storage";

// ─── Postgres caller (for authenticated users) ─────────────────────────────

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
  if (!isUserAuthenticated()) return idb.idbGetInvoices();
  return pgCall({ store: "invoices", action: "getAll" });
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!isUserAuthenticated()) return idb.idbGetInvoiceById(id);
  return pgCall({ store: "invoices", action: "getOne", id });
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  if (!isUserAuthenticated()) return idb.idbCreateInvoice(invoice);
  return pgCall({ store: "invoices", action: "create", data: invoice });
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
): Promise<Invoice | null> {
  if (!isUserAuthenticated()) return idb.idbUpdateInvoice(id, updates);
  return pgCall({ store: "invoices", action: "update", id, updates });
}

export async function deleteInvoice(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbDeleteInvoice(id);
  return pgCall({ store: "invoices", action: "delete", id });
}

// ============ CUSTOMER STORAGE ============

export async function getCustomers(): Promise<Customer[]> {
  if (!isUserAuthenticated()) return idb.idbGetCustomers();
  return pgCall({ store: "customers", action: "getAll" });
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!isUserAuthenticated()) return idb.idbGetCustomerById(id);
  return pgCall({ store: "customers", action: "getOne", id });
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  if (!isUserAuthenticated()) return idb.idbCreateCustomer(customer);
  return pgCall({ store: "customers", action: "create", data: customer });
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> {
  if (!isUserAuthenticated()) return idb.idbUpdateCustomer(id, updates);
  return pgCall({ store: "customers", action: "update", id, updates });
}

export async function deleteCustomer(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbDeleteCustomer(id);
  return pgCall({ store: "customers", action: "delete", id });
}

// ============ TEMPLATE STORAGE ============

export async function getTemplates(): Promise<InvoiceTemplate[]> {
  if (!isUserAuthenticated()) return idb.idbGetTemplates();
  return pgCall({ store: "templates", action: "getAll" });
}

export async function getTemplateById(
  id: string,
): Promise<InvoiceTemplate | null> {
  if (!isUserAuthenticated()) return idb.idbGetTemplateById(id);
  return pgCall({ store: "templates", action: "getOne", id });
}

export async function createTemplate(
  template: InvoiceTemplate,
): Promise<InvoiceTemplate> {
  if (!isUserAuthenticated()) return idb.idbCreateTemplate(template);
  return pgCall({ store: "templates", action: "create", data: template });
}

export async function updateTemplate(
  id: string,
  updates: Partial<InvoiceTemplate>,
): Promise<InvoiceTemplate | null> {
  if (!isUserAuthenticated()) return idb.idbUpdateTemplate(id, updates);
  return pgCall({ store: "templates", action: "update", id, updates });
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  if (!isUserAuthenticated()) return idb.idbIncrementTemplateUsage(id);
  return pgCall({ store: "templates", action: "incrementUsage", id });
}

export async function deleteTemplate(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbDeleteTemplate(id);
  return pgCall({ store: "templates", action: "delete", id });
}

// ============ COMPANY DETAILS STORAGE ============

export async function getCompanyDetails(): Promise<CompanyDetails[]> {
  if (!isUserAuthenticated()) return idb.idbGetCompanyDetails();
  return pgCall({ store: "company_details", action: "getAll" });
}

export async function getDefaultCompanyDetails(): Promise<CompanyDetails | null> {
  if (!isUserAuthenticated()) return idb.idbGetDefaultCompanyDetails();
  return pgCall({ store: "company_details", action: "getDefault" });
}

export async function getCompanyById(
  id: string,
): Promise<CompanyDetails | null> {
  if (!isUserAuthenticated()) return idb.idbGetCompanyById(id);
  return pgCall({ store: "company_details", action: "getOne", id });
}

export async function createCompany(
  company: CompanyDetails,
): Promise<CompanyDetails> {
  if (!isUserAuthenticated()) return idb.idbCreateCompany(company);
  return pgCall({ store: "company_details", action: "create", data: company });
}

export async function updateCompany(
  id: string,
  updates: Partial<CompanyDetails>,
): Promise<CompanyDetails | null> {
  if (!isUserAuthenticated()) return idb.idbUpdateCompany(id, updates);
  return pgCall({ store: "company_details", action: "update", id, updates });
}

export async function deleteCompany(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbDeleteCompany(id);
  return pgCall({ store: "company_details", action: "delete", id });
}

export async function setDefaultCompany(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbSetDefaultCompany(id);
  return pgCall({ store: "company_details", action: "setDefault", id });
}

// ============ ACCOUNT DETAILS STORAGE ============

export async function getAccountDetails(): Promise<AccountDetails[]> {
  if (!isUserAuthenticated()) return idb.idbGetAccountDetails();
  return pgCall({ store: "account_details", action: "getAll" });
}

export async function getDefaultAccountDetails(): Promise<AccountDetails | null> {
  if (!isUserAuthenticated()) return idb.idbGetDefaultAccountDetails();
  return pgCall({ store: "account_details", action: "getDefault" });
}

export async function getAccountById(
  id: string,
): Promise<AccountDetails | null> {
  if (!isUserAuthenticated()) return idb.idbGetAccountById(id);
  return pgCall({ store: "account_details", action: "getOne", id });
}

export async function createAccount(
  account: AccountDetails,
): Promise<AccountDetails> {
  if (!isUserAuthenticated()) return idb.idbCreateAccount(account);
  return pgCall({ store: "account_details", action: "create", data: account });
}

export async function updateAccount(
  id: string,
  updates: Partial<AccountDetails>,
): Promise<AccountDetails | null> {
  if (!isUserAuthenticated()) return idb.idbUpdateAccount(id, updates);
  return pgCall({ store: "account_details", action: "update", id, updates });
}

export async function deleteAccount(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbDeleteAccount(id);
  return pgCall({ store: "account_details", action: "delete", id });
}

export async function setDefaultAccount(id: string): Promise<boolean> {
  if (!isUserAuthenticated()) return idb.idbSetDefaultAccount(id);
  return pgCall({ store: "account_details", action: "setDefault", id });
}

// ============ SETTINGS STORAGE ============

export async function getSettings(): Promise<Settings> {
  if (!isUserAuthenticated()) return idb.idbGetSettings();
  return pgCall({ store: "settings", action: "get" });
}

export async function saveSettings(
  updates: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
  if (!isUserAuthenticated()) return idb.idbSaveSettings(updates);
  return pgCall({ store: "settings", action: "save", updates });
}
