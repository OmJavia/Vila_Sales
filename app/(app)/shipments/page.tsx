"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Search,
  Plus,
  Filter,
  ChevronRight,
  Package,
  Calendar,
  Check,
  Clock,
  AlertTriangle,
  Truck,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  fetchShipments,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatDate, cn } from "@/lib/utils";

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  PLANNED: { label: "Planned", color: "text-[#666666]", bg: "bg-[#F0F0F0]", icon: Clock },
  ORDERED: { label: "Ordered", color: "text-blue-600", bg: "bg-blue-50", icon: Package },
  IN_TRANSIT: { label: "In Transit", color: "text-indigo-600", bg: "bg-indigo-50", icon: Truck },
  ARRIVING_TODAY: { label: "Arriving Today", color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle2 },
  RECEIVED: { label: "Received", color: "text-emerald-700", bg: "bg-emerald-100", icon: Check },
  DELAYED: { label: "Delayed", color: "text-amber-700", bg: "bg-amber-50", icon: AlertTriangle },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: X },
};

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Arriving Today", value: "ARRIVING_TODAY" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Ordered", value: "ORDERED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Delayed", value: "DELAYED" },
];

// ─── Shipment Status Badge ─────────────────────────────────────────────────────
function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold", cfg.bg, cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Shipment Card ─────────────────────────────────────────────────────────────
function ShipmentCard({ shipment, index }: { shipment: Shipment; index: number }) {
  const router = useRouter();
  const toast = useToast();
  const [markingReceived, setMarkingReceived] = useState(false);

  const handleMarkReceived = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkingReceived(true);
    await new Promise(r => setTimeout(r, 800));
    setMarkingReceived(false);
    toast.success("Shipment marked as received", `${shipment.shipmentNo} has been received and stock updated.`);
  };

  const canMarkReceived = shipment.status === "IN_TRANSIT" || shipment.status === "ARRIVING_TODAY";
  const isArrivingToday = shipment.status === "ARRIVING_TODAY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => router.push(`/shipments/${shipment.id}`)}
      className={cn(
        "bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 group",
        isArrivingToday ? "border-emerald-300 ring-1 ring-emerald-200" : "border-[#EAEAEA]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#111111] font-mono">{shipment.shipmentNo}</span>
            {isArrivingToday && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500 text-white rounded-full animate-pulse">
                TODAY
              </span>
            )}
          </div>
          <div className="text-xs text-[#666666] mt-0.5">{shipment.supplierName}</div>
        </div>
        <ShipmentBadge status={shipment.status} />
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {shipment.items.map((item) => (
          <div key={item.itemCode} className="flex items-center justify-between text-xs">
            <span className="text-[#555555] truncate flex-1 mr-2">{item.itemName}</span>
            <span className="text-[#888888] whitespace-nowrap">{item.qtyOrdered} {item.unit}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F0]">
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#888888]">
            <span className="text-[#111111] font-semibold">
              ₹{shipment.totalValue.toLocaleString("en-IN")}
            </span>
            <span className="mx-1">·</span>
            <span>{shipment.warehouse.split(" ")[0]} {shipment.warehouse.split(" ")[1]}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-[#888888] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            ETA {formatDate(shipment.expectedDate)}
          </div>
          {canMarkReceived && (
            <button
              onClick={handleMarkReceived}
              disabled={markingReceived}
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors disabled:opacity-50"
            >
              {markingReceived ? (
                <div className="w-3 h-3 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Receive
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-[#DDDDDD] group-hover:text-[#888888] transition-colors" />
        </div>
      </div>

      {/* Timeline preview */}
      {shipment.status !== "RECEIVED" && (
        <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-1">
            {shipment.timeline.map((step, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  step.done ? "bg-emerald-500" : "bg-[#E0E0E0]"
                )} />
                {i < shipment.timeline.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1",
                    step.done && shipment.timeline[i + 1]?.done ? "bg-emerald-500" : "bg-[#E0E0E0]"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[#999]">Ordered</span>
            <span className="text-[10px] text-[#999]">Received</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Shipments Page ────────────────────────────────────────────────────────────
export default function ShipmentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: shipments, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: fetchShipments,
  });

  const filtered = useMemo(() => {
    if (!shipments) return [];
    let list = [...shipments];

    if (statusFilter !== "ALL") {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.shipmentNo.toLowerCase().includes(q) ||
          s.supplierName.toLowerCase().includes(q) ||
          s.items.some((i) => i.itemName.toLowerCase().includes(q)) ||
          s.trackingRef?.toLowerCase().includes(q)
      );
    }

    // Sort: arriving today first, then by expected date
    list.sort((a, b) => {
      const priority = (s: Shipment) =>
        s.status === "ARRIVING_TODAY" ? 0 :
        s.status === "IN_TRANSIT" ? 1 :
        s.status === "ORDERED" ? 2 :
        s.status === "DELAYED" ? 3 :
        s.status === "RECEIVED" ? 4 : 5;
      return priority(a) - priority(b);
    });

    return list;
  }, [shipments, statusFilter, search]);

  const arriving = shipments?.filter(s => s.status === "ARRIVING_TODAY").length ?? 0;
  const inTransit = shipments?.filter(s => s.status === "IN_TRANSIT").length ?? 0;
  const ordered = shipments?.filter(s => s.status === "ORDERED").length ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Shipments
          </h1>
          <p className="text-sm text-[#888888] mt-0.5">
            Track incoming stock from suppliers
          </p>
        </div>
        <button
          onClick={() => toast.info("Add Shipment", "Shipment creation form coming soon.")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Shipment
        </button>
      </div>

      {/* Summary Stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Arriving Today", value: arriving, color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
            { label: "In Transit", value: inTransit, color: "text-indigo-700 bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" },
            { label: "Ordered", value: ordered, color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-xl border px-4 py-3", stat.color)}>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", stat.dot)} />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipments, suppliers, products..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#EAEAEA] rounded-lg bg-white outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-100 whitespace-nowrap",
              statusFilter === tab.value
                ? "bg-[#111111] text-white"
                : "bg-white border border-[#EAEAEA] text-[#666666] hover:border-[#CCC]"
            )}
          >
            {tab.label}
            {tab.value !== "ALL" && shipments && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {shipments.filter(s => s.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Ship className="w-10 h-10 text-[#CCCCCC] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#333333]">
            {search || statusFilter !== "ALL" ? "No shipments match your filters" : "No shipments yet"}
          </h3>
          <p className="text-xs text-[#888888] mt-1">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter"
              : "Your supply pipeline is clear. Add a new shipment to get started."}
          </p>
          {!search && statusFilter === "ALL" && (
            <button
              onClick={() => toast.info("Plan Shipment", "Shipment creation coming soon.")}
              className="mt-4 px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              Plan Shipment
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((shipment, i) => (
            <ShipmentCard key={shipment.id} shipment={shipment} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
