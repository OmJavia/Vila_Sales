"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Ship,
  Package,
  Check,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Hash,
  Building2,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { fetchShipment, type ShipmentStatus } from "@/lib/data";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, cn } from "@/lib/utils";

interface ShipmentDetailProps {
  params: { id: string };
}

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; bg: string }> = {
  PLANNED: { label: "Planned", color: "text-[#666666]", bg: "bg-[#F0F0F0]" },
  ORDERED: { label: "Ordered", color: "text-blue-600", bg: "bg-blue-50" },
  IN_TRANSIT: { label: "In Transit", color: "text-indigo-600", bg: "bg-indigo-50" },
  ARRIVING_TODAY: { label: "Arriving Today", color: "text-emerald-700", bg: "bg-emerald-50" },
  RECEIVED: { label: "Received", color: "text-emerald-700", bg: "bg-emerald-100" },
  DELAYED: { label: "Delayed", color: "text-amber-700", bg: "bg-amber-50" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50" },
};

export default function ShipmentDetailPage({ params }: ShipmentDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [receiving, setReceiving] = useState(false);
  const [received, setReceived] = useState(false);

  const { data: shipment, isLoading } = useQuery({
    queryKey: ["shipment", params.id],
    queryFn: () => fetchShipment(params.id),
  });

  const handleMarkReceived = async () => {
    setReceiving(true);
    await new Promise(r => setTimeout(r, 1000));
    setReceiving(false);
    setReceived(true);
    toast.success("Shipment received", `${shipment?.shipmentNo} marked as received. Stock has been updated.`);
  };

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-40" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="max-w-[900px] mx-auto py-20 text-center">
        <Ship className="w-10 h-10 text-[#CCCCCC] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-[#111111]">Shipment not found</h2>
        <button onClick={() => router.push("/shipments")} className="mt-4 text-sm text-[#666666] underline">
          Back to shipments
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[received ? "RECEIVED" : shipment.status];
  const canMarkReceived = !received && (shipment.status === "IN_TRANSIT" || shipment.status === "ARRIVING_TODAY" || shipment.status === "ORDERED");

  return (
    <div className="max-w-[900px] mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-[#EAEAEA]">
          <button
            onClick={() => router.push("/shipments")}
            className="p-1.5 rounded hover:bg-[#F7F7F7] transition-colors text-[#666666]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#111111] font-mono">Shipment {shipment.shipmentNo}</h1>
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.bg, cfg.color)}>
              {cfg.label}
            </span>
          </div>
          {canMarkReceived && (
            <button
              onClick={handleMarkReceived}
              disabled={receiving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {receiving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark as Received
            </button>
          )}
          {received && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Received
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#EAEAEA] border-b border-[#EAEAEA]">
          {[
            { label: "Supplier", value: shipment.supplierName, icon: Building2 },
            { label: "Expected Date", value: formatDate(shipment.expectedDate), icon: Calendar },
            { label: "Warehouse", value: shipment.warehouse.split("(")[0].trim(), icon: MapPin },
            { label: "Tracking Ref", value: shipment.trackingRef ?? "—", icon: Hash },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-label text-[#999999] mb-1">
                  <Icon className="w-3 h-3" />
                  {item.label}
                </div>
                <div className="text-sm font-semibold text-[#111111] truncate">{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs p-5">
        <h2 className="text-sm font-semibold text-[#111111] mb-5">Shipment Timeline</h2>
        <div className="space-y-0">
          {(received ? [
            ...shipment.timeline.slice(0, -1),
            { ...shipment.timeline[shipment.timeline.length - 1], done: true, date: new Date().toISOString().split("T")[0] }
          ] : shipment.timeline).map((step, i) => {
            const isLast = i === shipment.timeline.length - 1;
            const isCurrent = step.done && (!shipment.timeline[i + 1]?.done);
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10",
                      step.done
                        ? "bg-emerald-500 border-emerald-500"
                        : isCurrent
                        ? "bg-white border-indigo-500"
                        : "bg-white border-[#E0E0E0]"
                    )}
                  >
                    {step.done ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Clock className="w-3 h-3 text-[#CCC]" />
                    )}
                  </motion.div>
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 flex-1 min-h-[32px] my-1",
                      step.done ? "bg-emerald-400" : "bg-[#E8E8E8]"
                    )} />
                  )}
                </div>
                <div className={cn("pb-6", isLast && "pb-0")}>
                  <div className={cn(
                    "text-sm font-semibold leading-none mt-1",
                    step.done ? "text-[#111111]" : "text-[#AAAAAA]"
                  )}>
                    {step.event}
                  </div>
                  {step.date && (
                    <div className="text-xs text-[#888888] mt-1">{formatDate(step.date)}</div>
                  )}
                  {!step.date && !step.done && (
                    <div className="text-xs text-[#AAAAAA] mt-1">Pending</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#EAEAEA]">
          <h2 className="text-sm font-semibold text-[#111111]">Items in Shipment</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Code</th>
              <th className="text-right">Qty Ordered</th>
              <th className="text-right">Qty Received</th>
              <th className="text-right">Unit Cost</th>
              <th className="text-right">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {shipment.items.map((item) => (
              <tr key={item.itemCode}>
                <td>
                  <div className="text-sm font-medium text-[#111111]">{item.itemName}</div>
                </td>
                <td>
                  <span className="font-mono text-xs text-[#666666]">{item.itemCode}</span>
                </td>
                <td className="text-right tabular-nums text-sm">{item.qtyOrdered} {item.unit}</td>
                <td className="text-right tabular-nums text-sm">
                  <span className={item.qtyReceived === item.qtyOrdered ? "text-emerald-600" : "text-[#888]"}>
                    {received ? item.qtyOrdered : item.qtyReceived} {item.unit}
                  </span>
                </td>
                <td className="text-right tabular-nums text-sm text-[#666666]">
                  ₹{item.unitCost.toLocaleString("en-IN")}
                </td>
                <td className="text-right tabular-nums text-sm font-semibold text-[#111111]">
                  ₹{(item.qtyOrdered * item.unitCost).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="px-3 py-3 text-right text-sm font-semibold text-[#111111]">Total</td>
              <td className="px-3 py-3 text-right text-base font-bold text-[#111111] tabular-nums">
                ₹{shipment.totalValue.toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {shipment.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-label text-amber-700 mb-1">Notes</div>
          <div className="text-sm text-[#555555]">{shipment.notes}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toast.info("ETA Update", "ETA update form coming soon.")}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EAEAEA] text-[#333333] text-xs font-semibold rounded-lg hover:bg-[#F7F7F7] hover:border-[#CCC] transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          Update ETA
        </button>
        <button
          onClick={() => toast.info("Team Notified", "Team has been notified about this shipment.")}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EAEAEA] text-[#333333] text-xs font-semibold rounded-lg hover:bg-[#F7F7F7] hover:border-[#CCC] transition-colors"
        >
          <Ship className="w-3.5 h-3.5" />
          Notify Team
        </button>
      </div>
    </div>
  );
}
