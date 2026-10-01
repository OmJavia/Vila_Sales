"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  Warehouse,
  Bell,
  BellRing,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Info,
  Trash2,
  ShoppingCart,
  ZoomIn,
} from "lucide-react";
import { fetchItems, type Item } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useTradeFlowStore } from "@/lib/store";
import type { ShipmentReminder } from "@/lib/store";

const STOCK_FILTERS = ["ALL", "OK", "LOW", "CRITICAL", "OUT"];

// ─── Stock Lookup Panel ────────────────────────────────────────────────────────
function StockLookupPanel({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addShipmentReminder, removeShipmentReminder, isItemInShipment, shipmentReminders } = useTradeFlowStore();

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return items
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [query, items]);

  const handleSelect = (item: Item) => {
    setSelected(item);
    setQuery(item.name);
    setShowResults(false);
  };

  const handleAddReminder = (item: Item) => {
    const reminder: ShipmentReminder = {
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      currentStock: item.stock,
      minStock: item.minStock,
      suggestedOrderQty: Math.max(item.minStock * 2 - item.stock, item.minStock),
      unit: item.unit,
      supplier: item.suggestedSupplier || "Midas Treads (India) Pvt. Ltd.",
      addedAt: new Date().toISOString(),
      urgency: item.stockLevel === "OUT" ? "URGENT" : item.stockLevel === "CRITICAL" ? "HIGH" : "NORMAL",
    };
    addShipmentReminder(reminder);
  };

  const stockBarColor = (level: string) =>
    level === "OK" ? "bg-green-500" : level === "LOW" ? "bg-amber-500" : "bg-red-500";

  const stockBarWidth = (item: Item) => {
    if (item.stock === 0) return 0;
    return Math.min((item.stock / Math.max(item.minStock * 2, item.stock)) * 100, 100);
  };

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ZoomIn className="w-4 h-4 text-[#111111]" />
        <h2 className="text-sm font-bold text-[#111111]">Stock Lookup</h2>
        <span className="text-xs text-[#999999]">— search any item to check live stock</span>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
        <input
          ref={inputRef}
          id="stock-lookup-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search by item name, code, or category…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EAEAEA] rounded-lg outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSelected(null); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown results */}
        <AnimatePresence>
          {showResults && results.length > 0 && !selected && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EAEAEA] rounded-lg shadow-lg z-20 overflow-hidden"
            >
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#F7F7F7] text-left transition-colors border-b border-[#F3F3F3] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#111111] truncate">{item.name}</div>
                    <div className="text-[10px] text-[#999999] font-mono">{item.code} · {item.category}</div>
                  </div>
                  <StatusBadge status={item.stockLevel} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected item detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded-xl border p-4 space-y-3",
                selected.stockLevel === "OUT"
                  ? "border-red-200 bg-red-50"
                  : selected.stockLevel === "CRITICAL"
                  ? "border-red-100 bg-red-50/50"
                  : selected.stockLevel === "LOW"
                  ? "border-amber-100 bg-amber-50/50"
                  : "border-green-100 bg-green-50/30"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#111111] leading-snug">{selected.name}</p>
                  <p className="text-[10px] text-[#666666] mt-0.5 font-mono">{selected.code} · {selected.brand} · {selected.category}</p>
                </div>
                <StatusBadge status={selected.stockLevel} />
              </div>

              {/* Stock bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#666666]">Physical Stock</span>
                  <span className="font-bold text-[#111111] tabular-nums">{selected.stock} {selected.unit}</span>
                </div>
                <div className="h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", stockBarColor(selected.stockLevel))}
                    style={{ width: `${stockBarWidth(selected)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#999999] mt-0.5">
                  <span>Min: {selected.minStock} {selected.unit}</span>
                  <span>Reserved: {selected.reservedStock} · Allocated: {selected.allocatedStock}</span>
                </div>
              </div>

              {/* Godown breakdown */}
              <div className="grid grid-cols-2 gap-2">
                {selected.godownStock.map((g) => (
                  <div key={g.godown} className="bg-white/70 border border-white rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Warehouse className="w-3 h-3 text-[#666666]" />
                      <span className="text-[10px] font-semibold text-[#333333] truncate">{g.godown}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                      <div><div className="font-bold text-[#111111] tabular-nums">{g.physical}</div><div className="text-[#999999]">Physical</div></div>
                      <div><div className="font-bold text-amber-600 tabular-nums">{g.reserved}</div><div className="text-[#999999]">Reserved</div></div>
                      <div><div className="font-bold text-green-600 tabular-nums">{g.available}</div><div className="text-[#999999]">Available</div></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs if available */}
              {selected.specifications && (
                <div className="flex gap-1.5 bg-white/60 border border-white rounded-lg p-2">
                  <Info className="w-3 h-3 text-[#999999] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#666666] leading-relaxed">{selected.specifications}</p>
                </div>
              )}

              {/* Out-of-stock reminder CTA */}
              {(selected.stockLevel === "OUT" || selected.stockLevel === "CRITICAL" || selected.stockLevel === "LOW") && (
                <div className={cn(
                  "rounded-lg p-3 flex items-start gap-3",
                  selected.stockLevel === "OUT" ? "bg-red-100 border border-red-200" : "bg-amber-50 border border-amber-200"
                )}>
                  <AlertTriangle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", selected.stockLevel === "OUT" ? "text-red-600" : "text-amber-600")} />
                  <div className="flex-1">
                    <p className={cn("text-xs font-semibold", selected.stockLevel === "OUT" ? "text-red-700" : "text-amber-700")}>
                      {selected.stockLevel === "OUT"
                        ? "⚠️ Out of Stock — Order in next shipment!"
                        : selected.stockLevel === "CRITICAL"
                        ? "Stock critically low — Reorder soon"
                        : "Stock running low — Consider reordering"}
                    </p>
                    <p className="text-[10px] text-[#666666] mt-0.5">
                      Suggested order qty: <strong>{Math.max(selected.minStock * 2 - selected.stock, selected.minStock)} {selected.unit}</strong>
                      {selected.suggestedSupplier && ` · Supplier: ${selected.suggestedSupplier}`}
                    </p>
                  </div>
                  {isItemInShipment(selected.id) ? (
                    <button
                      onClick={() => removeShipmentReminder(selected.id)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-white border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddReminder(selected)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-white bg-[#111111] rounded px-2 py-1 hover:bg-[#333333] transition-colors flex-shrink-0"
                    >
                      <Bell className="w-3 h-3" />
                      Remind me
                    </button>
                  )}
                </div>
              )}

              {selected.stockLevel === "OK" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-700">Stock level is healthy — no action needed</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shipment Reminder Panel ───────────────────────────────────────────────────
function ShipmentReminderPanel() {
  const { shipmentReminders, removeShipmentReminder, clearShipmentReminders } = useTradeFlowStore();
  const reminders = Object.values(shipmentReminders);
  const [open, setOpen] = useState(false);

  if (reminders.length === 0) return null;

  return (
    <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50/50 transition-colors"
        id="shipment-reminders-toggle"
      >
        <div className="relative">
          <BellRing className="w-5 h-5 text-amber-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {reminders.length}
          </span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-[#111111]">Next Shipment — Order Reminders</p>
          <p className="text-xs text-[#666666]">
            {reminders.length} item{reminders.length > 1 ? "s" : ""} flagged for next purchase order
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); clearShipmentReminders(); }}
            className="text-[10px] text-red-500 hover:text-red-700 font-semibold px-2 py-0.5 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Clear all
          </button>
          {open ? <ChevronDown className="w-4 h-4 text-[#666666]" /> : <ChevronRight className="w-4 h-4 text-[#666666]" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-amber-100"
          >
            <div className="divide-y divide-[#F3F3F3]">
              {reminders.map((r) => (
                <div key={r.itemId} className="px-4 py-3 flex items-start gap-3 hover:bg-amber-50/30 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    r.urgency === "URGENT" ? "bg-red-100" : r.urgency === "HIGH" ? "bg-amber-100" : "bg-blue-50"
                  )}>
                    <ShoppingCart className={cn("w-4 h-4", r.urgency === "URGENT" ? "text-red-600" : r.urgency === "HIGH" ? "text-amber-600" : "text-blue-600")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#111111] truncate">{r.itemName}</p>
                    <p className="text-[10px] text-[#666666] font-mono">{r.itemCode}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        r.urgency === "URGENT" ? "bg-red-100 text-red-700" : r.urgency === "HIGH" ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {r.urgency === "URGENT" ? "🔴 OUT OF STOCK" : r.urgency === "HIGH" ? "🟠 CRITICAL" : "🟡 LOW"}
                      </span>
                      <span className="text-[10px] text-[#666666]">
                        Stock: <strong className={r.currentStock === 0 ? "text-red-600" : "text-[#111111]"}>{r.currentStock} {r.unit}</strong>
                      </span>
                      <span className="text-[10px] text-[#666666]">
                        Order: <strong className="text-[#111111]">{r.suggestedOrderQty} {r.unit}</strong>
                      </span>
                    </div>
                    <p className="text-[10px] text-[#999999] mt-0.5">Supplier: {r.supplier}</p>
                  </div>
                  <button
                    onClick={() => removeShipmentReminder(r.itemId)}
                    className="w-6 h-6 flex items-center justify-center text-[#999999] hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-[10px] text-amber-700 font-medium">
                💡 Go to <strong>Purchase → Requirements</strong> to generate a Purchase Order for all flagged items.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StockOverviewPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showLookup, setShowLookup] = useState(false);

  const { shipmentReminders, addShipmentReminder, removeShipmentReminder, isItemInShipment } = useTradeFlowStore();
  const reminderCount = Object.keys(shipmentReminders).length;

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const categories = useMemo(() => {
    if (!items) return [];
    return ["ALL", ...Array.from(new Set(items.map((i) => i.category))).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let list = [...items];
    if (levelFilter !== "ALL") list = list.filter((i) => i.stockLevel === levelFilter);
    if (categoryFilter !== "ALL") list = list.filter((i) => i.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, levelFilter, categoryFilter]);

  const stockSummary = useMemo(() => {
    if (!items) return null;
    return {
      total: items.length,
      ok: items.filter((i) => i.stockLevel === "OK").length,
      low: items.filter((i) => i.stockLevel === "LOW").length,
      critical: items.filter((i) => i.stockLevel === "CRITICAL").length,
      out: items.filter((i) => i.stockLevel === "OUT").length,
    };
  }, [items]);

  const handleQuickReminder = (item: Item) => {
    if (isItemInShipment(item.id)) {
      removeShipmentReminder(item.id);
    } else {
      addShipmentReminder({
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        category: item.category,
        currentStock: item.stock,
        minStock: item.minStock,
        suggestedOrderQty: Math.max(item.minStock * 2 - item.stock, item.minStock),
        unit: item.unit,
        supplier: item.suggestedSupplier || "Midas Treads (India) Pvt. Ltd.",
        addedAt: new Date().toISOString(),
        urgency: item.stockLevel === "OUT" ? "URGENT" : item.stockLevel === "CRITICAL" ? "HIGH" : "NORMAL",
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Stock Overview</h1>
          <p className="text-sm text-[#666666] mt-0.5">
            {isLoading ? "Loading…" : `${filtered.length} of ${items?.length ?? 0} items`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reminderCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
              <BellRing className="w-3.5 h-3.5" />
              {reminderCount} reminder{reminderCount > 1 ? "s" : ""}
            </span>
          )}
          <button
            id="stock-lookup-toggle"
            onClick={() => setShowLookup((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
              showLookup
                ? "bg-[#111111] text-white border-[#111111]"
                : "bg-white text-[#111111] border-[#EAEAEA] hover:border-[#111111]"
            )}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            Stock Lookup
          </button>
        </div>
      </div>

      {/* Shipment reminders panel */}
      <ShipmentReminderPanel />

      {/* Stock Lookup */}
      <AnimatePresence>
        {showLookup && items && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StockLookupPanel items={items} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      {!isLoading && stockSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Items", value: stockSummary.total, color: "text-[#111111]", bg: "bg-[#F7F7F7]", border: "border-[#EAEAEA]" },
            { label: "In Stock", value: stockSummary.ok, color: "text-[#16A34A]", bg: "bg-[#DCFCE7]", border: "border-green-200" },
            { label: "Low Stock", value: stockSummary.low, color: "text-[#D97706]", bg: "bg-[#FEF3C7]", border: "border-amber-200", icon: TrendingDown },
            { label: "Critical / Out", value: stockSummary.critical + stockSummary.out, color: "text-[#DC2626]", bg: "bg-[#FEE2E2]", border: "border-red-200", icon: AlertTriangle },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={cn("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</div>
                  <div className="text-xs font-medium text-[#666666] mt-0.5">{stat.label}</div>
                </div>
                {stat.icon && (
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", stat.bg, stat.border)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs p-3 space-y-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
            <input
              id="stock-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, brand, category…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#EAEAEA] rounded-lg outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all"
            />
          </div>

          {/* Stock level filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STOCK_FILTERS.map((f) => (
              <button
                key={f}
                id={`stock-filter-${f.toLowerCase()}`}
                onClick={() => setLevelFilter(f)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors",
                  levelFilter === f
                    ? "bg-[#111111] text-white"
                    : "bg-[#F7F7F7] text-[#666666] hover:bg-[#EAEAEA]"
                )}
              >
                {f === "ALL" ? "All Levels" : f === "OK" ? "✅ In Stock" : f === "LOW" ? "🟡 Low" : f === "CRITICAL" ? "🟠 Critical" : "🔴 Out"}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Layers className="w-3.5 h-3.5 text-[#999999] flex-shrink-0" />
            <div className="flex items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-colors border",
                    categoryFilter === cat
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-white text-[#666666] border-[#EAEAEA] hover:border-[#999999]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#EAEAEA] mx-auto mb-2" />
            <p className="text-sm text-[#999999]">No items match your filters</p>
          </div>
        ) : (
          filtered.map((item, index) => {
            const available = Math.max(item.stock - item.reservedStock, 0);
            const inShipment = isItemInShipment(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 6) * 0.03 }}
                className={cn(
                  "card p-3.5 border-l-4",
                  item.stockLevel === "OUT" ? "border-l-red-500" :
                  item.stockLevel === "CRITICAL" ? "border-l-orange-500" :
                  item.stockLevel === "LOW" ? "border-l-amber-400" :
                  "border-l-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111111] line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-[10px] font-mono text-[#999999] mt-0.5">{item.code}</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">{item.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={item.stockLevel} />
                    {(item.stockLevel === "OUT" || item.stockLevel === "CRITICAL" || item.stockLevel === "LOW") && (
                      <button
                        onClick={() => handleQuickReminder(item)}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                          inShipment
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#F7F7F7] text-[#999999] hover:bg-amber-50 hover:text-amber-600"
                        )}
                      >
                        {inShipment ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#F5F5F5] text-xs">
                  <div>
                    <span className="text-[#999999]">Physical </span>
                    <span className="font-semibold text-[#111111]">{item.stock} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-[#999999]">Avail. </span>
                    <span className={cn("font-semibold", available === 0 ? "text-red-600" : "text-[#111111]")}>{available}</span>
                  </div>
                  <div>
                    <span className="text-[#999999]">Min. </span>
                    <span className="font-semibold text-[#999999]">{item.minStock}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop Stock table */}
      <div className="hidden sm:block bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Code</th>
                <th>Category</th>
                <th className="text-right">Physical Stock</th>
                <th className="text-right">Reserved</th>
                <th className="text-right">Available</th>
                <th className="text-right">Min. Stock</th>
                <th>Level</th>
                <th>Godowns</th>
                <th>Remind</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={5} cols={10} />
            ) : (
              <tbody>
                {filtered.map((item, index) => {
                  const available = Math.max(item.stock - item.reservedStock, 0);
                  const stockPct = (item.stock / Math.max(item.minStock * 2, item.stock)) * 100;
                  const inShipment = isItemInShipment(item.id);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 6) * 0.03 }}
                      className={cn(
                        item.stockLevel === "OUT" && "bg-red-50/80",
                        item.stockLevel === "CRITICAL" && "bg-[#FEF5F5]",
                        item.stockLevel === "LOW" && "bg-[#FFFBF0]"
                      )}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {(item.stockLevel === "CRITICAL" || item.stockLevel === "OUT") && (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] flex-shrink-0" />
                          )}
                          {item.stockLevel === "LOW" && (
                            <TrendingDown className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                          )}
                          <div>
                            <span className="text-xs font-medium text-[#111111]">{item.name}</span>
                            {item.brand && (
                              <span className="block text-[10px] text-[#999999]">{item.brand}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs text-[#666666]">{item.code}</span></td>
                      <td className="text-xs text-[#666666]">{item.category}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                item.stockLevel === "OK" ? "bg-[#16A34A]" :
                                item.stockLevel === "LOW" ? "bg-[#D97706]" :
                                "bg-[#DC2626]"
                              )}
                              style={{ width: `${Math.min(stockPct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums font-semibold text-[#111111]">
                            {item.stock} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td className="text-right text-xs tabular-nums text-[#D97706]">{item.reservedStock}</td>
                      <td className="text-right">
                        <span className={cn("text-xs tabular-nums font-semibold", available === 0 ? "text-[#DC2626]" : "text-[#111111]")}>
                          {available}
                        </span>
                      </td>
                      <td className="text-right text-xs tabular-nums text-[#999999]">{item.minStock}</td>
                      <td><StatusBadge status={item.stockLevel} /></td>
                      <td>
                        <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                          {item.godownStock.slice(0, 2).map((g) => (
                            <div
                              key={g.godown}
                              className="flex items-center gap-1 px-1.5 py-0.5 bg-[#F7F7F7] rounded text-[9px] text-[#666666]"
                              title={`${g.godown}: ${g.physical} physical, ${g.available} available`}
                            >
                              <Warehouse className="w-2.5 h-2.5" />
                              {g.physical}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        {(item.stockLevel === "OUT" || item.stockLevel === "CRITICAL" || item.stockLevel === "LOW") && (
                          <button
                            id={`remind-${item.id}`}
                            onClick={() => handleQuickReminder(item)}
                            title={inShipment ? "Remove from next shipment reminders" : "Add to next shipment reminders"}
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                              inShipment
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "bg-[#F7F7F7] text-[#999999] hover:bg-amber-50 hover:text-amber-600"
                            )}
                          >
                            {inShipment ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-[#EAEAEA] mx-auto mb-2" />
            <p className="text-sm text-[#999999]">No items match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
