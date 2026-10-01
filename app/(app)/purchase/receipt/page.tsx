"use client";

import { useState } from "react";
import { PackageCheck, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface GRNRecord {
  id: string;
  grnNo: string;
  poNo: string;
  supplierName: string;
  date: string;
  itemCode: string;
  itemName: string;
  qtyReceived: number;
  qtyAccepted: number;
  qtyRejected: number;
  godown: string;
  qcStatus: "PASSED" | "PARTIAL_REJECT" | "PENDING_QC";
}

const SAMPLE_GRNS: GRNRecord[] = [
  {
    id: "GRN-01",
    grnNo: "GRN-2026-092",
    poNo: "PO-2026-080",
    supplierName: "Apex Forgings & Fasteners Ltd.",
    date: "2026-09-29",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    qtyReceived: 100,
    qtyAccepted: 100,
    qtyRejected: 0,
    godown: "Main Warehouse (Bhiwandi) - Bay 2",
    qcStatus: "PASSED",
  },
  {
    id: "GRN-02",
    grnNo: "GRN-2026-091",
    poNo: "PO-2026-078",
    supplierName: "Maxgrip Industrial Fasteners",
    date: "2026-09-25",
    itemCode: "MGP-500-12-SKT",
    itemName: "MAXGRIP 500×12 SOCKET HEAD",
    qtyReceived: 50,
    qtyAccepted: 48,
    qtyRejected: 2,
    godown: "Main Warehouse (Bhiwandi) - Bay 1",
    qcStatus: "PARTIAL_REJECT",
  },
];

export default function GoodsReceiptPage() {
  const [grns] = useState<GRNRecord[]>(SAMPLE_GRNS);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Goods Receipt Notes (GRN)</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Record physical material inward, quality control (QC) inspection, and stock ledger crediting.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">GRN #</th>
              <th className="p-3">PO Reference</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Inward Date</th>
              <th className="p-3">Item Description</th>
              <th className="p-3 text-center">Received</th>
              <th className="p-3 text-center">Accepted</th>
              <th className="p-3 text-center">Rejected</th>
              <th className="p-3">Godown Bin</th>
              <th className="p-3 text-center">QC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {grns.map((grn) => (
              <tr key={grn.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{grn.grnNo}</td>
                <td className="p-3 font-mono text-text-secondary">{grn.poNo}</td>
                <td className="p-3 font-medium text-text-primary">{grn.supplierName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(grn.date)}</td>
                <td className="p-3">
                  <div className="font-medium text-text-primary">{grn.itemName}</div>
                  <div className="font-mono text-[10px] text-text-muted">{grn.itemCode}</div>
                </td>
                <td className="p-3 text-center font-mono">{grn.qtyReceived}</td>
                <td className="p-3 text-center font-mono font-bold text-emerald-600">
                  {grn.qtyAccepted}
                </td>
                <td className="p-3 text-center font-mono font-bold text-red-600">
                  {grn.qtyRejected}
                </td>
                <td className="p-3 text-text-secondary">{grn.godown}</td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      grn.qcStatus === "PASSED"
                        ? "badge-ok"
                        : grn.qcStatus === "PARTIAL_REJECT"
                        ? "badge-low"
                        : "badge-normal"
                    }`}
                  >
                    {grn.qcStatus.replace("_", " ")}
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
