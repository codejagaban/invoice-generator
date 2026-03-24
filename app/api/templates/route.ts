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
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      {
        error: "Failed to load templates. Please try again.",
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
    console.error("Failed to create template:", error);
    return NextResponse.json(
      {
        error: "Failed to save template. Please try again.",
      },
      { status: 500 },
    );
  }
}
