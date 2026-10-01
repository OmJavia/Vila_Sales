"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, PackageCheck, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { ORDERS, Order } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DispatchPage() {
  const [orders, setOrders] = useState<Order[]>(
    ORDERS.filter((o) => ["VERIFIED", "CHALLAN_READY", "DISPATCHED"].includes(o.status))
  );

  const handleMarkDispatched = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "DISPATCHED" as const } : o))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Dispatch Management</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Logistics command center: packing slips, vehicle loading, transporter LR generation, and E-Way bills.
          </p>
        </div>

        <Link href="/dispatch/lr-pod" className="btn-secondary text-xs flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5" />
          Track LR & POD
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-text-muted">Ready to Load / Challan Ready</div>
          <div className="text-xl font-bold font-mono text-brand-primary mt-1">
            {orders.filter((o) => o.status === "VERIFIED" || o.status === "CHALLAN_READY").length} Orders
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">In Transit Today</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {orders.filter((o) => o.status === "DISPATCHED").length} Vehicles
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Pending POD Receipts</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            2 Consignments
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {orders.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-sm">
            No dispatch records found.
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/orders/${ord.id}`}
                    className="font-mono font-bold text-sm text-brand-primary hover:underline block"
                  >
                    {ord.orderNo}
                  </Link>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {ord.customerName}
                  </div>
                </div>
                <span
                  className={`badge ${
                    ord.status === "DISPATCHED"
                      ? "badge-ok"
                      : ord.status === "CHALLAN_READY"
                      ? "badge-low"
                      : "badge-normal"
                  }`}
                >
                  {ord.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-bg-canvas p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[10px]">Order Date</span>
                  <span className="font-mono text-text-secondary">{formatDate(ord.orderDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Target Delivery</span>
                  <span className="font-mono text-text-secondary">{formatDate(ord.deliveryDate)}</span>
                </div>
                <div className="col-span-2 flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-text-muted text-[10px]">Order Value</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(ord.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                <Link
                  href={`/orders/${ord.id}`}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>

                {ord.status !== "DISPATCHED" ? (
                  <button
                    onClick={() => handleMarkDispatched(ord.id)}
                    className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Dispatch Vehicle
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded">
                    Dispatched
                  </span>
                )}
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
                <th className="p-3">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Order Date</th>
                <th className="p-3">Target Delivery</th>
                <th className="p-3 text-right">Order Value</th>
                <th className="p-3 text-center">Dispatch Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-hover/50">
                  <td className="p-3 font-mono font-semibold text-brand-primary">
                    <Link href={`/orders/${ord.id}`} className="hover:underline">
                      {ord.orderNo}
                    </Link>
                  </td>
                  <td className="p-3 font-medium text-text-primary">{ord.customerName}</td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(ord.orderDate)}</td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(ord.deliveryDate)}</td>
                  <td className="p-3 text-right font-mono font-semibold">
                    {formatCurrency(ord.totalAmount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`badge ${
                        ord.status === "DISPATCHED"
                          ? "badge-ok"
                          : ord.status === "CHALLAN_READY"
                          ? "badge-low"
                          : "badge-normal"
                      }`}
                    >
                      {ord.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {ord.status !== "DISPATCHED" ? (
                      <button
                        onClick={() => handleMarkDispatched(ord.id)}
                        className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3" />
                        Dispatch Vehicle
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">Dispatched</span>
                    )}
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
