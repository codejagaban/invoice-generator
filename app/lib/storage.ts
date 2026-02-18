/**
 * Data Storage Utilities
 * Handles invoice and template persistence (initially localStorage, extensible for database)
 */

import type { Invoice, InvoiceTemplate, CompanyDetails } from "./types";

// Storage keys
const INVOICES_KEY = "invoices";
const TEMPLATES_KEY = "templates";
const COMPANY_DETAILS_KEY = "company_details";

/**
 * Initialize storage with default data (runs once on first load)
 */
export function initializeStorage(): void {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(INVOICES_KEY)) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TEMPLATES_KEY)) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(COMPANY_DETAILS_KEY)) {
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify([]));
  }
}

// ============ INVOICE STORAGE ============

/**
 * Get all invoices from storage
 */
export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get a single invoice by ID
 */
export function getInvoiceById(id: string): Invoice | null {
  const invoices = getInvoices();
  return invoices.find((inv) => inv.id === id) || null;
}

/**
 * Create a new invoice
 */
export function createInvoice(invoice: Invoice): Invoice {
  const invoices = getInvoices();
  invoices.push(invoice);
  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }
  return invoice;
}

/**
 * Update an existing invoice
 */
export function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
): Invoice | null {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === id);

  if (index === -1) return null;

  const updated = {
    ...invoices[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  invoices[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }

  return updated;
}

/**
 * Delete an invoice
 */
export function deleteInvoice(id: string): boolean {
  const invoices = getInvoices();
  const filtered = invoices.filter((inv) => inv.id !== id);

  if (filtered.length === invoices.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
  }

  return true;
}

// ============ TEMPLATE STORAGE ============

/**
 * Get all invoice templates from storage
 */
export function getTemplates(): InvoiceTemplate[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get a single template by ID
 */
export function getTemplateById(id: string): InvoiceTemplate | null {
  const templates = getTemplates();
  return templates.find((tpl) => tpl.id === id) || null;
}

/**
 * Create a new invoice template
 */
export function createTemplate(template: InvoiceTemplate): InvoiceTemplate {
  const templates = getTemplates();
  templates.push(template);
  if (typeof window !== "undefined") {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }
  return template;
}

/**
 * Update an existing template
 */
export function updateTemplate(
  id: string,
  updates: Partial<InvoiceTemplate>,
): InvoiceTemplate | null {
  const templates = getTemplates();
  const index = templates.findIndex((tpl) => tpl.id === id);

  if (index === -1) return null;

  const updated = { ...templates[index], ...updates };
  templates[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }

  return updated;
}

/**
 * Delete a template
 */
export function deleteTemplate(id: string): boolean {
  const templates = getTemplates();
  const filtered = templates.filter((tpl) => tpl.id !== id);

  if (filtered.length === templates.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  }

  return true;
}

// ============ COMPANY DETAILS STORAGE ============

/**
 * Get all company details from storage
 */
export function getCompanyDetails(): CompanyDetails[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(COMPANY_DETAILS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get default company details
 */
export function getDefaultCompanyDetails(): CompanyDetails | null {
  const companies = getCompanyDetails();
  return companies.find((c) => c.isDefault) || null;
}

/**
 * Get a single company by ID
 */
export function getCompanyById(id: string): CompanyDetails | null {
  const companies = getCompanyDetails();
  return companies.find((c) => c.id === id) || null;
}

/**
 * Create a new company profile
 */
export function createCompany(company: CompanyDetails): CompanyDetails {
  const companies = getCompanyDetails();
  companies.push(company);
  if (typeof window !== "undefined") {
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(companies));
  }
  return company;
}

/**
 * Update an existing company profile
 */
export function updateCompany(
  id: string,
  updates: Partial<CompanyDetails>,
): CompanyDetails | null {
  const companies = getCompanyDetails();
  const index = companies.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updated = {
    ...companies[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  companies[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(companies));
  }

  return updated;
}

/**
 * Delete a company profile
 */
export function deleteCompany(id: string): boolean {
  const companies = getCompanyDetails();
  const filtered = companies.filter((c) => c.id !== id);

  if (filtered.length === companies.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(filtered));
  }

  return true;
}

/**
 * Set a company as default
 */
export function setDefaultCompany(id: string): boolean {
  const companies = getCompanyDetails();
  let updated = false;

  for (let i = 0; i < companies.length; i++) {
    if (companies[i].id === id) {
      companies[i].isDefault = true;
      updated = true;
    } else {
      companies[i].isDefault = false;
    }
  }

  if (updated && typeof window !== "undefined") {
    localStorage.setItem(COMPANY_DETAILS_KEY, JSON.stringify(companies));
  }

  return updated;
}
