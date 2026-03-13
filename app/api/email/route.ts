/**
 * Email Sending API Route
 * POST: Send an invoice via email
 *
 * TODO: Implement with a service like:
 * - Resend: npm install resend
 * - SendGrid: npm install @sendgrid/mail
 * - Mailgun: npm install mailgun.js
 * - AWS SES: npm install @aws-sdk/client-ses
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, recipientEmail, subject } = body;

    // Validate inputs
    if (!invoiceId || !recipientEmail) {
      return NextResponse.json(
        { error: "Invoice ID and recipient email are required" },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // TODO: Implement email sending logic here
    // 1. Get invoice data from storage or database
    // 2. Generate PDF (or create HTML template)
    // 3. Send email using selected service
    // 4. Update invoice status to "sent"
    // 5. Return success response

    return NextResponse.json(
      {
        message: "Email sending not yet implemented",
        invoiceId,
        recipientEmail,
        subject: subject || "Your Invoice",
        nextSteps: [
          "1. Choose an email service (Resend, SendGrid, Mailgun, or AWS SES)",
          "2. Install the library: npm install <service>",
          "3. Set up API keys in .env.local",
          "4. Create email template for invoices",
          "5. Configure email sender and template data",
          "6. Send email with invoice attached or as link",
          "7. Update invoice status to 'sent'",
        ],
      },
      { status: 501 }, // Not Implemented
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 },
    );
  }
}
