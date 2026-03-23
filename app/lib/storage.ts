/**
 * Data Storage Utilities
 * All persistence via IndexedDB through app/lib/db.ts
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
import { pushToCloud } from "./sync";

/**
 * Debounced cloud sync — pushes to Turso after writes settle.
 * Only syncs for authenticated users (non-guest scope).
 */
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function schedulCloudSync() {
  if (getDbScope() === "guest") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushToCloud();
  }, 2000);
}

// ============ INVOICE STORAGE ============

export async function getInvoices(): Promise<Invoice[]> {
  return dbGetAll<Invoice>(STORES.invoices);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  return dbGetOne<Invoice>(STORES.invoices, id);
}

export async function createInvoice(invoice: Invoice): Promise<Invoice> {
  const result = await dbPut<Invoice>(STORES.invoices, invoice);
  schedulCloudSync();
  return result;
}

export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
): Promise<Invoice | null> {
  const existing = await getInvoiceById(id);
  if (!existing) return null;
  const updated: Invoice = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const result = await dbPut<Invoice>(STORES.invoices, updated);
  schedulCloudSync();
  return result;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const result = await dbDelete(STORES.invoices, id);
  schedulCloudSync();
  return result;
}

// ============ CUSTOMER STORAGE ============

export async function getCustomers(): Promise<Customer[]> {
  return dbGetAll<Customer>(STORES.customers);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return dbGetOne<Customer>(STORES.customers, id);
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  const result = await dbPut<Customer>(STORES.customers, customer);
  schedulCloudSync();
  return result;
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> {
  const existing = await getCustomerById(id);
  if (!existing) return null;
  const updated: Customer = { ...existing, ...updates };
  const result = await dbPut<Customer>(STORES.customers, updated);
  schedulCloudSync();
  return result;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const result = await dbDelete(STORES.customers, id);
  schedulCloudSync();
  return result;
}

// ============ TEMPLATE STORAGE ============

export async function getTemplates(): Promise<InvoiceTemplate[]> {
  return dbGetAll<InvoiceTemplate>(STORES.templates);
}

export async function getTemplateById(
  id: string,
): Promise<InvoiceTemplate | null> {
  return dbGetOne<InvoiceTemplate>(STORES.templates, id);
}

export async function createTemplate(
  template: InvoiceTemplate,
): Promise<InvoiceTemplate> {
  const result = await dbPut<InvoiceTemplate>(STORES.templates, template);
  schedulCloudSync();
  return result;
}

export async function updateTemplate(
  id: string,
  updates: Partial<InvoiceTemplate>,
): Promise<InvoiceTemplate | null> {
  const existing = await getTemplateById(id);
  if (!existing) return null;
  const updated: InvoiceTemplate = { ...existing, ...updates };
  const result = await dbPut<InvoiceTemplate>(STORES.templates, updated);
  schedulCloudSync();
  return result;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const result = await dbDelete(STORES.templates, id);
  schedulCloudSync();
  return result;
}

// ============ COMPANY DETAILS STORAGE ============

export async function getCompanyDetails(): Promise<CompanyDetails[]> {
  return dbGetAll<CompanyDetails>(STORES.company_details);
}

export async function getDefaultCompanyDetails(): Promise<CompanyDetails | null> {
  const companies = await getCompanyDetails();
  return companies.find((c) => c.isDefault) ?? null;
}

export async function getCompanyById(
  id: string,
): Promise<CompanyDetails | null> {
  return dbGetOne<CompanyDetails>(STORES.company_details, id);
}

export async function createCompany(
  company: CompanyDetails,
): Promise<CompanyDetails> {
  const result = await dbPut<CompanyDetails>(STORES.company_details, company);
  schedulCloudSync();
  return result;
}

export async function updateCompany(
  id: string,
  updates: Partial<CompanyDetails>,
): Promise<CompanyDetails | null> {
  const existing = await getCompanyById(id);
  if (!existing) return null;
  const updated: CompanyDetails = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const result = await dbPut<CompanyDetails>(STORES.company_details, updated);
  schedulCloudSync();
  return result;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const result = await dbDelete(STORES.company_details, id);
  schedulCloudSync();
  return result;
}

export async function setDefaultCompany(id: string): Promise<boolean> {
  const companies = await getCompanyDetails();
  const target = companies.find((c) => c.id === id);
  if (!target) return false;
  await Promise.all(
    companies.map((c) =>
      dbPut<CompanyDetails>(STORES.company_details, {
        ...c,
        isDefault: c.id === id,
      }),
    ),
  );
  schedulCloudSync();
  return true;
}

// ============ ACCOUNT DETAILS STORAGE ============

export async function getAccountDetails(): Promise<AccountDetails[]> {
  return dbGetAll<AccountDetails>(STORES.account_details);
}

export async function getDefaultAccountDetails(): Promise<AccountDetails | null> {
  const accounts = await getAccountDetails();
  return accounts.find((a) => a.isDefault) ?? null;
}

export async function getAccountById(
  id: string,
): Promise<AccountDetails | null> {
  return dbGetOne<AccountDetails>(STORES.account_details, id);
}

export async function createAccount(
  account: AccountDetails,
): Promise<AccountDetails> {
  const result = await dbPut<AccountDetails>(STORES.account_details, account);
  schedulCloudSync();
  return result;
}

export async function updateAccount(
  id: string,
  updates: Partial<AccountDetails>,
): Promise<AccountDetails | null> {
  const existing = await getAccountById(id);
  if (!existing) return null;
  const updated: AccountDetails = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const result = await dbPut<AccountDetails>(STORES.account_details, updated);
  schedulCloudSync();
  return result;
}

export async function deleteAccount(id: string): Promise<boolean> {
  const result = await dbDelete(STORES.account_details, id);
  schedulCloudSync();
  return result;
}

export async function setDefaultAccount(id: string): Promise<boolean> {
  const accounts = await getAccountDetails();
  const target = accounts.find((a) => a.id === id);
  if (!target) return false;
  await Promise.all(
    accounts.map((a) =>
      dbPut<AccountDetails>(STORES.account_details, {
        ...a,
        isDefault: a.id === id,
      }),
    ),
  );
  schedulCloudSync();
  return true;
}

// ============ SETTINGS STORAGE ============

export async function getSettings(): Promise<Settings> {
  const settings = await dbGetOne<Settings>(STORES.settings, "default");
  return settings ?? { id: "default", defaultCurrency: "GBP", updatedAt: new Date().toISOString() };
}

export async function saveSettings(
  updates: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
  const existing = await getSettings();
  const updated: Settings = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  const result = await dbPut<Settings>(STORES.settings, updated);
  schedulCloudSync();
  return result;
}
