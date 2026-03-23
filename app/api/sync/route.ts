/**
 * Sync API Route
 * GET: Load user data from Turso
 * POST: Save user data to Turso
 *
 * Stores the entire IndexedDB snapshot as a JSON blob per user email.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/app/lib/turso";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db.execute({
      sql: "SELECT data, updated_at FROM user_data WHERE user_email = ?",
      args: [session.user.email],
    });

    const row = result.rows[0] as unknown as
      | { data: string; updated_at: string }
      | undefined;

    if (!row) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: JSON.parse(row.data),
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("[sync GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 },
      );
    }

    const jsonStr = JSON.stringify(data);

    await db.execute({
      sql: `INSERT INTO user_data (user_email, data, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_email) DO UPDATE SET
              data = excluded.data,
              updated_at = excluded.updated_at`,
      args: [session.user.email, jsonStr],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sync POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save data" },
      { status: 500 },
    );
  }
}
