"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Building,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
  Send,
  DollarSign,
  Award,
} from "lucide-react";
import { SUPPLIERS, ITEMS } from "@/lib/data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface RFQBid {
  supplierId: string;
  supplierName: string;
  rating: number;
  quotedUnitPrice: number;
  deliveryDays: number;
  paymentTerms: string;
  notes?: string;
  isLowest?: boolean;
}

interface RFQItem {
  id: string;
  rfqNo: string;
  createdAt: string;
  dueDate: string;
  itemCode: string;
  itemName: string;
  category: string;
  requiredQty: number;
  unit: string;
  targetUnitPrice: number;
  status: "DRAFT" | "OPEN" | "EVALUATING" | "AWARDED" | "CLOSED";
  awardedSupplier?: string;
  awardedPoNo?: string;
  bids: RFQBid[];
}

const INITIAL_RFQS: RFQItem[] = [
  {
    id: "RFQ-001",
    rfqNo: "RFQ-2026-088",
    createdAt: "2026-09-28",
    dueDate: "2026-10-05",
    itemCode: "MIDAS-PCT-PRO",
    itemName: "MIDAS PRECURED TREAD - TRUCK RADIAL 240MM",
    category: "Precured Treads",
    requiredQty: 250,
    unit: "Kg",
    targetUnitPrice: 260,
    status: "EVALUATING",
    bids: [
      {
        supplierId: "SUP-001",
        supplierName: "Apex Forgings & Fasteners Ltd.",
        rating: 4.8,
        quotedUnitPrice: 255,
        deliveryDays: 5,
        paymentTerms: "30 Days",
        isLowest: true,
        notes: "Ex-factory Ludhiana, ISO certified batch inspection.",
      },
      {
        supplierId: "SUP-002",
        supplierName: "Tata Precision Metals",
        rating: 4.9,
        quotedUnitPrice: 268,
        deliveryDays: 3,
        paymentTerms: "45 Days",
        notes: "Ready stock at Bhiwandi depot.",
      },
      {
        supplierId: "SUP-003",
        supplierName: "Maxgrip Industrial Fasteners",
        rating: 4.7,
        quotedUnitPrice: 260,
        deliveryDays: 7,
        paymentTerms: "30 Days",
        notes: "Standard grade bulk dispatch.",
      },
    ],
  },
  {
    id: "RFQ-002",
    rfqNo: "RFQ-2026-087",
    createdAt: "2026-09-25",
    dueDate: "2026-10-02",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    category: "Anchor Bolts",
    requiredQty: 40,
    unit: "Box",
    targetUnitPrice: 900,
    status: "OPEN",
    bids: [
      {
        supplierId: "SUP-001",
        supplierName: "Apex Forgings & Fasteners Ltd.",
        rating: 4.8,
        quotedUnitPrice: 880,
        deliveryDays: 4,
        paymentTerms: "30 Days",
        isLowest: true,
        notes: "Special contract discount applied.",
      },
      {
        supplierId: "SUP-003",
        supplierName: "Maxgrip Industrial Fasteners",
        rating: 4.7,
        quotedUnitPrice: 920,
        deliveryDays: 6,
        paymentTerms: "15 Days",
        notes: "Subject to raw material price escalation.",
      },
    ],
  },
  {
    id: "RFQ-003",
    rfqNo: "RFQ-2026-086",
    createdAt: "2026-09-20",
    dueDate: "2026-09-26",
    itemCode: "MIDAS-VULC-FD",
    itemName: "FAST DRY VULCANIZING CEMENT 5L",
    category: "Vulcanizing Solution",
    requiredQty: 60,
    unit: "Tin",
    targetUnitPrice: 1450,
    status: "AWARDED",
    awardedSupplier: "Apex Forgings & Fasteners Ltd.",
    awardedPoNo: "PO-2026-082",
    bids: [
      {
        supplierId: "SUP-001",
        supplierName: "Apex Forgings & Fasteners Ltd.",
        rating: 4.8,
        quotedUnitPrice: 1410,
        deliveryDays: 2,
        paymentTerms: "45 Days",
        isLowest: true,
        notes: "Direct manufacturing dispatch.",
      },
      {
        supplierId: "SUP-002",
        supplierName: "Tata Precision Metals",
        rating: 4.9,
        quotedUnitPrice: 1490,
        deliveryDays: 4,
        paymentTerms: "30 Days",
        notes: "Imported grade solvent.",
      },
    ],
  },
];

