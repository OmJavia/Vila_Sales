"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/data";
import {
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  Settings,
  Zap,
} from "lucide-react";

const TYPE_CONFIG = {
  ORDER: { icon: ShoppingCart, color: "text-[#2563EB]", bg: "bg-[#DBEAFE]" },
  STOCK: { icon: Package, color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
  DISPATCH: { icon: Truck, color: "text-[#16A34A]", bg: "bg-[#DCFCE7]" },
  PAYMENT: { icon: CreditCard, color: "text-[#16A34A]", bg: "bg-[#DCFCE7]" },
  COMPLAINT: { icon: AlertCircle, color: "text-[#DC2626]", bg: "bg-[#FEE2E2]" },
  SYSTEM: { icon: Zap, color: "text-[#666666]", bg: "bg-[#F7F7F7]" },
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
  maxItems?: number;
}

export function ActivityTimeline({ events, className, maxItems }: ActivityTimelineProps) {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  return (
    <div className={cn("space-y-0", className)}>
      {displayEvents.map((event, index) => {
        const config = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.SYSTEM;
        const Icon = config.icon;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.16,
              delay: Math.min(index, 4) * 0.04,
              ease: "easeOut",
            }}
            className="flex gap-3 pb-4 last:pb-0 relative"
          >
            {/* Vertical line */}
            {index < displayEvents.length - 1 && (
              <div className="absolute left-[13px] top-7 bottom-0 w-px bg-[#EAEAEA]" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                config.bg
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-sm text-[#111111] leading-snug">{event.description}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#666666] font-medium">{event.user}</span>
                <span className="text-[#EAEAEA]">·</span>
                <span className="text-[11px] text-[#999999]">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
