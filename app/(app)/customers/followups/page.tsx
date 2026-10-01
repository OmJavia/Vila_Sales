"use client";

import { useState } from "react";
import { ClipboardList, Calendar, CheckCircle2, PhoneCall } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FollowUp {
  id: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  dueDate: string;
  type: "PAYMENT_REMINDER" | "ORDER_CONFIRMATION" | "QUOTE_FEEDBACK" | "DISPATCH_UPDATE";
  notes: string;
  status: "PENDING" | "COMPLETED";
}

const SAMPLE_FOLLOWUPS: FollowUp[] = [
  {
    id: "FU-01",
    customerName: "Excellent Builders",
    contactPerson: "Anil Deshmukh",
    phone: "+91 98765 44444",
    dueDate: "2026-10-01",
    type: "PAYMENT_REMINDER",
    notes: "Follow up on overdue invoice INV/26-27/0482 (₹27,000)",
    status: "PENDING",
  },
  {
    id: "FU-02",
    customerName: "Metro Hardware Co.",
    contactPerson: "Mohan Gupta",
    phone: "+91 98765 22222",
    dueDate: "2026-10-02",
    type: "QUOTE_FEEDBACK",
    notes: "Check quotation QT-102 approval status for high tensile studs",
    status: "PENDING",
  },
];

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>(SAMPLE_FOLLOWUPS);

  const handleComplete = (id: string) => {
    setFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "COMPLETED" as const } : f))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sales & Collection Follow-ups</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Scheduled communications, payment calls, quotation closures, and customer relationship log.
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Follow-up Type</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Discussion Notes</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {followups.map((f) => (
              <tr key={f.id} className="hover:bg-hover/50">
                <td className="p-3 font-medium text-text-primary">{f.customerName}</td>
                <td className="p-3">
                  <div className="text-text-primary">{f.contactPerson}</div>
                  <div className="text-[10px] font-mono text-text-muted">{f.phone}</div>
                </td>
                <td className="p-3 font-medium text-text-secondary">
                  {f.type.replace("_", " ")}
                </td>
                <td className="p-3 font-mono text-text-muted">{formatDate(f.dueDate)}</td>
                <td className="p-3 text-text-secondary max-w-sm">{f.notes}</td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      f.status === "COMPLETED" ? "badge-ok" : "badge-low"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {f.status === "PENDING" ? (
                    <button
                      onClick={() => handleComplete(f.id)}
                      className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Done
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium">Completed</span>
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
