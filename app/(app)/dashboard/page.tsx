"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Ship,
  PackageCheck,
  Bell,
  BarChart3,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  Zap,
} from "lucide-react";
import {
  fetchDashboardKPI,
  fetchAttentionItems,
  fetchTodayActivity,
  fetchShipments,
  fetchDeliveries,
  type DashboardKPI,
} from "@/lib/data";
import { useAbandonedCartStore } from "@/lib/abandonedCartStore";
import { KPICardSkeleton } from "@/components/ui/Skeleton";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", isCurrency = false, decimals = 0 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  decimals?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayed(current);
      ref.current = current;
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  if (isCurrency) {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Math.round(displayed));
    return <span>₹{formatted}</span>;
  }

  return <span>{prefix}{Math.round(displayed).toLocaleString("en-IN")}{suffix}</span>;
}

// ─── KPI Tile ──────────────────────────────────────────────────────────────────
function KPITile({
  label,
  value,
  isCurrency = false,
  trend,
  trendLabel,
  icon: Icon,
  urgency = "normal",
  href,
  suffix = "",
  delay = 0,
}: {
  label: string;
  value: number;
  isCurrency?: boolean;
  trend?: number;
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  urgency?: "normal" | "warning" | "danger" | "success" | "info";
  href?: string;
  suffix?: string;
  delay?: number;
}) {
  const router = useRouter();
  const urgencyStyles = {
    normal: "border-[#EAEAEA]",
    warning: "border-amber-200",
    danger: "border-red-200",
    success: "border-emerald-200",
    info: "border-blue-200",
  };
  const urgencyBg = {
    normal: "bg-[#F7F7F7]",
    warning: "bg-amber-50",
    danger: "bg-red-50",
    success: "bg-emerald-50",
    info: "bg-blue-50",
  };
  const urgencyIcon = {
    normal: "text-[#666666]",
    warning: "text-amber-600",
    danger: "text-red-600",
    success: "text-emerald-600",
    info: "text-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      onClick={() => href && router.push(href)}
      className={cn(
        "bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 group relative overflow-hidden",
        urgencyStyles[urgency]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", urgencyBg[urgency])}>
          <Icon className={cn("w-4 h-4", urgencyIcon[urgency])} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded",
            trend >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
          )}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#111111] tabular-nums tracking-tight">
        <AnimatedNumber value={value} isCurrency={isCurrency} suffix={suffix} />
      </div>
      <div className="text-xs text-[#888888] mt-1 font-medium">{label}</div>
      {trendLabel && (
        <div className="text-[10px] text-[#AAAAAA] mt-0.5">{trendLabel}</div>
      )}
      {href && (
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#DDDDDD] group-hover:text-[#888888] transition-colors" />
      )}
    </motion.div>
  );
}

