import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";

export async function GET(req: NextRequest) {
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
