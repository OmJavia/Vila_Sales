/**
 * Expo Push Notification Service
 * Handles dispatching push notifications to Expo Go / mobile devices for:
 * 1. Manager -> Worker (New Task Allocated)
 * 2. Worker -> Manager (Task Completed / Low Stock Alert)
 */

export interface ExpoPushMessage {
  to: string; // ExponentPushToken[...]
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  badge?: number;
  channelId?: string;
}

export interface ExpoPushReceipt {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: any;
}

export interface PushDispatchLog {
  id: string;
  timestamp: string;
  recipientRole: "WORKER" | "MANAGER";
  recipientName: string;
  pushToken: string;
  title: string;
  body: string;
  status: "DELIVERED" | "SIMULATED" | "FAILED";
  ticketId?: string;
  error?: string;
}

const STORAGE_KEY_MANAGER_TOKEN = "tradeflow_expo_manager_token";
const STORAGE_KEY_WORKER_TOKENS = "tradeflow_expo_worker_tokens";
const STORAGE_KEY_LOGS = "tradeflow_expo_push_logs";

// Default demo tokens (users can overwrite with their actual Expo Go token)
const DEFAULT_MANAGER_TOKEN = "ExponentPushToken[tradeflow-manager-admin-01]";
const DEFAULT_WORKER_TOKENS: Record<string, string> = {
  W001: "ExponentPushToken[raju-more-worker-w001]",
  W002: "ExponentPushToken[suresh-kamble-worker-w002]",
  W003: "ExponentPushToken[dinesh-jadhav-worker-w003]",
  W004: "ExponentPushToken[kiran-pawar-worker-w004]",
};

export function getManagerPushToken(): string {
  if (typeof window === "undefined") return DEFAULT_MANAGER_TOKEN;
  return localStorage.getItem(STORAGE_KEY_MANAGER_TOKEN) || DEFAULT_MANAGER_TOKEN;
}

export function setManagerPushToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MANAGER_TOKEN, token.trim());
}

export function getWorkerPushToken(workerId: string): string {
  if (typeof window === "undefined") return DEFAULT_WORKER_TOKENS[workerId] || "ExponentPushToken[worker-default]";
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKER_TOKENS);
    const map = raw ? JSON.parse(raw) : DEFAULT_WORKER_TOKENS;
    return map[workerId] || DEFAULT_WORKER_TOKENS[workerId] || `ExponentPushToken[${workerId.toLowerCase()}-demo]`;
  } catch {
    return DEFAULT_WORKER_TOKENS[workerId] || "ExponentPushToken[worker-default]";
  }
}

export function setWorkerPushToken(workerId: string, token: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKER_TOKENS);
    const map = raw ? JSON.parse(raw) : { ...DEFAULT_WORKER_TOKENS };
    map[workerId] = token.trim();
    localStorage.setItem(STORAGE_KEY_WORKER_TOKENS, JSON.stringify(map));
  } catch (err) {
    console.error("Failed to save worker push token:", err);
  }
}

export function getPushDispatchLogs(): PushDispatchLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logPushDispatch(log: Omit<PushDispatchLog, "id" | "timestamp">): PushDispatchLog {
  const newLog: PushDispatchLog = {
    ...log,
    id: "push-log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const logs = getPushDispatchLogs();
      const updated = [newLog, ...logs].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
    } catch {}
  }

  return newLog;
}

/**
 * Sends a push notification through our Next.js API endpoint to Expo Push API
 */
export async function sendExpoPushNotification(
  message: ExpoPushMessage,
  recipientRole: "WORKER" | "MANAGER",
  recipientName: string
): Promise<{ success: boolean; ticket?: any; simulated?: boolean; error?: string }> {
  try {
    const res = await fetch("/api/notifications/expo-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    const data = await res.json();

    logPushDispatch({
      recipientRole,
      recipientName,
      pushToken: message.to,
      title: message.title,
      body: message.body,
      status: data.success ? (data.simulated ? "SIMULATED" : "DELIVERED") : "FAILED",
      ticketId: data.ticket?.id || (data.simulated ? `sim-ticket-${Date.now()}` : undefined),
      error: data.error,
    });

    return data;
  } catch (err: any) {
    console.warn("Direct push fetch fallback to client simulation:", err);

    logPushDispatch({
      recipientRole,
      recipientName,
      pushToken: message.to,
      title: message.title,
      body: message.body,
      status: "SIMULATED",
      ticketId: `client-sim-${Date.now()}`,
    });

    return {
      success: true,
      simulated: true,
      ticket: { id: `sim-${Date.now()}`, status: "ok" },
    };
  }
}

/**
 * 1. Manager -> Worker: Notify worker when new task is allocated
 */
export async function notifyWorkerTaskAllocated({
  workerId,
  workerName,
  orderNo,
  customerName,
  itemCount,
  godown,
}: {
  workerId: string;
  workerName: string;
  orderNo: string;
  customerName: string;
  itemCount: number;
  godown: string;
}) {
  const token = getWorkerPushToken(workerId);
  return sendExpoPushNotification(
    {
      to: token,
      title: `📦 New Task Assigned: Order ${orderNo}`,
      body: `${orderNo} (${customerName}) — ${itemCount} item(s) to pick from ${godown}. Due today.`,
      data: {
        type: "ORDER_ALLOCATED",
        orderNo,
        workerId,
        workerName,
        godown,
        url: "/worker/tasks",
      },
      sound: "default",
      priority: "high",
      channelId: "worker-tasks",
    },
    "WORKER",
    workerName
  );
}

/**
 * 2. Worker -> Manager: Notify manager when worker completes task
 */
export async function notifyManagerTaskCompleted({
  workerName,
  orderNo,
  customerName,
  orderId,
}: {
  workerName: string;
  orderNo: string;
  customerName: string;
  orderId?: string;
}) {
  const token = getManagerPushToken();
  return sendExpoPushNotification(
    {
      to: token,
      title: `✅ Picking Completed: Order ${orderNo}`,
      body: `${workerName} has finished picking all items for ${customerName} (${orderNo}). Ready for packing & dispatch.`,
      data: {
        type: "TASK_COMPLETE",
        orderNo,
        orderId,
        workerName,
        url: orderId ? `/orders/${orderId}` : "/dispatch/ready",
      },
      sound: "default",
      priority: "high",
      channelId: "manager-alerts",
    },
    "MANAGER",
    "Manager (Amit Sharma)"
  );
}

/**
 * Worker -> Manager: Notify manager about physical low stock reported from racks
 */
export async function notifyManagerLowStockReported({
  workerName,
  itemName,
  location,
  orderNo,
}: {
  workerName: string;
  itemName: string;
  location: string;
  orderNo: string;
}) {
  const token = getManagerPushToken();
  return sendExpoPushNotification(
    {
      to: token,
      title: `⚠️ Stock Shortage Reported in Racks`,
      body: `${workerName} reported critical shortage for ${itemName} at Rack ${location} while fulfilling ${orderNo}.`,
      data: {
        type: "LOW_STOCK_ALERT",
        orderNo,
        workerName,
        itemName,
        location,
        url: "/inventory/stock",
      },
      sound: "default",
      priority: "high",
      channelId: "manager-alerts",
    },
    "MANAGER",
    "Manager (Amit Sharma)"
  );
}
