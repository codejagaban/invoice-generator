/**
 * Postgres Storage Layer (Neon)
 * Server-side persistence for authenticated users.
 * Mirrors the same interface as IndexedDB storage.ts.
 */

import sql from "./neon";
import type {
  Invoice,
  InvoiceTemplate,
  CompanyDetails,
  Customer,
  AccountDetails,
  Settings,
} from "./types";

// ============ INVOICE STORAGE ============

export async function pgGetInvoices(userId: string): Promise<Invoice[]> {
  const rows = await sql`SELECT * FROM invoices WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return rows.map(rowToInvoice);
}

export async function pgGetInvoiceById(userId: string, id: string): Promise<Invoice | null> {
  const rows = await sql`SELECT * FROM invoices WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows[0] ? rowToInvoice(rows[0]) : null;
}

export async function pgCreateInvoice(userId: string, invoice: Invoice): Promise<Invoice> {
  await sql`
    INSERT INTO invoices (id, user_id, invoice_number, date, due_date, status, customer, company, items, notes, tax_rate, currency, created_at, updated_at)
    VALUES (${invoice.id}, ${userId}, ${invoice.invoiceNumber}, ${invoice.date}, ${invoice.dueDate}, ${invoice.status},
            ${JSON.stringify(invoice.customer)}, ${invoice.company ? JSON.stringify(invoice.company) : null},
            ${JSON.stringify(invoice.items)}, ${invoice.notes || null}, ${invoice.taxRate || null},
            ${invoice.currency}, ${invoice.createdAt}, ${invoice.updatedAt})
  `;
  return invoice;
}

export async function pgUpdateInvoice(userId: string, id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
  const existing = await pgGetInvoiceById(userId, id);
  if (!existing) return null;
  const updated: Invoice = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await sql`
    UPDATE invoices SET
      invoice_number = ${updated.invoiceNumber}, date = ${updated.date}, due_date = ${updated.dueDate},
      status = ${updated.status}, customer = ${JSON.stringify(updated.customer)},
      company = ${updated.company ? JSON.stringify(updated.company) : null},
      items = ${JSON.stringify(updated.items)}, notes = ${updated.notes || null},
      tax_rate = ${updated.taxRate || null}, currency = ${updated.currency}, updated_at = ${updated.updatedAt}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return updated;
}

export async function pgDeleteInvoice(userId: string, id: string): Promise<boolean> {
  await sql`DELETE FROM invoices WHERE id = ${id} AND user_id = ${userId}`;
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
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ============ CUSTOMER STORAGE ============

export async function pgGetCustomers(userId: string): Promise<Customer[]> {
  const rows = await sql`SELECT * FROM customers WHERE user_id = ${userId}`;
  return rows.map(rowToCustomer);
}

export async function pgGetCustomerById(userId: string, id: string): Promise<Customer | null> {
  const rows = await sql`SELECT * FROM customers WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows[0] ? rowToCustomer(rows[0]) : null;
}

export async function pgCreateCustomer(userId: string, customer: Customer): Promise<Customer> {
  await sql`
    INSERT INTO customers (id, user_id, name, email, address, city, state, zip_code, country, logo)
    VALUES (${customer.id}, ${userId}, ${customer.name}, ${customer.email}, ${customer.address},
            ${customer.city}, ${customer.state}, ${customer.zipCode}, ${customer.country}, ${customer.logo || null})
  `;
  return customer;
}

export async function pgUpdateCustomer(userId: string, id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const existing = await pgGetCustomerById(userId, id);
  if (!existing) return null;
  const updated: Customer = { ...existing, ...updates };
  await sql`
    UPDATE customers SET name = ${updated.name}, email = ${updated.email}, address = ${updated.address},
      city = ${updated.city}, state = ${updated.state}, zip_code = ${updated.zipCode},
      country = ${updated.country}, logo = ${updated.logo || null}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return updated;
}

export async function pgDeleteCustomer(userId: string, id: string): Promise<boolean> {
  await sql`DELETE FROM customers WHERE id = ${id} AND user_id = ${userId}`;
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
  const rows = await sql`SELECT * FROM templates WHERE user_id = ${userId}`;
  return rows.map(rowToTemplate);
}

export async function pgGetTemplateById(userId: string, id: string): Promise<InvoiceTemplate | null> {
  const rows = await sql`SELECT * FROM templates WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows[0] ? rowToTemplate(rows[0]) : null;
}

