/**
 * Sync API Route
 * POST: Syncs local IndexedDB data to Postgres for an authenticated user.
 * Receives all local data and bulk-inserts it, skipping duplicates.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as pg from "@/app/lib/pg-storage";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { invoices, customers, templates, companyDetails, accountDetails, settings } = await request.json();

    let synced = { invoices: 0, customers: 0, templates: 0, companies: 0, accounts: 0 };

    // Sync customers first (invoices reference them)
    if (customers?.length) {
      for (const customer of customers) {
        try {
          await pg.pgCreateCustomer(userId, customer);
          synced.customers++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Sync company details
    if (companyDetails?.length) {
      for (const company of companyDetails) {
        try {
          await pg.pgCreateCompany(userId, company);
          synced.companies++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Sync account details
    if (accountDetails?.length) {
      for (const account of accountDetails) {
        try {
          await pg.pgCreateAccount(userId, account);
          synced.accounts++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Sync templates
    if (templates?.length) {
      for (const template of templates) {
        try {
          await pg.pgCreateTemplate(userId, template);
          synced.templates++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Sync invoices
    if (invoices?.length) {
      for (const invoice of invoices) {
        try {
          await pg.pgCreateInvoice(userId, invoice);
          synced.invoices++;
        } catch {
          // Skip duplicates
        }
      }
    }

    // Sync settings
    if (settings) {
      try {
        await pg.pgSaveSettings(userId, { defaultCurrency: settings.defaultCurrency });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({ success: true, synced });
  } catch (error) {
    console.error("[sync API]", error);
    return NextResponse.json(
      { error: "Failed to sync data. Please try again." },
      { status: 500 },
    );
  }
}
