import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["ADMIN", "WAREHOUSE", "ACCOUNTS"]);
    if (auth.errorResponse) return auth.errorResponse;

    const db = serverDb.read();
    return NextResponse.json({ success: true, movements: db.stockMovements });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
