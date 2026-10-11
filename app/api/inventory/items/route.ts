import { NextRequest, NextResponse } from "next/server";

// This endpoint returns live, session-scoped operational data and must never be prerendered.
export const dynamic = "force-dynamic";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "SALES", "WAREHOUSE", "DISPATCH", "BUYER"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();
    return NextResponse.json({ success: true, items: db.items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch items" },
      { status: 500 }
    );
  }
}
