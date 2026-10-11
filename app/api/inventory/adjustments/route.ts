import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "WAREHOUSE", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();
    return NextResponse.json({ success: true, adjustments: db.adjustments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch adjustments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = requireAuth(req, ["ADMIN", "WAREHOUSE"]);
    if ("errorResponse" in access) return access.errorResponse;
    const approvedBy = access.session.name;

    const body = await req.json();
    const { itemId, godown, physicalCount, reason } = body;

    if (!itemId || !godown || physicalCount === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: "itemId, godown, physicalCount, and reason are required" },
        { status: 400 }
      );
    }

    const adj = await serverDb.createStockAdjustment({
      itemId,
      godown,
      physicalCount: Number(physicalCount),
      reason,
      approvedBy,
    });

    return NextResponse.json({
      success: true,
      message: `Stock adjustment ${adj.adjNo} created. Ledger updated.`,
      adjustment: adj,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create adjustment" },
      { status: 400 }
    );
  }
}
