"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, ShoppingBag, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { ORDERS, ITEMS } from "@/lib/data";

interface RequirementItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qtyShort: number;
  openOrdersCount: number;
  suggestedSupplier: string;
  estimatedCost: number;
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
    estimatedCost: 29760,
  },
  {
    itemId: "I001",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    unit: "Box",
    qtyShort: 40,
    openOrdersCount: 1,
    suggestedSupplier: "Apex Forgings & Fasteners Ltd.",
    estimatedCost: 36000,
  },
];

export default function PurchaseRequirementsPage() {
  const [requirements, setRequirements] = useState<RequirementItem[]>(SAMPLE_REQUIREMENTS);

  const handleCreatePO = (itemCode: string) => {
    alert(`Auto-generating Purchase Order for ${itemCode}...`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Procurement Requirements</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time material shortages generated from confirmed customer orders needing purchase from mills/suppliers.
          </p>
        </div>
      </div>

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
            {requirements.map((req) => (
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
                  ₹{req.estimatedCost.toLocaleString("en-IN")}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleCreatePO(req.itemCode)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Raise PO
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
