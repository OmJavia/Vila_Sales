import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "NEW_ORDER"
  | "STOCK_LOW"
  | "STOCK_OUT"
  | "TASK_COMPLETE"
  | "ORDER_ALLOCATED"
  | "LOW_STOCK_ALERT"
  | "ABANDONED_CART";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: NotificationSeverity;
  entityId?: string;
  entityType?: "ORDER" | "ITEM" | "TASK" | "WORKER";
  href?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (n) => {
        const notification: AppNotification = {
          ...n,
          id: "notif-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
        }));
      },
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
    }),
    { name: "vilasales-notifications" }
  )
);
