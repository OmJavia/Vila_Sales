"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/data";

const STATUS_CONFIG: Record<
  OrderStatus | string,
  { label: string; className: string; dot?: string }
> = {
  DRAFT: { label: "Draft", className: "bg-[#F7F7F7] text-[#666666] border border-[#EAEAEA]" },
  CONFIRMED: { label: "Confirmed", className: "bg-[#DBEAFE] text-[#2563EB]" },
  STOCK_CHECK: { label: "Stock Check", className: "bg-[#FEF3C7] text-[#D97706]" },
  PURCHASE_REQUIRED: { label: "Purchase Req.", className: "bg-[#FEE2E2] text-[#DC2626]" },
  ALLOCATED: { label: "Allocated", className: "bg-[#DBEAFE] text-[#2563EB]" },
  VERIFIED: { label: "Verified", className: "bg-[#DCFCE7] text-[#16A34A]" },
  CHALLAN_READY: { label: "Challan Ready", className: "bg-[#DCFCE7] text-[#16A34A]" },
  DISPATCHED: { label: "Dispatched", className: "bg-[#DCFCE7] text-[#16A34A]" },
  INVOICED: { label: "Invoiced", className: "bg-[#FEF3C7] text-[#D97706]" },
  PAYMENT_DONE: { label: "Payment Done", className: "bg-[#DCFCE7] text-[#16A34A]" },
  CLOSED: { label: "Closed", className: "bg-[#F7F7F7] text-[#666666]" },
  CANCELLED: { label: "Cancelled", className: "bg-[#FEE2E2] text-[#DC2626]" },
  // Stock
  OK: { label: "In Stock", className: "bg-[#DCFCE7] text-[#16A34A]" },
  LOW: { label: "Low Stock", className: "bg-[#FEF3C7] text-[#D97706]" },
  CRITICAL: { label: "Critical", className: "bg-[#FEE2E2] text-[#DC2626]" },
  OUT: { label: "Out of Stock", className: "bg-[#FEE2E2] text-[#DC2626]" },
  // Payment
  PENDING: { label: "Pending", className: "bg-[#FEF3C7] text-[#D97706]" },
  PARTIAL: { label: "Partial", className: "bg-[#DBEAFE] text-[#2563EB]" },
  PAID: { label: "Paid", className: "bg-[#DCFCE7] text-[#16A34A]" },
  OVERDUE: { label: "Overdue", className: "bg-[#FEE2E2] text-[#DC2626]" },
  // Priority
  NORMAL: { label: "Normal", className: "bg-[#F7F7F7] text-[#666666] border border-[#EAEAEA]" },
  HIGH: { label: "High", className: "bg-[#FEF3C7] text-[#D97706]" },
  URGENT: { label: "Urgent", className: "bg-[#FEE2E2] text-[#DC2626]" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-[#F7F7F7] text-[#666666]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide",
        config.className,
        className
      )}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {config.label}
    </span>
  );
}
