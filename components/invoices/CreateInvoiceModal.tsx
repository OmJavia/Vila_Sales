"use client";

import { useState } from "react";
import { Plus, Trash2, Mail, CheckCircle2, FileText, X, AlertCircle } from "lucide-react";
import { CUSTOMERS, Invoice, InvoiceLineItem } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMERS[0]?.id || "");
  const [orderNo, setOrderNo] = useState("#1052");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [transporter, setTransporter] = useState("V-Trans Logistics");
  const [vehicleNo, setVehicleNo] = useState("MH-46-AR-8819");
  const [ewayBillNo, setEwayBillNo] = useState("241829019284");

  // Email sending option
  const [sendEmail, setSendEmail] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState(CUSTOMERS[0]?.email || "procurement@customer.in");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items state
  const [items, setItems] = useState<Array<{
    itemName: string;
    itemCode: string;
    hsnCode: string;
    qty: number;
    unit: string;
    rate: number;
    discountPct: number;
    gstRate: number;
  }>>([
    {
      itemName: "MIDAS BONDING GUM - FAST CURE 99°C",
      itemCode: "MDS-BG-FC99",
      hsnCode: "40082100",
      qty: 20,
      unit: "Roll",
      rate: 3450,
      discountPct: 5,
      gstRate: 18,
    },
    {
      itemName: "MIDAS CUSHION REPAIR CEMENT (Fast Dry)",
      itemCode: "MDS-CC-FD01",
      hsnCode: "35069190",
      qty: 15,
      unit: "Can",
      rate: 850,
      discountPct: 0,
      gstRate: 18,
    },
  ]);

  if (!isOpen) return null;

  const currentCustomer = CUSTOMERS.find((c) => c.id === selectedCustomerId) || CUSTOMERS[0];

  // Calculate totals
  const lineCalculations = items.map((item) => {
    const gross = item.qty * item.rate;
    const discount = (gross * item.discountPct) / 100;
    const taxable = gross - discount;
    const isInterState = currentCustomer.stateCode !== "27";
    const halfRate = item.gstRate / 2;
    const cgst = isInterState ? 0 : (taxable * halfRate) / 100;
    const sgst = isInterState ? 0 : (taxable * halfRate) / 100;
    const igst = isInterState ? (taxable * item.gstRate) / 100 : 0;
    const total = taxable + cgst + sgst + igst;
    return { gross, taxable, cgst, sgst, igst, total };
  });

  const totalTaxable = lineCalculations.reduce((acc, c) => acc + c.taxable, 0);
  const totalCgst = lineCalculations.reduce((acc, c) => acc + c.cgst, 0);
  const totalSgst = lineCalculations.reduce((acc, c) => acc + c.sgst, 0);
  const totalIgst = lineCalculations.reduce((acc, c) => acc + c.igst, 0);
  const grandTotal = Math.round(totalTaxable + totalCgst + totalSgst + totalIgst);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemName: "MIDAS PRE-CURED TREAD RUBBER (Lug Pattern)",
        itemCode: "MDS-PTR-LUG11",
        hsnCode: "40082100",
        qty: 10,
        unit: "Roll",
        rate: 4200,
        discountPct: 0,
        gstRate: 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create durably on server
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo,
          customerId: currentCustomer.id,
          items: items.map((it) => ({
            itemCode: it.itemCode,
            itemName: it.itemName,
            qty: it.qty,
            rate: it.rate,
            discountPct: it.discountPct,
            hsnCode: it.hsnCode,
          })),
          transporter,
          vehicleNo,
          ewayBillNo: ewayBillNo || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Failed to create invoice: " + (data.error || "Unknown server error"));
        setIsSubmitting(false);
        return;
      }

      const createdInvoice: Invoice = data.invoice;

      // Optional email dispatch
      if (sendEmail && recipientEmail) {
        try {
          await fetch("/api/invoices/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoice: createdInvoice,
              recipientEmail,
              notes: "Generated via Vila Sales Commercial Billing.",
            }),
          });
        } catch (mailErr) {
          console.warn("Email dispatch error:", mailErr);
        }
      }

      onInvoiceCreated(createdInvoice);
      onClose();
    } catch (err: any) {
      alert("Error submitting invoice: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-bg-card rounded-xl border border-border shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-canvas/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Create New GST Tax Invoice
              </h2>
              <p className="text-xs text-text-muted">
                Issue official GST tax invoice and automatically share with recipient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-hover rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Customer & Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Select Billed Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-brand-primary"
              >
                {CUSTOMERS.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.city}) - GST: {cust.gstin}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Order Reference No.
              </label>
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="#1052"
                className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-brand-primary font-mono"
              />
            </div>
          </div>

          {/* Dates & Logistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-bg-canvas/30 p-3 rounded-lg border border-border">
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">
                Transporter
              </label>
              <input
                type="text"
                value={transporter}
                onChange={(e) => setTransporter(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">
                Vehicle No.
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background font-mono"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-primary">
                Line Items (HSN & Rate)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2 border border-border rounded-lg p-3 bg-bg-canvas/20">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-bg-card p-2 rounded border border-border text-xs"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, itemName: val } : it))
                        );
                      }}
                      placeholder="Item name"
                      className="w-full px-2 py-1 border border-border rounded bg-background"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.hsnCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, hsnCode: val } : it))
                        );
                      }}
                      placeholder="HSN"
                      className="w-full px-2 py-1 border border-border rounded bg-background font-mono text-[11px]"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 1;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, qty: val } : it))
                          );
                        }}
                        className="w-full px-2 py-1 border border-border rounded bg-background font-mono text-center"
                      />
                      <span className="text-[10px] text-text-muted">{item.unit}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, rate: val } : it))
                        );
                      }}
                      placeholder="₹ Rate"
                      className="w-full px-2 py-1 border border-border rounded bg-background font-mono text-right"
                    />
                  </div>

                  <div className="col-span-1 text-right font-mono font-semibold">
                    ₹{Math.round(lineCalculations[idx].total).toLocaleString("en-IN")}
                  </div>

                  <div className="col-span-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-text-muted hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email dispatch option - Specifically highlights omjavia18@gmail.com */}
          <div className="border border-brand-primary/30 bg-brand-primary/5 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-border text-brand-primary focus:ring-brand-primary w-4 h-4"
                />
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-primary" />
                  Automatically email invoice copy to mail address
                </span>
              </label>
              <span className="badge badge-ok text-[10px]">Active</span>
            </div>

            {sendEmail && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] text-text-muted">Send to:</span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-border rounded bg-background font-semibold text-brand-primary"
                  placeholder="omjavia18@gmail.com"
                />
              </div>
            )}
            <p className="text-[10px] text-text-muted">
              Sends an official GST tax invoice with line item details, bank transfer credentials, and direct payment link to <strong>{recipientEmail}</strong>.
            </p>
          </div>

          {/* Summary Calculation */}
          <div className="bg-bg-canvas/50 border border-border p-3.5 rounded-lg flex items-center justify-between">
            <div className="space-y-0.5 text-xs text-text-muted">
              <div>Taxable Value: <strong className="font-mono text-text-primary">{formatCurrency(totalTaxable)}</strong></div>
              <div>GST (CGST + SGST / IGST): <strong className="font-mono text-text-primary">{formatCurrency(totalCgst + totalSgst + totalIgst)}</strong></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-text-muted uppercase font-semibold">Invoice Grand Total</div>
              <div className="text-xl font-bold font-mono text-brand-primary">{formatCurrency(grandTotal)}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating & Emailing...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Create {sendEmail ? "& Email to omjavia18@gmail.com" : "Invoice"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
