import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/invoiceEmail";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { CANONICAL_COMPANY_CONFIG, isValidGstin } from "@/lib/companyConfig";

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

    // Financial documents must not be sent until the actual seller and SKU tax masters are configured.
    const sellerConfig = CANONICAL_COMPANY_CONFIG;
    const sellerMasterReady =
      isValidGstin(sellerConfig.gstin) &&
      Boolean(sellerConfig.legalEntityName.trim()) &&
      Boolean(sellerConfig.registeredAddress.line1.trim()) &&
      Boolean(sellerConfig.registeredAddress.city.trim()) &&
      Boolean(sellerConfig.registeredAddress.state.trim()) &&
      Boolean(sellerConfig.registeredAddress.pincode.trim()) &&
      Boolean(sellerConfig.stateCode && sellerConfig.stateName.trim());

    if (!sellerMasterReady) {
      return NextResponse.json({ success: false, error: "Invoice delivery is blocked: configure and verify the seller legal name, GSTIN, state and registered address before issuing tax documents." }, { status: 409 });
    }
    if (!invoice.placeOfSupply || !invoice.customerStateCode || !invoice.customerState?.trim()) {
      return NextResponse.json({ success: false, error: "Invoice delivery is blocked: the stored customer place of supply is incomplete." }, { status: 409 });
    }
    if (invoice.customerGstin && !isValidGstin(invoice.customerGstin)) {
      return NextResponse.json({ success: false, error: "Invoice delivery is blocked: the stored customer GSTIN fails validation." }, { status: 409 });
    }
    if (!Array.isArray(invoice.items) || invoice.items.length === 0 || invoice.items.some((line) =>
      !/^\d{4,8}$/.test((line.hsnCode || "").trim()) ||
      typeof line.gstRate !== "number" || ![0, 5, 12, 18, 28].includes(line.gstRate) ||
      !Number.isSafeInteger(line.qty) || line.qty <= 0 ||
      !Number.isFinite(line.rate) || line.rate < 0 ||
      !Number.isFinite(line.totalAmount) || line.totalAmount < 0
    )) {
      return NextResponse.json({ success: false, error: "Invoice delivery is blocked: stored product tax classifications or line values are missing or invalid." }, { status: 409 });
    }
    const linesGrandTotal = Math.round(invoice.items.reduce((sum, line) => sum + line.totalAmount, 0) * 100) / 100;
    if (!Number.isFinite(invoice.totalAmount) || Math.abs(linesGrandTotal - invoice.totalAmount) > 1.01) {
      return NextResponse.json({ success: false, error: "Invoice delivery is blocked: stored line totals do not reconcile with the invoice total. Reconcile before sending." }, { status: 409 });
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
