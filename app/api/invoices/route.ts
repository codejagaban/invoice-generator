/**
 * Invoices API Route
 * GET: Fetch all invoices with optional filtering
 * POST: Create a new invoice
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // This is a simple API endpoint
    // In a real application with a database, you would query it here
    return NextResponse.json(
      {
        message: "This endpoint would fetch invoices from a database",
        note: "Currently using localStorage on the client side",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch invoices",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation would go here
    if (!body.invoiceNumber || !body.customer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // In a real application, you would save to a database here
    return NextResponse.json(
      {
        message: "Invoice created successfully",
        invoice: body,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 },
    );
  }
}
