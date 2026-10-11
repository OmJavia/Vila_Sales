import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/invoiceEmail";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;

  try {
    const body = await req.json();
    const providedInvoice = body?.invoice;
    const invoiceKey =
      typeof body?.invoiceId === "string" ? body.invoiceId.trim() :
      typeof providedInvoice?.id === "string" ? providedInvoice.id :
      typeof providedInvoice?.invoiceNo === "string" ? providedInvoice.invoiceNo : "";

    if (!invoiceKey || invoiceKey.length > 100) {
      return NextResponse.json(
        { success: false, error: "A valid stored invoice ID or invoice number is required." },
        { status: 400 }
      );
    }

    const db = serverDb.read();
    const invoice = db.invoices.find((item) => item.id === invoiceKey || item.invoiceNo === invoiceKey);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });
    }

    // Never trust an invoice object supplied by the browser to generate a financial document.
    const customer = db.customers.find((item) => item.id === invoice.customerId);
    const registeredEmail = customer?.email?.trim().toLowerCase();
    const requestedEmail = typeof body?.recipientEmail === "string" ? body.recipientEmail.trim().toLowerCase() : "";
    if (!registeredEmail || requestedEmail !== registeredEmail) {
      return NextResponse.json(
        { success: false, error: "Invoice emails may only be sent to the registered email address on the stored customer record." },
        { status: 403 }
      );
    }

    const subject = typeof body?.subject === "string" ? body.subject.slice(0, 180) : undefined;
    const notes = typeof body?.notes === "string" ? body.notes.slice(0, 2000) : undefined;
    const result = await sendInvoiceEmail({
      invoice,
      recipientEmail: registeredEmail,
      subject,
      notes,
    });

    const isLiveSent = result.deliveryStatus === "DELIVERED_TO_GATEWAY";
    return NextResponse.json({
      success: result.success,
      message: isLiveSent
        ? `Invoice ${invoice.invoiceNo} dispatched to the registered customer address.`
        : `Invoice ${invoice.invoiceNo} is in preview mode; configure Resend for live delivery.`,
      details: result,
    });
  } catch (error: any) {
    console.error("Failed to send invoice email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
