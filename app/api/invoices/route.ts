import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();
    return NextResponse.json({ success: true, invoices: db.invoices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = requireAuth(req, ["ADMIN", "ACCOUNTS"]);
    if ("errorResponse" in access) return access.errorResponse;
    const actor = access.session.name;

    const body = await req.json();
    const { orderNo, customerId, items, transporter, vehicleNo, ewayBillNo, notes } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "customerId and valid items are required" },
        { status: 400 }
      );
    }

    const invoice = await serverDb.createInvoice({
      orderNo: orderNo || "Direct Billing",
      customerId,
      items,
      transporter,
      vehicleNo,
      ewayBillNo,
      notes,
      actor,
    });

    return NextResponse.json({
      success: true,
      message: `Tax Invoice ${invoice.invoiceNo} created successfully.`,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: 400 }
    );
  }
}
