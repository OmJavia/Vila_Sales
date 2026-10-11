import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const actor = session ? session.name : "Quality Inspector";

    const body = await req.json().catch(() => ({}));
    const godown = body.godown || "Main Warehouse (Bhiwandi Logistics Hub)";

    const result = await serverDb.approveAndRestockReturn({
      returnId: params.id,
      godown,
      actor,
    });

    return NextResponse.json({
      success: true,
      message: `Return lot approved and restocked into ${godown}. Credit note ${result.cnNo} processed.`,
      salesReturn: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to approve return" },
      { status: 400 }
    );
  }
}
