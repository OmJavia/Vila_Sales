"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  PackageSearch,
  CheckCircle,
  ClipboardCheck,
  Truck,
  FileText,
  DollarSign,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  fetchKPIData,
  fetchAttentionItems,
  fetchTodayActivity,
} from "@/lib/data";
import { KPICard } from "@/components/ui/KPICard";
import { KPICardSkeleton } from "@/components/ui/Skeleton";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, formatCurrency } from "@/lib/utils";

const SEVERITY_ICON = {
  HIGH: AlertCircle,
  MEDIUM: AlertTriangle,
  LOW: Clock,
};

const SEVERITY_STYLE = {
  HIGH: "text-[#DC2626]",
  MEDIUM: "text-[#D97706]",
  LOW: "text-[#999999]",
};

export default function DashboardPage() {
  const router = useRouter();

  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpi"],
    queryFn: fetchKPIData,
  });

  const { data: attention, isLoading: attentionLoading } = useQuery({
    queryKey: ["attention"],
    queryFn: fetchAttentionItems,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchTodayActivity,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-bold text-[#111111] tracking-tight"
          >
            {greeting}, Amit.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06 }}
            className="text-sm text-[#666666] mt-0.5"
          >
            Here&apos;s what needs your attention today — 30 Sep 2026
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-semibold rounded-md hover:bg-[#333333] transition-colors duration-100"
          whileHover={{ scale: 0.985 }}
          whileTap={{ scale: 0.972 }}
        >
          <Plus className="w-4 h-4" />
          New Order
        </motion.button>
      </div>

      {/* KPI Cards */}
      <section>
        {kpiLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[...Array(8)].map((_, i) => <KPICardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <KPICard
              label="Pending Orders"
              value={kpi!.pendingOrders}
              href="/orders"
              urgency="warning"
              icon={<ShoppingCart className="w-5 h-5" />}
              delta={{ value: 3, label: "vs yesterday" }}
            />
            <KPICard
              label="Purchase Required"
              value={kpi!.purchaseRequired}
              href="/purchase/requirements"
              urgency="danger"
              icon={<PackageSearch className="w-5 h-5" />}
            />
            <KPICard
              label="Orders Ready"
              value={kpi!.ordersReady}
              href="/dispatch/ready"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <KPICard
              label="Verification Pending"
              value={kpi!.verificationPending}
              href="/orders"
              icon={<ClipboardCheck className="w-5 h-5" />}
            />
            <KPICard
              label="Dispatch Pending"
              value={kpi!.dispatchPending}
              href="/dispatch"
              urgency="warning"
              icon={<Truck className="w-5 h-5" />}
            />
            <KPICard
              label="Invoice Pending"
              value={kpi!.invoicePending}
              href="/invoices"
              icon={<FileText className="w-5 h-5" />}
            />
            <KPICard
              label="Outstanding"
              value={kpi!.outstanding}
              isCurrency
              href="/finance/outstanding"
              urgency="danger"
              icon={<DollarSign className="w-5 h-5" />}
              delta={{ value: 240000, label: "since last week" }}
            />
            <KPICard
              label="Open Complaints"
              value={kpi!.complaints}
              href="/customers/complaints"
              urgency="warning"
              icon={<AlertCircle className="w-5 h-5" />}
            />
          </div>
        )}
      </section>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Attention Required */}
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <h2 className="text-sm font-semibold text-[#111111]">Attention Required</h2>
                {!attentionLoading && attention && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#FEE2E2] text-[#DC2626] rounded">
                    {attention.filter((a) => a.severity === "HIGH").length} urgent
                  </span>
                )}
              </div>
            </div>

            {attentionLoading ? (
              <div className="divide-y divide-[#EAEAEA]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="skeleton w-4 h-4 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3.5 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                    <div className="skeleton w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[#EAEAEA]">
                {attention?.map((item, index) => {
                  const Icon = SEVERITY_ICON[item.severity];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index, 4) * 0.04 }}
                      onClick={() => router.push(item.href)}
                      className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#F7F7F7] transition-colors duration-100 group"
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          SEVERITY_STYLE[item.severity]
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#111111] leading-snug">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#666666] mt-0.5">{item.subtitle}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#EAEAEA] group-hover:text-[#999999] transition-colors flex-shrink-0 mt-0.5" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-label text-[#666666] mb-3">QUICK ACTIONS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "New Order", href: "/orders", icon: ShoppingCart, desc: "Create a sales order" },
                { label: "Stock Overview", href: "/inventory/stock", icon: PackageSearch, desc: "Check godown stock" },
                { label: "Outstanding", href: "/finance/outstanding", icon: DollarSign, desc: "Customer aging report" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className="bg-white border border-[#EAEAEA] rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all duration-150 hover:border-[#ccc] group"
                    whileHover={{ scale: 0.99 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <Icon className="w-5 h-5 text-[#666666] mb-2" />
                    <div className="text-sm font-semibold text-[#111111]">{action.label}</div>
                    <div className="text-xs text-[#999999] mt-0.5">{action.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Today's Activity */}
        <div>
          <section className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAEAEA]">
              <h2 className="text-sm font-semibold text-[#111111]">Today&apos;s Activity</h2>
              <span className="text-[11px] text-[#999999]">30 Sep</span>
            </div>
            <div className="p-5">
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5 pt-0.5">
                        <div className="skeleton h-3.5 w-full" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ActivityTimeline events={activity ?? []} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
