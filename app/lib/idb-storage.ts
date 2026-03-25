/**
 * IndexedDB Storage Layer for unauthenticated (guest) users.
 * Mirrors the same interface as pg-storage so storage.ts can swap transparently.
 */

import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";

const DB_NAME = "invoicer_local";
const DB_VERSION = 1;

const STORES = ["invoices", "customers", "templates", "company_details", "account_details", "settings"] as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function getOne<T>(storeName: string, id: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as T) || null);
    req.onerror = () => reject(req.error);
  });
}

async function put<T>(storeName: string, data: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error);
  });
}

async function remove(storeName: string, id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// ============ INVOICES ============

export async function idbGetInvoices(): Promise<Invoice[]> {
  return getAll<Invoice>("invoices");
}

export async function idbGetInvoiceById(id: string): Promise<Invoice | null> {
  return getOne<Invoice>("invoices", id);
}

export async function idbCreateInvoice(invoice: Invoice): Promise<Invoice> {
  return put("invoices", invoice);
}

export async function idbUpdateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const existing = await getOne<Invoice>("invoices", id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return put("invoices", updated);
}

export async function idbDeleteInvoice(id: string): Promise<boolean> {
  return remove("invoices", id);
}

// ============ CUSTOMERS ============

export async function idbGetCustomers(): Promise<Customer[]> {
  return getAll<Customer>("customers");
}

export async function idbGetCustomerById(id: string): Promise<Customer | null> {
  return getOne<Customer>("customers", id);
}

export async function idbCreateCustomer(customer: Customer): Promise<Customer> {
  return put("customers", customer);
}

export async function idbUpdateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const existing = await getOne<Customer>("customers", id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  return put("customers", updated);
}

export async function idbDeleteCustomer(id: string): Promise<boolean> {
  return remove("customers", id);
}

// ============ TEMPLATES ============

export async function idbGetTemplates(): Promise<InvoiceTemplate[]> {
  return getAll<InvoiceTemplate>("templates");
}

export async function idbGetTemplateById(id: string): Promise<InvoiceTemplate | null> {
  return getOne<InvoiceTemplate>("templates", id);
}

export async function idbCreateTemplate(template: InvoiceTemplate): Promise<InvoiceTemplate> {
  return put("templates", template);
}

export async function idbUpdateTemplate(id: string, updates: Partial<InvoiceTemplate>): Promise<InvoiceTemplate | null> {
  const existing = await getOne<InvoiceTemplate>("templates", id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  return put("templates", updated);
}

export async function idbIncrementTemplateUsage(id: string): Promise<void> {
  const existing = await getOne<InvoiceTemplate>("templates", id);
  if (existing) {
    await put("templates", { ...existing, usageCount: (existing.usageCount || 0) + 1 });
  }
}

export async function idbDeleteTemplate(id: string): Promise<boolean> {
  return remove("templates", id);
}

// ============ COMPANY DETAILS ============

export async function idbGetCompanyDetails(): Promise<CompanyDetails[]> {
  return getAll<CompanyDetails>("company_details");
}

export async function idbGetDefaultCompanyDetails(): Promise<CompanyDetails | null> {
  const all = await getAll<CompanyDetails>("company_details");
  return all.find((c) => c.isDefault) || all[0] || null;
}

export async function idbGetCompanyById(id: string): Promise<CompanyDetails | null> {
  return getOne<CompanyDetails>("company_details", id);
}

export async function idbCreateCompany(company: CompanyDetails): Promise<CompanyDetails> {
  return put("company_details", company);
}

export async function idbUpdateCompany(id: string, updates: Partial<CompanyDetails>): Promise<CompanyDetails | null> {
  const existing = await getOne<CompanyDetails>("company_details", id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return put("company_details", updated);
}

export async function idbDeleteCompany(id: string): Promise<boolean> {
  return remove("company_details", id);
}

export async function idbSetDefaultCompany(id: string): Promise<boolean> {
  const all = await getAll<CompanyDetails>("company_details");
  for (const c of all) {
    await put("company_details", { ...c, isDefault: c.id === id });
  }
  return true;
}

// ============ ACCOUNT DETAILS ============

export async function idbGetAccountDetails(): Promise<AccountDetails[]> {
  return getAll<AccountDetails>("account_details");
}

export async function idbGetDefaultAccountDetails(): Promise<AccountDetails | null> {
  const all = await getAll<AccountDetails>("account_details");
  return all.find((a) => a.isDefault) || all[0] || null;
}

export async function idbGetAccountById(id: string): Promise<AccountDetails | null> {
  return getOne<AccountDetails>("account_details", id);
}

export async function idbCreateAccount(account: AccountDetails): Promise<AccountDetails> {
  return put("account_details", account);
}

export async function idbUpdateAccount(id: string, updates: Partial<AccountDetails>): Promise<AccountDetails | null> {
  const existing = await getOne<AccountDetails>("account_details", id);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  return put("account_details", updated);
}

export async function idbDeleteAccount(id: string): Promise<boolean> {
  return remove("account_details", id);
}

export async function idbSetDefaultAccount(id: string): Promise<boolean> {
  const all = await getAll<AccountDetails>("account_details");
  for (const a of all) {
    await put("account_details", { ...a, isDefault: a.id === id });
  }
  return true;
}

// ============ SETTINGS ============

export async function idbGetSettings(): Promise<Settings> {
  const s = await getOne<Settings>("settings", "default");
  return s || { id: "default", defaultCurrency: "GBP", updatedAt: new Date().toISOString() };
}

export async function idbSaveSettings(updates: Partial<Omit<Settings, "id">>): Promise<Settings> {
  const existing = await idbGetSettings();
  const updated = { ...existing, ...updates, id: "default" as const };
  return put("settings", updated);
}

// ============ EXPORT ALL DATA (for sync) ============

export async function idbGetAllData() {
  return {
    invoices: await getAll<Invoice>("invoices"),
    customers: await getAll<Customer>("customers"),
    templates: await getAll<InvoiceTemplate>("templates"),
    companyDetails: await getAll<CompanyDetails>("company_details"),
    accountDetails: await getAll<AccountDetails>("account_details"),
    settings: await idbGetSettings(),
  };
}

export async function idbClearAll(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES as unknown as string[], "readwrite");
  for (const store of STORES) {
    tx.objectStore(store).clear();
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbHasData(): Promise<boolean> {
  const invoices = await getAll<Invoice>("invoices");
  return invoices.length > 0;
}
