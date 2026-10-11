"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Plus, AlertCircle, MapPin, X, Check, Save } from "lucide-react";
import { ITEMS, Item } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";

interface StockAdjustment {
  id: string;
  adjNo: string;
  date: string;
  itemCode: string;
  itemName: string;
  godown: string;
  location?: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  reason: string;
  approvedBy: string;
}

const SAMPLE_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: "ADJ-01",
    adjNo: "ADJ-2026-014",
    date: "2026-09-27",
    itemCode: "MDS-BG-FC99",
    itemName: "MIDAS BONDING GUM - FAST CURE 99°C",
    godown: "Main Warehouse (Bhiwandi Logistics Hub)",
    location: "A3",
    systemQty: 162,
    physicalQty: 160,
    difference: -2,
    reason: "Damaged packaging in transit; written off during audit",
    approvedBy: "Amit Sharma",
  },
  {
    id: "ADJ-02",
    adjNo: "ADJ-2026-013",
    date: "2026-09-20",
    itemCode: "MDS-PTR-LUG11",
    itemName: "MIDAS PRE-CURED TREAD RUBBER (Lug Pattern)",
    godown: "Kalamboli Steel & Depot Yard",
    location: "B7",
    systemQty: 240,
    physicalQty: 245,
    difference: +5,
    reason: "Found uncounted rolls from previous supplier inward lot",
    approvedBy: "Amit Sharma",
  },
];

export default function StockAdjustmentsPage() {
  const toast = useToast();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(SAMPLE_ADJUSTMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedItemId, setSelectedItemId] = useState(ITEMS[0]?.id || "");
  const [selectedGodown, setSelectedGodown] = useState("Main Warehouse (Bhiwandi Logistics Hub)");
  const [physicalCount, setPhysicalCount] = useState<number>(100);
  const [reason, setReason] = useState("Physical cycle count audit");

  useEffect(() => {
    fetch("/api/inventory/adjustments")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.adjustments && data.adjustments.length > 0) {
          setAdjustments([...data.adjustments, ...SAMPLE_ADJUSTMENTS]);
        }
      })
      .catch((e) => console.warn("Failed to load adjustments:", e));
  }, []);

  const selectedItem = ITEMS.find((i) => i.id === selectedItemId || i.code === selectedItemId) || ITEMS[0];
  const systemQty = selectedItem?.stock || 0;
  const difference = physicalCount - systemQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Reason required", "Please provide a reason or justification for this adjustment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem.id,
          godown: selectedGodown,
          physicalCount: Number(physicalCount),
          reason,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error("Adjustment Failed", data.error || "Failed on server");
        setIsSubmitting(false);
        return;
      }

      const newAdj: StockAdjustment = {
        id: data.adjustment.id,
        adjNo: data.adjustment.adjNo,
        date: data.adjustment.date,
        itemCode: data.adjustment.itemCode,
        itemName: data.adjustment.itemName,
        godown: data.adjustment.godown,
        systemQty: data.adjustment.systemQty,
        physicalQty: data.adjustment.physicalQty,
        difference: data.adjustment.difference,
        reason: data.adjustment.reason,
        approvedBy: data.adjustment.approvedBy,
      };

      setAdjustments((prev) => [newAdj, ...prev]);
      toast.success(
        "Stock Adjustment Recorded",
        `Voucher ${newAdj.adjNo} processed. Inventory & stock ledger updated.`
      );
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Stock Adjustments & Physical Audits</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Physical stock discrepancy reconciliations, damage write-offs, and cycle count approvals.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Record Physical Audit
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Audit Voucher #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Item Description</th>
              <th className="p-3">Godown</th>
              <th className="p-3">Rack Location</th>
              <th className="p-3 text-center">System Qty</th>
              <th className="p-3 text-center">Physical Count</th>
              <th className="p-3 text-center">Variance</th>
              <th className="p-3">Reason / Justification</th>
              <th className="p-3">Approved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {adjustments.map((adj) => {
              const stockItem = ITEMS.find((i) => i.code === adj.itemCode);
              const rackLoc = adj.location || stockItem?.location || "A1";
              return (
                <tr key={adj.id} className="hover:bg-hover/50">
                  <td className="p-3 font-mono font-semibold text-brand-primary">{adj.adjNo}</td>
                  <td className="p-3 font-mono text-text-muted">{adj.date}</td>
                  <td className="p-3">
                    <div className="font-medium text-text-primary">{adj.itemName}</div>
                    <div className="font-mono text-[10px] text-text-muted">{adj.itemCode}</div>
                  </td>
                  <td className="p-3 text-text-secondary">{adj.godown}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {rackLoc}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono">{adj.systemQty}</td>
                  <td className="p-3 text-center font-mono font-bold">{adj.physicalQty}</td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span
                      className={
                        adj.difference > 0
                          ? "text-emerald-600"
                          : adj.difference < 0
                          ? "text-red-600"
                          : "text-text-muted"
                      }
                    >
                      {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{adj.reason}</td>
                  <td className="p-3 text-text-muted">{adj.approvedBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record Physical Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card w-full max-w-lg bg-white shadow-2xl rounded-xl border border-border overflow-hidden">
            <div className="bg-[#111111] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Physical Stock Audit</h3>
                <p className="text-[11px] text-white/70">Reconcile physical inventory and update stock ledger</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-text-muted font-medium mb-1">Select Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const it = ITEMS.find((i) => i.id === e.target.value);
                    if (it) setPhysicalCount(it.stock);
                  }}
                  className="w-full border border-border rounded p-2 bg-background font-medium"
                >
                  {ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} — {item.name} (Stock: {item.stock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Godown / Warehouse</label>
                <select
                  value={selectedGodown}
                  onChange={(e) => setSelectedGodown(e.target.value)}
                  className="w-full border border-border rounded p-2 bg-background"
                >
                  <option value="Main Warehouse (Bhiwandi Logistics Hub)">Main Warehouse (Bhiwandi Logistics Hub)</option>
                  <option value="Midas Central Depot (Kottayam)">Midas Central Depot (Kottayam)</option>
                  <option value="Kalamboli Steel & Depot Yard">Kalamboli Steel & Depot Yard</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-bg-canvas rounded border border-border">
                <div>
                  <span className="text-text-muted block text-[11px]">System Quantity:</span>
                  <span className="font-mono font-bold text-sm text-text-primary">{systemQty} {selectedItem?.unit}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Variance / Difference:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      difference > 0 ? "text-emerald-600" : difference < 0 ? "text-red-600" : "text-text-muted"
                    }`}
                  >
                    {difference > 0 ? `+${difference}` : difference} {selectedItem?.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Actual Physical Count</label>
                <input
                  type="number"
                  min="0"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(Number(e.target.value))}
                  className="input-field font-mono font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted font-medium mb-1">Reason / Justification</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Thread defect / Found uncounted carton / Damage"
                  className="input-field"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSubmitting ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
