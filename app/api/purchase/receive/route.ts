import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const access = requireAuth(req, ["ADMIN", "WAREHOUSE"]);
    if ("errorResponse" in access) return access.errorResponse;
    const actor = access.session.name;

    const body = await req.json();
    const { poNo, supplierId, godown, items, transporter, vehicleNo, remarks } = body;

    if (!poNo || !godown || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "poNo, godown, and received items array are required" },
        { status: 400 }
      );
    }

    const grn = await serverDb.receivePurchaseOrder({
      poNo,
      supplierId: supplierId || "SUP-01",
      godown,
      items,
      actor,
      transporter,
      vehicleNo,
      remarks,
    });

    return NextResponse.json({
      success: true,
      message: `Goods receipt ${grn.grnNo} recorded. Usable stock increased in ${godown}.`,
      grn,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to receive goods" },
      { status: 400 }
    );
  }
}
