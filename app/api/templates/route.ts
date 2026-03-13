/**
 * Invoice Templates API Route
 * GET: Fetch all templates
 * POST: Create a new template
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // This endpoint would fetch templates from storage or database
    return NextResponse.json(
      {
        message: "This endpoint would fetch invoice templates from a database",
        note: "Currently using localStorage on the client side",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch templates",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 },
      );
    }

    // In a real application, you would save to a database
    return NextResponse.json(
      {
        message: "Template created successfully",
        template: body,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 500 },
    );
  }
}
