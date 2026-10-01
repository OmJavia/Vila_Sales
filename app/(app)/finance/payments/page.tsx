"use client";

import { useState } from "react";
import { CreditCard, Plus, CheckCircle2, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface VendorPayment {
  id: string;
  voucherNo: string;
  supplierName: string;
  date: string;
  amount: number;
  mode: "NEFT" | "RTGS" | "CHEQUE" | "UPI";
  referenceNo: string;
  status: "APPROVED" | "PENDING_APPROVAL";
}

const SAMPLE_PAYMENTS: VendorPayment[] = [
  {
    id: "VP-01",
    voucherNo: "PV-2026-108",
    supplierName: "Apex Forgings & Fasteners Ltd.",
    date: "2026-09-28",
    amount: 150000,
    mode: "RTGS",
    referenceNo: "HDFC998129038",
    status: "APPROVED",
  },
  {
    id: "VP-02",
    voucherNo: "PV-2026-107",
    supplierName: "Sterling Stainless Components",
    date: "2026-09-25",
    amount: 85000,
    mode: "NEFT",
    referenceNo: "ICIC881920192",
    status: "APPROVED",
  },
];

export default function PaymentsPage() {
  const [payments] = useState<VendorPayment[]>(SAMPLE_PAYMENTS);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Vendor Payments</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Outward supplier payment vouchers, bank transaction references, and approvals.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Voucher #</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Payment Date</th>
              <th className="p-3">Mode</th>
              <th className="p-3">Bank UTR / Ref</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{p.voucherNo}</td>
                <td className="p-3 font-medium text-text-primary">{p.supplierName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(p.date)}</td>
                <td className="p-3 font-medium text-text-secondary">{p.mode}</td>
                <td className="p-3 font-mono text-[11px] text-text-muted">{p.referenceNo}</td>
                <td className="p-3 text-right font-mono font-bold text-text-primary">
                  {formatCurrency(p.amount)}
                </td>
                <td className="p-3 text-center">
                  <span className="badge badge-ok">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
