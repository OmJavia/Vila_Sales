import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ACCOUNTS or ADMIN staff can record verified invoice payments
    const auth = requireAuth(req, ["ADMIN", "ACCOUNTS"]);
    if (auth.errorResponse) return auth.errorResponse;
    const actor = auth.session.name;

    const body = await req.json();
    const { amount, paymentMode = "UPI", transactionRef, notes } = body;

    if (!amount || Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      return NextResponse.json(
        { success: false, error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    if (!transactionRef || typeof transactionRef !== "string" || transactionRef.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: "A valid transaction reference / UTR (min 6 characters) is required" },
        { status: 400 }
      );
    }

    const result = await serverDb.recordInvoicePayment({
      invoiceId: params.id,
      amount: Number(amount),
      paymentMode,
      transactionRef: transactionRef.trim(),
      actor,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded on Invoice ${result.invoice.invoiceNo}.`,
      invoice: result.invoice,
      receipt: result.receipt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record payment" },
      { status: 400 }
    );
  }
}
