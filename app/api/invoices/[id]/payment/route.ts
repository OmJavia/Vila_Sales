import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const actor = session ? session.name : "Accounts Manager";

    const body = await req.json();
    const { amount, paymentMode = "UPI", transactionRef, notes } = body;

    if (!amount || amount <= 0) {
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
      amount: Number(amount),
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
