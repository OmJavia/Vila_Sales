"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Plus,
  CheckCircle,
  Clock,
  PackageCheck,
  Building,
  Calendar,
  X,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { PURCHASE_ORDERS, PurchaseOrder, ITEMS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useNotificationStore } from "@/lib/notificationStore";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New PO form states
  const [supplierName, setSupplierName] = useState("Apex Forgings & Fasteners Ltd.");
  const [selectedItemId, setSelectedItemId] = useState(ITEMS[0]?.id || "I001");
  const [qty, setQty] = useState(100);
  const [unitPrice, setUnitPrice] = useState(900);
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });

  const toast = useToast();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.poNo.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [receivingId, setReceivingId] = useState<string | null>(null);

  const handleMarkReceived = async (poId: string) => {
    const po = orders.find((o) => o.id === poId);
    if (!po) return;

    setReceivingId(poId);
    try {
      const res = await fetch("/api/purchase/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: po.id,
          poNo: po.poNo,
          supplierName: po.supplierName,
          godownId: "WH-BHIWANDI",
          items: po.items.map((it) => ({
            itemCode: it.itemCode,
            qtyReceived: it.qtyOrdered,
          })),
          receivedBy: "Warehouse Operator",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to receive goods");
      }

      setOrders((prev) =>
        prev.map((item) => {
          if (item.id === poId) {
            return {
              ...item,
              status: "COMPLETED",
              items: item.items.map((it) => ({
                ...it,
                qtyReceived: it.qtyOrdered,
              })),
            };
          }
          return item;
        })
      );

      toast.success(
        "Goods Received & Stock Updated",
        `PO ${po.poNo} received into Bhiwandi Central Godown. Stock ledger updated.`
      );
      addNotification({
        type: "STOCK_LOW",
        title: `Goods Inwarded from ${po.supplierName}`,
        message: `PO ${po.poNo} received and verified. Physical & available stock increased.`,
        severity: "INFO",
        href: "/inventory/stock",
      });
    } catch (err: any) {
      toast.error("Receipt Failed", err.message || "Could not inward goods");
    } finally {
      setReceivingId(null);
    }
  };

  const handleCreateNewPO = () => {
    const item = ITEMS.find((i) => i.id === selectedItemId) || ITEMS[0];
    const poNumber = `PO-2026-${String(orders.length + 83).padStart(3, "0")}`;
    const total = qty * unitPrice;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNo: poNumber,
      supplierId: "SUP-MANUAL",
      supplierName: supplierName,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: expectedDate,
      totalAmount: total,
      status: "SENT",
      items: [
        {
          itemCode: item.code,
          itemName: item.name,
          qtyOrdered: qty,
          qtyReceived: 0,
          unitPrice: unitPrice,
          unit: item.unit,
        },
      ],
    };

    setOrders([newPO, ...orders]);
    PURCHASE_ORDERS.unshift(newPO);

    addNotification({
      type: "NEW_ORDER",
      title: `New PO ${poNumber} Issued`,
      message: `${poNumber} sent to ${supplierName} for ${qty} ${item.unit} (${formatCurrency(total)})`,
      severity: "SUCCESS",
      entityId: newPO.id,
      entityType: "ORDER",
      href: "/purchase/orders",
    });

    toast.success("Purchase Order Issued", `${poNumber} created for ${supplierName}.`);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Purchase Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track outbound purchase orders issued to manufacturers and stockists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/purchase/requirements"
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            Requirements Queue
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search PO # or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "SENT", "PARTIAL_RECEIVED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === st
                  ? "bg-brand-primary text-white"
                  : "bg-bg-canvas text-text-secondary hover:bg-hover border border-border"
              }`}
            >
              {st === "ALL" ? "All Orders" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">PO Number</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">PO Date</th>
              <th className="p-3">Expected Delivery</th>
              <th className="p-3">Items Summary</th>
              <th className="p-3 text-right">PO Total (₹)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((po) => (
              <tr key={po.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{po.poNo}</td>
                <td className="p-3 font-medium text-text-primary">{po.supplierName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(po.orderDate)}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(po.expectedDate)}</td>
                <td className="p-3">
                  {po.items.map((it, idx) => (
                    <div key={idx} className="text-text-secondary">
                      {it.itemName} ({it.qtyOrdered} {it.unit})
                      {it.qtyReceived > 0 && (
                        <span className="text-emerald-600 font-semibold ml-1">
                          [{it.qtyReceived} recvd]
                        </span>
                      )}
                    </div>
                  ))}
                </td>
                <td className="p-3 text-right font-mono font-bold text-text-primary">
                  {formatCurrency(po.totalAmount)}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      po.status === "COMPLETED"
                        ? "badge-ok"
                        : po.status === "PARTIAL_RECEIVED"
                        ? "badge-low"
                        : "badge-normal"
                    }`}
                  >
                    {po.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {po.status !== "COMPLETED" ? (
                    <button
                      onClick={() => handleMarkReceived(po.id)}
                      disabled={receivingId === po.id}
                      className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <PackageCheck className="w-3 h-3 text-emerald-600" />
                      {receivingId === po.id ? "Inwarding..." : "Receive Goods"}
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Fulfilled
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  New Purchase Order
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Issue an outbound PO to a supplier for warehouse restocking.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Supplier</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Select Product</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const it = ITEMS.find((i) => i.id === e.target.value);
                    if (it) setUnitPrice(Math.round(it.price * 0.75));
                  }}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                >
                  {ITEMS.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Purchase Rate (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">Total PO Value:</span>
              <span className="font-mono text-base font-bold text-brand-primary">
                {formatCurrency(qty * unitPrice)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPO}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Issue PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
