"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Search,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  ChevronRight,
  Package,
  CheckCircle2,
  User,
} from "lucide-react";
import { fetchDeliveries, type Delivery, type DeliveryStatus } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { formatDate, cn } from "@/lib/utils";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; border: string }> = {
  SCHEDULED: { label: "Scheduled", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  PREPARING: { label: "Preparing", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  DELIVERED: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  DELAYED: { label: "Delayed", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  FAILED: { label: "Failed", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

const FILTER_TABS = [
  { label: "All", value: "ALL" },
  { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Delayed", value: "DELAYED" },
];

function DeliveryCard({ delivery, index }: { delivery: Delivery; index: number }) {
  const toast = useToast();
  const [marking, setMarking] = useState(false);
  const [localStatus, setLocalStatus] = useState<DeliveryStatus>(delivery.status);

  const cfg = STATUS_CONFIG[localStatus];
  const isActive = localStatus === "OUT_FOR_DELIVERY" || localStatus === "PREPARING";
  const isScheduled = localStatus === "SCHEDULED";

  const handleMarkDelivered = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarking(true);
    await new Promise(r => setTimeout(r, 800));
    setMarking(false);
    setLocalStatus("DELIVERED");
    toast.success("Delivery completed", `${delivery.orderNo} marked as delivered successfully.`);
  };

  const today = new Date().toISOString().split("T")[0];
  const isToday = delivery.scheduledDate === today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "bg-white border rounded-xl p-4 transition-all duration-200 group",
        isActive ? "border-indigo-300 ring-1 ring-indigo-100" : "border-[#EAEAEA]",
        localStatus === "DELIVERED" ? "opacity-70" : ""
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#111111] font-mono">{delivery.orderNo}</span>
            {isToday && localStatus !== "DELIVERED" && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500 text-white rounded-full">
                TODAY
              </span>
            )}
            {delivery.isPartial && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">
                Partial
              </span>
            )}
          </div>
          <div className="text-xs text-[#666666] mt-0.5">{delivery.customerName}</div>
          <div className="flex items-center gap-1 text-xs text-[#888888] mt-0.5">
            <MapPin className="w-3 h-3" />
            {delivery.customerCity}
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border", cfg.bg, cfg.color, cfg.border)}>
          {cfg.label}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {delivery.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-[#555555] truncate flex-1 mr-2">{item.itemName}</span>
            <span className="text-[#888888] whitespace-nowrap">{item.qty} {item.unit}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#666666]">
          <Calendar className="w-3 h-3" />
          {formatDate(delivery.scheduledDate)}
        </div>
        <div className="flex items-center gap-1.5 text-[#666666]">
          <Clock className="w-3 h-3" />
          {delivery.scheduledTimeWindow}
        </div>
        {delivery.assignedTo && (
          <div className="flex items-center gap-1.5 text-[#666666]">
            <User className="w-3 h-3" />
            {delivery.assignedTo}
          </div>
        )}
        {delivery.vehicleNo && (
          <div className="flex items-center gap-1.5 text-[#666666]">
            <Truck className="w-3 h-3" />
            {delivery.vehicleNo}
          </div>
        )}
      </div>

      {delivery.notes && (
        <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-100 mb-3">
          ⚠ {delivery.notes}
        </div>
      )}

      {/* Actions */}
      {(isActive || isScheduled) && (
        <button
          onClick={handleMarkDelivered}
          disabled={marking}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {marking ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Mark as Delivered
        </button>
      )}
    </motion.div>
  );
}

export default function DeliveriesPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: fetchDeliveries,
  });

  const filtered = useMemo(() => {
    if (!deliveries) return [];
    let list = [...deliveries];

    if (statusFilter !== "ALL") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.orderNo.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.deliveryNo.toLowerCase().includes(q) ||
          d.items.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }

    // Sort: out for delivery first, then scheduled, then delivered
    list.sort((a, b) => {
      const p = (d: Delivery) =>
        d.status === "OUT_FOR_DELIVERY" ? 0 :
        d.status === "PREPARING" ? 1 :
        d.status === "SCHEDULED" ? 2 :
        d.status === "DELAYED" ? 3 :
        d.status === "DELIVERED" ? 4 : 5;
      return p(a) - p(b);
    });

    return list;
  }, [deliveries, statusFilter, search]);

  const active = deliveries?.filter(d => d.status === "OUT_FOR_DELIVERY" || d.status === "PREPARING").length ?? 0;
  const scheduled = deliveries?.filter(d => d.status === "SCHEDULED").length ?? 0;
  const delivered = deliveries?.filter(d => d.status === "DELIVERED").length ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Deliveries
          </h1>
          <p className="text-sm text-[#888888] mt-0.5">
            Track and manage customer deliveries
          </p>
        </div>
        <button
          onClick={() => toast.info("Schedule Delivery", "Delivery scheduling form coming soon.")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Delivery
        </button>
      </div>

      {/* Summary Stats */}
      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Out for Delivery", value: active, color: "text-indigo-700 bg-indigo-50 border-indigo-200", dot: "bg-indigo-500" },
            { label: "Scheduled", value: scheduled, color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
            { label: "Delivered Today", value: delivered, color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
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

      {/* Search + Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deliveries, customers, orders..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#EAEAEA] rounded-lg bg-white outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
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
            {tab.value !== "ALL" && deliveries && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {deliveries.filter(d => d.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Truck className="w-10 h-10 text-[#CCCCCC] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#333333]">
            {search || statusFilter !== "ALL" ? "No deliveries match your filters" : "No pending deliveries"}
          </h3>
          <p className="text-xs text-[#888888] mt-1">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search or filter"
              : "Nothing needs to be delivered today."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((delivery, i) => (
            <DeliveryCard key={delivery.id} delivery={delivery} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
