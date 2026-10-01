"use client";

import { useState } from "react";
import { ArrowLeftRight, Search, Filter, ArrowUpRight, ArrowDownLeft, SlidersHorizontal } from "lucide-react";
import { STOCK_MOVEMENTS, StockMovement } from "@/lib/data";

export default function StockMovementsPage() {
  const [movements] = useState<StockMovement[]>(STOCK_MOVEMENTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      m.itemName.toLowerCase().includes(search.toLowerCase()) ||
      m.referenceDoc.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Movements & Ledger</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Complete immutable audit trail of every unit received, allocated, dispatched, or adjusted.
          </p>
        </div>
      </div>

      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search SKU, item name, or doc #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "IN", "OUT", "ADJUSTMENT", "TRANSFER"].map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                typeFilter === tp
                  ? "bg-brand-primary text-white"
                  : "bg-bg-canvas text-text-secondary hover:bg-hover border border-border"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">Item Details</th>
              <th className="p-3">Godown Location</th>
              <th className="p-3">Ref Document</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Balance After</th>
              <th className="p-3">Audit Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((mv) => (
              <tr key={mv.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono text-text-muted whitespace-nowrap">{mv.date}</td>
                <td className="p-3">
                  <span
                    className={`badge inline-flex items-center gap-1 ${
                      mv.type === "IN"
                        ? "badge-ok"
                        : mv.type === "OUT"
                        ? "badge-low"
                        : "badge-normal"
                    }`}
                  >
                    {mv.type === "IN" && <ArrowDownLeft className="w-3 h-3" />}
                    {mv.type === "OUT" && <ArrowUpRight className="w-3 h-3" />}
                    {mv.type === "ADJUSTMENT" && <SlidersHorizontal className="w-3 h-3" />}
                    {mv.type}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-medium text-text-primary">{mv.itemName}</div>
                  <div className="font-mono text-[10px] text-text-muted">{mv.itemCode}</div>
                </td>
                <td className="p-3 text-text-secondary">{mv.godown}</td>
                <td className="p-3 font-mono font-medium text-brand-primary">{mv.referenceDoc}</td>
                <td
                  className={`p-3 text-right font-mono font-semibold ${
                    mv.quantity > 0 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {mv.quantity > 0 ? `+${mv.quantity}` : mv.quantity}
                </td>
                <td className="p-3 text-right font-mono font-bold text-text-primary">
                  {mv.balanceAfter}
                </td>
                <td className="p-3 text-text-secondary max-w-xs truncate">{mv.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
