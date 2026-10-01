"use client";

import { useState } from "react";
import { FileCheck, Upload, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface LRRecord {
  id: string;
  orderNo: string;
  customerName: string;
  lrNumber: string;
  transporter: string;
  dispatchDate: string;
  podStatus: "RECEIVED" | "PENDING" | "OVERDUE";
  podUploadedDate?: string;
  receivedBy?: string;
}

const SAMPLE_LRS: LRRecord[] = [
  {
    id: "LR-01",
    orderNo: "#1044",
    customerName: "Excellent Builders",
    lrNumber: "LR-VTR-99812",
    transporter: "V-Trans India Ltd.",
    dispatchDate: "2026-09-21",
    podStatus: "RECEIVED",
    podUploadedDate: "2026-09-24",
    receivedBy: "Anil Deshmukh (Signed Stamp)",
  },
  {
    id: "LR-02",
    orderNo: "#1047",
    customerName: "Sunrise Traders",
    lrNumber: "LR-NRT-44102",
    transporter: "Navata Road Transport",
    dispatchDate: "2026-09-28",
    podStatus: "OVERDUE",
  },
];

export default function LrPodPage() {
  const [records, setRecords] = useState<LRRecord[]>(SAMPLE_LRS);

  const handleUploadPOD = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              podStatus: "RECEIVED" as const,
              podUploadedDate: new Date().toISOString().split("T")[0],
              receivedBy: "Customer Security Stamp",
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">LR & Proof of Delivery (POD)</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Lorry Receipts (LR) from transporters and signed Proof of Delivery acknowledgments from customers.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">LR Consignment #</th>
              <th className="p-3">Transporter</th>
              <th className="p-3">Dispatch Date</th>
              <th className="p-3 text-center">POD Status</th>
              <th className="p-3">Acknowledgment</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{r.orderNo}</td>
                <td className="p-3 font-medium text-text-primary">{r.customerName}</td>
                <td className="p-3 font-mono text-text-secondary">{r.lrNumber}</td>
                <td className="p-3 text-text-secondary">{r.transporter}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(r.dispatchDate)}</td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      r.podStatus === "RECEIVED"
                        ? "badge-ok"
                        : r.podStatus === "OVERDUE"
                        ? "badge-critical"
                        : "badge-low"
                    }`}
                  >
                    {r.podStatus}
                  </span>
                </td>
                <td className="p-3 text-text-muted">
                  {r.receivedBy ? r.receivedBy : "Awaiting signed copy"}
                </td>
                <td className="p-3 text-right">
                  {r.podStatus !== "RECEIVED" ? (
                    <button
                      onClick={() => handleUploadPOD(r.id)}
                      className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Signed POD
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
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
