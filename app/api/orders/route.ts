import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const db = serverDb.read();
    let orders = db.orders;

    // If buyer, filter only their own orders
    if (session && session.role === "BUYER") {
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
    const session = getSessionFromRequest(req);
    const actor = session ? session.name : "Sales Representative";

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
