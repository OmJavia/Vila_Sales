"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  ShoppingCart,
  FileText,
  Receipt,
  DollarSign,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { fetchCustomer, ORDERS, TODAY_ACTIVITY } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "invoices", label: "Invoices" },
  { id: "outstanding", label: "Outstanding" },
  { id: "timeline", label: "Timeline" },
];

interface CustomerDetailProps {
  params: { id: string };
}

export default function CustomerDetailPage({ params }: CustomerDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", params.id],
    queryFn: () => fetchCustomer(params.id),
  });

  const customerOrders = ORDERS.filter((o) => o.customerId === params.id);

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 text-center text-[#999999]">
        Customer not found
      </div>
    );
  }

  const creditPct = (customer.creditUsed / customer.creditLimit) * 100;
  const creditWarning = creditPct > 85;

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push("/customers")}
        className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#111111] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        All Customers
      </button>

      {/* Customer header card */}
      <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs">
        <div className="p-6 flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-[#111111] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {customer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#111111]">{customer.name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 text-sm text-[#666666]">
                    <MapPin className="w-3.5 h-3.5" />{customer.city}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-[#666666]">
                    <Building className="w-3.5 h-3.5" />
                    <span className="font-mono">{customer.gstin}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-sm text-[#666666] hover:text-[#111111]">
                    <Phone className="w-3.5 h-3.5" />{customer.phone}
                  </a>
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-sm text-[#666666] hover:text-[#111111]">
                    <Mail className="w-3.5 h-3.5" />{customer.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-semibold border border-[#EAEAEA] rounded-md hover:bg-[#F7F7F7] transition-colors text-[#111111]">
                  Edit
                </button>
                <button
                  onClick={() => router.push("/orders")}
                  className="px-4 py-2 text-sm font-semibold bg-[#111111] text-white rounded-md hover:bg-[#333333] transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  New Order
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 border-t border-[#EAEAEA]">
          <div className="px-6 py-4 border-r border-[#EAEAEA]">
            <div className="text-label text-[#999999]">Credit Limit</div>
            <div className="text-xl font-bold text-[#111111] tabular-nums mt-1">
              ₹{(customer.creditLimit / 100000).toFixed(1)}L
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#999999]">Used: {Math.round(creditPct)}%</span>
              </div>
              <div className="h-1.5 bg-[#EAEAEA] rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(creditPct, 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    creditWarning ? "bg-[#DC2626]" : "bg-[#16A34A]"
                  )}
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-r border-[#EAEAEA]">
            <div className="text-label text-[#999999]">Outstanding</div>
            <div className={cn(
              "text-xl font-bold tabular-nums mt-1",
              customer.outstandingAmount > customer.creditLimit * 0.7 ? "text-[#DC2626]" : "text-[#111111]"
            )}>
              ₹{(customer.outstandingAmount / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-[#999999] mt-1">{customer.paymentTerms}d terms</div>
          </div>
          <div className="px-6 py-4 border-r border-[#EAEAEA]">
            <div className="text-label text-[#999999]">Total Orders</div>
            <div className="text-xl font-bold text-[#111111] tabular-nums mt-1">{customer.totalOrders}</div>
            <div className="text-xs text-[#999999] mt-1">Last: {formatDate(customer.lastOrderDate)}</div>
          </div>
          <div className="px-6 py-4">
            <div className="text-label text-[#999999]">Active Orders</div>
            <div className="text-xl font-bold text-[#111111] tabular-nums mt-1">
              {customerOrders.filter((o) => o.status !== "CLOSED" && o.status !== "CANCELLED").length}
            </div>
            <div className="text-xs text-[#999999] mt-1">in progress</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[#EAEAEA] px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#666666] hover:text-[#111111]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 gap-5">
              {/* Active orders */}
              <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs">
                <div className="px-5 py-3.5 border-b border-[#EAEAEA] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#111111]">Active Orders</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1"
                  >
                    View all <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-[#EAEAEA]">
                  {customerOrders
                    .filter((o) => o.status !== "CLOSED" && o.status !== "CANCELLED")
                    .slice(0, 3)
                    .map((order) => (
                      <div
                        key={order.id}
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium">{order.orderNo}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="text-xs text-[#999999] mt-0.5">
                            {order.items[0]?.itemName} · {formatDate(order.orderDate)}
                          </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">
                          ₹{(order.totalAmount / 1000).toFixed(0)}K
                        </span>
                      </div>
                    ))}
                  {customerOrders.filter((o) => o.status !== "CLOSED" && o.status !== "CANCELLED").length === 0 && (
                    <div className="py-8 text-center text-sm text-[#999999]">No active orders</div>
                  )}
                </div>
              </div>

              {/* Contact & info */}
              <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#111111]">Customer Details</h3>
                {[
                  { label: "Contact Person", value: customer.contactPerson },
                  { label: "Phone", value: customer.phone },
                  { label: "Email", value: customer.email },
                  { label: "City", value: customer.city },
                  { label: "GSTIN", value: customer.gstin, mono: true },
                  { label: "Payment Terms", value: `${customer.paymentTerms} days` },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-label text-[#999999]">{label}</span>
                    <span className={cn("text-sm text-[#111111] text-right", mono && "font-mono")}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Delivery</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="cursor-pointer"
                    >
                      <td><span className="font-mono text-sm font-medium">{order.orderNo}</span></td>
                      <td className="text-sm text-[#666666] max-w-[200px] truncate">{order.items[0]?.itemName}</td>
                      <td className="text-sm text-[#666666]">{formatDate(order.orderDate)}</td>
                      <td className="text-sm text-[#666666]">{formatDate(order.deliveryDate)}</td>
                      <td className="text-right text-sm font-semibold tabular-nums">₹{order.totalAmount.toLocaleString("en-IN")}</td>
                      <td><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "outstanding" && (
            <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-5">
              <div className="flex items-center gap-3 mb-5 p-4 bg-[#FEF3C7] rounded-lg border border-[#FDE68A]">
                <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#111111]">
                    Outstanding: ₹{customer.outstandingAmount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-[#666666] mt-0.5">
                    Payment terms: {customer.paymentTerms} days · 1 invoice overdue
                  </div>
                </div>
                <button className="ml-auto px-4 py-2 text-sm font-semibold bg-[#111111] text-white rounded-md hover:bg-[#333333] transition-colors">
                  Record Payment
                </button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="font-mono text-sm">INV-1044</span></td>
                    <td><span className="font-mono text-sm text-[#666666]">#1044</span></td>
                    <td className="text-sm text-[#666666]">20 Sep 2026</td>
                    <td className="text-sm text-[#DC2626] font-semibold">27 Sep 2026</td>
                    <td className="text-right text-sm font-semibold tabular-nums">₹27,000</td>
                    <td><StatusBadge status="OVERDUE" /></td>
                  </tr>
                  {customer.id === "C001" && (
                    <tr>
                      <td><span className="font-mono text-sm">INV-1048</span></td>
                      <td><span className="font-mono text-sm text-[#666666]">#1048</span></td>
                      <td className="text-sm text-[#666666]">30 Sep 2026</td>
                      <td className="text-sm text-[#666666]">30 Oct 2026</td>
                      <td className="text-right text-sm font-semibold tabular-nums">₹1,20,000</td>
                      <td><StatusBadge status="PENDING" /></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-5">
              <ActivityTimeline events={TODAY_ACTIVITY.filter((e) => e.entityId?.startsWith("O"))} />
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-5">
              <div className="py-8 text-center text-[#999999] text-sm">Invoice history coming soon</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
