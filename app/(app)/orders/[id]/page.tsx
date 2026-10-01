"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MoreHorizontal,
  Edit,
  Printer,
  XCircle,
  History,
  AlertTriangle,
  Check,
  ArrowRight,
  Package,
  FileText,
  Activity,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  Info,
} from "lucide-react";
import { fetchOrder, ORDER_ACTIVITY, type OrderStatus, type Order } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkflowStepper } from "@/components/ui/WorkflowStepper";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { sleep } from "@/lib/utils";

// Primary action config per status
const PRIMARY_ACTIONS: Record<OrderStatus, { label: string; nextStatus: OrderStatus } | null> = {
  DRAFT: { label: "Confirm Order", nextStatus: "CONFIRMED" },
  CONFIRMED: { label: "Check Stock", nextStatus: "STOCK_CHECK" },
  STOCK_CHECK: { label: "Allocate Stock", nextStatus: "ALLOCATED" },
  PURCHASE_REQUIRED: { label: "Mark Purchase Received", nextStatus: "ALLOCATED" },
  ALLOCATED: { label: "Start Physical Verification", nextStatus: "VERIFIED" },
  VERIFIED: { label: "Generate Final Challan", nextStatus: "CHALLAN_READY" },
  CHALLAN_READY: { label: "Dispatch Order", nextStatus: "DISPATCHED" },
  DISPATCHED: { label: "Create Invoice", nextStatus: "INVOICED" },
  INVOICED: { label: "Record Payment", nextStatus: "PAYMENT_DONE" },
  PAYMENT_DONE: { label: "Close Order", nextStatus: "CLOSED" },
  CLOSED: null,
  CANCELLED: null,
};

const TABS = [
  { id: "items", label: "Items", icon: Package },
  { id: "stock", label: "Stock Availability", icon: BarChart3 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "timeline", label: "Activity Timeline", icon: Activity },
  { id: "notes", label: "Notes", icon: MessageSquare },
  { id: "approvals", label: "Approvals", icon: ShieldCheck },
];

