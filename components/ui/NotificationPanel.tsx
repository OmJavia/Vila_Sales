"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  CheckCheck,
  ShoppingCart,
  AlertTriangle,
  Package,
  CheckCircle2,
  Info,
  Trash2,
  ChevronRight,
  PhoneCall,
} from "lucide-react";
import { useNotificationStore, AppNotification, NotificationType } from "@/lib/notificationStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function typeIcon(type: NotificationType) {
  switch (type) {
    case "NEW_ORDER": return ShoppingCart;
    case "STOCK_LOW": return AlertTriangle;
    case "STOCK_OUT": return AlertTriangle;
    case "TASK_COMPLETE": return CheckCircle2;
    case "ORDER_ALLOCATED": return Package;
    case "LOW_STOCK_ALERT": return AlertTriangle;
    case "ABANDONED_CART": return PhoneCall;
    default: return Info;
  }
}

function severityStyles(severity: AppNotification["severity"]) {
  switch (severity) {
    case "CRITICAL": return "bg-red-50 border-red-200 text-red-700";
    case "WARNING": return "bg-amber-50 border-amber-200 text-amber-700";
    case "SUCCESS": return "bg-green-50 border-green-200 text-green-700";
    default: return "bg-blue-50 border-blue-200 text-blue-700";
  }
}

function iconBg(severity: AppNotification["severity"]) {
  switch (severity) {
    case "CRITICAL": return "bg-red-100 text-red-600";
    case "WARNING": return "bg-amber-100 text-amber-600";
    case "SUCCESS": return "bg-green-100 text-green-600";
    default: return "bg-blue-100 text-blue-600";
  }
}

function NotificationItem({ n, onClose }: { n: AppNotification; onClose: () => void }) {
  const router = useRouter();
  const { markAsRead, removeNotification } = useNotificationStore();
  const Icon = typeIcon(n.type);

  const handleClick = () => {
    markAsRead(n.id);
    if (n.href) {
      router.push(n.href);
      onClose();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative flex gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
        n.isRead ? "bg-white border-[#EAEAEA] opacity-60" : severityStyles(n.severity),
        "hover:scale-[1.01] hover:shadow-sm"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", iconBg(n.severity))}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-[13px] font-semibold leading-tight", n.isRead ? "text-[#666]" : "text-[#111]")}>
            {n.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
              className="p-0.5 rounded text-[#999] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <p className={cn("text-xs mt-0.5 leading-relaxed", n.isRead ? "text-[#999]" : "text-[#444]")}>
          {n.message}
        </p>

        {n.type === "ABANDONED_CART" && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded shadow-xs transition-colors">
              <PhoneCall className="w-3 h-3" /> Call Customer Now
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-[#999]">
            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
          </span>
          {n.href && (
            <span className="text-[10px] font-semibold text-[#666] flex items-center gap-0.5">
              View <ChevronRight className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
    </motion.div>
  );
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markAllAsRead, clearAll, unreadCount } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const unread = unreadCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-[52px] right-3 sm:right-4 w-[calc(100vw-24px)] sm:w-[400px] max-h-[calc(100vh-80px)] bg-white rounded-xl shadow-2xl border border-[#EAEAEA] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA] flex-shrink-0 bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#111]" />
                <span className="text-sm font-bold text-[#111]">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#666] hover:text-[#111] font-medium flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[11px] text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded text-[#999] hover:text-[#111] hover:bg-[#F0F0F0] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-[#CCC]" />
                  </div>
                  <p className="text-sm font-medium text-[#999]">All caught up!</p>
                  <p className="text-xs text-[#CCC] mt-1">No new notifications</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <NotificationItem key={n.id} n={n} onClose={onClose} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#EAEAEA] px-4 py-2.5 bg-[#FAFAFA] flex items-center justify-between text-[11px] text-[#999] flex-shrink-0">
              <span>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · {unread} unread
              </span>
              <button
                onClick={() => {
                  router.push("/notifications/test");
                  onClose();
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>⚡ Expo Tester</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Bell button with badge — used in TopBar
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unread = mounted ? unreadCount() : 0;

  return (
    <>
      <button
        id="notification-bell"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-150",
          isOpen
            ? "bg-[#111] text-white"
            : "text-[#666] hover:text-[#111] hover:bg-[#F0F0F0]"
        )}
        title="Notifications"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <motion.span
            key={unread}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>
      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
