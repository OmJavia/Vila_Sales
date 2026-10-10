"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  MapPin,
  ChevronRight,
  Warehouse,
  LogOut,
  ListTodo,
  Bell,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useWorkerStore, WORKERS } from "@/lib/workerStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { ITEMS, Item } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function WorkerPortalPage() {
  const router = useRouter();
  const { currentRole, currentWorkerId, switchToAdmin, getTasksForWorker, getTodaysTasks } = useWorkerStore();
  const { addNotification } = useNotificationStore();

  const [stockSearch, setStockSearch] = useState("");

  // Redirect admin away
  useEffect(() => {
    if (currentRole === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [currentRole, router]);

  const searchResults = useMemo(() => {
    if (!stockSearch.trim() || stockSearch.length < 2) return [];
    const q = stockSearch.toLowerCase();
    return ITEMS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.location && i.location.toLowerCase().includes(q)) ||
        i.godownStock?.some((g) => g.location?.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [stockSearch]);

  if (currentRole === "ADMIN" || !currentWorkerId) return null;

  const worker = WORKERS.find((w) => w.id === currentWorkerId);
  if (!worker) return null;

  const allTasks = getTasksForWorker(currentWorkerId);
  const todaysTasks = getTodaysTasks(currentWorkerId);
  const pending = todaysTasks.filter((t) => t.status === "PENDING");
  const inProgress = todaysTasks.filter((t) => t.status === "IN_PROGRESS");
  const completed = todaysTasks.filter((t) => t.status === "COMPLETED");

  const priorityColor = (p: string) => {
    if (p === "URGENT") return "bg-red-100 text-red-700 border-red-200";
    if (p === "HIGH") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-[#F0F0F0] text-[#555] border-[#E0E0E0]";
  };

  const statusIcon = (s: string) => {
    if (s === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s === "IN_PROGRESS") return <Clock className="w-4 h-4 text-blue-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-[#CCC]" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Worker Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Worker Portal</p>
            <h1 className="text-2xl font-bold">Hi, {worker.name.split(" ")[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1.5 text-blue-200 text-sm">
              <Warehouse className="w-3.5 h-3.5" />
              <span>{worker.godown} · {worker.role}</span>
            </div>
          </div>
          <button
            onClick={() => { switchToAdmin(); router.push("/dashboard"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-white text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </button>
        </div>

        {/* Today's stat pills */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {[
            { label: "To Do", value: pending.length, color: "bg-white/20" },
            { label: "In Progress", value: inProgress.length, color: "bg-amber-400/30" },
            { label: "Done Today", value: completed.length, color: "bg-green-400/30" },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn("rounded-xl p-3 text-center", color)}>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-blue-100 text-[11px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Find Material & Rack Location (A1..A9, B1..B9) ─── */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111]">Check Stock &amp; Rack Location</h2>
              <p className="text-[11px] text-[#666]">Find where material is kept (A1..A9, B1..B9...)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            A1 – Z9 Grid
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Search material name or rack (e.g. bonding, A1, B3)..."
            className="w-full pl-9 pr-8 py-2.5 text-xs border border-[#EAEAEA] rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {stockSearch && (
            <button
              onClick={() => setStockSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Location Results */}
        {stockSearch.length >= 2 && (
          <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#999] bg-[#FAFAFA] rounded-xl">
                No materials found matching &ldquo;{stockSearch}&rdquo;.
              </div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#F9F9F9] border border-[#EAEAEA] rounded-xl flex items-center justify-between gap-3 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#111] truncate">{item.name}</div>
                    <div className="text-[10px] text-[#666] font-mono mt-0.5">
                      {item.code} · {item.category}
                    </div>
                    {item.godownStock && (
                      <div className="flex gap-2 mt-1 text-[10px] text-[#666] flex-wrap">
                        {item.godownStock.map((g) => (
                          <span key={g.godown} className="truncate">
                            {g.godown.split(" ")[0]}: <b className="text-blue-700">📍 Rack {g.location || item.location}</b> ({g.available} avail)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-mono font-black shadow-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location || item.godownStock[0]?.location || "A1"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#333]">
                      {item.stock} {item.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/worker/tasks">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border border-[#EAEAEA] rounded-xl p-4 flex items-center gap-3 cursor-pointer shadow-xs hover:border-blue-300 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111]">My Tasks</p>
              <p className="text-xs text-[#999]">{pending.length + inProgress.length} pending</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#CCC] ml-auto" />
          </motion.div>
        </Link>

        <button
          onClick={() => router.push("/inventory/stock")}
          className="bg-white border border-[#EAEAEA] rounded-xl p-4 flex items-center gap-3 cursor-pointer shadow-xs hover:border-orange-300 transition-colors"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#111]">All Inventory</p>
            <p className="text-xs text-[#999]">Full stock table</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#CCC] ml-auto" />
        </button>
      </div>

      {/* Today's Task List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#111]">Today&apos;s Picking Tasks</h2>
          <Link href="/worker/tasks" className="text-xs text-blue-600 font-semibold hover:underline">
            View all
          </Link>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="bg-white border border-[#EAEAEA] rounded-xl py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#666]">No tasks for today!</p>
            <p className="text-xs text-[#999] mt-0.5">Check back later.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaysTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push("/worker/tasks")}
                className={cn(
                  "bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-150",
                  task.status === "COMPLETED" ? "border-green-200 opacity-70" : "border-[#EAEAEA] hover:border-blue-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#111]">{task.orderNo}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-semibold", priorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      {task.status === "COMPLETED" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-green-100 text-green-700 border-green-200 font-semibold">DONE</span>
                      )}
                    </div>
                    <p className="text-sm text-[#555] mt-0.5 truncate">{task.customerName}</p>

                    {/* Item locations with A1..A9 rack badge */}
                    <div className="mt-2.5 space-y-1.5">
                      {task.items.map((item) => (
                        <div key={item.itemId} className="flex items-center gap-2 text-xs text-[#666] bg-[#F7F7F7] p-2 rounded-lg">
                          <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 flex-shrink-0">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            Rack {item.location}
                          </span>
                          <span className="truncate font-medium text-[#222]">{item.itemName}</span>
                          <span className="font-bold text-[#111] flex-shrink-0 ml-auto">×{item.qtyRequired}</span>
                          {item.isLowStock && (
                            <span title="Low Stock">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CCC] flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
