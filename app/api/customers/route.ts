import { NextRequest, NextResponse } from "next/server";

// This endpoint returns live, session-scoped operational data and must never be prerendered.
export const dynamic = "force-dynamic";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const access = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS"]);
  if ("errorResponse" in access) return access.errorResponse;
  try {
    const db = serverDb.read();

    // Reconcile outstanding balances from real invoices
    const customersWithReconciledBalances = db.customers.map((c) => {
      const customerInvoices = db.invoices.filter((inv) => inv.customerId === c.id);
      const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.amountReceived || 0), 0);
      const actualOutstanding = Math.max(0, totalInvoiced - totalPaid);

      return {
        ...c,
        outstandingAmount: actualOutstanding,
        // Credit exposure is held at order creation and released only by cancellation/receipts;
        // invoice-only balances would omit open orders that have not been invoiced yet.
        creditUsed: Number(c.creditUsed) || 0,
      };
    });

    return NextResponse.json({
      success: true,
      customers: customersWithReconciledBalances,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