export default function RFQPage() {
  const toast = useToast();
  const [rfqs, setRfqs] = useState<RFQItem[]>(INITIAL_RFQS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeCompareRfq, setActiveCompareRfq] = useState<RFQItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New RFQ form state
  const [selectedItemId, setSelectedItemId] = useState(ITEMS[0]?.id || "");
  const [requiredQty, setRequiredQty] = useState(100);
  const [targetUnitPrice, setTargetUnitPrice] = useState(500);
  const [dueDays, setDueDays] = useState(7);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([
    SUPPLIERS[0]?.id || "",
    SUPPLIERS[1]?.id || "",
  ]);

  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch =
      r.rfqNo.toLowerCase().includes(search.toLowerCase()) ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      r.bids.some((b) => b.supplierName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = rfqs.filter((r) => r.status === "OPEN" || r.status === "EVALUATING").length;
  const totalBids = rfqs.reduce((acc, r) => acc + r.bids.length, 0);
  const awardedCount = rfqs.filter((r) => r.status === "AWARDED").length;

  const handleAwardBid = (rfq: RFQItem, bid: RFQBid) => {
    const poNumber = `PO-2026-${String(Math.floor(Math.random() * 90) + 10).padStart(3, "0")}`;
    setRfqs((prev) =>
      prev.map((item) =>
        item.id === rfq.id
          ? {
              ...item,
              status: "AWARDED",
              awardedSupplier: bid.supplierName,
              awardedPoNo: poNumber,
            }
          : item
      )
    );

    setActiveCompareRfq(null);
    toast.success(
      "RFQ Awarded & PO Issued",
      `Awarded to ${bid.supplierName} @ ${formatCurrency(bid.quotedUnitPrice)}/${rfq.unit}. Generated PO ${poNumber}`
    );
  };

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    const item = ITEMS.find((i) => i.id === selectedItemId) || ITEMS[0];
    const today = new Date();
    const due = new Date();
    due.setDate(due.getDate() + Number(dueDays));

    const invitedBids: RFQBid[] = selectedSuppliers.map((sId) => {
      const sup = SUPPLIERS.find((s) => s.id === sId);
      // Realistic simulated variation (-6% to +8%)
      const variation = 1 + (Math.random() * 0.14 - 0.06);
      const bidPrice = Math.round(Number(targetUnitPrice) * variation);
      return {
        supplierId: sId,
        supplierName: sup ? sup.name : "Supplier",
        rating: sup ? sup.rating : 4.5,
        quotedUnitPrice: bidPrice,
        deliveryDays: Math.floor(Math.random() * 5) + 3,
        paymentTerms: `${sup?.paymentTerms || 30} Days`,
        notes: "Automated RFQ quotation response.",
      };
    });

    // Mark the lowest bid
    if (invitedBids.length > 0) {
      let lowest = invitedBids[0];
      invitedBids.forEach((b) => {
        if (b.quotedUnitPrice < lowest.quotedUnitPrice) lowest = b;
      });
      lowest.isLowest = true;
    }

    const newRFQ: RFQItem = {
      id: `RFQ-${String(rfqs.length + 1).padStart(3, "0")}`,
      rfqNo: `RFQ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      createdAt: today.toISOString().split("T")[0],
      dueDate: due.toISOString().split("T")[0],
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      requiredQty: Number(requiredQty),
      unit: item.unit,
      targetUnitPrice: Number(targetUnitPrice),
      status: "EVALUATING",
      bids: invitedBids,
    };

    setRfqs([newRFQ, ...rfqs]);
    setIsCreateModalOpen(false);
    toast.success(
      "RFQ Broadcasted Successfully",
      `${newRFQ.rfqNo} dispatched to ${selectedSuppliers.length} suppliers. Quotes received.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Request for Quotation (RFQ)</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Send competitive quotation inquiries to raw material mills and compare vendor bids before issuing Purchase Orders.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New RFQ
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-text-muted">Total RFQs</div>
            <div className="text-lg font-bold text-text-primary mt-0.5">{rfqs.length}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-text-muted">Active Inquiries</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">{activeCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-text-muted">Vendor Bids Inward</div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">{totalBids}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-text-muted">Awarded to PO</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">{awardedCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search RFQ #, item name, code or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {["ALL", "OPEN", "EVALUATING", "AWARDED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                statusFilter === st
                  ? "bg-brand-primary text-white"
                  : "bg-bg-canvas text-text-muted hover:text-text-primary"
              )}
            >
              {st === "ALL" ? "All RFQs" : st}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ List */}
      <div className="space-y-3">
        {filteredRfqs.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-xs">
            No RFQs match your filters.
          </div>
        ) : (
          filteredRfqs.map((rfq) => {
            const lowestBid = rfq.bids.reduce<RFQBid | null>((min, b) => {
              if (!min || b.quotedUnitPrice < min.quotedUnitPrice) return b;
              return min;
            }, null);

            const savingsPct =
              lowestBid && rfq.targetUnitPrice > 0
                ? Math.round(((rfq.targetUnitPrice - lowestBid.quotedUnitPrice) / rfq.targetUnitPrice) * 100)
                : 0;

            return (
              <div
                key={rfq.id}
                className="card p-4 hover:border-text-secondary/40 transition-all space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-brand-primary">{rfq.rfqNo}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold",
                          rfq.status === "OPEN" && "bg-blue-50 text-blue-700 border border-blue-200",
                          rfq.status === "EVALUATING" && "bg-amber-50 text-amber-700 border border-amber-200",
                          rfq.status === "AWARDED" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                          rfq.status === "CLOSED" && "bg-gray-100 text-gray-700 border border-gray-200"
                        )}
                      >
                        {rfq.status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-text-primary mt-1">
                      {rfq.itemName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5 font-mono">
                      <span>Code: {rfq.itemCode}</span>
                      <span>•</span>
                      <span>Req: {rfq.requiredQty} {rfq.unit}</span>
                      <span>•</span>
                      <span>Target Budget: {formatCurrency(rfq.targetUnitPrice)}/{rfq.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCompareRfq(rfq)}
                      className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Compare Bids ({rfq.bids.length})
                    </button>
                    {rfq.status !== "AWARDED" && lowestBid && (
                      <button
                        onClick={() => handleAwardBid(rfq, lowestBid)}
                        className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Award Best Quote
                      </button>
                    )}
                  </div>
                </div>

                {/* Bids Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-border">
                  {rfq.bids.map((bid) => {
                    const isLowest = bid.quotedUnitPrice === lowestBid?.quotedUnitPrice;
                    return (
                      <div
                        key={bid.supplierId}
                        className={cn(
                          "p-2.5 rounded border text-xs transition-colors",
                          isLowest
                            ? "bg-emerald-50/50 border-emerald-300"
                            : "bg-bg-canvas/50 border-border"
                        )}
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="truncate pr-1 text-text-primary">{bid.supplierName}</span>
                          {isLowest && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded flex-shrink-0">
                              LOWEST
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="font-mono font-bold text-text-primary">
                            {formatCurrency(bid.quotedUnitPrice)}
                            <span className="text-[10px] font-normal text-text-muted">/{rfq.unit}</span>
                          </span>
                          <span className="text-[11px] text-text-muted">
                            Lead: <strong>{bid.deliveryDays}d</strong>
                          </span>
                        </div>
                        <div className="text-[10px] text-text-muted mt-1 truncate">
                          Terms: {bid.paymentTerms}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Details */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-text-muted pt-1">
                  <div className="flex items-center gap-3">
                    <span>Issued: {formatDate(rfq.createdAt)}</span>
                    <span>Due: {formatDate(rfq.dueDate)}</span>
                  </div>
                  {rfq.status === "AWARDED" ? (
                    <div className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Awarded to <strong>{rfq.awardedSupplier}</strong> ({rfq.awardedPoNo})
                    </div>
                  ) : savingsPct > 0 ? (
                    <div className="text-emerald-600 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Best quote is {savingsPct}% below target budget
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Compare Quotes Modal */}
      <AnimatePresence>
        {activeCompareRfq && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card bg-background max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-primary">{activeCompareRfq.rfqNo}</span>
                    <span className="text-xs bg-bg-canvas px-2 py-0.5 rounded text-text-muted">
                      {activeCompareRfq.bids.length} Vendors Quoted
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-text-primary mt-1">
                    {activeCompareRfq.itemName}
                  </h2>
                  <div className="text-xs text-text-muted mt-0.5">
                    Target: {activeCompareRfq.requiredQty} {activeCompareRfq.unit} @ {formatCurrency(activeCompareRfq.targetUnitPrice)} budget
                  </div>
                </div>
                <button
                  onClick={() => setActiveCompareRfq(null)}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCompareRfq.bids.map((bid) => {
                  const totalCost = bid.quotedUnitPrice * activeCompareRfq.requiredQty;
                  const isLowest = activeCompareRfq.bids.every(
                    (b) => bid.quotedUnitPrice <= b.quotedUnitPrice
                  );

                  return (
                    <div
                      key={bid.supplierId}
                      className={cn(
                        "card p-4 flex flex-col justify-between space-y-4",
                        isLowest ? "border-emerald-500 bg-emerald-50/20" : ""
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-primary">{bid.supplierName}</span>
                          {isLowest && (
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                              BEST
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Supplier Rating: ⭐ {bid.rating}
                        </div>

                        <div className="mt-4 space-y-2">
                          <div>
                            <span className="text-[11px] text-text-muted block">Quoted Unit Price</span>
                            <span className="text-base font-mono font-bold text-text-primary">
                              {formatCurrency(bid.quotedUnitPrice)}
                            </span>
                            <span className="text-[11px] text-text-muted">/{activeCompareRfq.unit}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-text-muted block">Total Order Value</span>
                            <span className="text-xs font-mono font-semibold text-text-primary">
                              {formatCurrency(totalCost)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                            <div>
                              <span className="text-[10px] text-text-muted block">Lead Time</span>
                              <span className="font-semibold">{bid.deliveryDays} Days</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-text-muted block">Payment</span>
                              <span className="font-semibold">{bid.paymentTerms}</span>
                            </div>
                          </div>

                          {bid.notes && (
                            <div className="text-[11px] text-text-muted bg-bg-canvas p-2 rounded mt-2">
                              {bid.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAwardBid(activeCompareRfq, bid)}
                        className={cn(
                          "w-full py-2 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5",
                          isLowest
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-text-primary hover:bg-text-secondary text-white"
                        )}
                      >
                        <Award className="w-3.5 h-3.5" />
                        Award This Bid
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create RFQ Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card bg-background max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Initiate Request for Quotation (RFQ)
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-md text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRFQ} className="space-y-4 text-xs">
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Select Item / Material</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      const itm = ITEMS.find((i) => i.id === e.target.value);
                      if (itm) setTargetUnitPrice(Math.round(itm.price * 0.85));
                    }}
                    className="w-full p-2 border border-border rounded bg-background"
                  >
                    {ITEMS.map((itm) => (
                      <option key={itm.id} value={itm.id}>
                        {itm.name} ({itm.code}) - {itm.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted block mb-1 font-medium">Required Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={requiredQty}
                      onChange={(e) => setRequiredQty(Number(e.target.value))}
                      className="w-full p-2 border border-border rounded bg-background font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-text-muted block mb-1 font-medium">Target Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={targetUnitPrice}
                      onChange={(e) => setTargetUnitPrice(Number(e.target.value))}
                      className="w-full p-2 border border-border rounded bg-background font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-text-muted block mb-1 font-medium">Quotation Deadline (Days)</label>
                  <select
                    value={dueDays}
                    onChange={(e) => setDueDays(Number(e.target.value))}
                    className="w-full p-2 border border-border rounded bg-background"
                  >
                    <option value="3">3 Days (Urgent)</option>
                    <option value="5">5 Days (Standard)</option>
                    <option value="7">7 Days (Comprehensive)</option>
                    <option value="14">14 Days (Large Volume)</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-muted block mb-1.5 font-medium">
                    Invite Suppliers / Mills ({selectedSuppliers.length} selected)
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-bg-canvas rounded border border-border">
                    {SUPPLIERS.map((s) => {
                      const isChecked = selectedSuppliers.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 p-1.5 hover:bg-hover rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSuppliers([...selectedSuppliers, s.id]);
                              } else {
                                setSelectedSuppliers(selectedSuppliers.filter((id) => id !== s.id));
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="font-medium text-text-primary">{s.name}</span>
                          <span className="text-[10px] text-text-muted ml-auto">{s.city}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedSuppliers.length === 0}
                    className="btn-primary flex items-center gap-1.5 px-4 py-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch RFQ to Vendors
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
