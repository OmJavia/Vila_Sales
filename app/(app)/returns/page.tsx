"use client";

import { useState } from "react";
import { RotateCcw, Plus, Search, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SalesReturn {
  id: string;
  cnNo: string;
  customerName: string;
  date: string;
  orderNo: string;
  amount: number;
  reason: string;
  stockRestocked: boolean;
  status: "APPROVED" | "PENDING_QC" | "REJECTED";
}

const SAMPLE_RETURNS: SalesReturn[] = [
  {
    id: "SR-01",
    cnNo: "CN-2026-012",
    customerName: "Metro Hardware Co.",
    date: "2026-09-27",
    orderNo: "#1046",
    amount: 1120,
    reason: "Thread plating surface defect (2 boxes)",
    stockRestocked: false,
    status: "PENDING_QC",
  },
  {
    id: "SR-02",
    cnNo: "CN-2026-011",
    customerName: "Sunrise Traders",
    date: "2026-09-18",
    orderNo: "#1038",
    amount: 3500,
    reason: "Excess ordered by contractor, returned in sealed condition",
    stockRestocked: true,
    status: "APPROVED",
  },
];

export default function ReturnsPage() {
  const [returns] = useState<SalesReturn[]>(SAMPLE_RETURNS);
  const [search, setSearch] = useState("");

  const filtered = returns.filter(
    (r) =>
      r.cnNo.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sales Returns & Credit Notes</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage goods returned from customers, QC defect verification, and GST credit note generation.
          </p>
        </div>
      </div>

      <div className="card p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search CN #, customer or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="text-xs text-text-muted">
          Total Credit Notes: <strong>{returns.length}</strong>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Credit Note #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Order Ref</th>
              <th className="p-3">Reason</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3 text-center">Restocked</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ret) => (
              <tr key={ret.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{ret.cnNo}</td>
                <td className="p-3 font-medium text-text-primary">{ret.customerName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(ret.date)}</td>
                <td className="p-3 font-mono text-text-secondary">{ret.orderNo}</td>
                <td className="p-3 text-text-secondary">{ret.reason}</td>
                <td className="p-3 text-right font-mono font-semibold">
                  {formatCurrency(ret.amount)}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      ret.stockRestocked ? "badge-ok" : "badge-normal text-text-muted"
                    }`}
                  >
                    {ret.stockRestocked ? "Restocked" : "In QC Yard"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      ret.status === "APPROVED"
                        ? "badge-ok"
                        : ret.status === "PENDING_QC"
                        ? "badge-low"
                        : "badge-critical"
                    }`}
                  >
                    {ret.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
