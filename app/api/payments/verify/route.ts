import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const access = requireAuth(req, ["ADMIN", "ACCOUNTS"]);
    if ("errorResponse" in access) return access.errorResponse;
    const session = access.session;
    const body = await req.json();
    const {
      type, // "GATEWAY_SIGNATURE" | "MANUAL_UTR_SUBMISSION" | "ACCOUNTS_APPROVAL"
      orderId,
      invoiceId,
      amount,
      utrNumber,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      senderBank,
      accountHolder,
      receiptFileName,
    } = body;

    if (!orderId && !invoiceId) {
      return NextResponse.json(
        { success: false, error: "orderId or invoiceId is required" },
        { status: 400 }
      );
    }

    const db = serverDb.read();
    const order = orderId
      ? db.orders.find((o) => o.id === orderId || o.orderNo === orderId)
      : null;
    const invoice = invoiceId
      ? db.invoices.find((i) => i.id === invoiceId || i.invoiceNo === invoiceId)
      : null;

    // ── Scenario A: Gateway Signature Verification (Razorpay) ──────────────
    // The current code does not persist and bind gateway order IDs to invoices, nor
    // reconcile provider webhooks. A valid signature alone cannot establish which
    // invoice should be credited, so never mark an invoice paid through this endpoint.
    if (type === "GATEWAY_SIGNATURE") {
      return NextResponse.json(
        {
          success: false,
          code: "GATEWAY_RECONCILIATION_NOT_CONFIGURED",
          error: "Automated gateway verification is disabled until server-side payment-intent mapping and signed webhook reconciliation are implemented.",
        },
        { status: 503 }
      );
    }

    // ── Scenario B: Manual Bank Transfer / UPI UTR Submission ───────────────
    if (type === "MANUAL_UTR_SUBMISSION") {
      if (!order) {
        return NextResponse.json(
          { success: false, error: "A saved sales order is required before submitting a payment reference." },
          { status: 404 }
        );
      }
      if (order.status === "CANCELLED" || order.status === "CLOSED") {
        return NextResponse.json(
          { success: false, error: "Payment references cannot be submitted for cancelled or closed orders." },
          { status: 409 }
        );
      }
      if (typeof utrNumber !== "string" || !/^[A-Za-z0-9-]{6,22}$/.test(utrNumber.trim())) {
        return NextResponse.json(
          { success: false, error: "Enter a valid 6–22 character bank/UPI reference. A reference is not proof of payment." },
          { status: 400 }
        );
      }
      const submittedAmount = Number(amount);
      if (!Number.isFinite(submittedAmount) || submittedAmount <= 0 || submittedAmount > order.totalAmount) {
        return NextResponse.json(
          { success: false, error: "Submitted amount must be positive and cannot exceed the saved order total." },
          { status: 400 }
        );
      }

      // A UTR is only a claim from the submitter. It is not proof of settlement.
      order.workflow.push({
        id: `wf-${Date.now()}`,
        label: `Payment reference ${utrNumber.trim()} submitted for ₹${submittedAmount.toFixed(2)} (PENDING ACCOUNTS VERIFICATION)`,
        status: "CURRENT",
        completedAt: new Date().toISOString().split("T")[0],
        completedBy: session.name,
      });
      serverDb.write(db);

      return NextResponse.json({
        success: true,
        status: "PENDING_VERIFICATION",
        message: "Reference recorded for review only. The invoice remains unpaid until Accounts verifies actual receipt against the bank statement.",
      });
    }

    // ── Scenario C: Accounts Staff Confirms Bank Credit ─────────────────────
    if (type === "ACCOUNTS_APPROVAL") {
      if (!invoice) {
        return NextResponse.json(
          { success: false, error: "A valid invoiceId is required for payment reconciliation." },
          { status: 400 }
        );
      }
      if (typeof utrNumber !== "string" || utrNumber.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: "Enter the bank/UPI reference that was verified against the bank statement." },
          { status: 400 }
        );
      }

      const verifiedAmount = Number(amount);
      if (!Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
        return NextResponse.json(
          { success: false, error: "Enter the exact amount confirmed in the bank statement." },
          { status: 400 }
        );
      }

      const result = await serverDb.recordInvoicePayment({
        invoiceId: invoice.id,
        amount: verifiedAmount,
        paymentMode: "NEFT_RTGS",
        transactionRef: utrNumber.trim(),
        actor: session.name,
        notes: `Bank statement reconciled by ${session.name}`,
      });

      return NextResponse.json({
        success: true,
        status: result.invoice.paymentStatus,
        receipt: result.receipt,
        message: `Payment recorded against ${result.invoice.invoiceNo} after Accounts verification.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported verification type" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
