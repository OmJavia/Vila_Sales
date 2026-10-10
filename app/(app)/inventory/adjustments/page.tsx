"use client";

import { useState } from "react";
import { SlidersHorizontal, Plus, AlertCircle, MapPin } from "lucide-react";
import { ITEMS } from "@/lib/data";

interface StockAdjustment {
  id: string;
  adjNo: string;
  date: string;
  itemCode: string;
  itemName: string;
  godown: string;
  location?: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  reason: string;
  approvedBy: string;
}

const SAMPLE_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: "ADJ-01",
    adjNo: "ADJ-2026-014",
    date: "2026-09-27",
    itemCode: "MGP-500-12-SKT",
    itemName: "MAXGRIP 500×12 SOCKET HEAD",
    godown: "Main Warehouse (Bhiwandi)",
    location: "A3",
    systemQty: 20,
    physicalQty: 18,
    difference: -2,
    reason: "Thread defect identified during physical inspection",
    approvedBy: "Amit Sharma",
  },
  {
    id: "ADJ-02",
    adjNo: "ADJ-2026-013",
    date: "2026-09-20",
    itemCode: "PWF-300-10-SS",
    itemName: "POWERFIT 300×10 SS WASHER",
    godown: "Secondary Store (Kalamboli)",
    location: "B7",
    systemQty: 282,
    physicalQty: 292,
    difference: +10,
    reason: "Found uncounted carton from previous inward lot",
    approvedBy: "Amit Sharma",
  },
];

export default function StockAdjustmentsPage() {
  const [adjustments] = useState<StockAdjustment[]>(SAMPLE_ADJUSTMENTS);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Adjustments & Audits</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Physical stock discrepancy reconciliations, damage write-offs, and cycle count approvals.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Audit Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Item Description</th>
              <th className="p-3">Godown</th>
              <th className="p-3">Rack Location</th>
              <th className="p-3 text-center">System Qty</th>
              <th className="p-3 text-center">Physical Count</th>
              <th className="p-3 text-center">Variance</th>
              <th className="p-3">Reason / Justification</th>
              <th className="p-3">Approved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
              {adjustments.map((adj) => {
                const stockItem = ITEMS.find((i) => i.code === adj.itemCode);
                const rackLoc = adj.location || stockItem?.location || stockItem?.godownStock.find((g) => g.location)?.location || "A1";
                return (
                  <tr key={adj.id} className="hover:bg-hover/50">
                    <td className="p-3 font-mono font-semibold text-brand-primary">{adj.adjNo}</td>
                    <td className="p-3 font-mono text-text-muted">{adj.date}</td>
                    <td className="p-3">
                      <div className="font-medium text-text-primary">{adj.itemName}</div>
                      <div className="font-mono text-[10px] text-text-muted">{adj.itemCode}</div>
                    </td>
                    <td className="p-3 text-text-secondary">{adj.godown}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {rackLoc}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{adj.systemQty}</td>
                    <td className="p-3 text-center font-mono font-bold">{adj.physicalQty}</td>
                    <td className="p-3 text-center font-mono font-bold">
                      <span
                        className={
                          adj.difference > 0
                            ? "text-emerald-600"
                            : adj.difference < 0
                            ? "text-red-600"
                            : "text-text-muted"
                        }
                      >
                        {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary">{adj.reason}</td>
                    <td className="p-3 text-text-muted">{adj.approvedBy}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