// ─── Attention Item ────────────────────────────────────────────────────────────
function AttentionRow({
  emoji,
  text,
  sub,
  href,
  urgency,
  index,
}: {
  emoji: string;
  text: string;
  sub?: string;
  href: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  index: number;
}) {
  const router = useRouter();
  const bg = urgency === "HIGH" ? "bg-red-50 border-red-200 hover:bg-red-100" :
             urgency === "MEDIUM" ? "bg-amber-50 border-amber-200 hover:bg-amber-100" :
             "bg-blue-50 border-blue-200 hover:bg-blue-100";

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 + 0.1 }}
      onClick={() => router.push(href)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all duration-150 group",
        bg
      )}
    >
      <span className="text-base flex-shrink-0 select-none">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#111111] leading-snug">{text}</div>
        {sub && <div className="text-xs text-[#666666] mt-0.5">{sub}</div>}
      </div>
      <ChevronRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#888888] flex-shrink-0 transition-colors" />
    </motion.button>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const { data: kpi, isLoading: kpiLoading } = useQuery({
    queryKey: ["dashboard-kpi"],
    queryFn: fetchDashboardKPI,
  });

  const { data: attention, isLoading: attentionLoading } = useQuery({
    queryKey: ["attention"],
    queryFn: fetchAttentionItems,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchTodayActivity,
  });

  const { data: shipments } = useQuery({
    queryKey: ["shipments"],
    queryFn: fetchShipments,
  });

  const { data: deliveries } = useQuery({
    queryKey: ["deliveries"],
    queryFn: fetchDeliveries,
  });

  const { abandonedCarts } = useAbandonedCartStore();
  const idleCartsCount = abandonedCarts.filter(c => c.idleHours >= 7 && c.status === "PENDING_CALL").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const pendingShipments = shipments?.filter(s => s.status === "IN_TRANSIT" || s.status === "ARRIVING_TODAY" || s.status === "ORDERED") ?? [];
  const activeDeliveries = deliveries?.filter(d => d.status !== "DELIVERED" && d.status !== "FAILED") ?? [];

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 pb-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl font-bold text-[#111111] tracking-tight"
          >
            {greeting}, Amit 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06 }}
            className="text-sm text-[#888888] mt-0.5"
          >
            {today} · Here&apos;s your operational overview
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => router.push("/shipments")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EAEAEA] text-[#333333] text-xs font-semibold rounded-lg hover:bg-[#F7F7F7] hover:border-[#CCC] transition-colors"
          >
            <Ship className="w-3.5 h-3.5" />
            Shipments
          </button>
          <button
            onClick={() => router.push("/orders/new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Order
          </button>
        </motion.div>
      </div>

      {/* ── Today's KPIs ── */}
      <section>
        <p className="text-label text-[#AAAAAA] mb-3">TODAY&apos;S OVERVIEW</p>
        {kpiLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <KPICardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPITile
              label="Today's Sales"
              value={kpi!.todaySales}
              isCurrency
              trend={12}
              trendLabel="vs yesterday"
              icon={TrendingUp}
              urgency="success"
              href="/reports"
              delay={0}
            />
            <KPITile
              label="Today's Orders"
              value={kpi!.todayOrders}
              trend={8}
              trendLabel="vs yesterday"
              icon={ShoppingCart}
              href="/orders"
              delay={0.05}
            />
            <KPITile
              label="Pending Deliveries"
              value={kpi!.pendingDeliveries}
              icon={Truck}
              urgency={kpi!.pendingDeliveries > 5 ? "warning" : "normal"}
              href="/deliveries"
              delay={0.1}
            />
            <KPITile
              label="Inventory Value"
              value={kpi!.inventoryValue}
              isCurrency
              icon={Package}
              href="/inventory/stock"
              delay={0.15}
            />
            <KPITile
              label="Low Stock Items"
              value={kpi!.lowStockItems}
              icon={AlertTriangle}
              urgency={kpi!.lowStockItems > 3 ? "danger" : "warning"}
              href="/inventory/stock"
              delay={0.2}
            />
            <KPITile
              label="Incoming Shipments"
              value={kpi!.incomingShipments}
              icon={Ship}
              urgency="info"
              href="/shipments"
              delay={0.25}
            />
          </div>
        )}
      </section>

      {/* ── Needs Attention ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-label text-[#AAAAAA]">NEEDS ATTENTION</p>
            {!kpiLoading && kpi && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                {kpi.ordersAwaitingStock + kpi.shipmentsArrivingToday + kpi.deliveriesScheduledTomorrow + kpi.newOrdersAwaitingConfirmation} items
              </span>
            )}
          </div>
        </div>

        {kpiLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : kpi ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AttentionRow
              emoji="🔴"
              text={`${kpi.ordersAwaitingStock} orders waiting for stock`}
              sub="Customers are waiting — action needed today"
              href="/orders"
              urgency="HIGH"
              index={0}
            />
            <AttentionRow
              emoji="🟠"
              text={`${kpi.shipmentsArrivingToday} shipments arriving today`}
              sub="Coordinate warehouse receiving"
              href="/shipments"
              urgency="HIGH"
              index={1}
            />
            <AttentionRow
              emoji="🟡"
              text={`${kpi.deliveriesScheduledTomorrow} deliveries scheduled tomorrow`}
              sub="Review and prepare dispatch"
              href="/deliveries"
              urgency="MEDIUM"
              index={2}
            />
            <AttentionRow
              emoji="🔵"
              text={`${kpi.newOrdersAwaitingConfirmation} new orders awaiting confirmation`}
              sub="Review and confirm to proceed"
              href="/orders"
              urgency="LOW"
              index={3}
            />
            {idleCartsCount > 0 && (
              <AttentionRow
                emoji="🚨"
                text={`${idleCartsCount} customer cart(s) abandoned for >7 hours`}
                sub="Call customers to secure orders and reserve stock"
                href="/customers/abandoned-carts"
                urgency="HIGH"
                index={4}
              />
            )}
          </div>
        ) : null}
      </section>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Charts + Attention Items */}
        <div className="lg:col-span-2 space-y-5">

          {/* Sales Trend Chart */}
          {kpi && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#111111]">Sales Trend</h2>
                  <p className="text-xs text-[#888888] mt-0.5">Last 7 days</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +12.4% this week
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={kpi.salesTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: "1px solid #EAEAEA", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#111111" strokeWidth={2} fill="url(#salesGradient)" dot={false} activeDot={{ r: 4, fill: "#111111" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.section>
          )}

          {/* Operational KPIs Grid */}
          <section>
            <p className="text-label text-[#AAAAAA] mb-3">OPERATIONS PIPELINE</p>
            {kpiLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[...Array(8)].map((_, i) => <KPICardSkeleton key={i} />)}
              </div>
            ) : kpi ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "Pending Orders", value: kpi.pendingOrders, href: "/orders", urgency: "warning" as const, icon: ShoppingCart },
                  { label: "Purchase Required", value: kpi.purchaseRequired, href: "/purchase/requirements", urgency: "danger" as const, icon: Package },
                  { label: "Orders Ready", value: kpi.ordersReady, href: "/dispatch/ready", urgency: "success" as const, icon: CheckCircle2 },
                  { label: "Verify Pending", value: kpi.verificationPending, href: "/orders", urgency: "normal" as const, icon: Zap },
                  { label: "Dispatch Pending", value: kpi.dispatchPending, href: "/dispatch", urgency: "warning" as const, icon: Truck },
                  { label: "Invoice Pending", value: kpi.invoicePending, href: "/invoices", urgency: "normal" as const, icon: BarChart3 },
                  { label: "Outstanding", value: kpi.outstanding, isCurrency: true, href: "/finance/outstanding", urgency: "danger" as const, icon: TrendingUp },
                  { label: "Open Complaints", value: kpi.complaints, href: "/customers/complaints", urgency: "warning" as const, icon: AlertCircle },
                ].map((tile, i) => (
                  <KPITile
                    key={tile.label}
                    label={tile.label}
                    value={tile.value}
                    isCurrency={tile.isCurrency}
                    icon={tile.icon}
                    urgency={tile.urgency}
                    href={tile.href}
                    delay={i * 0.03}
                  />
                ))}
              </div>
            ) : null}
          </section>

          {/* Attention Required Detail */}
          <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-[#EAEAEA]">
                {attention?.map((item, index) => {
                  const Icon = item.severity === "HIGH" ? AlertCircle :
                               item.severity === "MEDIUM" ? AlertTriangle : Clock;
                  const iconStyle = item.severity === "HIGH" ? "text-[#DC2626]" :
                                    item.severity === "MEDIUM" ? "text-[#D97706]" : "text-[#999999]";
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index, 4) * 0.04 }}
                      onClick={() => router.push(item.href)}
                      className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#F7F7F7] transition-colors duration-100 group"
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", iconStyle)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#111111] leading-snug">{item.title}</div>
                        <div className="text-xs text-[#666666] mt-0.5">{item.subtitle}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#EAEAEA] group-hover:text-[#999999] transition-colors flex-shrink-0 mt-0.5" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: Activity + Incoming Shipments + Quick Actions */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs p-4">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Order", href: "/orders/new", icon: ShoppingCart, color: "bg-[#111111] text-white hover:bg-[#2a2a2a]" },
                { label: "Receive Shipment", href: "/shipments", icon: PackageCheck, color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" },
                { label: "View Deliveries", href: "/deliveries", icon: Truck, color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200" },
                { label: "Check Stock", href: "/inventory/stock", icon: Package, color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" },
                { label: "Customers", href: "/customers", icon: Users, color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200" },
                { label: "Reports", href: "/reports", icon: BarChart3, color: "bg-[#F7F7F7] text-[#555] hover:bg-[#EFEFEF] border border-[#EAEAEA]" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-100",
                      action.color
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Incoming Shipments */}
          {pendingShipments.length > 0 && (
            <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-[#111111]">Incoming Shipments</h2>
                </div>
                <button
                  onClick={() => router.push("/shipments")}
                  className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-[#EAEAEA]">
                {pendingShipments.slice(0, 3).map((shipment, i) => {
                  const statusColor = shipment.status === "ARRIVING_TODAY" ? "text-emerald-600 bg-emerald-50" :
                                      shipment.status === "IN_TRANSIT" ? "text-blue-600 bg-blue-50" :
                                      "text-amber-600 bg-amber-50";
                  const statusLabel = shipment.status === "ARRIVING_TODAY" ? "Arriving Today" :
                                      shipment.status === "IN_TRANSIT" ? "In Transit" : "Ordered";
                  return (
                    <motion.div
                      key={shipment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/shipments/${shipment.id}`)}
                      className="px-4 py-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-xs font-semibold text-[#111111] font-mono">{shipment.shipmentNo}</div>
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", statusColor)}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-xs text-[#555555] truncate">{shipment.supplierName}</div>
                      <div className="text-xs text-[#888888] mt-0.5">
                        {shipment.totalQty} units · ETA {formatDate(shipment.expectedDate)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Active Deliveries */}
          {activeDeliveries.length > 0 && (
            <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-semibold text-[#111111]">Active Deliveries</h2>
                </div>
                <button
                  onClick={() => router.push("/deliveries")}
                  className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-[#EAEAEA]">
                {activeDeliveries.map((del, i) => {
                  const isOut = del.status === "OUT_FOR_DELIVERY";
                  return (
                    <motion.div
                      key={del.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push("/deliveries")}
                      className="px-4 py-3 cursor-pointer hover:bg-[#F7F7F7] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-xs font-semibold text-[#111111] font-mono">{del.orderNo}</div>
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                          isOut ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50"
                        )}>
                          {isOut ? "Out for Delivery" : "Scheduled"}
                        </span>
                      </div>
                      <div className="text-xs text-[#555555] truncate">{del.customerName}</div>
                      <div className="text-xs text-[#888888] mt-0.5">
                        {del.totalQty} units · {formatDate(del.scheduledDate)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Order Status Donut */}
          {kpi && (
            <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs p-4">
              <h2 className="text-sm font-semibold text-[#111111] mb-4">Orders by Status</h2>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={kpi.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {kpi.ordersByStatus.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {kpi.ordersByStatus.map((entry) => (
                    <div key={entry.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-[#666666]">{entry.status}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#111111]">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Today's Activity */}
          <section className="bg-white border border-[#EAEAEA] rounded-xl shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EAEAEA]">
              <h2 className="text-sm font-semibold text-[#111111]">Today&apos;s Activity</h2>
              <span className="text-[11px] text-[#999999]">10 Oct</span>
            </div>
            <div className="p-4">
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
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
