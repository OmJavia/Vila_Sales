import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE", "DISPATCH"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();
    const orders = db.orders;

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
    const access = requireAuth(req, ["ADMIN", "SALES"]);
    if ("errorResponse" in access) return access.errorResponse;
    const actor = access.session.name;

    const body = await req.json();
    const { customerId, items, priority, deliveryDate, notes } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "customerId and a non-empty items array are required" },
        { status: 400 }
      );
    }

    const order = await serverDb.createOrder({
      customerId,
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
