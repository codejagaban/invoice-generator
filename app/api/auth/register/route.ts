import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/app/lib/pool";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    const { rows: existing } = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email],
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (id, name, email, password, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, email, hashedPassword, new Date().toISOString()],
    );

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
