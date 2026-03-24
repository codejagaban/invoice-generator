/**
 * Data API Route
 * Proxies all CRUD operations to Postgres.
 * Works for both authenticated users (via session) and anonymous guests (via cookie).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/app/lib/pool";
import * as pg from "@/app/lib/pg-storage";

async function getUserId(request: NextRequest): Promise<string | null> {
  // 1. Check auth session first
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  // 2. Fall back to guest_id cookie
  const guestId = request.cookies.get("guest_id")?.value;
  if (!guestId) return null;

  // Validate the guest user exists and hasn't expired
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE id = $1 AND is_anonymous = true AND (expires_at IS NULL OR expires_at > NOW())",
    [guestId],
  );
  return rows[0] ? (rows[0].id as string) : null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, store, id, data, updates } = await request.json();

    let result: unknown = null;

    switch (`${store}:${action}`) {
      // Invoices
      case "invoices:getAll":
        result = await pg.pgGetInvoices(userId);
        break;
      case "invoices:getOne":
        result = await pg.pgGetInvoiceById(userId, id);
        break;
      case "invoices:create":
        result = await pg.pgCreateInvoice(userId, data);
        break;
      case "invoices:update":
        result = await pg.pgUpdateInvoice(userId, id, updates);
        break;
      case "invoices:delete":
        result = await pg.pgDeleteInvoice(userId, id);
        break;

      // Customers
      case "customers:getAll":
        result = await pg.pgGetCustomers(userId);
        break;
      case "customers:getOne":
        result = await pg.pgGetCustomerById(userId, id);
        break;
      case "customers:create":
        result = await pg.pgCreateCustomer(userId, data);
        break;
      case "customers:update":
        result = await pg.pgUpdateCustomer(userId, id, updates);
        break;
      case "customers:delete":
        result = await pg.pgDeleteCustomer(userId, id);
        break;

      // Templates
      case "templates:getAll":
        result = await pg.pgGetTemplates(userId);
        break;
      case "templates:getOne":
        result = await pg.pgGetTemplateById(userId, id);
        break;
      case "templates:create":
        result = await pg.pgCreateTemplate(userId, data);
        break;
      case "templates:update":
        result = await pg.pgUpdateTemplate(userId, id, updates);
        break;
      case "templates:delete":
        result = await pg.pgDeleteTemplate(userId, id);
        break;
      case "templates:incrementUsage":
        result = await pg.pgIncrementTemplateUsage(userId, id);
        break;

      // Company Details
      case "company_details:getAll":
        result = await pg.pgGetCompanyDetails(userId);
        break;
      case "company_details:getDefault":
        result = await pg.pgGetDefaultCompanyDetails(userId);
        break;
      case "company_details:getOne":
        result = await pg.pgGetCompanyById(userId, id);
        break;
      case "company_details:create":
        result = await pg.pgCreateCompany(userId, data);
        break;
      case "company_details:update":
        result = await pg.pgUpdateCompany(userId, id, updates);
        break;
      case "company_details:delete":
        result = await pg.pgDeleteCompany(userId, id);
        break;
      case "company_details:setDefault":
        result = await pg.pgSetDefaultCompany(userId, id);
        break;

      // Account Details
      case "account_details:getAll":
        result = await pg.pgGetAccountDetails(userId);
        break;
      case "account_details:getDefault":
        result = await pg.pgGetDefaultAccountDetails(userId);
        break;
      case "account_details:getOne":
        result = await pg.pgGetAccountById(userId, id);
        break;
      case "account_details:create":
        result = await pg.pgCreateAccount(userId, data);
        break;
      case "account_details:update":
        result = await pg.pgUpdateAccount(userId, id, updates);
        break;
      case "account_details:delete":
        result = await pg.pgDeleteAccount(userId, id);
        break;
      case "account_details:setDefault":
        result = await pg.pgSetDefaultAccount(userId, id);
        break;

      // Settings
      case "settings:get":
        result = await pg.pgGetSettings(userId);
        break;
      case "settings:save":
        result = await pg.pgSaveSettings(userId, updates);
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${store}:${action}` }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[data API]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
