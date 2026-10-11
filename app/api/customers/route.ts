import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req, ["ADMIN", "SALES", "ACCOUNTS"]);
    if (auth.errorResponse) return auth.errorResponse;

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
        creditUsed: Math.min(c.creditLimit, actualOutstanding),
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
