"use client";

import { useState } from "react";
import { Receipt, Plus, Search, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerReceipt {
  id: string;
  receiptNo: string;
  customerName: string;
  date: string;
  amount: number;
  mode: "NEFT" | "RTGS" | "CHEQUE" | "UPI";
  referenceNo: string;
  allocatedInvoices: string;
}

const SAMPLE_RECEIPTS: CustomerReceipt[] = [
  {
    id: "RC-01",
    receiptNo: "RC-2026-214",
    customerName: "Sunrise Traders",
    date: "2026-09-30",
    amount: 240000,
    mode: "RTGS",
    referenceNo: "AXIS99128301",
    allocatedInvoices: "INV/26-27/0471",
  },
  {
    id: "RC-02",
    receiptNo: "RC-2026-213",
    customerName: "Bharat Steel Works",
    date: "2026-09-28",
    amount: 100000,
    mode: "NEFT",
    referenceNo: "SBIN8829102",
    allocatedInvoices: "INV/26-27/0468",
  },
];

export default function ReceiptsPage() {
  const [receipts] = useState<CustomerReceipt[]>(SAMPLE_RECEIPTS);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customer Receipts</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Log inward customer remittances, NEFT/RTGS references, and invoice reconciliation.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Receipt #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">UTR / Bank Ref</th>
              <th className="p-3">Allocated Invoice(s)</th>
              <th className="p-3 text-right">Amount Received (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {receipts.map((rc) => (
              <tr key={rc.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{rc.receiptNo}</td>
                <td className="p-3 font-medium text-text-primary">{rc.customerName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(rc.date)}</td>
                <td className="p-3 font-medium text-text-secondary">{rc.mode}</td>
                <td className="p-3 font-mono text-[11px] text-text-muted">{rc.referenceNo}</td>
                <td className="p-3 font-mono text-text-secondary">{rc.allocatedInvoices}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-600">
                  {formatCurrency(rc.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
