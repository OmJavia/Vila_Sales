"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Smartphone,
  HardHat,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  Info,
  Clock,
  Terminal,
} from "lucide-react";
import {
  getManagerPushToken,
  setManagerPushToken,
  getWorkerPushToken,
  setWorkerPushToken,
  getPushDispatchLogs,
  notifyWorkerTaskAllocated,
  notifyManagerTaskCompleted,
  notifyManagerLowStockReported,
  sendExpoPushNotification,
  PushDispatchLog,
} from "@/lib/expoNotificationService";
import { useWorkerStore, WORKERS } from "@/lib/workerStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function ExpoNotificationTestPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentRole, currentWorkerId, switchToWorker, switchToAdmin } = useWorkerStore();
  const { addNotification, unreadCount } = useNotificationStore();

  const [mounted, setMounted] = useState(false);
  const [managerToken, setManagerTokenState] = useState("");
  const [workerToken, setWorkerTokenState] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("W001");
  const [logs, setLogs] = useState<PushDispatchLog[]>([]);
  const [isSending, setIsSending] = useState<string | null>(null);

  // Custom message modal/form
  const [customTitle, setCustomTitle] = useState("Test Alert");
  const [customBody, setCustomBody] = useState("This is a live test notification from TradeFlow");
  const [customRecipient, setCustomRecipient] = useState<"MANAGER" | "WORKER">("MANAGER");

  useEffect(() => {
    setMounted(true);
    setManagerTokenState(getManagerPushToken());
    setWorkerTokenState(getWorkerPushToken("W001"));
    setLogs(getPushDispatchLogs());
  }, []);

  const refreshLogs = () => {
    setLogs(getPushDispatchLogs());
  };

  const handleSaveTokens = () => {
    setManagerPushToken(managerToken);
    setWorkerPushToken(selectedWorkerId, workerToken);
    toast.success("Push Tokens Saved", "Expo Push tokens updated for Manager and Worker.");
  };

  // 1. Test Manager Allocates Task -> Worker
  const handleTestTaskAllocated = async () => {
    setIsSending("ALLOCATE");
    const worker = WORKERS.find((w) => w.id === selectedWorkerId) || WORKERS[0];

    // Trigger Expo push
    const res = await notifyWorkerTaskAllocated({
      workerId: worker.id,
      workerName: worker.name,
      orderNo: "#ORD-1048",
      customerName: "ABC Industries Pvt. Ltd.",
      itemCount: 4,
      godown: worker.godown,
    });

    // Also trigger in-app notification
    addNotification({
      type: "ORDER_ALLOCATED",
      title: "New Task Assigned",
      message: `Order #ORD-1048 (ABC Industries) assigned to ${worker.name}. Check your task list.`,
      severity: "INFO",
      entityId: "O001",
      entityType: "TASK",
      href: "/worker/tasks",
    });

    setIsSending(null);
    refreshLogs();

    toast.success(
      "Worker Push Dispatched! 📦",
      `Sent to ${worker.name}'s device. Status: ${res.simulated ? "Simulated" : "Delivered"}.`
    );
  };

  // 2. Test Worker Completes Task -> Manager
  const handleTestTaskCompleted = async () => {
    setIsSending("COMPLETE");
    const worker = WORKERS.find((w) => w.id === selectedWorkerId) || WORKERS[0];

    // Trigger Expo push to Manager
    const res = await notifyManagerTaskCompleted({
      workerName: worker.name,
      orderNo: "#ORD-1048",
      customerName: "ABC Industries Pvt. Ltd.",
      orderId: "O001",
    });

    // In-app notification
    addNotification({
      type: "TASK_COMPLETE",
      title: "Task Completed ✓",
      message: `${worker.name} completed picking for Order #ORD-1048 (ABC Industries)`,
      severity: "SUCCESS",
      entityId: "O001",
      entityType: "TASK",
      href: "/orders/O001",
    });

    setIsSending(null);
    refreshLogs();

    toast.success(
      "Manager Push Dispatched! ✅",
      `Sent to Manager device. Status: ${res.simulated ? "Simulated" : "Delivered"}.`
    );
  };

  // 3. Test Worker Reports Low Stock -> Manager
  const handleTestLowStock = async () => {
    setIsSending("LOW_STOCK");
    const worker = WORKERS.find((w) => w.id === selectedWorkerId) || WORKERS[0];

    const res = await notifyManagerLowStockReported({
      workerName: worker.name,
      itemName: "MAXGRIP 500×12 SOCKET HEAD",
      location: "A12",
      orderNo: "#ORD-1048",
    });

    addNotification({
      type: "LOW_STOCK_ALERT",
      title: "⚠ Low Stock Reported by Worker",
      message: `${worker.name} reported low stock for MAXGRIP 500×12 at Rack A12 while fulfilling #ORD-1048`,
      severity: "WARNING",
      entityId: "I003",
      entityType: "ITEM",
      href: "/inventory/stock",
    });

    setIsSending(null);
    refreshLogs();

    toast.warning(
      "Shortage Alert Dispatched! ⚠️",
      `Manager alerted of low stock at rack. Status: ${res.simulated ? "Simulated" : "Delivered"}.`
    );
  };

  // 4. Custom Test Push
  const handleSendCustom = async () => {
    setIsSending("CUSTOM");
    const targetToken = customRecipient === "MANAGER" ? managerToken : workerToken;
    const recipientName = customRecipient === "MANAGER" ? "Manager (Amit Sharma)" : "Worker (Raju More)";

    await sendExpoPushNotification(
      {
        to: targetToken,
        title: customTitle,
        body: customBody,
        sound: "default",
        priority: "high",
      },
      customRecipient,
      recipientName
    );

    setIsSending(null);
    refreshLogs();
    toast.success("Custom Push Dispatched", `Sent to ${recipientName}.`);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              Expo Push Service
            </span>
            <span className="text-xs text-text-muted">Live Bidirectional Testing</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mt-1">
            Worker &amp; Manager Push Notification Tester
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Simulate and verify instant mobile push alerts when tasks are allocated to workers and completed for managers.
          </p>
        </div>

        {/* Current Role Switcher Indicator */}
        <div className="flex items-center gap-2 bg-bg-canvas p-1.5 rounded-xl border border-border self-start sm:self-auto">
          <span className="text-xs text-text-muted px-2">Current View:</span>
          <button
            onClick={() => { switchToAdmin(); router.push("/dashboard"); }}
            className={cn(
              "text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors",
              currentRole === "ADMIN" ? "bg-[#111] text-white" : "text-text-secondary hover:bg-hover"
            )}
          >
            Manager (Admin)
          </button>
          <button
            onClick={() => { switchToWorker("W001"); router.push("/worker"); }}
            className={cn(
              "text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors",
              currentRole === "WORKER" ? "bg-blue-600 text-white" : "text-text-secondary hover:bg-hover"
            )}
          >
            Worker (Raju More)
          </button>
        </div>
      </div>

      {/* Overview Diagram / Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flow 1: Task Allocated */}
        <div className="card p-5 border-l-4 border-l-blue-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <HardHat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Flow 1: Task Allocation</h3>
                <p className="text-[11px] text-text-muted">Manager assigns order → Worker gets Expo Push</p>
              </div>
            </div>
            <span className="badge badge-normal font-mono text-[10px]">Manager ➔ Worker</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            When manager clicks <strong>&quot;Allocate &amp; Assign&quot;</strong> in Stock Allocation or Workers page, an Expo Push notification is dispatched to the worker&apos;s mobile device, alerting them of new picking duties with exact rack coordinates.
          </p>

          <button
            onClick={handleTestTaskAllocated}
            disabled={isSending === "ALLOCATE"}
            className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending === "ALLOCATE" ? "Dispatching..." : "⚡ Test: Allocate Task to Worker"}
          </button>
        </div>

        {/* Flow 2: Task Completed */}
        <div className="card p-5 border-l-4 border-l-emerald-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Flow 2: Task Completion</h3>
                <p className="text-[11px] text-text-muted">Worker marks items picked → Manager gets Expo Push</p>
              </div>
            </div>
            <span className="badge badge-ok font-mono text-[10px]">Worker ➔ Manager</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            When the warehouse worker checks off items in the <strong>Worker Portal</strong> and hits <strong>&quot;Mark Task Completed&quot;</strong>, an instant push alert is delivered to the Manager&apos;s phone confirming the order is ready for dispatch.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTestTaskCompleted}
              disabled={isSending === "COMPLETE"}
              className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 flex items-center justify-center gap-1.5 font-semibold shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSending === "COMPLETE" ? "Sending..." : "⚡ Test: Task Complete"}
            </button>

            <button
              onClick={handleTestLowStock}
              disabled={isSending === "LOW_STOCK"}
              className="btn-secondary text-amber-700 hover:bg-amber-50 text-xs py-2 flex items-center justify-center gap-1.5 font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {isSending === "LOW_STOCK" ? "Sending..." : "⚡ Report Shortage"}
            </button>
          </div>
        </div>
      </div>

      {/* Expo Push Token Configuration */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-primary" />
              Expo Device Push Tokens
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Paste your own real Expo Go push token (`ExponentPushToken[...]`) from your physical phone, or test with demo tokens.
            </p>
          </div>
          <button
            onClick={handleSaveTokens}
            className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto"
          >
            Save Tokens
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Manager Token */}
          <div className="space-y-1.5 bg-bg-canvas p-3.5 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Manager Device Token (Admin)
              </span>
              <span className="text-[10px] text-text-muted font-mono">Amit Sharma</span>
            </div>
            <input
              type="text"
              value={managerToken}
              onChange={(e) => setManagerTokenState(e.target.value)}
              placeholder="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
              className="w-full p-2 border border-border rounded bg-background font-mono text-[11px] text-text-secondary focus:outline-none focus:border-brand-primary"
            />
            <p className="text-[10px] text-text-muted">
              Used when workers complete tasks or report warehouse discrepancies.
            </p>
          </div>

          {/* Worker Token */}
          <div className="space-y-1.5 bg-bg-canvas p-3.5 rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Worker Device Token
              </span>
              <select
                value={selectedWorkerId}
                onChange={(e) => {
                  setSelectedWorkerId(e.target.value);
                  setWorkerTokenState(getWorkerPushToken(e.target.value));
                }}
                className="text-[11px] p-1 border border-border rounded bg-background font-medium"
              >
                {WORKERS.filter((w) => w.isActive).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={workerToken}
              onChange={(e) => setWorkerTokenState(e.target.value)}
              placeholder="ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
              className="w-full p-2 border border-border rounded bg-background font-mono text-[11px] text-text-secondary focus:outline-none focus:border-brand-primary"
            />
            <p className="text-[10px] text-text-muted">
              Used when manager allocates orders to this worker for picking.
            </p>
          </div>
        </div>
      </div>

      {/* Live Push Dispatch Log / Terminal */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-bg-canvas">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary">Push Dispatch Activity &amp; Receipts</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-mono">
              Total dispatches: {logs.length}
            </span>
            <button
              onClick={refreshLogs}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-hover"
              title="Refresh logs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 text-center text-text-muted text-xs">
            No push notifications sent yet in this session. Click any of the test buttons above to trigger live alerts!
          </div>
        ) : (
          <div className="divide-y divide-border text-xs max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-hover/40 transition-colors flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold font-mono",
                        log.recipientRole === "WORKER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {log.recipientRole}
                    </span>
                    <span className="font-semibold text-text-primary">{log.title}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded font-bold",
                        log.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : log.status === "SIMULATED"
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-text-secondary text-[11px] leading-relaxed">{log.body}</p>
                  <div className="text-[10px] text-text-muted font-mono flex items-center gap-3">
                    <span>To: {log.recipientName}</span>
                    <span>Token: {log.pushToken.slice(0, 24)}...</span>
                    {log.ticketId && <span>Ticket: {log.ticketId}</span>}
                  </div>
                </div>

                <div className="text-[10px] text-text-muted font-mono flex-shrink-0 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simulator Quick Links */}
      <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-blue-900 block">Want to test the full in-app flow?</span>
          <span className="text-blue-700 text-[11px]">
            1. Allocate an order on Stock Allocation ➔ 2. Switch to Worker role to see task &amp; complete ➔ 3. Switch to Admin and check notification bell!
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/inventory/allocation")}
            className="btn-secondary bg-white text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
          >
            Stock Allocation <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => { switchToWorker("W001"); router.push("/worker/tasks"); }}
            className="btn-primary bg-blue-600 text-white text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
          >
            Worker Tasks <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
