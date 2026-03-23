/**
 * Migrate Guest Data API
 * POST: Moves all data from an anonymous guest user to the authenticated user.
 * Called after sign-in/sign-up when a guest_id cookie exists.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/app/lib/pool";

const DATA_TABLES = ["invoices", "customers", "templates", "company_details", "account_details", "settings"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { guestId } = await request.json();
    if (!guestId) {
      return NextResponse.json({ error: "No guest ID provided" }, { status: 400 });
    }

    // Verify the guest user exists
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE id = $1 AND is_anonymous = true",
      [guestId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ migrated: 0 });
    }

    const realUserId = session.user.id;
    let totalMigrated = 0;

    // Move all data from guest to real user
    for (const table of DATA_TABLES) {
      const result = await pool.query(
        `UPDATE ${table} SET user_id = $1 WHERE user_id = $2`,
        [realUserId, guestId],
      );
      totalMigrated += result.rowCount ?? 0;
    }

    // Delete the anonymous user
    await pool.query("DELETE FROM users WHERE id = $1 AND is_anonymous = true", [guestId]);

    // Clear the cookie by setting it in the response
    const response = NextResponse.json({ migrated: totalMigrated });
    response.cookies.set("guest_id", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("[migrate-guest]", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
