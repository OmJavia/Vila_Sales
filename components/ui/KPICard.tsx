"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  delta?: { value: number; label: string };
  href?: string;
  className?: string;
  icon?: React.ReactNode;
  urgency?: "normal" | "warning" | "danger";
}

function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

export function KPICard({
  label,
  value,
  isCurrency,
  delta,
  href,
  className,
  icon,
  urgency = "normal",
}: KPICardProps) {
  const displayValue = useCountUp(value);
  const router = useRouter();

  const urgencyStyles = {
    normal: "border-[#EAEAEA]",
    warning: "border-l-4 border-l-[#D97706] border-[#EAEAEA]",
    danger: "border-l-4 border-l-[#DC2626] border-[#EAEAEA]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={() => href && router.push(href)}
      className={cn(
        "card p-4 cursor-pointer select-none",
        urgencyStyles[urgency],
        href && "hover:shadow-sm transition-shadow duration-150",
        className
      )}
      whileHover={{ scale: href ? 0.99 : 1 }}
      whileTap={{ scale: href ? 0.985 : 1 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="kpi-number tabular-nums">
            {isCurrency ? (
              <>₹{displayValue >= 100000
                ? `${(displayValue / 100000).toFixed(1)}L`
                : displayValue >= 1000
                ? `${(displayValue / 1000).toFixed(0)}K`
                : displayValue}
              </>
            ) : (
              displayValue
            )}
          </div>
          <div className="text-[11px] font-medium text-[#666666] mt-0.5">{label}</div>
          {delta && (
            <div className={cn(
              "text-[10px] font-semibold mt-1",
              delta.value > 0 ? "text-[#DC2626]" : "text-[#16A34A]"
            )}>
              {delta.value > 0 ? "↑" : "↓"} {Math.abs(delta.value)} {delta.label}
            </div>
          )}
        </div>
        {icon && (
          <div className="text-[#EAEAEA] mt-0.5">{icon}</div>
        )}
      </div>
    </motion.div>
  );
}
