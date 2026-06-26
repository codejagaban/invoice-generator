/**
 * Postgres Storage Layer
 * Server-side persistence for authenticated users.
 * Uses node-postgres (pg) — works with any Postgres host (Aiven, Supabase, etc.).
 */

import pool from "./pool";
import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";

// Helper to query and return rows
async function query(text: string, params: unknown[] = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/**
 * Every logo URL referenced anywhere in the database — the top-level `logo`
 * columns plus the snapshots embedded in invoice/template JSONB. Used by Blob
 * garbage collection to decide which uploaded logos are still in use.
 */
export async function pgGetReferencedLogoUrls(): Promise<string[]> {
  const rows = await query(`
    SELECT logo AS url FROM customers WHERE logo IS NOT NULL
    UNION SELECT logo FROM company_details WHERE logo IS NOT NULL
    UNION SELECT customer->>'logo' FROM invoices WHERE customer->>'logo' IS NOT NULL
    UNION SELECT company->>'logo' FROM invoices WHERE company->>'logo' IS NOT NULL
    UNION SELECT customer->>'logo' FROM templates WHERE customer->>'logo' IS NOT NULL
    UNION SELECT company->>'logo' FROM templates WHERE company->>'logo' IS NOT NULL
  `);
  return rows.map((r) => r.url as string).filter(Boolean);
}

// ============ INVOICE STORAGE ============

export async function pgGetInvoices(userId: string): Promise<Invoice[]> {
  const rows = await query("SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
  return rows.map(rowToInvoice);
}

export async function pgGetInvoiceById(userId: string, id: string): Promise<Invoice | null> {
  const rows = await query("SELECT * FROM invoices WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? rowToInvoice(rows[0]) : null;
}

export async function pgCreateInvoice(userId: string, invoice: Invoice): Promise<Invoice> {
  await query(
    `INSERT INTO invoices (id, user_id, invoice_number, date, due_date, status, customer, company, items, notes, tax_rate, discount_type, discount_value, currency, template_id, account_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
    [invoice.id, userId, invoice.invoiceNumber, invoice.date, invoice.dueDate, invoice.status,
     JSON.stringify(invoice.customer), invoice.company ? JSON.stringify(invoice.company) : null,
     JSON.stringify(invoice.items), invoice.notes || null, invoice.taxRate || null,
     invoice.discountType || null, invoice.discountValue || null,
     invoice.currency, invoice.templateId || null, invoice.accountId || null, invoice.createdAt, invoice.updatedAt]
  );
  return invoice;
}

export async function pgUpdateInvoice(userId: string, id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const existing = await pgGetInvoiceById(userId, id);
  if (!existing) return null;
  const updated: Invoice = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await query(
    `UPDATE invoices SET invoice_number = $1, date = $2, due_date = $3, status = $4, customer = $5,
       company = $6, items = $7, notes = $8, tax_rate = $9, discount_type = $10, discount_value = $11,
       currency = $12, template_id = $13, account_id = $14, updated_at = $15
     WHERE id = $16 AND user_id = $17`,
    [updated.invoiceNumber, updated.date, updated.dueDate, updated.status,
     JSON.stringify(updated.customer), updated.company ? JSON.stringify(updated.company) : null,
     JSON.stringify(updated.items), updated.notes || null, updated.taxRate || null,
     updated.discountType || null, updated.discountValue || null,
     updated.currency, updated.templateId || null, updated.accountId || null,
     updated.updatedAt, id, userId]
  );
  return updated;
}

export async function pgDeleteInvoice(userId: string, id: string): Promise<boolean> {
  await query("DELETE FROM invoices WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

function rowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    invoiceNumber: row.invoice_number as string,
    date: row.date as string,
    dueDate: row.due_date as string,
    status: row.status as Invoice["status"],
    customer: typeof row.customer === "string" ? JSON.parse(row.customer) : row.customer,
    company: row.company ? (typeof row.company === "string" ? JSON.parse(row.company as string) : row.company) : undefined,
    items: typeof row.items === "string" ? JSON.parse(row.items) : (row.items as Invoice["items"]),
    notes: row.notes as string | undefined,
    taxRate: row.tax_rate as number | undefined,
    currency: row.currency as string,
    templateId: row.template_id as string | undefined,
    accountId: row.account_id as string | undefined,
    discountType: row.discount_type as "percentage" | "fixed" | undefined,
    discountValue: row.discount_value as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============ CUSTOMER STORAGE ============

export async function pgGetCustomers(userId: string): Promise<Customer[]> {
  const rows = await query("SELECT * FROM customers WHERE user_id = $1", [userId]);
  return rows.map(rowToCustomer);
}

export async function pgGetCustomerById(userId: string, id: string): Promise<Customer | null> {
  const rows = await query("SELECT * FROM customers WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? rowToCustomer(rows[0]) : null;
}

export async function pgCreateCustomer(userId: string, customer: Customer): Promise<Customer> {
  await query(
    `INSERT INTO customers (id, user_id, name, email, address, city, state, zip_code, country, logo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [customer.id, userId, customer.name, customer.email, customer.address,
     customer.city, customer.state, customer.zipCode, customer.country, customer.logo || null]
  );
  return customer;
}

export async function pgUpdateCustomer(userId: string, id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const existing = await pgGetCustomerById(userId, id);
  if (!existing) return null;
  const updated: Customer = { ...existing, ...updates };
  await query(
    `UPDATE customers SET name = $1, email = $2, address = $3, city = $4, state = $5,
       zip_code = $6, country = $7, logo = $8
     WHERE id = $9 AND user_id = $10`,
    [updated.name, updated.email, updated.address, updated.city, updated.state,
     updated.zipCode, updated.country, updated.logo || null, id, userId]
  );
  return updated;
}

export async function pgDeleteCustomer(userId: string, id: string): Promise<boolean> {
  await query("DELETE FROM customers WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

function rowToCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    address: (row.address as string) || "",
    city: (row.city as string) || "",
    state: (row.state as string) || "",
    zipCode: (row.zip_code as string) || "",
    country: (row.country as string) || "",
    logo: row.logo as string | undefined,
  };
}

// ============ TEMPLATE STORAGE ============

export async function pgGetTemplates(userId: string): Promise<InvoiceTemplate[]> {
  const rows = await query("SELECT * FROM templates WHERE user_id = $1", [userId]);
  return rows.map(rowToTemplate);
}

export async function pgGetTemplateById(userId: string, id: string): Promise<InvoiceTemplate | null> {
  const rows = await query("SELECT * FROM templates WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? rowToTemplate(rows[0]) : null;
}

export async function pgCreateTemplate(userId: string, template: InvoiceTemplate): Promise<InvoiceTemplate> {
  await query(
    `INSERT INTO templates (id, user_id, name, description, customer, company, account_id, items, notes, tax_rate, currency, usage_count, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [template.id, userId, template.name, template.description || null,
     JSON.stringify(template.customer), template.company ? JSON.stringify(template.company) : null,
     template.accountId || null, JSON.stringify(template.items),
     template.notes || null, template.taxRate || null, template.currency, template.usageCount || 0, template.createdAt]
  );
  return template;
}

export async function pgUpdateTemplate(userId: string, id: string, updates: Partial<InvoiceTemplate>): Promise<InvoiceTemplate | null> {
  const existing = await pgGetTemplateById(userId, id);
  if (!existing) return null;
  const updated: InvoiceTemplate = { ...existing, ...updates };
  await query(
    `UPDATE templates SET name = $1, description = $2, customer = $3, company = $4, account_id = $5, items = $6,
       notes = $7, tax_rate = $8, currency = $9, usage_count = $10
     WHERE id = $11 AND user_id = $12`,
    [updated.name, updated.description || null, JSON.stringify(updated.customer),
     updated.company ? JSON.stringify(updated.company) : null, updated.accountId || null,
     JSON.stringify(updated.items), updated.notes || null, updated.taxRate || null,
     updated.currency, updated.usageCount || 0, id, userId]
  );
  return updated;
}

export async function pgIncrementTemplateUsage(userId: string, id: string): Promise<void> {
  await query("UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1 AND user_id = $2", [id, userId]);
}

export async function pgDeleteTemplate(userId: string, id: string): Promise<boolean> {
  await query("DELETE FROM templates WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

function rowToTemplate(row: Record<string, unknown>): InvoiceTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    customer: typeof row.customer === "string" ? JSON.parse(row.customer) : row.customer,
    company: row.company ? (typeof row.company === "string" ? JSON.parse(row.company) : row.company) : undefined,
    accountId: row.account_id as string | undefined,
    items: typeof row.items === "string" ? JSON.parse(row.items) : (row.items as InvoiceTemplate["items"]),
    notes: row.notes as string | undefined,
    taxRate: row.tax_rate as number | undefined,
    currency: row.currency as string,
    usageCount: (row.usage_count as number) || 0,
    createdAt: row.created_at as string,
  };
}

// ============ COMPANY DETAILS STORAGE ============

export async function pgGetCompanyDetails(userId: string): Promise<CompanyDetails[]> {
  const rows = await query("SELECT * FROM company_details WHERE user_id = $1", [userId]);
  return rows.map(rowToCompany);
}

export async function pgGetDefaultCompanyDetails(userId: string): Promise<CompanyDetails | null> {
  const rows = await query("SELECT * FROM company_details WHERE user_id = $1 AND is_default = true LIMIT 1", [userId]);
  return rows[0] ? rowToCompany(rows[0]) : null;
}

export async function pgGetCompanyById(userId: string, id: string): Promise<CompanyDetails | null> {
  const rows = await query("SELECT * FROM company_details WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? rowToCompany(rows[0]) : null;
}

export async function pgCreateCompany(userId: string, company: CompanyDetails): Promise<CompanyDetails> {
  await query(
    `INSERT INTO company_details (id, user_id, name, email, phone, address, city, state, zip_code, country, website, tax_id, logo, is_default, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [company.id, userId, company.name, company.email, company.phone || null,
     company.address, company.city, company.state, company.zipCode, company.country,
     company.website || null, company.taxId || null, company.logo || null,
     company.isDefault, company.createdAt, company.updatedAt]
  );
  return company;
}

export async function pgUpdateCompany(userId: string, id: string, updates: Partial<CompanyDetails>): Promise<CompanyDetails | null> {
  const existing = await pgGetCompanyById(userId, id);
  if (!existing) return null;
  const updated: CompanyDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await query(
    `UPDATE company_details SET name = $1, email = $2, phone = $3, address = $4, city = $5,
       state = $6, zip_code = $7, country = $8, website = $9, tax_id = $10,
       logo = $11, is_default = $12, updated_at = $13
     WHERE id = $14 AND user_id = $15`,
    [updated.name, updated.email, updated.phone || null, updated.address, updated.city,
     updated.state, updated.zipCode, updated.country, updated.website || null, updated.taxId || null,
     updated.logo || null, updated.isDefault, updated.updatedAt, id, userId]
  );
  return updated;
}

export async function pgDeleteCompany(userId: string, id: string): Promise<boolean> {
  await query("DELETE FROM company_details WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

export async function pgSetDefaultCompany(userId: string, id: string): Promise<boolean> {
  await query("UPDATE company_details SET is_default = false WHERE user_id = $1", [userId]);
  await query("UPDATE company_details SET is_default = true WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

function rowToCompany(row: Record<string, unknown>): CompanyDetails {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | undefined,
    address: (row.address as string) || "",
    city: (row.city as string) || "",
    state: (row.state as string) || "",
    zipCode: (row.zip_code as string) || "",
    country: (row.country as string) || "",
    website: row.website as string | undefined,
    taxId: row.tax_id as string | undefined,
    logo: row.logo as string | undefined,
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============ ACCOUNT DETAILS STORAGE ============

export async function pgGetAccountDetails(userId: string): Promise<AccountDetails[]> {
  const rows = await query("SELECT * FROM account_details WHERE user_id = $1", [userId]);
  return rows.map(rowToAccount);
}

export async function pgGetDefaultAccountDetails(userId: string): Promise<AccountDetails | null> {
  const rows = await query("SELECT * FROM account_details WHERE user_id = $1 AND is_default = true LIMIT 1", [userId]);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function pgGetAccountById(userId: string, id: string): Promise<AccountDetails | null> {
  const rows = await query("SELECT * FROM account_details WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function pgCreateAccount(userId: string, account: AccountDetails): Promise<AccountDetails> {
  await query(
    `INSERT INTO account_details (id, user_id, account_holder_name, bank_name, account_number, sort_code, routing_number, iban, swift_bic, currency, payment_reference, notes, is_default, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [account.id, userId, account.accountHolderName, account.bankName, account.accountNumber,
     account.sortCode || null, account.routingNumber || null, account.iban || null, account.swiftBic || null,
     account.currency || null, account.paymentReference || null, account.notes || null,
     account.isDefault, account.createdAt, account.updatedAt]
  );
  return account;
}

export async function pgUpdateAccount(userId: string, id: string, updates: Partial<AccountDetails>): Promise<AccountDetails | null> {
  const existing = await pgGetAccountById(userId, id);
  if (!existing) return null;
  const updated: AccountDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await query(
    `UPDATE account_details SET account_holder_name = $1, bank_name = $2, account_number = $3,
       sort_code = $4, routing_number = $5, iban = $6, swift_bic = $7, currency = $8,
       payment_reference = $9, notes = $10, is_default = $11, updated_at = $12
     WHERE id = $13 AND user_id = $14`,
    [updated.accountHolderName, updated.bankName, updated.accountNumber,
     updated.sortCode || null, updated.routingNumber || null, updated.iban || null,
     updated.swiftBic || null, updated.currency || null, updated.paymentReference || null,
     updated.notes || null, updated.isDefault, updated.updatedAt, id, userId]
  );
  return updated;
}

export async function pgDeleteAccount(userId: string, id: string): Promise<boolean> {
  await query("DELETE FROM account_details WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

export async function pgSetDefaultAccount(userId: string, id: string): Promise<boolean> {
  await query("UPDATE account_details SET is_default = false WHERE user_id = $1", [userId]);
  await query("UPDATE account_details SET is_default = true WHERE id = $1 AND user_id = $2", [id, userId]);
  return true;
}

function rowToAccount(row: Record<string, unknown>): AccountDetails {
  return {
    id: row.id as string,
    accountHolderName: row.account_holder_name as string,
    bankName: row.bank_name as string,
    accountNumber: row.account_number as string,
    sortCode: row.sort_code as string | undefined,
    routingNumber: row.routing_number as string | undefined,
    iban: row.iban as string | undefined,
    swiftBic: row.swift_bic as string | undefined,
    currency: row.currency as string | undefined,
    paymentReference: row.payment_reference as string | undefined,
    notes: row.notes as string | undefined,
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============ SETTINGS STORAGE ============

export async function pgGetSettings(userId: string): Promise<Settings> {
  const rows = await query("SELECT * FROM settings WHERE user_id = $1 LIMIT 1", [userId]);
  if (rows[0]) {
    return {
      id: (rows[0].id as string) as "default",
      defaultCurrency: rows[0].default_currency as string,
      updatedAt: rows[0].updated_at as string,
    };
  }
  return { id: "default", defaultCurrency: "GBP", updatedAt: new Date().toISOString() };
}

export async function pgSaveSettings(userId: string, updates: Partial<Omit<Settings, "id">>): Promise<Settings> {
  const existing = await pgGetSettings(userId);
  const updated: Settings = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await query(
    `INSERT INTO settings (id, user_id, default_currency, updated_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET default_currency = $3, updated_at = $4`,
    [updated.id, userId, updated.defaultCurrency, updated.updatedAt]
  );
  return updated;
}
