function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\u0027/g, "&#39;");
}
import { Invoice } from "./data";
import { formatCurrency, formatDate } from "./utils";
import { CANONICAL_COMPANY_CONFIG } from "./companyConfig";

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  deliveredTo: string;
  timestamp: string;
  provider: "resend" | "smtp" | "sandbox_preview";
  subject: string;
  previewHtml: string;
  deliveryStatus: "DELIVERED_TO_GATEWAY" | "LOCAL_SANDBOX_PREVIEW" | "FAILED";
  error?: string;
}

export function generateInvoiceHtml(invoice: Invoice, notes?: string): string {
  const isInterState = invoice.igst > 0;
  const cfg = CANONICAL_COMPANY_CONFIG;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vilasales.vercel.app";

  const itemsRows = invoice.items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px;">
      <td style="padding: 10px 8px; text-align: center; color: #6b7280;">${idx + 1}</td>
      <td style="padding: 10px 8px;">
        <div style="font-weight: 600; color: #111827;">${escapeHtml(item.itemName)}</div>
        <div style="font-size: 11px; color: #6b7280; font-family: monospace;">${escapeHtml(item.itemCode)}</div>
      </td>
      <td style="padding: 10px 8px; text-align: center; font-family: monospace; color: #4b5563;">${escapeHtml(item.hsnCode)}</td>
      <td style="padding: 10px 8px; text-align: center; font-weight: 600;">${escapeHtml(item.qty)} ${escapeHtml(item.unit)}</td>
      <td style="padding: 10px 8px; text-align: right; font-family: monospace;">₹${item.rate.toLocaleString("en-IN")}</td>
      <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-weight: 600;">₹${item.taxableAmount.toLocaleString("en-IN")}</td>
      <td style="padding: 10px 8px; text-align: right; font-family: monospace; color: #1f2937;">₹${(item.cgstAmount + item.sgstAmount + item.igstAmount).toLocaleString("en-IN")}</td>
      <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">₹${item.totalAmount.toLocaleString("en-IN")}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice ${escapeHtml(invoice.invoiceNo)} — ${escapeHtml(cfg.brandName)}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
    
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: #ffffff; padding: 24px 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: top;">
            <div style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">
              ${escapeHtml(cfg.brandName)} · Commercial Operations
            </div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
              ${escapeHtml(cfg.legalEntityName)}
            </h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.4;">
              ${escapeHtml(cfg.registeredAddress.line1)}, ${escapeHtml(cfg.registeredAddress.city)}, ${escapeHtml(cfg.registeredAddress.state)} - ${escapeHtml(cfg.registeredAddress.pincode)}<br>
              <strong>GSTIN:</strong> ${escapeHtml(cfg.gstin)} &nbsp;|&nbsp; <strong>State Code:</strong> ${escapeHtml(cfg.stateCode)} (${escapeHtml(cfg.stateName)})
            </p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <div style="display: inline-block; background: #ffffff; color: #111827; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase;">
              TAX INVOICE
            </div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">Original for Recipient</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Invoice Key Metadata Grid -->
    <div style="padding: 16px 28px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tr>
          <td style="padding: 4px 0; width: 25%;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600;">Invoice No:</span><br>
            <strong style="color: #2563eb; font-size: 14px; font-family: monospace;">${escapeHtml(invoice.invoiceNo)}</strong>
          </td>
          <td style="padding: 4px 0; width: 25%;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600;">Invoice Date:</span><br>
            <strong style="color: #1e293b;">${escapeHtml(formatDate(invoice.invoiceDate))}</strong>
          </td>
          <td style="padding: 4px 0; width: 25%;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600;">Payment Due:</span><br>
            <strong style="color: #dc2626;">${escapeHtml(formatDate(invoice.dueDate))}</strong>
          </td>
          <td style="padding: 4px 0; width: 25%;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600;">Order Ref:</span><br>
            <strong style="color: #1e293b; font-family: monospace;">${escapeHtml(invoice.orderNo)}</strong>
          </td>
        </tr>
      </table>
    </div>

    <!-- Bill To / Consignee Details -->
    <div style="padding: 20px 28px; border-bottom: 1px solid #e5e7eb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 16px;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Billed To (Customer):</span>
            <div style="font-weight: 700; font-size: 14px; color: #111827; margin-top: 4px;">${escapeHtml(invoice.customerName)}</div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 4px; line-height: 1.5;">
              ${escapeHtml(invoice.customerAddress || invoice.customerCity)}<br>
              <strong>GSTIN:</strong> ${escapeHtml(invoice.customerGstin || "Unregistered / Consumer")}<br>
              <strong>Place of Supply:</strong> ${escapeHtml(invoice.placeOfSupply || invoice.customerState || "Not configured")}
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #f1f5f9;">
            <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Transport & Delivery:</span>
            <div style="font-size: 12px; color: #4b5563; line-height: 1.6; margin-top: 4px;">
              <div><strong>Transporter:</strong> ${escapeHtml(invoice.transporter || "Standard Fleet Logistics")}</div>
              <div><strong>Vehicle No:</strong> <span style="font-family: monospace;">${escapeHtml(invoice.vehicleNo || "Direct Fleet")}</span></div>
              ${invoice.ewayBillNo ? `<div><strong>E-Way Bill:</strong> <span style="font-family: monospace;">${escapeHtml(invoice.ewayBillNo)}</span></div>` : ""}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding: 16px 28px;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <thead>
          <tr style="background-color: #111827; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
            <th style="padding: 8px; text-align: center; border-radius: 4px 0 0 0;">#</th>
            <th style="padding: 8px; text-align: left;">Item Description</th>
            <th style="padding: 8px; text-align: center;">HSN</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Rate</th>
            <th style="padding: 8px; text-align: right;">Taxable</th>
            <th style="padding: 8px; text-align: right;">GST</th>
            <th style="padding: 8px; text-align: right; border-radius: 0 4px 0 0;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- Financial Totals Breakdown -->
    <div style="padding: 0 28px 20px 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 55%; vertical-align: top; padding-right: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px;">
              <strong style="color: #92400e; display: block; margin-bottom: 6px;">Payment instructions unavailable</strong>
              <div style="color: #92400e; line-height: 1.5; font-size: 11px;">
                This environment is not configured for payment collection. Do not transfer funds using instructions from this email. Please contact the company through a separately verified channel.
              </div>
            </div>
            ${notes ? `<div style="margin-top: 10px; font-size: 11px; color: #6b7280; font-style: italic;">Note: ${escapeHtml(notes)}</div>` : ""}
          </td>

          <td style="width: 45%; vertical-align: top;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Taxable Amount:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${invoice.taxableAmount.toLocaleString("en-IN")}</td>
                </tr>
                ${
                  invoice.cgst > 0
                    ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">CGST:</td>
                  <td style="padding: 4px 0; text-align: right;">₹${invoice.cgst.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">SGST:</td>
                  <td style="padding: 4px 0; text-align: right;">₹${invoice.sgst.toLocaleString("en-IN")}</td>
                </tr>`
                    : ""
                }
                ${
                  invoice.igst > 0
                    ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">IGST:</td>
                  <td style="padding: 4px 0; text-align: right;">₹${invoice.igst.toLocaleString("en-IN")}</td>
                </tr>`
                    : ""
                }
                <tr style="border-top: 2px solid #cbd5e1;">
                  <td style="padding: 8px 0 2px; font-weight: bold; font-size: 14px; color: #0f172a;">Grand Total:</td>
                  <td style="padding: 8px 0 2px; text-align: right; font-weight: 800; font-size: 16px; color: #2563eb;">₹${invoice.totalAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size: 10px; font-family: sans-serif; color: #94a3b8; text-align: right; padding-top: 2px;">
                    (Inclusive of all applicable GST taxes)
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Call to Action Buttons -->
    <div style="padding: 16px 28px; background: #f3f4f6; text-align: center; border-top: 1px solid #e5e7eb;">
      <a href="${escapeHtml(appUrl)}/invoices/${encodeURIComponent(invoice.id)}" 
         style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 24px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
        View Official Invoice Online &rarr;
      </a>
      <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
        Payment collection is disabled in this prototype. Do not use this email to initiate a transfer.
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 28px; background: #ffffff; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.4;">
      This is a computer-generated GST Tax Invoice issued by <strong>${escapeHtml(cfg.legalEntityName)}</strong><br>
      For billing queries, use a contact channel independently verified with your Vila Sales representative.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an email to the specified recipient using Resend if configured,
 * or returns a verified sandbox preview when credentials are not configured.
 */
export async function sendInvoiceEmail({
  invoice,
  recipientEmail,
  subject,
  notes,
}: {
  invoice: Invoice;
  recipientEmail: string;
  subject?: string;
  notes?: string;
}): Promise<SendEmailResult> {
  const cfg = CANONICAL_COMPANY_CONFIG;
  const mailSubject = subject || `[${escapeHtml(cfg.brandName)}] Tax Invoice ${escapeHtml(invoice.invoiceNo)} - ₹${invoice.totalAmount.toLocaleString("en-IN")}`;
  const htmlContent = generateInvoiceHtml(invoice, notes);
  const messageId = `vs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  // If RESEND_API_KEY is configured in the environment
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${escapeHtml(cfg.brandName)} Billing <billing@vilasales.in>`,
          to: [recipientEmail],
          subject: mailSubject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          messageId: data.id || messageId,
          deliveredTo: recipientEmail,
          timestamp,
          provider: "resend",
          deliveryStatus: "DELIVERED_TO_GATEWAY",
          subject: mailSubject,
          previewHtml: htmlContent,
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          messageId,
          deliveredTo: recipientEmail,
          timestamp,
          provider: "resend",
          deliveryStatus: "FAILED",
          subject: mailSubject,
          previewHtml: htmlContent,
          error: errData.message || `Resend API returned status ${res.status}`,
        };
      }
    } catch (err: any) {
      console.warn("Resend API attempt failed:", err);
      return {
        success: false,
        messageId,
        deliveredTo: recipientEmail,
        timestamp,
        provider: "resend",
        deliveryStatus: "FAILED",
        subject: mailSubject,
        previewHtml: htmlContent,
        error: err.message,
      };
    }
  }

  // When no API key is present: honestly report sandbox preview mode (do not lie that email was delivered!)
  console.log(`[Invoice Mailer Sandbox] Invoice ${escapeHtml(invoice.invoiceNo)} preview rendered for ${recipientEmail}`);

  return {
    success: true,
    messageId,
    deliveredTo: recipientEmail,
    timestamp,
    provider: "sandbox_preview",
    deliveryStatus: "LOCAL_SANDBOX_PREVIEW",
    subject: mailSubject,
    previewHtml: htmlContent,
  };
}
