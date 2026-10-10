"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Building2,
  Calendar,
  X,
  Plus,
  Search,
  FileCheck,
} from "lucide-react";
import { ORDERS, ITEMS, PURCHASE_ORDERS, PurchaseOrder } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNotificationStore } from "@/lib/notificationStore";
import { useToast } from "@/components/ui/Toast";

interface RequirementItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qtyShort: number;
  openOrdersCount: number;
  suggestedSupplier: string;
  estimatedCost: number;
  unitPrice: number;
  status: "PENDING_PO" | "PO_RAISED";
  generatedPoNo?: string;
}

const SAMPLE_REQUIREMENTS: RequirementItem[] = [
  {
    itemId: "I003",
    itemCode: "MGP-500-12-SKT",
    itemName: "MAXGRIP 500×12 SOCKET HEAD",
    unit: "Box",
    qtyShort: 62,
    openOrdersCount: 2,
    suggestedSupplier: "Maxgrip Industrial Fasteners",
    unitPrice: 480,
    estimatedCost: 29760,
    status: "PENDING_PO",
  },
  {
    itemId: "I001",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    unit: "Box",
    qtyShort: 40,
    openOrdersCount: 1,
    suggestedSupplier: "Apex Forgings & Fasteners Ltd.",
    unitPrice: 900,
    estimatedCost: 36000,
    status: "PENDING_PO",
  },
  {
    itemId: "I005",
    itemCode: "TUF-200-08-HXT",
    itemName: "TUFFIX 200×8 HIGH TENSILE BOLT",
    unit: "Box",
    qtyShort: 25,
    openOrdersCount: 1,
    suggestedSupplier: "Apex Forgings & Fasteners Ltd.",
    unitPrice: 720,
    estimatedCost: 18000,
    status: "PENDING_PO",
  },
];

