"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  requireReason?: boolean;
  destructive?: boolean;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  requireReason = false,
  destructive = false,
  loading = false,
}: ConfirmModalProps) {
  const [reason, setReason] = useState("");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-3">
                  {destructive ? (
                    <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#DC2626]" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-[#111111]">{title}</h3>
                    <p className="text-sm text-[#666666] mt-1">{description}</p>
                  </div>
                </div>

                {requireReason && (
                  <div className="mt-4">
                    <label className="text-label text-[#111111] mb-1.5 block">
                      Reason <span className="text-[#DC2626]">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe the reason..."
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] border border-[#EAEAEA] rounded-md hover:bg-[#F7F7F7] transition-colors duration-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onConfirm(reason)}
                  disabled={loading || (requireReason && !reason.trim())}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-md transition-all duration-100 disabled:opacity-50",
                    destructive
                      ? "bg-[#DC2626] text-white hover:bg-[#b91c1c]"
                      : "bg-[#111111] text-white hover:bg-[#333333]"
                  )}
                >
                  {loading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
