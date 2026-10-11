"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import { CUSTOMERS, ITEMS, Customer, Item } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

import { useToast } from "@/components/ui/Toast";

interface LineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qty: number;
  availableStock: number;
  rate: number;
  discountPct: number;
  gstPct: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const toast = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("C001");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = CUSTOMERS.find((c) => c.id === selectedCustomerId) || CUSTOMERS[0];
  const creditAvailable = customer.creditLimit - customer.creditUsed;

  const [lines, setLines] = useState<LineItem[]>([
    {
      itemId: ITEMS[0].id,
      itemCode: ITEMS[0].code,
      itemName: ITEMS[0].name,
      unit: ITEMS[0].unit,
      qty: 50,
      availableStock: ITEMS[0].stock,
      rate: ITEMS[0].price,
      discountPct: 0,
      gstPct: 18,
    },
  ]);

  const handleItemSelect = (index: number, itemId: string) => {
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    setLines((prev) => {
      const next = [...prev];
      next[index] = {
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        unit: item.unit,
        qty: 1,
        availableStock: item.stock,
        rate: item.price,
        discountPct: 0,
        gstPct: 18,
      };
      return next;
    });
  };

  const handleUpdateLine = (index: number, field: keyof LineItem, value: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addLine = () => {
    const first = ITEMS[0];
    setLines((prev) => [
      ...prev,
      {
        itemId: first.id,
        itemCode: first.code,
        itemName: first.name,
        unit: first.unit,
        qty: 1,
        availableStock: first.stock,
        rate: first.price,
        discountPct: 0,
        gstPct: 18,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const calculations = lines.map((line) => {
    const gross = line.qty * line.rate;
    const discount = (gross * line.discountPct) / 100;
    const taxable = gross - discount;
    const gst = (taxable * line.gstPct) / 100;
    const total = taxable + gst;
    const isShortage = line.qty > line.availableStock;
    return { gross, discount, taxable, gst, total, isShortage };
  });

  const subtotal = calculations.reduce((acc, c) => acc + c.taxable, 0);
  const totalGst = calculations.reduce((acc, c) => acc + c.gst, 0);
  const grandTotal = subtotal + totalGst;
  const hasAnyShortage = calculations.some((c) => c.isShortage);
  const willExceedCredit = grandTotal > creditAvailable;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      toast.error("Invalid Order", "Please add at least one line item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: lines.map((l) => ({
            itemId: l.itemId,
            qty: l.qty,
            rate: l.rate,
            discountPct: l.discountPct,
          })),
          priority,
          deliveryDate,
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error("Creation Failed", data.error || "Failed to create order on server");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        "Sales Order Created",
        `Order ${data.order.orderNo} created with ₹${data.order.totalAmount.toLocaleString("en-IN")} value. Stock reserved.`
      );
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      toast.error("Network Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 border border-border rounded hover:bg-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Create Sales Order</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Draft or confirm a new customer order with live stock allocation & GST calculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Confirm & Create Order
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  Select Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background focus:outline-none focus:border-brand-primary"
                >
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">
                  GSTIN & Location
                </label>
                <div className="text-xs font-mono bg-bg-canvas p-2.5 rounded border border-border">
                  <div className="font-semibold text-text-primary">{customer.gstin}</div>
                  <div className="text-text-muted">
                    {customer.city} · State Code {customer.gstin.slice(0, 2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Status Warning/Notice */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Credit Limit:</span>
                <span className="font-semibold">{formatCurrency(customer.creditLimit)}</span>
                <span className="text-border">|</span>
                <span className="text-text-muted">Available:</span>
                <span
                  className={`font-semibold ${
                    creditAvailable < 50000 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {formatCurrency(creditAvailable)}
                </span>
              </div>
              <div className="text-text-muted">
                Terms: <span className="font-medium text-text-primary">{customer.paymentTerms} Days</span>
              </div>
            </div>

            {willExceedCredit && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Credit Warning:</strong> This order value exceeds the customer&apos;s available credit limit by{" "}
                  {formatCurrency(grandTotal - creditAvailable)}. Admin approval will be required.
                </span>
              </div>
            )}
          </div>

          {/* Line Items Card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  Order Items
                </h2>
                <p className="text-xs text-text-muted">
                  Select items from catalog. Live stock availability is checked automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
                  <tr>
                    <th className="p-2.5 min-w-[220px]">Item / Description</th>
                    <th className="p-2.5 w-20 text-center">Stock</th>
                    <th className="p-2.5 w-24">Qty</th>
                    <th className="p-2.5 w-28">Rate (₹)</th>
                    <th className="p-2.5 w-20">Disc %</th>
                    <th className="p-2.5 w-20">GST %</th>
                    <th className="p-2.5 w-28 text-right">Taxable (₹)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((line, idx) => {
                    const calc = calculations[idx];
                    return (
                      <tr key={idx} className="hover:bg-hover/50">
                        <td className="p-2.5">
                          <select
                            value={line.itemId}
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="w-full text-xs border border-border rounded p-1.5 bg-background font-medium focus:outline-none focus:border-brand-primary"
                          >
                            {ITEMS.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.unit}) — Stock: {item.stock}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] font-mono text-text-muted mt-0.5">
                            Code: {line.itemCode}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`badge ${
                              line.availableStock >= line.qty
                                ? "badge-ok"
                                : line.availableStock > 0
                                ? "badge-low"
                                : "badge-out"
                            }`}
                          >
                            {line.availableStock}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={1}
                            value={line.qty}
                            onChange={(e) =>
                              handleUpdateLine(idx, "qty", Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className={`w-full border rounded p-1.5 text-xs text-right font-medium ${
                              calc.isShortage ? "border-amber-400 bg-amber-50/50" : "border-border"
                            }`}
                          />
                          {calc.isShortage && (
                            <div className="text-[10px] text-amber-700 mt-0.5">
                              Short: {line.qty - line.availableStock}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            value={line.rate}
                            onChange={(e) =>
                              handleUpdateLine(idx, "rate", Math.max(0, parseFloat(e.target.value) || 0))
                            }
                            className="w-full border border-border rounded p-1.5 text-xs text-right font-mono"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={line.discountPct}
                            onChange={(e) =>
                              handleUpdateLine(
                                idx,
                                "discountPct",
                                Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                              )
                            }
                            className="w-full border border-border rounded p-1.5 text-xs text-right"
                          />
                        </td>
                        <td className="p-2.5">
                          <select
                            value={line.gstPct}
                            onChange={(e) =>
                              handleUpdateLine(idx, "gstPct", parseInt(e.target.value) || 18)
                            }
                            className="w-full border border-border rounded p-1.5 text-xs bg-background"
                          >
                            <option value={18}>18%</option>
                            <option value={12}>12%</option>
                            <option value={5}>5%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="p-2.5 text-right font-mono font-medium">
                          {formatCurrency(calc.taxable)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            disabled={lines.length === 1}
                            className="text-text-muted hover:text-red-500 disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasAnyShortage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Some items have quantities exceeding current stock. When confirmed, this order will automatically raise purchase requirements for the shortfall.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Order Meta & Summary */}
        <div className="space-y-6">
          {/* Order Details Card */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Fulfillment Settings
            </h2>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Order Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["NORMAL", "HIGH", "URGENT"] as const).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 text-xs font-semibold rounded border transition-all text-center ${
                        isSelected
                          ? p === "URGENT"
                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                            : p === "HIGH"
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-[#111111] text-white border-[#111111] shadow-sm"
                          : "bg-white text-text-primary border-border hover:bg-[#F7F7F7]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Target Delivery Date *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full text-xs border border-border rounded px-3 py-2 bg-background focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Special Delivery Notes / Instructions
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Unload at Godown Bay 4, verify test certificate before dispatch"
                className="w-full text-xs border border-border rounded p-2.5 bg-background focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Pricing & GST Summary */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary uppercase tracking-wide">
              <Calculator className="w-4 h-4 text-brand-primary" />
              <span>Tax & Amount Summary</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-border">
              <div className="flex justify-between py-1 text-text-secondary">
                <span>Taxable Value:</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-text-secondary">
                <span>CGST (9%):</span>
                <span className="font-mono">{formatCurrency(totalGst / 2)}</span>
              </div>
              <div className="flex justify-between py-1 text-text-secondary">
                <span>SGST (9%):</span>
                <span className="font-mono">{formatCurrency(totalGst / 2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                <span>Grand Total:</span>
                <span className="font-mono text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
              >
                {isSubmitting ? "Creating Order..." : "Confirm & Save Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
