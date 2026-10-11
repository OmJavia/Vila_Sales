import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
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
    const access = requireAuth(req, ["ADMIN"]);
    if ("errorResponse" in access) return access.errorResponse;

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
      message: "Company configuration updated.",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
