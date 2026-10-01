"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Search, MessageSquare } from "lucide-react";
import { COMPLAINTS, Complaint } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [search, setSearch] = useState("");

  const filtered = complaints.filter(
    (c) =>
      c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.orderNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleResolve = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "RESOLVED" as const } : c))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customer Complaints & Tickets</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Resolve delivery issues, product defects, rate disputes, and quality rejections.
          </p>
        </div>
      </div>

      <div className="card p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search ticket #, customer or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="text-xs text-text-muted">
          Open Tickets: <strong>{complaints.filter((c) => c.status !== "RESOLVED").length}</strong>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Ticket #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Order Ref</th>
              <th className="p-3">Issue Category</th>
              <th className="p-3">Description</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3 text-center">Priority</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((cmp) => (
              <tr key={cmp.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{cmp.ticketNo}</td>
                <td className="p-3 font-medium text-text-primary">{cmp.customerName}</td>
                <td className="p-3 font-mono text-text-secondary">{cmp.orderNo}</td>
                <td className="p-3 font-medium text-text-secondary">
                  {cmp.type.replace("_", " ")}
                </td>
                <td className="p-3 text-text-secondary max-w-sm">{cmp.description}</td>
                <td className="p-3 text-text-muted">{cmp.assignedTo}</td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      cmp.priority === "HIGH"
                        ? "badge-critical"
                        : cmp.priority === "MEDIUM"
                        ? "badge-low"
                        : "badge-normal"
                    }`}
                  >
                    {cmp.priority}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      cmp.status === "RESOLVED"
                        ? "badge-ok"
                        : cmp.status === "IN_PROGRESS"
                        ? "badge-low"
                        : "badge-critical"
                    }`}
                  >
                    {cmp.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {cmp.status !== "RESOLVED" ? (
                    <button
                      onClick={() => handleResolve(cmp.id)}
                      className="btn-secondary text-[11px] py-1 px-2.5"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Closed
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
