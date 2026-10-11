import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/invoiceEmail";
import { Invoice } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice, recipientEmail, notes, subject } = body;

    if (!invoice || !invoice.invoiceNo) {
      return NextResponse.json(
        { success: false, error: "Missing invoice payload" },
        { status: 400 }
      );
    }

    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: "Valid recipient email address is required" },
        { status: 400 }
      );
    }

    const result = await sendInvoiceEmail({
      invoice: invoice as Invoice,
      recipientEmail,
      subject,
      notes,
    });

    const isLiveSent = result.deliveryStatus === "DELIVERED_TO_GATEWAY";

    return NextResponse.json({
      success: result.success,
      message: isLiveSent
        ? `Invoice ${invoice.invoiceNo} successfully dispatched to ${result.deliveredTo}`
        : `Invoice ${invoice.invoiceNo} generated in preview mode (RESEND_API_KEY required for live dispatch to ${result.deliveredTo})`,
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
