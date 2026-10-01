"use client";

import { useState } from "react";
import { ArrowLeftRight, Plus, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StockTransfer {
  id: string;
  transferNo: string;
  date: string;
  fromGodown: string;
  toGodown: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: "IN_TRANSIT" | "COMPLETED" | "DRAFT";
  transporter: string;
}

const SAMPLE_TRANSFERS: StockTransfer[] = [
  {
    id: "TR-101",
    transferNo: "GT-2026-042",
    date: "2026-09-29",
    fromGodown: "Main Warehouse (Bhiwandi)",
    toGodown: "Secondary Store (Kalamboli)",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    quantity: 30,
    unit: "Box",
    status: "IN_TRANSIT",
    transporter: "Internal Tempo (MH-04-1234)",
  },
  {
    id: "TR-100",
    transferNo: "GT-2026-041",
    date: "2026-09-26",
    fromGodown: "Secondary Store (Kalamboli)",
    toGodown: "Main Warehouse (Bhiwandi)",
    itemCode: "PWF-300-10-SS",
    itemName: "POWERFIT 300×10 SS WASHER",
    quantity: 150,
    unit: "Kg",
    status: "COMPLETED",
    transporter: "Tempo Service",
  },
];

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>(SAMPLE_TRANSFERS);

  const handleReceive = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "COMPLETED" as const } : t))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Inter-Godown Transfers</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Transfer inventory between warehouses (e.g. Bhiwandi to Kalamboli) with in-transit tracking.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Transfer Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">From Warehouse</th>
              <th className="p-3">To Destination</th>
              <th className="p-3">Item Description</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3">Vehicle / Transit</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transfers.map((tr) => (
              <tr key={tr.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{tr.transferNo}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(tr.date)}</td>
                <td className="p-3 text-text-secondary">{tr.fromGodown}</td>
                <td className="p-3 text-text-primary font-medium">{tr.toGodown}</td>
                <td className="p-3">
                  <div className="font-medium text-text-primary">{tr.itemName}</div>
                  <div className="font-mono text-[10px] text-text-muted">{tr.itemCode}</div>
                </td>
                <td className="p-3 text-center font-mono font-semibold">
                  {tr.quantity} {tr.unit}
                </td>
                <td className="p-3 text-text-muted">{tr.transporter}</td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      tr.status === "COMPLETED" ? "badge-ok" : "badge-low"
                    }`}
                  >
                    {tr.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {tr.status === "IN_TRANSIT" ? (
                    <button
                      onClick={() => handleReceive(tr.id)}
                      className="btn-primary text-[11px] py-1 px-2.5"
                    >
                      Confirm Inward
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Received
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
