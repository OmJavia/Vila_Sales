"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  Plus,
  X,
  FileCheck,
  Building,
  MapPin,
} from "lucide-react";
import { STOCK_MOVEMENTS, StockMovement, ITEMS } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { useTradeFlowStore } from "@/lib/store";

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>(STOCK_MOVEMENTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Form states for manual stock adjustment
  const [selectedItemId, setSelectedItemId] = useState(ITEMS[0]?.id || "I001");
  const [adjustType, setAdjustType] = useState<"ADJUSTMENT" | "IN" | "OUT">("ADJUSTMENT");
  const [godown, setGodown] = useState("Main Warehouse");
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [refDoc, setRefDoc] = useState("PHY-AUDIT-2026-04");
  const [notes, setNotes] = useState("Physical godown audit count discrepancy adjustment");

  const toast = useToast();
  const setItemStock = useTradeFlowStore((s) => s.setItemStock);

  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      m.itemName.toLowerCase().includes(search.toLowerCase()) ||
      m.referenceDoc.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleRecordAdjustment = () => {
    const item = ITEMS.find((i) => i.id === selectedItemId) || ITEMS[0];
    const qtyDelta = adjustType === "OUT" ? -Math.abs(adjustQty) : Math.abs(adjustQty);
    const newBalance = Math.max(0, item.stock + qtyDelta);

    const newMovement: StockMovement = {
      id: `MV-${Date.now()}`,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      type: adjustType,
      itemCode: item.code,
      itemName: item.name,
      godown: godown,
      quantity: qtyDelta,
      balanceAfter: newBalance,
      referenceDoc: refDoc,
      notes: notes,
    };

    setMovements([newMovement, ...movements]);
    STOCK_MOVEMENTS.unshift(newMovement);
    setItemStock(item.id, newBalance);

    toast.success(
      "Stock Adjustment Recorded",
      `Adjusted ${item.code} by ${qtyDelta > 0 ? "+" : ""}${qtyDelta}. New balance: ${newBalance}.`
    );
    setShowAdjustModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Movements & Ledger</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Complete immutable audit trail of every unit received, allocated, dispatched, or adjusted.
          </p>
        </div>

        <button
          onClick={() => setShowAdjustModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Record Adjustment
        </button>
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

        <div className="flex items-center gap-1.5 overflow-x-auto">
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
              <th className="p-3">Rack Location</th>
              <th className="p-3">Godown</th>
              <th className="p-3">Ref Document</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Balance After</th>
              <th className="p-3">Audit Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((mv) => {
              const stockItem = ITEMS.find((i) => i.code === mv.itemCode);
              const rackLoc = stockItem?.location || stockItem?.godownStock.find((g) => g.location)?.location || "A1";
              return (
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
                <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {rackLoc}
                    </span>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                  Record Stock Adjustment
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Log physical cycle count discrepancies, scrap, or warehouse transfers.
                </p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Select Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                >
                  {ITEMS.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.code}) — Current Stock: {it.stock} {it.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Movement Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                >
                  <option value="ADJUSTMENT">Adjustment (Audit Count)</option>
                  <option value="IN">Inward (Direct Entry)</option>
                  <option value="OUT">Outward (Damage / Scrap)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Godown</label>
                <select
                  value={godown}
                  onChange={(e) => setGodown(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                >
                  <option value="Main Warehouse">Main Warehouse (Bhiwandi)</option>
                  <option value="Secondary Store">Secondary Store (Rabale)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Quantity Delta</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Reference Document</label>
                <input
                  type="text"
                  value={refDoc}
                  onChange={(e) => setRefDoc(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Audit Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordAdjustment}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Commit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