interface OrderDetailProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("items");
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReinitializeModal, setShowReinitializeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState<OrderStatus | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => fetchOrder(params.id),
  });

  const currentStatus = (localStatus ?? order?.status) as OrderStatus;
  const primaryAction = currentStatus ? PRIMARY_ACTIONS[currentStatus] : null;

  const handlePrimaryAction = async () => {
    if (!primaryAction || !order) return;
    setActionLoading(true);
    await sleep(600);

    if (primaryAction.nextStatus === "INVOICED") {
      try {
        const invoiceNo = `INV/26-27/0${Math.floor(480 + Math.random() * 30)}`;
        const taxable = order.totalAmount ? Math.round(order.totalAmount / 1.18) : 50000;
        const halfGst = Math.round(taxable * 0.09);
        const invoicePayload = {
          id: `INV-${order.id}`,
          invoiceNo,
          orderNo: order.orderNo,
          customerId: order.customerId,
          customerName: order.customerName,
          customerGstin: "27AABCA1234F1Z9",
          customerAddress: "MIDC Industrial Area, Turbhe, Navi Mumbai",
          customerCity: "Navi Mumbai",
          customerState: "Maharashtra",
          customerStateCode: "27",
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          placeOfSupply: "27 - Maharashtra",
          ewayBillNo: "241829019284",
          vehicleNo: "MH-04-AR-2201",
          transporter: "V-Trans Logistics",
          taxableAmount: taxable,
          cgst: halfGst,
          sgst: halfGst,
          igst: 0,
          totalAmount: order.totalAmount || 59000,
          paymentStatus: "PENDING",
          amountReceived: 0,
          items: (order.items || []).map((it, idx) => {
            const quantity = it.qtyOrdered || 1;
            return {
              id: `LI-${idx + 1}`,
              itemCode: it.itemCode,
              itemName: it.itemName,
              hsnCode: "73181500",
              qty: quantity,
              unit: it.unit || "Pcs",
              rate: it.rate,
              discountPct: 0,
              taxableAmount: quantity * it.rate,
              gstRate: 18,
              cgstAmount: Math.round(quantity * it.rate * 0.09),
              sgstAmount: Math.round(quantity * it.rate * 0.09),
              igstAmount: 0,
              totalAmount: Math.round(quantity * it.rate * 1.18),
            };
          }),
        };

        await fetch("/api/invoices/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice: invoicePayload,
            recipientEmail: "omjavia18@gmail.com",
            notes: `Auto-generated upon dispatch for Order ${order.orderNo}`,
          }),
        });

        toast.success(
          "Tax Invoice Created & Emailed",
          `Invoice ${invoiceNo} generated & copy emailed to omjavia18@gmail.com`
        );
      } catch (e) {
        console.error("Auto email error:", e);
      }
    } else {
      toast.success(`Status updated to ${primaryAction.nextStatus.replace(/_/g, " ")}`);
    }

    setLocalStatus(primaryAction.nextStatus);
    setActionLoading(false);
  };

  const handleCancel = async (reason?: string) => {
    setActionLoading(true);
    await sleep(500);
    setLocalStatus("CANCELLED");
    setCancelReason(reason || "No reason provided");
    setShowCancelModal(false);
    setActionLoading(false);
    toast.warning("Order cancelled", reason || "Order has been cancelled.");
  };

  const handleReinitialize = async () => {
    setActionLoading(true);
    await sleep(700);
    setLocalStatus("DRAFT");
    setCancelReason("");
    setShowReinitializeModal(false);
    setActionLoading(false);
    toast.success(
      "Order Reinstated",
      `Order ${order?.orderNo} has been reinstated to DRAFT and is ready for reconfirmation.`
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1100px] mx-auto py-20 text-center">
        <AlertTriangle className="w-10 h-10 text-[#999999] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-[#111111]">Order not found</h2>
        <button onClick={() => router.push("/orders")} className="mt-4 text-sm text-[#666666] underline">
          Back to orders
        </button>
      </div>
    );
  }

  // Rebuild workflow with local status override
  const displayOrder = localStatus
    ? { ...order, status: localStatus, workflow: rebuildWorkflow(localStatus) }
    : order;

  return (
    <div className="max-w-[1100px] mx-auto space-y-0">
      {/* Sticky Header */}
      <div className="bg-white border border-[#EAEAEA] rounded-t-lg shadow-xs">
        {/* Top row */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-[#EAEAEA]">
          <button
            onClick={() => router.push("/orders")}
            className="p-1.5 rounded hover:bg-[#F7F7F7] transition-colors duration-100 text-[#666666]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#111111] tracking-tight font-mono">
              Order {order.orderNo}
            </h1>
            <span className="text-[#999999]">·</span>
            <span className="text-base font-semibold text-[#111111]">
              {order.customerName}
            </span>
            <span className="text-[#999999]">·</span>
            <span className="text-sm text-[#666666]">{formatDate(order.orderDate)}</span>
            <StatusBadge status={currentStatus} />
            <StatusBadge status={order.priority} />
          </div>

          <div className="flex items-center gap-2">
            {/* Primary action button */}
            {primaryAction && (
              <motion.button
                onClick={handlePrimaryAction}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-semibold rounded-md hover:bg-[#333333] transition-colors duration-100 disabled:opacity-60"
                whileHover={{ scale: 0.985 }}
                whileTap={{ scale: 0.972 }}
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {primaryAction.label}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}

            {/* Overflow menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md border border-[#EAEAEA] hover:bg-[#F7F7F7] transition-colors duration-100"
              >
                <MoreHorizontal className="w-4 h-4 text-[#666666]" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#EAEAEA] rounded-lg shadow-sm z-20 py-1 overflow-hidden"
                    >
                      {[
                        { icon: Edit, label: "Edit Order", onClick: () => {} },
                        { icon: Printer, label: "Print / PDF", onClick: () => {} },
                        { icon: History, label: "View History", onClick: () => setActiveTab("timeline") },
                        null, // divider
                        currentStatus === "CANCELLED"
                        ? { icon: RotateCcw, label: "Reinitialize Order", onClick: () => { setShowMenu(false); setShowReinitializeModal(true); }, destructive: false }
                        : { icon: XCircle, label: "Cancel Order", onClick: () => { setShowMenu(false); setShowCancelModal(true); }, destructive: true },
                      ].map((item, i) =>
                        item === null ? (
                          <div key={i} className="border-t border-[#EAEAEA] my-1" />
                        ) : (
                          <button
                            key={i}
                            onClick={() => { item.onClick(); setShowMenu(false); }}
                            className={cn(
                              "flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[#F7F7F7] transition-colors duration-100 text-left",
                              item.destructive ? "text-[#DC2626]" : "text-[#111111]"
                            )}
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.label}
                          </button>
                        )
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Cancelled banner */}
        {currentStatus === "CANCELLED" && (
          <div className="mx-5 mt-4 mb-1 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-red-700">This order has been cancelled</div>
              {cancelReason && (
                <div className="text-xs text-red-600 mt-0.5">
                  Reason: <span className="italic">{cancelReason}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowReinitializeModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reinitialize Order
            </button>
          </div>
        )}

        {/* Workflow stepper */}
        <div className="px-8 py-5">
          <WorkflowStepper steps={displayOrder.workflow} />
        </div>

        {/* Order summary strip */}
        <div className="grid grid-cols-4 border-t border-[#EAEAEA]">
          {[
            { label: "Order Date", value: formatDate(order.orderDate) },
            { label: "Delivery Date", value: formatDate(order.deliveryDate) },
            { label: "Total Amount", value: `₹${order.totalAmount.toLocaleString("en-IN")}` },
            { label: "Assigned To", value: order.assignedTo },
          ].map((item, i) => (
            <div key={i} className={cn(
              "px-5 py-3",
              i < 3 && "border-r border-[#EAEAEA]"
            )}>
              <div className="text-label text-[#999999]">{item.label}</div>
              <div className="text-sm font-semibold text-[#111111] mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[#EAEAEA] px-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#666666] hover:text-[#111111]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white border-x border-b border-[#EAEAEA] rounded-b-lg shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "items" && <ItemsTab order={displayOrder} />}
            {activeTab === "stock" && <StockTab order={displayOrder} />}
            {activeTab === "documents" && <DocumentsTab />}
            {activeTab === "timeline" && <TimelineTab />}
            {activeTab === "notes" && <NotesTab order={displayOrder} />}
            {activeTab === "approvals" && <ApprovalsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cancel modal */}
      <ConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description={`Order ${order.orderNo} for ${order.customerName} will be cancelled. Stock allocations will be released. You can reinstate this order from DRAFT at any time.`}
        confirmLabel="Cancel Order"
        requireReason
        destructive
        loading={actionLoading}
      />

      {/* Reinitialize modal */}
      <ConfirmModal
        open={showReinitializeModal}
        onClose={() => setShowReinitializeModal(false)}
        onConfirm={handleReinitialize}
        title="Reinitialize this order?"
        description={`Order ${order.orderNo} for ${order.customerName} will be restored to DRAFT status. All previous stock allocations were released on cancellation — you will need to re-allocate stock and re-confirm the order.`}
        confirmLabel="Yes, Reinstate to Draft"
        destructive={false}
        loading={actionLoading}
      />
    </div>
  );
}

// ─── Tab components ────────────────────────────────────────────────────────────

function ItemsTab({ order }: { order: Order }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Code</th>
            <th className="text-right">Qty Ordered</th>
            <th className="text-right">Available</th>
            <th className="text-right">Reserved</th>
            <th className="text-right">Allocated</th>
            <th className="text-right">Short</th>
            <th className="text-right">Rate</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.itemId}>
              <td>
                <div className="text-sm font-medium text-[#111111]">{item.itemName}</div>
              </td>
              <td>
                <span className="font-mono text-xs text-[#666666]">{item.itemCode}</span>
              </td>
              <td className="text-right tabular-nums text-sm">{item.qtyOrdered} {item.unit}</td>
              <td className="text-right tabular-nums text-sm">
                <span className={cn(
                  item.qtyAvailable >= item.qtyOrdered ? "text-[#16A34A]" : "text-[#DC2626]"
                )}>
                  {item.qtyAvailable}
                </span>
              </td>
              <td className="text-right tabular-nums text-sm text-[#666666]">{item.qtyReserved}</td>
              <td className="text-right tabular-nums text-sm text-[#2563EB]">{item.qtyAllocated}</td>
              <td className="text-right tabular-nums text-sm">
                {item.qtyShort > 0 ? (
                  <span className="text-[#DC2626] font-semibold">{item.qtyShort}</span>
                ) : (
                  <span className="text-[#16A34A]">0</span>
                )}
              </td>
              <td className="text-right tabular-nums text-sm text-[#666666]">
                ₹{item.rate.toLocaleString("en-IN")}
              </td>
              <td className="text-right tabular-nums text-sm font-semibold text-[#111111]">
                ₹{item.amount.toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={8} className="px-3 py-3 text-right text-sm font-semibold text-[#111111]">
              Total
            </td>
            <td className="px-3 py-3 text-right text-base font-bold text-[#111111] tabular-nums">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tfoot>
      </table>

      {order.notes && (
        <div className="px-5 py-3 border-t border-[#EAEAEA] bg-[#FFFBF0]">
          <span className="text-label text-[#D97706]">Note: </span>
          <span className="text-sm text-[#666666]">{order.notes}</span>
        </div>
      )}
    </div>
  );
}

function StockTab({ order }: { order: Order }) {
  return (
    <div className="p-5 space-y-4">
      <div className="text-sm text-[#666666] mb-4">Physical stock availability per item at time of check</div>
      {order.items.map((item) => {
        const pct = Math.min((item.qtyAvailable / item.qtyOrdered) * 100, 100);
        const status = item.qtyAvailable >= item.qtyOrdered ? "OK" : item.qtyAvailable > 0 ? "LOW" : "OUT";
        return (
          <div key={item.itemId} className="border border-[#EAEAEA] rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-[#111111]">{item.itemName}</div>
                <div className="text-xs font-mono text-[#999999] mt-0.5">{item.itemCode}</div>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              {[
                { label: "Ordered", value: item.qtyOrdered, color: "text-[#111111]" },
                { label: "Available", value: item.qtyAvailable, color: item.qtyAvailable >= item.qtyOrdered ? "text-[#16A34A]" : "text-[#DC2626]" },
                { label: "Reserved", value: item.qtyReserved, color: "text-[#D97706]" },
                { label: "Short", value: item.qtyShort, color: item.qtyShort > 0 ? "text-[#DC2626]" : "text-[#16A34A]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#F7F7F7] rounded p-3">
                  <div className="text-label text-[#999999]">{stat.label}</div>
                  <div className={cn("text-xl font-bold tabular-nums mt-1", stat.color)}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Stock bar */}
            <div className="h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  status === "OK" ? "bg-[#16A34A]" : status === "LOW" ? "bg-[#D97706]" : "bg-[#DC2626]"
                )}
              />
            </div>
            <div className="text-xs text-[#999999] mt-1">{Math.round(pct)}% of order qty available</div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentsTab() {
  const docs = [
    { name: "Challan DC-1048", type: "Delivery Challan", date: "30 Sep 2026", status: "Generated" },
    { name: "Purchase Req. PR-1048", type: "Purchase Requirement", date: "30 Sep 2026", status: "Pending" },
  ];

  return (
    <div className="p-5">
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center gap-4 p-3 border border-[#EAEAEA] rounded-lg hover:bg-[#F7F7F7] transition-colors cursor-pointer">
            <FileText className="w-5 h-5 text-[#999999] flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#111111]">{doc.name}</div>
              <div className="text-xs text-[#999999]">{doc.type} · {doc.date}</div>
            </div>
            <StatusBadge status={doc.status === "Generated" ? "VERIFIED" : "PENDING"} />
          </div>
        ))}
      </div>

      {docs.length === 0 && (
        <div className="py-12 text-center text-[#999999] text-sm">
          No documents generated yet
        </div>
      )}
    </div>
  );
}

function TimelineTab() {
  return (
    <div className="p-5">
      <ActivityTimeline events={ORDER_ACTIVITY} />
    </div>
  );
}

function NotesTab({ order }: { order: Order }) {
  const [note, setNote] = useState("");
  const toast = useToast();

  return (
    <div className="p-5 space-y-4">
      {order.notes && (
        <div className="p-4 bg-[#FFFBF0] border border-[#FEF3C7] rounded-lg">
          <div className="text-label text-[#D97706] mb-1">Order Note</div>
          <div className="text-sm text-[#111111]">{order.notes}</div>
        </div>
      )}

      <div>
        <label className="text-label text-[#111111] mb-1.5 block">Add Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type a note about this order..."
          rows={3}
          className="input-field resize-none"
        />
        <button
          onClick={() => { toast.success("Note saved"); setNote(""); }}
          disabled={!note.trim()}
          className="mt-2 px-4 py-2 text-sm font-semibold bg-[#111111] text-white rounded-md hover:bg-[#333333] disabled:opacity-40 transition-colors"
        >
          Save Note
        </button>
      </div>
    </div>
  );
}

function ApprovalsTab() {
  return (
    <div className="p-5">
      <div className="py-12 text-center text-[#999999] text-sm">
        No pending approvals for this order
      </div>
    </div>
  );
}

// Helper to rebuild workflow steps from a status
function rebuildWorkflow(status: OrderStatus) {
  const allStatuses: OrderStatus[] = ["DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"];
  const steps = [
    { id: "order", label: "Order" },
    { id: "stock", label: "Stock Check" },
    { id: "verify", label: "Verify" },
    { id: "challan", label: "Challan" },
    { id: "dispatch", label: "Dispatch" },
    { id: "invoice", label: "Invoice" },
    { id: "payment", label: "Payment" },
  ];

  // Cancelled: show all steps as PENDING (greyed out)
  if (status === "CANCELLED") {
    return steps.map((step) => ({ ...step, status: "PENDING" as const }));
  }

  const idx = allStatuses.indexOf(status);
  return steps.map((step, i) => ({
    ...step,
    status: i < idx ? "COMPLETED" as const : i === idx ? "CURRENT" as const : "PENDING" as const,
  }));
}
