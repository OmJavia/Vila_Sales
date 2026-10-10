"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  HardHat,
  MapPin,
  Clock,
} from "lucide-react";
import { ORDERS, ITEMS, Order } from "@/lib/data";
import { useWorkerStore, WORKERS, WorkerTaskItem } from "@/lib/workerStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { notifyWorkerTaskAllocated } from "@/lib/expoNotificationService";
import { useToast } from "@/components/ui/Toast";

export default function StockAllocationPage() {
  const [orders, setOrders] = useState<Order[]>(
    ORDERS.filter((o) =>
      ["CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED"].includes(o.status)
    )
  );

  const [selectedWorkers, setSelectedWorkers] = useState<Record<string, string>>({
    O001: "W001",
    O002: "W001",
    O003: "W002",
    O004: "W003",
  });

  const allocateTask = useWorkerStore((s) => s.allocateTask);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const toast = useToast();

  const handleAllocate = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const workerId = selectedWorkers[orderId] || "W001";
    const worker = WORKERS.find((w) => w.id === workerId) || WORKERS[0];

    // Build worker task items with physical bin/rack locations
    const taskItems: WorkerTaskItem[] = order.items.map((it) => {
      const stockItem = ITEMS.find((i) => i.id === it.itemId || i.code === it.itemCode);
      const rackLoc =
        stockItem?.location ||
        stockItem?.godownStock.find((g) => g.location)?.location ||
        "A1";
      const godownName =
        stockItem?.godownStock[0]?.godown || "Main Warehouse";

      return {
        itemId: it.itemId || stockItem?.id || "I001",
        itemName: it.itemName,
        itemCode: it.itemCode,
        qtyRequired: it.qtyOrdered,
        godown: godownName,
        location: rackLoc,
        qtyAvailable: it.qtyAvailable,
        isLowStock: it.qtyAvailable < it.qtyOrdered,
        isPicked: false,
      };
    });

    // Create the task in WorkerStore
    allocateTask({
      orderId: order.id,
      orderNo: order.orderNo,
      customerName: order.customerName,
      priority: order.priority === "URGENT" ? "URGENT" : order.priority === "HIGH" ? "HIGH" : "NORMAL",
      workerId: worker.id,
      workerName: worker.name,
      items: taskItems,
      dueDate: order.deliveryDate || new Date().toISOString().split("T")[0],
      notes: order.notes || `Pick & pack for dispatch`,
    });

    // Mark order as allocated in local state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "ALLOCATED" as const,
              assignedTo: worker.name,
              items: o.items.map((i) => ({
                ...i,
                qtyAllocated: i.qtyOrdered,
                qtyShort: 0,
              })),
            }
          : o
      )
    );

    // Notify manager & system
    addNotification({
      type: "ORDER_ALLOCATED",
      title: `Stock Allocated for ${order.orderNo}`,
      message: `${order.orderNo} locked and assigned to ${worker.name} for picking in ${worker.godown}.`,
      severity: "INFO",
      entityId: order.id,
      entityType: "ORDER",
      href: `/orders/${order.id}`,
    });

    // Fire Expo push notification to worker
    notifyWorkerTaskAllocated({
      workerId: worker.id,
      workerName: worker.name,
      orderNo: order.orderNo,
      customerName: order.customerName,
      itemCount: taskItems.length,
      godown: worker.godown,
    });

    toast.success(
      "Stock Allocated & Task Assigned",
      `Task pushed to ${worker.name}'s Worker Portal queue.`
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Allocation Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Reserve and lock physical godown inventory to specific customer orders before packing and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/workers"
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <HardHat className="w-3.5 h-3.5 text-blue-600" />
            Worker Management
          </Link>
          <Link
            href="/worker"
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            Worker Portal
          </Link>
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

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end sm:self-auto">
                  {isFullyAllocated ? (
                    <div className="flex items-center gap-2">
                      <span className="badge badge-ok flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        100% Stock Allocated
                      </span>
                      {order.assignedTo && (
                        <span className="text-xs font-medium text-text-secondary flex items-center gap-1 bg-bg-canvas px-2 py-1 rounded border border-border">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          {order.assignedTo}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedWorkers[order.id] || "W001"}
                        onChange={(e) =>
                          setSelectedWorkers((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="text-xs py-1 px-2 border border-border rounded bg-background text-text-secondary focus:outline-none focus:border-brand-primary font-medium"
                      >
                        {WORKERS.filter((w) => w.isActive).map((w) => (
                          <option key={w.id} value={w.id}>
                            Assign: {w.name} ({w.role})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAllocate(order.id)}
                        className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Allocate & Assign
                      </button>
                    </div>
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
                {order.items.map((item, idx) => {
                  const stockItem = ITEMS.find((i) => i.id === item.itemId || i.code === item.itemCode);
                  const rackLoc = stockItem?.location || stockItem?.godownStock.find((g) => g.location)?.location || "A1";

                  return (
                    <div key={idx} className="bg-bg-canvas p-3 rounded-lg border border-border space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-text-primary">{item.itemName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-text-muted">{item.itemCode}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              <MapPin className="w-2.5 h-2.5 text-amber-600" />
                              Rack {rackLoc}
                            </span>
                          </div>
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
                  );
                })}
              </div>

              {/* Desktop Items Allocation Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-bg-canvas text-text-muted font-medium">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5 text-center">Ordered</th>
                      <th className="p-2.5 text-center">Allocated</th>
                      <th className="p-2.5 text-center">Shortage</th>
                      <th className="p-2.5 text-center">Physical On-Hand</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item, idx) => {
                      const stockItem = ITEMS.find((i) => i.id === item.itemId || i.code === item.itemCode);
                      const rackLoc = stockItem?.location || stockItem?.godownStock.find((g) => g.location)?.location || "A1";

                      return (
                        <tr key={idx}>
                          <td className="p-2.5">
                            <div className="font-medium text-text-primary">{item.itemName}</div>
                            <div className="font-mono text-[10px] text-text-muted">{item.itemCode}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              <MapPin className="w-3 h-3 text-amber-600" />
                              Rack {rackLoc}
                            </span>
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
                      );
                    })}
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
