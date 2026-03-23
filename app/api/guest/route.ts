/**
 * Guest Session API
 * POST: Creates an anonymous user with 7-day expiry, returns their ID.
 * GET:  Validates an existing guest ID is still active.
 */

import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/pool";

const GUEST_TTL_DAYS = 7;

export async function POST(_request: NextRequest) {
  try {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + GUEST_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await pool.query(
      `INSERT INTO users (id, is_anonymous, expires_at, created_at)
       VALUES ($1, true, $2, $3)`,
      [id, expiresAt, new Date().toISOString()],
    );

    return NextResponse.json({ id, expiresAt });
  } catch (error) {
    console.error("[guest] create error:", error);
    return NextResponse.json({ error: "Failed to create guest session" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const guestId = request.nextUrl.searchParams.get("id");
    if (!guestId) {
      return NextResponse.json({ valid: false });
    }

    const { rows } = await pool.query(
      "SELECT id, expires_at FROM users WHERE id = $1 AND is_anonymous = true LIMIT 1",
      [guestId],
    );

    if (!rows[0]) {
      return NextResponse.json({ valid: false });
    }

    const expiresAt = new Date(rows[0].expires_at as string);
    if (expiresAt < new Date()) {
      return NextResponse.json({ valid: false, expired: true });
    }

    return NextResponse.json({ valid: true, id: rows[0].id, expiresAt: rows[0].expires_at });
  } catch (error) {
    console.error("[guest] validate error:", error);
    return NextResponse.json({ valid: false });
  }
}
