"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Warehouse,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ChevronRight,
  Plus,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { useWorkerStore, WORKERS, Worker, WorkerTask } from "@/lib/workerStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { notifyWorkerTaskAllocated } from "@/lib/expoNotificationService";
import { fetchOrders } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ITEMS } from "@/lib/data";

function WorkerCard({ worker, tasks }: { worker: Worker; tasks: WorkerTask[] }) {
  const router = useRouter();
  const { switchToWorker } = useWorkerStore();
  const pending = tasks.filter((t) => t.status !== "COMPLETED").length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white border rounded-xl p-4 shadow-sm",
        worker.isActive ? "border-[#EAEAEA]" : "border-[#EAEAEA] opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
          worker.role === "SUPERVISOR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
        )}>
          {worker.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#111]">{worker.name}</p>
              <p className="text-xs text-[#666] flex items-center gap-1 mt-0.5">
                <Warehouse className="w-3 h-3" />
                {worker.godown}
              </p>
              <p className="text-xs text-[#999] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                {worker.phone}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-bold border",
                worker.role === "SUPERVISOR" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"
              )}>
                {worker.role}
              </span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-bold border",
                worker.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-[#F0F0F0] text-[#999] border-[#E0E0E0]"
              )}>
                {worker.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>

          {/* Task stats */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F5F5F5]">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-amber-700">{pending}</span>
              <span className="text-[#999]">pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="font-semibold text-green-700">{completed}</span>
              <span className="text-[#999]">done</span>
            </div>
            <button
              onClick={() => { switchToWorker(worker.id); router.push("/worker"); }}
              className="ml-auto text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              View as worker <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AllocateModal({
  orderId,
  orderNo,
  customerName,
  onClose,
}: {
  orderId: string;
  orderNo: string;
  customerName: string;
  onClose: () => void;
}) {
  const { allocateTask } = useWorkerStore();
  const { addNotification } = useNotificationStore();
  const [selectedWorker, setSelectedWorker] = useState<string>("");
  const [notes, setNotes] = useState("");

  const activeWorkers = WORKERS.filter((w) => w.isActive);
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const order = orders?.find((o) => o.id === orderId);

  const handleAllocate = () => {
    if (!selectedWorker || !order) return;
    const worker = WORKERS.find((w) => w.id === selectedWorker);
    if (!worker) return;

    const taskItems = order.items.map((item) => {
      const stockItem = ITEMS.find((i) => i.id === item.itemId);
      const godownStock = stockItem?.godownStock.find((g) => g.godown === worker.godown);
      return {
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode,
        qtyRequired: item.qtyOrdered,
        godown: worker.godown,
        location: godownStock?.location ?? "TBD",
        qtyAvailable: godownStock?.available ?? item.qtyAvailable,
        isLowStock: (godownStock?.available ?? item.qtyAvailable) < item.qtyOrdered,
      };
    });

    const today = new Date().toISOString().split("T")[0];
    allocateTask({
      orderId,
      orderNo,
      customerName,
      priority: order.priority,
      workerId: selectedWorker,
      workerName: worker.name,
      items: taskItems,
      notes: notes || undefined,
      dueDate: today,
    });

    // Notify the worker (stored centrally, worker sees it when they log in)
    addNotification({
      type: "ORDER_ALLOCATED",
      title: "New Task Assigned",
      message: `Order ${orderNo} (${customerName}) has been assigned to ${worker.name}. Check your task list.`,
      severity: "INFO",
      entityId: orderId,
      entityType: "TASK",
      href: "/worker/tasks",
    });

    // Fire Expo Push Notification to worker's device
    notifyWorkerTaskAllocated({
      workerId: selectedWorker,
      workerName: worker.name,
      orderNo,
      customerName,
      itemCount: taskItems.length,
      godown: worker.godown,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[#EAEAEA] bg-[#FAFAFA]">
          <h2 className="text-base font-bold text-[#111]">Allocate to Worker</h2>
          <p className="text-xs text-[#666] mt-0.5">
            {orderNo} · {customerName}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#555] mb-2 block uppercase tracking-wider">
              Select Worker
            </label>
            <div className="space-y-2">
              {activeWorkers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorker(w.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                    selectedWorker === w.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-[#EAEAEA] hover:border-[#CCC]"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    w.role === "SUPERVISOR" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {w.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#111]">{w.name}</p>
                    <p className="text-xs text-[#666]">{w.role} · {w.godown}</p>
                  </div>
                  {selectedWorker === w.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#555] mb-2 block uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handle fragile, deliver to dock 3..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-[#EAEAEA] rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#EAEAEA] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#EAEAEA] rounded-xl text-sm font-semibold text-[#666] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAllocate}
            disabled={!selectedWorker}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
              selectedWorker
                ? "bg-[#111] text-white hover:bg-[#333]"
                : "bg-[#F0F0F0] text-[#AAA] cursor-not-allowed"
            )}
          >
            Assign Task
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function WorkersPage() {
  const { workerTasks } = useWorkerStore();
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
  const [allocatingOrder, setAllocatingOrder] = useState<{ id: string; orderNo: string; customerName: string } | null>(null);

  const getWorkerTasks = (workerId: string) =>
    workerTasks.filter((t) => t.workerId === workerId);

  // Unallocated orders (no task created for them yet)
  const allocatedOrderIds = new Set(workerTasks.map((t) => t.orderId));
  const unallocatedOrders = orders?.filter(
    (o) =>
      !allocatedOrderIds.has(o.id) &&
      !["CLOSED", "CANCELLED", "DISPATCHED", "INVOICED", "PAYMENT_DONE"].includes(o.status)
  ) ?? [];

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#111]">Worker Management</h1>
        <p className="text-sm text-[#666] mt-0.5">
          {WORKERS.filter(w => w.isActive).length} active workers · Assign orders and track progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workers Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider">Workers</h2>
          {WORKERS.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              tasks={getWorkerTasks(worker.id)}
            />
          ))}
        </div>

        {/* Pending Allocation */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider">
            Orders Needing Allocation ({unallocatedOrders.length})
          </h2>
          {unallocatedOrders.length === 0 ? (
            <div className="bg-white border border-[#EAEAEA] rounded-xl py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#666]">All orders allocated!</p>
            </div>
          ) : (
            unallocatedOrders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#111]">{order.orderNo}</span>
                      {order.priority !== "NORMAL" && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-bold border",
                          order.priority === "URGENT" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"
                        )}>
                          {order.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666] mt-0.5">{order.customerName}</p>
                    <p className="text-xs text-[#999] mt-0.5">
                      {order.items.map(i => `${i.qtyOrdered}× ${i.itemCode}`).join(", ")}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAllocatingOrder({ id: order.id, orderNo: order.orderNo, customerName: order.customerName })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] text-white text-xs font-bold rounded-lg hover:bg-[#333] transition-colors flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Assign
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}

          {/* All active tasks overview */}
          {workerTasks.filter(t => t.status !== "COMPLETED").length > 0 && (
            <div className="mt-4 space-y-2">
              <h2 className="text-xs font-bold text-[#999] uppercase tracking-wider">Active Tasks Overview</h2>
              {workerTasks.filter(t => t.status !== "COMPLETED").map((task) => (
                <div key={task.id} className="bg-white border border-[#EAEAEA] rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={cn(
                    "w-1.5 h-8 rounded-full flex-shrink-0",
                    task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-[#DDD]"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111]">{task.orderNo}</p>
                    <p className="text-xs text-[#999]">{task.workerName} · {task.items[0]?.godown}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-[10px] font-bold",
                      task.status === "IN_PROGRESS" ? "text-blue-600" : "text-[#999]"
                    )}>
                      {task.status}
                    </p>
                    <p className="text-[10px] text-[#CCC]">{task.items.length} item(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Allocate Modal */}
      <AnimatePresence>
        {allocatingOrder && (
          <AllocateModal
            orderId={allocatingOrder.id}
            orderNo={allocatingOrder.orderNo}
            customerName={allocatingOrder.customerName}
            onClose={() => setAllocatingOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
