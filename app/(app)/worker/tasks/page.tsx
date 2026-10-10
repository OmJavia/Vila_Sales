"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Package,
  ChevronLeft,
  BellRing,
  Loader2,
  CheckSquare,
  Square,
  Warehouse,
  User,
} from "lucide-react";
import { useWorkerStore, WORKERS, WorkerTask } from "@/lib/workerStore";
import { useNotificationStore } from "@/lib/notificationStore";
import {
  notifyManagerTaskCompleted,
  notifyManagerLowStockReported,
} from "@/lib/expoNotificationService";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function TaskCard({ task }: { task: WorkerTask }) {
  const { updateTaskStatus, updateItemPicked } = useWorkerStore();
  const { addNotification } = useNotificationStore();
  const [completing, setCompleting] = useState(false);
  const [reportingLow, setReportingLow] = useState<string | null>(null);

  const allPicked = task.items.every((i) => i.isPicked);

  const handleMarkComplete = async () => {
    if (!allPicked) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 600));
    const worker = WORKERS.find((w) => w.id === task.workerId);
    updateTaskStatus(task.id, "COMPLETED", worker?.name);
    // Fire completion notification to manager (in-app)
    addNotification({
      type: "TASK_COMPLETE",
      title: "Task Completed ✓",
      message: `${worker?.name ?? "Worker"} completed picking for Order ${task.orderNo} (${task.customerName})`,
      severity: "SUCCESS",
      entityId: task.orderId,
      entityType: "TASK",
      href: `/orders/${task.orderId}`,
    });

    // Fire Expo Push Notification to manager's device
    notifyManagerTaskCompleted({
      workerName: worker?.name ?? "Worker",
      orderNo: task.orderNo,
      customerName: task.customerName,
      orderId: task.orderId,
    });

    setCompleting(false);
  };

  const handleReportLowStock = (itemId: string, itemName: string, location: string) => {
    setReportingLow(itemId);
    setTimeout(() => {
      const workerName = WORKERS.find((w) => w.id === task.workerId)?.name ?? "Worker";
      addNotification({
        type: "LOW_STOCK_ALERT",
        title: "⚠ Low Stock Reported by Worker",
        message: `${workerName} reported low stock for ${itemName} at location ${location} (Order ${task.orderNo})`,
        severity: "WARNING",
        entityId: itemId,
        entityType: "ITEM",
        href: "/inventory/stock",
      });

      // Fire Expo Push Notification to manager's device
      notifyManagerLowStockReported({
        workerName,
        itemName,
        location,
        orderNo: task.orderNo,
      });

      setReportingLow(null);
    }, 800);
  };

  const handlePickToggle = (itemId: string, picked: boolean) => {
    if (task.status === "COMPLETED") return;
    updateItemPicked(task.id, itemId, picked);
    if (task.status === "PENDING") updateTaskStatus(task.id, "IN_PROGRESS");
  };

  const statusColors = {
    COMPLETED: "border-green-300 bg-green-50/50",
    IN_PROGRESS: "border-blue-300 bg-blue-50/30",
    PENDING: "border-[#EAEAEA] bg-white",
  };

  const priorityLabel = {
    URGENT: { label: "URGENT", cls: "bg-red-100 text-red-700 border-red-200" },
    HIGH: { label: "HIGH", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    NORMAL: { label: "NORMAL", cls: "bg-[#F0F0F0] text-[#666] border-[#E0E0E0]" },
  };

  const p = priorityLabel[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("border rounded-2xl overflow-hidden shadow-sm", statusColors[task.status])}
    >
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-inherit flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-base font-bold text-[#111]">{task.orderNo}</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", p.cls)}>{p.label}</span>
            {task.status === "COMPLETED" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> COMPLETED
              </span>
            )}
            {task.status === "IN_PROGRESS" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> IN PROGRESS
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#333] mt-0.5">{task.customerName}</p>
          <p className="text-xs text-[#999] mt-0.5">
            Allocated {formatDistanceToNow(new Date(task.allocatedAt), { addSuffix: true })}
            {task.notes && <span className="ml-2 text-[#777]">· {task.notes}</span>}
          </p>
        </div>
        {task.status === "COMPLETED" && (
          <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
        )}
      </div>

      {/* Items list */}
      <div className="divide-y divide-[#EAEAEA]/60">
        {task.items.map((item) => (
          <div
            key={item.itemId}
            className={cn(
              "px-4 py-3 transition-colors",
              item.isPicked && "bg-green-50/70"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Pick checkbox */}
              <button
                onClick={() => handlePickToggle(item.itemId, !item.isPicked)}
                className={cn(
                  "mt-0.5 flex-shrink-0 transition-colors",
                  task.status === "COMPLETED" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
                disabled={task.status === "COMPLETED"}
              >
                {item.isPicked || task.status === "COMPLETED" ? (
                  <CheckSquare className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5 text-[#CCC] hover:text-[#666]" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={cn("text-sm font-semibold", item.isPicked || task.status === "COMPLETED" ? "line-through text-[#999]" : "text-[#111]")}>
                    {item.itemName}
                  </span>
                  {item.isLowStock && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded font-semibold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> LOW STOCK
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {/* Location badge */}
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#666]">
                    <Warehouse className="w-3 h-3" />
                    {item.godown}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#333]">
                    <Package className="w-3 h-3 text-[#888]" />
                    Need: {item.qtyRequired} · Available: {item.qtyAvailable}
                  </div>
                </div>

                {/* Low stock alert button */}
                {item.isLowStock && task.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleReportLowStock(item.itemId, item.itemName, item.location)}
                    className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                    disabled={reportingLow === item.itemId}
                  >
                    {reportingLow === item.itemId ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <BellRing className="w-3 h-3" />
                    )}
                    {reportingLow === item.itemId ? "Notifying manager..." : "Alert Manager — Low Stock"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mark Complete button */}
      {task.status !== "COMPLETED" && (
        <div className="px-4 py-3 border-t border-inherit bg-white/60">
          {!allPicked && (
            <p className="text-xs text-[#999] mb-2">
              ✓ Check off all items before marking complete
            </p>
          )}
          <motion.button
            whileHover={allPicked ? { scale: 1.01 } : {}}
            whileTap={allPicked ? { scale: 0.98 } : {}}
            onClick={handleMarkComplete}
            disabled={!allPicked || completing}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              allPicked
                ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                : "bg-[#F5F5F5] text-[#AAA] cursor-not-allowed"
            )}
          >
            {completing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {completing ? "Completing..." : "Mark as Complete"}
          </motion.button>
        </div>
      )}

      {task.status === "COMPLETED" && task.completedAt && (
        <div className="px-4 py-2.5 bg-green-50 border-t border-green-200 text-center">
          <p className="text-xs text-green-700 font-semibold">
            ✓ Completed by {task.completedBy} · {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function WorkerTasksPage() {
  const router = useRouter();
  const { currentRole, currentWorkerId, getTodaysTasks, getTasksForWorker } = useWorkerStore();
  const [filter, setFilter] = useState<"TODAY" | "ALL">("TODAY");

  useEffect(() => {
    if (currentRole === "ADMIN") router.replace("/dashboard");
  }, [currentRole, router]);

  if (currentRole === "ADMIN" || !currentWorkerId) return null;

  const worker = WORKERS.find((w) => w.id === currentWorkerId);
  const tasks = filter === "TODAY"
    ? getTodaysTasks(currentWorkerId)
    : getTasksForWorker(currentWorkerId);

  const pending = tasks.filter((t) => t.status === "PENDING");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completed = tasks.filter((t) => t.status === "COMPLETED");

  const activeTasks = [...inProgress, ...pending];
  const doneTasks = completed;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/worker")}
          className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#666]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#111]">My Tasks</h1>
          <p className="text-xs text-[#999] flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {worker?.name} · {worker?.godown}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["TODAY", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
              filter === f ? "bg-[#111] text-white" : "bg-[#F0F0F0] text-[#666] hover:bg-[#E5E5E5]"
            )}
          >
            {f === "TODAY" ? "Today" : "All Tasks"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-[#999]">
          <span className="font-semibold text-amber-600">{pending.length + inProgress.length}</span> pending
          &nbsp;·&nbsp;
          <span className="font-semibold text-green-600">{completed.length}</span> done
        </div>
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider">Active ({activeTasks.length})</h2>
          <AnimatePresence>
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Tasks */}
      {doneTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider">Completed ({doneTasks.length})</h2>
          <AnimatePresence>
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-16 bg-white border border-[#EAEAEA] rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#666]">
            {filter === "TODAY" ? "No tasks assigned for today!" : "No tasks assigned yet."}
          </p>
          <p className="text-xs text-[#999] mt-1">Check back or contact your supervisor.</p>
        </div>
      )}
    </div>
  );
}