export default function PurchaseRequirementsPage() {
  const [requirements, setRequirements] = useState<RequirementItem[]>(SAMPLE_REQUIREMENTS);
  const [search, setSearch] = useState("");
  const [selectedReq, setSelectedReq] = useState<RequirementItem | null>(null);

  // Modal form states
  const [poQty, setPoQty] = useState<number>(0);
  const [unitRate, setUnitRate] = useState<number>(0);
  const [supplierName, setSupplierName] = useState("");
  const [targetGodown, setTargetGodown] = useState("Main Warehouse");
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNotification = useNotificationStore((s) => s.addNotification);
  const toast = useToast();

  const handleOpenModal = (req: RequirementItem) => {
    setSelectedReq(req);
    setPoQty(req.qtyShort);
    setUnitRate(req.unitPrice);
    setSupplierName(req.suggestedSupplier);
  };

  const handleCloseModal = () => {
    setSelectedReq(null);
    setIsSubmitting(false);
  };

  const handleConfirmPO = () => {
    if (!selectedReq) return;
    setIsSubmitting(true);

    const poNumber = `PO-2026-${String(PURCHASE_ORDERS.length + 82).padStart(3, "0")}`;
    const totalAmount = poQty * unitRate;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNo: poNumber,
      supplierId: "SUP-NEW",
      supplierName: supplierName || selectedReq.suggestedSupplier,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: expectedDate,
      totalAmount: totalAmount,
      status: "SENT",
      items: [
        {
          itemCode: selectedReq.itemCode,
          itemName: selectedReq.itemName,
          qtyOrdered: poQty,
          qtyReceived: 0,
          unitPrice: unitRate,
          unit: selectedReq.unit,
        },
      ],
    };

    PURCHASE_ORDERS.unshift(newPO);

    // Update requirements list
    setRequirements((prev) =>
      prev.map((r) =>
        r.itemId === selectedReq.itemId
          ? { ...r, status: "PO_RAISED", generatedPoNo: poNumber }
          : r
      )
    );

    // Notify manager
    addNotification({
      type: "NEW_ORDER",
      title: `Purchase Order ${poNumber} Raised`,
      message: `Issued PO for ${poQty} ${selectedReq.unit} of ${selectedReq.itemName} to ${newPO.supplierName} (${formatCurrency(totalAmount)})`,
      severity: "SUCCESS",
      entityId: newPO.id,
      entityType: "ORDER",
      href: "/purchase/orders",
    });

    toast.success(
      "Purchase Order Created",
      `${poNumber} sent to ${newPO.supplierName} for ${formatCurrency(totalAmount)}.`
    );

    handleCloseModal();
  };

  const filtered = requirements.filter(
    (r) =>
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      r.suggestedSupplier.toLowerCase().includes(search.toLowerCase())
  );

  const totalShortageCost = requirements
    .filter((r) => r.status === "PENDING_PO")
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Procurement Requirements</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time material shortages generated from confirmed customer orders needing purchase from mills/suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/purchase/orders"
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            View All POs ({PURCHASE_ORDERS.length})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">Pending Shortages</div>
            <div className="text-lg font-bold text-red-600 mt-0.5">
              {requirements.filter((r) => r.status === "PENDING_PO").length} Items
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">Estimated Procurement Cost</div>
            <div className="text-lg font-bold text-text-primary mt-0.5">
              {formatCurrency(totalShortageCost)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        <div className="card p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-text-muted font-medium">POs Raised Today</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {requirements.filter((r) => r.status === "PO_RAISED").length} Orders
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-3 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search SKU, item name, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div className="text-xs text-text-muted">
          Showing <strong>{filtered.length}</strong> requirements
        </div>
      </div>

      {/* Requirements Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Item Description</th>
              <th className="p-3 text-center">Short Quantity</th>
              <th className="p-3 text-center">Linked Orders</th>
              <th className="p-3">Suggested Preferred Supplier</th>
              <th className="p-3 text-right">Estimated Procurement Cost</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((req) => (
              <tr key={req.itemId} className="hover:bg-hover/50">
                <td className="p-3">
                  <div className="font-medium text-text-primary">{req.itemName}</div>
                  <div className="font-mono text-[10px] text-text-muted">{req.itemCode}</div>
                </td>
                <td className="p-3 text-center font-mono font-bold text-red-600">
                  {req.qtyShort} {req.unit}
                </td>
                <td className="p-3 text-center font-mono">
                  <span className="badge badge-low">{req.openOrdersCount} order(s)</span>
                </td>
                <td className="p-3 font-medium text-text-secondary">{req.suggestedSupplier}</td>
                <td className="p-3 text-right font-mono font-semibold">
                  {formatCurrency(req.estimatedCost)}
                </td>
                <td className="p-3 text-right">
                  {req.status === "PO_RAISED" ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">{req.generatedPoNo}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(req)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Raise PO
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raise PO Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  Raise Purchase Order
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Confirm procurement terms to generate outbound purchase order.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Summary Banner */}
            <div className="bg-bg-canvas p-3 rounded-lg border border-border space-y-1">
              <div className="text-xs font-semibold text-text-primary">{selectedReq.itemName}</div>
              <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                <span>Code: {selectedReq.itemCode}</span>
                <span className="text-red-600 font-bold">Shortage: {selectedReq.qtyShort} {selectedReq.unit}</span>
              </div>
            </div>

            {/* Modal Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-muted font-medium">Supplier Name</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Target Godown</label>
                <select
                  value={targetGodown}
                  onChange={(e) => setTargetGodown(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-medium"
                >
                  <option value="Main Warehouse">Main Warehouse (Bhiwandi)</option>
                  <option value="Secondary Store">Secondary Store (Rabale)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">
                  Order Quantity ({selectedReq.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={poQty}
                  onChange={(e) => setPoQty(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted font-medium">Rate per {selectedReq.unit} (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={unitRate}
                  onChange={(e) => setUnitRate(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-text-muted font-medium">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-background focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary">Total Purchase Order Value:</span>
              <span className="font-mono text-base font-bold text-brand-primary">
                {formatCurrency(poQty * unitRate)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={handleCloseModal}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPO}
                disabled={isSubmitting || poQty <= 0}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Generate Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
