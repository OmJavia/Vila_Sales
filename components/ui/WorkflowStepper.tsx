"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowStep } from "@/lib/data";

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  className?: string;
}

export function WorkflowStepper({ steps, className }: WorkflowStepperProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          {/* Step node */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              {step.status === "COMPLETED" ? (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
              ) : step.status === "CURRENT" ? (
                <div className="relative w-7 h-7 rounded-full border-2 border-[#111111] bg-white flex items-center justify-center ring-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-[#EAEAEA] bg-white" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold whitespace-nowrap",
                step.status === "COMPLETED" ? "text-[#111111]" :
                step.status === "CURRENT" ? "text-[#111111]" :
                "text-[#999999]"
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connecting line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 mt-[-14px] bg-[#EAEAEA] relative">
              {step.status === "COMPLETED" && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.08 }}
                  className="absolute inset-0 bg-[#111111] origin-left"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
