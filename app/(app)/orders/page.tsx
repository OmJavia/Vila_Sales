"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { fetchOrders, type Order, type OrderStatus } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const ALL_STATUSES: OrderStatus[] = [
  "DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED",
  "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED",
  "INVOICED", "PAYMENT_DONE", "CLOSED", "CANCELLED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  STOCK_CHECK: "Stock Check",
  PURCHASE_REQUIRED: "Purchase Req.",
  ALLOCATED: "Allocated",
  VERIFIED: "Verified",
  CHALLAN_READY: "Challan Ready",
  DISPATCHED: "Dispatched",
  INVOICED: "Invoiced",
  PAYMENT_DONE: "Payment Done",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

type SortField = "orderNo" | "customerName" | "orderDate" | "deliveryDate" | "totalAmount" | "status";

export default function OrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("orderNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    if (!orders) return [];
    let list = [...orders];

    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "orderNo": aVal = a.orderNo; bVal = b.orderNo; break;
        case "customerName": aVal = a.customerName; bVal = b.customerName; break;
        case "orderDate": aVal = a.orderDate; bVal = b.orderDate; break;
        case "deliveryDate": aVal = a.deliveryDate; bVal = b.deliveryDate; break;
        case "totalAmount": aVal = a.totalAmount; bVal = b.totalAmount; break;
        case "status": aVal = a.status; bVal = b.status; break;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [orders, search, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={cn(
        "w-3 h-3 ml-1 inline",
        sortField === field ? "text-[#111111]" : "text-[#CCCCCC]"
      )}
    />
  );

  const priorityColors: Record<string, string> = {
    URGENT: "bg-[#FEE2E2]",
    HIGH: "bg-[#FEF3C7]",
    NORMAL: "bg-transparent",
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Orders</h1>
          <p className="text-sm text-[#666666] mt-0.5">
            {isLoading ? "Loading..." : `${filtered.length} orders`}
          </p>
        </div>
        <motion.button
          onClick={() => router.push("/orders/new")}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#111111] text-white text-sm font-semibold rounded-md hover:bg-[#333333] transition-colors duration-100"
          whileHover={{ scale: 0.985 }}
          whileTap={{ scale: 0.972 }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Order</span>
          <span className="sm:hidden">New</span>
        </motion.button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-3 flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, item..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#EAEAEA] rounded-md outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all duration-150"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-3 px-3">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#666666] flex-shrink-0">Status:</span>
          <div className="flex items-center gap-1 flex-nowrap">
            {["ALL", "DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "DISPATCHED", "INVOICED", "CLOSED"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded transition-colors duration-100 flex-shrink-0 whitespace-nowrap",
                    statusFilter === s
                      ? "bg-[#111111] text-white"
                      : "bg-[#F7F7F7] text-[#666666] hover:bg-[#EAEAEA]"
                  )}
                >
                  {s === "ALL" ? "All" : STATUS_LABELS[s as OrderStatus] ?? s}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#999999] text-sm">No orders match your filters</div>
        ) : (
          filtered.map((order, index) => {
            const isOverdue =
              new Date(order.deliveryDate) < new Date() &&
              order.status !== "CLOSED" &&
              order.status !== "CANCELLED";
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 7) * 0.03 }}
                onClick={() => router.push(`/orders/${order.id}`)}
                className={cn(
                  "card p-3.5 cursor-pointer active:scale-[0.99] transition-all duration-100 border-l-4",
                  order.priority === "URGENT" ? "border-l-red-500" :
                  order.priority === "HIGH" ? "border-l-amber-500" :
                  "border-l-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#111111]">{order.orderNo}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm font-medium text-[#111111] truncate">{order.customerName}</p>
                    <p className="text-xs text-[#999999] mt-0.5 line-clamp-1">
                      {order.items.map((i) => `${i.qtyOrdered}× ${i.itemCode}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-[#111111] tabular-nums">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </div>
                    <div className={cn("text-xs mt-0.5", isOverdue ? "text-red-600 font-semibold" : "text-[#999999]")}>
                      {isOverdue ? "⚠ " : ""}{formatDate(order.deliveryDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F5]">
                  <span className="text-xs text-[#999999]">{formatDate(order.orderDate)}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[9px] font-semibold text-[#666666]">
                      {order.assignedTo.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs text-[#666666]">{order.assignedTo.split(" ")[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#CCCCCC] ml-1" />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="px-1 py-2 flex items-center justify-between text-xs text-[#999999]">
            <span>Showing {filtered.length} of {orders?.length ?? 0} orders</span>
            <span className="font-medium text-[#666666]">
              Total: ₹{filtered.reduce((s, o) => s + o.totalAmount, 0).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white border border-[#EAEAEA] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("orderNo")} className="cursor-pointer select-none">
                  Order # <SortIcon field="orderNo" />
                </th>
                <th onClick={() => handleSort("customerName")} className="cursor-pointer select-none">
                  Customer <SortIcon field="customerName" />
                </th>
                <th>Items</th>
                <th onClick={() => handleSort("orderDate")} className="cursor-pointer select-none">
                  Order Date <SortIcon field="orderDate" />
                </th>
                <th onClick={() => handleSort("deliveryDate")} className="cursor-pointer select-none">
                  Delivery <SortIcon field="deliveryDate" />
                </th>
                <th onClick={() => handleSort("totalAmount")} className="cursor-pointer select-none text-right">
                  Amount <SortIcon field="totalAmount" />
                </th>
                <th>Priority</th>
                <th onClick={() => handleSort("status")} className="cursor-pointer select-none">
                  Status <SortIcon field="status" />
                </th>
                <th>Assigned</th>
                <th className="w-8" />
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton rows={7} cols={10} />
            ) : filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={10} className="py-16 text-center text-[#999999] text-sm border-b-0">
                    No orders match your filters
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {filtered.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 7) * 0.03 }}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className={cn(
                      "cursor-pointer",
                      priorityColors[order.priority]
                    )}
                  >
                    <td>
                      <span className="font-mono text-sm font-medium text-[#111111]">
                        {order.orderNo}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm font-medium text-[#111111]">{order.customerName}</div>
                    </td>
                    <td>
                      <div className="text-sm text-[#666666] truncate max-w-[180px]">
                        {order.items.map((i) => `${i.qtyOrdered}× ${i.itemCode}`).join(", ")}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-[#666666]">{formatDate(order.orderDate)}</span>
                    </td>
                    <td>
                      <span className={cn(
                        "text-sm",
                        new Date(order.deliveryDate) < new Date() && order.status !== "CLOSED" && order.status !== "CANCELLED"
                          ? "text-[#DC2626] font-semibold"
                          : "text-[#666666]"
                      )}>
                        {formatDate(order.deliveryDate)}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-sm font-semibold text-[#111111] tabular-nums">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.priority} />
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center text-[9px] font-semibold text-[#666666]">
                          {order.assignedTo.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-xs text-[#666666] hidden lg:block">{order.assignedTo.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td>
                      <ChevronRight className="w-4 h-4 text-[#EAEAEA]" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-[#EAEAEA] flex items-center justify-between">
            <span className="text-xs text-[#999999]">
              Showing {filtered.length} of {orders?.length ?? 0} orders
            </span>
            <span className="text-xs text-[#666666] font-medium">
              Total: ₹{filtered.reduce((s, o) => s + o.totalAmount, 0).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
