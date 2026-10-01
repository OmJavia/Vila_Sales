"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Truck, FileCheck, ExternalLink, Printer } from "lucide-react";
import { CHALLANS, Challan } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function ChallansPage() {
  const [challans] = useState<Challan[]>(CHALLANS);
  const [search, setSearch] = useState("");

  const filtered = challans.filter(
    (c) =>
      c.challanNo.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicleNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Delivery Challans</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Material transit passes, vehicle numbers, E-way bill details, and gate clearance.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search challan #, vehicle, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="text-xs text-text-muted">
          Showing <strong>{filtered.length}</strong> active challans
        </div>
      </div>

      {/* Table */}
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-sm">
            No active challans found.
          </div>
        ) : (
          filtered.map((ch) => (
            <div key={ch.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-brand-primary">
                    {ch.challanNo}
                  </span>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {ch.customerName}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5 font-mono">
                    Order: {ch.orderNo}
                  </div>
                </div>
                <span
                  className={`badge ${
                    ch.status === "DELIVERED"
                      ? "badge-ok"
                      : ch.status === "DISPATCHED"
                      ? "badge-low"
                      : "badge-normal"
                  }`}
                >
                  {ch.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-bg-canvas p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[10px]">Dispatch Date</span>
                  <span className="font-mono text-text-secondary">{formatDate(ch.dispatchDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Packages</span>
                  <span className="font-mono font-medium text-text-primary">{ch.packagesCount} pkgs</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Transporter</span>
                  <span className="text-text-primary font-medium">{ch.transporter}</span>
                  <span className="block font-mono text-[10px] text-text-muted">{ch.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">E-Way Bill</span>
                  <span className="font-mono text-text-secondary text-[11px]">{ch.ewayBillNo}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1 border-t border-border">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Delivery Challan
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
              <tr>
                <th className="p-3">Challan #</th>
                <th className="p-3">Linked Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Dispatch Date</th>
                <th className="p-3">Transporter & Vehicle</th>
                <th className="p-3">E-Way Bill #</th>
                <th className="p-3 text-center">Packages</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ch) => (
                <tr key={ch.id} className="hover:bg-hover/50">
                  <td className="p-3 font-mono font-semibold text-brand-primary">
                    {ch.challanNo}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/orders`}
                      className="font-mono text-brand-primary hover:underline"
                    >
                      {ch.orderNo}
                    </Link>
                  </td>
                  <td className="p-3 font-medium text-text-primary">{ch.customerName}</td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(ch.dispatchDate)}</td>
                  <td className="p-3">
                    <div className="font-medium text-text-primary">{ch.transporter}</div>
                    <div className="font-mono text-[10px] text-text-muted">{ch.vehicleNo}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-text-secondary">
                    {ch.ewayBillNo}
                  </td>
                  <td className="p-3 text-center font-mono">{ch.packagesCount} pkgs</td>
                  <td className="p-3 text-center">
                    <span
                      className={`badge ${
                        ch.status === "DELIVERED"
                          ? "badge-ok"
                          : ch.status === "DISPATCHED"
                          ? "badge-low"
                          : "badge-normal"
                      }`}
                    >
                      {ch.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => window.print()}
                      className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      Print DC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
