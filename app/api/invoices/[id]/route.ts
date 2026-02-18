/**
 * Individual Invoice API Routes
 * GET: Fetch a specific invoice
 * PATCH: Update an invoice
 * DELETE: Delete an invoice
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 },
      );
    }

    // In a real application, you would fetch from a database
    return NextResponse.json(
      {
        message: "This endpoint would fetch a specific invoice from a database",
        invoiceId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch invoice",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 },
      );
    }

    // In a real application, you would update the database
    return NextResponse.json(
      {
        message: "Invoice updated successfully",
        invoiceId: id,
        updates: body,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update invoice",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 },
      );
    }

    // In a real application, you would delete from the database
    return NextResponse.json(
      {
        message: "Invoice deleted successfully",
        invoiceId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete invoice",
      },
      { status: 500 },
    );
  }
}
