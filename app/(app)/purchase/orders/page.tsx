"use client";

import { useState } from "react";
import { ShoppingBag, Search, Plus, CheckCircle, Clock } from "lucide-react";
import { PURCHASE_ORDERS, PurchaseOrder } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const [orders] = useState<PurchaseOrder[]>(PURCHASE_ORDERS);
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (o) =>
      o.poNo.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Purchase Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track outbound purchase orders issued to manufacturers and stockists.
          </p>
        </div>
      </div>

      <div className="card p-3 flex items-center justify-between gap-3">
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
        <div className="text-xs text-text-muted">
          Active Purchase Orders: <strong>{orders.length}</strong>
        </div>
      </div>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
