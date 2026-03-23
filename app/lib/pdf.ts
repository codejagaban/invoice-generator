/**
 * PDF Generation Utilities
 * Functions for generating and downloading invoice PDFs
 */

import type { Invoice, CompanyDetails, AccountDetails } from "./types";
import { formatCurrency, formatDate } from "./invoice";

/**
 * Generate HTML content for invoice PDF
 */
export function generateInvoiceHTML(
  invoice: Invoice,
  company?: CompanyDetails,
  account?: AccountDetails,
): string {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const tax = (subtotal * (invoice.taxRate || 0)) / 100;
  const total = subtotal + tax;

  // Build "City, State ZIP" line, omitting empty parts
  const cityLine = (city?: string, state?: string, zip?: string): string => {
    const stateZip = [state, zip].filter(Boolean).join(" ");
    const parts = [city, stateZip].filter(Boolean).join(", ");
    return parts ? `<div>${parts}</div>` : "";
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #000;
            background: #fff;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          header {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }
          .company-info, .invoice-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .company-info {
            text-align: right;
            justify-content: flex-end;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 8px;
          }
          .invoice-number {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }
          .company-name {
            font-size: 20px;
            font-weight: bold;
            align-self: end;
            margin-bottom: 8px;
          }
          .company-detail {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
          }
          .invoice-dates {
          margin-top: 20px;
            font-size: 13px;
          }
          .invoice-dates div {
            margin-bottom: 4px;
          }
          .label {
            color: #666;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #333;
            margin-bottom: 12px;
            padding-bottom: 6px;
          }
          .customer-info, .payment-terms {
            font-size: 12px;
            line-height: 1.4;
          }
          .customer-label, .terms-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          table thead {
            background: #f7f7f7;
          }
          table th {
            padding: 10px;
            text-align: left;
            font-weight: 600;
            border-bottom: 0.5px solid #646464;
            font-size: 12px;
          }
          table td {
            padding: 12px 10px;
            border-bottom: 0.5px solid #eee;
          }
          table th:last-child, table td:last-child {
            text-align: right;
          }
          .totals {
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 0.5px solid #eee;
          }
          .total-row.final {
            border-bottom: 0.5px solid #646464;
            border-top: 0.5px solid #646464;
            padding: 12px 0;
            font-size: 16px;
            font-weight: bold;
          }
          .total-label {
            font-weight: 600;
          }
          .notes {
            font-size: 13px;
            line-height: 1.6;
            color: #666;
            padding-top: 20px;
            border-top: 0.5px solid #ddd;
          }
          .notes-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 8px;
          }
          .status-draft {
            background: #f0f0f0;
            color: #333;
          }
          .status-sent {
            background: #dbeafe;
            color: #1e40af;
          }
          .status-paid {
            background: #dcfce7;
            color: #166534;
          }
          @media print {
            body { background: white; }
            .container { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <header>
            <div class="invoice-info">
              <h1>INVOICE</h1>
              <div class="invoice-number">Invoice #${invoice.invoiceNumber}</div>
              <div class="invoice-dates">
                <div><span class="label">Invoice Date</span><br>${formatDate(invoice.date)}</div>
                <div><span class="label">Due Date</span><br>${formatDate(invoice.dueDate)}</div>
              </div>
            </div>
                <div class="company-info">
              ${company && company.logo ? `<img src="${company.logo}" alt="${company.name} logo" style="max-height: 60px; max-width: 160px; object-fit: contain; align-self: flex-end; margin-bottom: 8px;" />` : ""}
              ${company ? `<div class="company-name">${company.name}</div>` : ""}
              <div class="company-detail">
                ${company ? `<div>${company.email}</div>` : ""}
                ${company?.phone ? `<div>${company.phone}</div>` : ""}
                ${company?.address ? `<div>${company.address}</div>` : ""}
                ${company ? cityLine(company.city, company.state, company.zipCode) : ""}
                ${company?.country ? `<div>${company.country}</div>` : ""}
                ${company?.taxId ? `<div>Tax ID: ${company.taxId}</div>` : ""}
              </div>
            </div>
          </header>

          <!-- Customer Info -->
          <section>
            <div class="section-title">Bill To:</div>
            <div class="customer-info">
              ${invoice.customer.logo ? `<img src="${invoice.customer.logo}" alt="${invoice.customer.name} logo" style="max-height: 40px; max-width: 120px; object-fit: contain; border-radius: 4px; margin-bottom: 8px; display: block;" />` : ""}
              <div class="customer-label">${invoice.customer.name}</div>
              ${invoice.customer.email ? `<div>${invoice.customer.email}</div>` : ""}
              ${invoice.customer.address ? `<div>${invoice.customer.address}</div>` : ""}
              ${cityLine(invoice.customer.city, invoice.customer.state, invoice.customer.zipCode)}
              ${invoice.customer.country ? `<div>${invoice.customer.country}</div>` : ""}
            </div>
          </section>

          <!-- Line Items -->
          <section>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right; width: 80px;">Quantity</th>
                  <th style="text-align: right; width: 80px;">Rate</th>
                  <th style="text-align: right; width: 100px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.description}${item.type === "hours" ? ' <span style="font-size: 11px; color: #6b7280;">(hours)</span>' : ""}</td>
                    <td style="text-align: right;">${item.type === "hours" ? `${item.quantity} hrs` : item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.rate, invoice.currency)}${item.type === "hours" ? "/hr" : ""}</td>
                    <td style="text-align: right;">${formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </section>

          <!-- Totals -->
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span>${formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            ${
              invoice.taxRate
                ? `
              <div class="total-row">
                <span class="total-label">Tax (${invoice.taxRate}%):</span>
                <span>${formatCurrency(tax, invoice.currency)}</span>
              </div>
            `
                : ""
            }
            <div class="total-row final">
              <span class="total-label">Total:</span>
              <span>${formatCurrency(total, invoice.currency)}</span>
            </div>
          </div>

          <!-- Notes -->
          ${
            invoice.notes
              ? `
            <section class="notes">
              <div class="notes-title">Notes</div>
              <div>${invoice.notes.replace(/\n/g, "<br>")}</div>
            </section>
          `
              : ""
          }

          <!-- Payment Details -->
          ${
            account
              ? `
            <section style="margin-top: 30px; padding-top: 20px; border-top: 0.5px solid #ddd;">
              <div class="section-title" style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #333; margin-bottom: 12px;">Payment Details</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div><span style="color:#666;">Account Holder</span><br>${account.accountHolderName}</div>
                <div><span style="color:#666;">Bank Name</span><br>${account.bankName}</div>
                <div><span style="color:#666;">Account Number</span><br>${account.accountNumber}</div>
                ${account.sortCode ? `<div><span style="color:#666;">Sort Code</span><br>${account.sortCode}</div>` : ""}
                ${account.routingNumber ? `<div><span style="color:#666;">Routing Number</span><br>${account.routingNumber}</div>` : ""}
                ${account.iban ? `<div><span style="color:#666;">IBAN</span><br>${account.iban}</div>` : ""}
                ${account.swiftBic ? `<div><span style="color:#666;">SWIFT / BIC</span><br>${account.swiftBic}</div>` : ""}
                ${account.currency ? `<div><span style="color:#666;">Currency</span><br>${account.currency}</div>` : ""}
                ${account.paymentReference ? `<div style="grid-column: span 2;"><span style="color:#666;">Payment Reference</span><br>${account.paymentReference}</div>` : ""}
              </div>
              ${account.notes ? `<div style="margin-top:10px; font-size:12px; color:#666;">${account.notes.replace(/\n/g, "<br>")}</div>` : ""}
            </section>
          `
              : ""
          }

          <!-- Footer -->
          <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center;">
            <p>Thank you for patronizing us!</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate email-safe HTML for invoice (inline styles, tables only — no flex/grid/style blocks)
 */
export function generateInvoiceEmailHTML(
  invoice: Invoice,
  company?: CompanyDetails,
  account?: AccountDetails,
): string {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );
  const tax = (subtotal * (invoice.taxRate || 0)) / 100;
  const total = subtotal + tax;

  const cityLine = (city?: string, state?: string, zip?: string): string => {
    const stateZip = [state, zip].filter(Boolean).join(" ");
    const parts = [city, stateZip].filter(Boolean).join(", ");
    return parts ? `<div style="margin:0;">${parts}</div>` : "";
  };

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#000;background:#fff;max-width:600px;margin:0 auto;">
      <tr>
        <td style="padding:32px 28px;">

          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border-bottom:1px solid #e5e7eb;padding-bottom:20px;">
            <tr>
              <td style="vertical-align:top;width:50%;">
                <div style="font-size:28px;font-weight:bold;color:#000;margin-bottom:4px;">INVOICE</div>
                <div style="font-size:13px;color:#666;margin-bottom:12px;">Invoice #${invoice.invoiceNumber}</div>
                <div style="font-size:12px;margin-bottom:4px;">
                  <span style="color:#666;font-size:11px;font-weight:600;text-transform:uppercase;">Invoice Date</span><br/>
                  ${formatDate(invoice.date)}
                </div>
                <div style="font-size:12px;">
                  <span style="color:#666;font-size:11px;font-weight:600;text-transform:uppercase;">Due Date</span><br/>
                  ${formatDate(invoice.dueDate)}
                </div>
              </td>
              <td style="vertical-align:top;width:50%;text-align:right;">
                ${company?.logo ? `<img src="${company.logo}" alt="${company.name}" style="max-height:50px;max-width:140px;margin-bottom:8px;" />` : ""}
                ${company ? `<div style="font-size:16px;font-weight:bold;margin-bottom:4px;">${company.name}</div>` : ""}
                <div style="font-size:11px;color:#666;line-height:1.5;">
                  ${company ? `<div>${company.email}</div>` : ""}
                  ${company?.phone ? `<div>${company.phone}</div>` : ""}
                  ${company?.address ? `<div>${company.address}</div>` : ""}
                  ${company ? cityLine(company.city, company.state, company.zipCode) : ""}
                  ${company?.country ? `<div>${company.country}</div>` : ""}
                </div>
              </td>
            </tr>
          </table>

          <!-- Bill To -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td>
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#333;margin-bottom:8px;">Bill To:</div>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    ${invoice.customer.logo ? `<td style="vertical-align:top;padding-right:10px;"><img src="${invoice.customer.logo}" alt="" style="width:40px;height:40px;border-radius:4px;object-fit:contain;" /></td>` : ""}
                    <td style="vertical-align:top;font-size:12px;line-height:1.5;">
                      <div style="font-weight:600;color:#333;">${invoice.customer.name}</div>
                      ${invoice.customer.email ? `<div>${invoice.customer.email}</div>` : ""}
                      ${invoice.customer.address ? `<div>${invoice.customer.address}</div>` : ""}
                      ${cityLine(invoice.customer.city, invoice.customer.state, invoice.customer.zipCode)}
                      ${invoice.customer.country ? `<div>${invoice.customer.country}</div>` : ""}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Line Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;font-size:13px;">
            <tr style="background:#f7f7f7;">
              <th style="padding:10px;text-align:left;font-weight:600;font-size:12px;border-bottom:1px solid #999;">Description</th>
              <th style="padding:10px;text-align:right;font-weight:600;font-size:12px;border-bottom:1px solid #999;width:70px;">Qty</th>
              <th style="padding:10px;text-align:right;font-weight:600;font-size:12px;border-bottom:1px solid #999;width:80px;">Rate</th>
              <th style="padding:10px;text-align:right;font-weight:600;font-size:12px;border-bottom:1px solid #999;width:90px;">Amount</th>
            </tr>
            ${invoice.items
              .map(
                (item) => `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eee;">${item.description}</td>
              <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">${item.quantity}</td>
              <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">${formatCurrency(item.rate, invoice.currency)}</td>
              <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">${formatCurrency(item.quantity * item.rate, invoice.currency)}</td>
            </tr>`,
              )
              .join("")}
          </table>

          <!-- Totals -->
          <table width="280" cellpadding="0" cellspacing="0" style="margin-left:auto;margin-bottom:28px;font-size:13px;">
            <tr>
              <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #eee;">Subtotal</td>
              <td style="padding:8px 0;text-align:right;border-bottom:1px solid #eee;">${formatCurrency(subtotal, invoice.currency)}</td>
            </tr>
            ${invoice.taxRate ? `
            <tr>
              <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #eee;">Tax (${invoice.taxRate}%)</td>
              <td style="padding:8px 0;text-align:right;border-bottom:1px solid #eee;">${formatCurrency(tax, invoice.currency)}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:12px 0;font-weight:bold;font-size:16px;border-top:1px solid #999;border-bottom:1px solid #999;">Total</td>
              <td style="padding:12px 0;text-align:right;font-weight:bold;font-size:16px;border-top:1px solid #999;border-bottom:1px solid #999;">${formatCurrency(total, invoice.currency)}</td>
            </tr>
          </table>

          ${invoice.notes ? `
          <!-- Notes -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#666;">
                <div style="font-weight:600;color:#333;margin-bottom:6px;">Notes</div>
                <div style="line-height:1.6;">${invoice.notes.replace(/\n/g, "<br/>")}</div>
              </td>
            </tr>
          </table>` : ""}

          ${account ? `
          <!-- Payment Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-top:16px;border-top:1px solid #eee;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#333;margin-bottom:10px;">Payment Details</div>
                <table cellpadding="0" cellspacing="0" style="font-size:12px;">
                  <tr>
                    <td style="padding:4px 20px 4px 0;"><span style="color:#666;">Account Holder</span><br/>${account.accountHolderName}</td>
                    <td style="padding:4px 0;"><span style="color:#666;">Bank Name</span><br/>${account.bankName}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 20px 4px 0;"><span style="color:#666;">Account Number</span><br/>${account.accountNumber}</td>
                    ${account.sortCode ? `<td style="padding:4px 0;"><span style="color:#666;">Sort Code</span><br/>${account.sortCode}</td>` : "<td></td>"}
                  </tr>
                  ${account.iban || account.swiftBic ? `<tr>
                    ${account.iban ? `<td style="padding:4px 20px 4px 0;"><span style="color:#666;">IBAN</span><br/>${account.iban}</td>` : "<td></td>"}
                    ${account.swiftBic ? `<td style="padding:4px 0;"><span style="color:#666;">SWIFT / BIC</span><br/>${account.swiftBic}</td>` : "<td></td>"}
                  </tr>` : ""}
                </table>
              </td>
            </tr>
          </table>` : ""}

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#999;text-align:center;">
                Thank you for your business!
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `;
}

/**
 * Download invoice as PDF (client-side)
 */
export async function downloadInvoicePDF(
  invoice: Invoice,
  company?: CompanyDetails,
  account?: AccountDetails,
): Promise<void> {
  // Dynamically import html2pdf to ensure it's loaded client-side
  const html2pdf = (await import("html2pdf.js")).default;

  const htmlContent = generateInvoiceHTML(invoice, company, account);

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Invoice_${invoice.invoiceNumber}.pdf`,
    image: { type: "png" as const, quality: 1 },
    html2canvas: {
      scale: 4,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };

  try {
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    // Attach to DOM so fonts and styles render correctly
    element.style.position = "fixed";
    element.style.left = "-9999px";
    element.style.top = "0";
    document.body.appendChild(element);
    await html2pdf().set(options).from(element).save();
    document.body.removeChild(element);
  } catch (error) {
    // Clean up DOM element if it was attached
    const leftover = document.querySelector('[style*="-9999px"]');
    if (leftover) document.body.removeChild(leftover);
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF");
  }
}
