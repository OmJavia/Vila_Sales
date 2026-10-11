import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ["ADMIN", "SALES"]);
    if (auth.errorResponse) return auth.errorResponse;
    const actor = auth.session.name;

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
