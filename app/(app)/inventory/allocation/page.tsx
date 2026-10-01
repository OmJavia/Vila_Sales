"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { ORDERS, ITEMS, Order } from "@/lib/data";

export default function StockAllocationPage() {
  const [orders, setOrders] = useState<Order[]>(
    ORDERS.filter((o) => ["CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED"].includes(o.status))
  );

  const handleAllocate = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "ALLOCATED" as const,
              items: o.items.map((i) => ({
                ...i,
                qtyAllocated: i.qtyOrdered,
                qtyShort: 0,
              })),
            }
          : o
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Allocation Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Reserve and lock physical godown inventory to specific customer orders before packing and dispatch.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isFullyAllocated = order.items.every((i) => i.qtyAllocated === i.qtyOrdered);
          const hasShortage = order.items.some((i) => i.qtyShort > 0);

          return (
            <div key={order.id} className="card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono font-bold text-base text-brand-primary">
                    {order.orderNo}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {order.customerName}
                  </span>
                  <span
                    className={`badge ${
                      order.priority === "URGENT"
                        ? "badge-critical"
                        : order.priority === "HIGH"
                        ? "badge-low"
                        : "badge-normal"
                    }`}
                  >
                    {order.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                  {isFullyAllocated ? (
                    <span className="badge badge-ok flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      100% Stock Allocated
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAllocate(order.id)}
                      className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Auto-Allocate
                    </button>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-2.5"
                  >
                    View Order <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Mobile Items Allocation List */}
              <div className="sm:hidden space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-bg-canvas p-3 rounded-lg border border-border space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-text-primary">{item.itemName}</div>
                        <div className="font-mono text-[10px] text-text-muted mt-0.5">{item.itemCode}</div>
                      </div>
                      <div>
                        {item.qtyAllocated === item.qtyOrdered ? (
                          <span className="badge badge-ok">Ready</span>
                        ) : item.qtyShort > 0 ? (
                          <span className="badge badge-low">Shortage</span>
                        ) : (
                          <span className="badge badge-normal">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-border/60 text-center font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-text-muted block">Ordered</span>
                        <span className="text-text-primary font-medium">{item.qtyOrdered} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted block">Allocated</span>
                        <span className="text-emerald-600 font-semibold">{item.qtyAllocated}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted block">Shortage</span>
                        <span className={item.qtyShort > 0 ? "text-red-600 font-semibold" : "text-text-muted"}>
                          {item.qtyShort}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted block">On-Hand</span>
                        <span className="text-text-secondary">{item.qtyAvailable}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Items Allocation Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-bg-canvas text-text-muted font-medium">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Ordered</th>
                      <th className="p-2.5 text-center">Allocated</th>
                      <th className="p-2.5 text-center">Shortage</th>
                      <th className="p-2.5 text-center">Physical On-Hand</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5">
                          <div className="font-medium text-text-primary">{item.itemName}</div>
                          <div className="font-mono text-[10px] text-text-muted">{item.itemCode}</div>
                        </td>
                        <td className="p-2.5 text-center font-mono">{item.qtyOrdered} {item.unit}</td>
                        <td className="p-2.5 text-center font-mono font-semibold text-emerald-600">
                          {item.qtyAllocated} {item.unit}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {item.qtyShort > 0 ? (
                            <span className="text-red-600 font-semibold">{item.qtyShort} {item.unit}</span>
                          ) : (
                            <span className="text-text-muted">0</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono">{item.qtyAvailable} {item.unit}</td>
                        <td className="p-2.5 text-right">
                          {item.qtyAllocated === item.qtyOrdered ? (
                            <span className="badge badge-ok">Ready</span>
                          ) : item.qtyShort > 0 ? (
                            <span className="badge badge-low">Shortage</span>
                          ) : (
                            <span className="badge badge-normal">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
