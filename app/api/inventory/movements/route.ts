import { NextRequest, NextResponse } from "next/server";

// This endpoint returns live, session-scoped operational data and must never be prerendered.
export const dynamic = "force-dynamic";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "WAREHOUSE", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();
    return NextResponse.json({ success: true, movements: db.stockMovements });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
