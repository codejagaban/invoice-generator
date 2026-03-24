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
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      {
        error: "Failed to load invoices. Please try again.",
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
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      {
        error: "Failed to create invoice. Please try again.",
      },
      { status: 500 },
    );
  }
}