export async function pgCreateTemplate(userId: string, template: InvoiceTemplate): Promise<InvoiceTemplate> {
  await sql`
    INSERT INTO templates (id, user_id, name, description, customer, items, notes, tax_rate, currency, created_at)
    VALUES (${template.id}, ${userId}, ${template.name}, ${template.description || null},
            ${JSON.stringify(template.customer)}, ${JSON.stringify(template.items)},
            ${template.notes || null}, ${template.taxRate || null}, ${template.currency}, ${template.createdAt})
  `;
  return template;
}

export async function pgUpdateTemplate(userId: string, id: string, updates: Partial<InvoiceTemplate>): Promise<InvoiceTemplate | null> {
  const existing = await pgGetTemplateById(userId, id);
  if (!existing) return null;
  const updated: InvoiceTemplate = { ...existing, ...updates };
  await sql`
    UPDATE templates SET name = ${updated.name}, description = ${updated.description || null},
      customer = ${JSON.stringify(updated.customer)}, items = ${JSON.stringify(updated.items)},
      notes = ${updated.notes || null}, tax_rate = ${updated.taxRate || null}, currency = ${updated.currency}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return updated;
}

export async function pgDeleteTemplate(userId: string, id: string): Promise<boolean> {
  await sql`DELETE FROM templates WHERE id = ${id} AND user_id = ${userId}`;
  return true;
}

function rowToTemplate(row: Record<string, unknown>): InvoiceTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    customer: typeof row.customer === "string" ? JSON.parse(row.customer) : row.customer,
    items: typeof row.items === "string" ? JSON.parse(row.items) : (row.items as InvoiceTemplate["items"]),
    notes: row.notes as string | undefined,
    taxRate: row.tax_rate as number | undefined,
    currency: row.currency as string,
    createdAt: row.created_at as string,
  };
}

// ============ COMPANY DETAILS STORAGE ============

export async function pgGetCompanyDetails(userId: string): Promise<CompanyDetails[]> {
  const rows = await sql`SELECT * FROM company_details WHERE user_id = ${userId}`;
  return rows.map(rowToCompany);
}

export async function pgGetDefaultCompanyDetails(userId: string): Promise<CompanyDetails | null> {
  const rows = await sql`SELECT * FROM company_details WHERE user_id = ${userId} AND is_default = true LIMIT 1`;
  return rows[0] ? rowToCompany(rows[0]) : null;
}

export async function pgGetCompanyById(userId: string, id: string): Promise<CompanyDetails | null> {
  const rows = await sql`SELECT * FROM company_details WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows[0] ? rowToCompany(rows[0]) : null;
}

export async function pgCreateCompany(userId: string, company: CompanyDetails): Promise<CompanyDetails> {
  await sql`
    INSERT INTO company_details (id, user_id, name, email, phone, address, city, state, zip_code, country, website, tax_id, logo, is_default, created_at, updated_at)
    VALUES (${company.id}, ${userId}, ${company.name}, ${company.email}, ${company.phone || null},
            ${company.address}, ${company.city}, ${company.state}, ${company.zipCode}, ${company.country},
            ${company.website || null}, ${company.taxId || null}, ${company.logo || null},
            ${company.isDefault}, ${company.createdAt}, ${company.updatedAt})
  `;
  return company;
}

