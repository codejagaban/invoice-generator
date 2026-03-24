/**
 * Email Sending API Route
 * POST: Send an invoice via email using Resend
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured. Set RESEND_API_KEY in your environment." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { recipientEmail, subject, message, invoiceHtml, invoiceNumber, pdfBase64 } = body;

    if (!recipientEmail || !invoiceHtml) {
      return NextResponse.json(
        { error: "Recipient email and invoice content are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const attachments = pdfBase64
      ? [
          {
            filename: `Invoice_${invoiceNumber || "invoice"}.pdf`,
            content: pdfBase64,
          },
        ]
      : [];

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipientEmail,
      subject: subject || `Invoice ${invoiceNumber || ""}`.trim(),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          ${message ? `<p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 24px;">${message.replace(/\n/g, "<br/>")}</p>` : ""}
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            ${invoiceHtml}
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
            This invoice was sent using <a href="https://www.invoicer.cv/" style="color: #6b7280; text-decoration: underline;">Invoice Generator</a>.
          </p>
        </div>
      `,
      attachments,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[email API]", err);
    return NextResponse.json(
      {
        error: "Failed to send email. Please try again.",
      },
      { status: 500 },
    );
  }
}
