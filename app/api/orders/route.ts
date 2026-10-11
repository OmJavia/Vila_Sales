import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth.errorResponse) return auth.errorResponse;
    const session = auth.session;

    const db = serverDb.read();
    let orders = db.orders;

    // If buyer, filter only their own orders
    if (session.role === "BUYER") {
      orders = orders.filter((o) => o.customerId === session.userId);
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["ADMIN", "SALES", "BUYER"]);
    if (auth.errorResponse) return auth.errorResponse;
    const session = auth.session;
    const actor = session.name;

    const body = await req.json();
    const { customerId, items, priority, deliveryDate, notes } = body;

    // If buyer, ensure they can only order for themselves
    const effectiveCustomerId = session.role === "BUYER" ? session.userId : customerId;

    if (!effectiveCustomerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "customerId and a non-empty items array are required" },
        { status: 400 }
      );
    }

    const order = await serverDb.createOrder({
      customerId: effectiveCustomerId,
      items,
      priority,
      deliveryDate,
      notes,
      actor,
    });

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNo} created successfully with stock allocation.`,
      order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}