export async function pgUpdateCompany(userId: string, id: string, updates: Partial<CompanyDetails>): Promise<CompanyDetails | null> {
  const existing = await pgGetCompanyById(userId, id);
  if (!existing) return null;
  const updated: CompanyDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await sql`
    UPDATE company_details SET name = ${updated.name}, email = ${updated.email}, phone = ${updated.phone || null},
      address = ${updated.address}, city = ${updated.city}, state = ${updated.state}, zip_code = ${updated.zipCode},
      country = ${updated.country}, website = ${updated.website || null}, tax_id = ${updated.taxId || null},
      logo = ${updated.logo || null}, is_default = ${updated.isDefault}, updated_at = ${updated.updatedAt}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return updated;
}

export async function pgDeleteCompany(userId: string, id: string): Promise<boolean> {
  await sql`DELETE FROM company_details WHERE id = ${id} AND user_id = ${userId}`;
  return true;
}

export async function pgSetDefaultCompany(userId: string, id: string): Promise<boolean> {
  await sql`UPDATE company_details SET is_default = false WHERE user_id = ${userId}`;
  await sql`UPDATE company_details SET is_default = true WHERE id = ${id} AND user_id = ${userId}`;
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
  const rows = await sql`SELECT * FROM account_details WHERE user_id = ${userId}`;
  return rows.map(rowToAccount);
}

export async function pgGetDefaultAccountDetails(userId: string): Promise<AccountDetails | null> {
  const rows = await sql`SELECT * FROM account_details WHERE user_id = ${userId} AND is_default = true LIMIT 1`;
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function pgGetAccountById(userId: string, id: string): Promise<AccountDetails | null> {
  const rows = await sql`SELECT * FROM account_details WHERE id = ${id} AND user_id = ${userId} LIMIT 1`;
  return rows[0] ? rowToAccount(rows[0]) : null;
}

export async function pgCreateAccount(userId: string, account: AccountDetails): Promise<AccountDetails> {
  await sql`
    INSERT INTO account_details (id, user_id, account_holder_name, bank_name, account_number, sort_code, routing_number, iban, swift_bic, currency, payment_reference, notes, is_default, created_at, updated_at)
    VALUES (${account.id}, ${userId}, ${account.accountHolderName}, ${account.bankName}, ${account.accountNumber},
            ${account.sortCode || null}, ${account.routingNumber || null}, ${account.iban || null}, ${account.swiftBic || null},
            ${account.currency || null}, ${account.paymentReference || null}, ${account.notes || null},
            ${account.isDefault}, ${account.createdAt}, ${account.updatedAt})
  `;
  return account;
}

export async function pgUpdateAccount(userId: string, id: string, updates: Partial<AccountDetails>): Promise<AccountDetails | null> {
  const existing = await pgGetAccountById(userId, id);
  if (!existing) return null;
  const updated: AccountDetails = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await sql`
    UPDATE account_details SET account_holder_name = ${updated.accountHolderName}, bank_name = ${updated.bankName},
      account_number = ${updated.accountNumber}, sort_code = ${updated.sortCode || null},
      routing_number = ${updated.routingNumber || null}, iban = ${updated.iban || null},
      swift_bic = ${updated.swiftBic || null}, currency = ${updated.currency || null},
      payment_reference = ${updated.paymentReference || null}, notes = ${updated.notes || null},
      is_default = ${updated.isDefault}, updated_at = ${updated.updatedAt}
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return updated;
}

export async function pgDeleteAccount(userId: string, id: string): Promise<boolean> {
  await sql`DELETE FROM account_details WHERE id = ${id} AND user_id = ${userId}`;
  return true;
}

export async function pgSetDefaultAccount(userId: string, id: string): Promise<boolean> {
  await sql`UPDATE account_details SET is_default = false WHERE user_id = ${userId}`;
  await sql`UPDATE account_details SET is_default = true WHERE id = ${id} AND user_id = ${userId}`;
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
  const rows = await sql`SELECT * FROM settings WHERE user_id = ${userId} LIMIT 1`;
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
  await sql`
    INSERT INTO settings (id, user_id, default_currency, updated_at)
    VALUES (${updated.id}, ${userId}, ${updated.defaultCurrency}, ${updated.updatedAt})
    ON CONFLICT (id) DO UPDATE SET default_currency = ${updated.defaultCurrency}, updated_at = ${updated.updatedAt}
  `;
  return updated;
}
