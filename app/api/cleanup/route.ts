/**
 * Cleanup API Route
 * POST: Deletes expired anonymous users and all their data.
 * Call this on a cron schedule (e.g., daily via Vercel Cron or similar).
 * Protected by a secret token.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/pool";

const DATA_TABLES = ["invoices", "customers", "templates", "company_details", "account_details", "settings"];

export async function POST(request: NextRequest) {
  try {
    // Simple auth check — require a secret token
    const { authorization } = Object.fromEntries(request.headers);
    const expectedToken = process.env.CLEANUP_SECRET || process.env.AUTH_SECRET;
    if (!authorization || authorization !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find expired anonymous users
    const { rows: expiredUsers } = await pool.query(
      "SELECT id FROM users WHERE is_anonymous = true AND expires_at < NOW()",
    );

    if (expiredUsers.length === 0) {
      return NextResponse.json({ deleted: 0, message: "No expired users" });
    }

    const expiredIds = expiredUsers.map((r) => r.id as string);
    let totalDeleted = 0;

    // Delete data from all tables for expired users
    for (const table of DATA_TABLES) {
      const result = await pool.query(
        `DELETE FROM ${table} WHERE user_id = ANY($1)`,
        [expiredIds],
      );
      totalDeleted += result.rowCount ?? 0;
    }

    // Delete the anonymous users themselves
    const userResult = await pool.query(
      "DELETE FROM users WHERE id = ANY($1) AND is_anonymous = true",
      [expiredIds],
    );

    return NextResponse.json({
      deletedUsers: userResult.rowCount,
      deletedRecords: totalDeleted,
    });
  } catch (error) {
    console.error("[cleanup]", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
