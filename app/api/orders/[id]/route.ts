import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    if (auth.errorResponse) return auth.errorResponse;

    const db = serverDb.read();
    const order = db.orders.find(
      (o) => o.id === params.id || o.orderNo === params.id
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // If buyer, ensure they only access their own order
    if (auth.session.role === "BUYER" && order.customerId !== auth.session.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot access orders of other customers" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req, ["ADMIN", "SALES", "WAREHOUSE", "DISPATCH"]);
    if (auth.errorResponse) return auth.errorResponse;
    const actor = auth.session.name;

    const body = await req.json();
    const { status, cancelReason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "New status is required" },
        { status: 400 }
      );
    }

    const updated = await serverDb.updateOrderStatus(
      params.id,
      status,
      actor,
      cancelReason
    );

    return NextResponse.json({
      success: true,
      message: `Order ${updated.orderNo} updated to ${status}`,
      order: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 400 }
    );
  }
}
