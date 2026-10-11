import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth.errorResponse) return auth.errorResponse;

    const db = serverDb.read();
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only ADMIN can modify master configuration - explicitly enforce
    const auth = requireAuth(req, ["ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await req.json();

    const updated = await serverDb.transaction((data) => {
      data.settings = {
        ...data.settings,
        ...body,
      };
      return data.settings;
    });

    return NextResponse.json({
      success: true,
      message: "Company configuration updated and persisted durably.",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
