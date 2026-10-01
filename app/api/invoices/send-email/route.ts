import { NextRequest, NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/invoiceEmail";
import { Invoice } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice, recipientEmail = "omjavia18@gmail.com", notes, subject } = body;

    if (!invoice || !invoice.invoiceNo) {
      return NextResponse.json(
        { success: false, error: "Missing invoice payload" },
        { status: 400 }
      );
    }

    const result = await sendInvoiceEmail({
      invoice: invoice as Invoice,
      recipientEmail,
      subject,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoiceNo} successfully emailed to ${result.deliveredTo}`,
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
