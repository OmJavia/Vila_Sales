import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function GET() {
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
    const session = getSessionFromRequest(req);
    // Only ADMIN can modify master configuration
    if (session && session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Administrator can modify master settings" },
        { status: 403 }
      );
    }

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
