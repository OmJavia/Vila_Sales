import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const access = requireAuth(req, ["ADMIN", "SALES"]);
    if ("errorResponse" in access) return access.errorResponse;
    const actor = access.session.name;

    const result = await serverDb.convertQuotationToOrder({
      quotationId: params.id,
      actor,
    });

    return NextResponse.json({
      success: true,
      message: `Quotation converted to Sales Order ${result.order.orderNo}.`,
      quotation: result.quotation,
      order: result.order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to convert quotation" },
      { status: 400 }
    );
  }
}
