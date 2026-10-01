"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  onDismiss: (id: string) => void;
}

const TOAST_CONFIG = {
  success: { icon: CheckCircle, bg: "bg-white border-l-4 border-l-[#16A34A]", iconColor: "text-[#16A34A]" },
  error: { icon: AlertCircle, bg: "bg-white border-l-4 border-l-[#DC2626]", iconColor: "text-[#DC2626]" },
  warning: { icon: AlertTriangle, bg: "bg-white border-l-4 border-l-[#D97706]", iconColor: "text-[#D97706]" },
  info: { icon: Info, bg: "bg-white border-l-4 border-l-[#2563EB]", iconColor: "text-[#2563EB]" },
};

export function Toast({ id, type, title, message, onDismiss }: ToastProps) {
  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ y: 16, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-sm border border-[#EAEAEA] max-w-sm",
        config.bg
      )}
    >
      <Icon className={cn("w-4.5 h-4.5 flex-shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#111111]">{title}</div>
        {message && <div className="text-xs text-[#666666] mt-0.5">{message}</div>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-[#999999] hover:text-[#111111] transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// Toast container
import { create } from "zustand";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const { add } = useToastStore();
  return {
    success: (title: string, message?: string) => add({ type: "success", title, message }),
    error: (title: string, message?: string) => add({ type: "error", title, message }),
    warning: (title: string, message?: string) => add({ type: "warning", title, message }),
    info: (title: string, message?: string) => add({ type: "info", title, message }),
  };
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
