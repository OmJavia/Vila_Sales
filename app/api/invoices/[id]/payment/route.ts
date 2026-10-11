import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = requireAuth(req, ["ADMIN", "ACCOUNTS"]);
    if ("errorResponse" in access) return access.errorResponse;
    const actor = access.session.name;

    const body = await req.json();
    const { amount, paymentMode = "UPI", transactionRef, notes } = body;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    if (!transactionRef) {
      return NextResponse.json(
        { success: false, error: "Transaction reference / UTR is required" },
        { status: 400 }
      );
    }

    const result = await serverDb.recordInvoicePayment({
      invoiceId: params.id,
      amount: numericAmount,
      paymentMode,
      transactionRef,
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
