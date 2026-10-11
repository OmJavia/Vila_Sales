import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import type { OrderStatus } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS", "WAREHOUSE", "DISPATCH"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
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
  const patchAccess = requireAuth(req, ["ADMIN", "SALES", "WAREHOUSE", "DISPATCH", "ACCOUNTS"]);
  if ("errorResponse" in patchAccess) return patchAccess.errorResponse;
  try {
    const actor = patchAccess.session.name;

    const body = await req.json();
    const { status, cancelReason } = body;

    const allowedStatusesByRole: Record<string, OrderStatus[]> = {
      ADMIN: ["DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED", "CLOSED", "CANCELLED"],
      SALES: ["CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "CANCELLED"],
      WAREHOUSE: ["STOCK_CHECK", "ALLOCATED", "VERIFIED", "CANCELLED"],
      DISPATCH: ["CHALLAN_READY", "DISPATCHED"],
      ACCOUNTS: ["CLOSED"],
    };
    const allowedStatuses = allowedStatusesByRole[patchAccess.session.role] || [];
    if (typeof status !== "string" || !allowedStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: "This role cannot set that order status. Invoice/payment statuses are controlled by reconciled financial records." },
        { status: 403 }
      );
    }

    const updated = await serverDb.updateOrderStatus(
      params.id,
      status as OrderStatus,
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
