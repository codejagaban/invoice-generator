/**
 * Data Storage Utilities
 * Routes to Postgres (via API) for authenticated users, IndexedDB for guests.
 */

import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";
import { STORES, dbGetAll, dbGetOne, dbPut, dbDelete, getDbScope } from "./db";

function isAuthenticated(): boolean {
  return getDbScope() !== "guest";
}

/**
 * Call the /api/data endpoint for Postgres operations.
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
  if (isAuthenticated()) return pgCall({ store: "invoices", action: "getAll" });
  return dbGetAll<Invoice>(STORES.invoices);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (isAuthenticated()) return pgCall({ store: "invoices", action: "getOne", id });
  return dbGetOne<Invoice>(STORES.invoices, id);
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  if (isAuthenticated()) return pgCall({ store: "invoices", action: "create", data: invoice });
  return dbPut<Invoice>(STORES.invoices, invoice);
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
): Promise<Invoice | null> {
  if (isAuthenticated()) return pgCall({ store: "invoices", action: "update", id, updates });
  const existing = await getInvoiceById(id);
  if (!existing) return null;
  const updated: Invoice = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return dbPut<Invoice>(STORES.invoices, updated);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "invoices", action: "delete", id });
  return dbDelete(STORES.invoices, id);
}

// ============ CUSTOMER STORAGE ============

export async function getCustomers(): Promise<Customer[]> {
  if (isAuthenticated()) return pgCall({ store: "customers", action: "getAll" });
  return dbGetAll<Customer>(STORES.customers);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  if (isAuthenticated()) return pgCall({ store: "customers", action: "getOne", id });
  return dbGetOne<Customer>(STORES.customers, id);
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  if (isAuthenticated()) return pgCall({ store: "customers", action: "create", data: customer });
  return dbPut<Customer>(STORES.customers, customer);
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> {
  if (isAuthenticated()) return pgCall({ store: "customers", action: "update", id, updates });
  const existing = await getCustomerById(id);
  if (!existing) return null;
  const updated: Customer = { ...existing, ...updates };
  return dbPut<Customer>(STORES.customers, updated);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "customers", action: "delete", id });
  return dbDelete(STORES.customers, id);
}

// ============ TEMPLATE STORAGE ============

export async function getTemplates(): Promise<InvoiceTemplate[]> {
  if (isAuthenticated()) return pgCall({ store: "templates", action: "getAll" });
  return dbGetAll<InvoiceTemplate>(STORES.templates);
}

export async function getTemplateById(
  id: string,
): Promise<InvoiceTemplate | null> {
  if (isAuthenticated()) return pgCall({ store: "templates", action: "getOne", id });
  return dbGetOne<InvoiceTemplate>(STORES.templates, id);
}

export async function createTemplate(
  template: InvoiceTemplate,
): Promise<InvoiceTemplate> {
  if (isAuthenticated()) return pgCall({ store: "templates", action: "create", data: template });
  return dbPut<InvoiceTemplate>(STORES.templates, template);
}

export async function updateTemplate(
  id: string,
  updates: Partial<InvoiceTemplate>,
): Promise<InvoiceTemplate | null> {
  if (isAuthenticated()) return pgCall({ store: "templates", action: "update", id, updates });
  const existing = await getTemplateById(id);
  if (!existing) return null;
  const updated: InvoiceTemplate = { ...existing, ...updates };
  return dbPut<InvoiceTemplate>(STORES.templates, updated);
}

export async function deleteTemplate(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "templates", action: "delete", id });
  return dbDelete(STORES.templates, id);
}

// ============ COMPANY DETAILS STORAGE ============

export async function getCompanyDetails(): Promise<CompanyDetails[]> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "getAll" });
  return dbGetAll<CompanyDetails>(STORES.company_details);
}

export async function getDefaultCompanyDetails(): Promise<CompanyDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "getDefault" });
  const companies = await getCompanyDetails();
  return companies.find((c) => c.isDefault) ?? null;
}

export async function getCompanyById(
  id: string,
): Promise<CompanyDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "getOne", id });
  return dbGetOne<CompanyDetails>(STORES.company_details, id);
}

export async function createCompany(
  company: CompanyDetails,
): Promise<CompanyDetails> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "create", data: company });
  return dbPut<CompanyDetails>(STORES.company_details, company);
}

export async function updateCompany(
  id: string,
  updates: Partial<CompanyDetails>,
): Promise<CompanyDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "update", id, updates });
  const existing = await getCompanyById(id);
  if (!existing) return null;
  const updated: CompanyDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return dbPut<CompanyDetails>(STORES.company_details, updated);
}

export async function deleteCompany(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "delete", id });
  return dbDelete(STORES.company_details, id);
}

export async function setDefaultCompany(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "company_details", action: "setDefault", id });
  const companies = await getCompanyDetails();
  const target = companies.find((c) => c.id === id);
  if (!target) return false;
  await Promise.all(
    companies.map((c) =>
      dbPut<CompanyDetails>(STORES.company_details, { ...c, isDefault: c.id === id }),
    ),
  );
  return true;
}

// ============ ACCOUNT DETAILS STORAGE ============

export async function getAccountDetails(): Promise<AccountDetails[]> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "getAll" });
  return dbGetAll<AccountDetails>(STORES.account_details);
}

export async function getDefaultAccountDetails(): Promise<AccountDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "getDefault" });
  const accounts = await getAccountDetails();
  return accounts.find((a) => a.isDefault) ?? null;
}

export async function getAccountById(
  id: string,
): Promise<AccountDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "getOne", id });
  return dbGetOne<AccountDetails>(STORES.account_details, id);
}

export async function createAccount(
  account: AccountDetails,
): Promise<AccountDetails> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "create", data: account });
  return dbPut<AccountDetails>(STORES.account_details, account);
}

export async function updateAccount(
  id: string,
  updates: Partial<AccountDetails>,
): Promise<AccountDetails | null> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "update", id, updates });
  const existing = await getAccountById(id);
  if (!existing) return null;
  const updated: AccountDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return dbPut<AccountDetails>(STORES.account_details, updated);
}

export async function deleteAccount(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "delete", id });
  return dbDelete(STORES.account_details, id);
}

export async function setDefaultAccount(id: string): Promise<boolean> {
  if (isAuthenticated()) return pgCall({ store: "account_details", action: "setDefault", id });
  const accounts = await getAccountDetails();
  const target = accounts.find((a) => a.id === id);
  if (!target) return false;
  await Promise.all(
    accounts.map((a) =>
      dbPut<AccountDetails>(STORES.account_details, { ...a, isDefault: a.id === id }),
    ),
  );
  return true;
}

// ============ SETTINGS STORAGE ============

export async function getSettings(): Promise<Settings> {
  if (isAuthenticated()) return pgCall({ store: "settings", action: "get" });
  const settings = await dbGetOne<Settings>(STORES.settings, "default");
  return settings ?? { id: "default", defaultCurrency: "GBP", updatedAt: new Date().toISOString() };
}

export async function saveSettings(
  updates: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
  if (isAuthenticated()) return pgCall({ store: "settings", action: "save", updates });
  const existing = await getSettings();
  const updated: Settings = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return dbPut<Settings>(STORES.settings, updated);
}
