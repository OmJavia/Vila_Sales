"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  X,
  FileCheck,
  PackagePlus,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useNotificationStore } from "@/lib/notificationStore";

interface SalesReturn {
  id: string;
  cnNo: string;
  customerName: string;
  date: string;
  orderNo: string;
  amount: number;
  reason: string;
  stockRestocked: boolean;
  status: "APPROVED" | "PENDING_QC" | "REJECTED";
}

const SAMPLE_RETURNS: SalesReturn[] = [
  {
    id: "SR-01",
    cnNo: "CN-2026-012",
    customerName: "Metro Hardware Co.",
    date: "2026-09-27",
    orderNo: "#1046",
    amount: 1120,
    reason: "Thread plating surface defect (2 boxes)",
    stockRestocked: false,
    status: "PENDING_QC",
  },
  {
    id: "SR-02",
    cnNo: "CN-2026-011",
    customerName: "Sunrise Traders",
    date: "2026-09-18",
    orderNo: "#1038",
    amount: 3500,
    reason: "Excess ordered by contractor, returned in sealed condition",
    stockRestocked: true,
    status: "APPROVED",
  },
  {
    id: "SR-03",
    cnNo: "CN-2026-010",
    customerName: "ABC Industries Pvt. Ltd.",
    date: "2026-09-10",
    orderNo: "#1032",
    amount: 2400,
    reason: "Damaged packaging in transit; rejected at site gate",
    stockRestocked: false,
    status: "REJECTED",
  },
];

export default function ReturnsPage() {
  const [returns, setReturns] = useState<SalesReturn[]>(SAMPLE_RETURNS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showNewModal, setShowNewModal] = useState(false);

  // New Return form states
  const [newCustomer, setNewCustomer] = useState("ABC Industries Pvt. Ltd.");
  const [newOrderNo, setNewOrderNo] = useState("#1048");
  const [newAmount, setNewAmount] = useState<number>(2400);
  const [newReason, setNewReason] = useState("Excess delivered from site");

  const toast = useToast();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const filtered = returns.filter((r) => {
    const matchesSearch =
      r.cnNo.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveAndRestock = (returnId: string) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? { ...r, status: "APPROVED", stockRestocked: true }
          : r
      )
    );

    const ret = returns.find((r) => r.id === returnId);
    if (ret) {
      toast.success(
        "Return Approved & Restocked",
        `Credit Note ${ret.cnNo} issued for ${formatCurrency(ret.amount)}.`
      );
      addNotification({
        type: "STOCK_LOW",
        title: `Return Restocked: ${ret.cnNo}`,
        message: `${ret.customerName} return for Order ${ret.orderNo} accepted into warehouse. Credit note posted.`,
        severity: "INFO",
        href: "/returns",
      });
    }
  };

  const handleRejectReturn = (returnId: string) => {
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? { ...r, status: "REJECTED" }
          : r
      )
    );

    const ret = returns.find((r) => r.id === returnId);
    if (ret) {
      toast.error("Return Rejected", `Credit note request ${ret.cnNo} was marked rejected.`);
    }
  };

  const handleCreateReturn = () => {
    const newCnNo = `CN-2026-${String(returns.length + 13).padStart(3, "0")}`;
    const newReturn: SalesReturn = {
      id: `SR-${Date.now()}`,
      cnNo: newCnNo,
      customerName: newCustomer,
      date: new Date().toISOString().split("T")[0],
      orderNo: newOrderNo,
      amount: newAmount,
      reason: newReason,
      stockRestocked: false,
      status: "PENDING_QC",
    };

    setReturns([newReturn, ...returns]);

    addNotification({
      type: "STOCK_LOW",
      title: `New Return Logged: ${newCnNo}`,
      message: `${newCustomer} logged return for ${newOrderNo} (${formatCurrency(newAmount)}). QC inspection required.`,
      severity: "WARNING",
      href: "/returns",
    });

    toast.success("Return Created", `Return ${newCnNo} logged for QC inspection.`);
    setShowNewModal(false);
  };

  const totalCreditIssued = returns
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sales Returns & Credit Notes</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage goods returned from customers, QC defect verification, and GST credit note generation.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Sales Return
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">Pending QC Verification</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">
              {returns.filter((r) => r.status === "PENDING_QC").length} Returns
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">Approved Credit Notes</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {returns.filter((r) => r.status === "APPROVED").length} Approved
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">Total Credit Value Issued</div>
            <div className="text-lg font-bold text-text-primary mt-0.5">
              {formatCurrency(totalCreditIssued)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search CN #, customer, or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "PENDING_QC", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === st
                  ? "bg-brand-primary text-white"
                  : "bg-bg-canvas text-text-secondary hover:bg-hover border border-border"
              }`}
            >
              {st === "ALL" ? "All Returns" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Credit Note #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Order Ref</th>
              <th className="p-3">Reason</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3 text-center">Restocked</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((ret) => (
              <tr key={ret.id} className="hover:bg-hover/50">
                <td className="p-3 font-mono font-semibold text-brand-primary">{ret.cnNo}</td>
                <td className="p-3 font-medium text-text-primary">{ret.customerName}</td>
                <td className="p-3 font-mono text-text-muted">{formatDate(ret.date)}</td>
                <td className="p-3 font-mono text-text-secondary">{ret.orderNo}</td>
                <td className="p-3 text-text-secondary max-w-[200px] truncate" title={ret.reason}>
                  {ret.reason}
                </td>
                <td className="p-3 text-right font-mono font-semibold">
                  {formatCurrency(ret.amount)}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      ret.stockRestocked ? "badge-ok" : "badge-normal text-text-muted"
                    }`}
                  >
                    {ret.stockRestocked ? "Restocked" : "In QC Yard"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`badge ${
                      ret.status === "APPROVED"
                        ? "badge-ok"
                        : ret.status === "PENDING_QC"
                        ? "badge-low"
                        : "badge-critical"
                    }`}
                  >
                    {ret.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3 text-right">
                  {ret.status === "PENDING_QC" ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleApproveAndRestock(ret.id)}
                        className="btn-primary text-[11px] py-1 px-2 flex items-center gap-1"
                        title="Approve QC and Restock Inventory"
                      >
                        <PackagePlus className="w-3 h-3" />
                        Approve & Restock
                      </button>
                      <button
                        onClick={() => handleRejectReturn(ret.id)}
                        className="btn-secondary text-[11px] py-1 px-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                        title="Reject Return"
                      >
                        Reject
                      </button>
                    </div>
                  ) : ret.status === "APPROVED" ? (
                    <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      CN Dispatched
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-600 font-medium inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Return Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-primary" />
                  Log Sales Return & Credit Note
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Record returned inventory from client for QC testing and credit note issuance.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Customer Name</label>
                <input
                  type="text"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Linked Order / Invoice #</label>
                <input
                  type="text"
                  value={newOrderNo}
                  onChange={(e) => setNewOrderNo(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Credit Note Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Reason for Return</label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Surface coating defects, packaging damaged, excess material ordered"
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowNewModal(false)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReturn}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Submit Return to QC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
