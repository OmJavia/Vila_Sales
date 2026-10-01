"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageSearch, ArrowRight, Truck } from "lucide-react";
import { ORDERS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReadyToDispatchPage() {
  const readyOrders = ORDERS.filter((o) => ["VERIFIED", "CHALLAN_READY"].includes(o.status));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Ready to Dispatch</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Orders where stock has been 100% verified, packed, and awaiting vehicle arrival.
          </p>
        </div>

        <Link href="/dispatch" className="btn-secondary text-xs flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Dispatch Queue
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {readyOrders.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-sm">
            No orders currently awaiting dispatch.
          </div>
        ) : (
          readyOrders.map((ord) => (
            <div key={ord.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-brand-primary">
                    {ord.orderNo}
                  </span>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {ord.customerName}
                  </div>
                </div>
                <span
                  className={`badge ${
                    ord.priority === "URGENT"
                      ? "badge-critical"
                      : ord.priority === "HIGH"
                      ? "badge-low"
                      : "badge-normal"
                  }`}
                >
                  {ord.priority}
                </span>
              </div>

              {/* Items summary */}
              <div className="bg-bg-canvas p-2.5 rounded-lg border border-border space-y-1 text-xs">
                <span className="text-[10px] text-text-muted uppercase font-semibold">Packed Items:</span>
                {ord.items.map((it, idx) => (
                  <div key={idx} className="text-text-secondary flex justify-between">
                    <span className="truncate pr-2">{it.itemName}</span>
                    <span className="font-mono text-text-primary font-medium flex-shrink-0">
                      {it.qtyOrdered} {it.unit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                <div>
                  <span className="text-text-muted block text-[10px]">Target Delivery</span>
                  <span className="font-mono font-medium text-text-primary">{formatDate(ord.deliveryDate)}</span>
                </div>
                <div className="text-right">
                  <span className="text-text-muted block text-[10px]">Order Value</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(ord.totalAmount)}</span>
                </div>
              </div>

              <Link
                href={`/orders/${ord.id}`}
                className="btn-primary text-xs py-2 w-full flex items-center justify-center gap-1.5"
              >
                Generate Challan <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                <th className="p-3">Items Summary</th>
                <th className="p-3">Target Delivery</th>
                <th className="p-3 text-right">Value (₹)</th>
                <th className="p-3 text-center">Priority</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {readyOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-hover/50">
                  <td className="p-3 font-mono font-semibold text-brand-primary">
                    {ord.orderNo}
                  </td>
                  <td className="p-3 font-medium text-text-primary">{ord.customerName}</td>
                  <td className="p-3">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="text-text-secondary">
                        {it.itemName} ({it.qtyOrdered} {it.unit})
                      </div>
                    ))}
                  </td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(ord.deliveryDate)}</td>
                  <td className="p-3 text-right font-mono font-semibold">
                    {formatCurrency(ord.totalAmount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`badge ${
                        ord.priority === "URGENT"
                          ? "badge-critical"
                          : ord.priority === "HIGH"
                          ? "badge-low"
                          : "badge-normal"
                      }`}
                    >
                      {ord.priority}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/orders/${ord.id}`}
                      className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                    >
                      Generate Challan <ArrowRight className="w-3 h-3" />
                    </Link>
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
