import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/paymentService";
import { serverDb } from "@/lib/server/db";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
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
    if (type === "GATEWAY_SIGNATURE") {
      if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
        return NextResponse.json(
          { success: false, error: "Missing gateway order, payment ID or signature" },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpaySignature({
        orderId: gatewayOrderId,
        paymentId: gatewayPaymentId,
        signature: gatewaySignature,
      });

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid payment signature. Payment cannot be verified." },
          { status: 403 }
        );
      }

      // Validated! Record payment
      const verifiedAmount = amount ? Number(amount) : order?.totalAmount || invoice?.totalAmount || 0;
      if (invoice) {
        await serverDb.recordInvoicePayment({
          invoiceId: invoice.id,
          amount: verifiedAmount,
          paymentMode: "GATEWAY_CARD",
          transactionRef: gatewayPaymentId,
          actor: "Payment Gateway Webhook",
          notes: `Verified Razorpay Payment ID: ${gatewayPaymentId}`,
        });
      }

      if (order && order.status !== "CLOSED") {
        await serverDb.updateOrderStatus(
          order.id,
          "INVOICED",
          "Gateway Automation",
          `Payment verified: ${gatewayPaymentId}`
        );
      }

      return NextResponse.json({
        success: true,
        status: "PAID",
        paymentId: gatewayPaymentId,
        message: "Payment signature verified by server. Order marked paid.",
      });
    }

    // ── Scenario B: Manual Bank Transfer / UPI UTR Submission ───────────────
    if (type === "MANUAL_UTR_SUBMISSION") {
      if (!utrNumber || utrNumber.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "A valid 6-22 digit UTR / Reference number is required" },
          { status: 400 }
        );
      }

      // DO NOT mark paid! Mark as PENDING_VERIFICATION as mandated by Indian B2B banking rules.
      const actor = session ? session.name : "Customer Portal";
      if (order) {
        order.workflow.push({
          id: `wf-${Date.now()}`,
          label: `Manual UTR ${utrNumber} submitted (Pending Accounts Verification)`,
          status: "CURRENT",
          completedAt: new Date().toISOString().split("T")[0],
          completedBy: actor,
        });
        serverDb.write(db);
      }

      return NextResponse.json({
        success: true,
        status: "PENDING_VERIFICATION",
        utrNumber,
        message:
          "Payment reference submitted. Status is PENDING VERIFICATION. Staff will confirm against bank statement.",
      });
    }

    // ── Scenario C: Accounts Staff Confirms Bank Credit ─────────────────────
    if (type === "ACCOUNTS_APPROVAL") {
      if (!session || (session.role !== "ADMIN" && session.role !== "ACCOUNTS")) {
        return NextResponse.json(
          { success: false, error: "Only Accounts or Admin users can approve manual bank credits" },
          { status: 403 }
        );
      }

      const verifiedAmount = amount ? Number(amount) : invoice?.totalAmount || order?.totalAmount || 0;
      if (invoice) {
        await serverDb.recordInvoicePayment({
          invoiceId: invoice.id,
          amount: verifiedAmount,
          paymentMode: "NEFT_RTGS",
          transactionRef: utrNumber || "BANK_VERIFIED",
          actor: session.name,
          notes: `Bank statement reconciled by ${session.name}`,
        });
      }

      return NextResponse.json({
        success: true,
        status: "PAID",
        message: `Payment verified and credited by Accounts (${session.name}).`,
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
