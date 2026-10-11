"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Truck,
  Package,
  CheckCircle2,
  Receipt,
  Download,
  Printer,
  ArrowRight,
  Building,
  CreditCard,
  Calendar,
  Tag,
  ShoppingBag,
  ChevronDown,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShopStore, CartItem } from "@/lib/shopStore";
import { CustomerOrderBooking, addDaysToDate } from "@/lib/customerOrderService";
import { getCategoryImage, getBrandColor } from "@/lib/productImages";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CUSTOMERS, Customer } from "@/lib/data";

import { calculateGST, resolveCustomerStateCode } from "@/lib/gstService";
import { CANONICAL_COMPANY_CONFIG } from "@/lib/companyConfig";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"details" | "review" | "done">("details");
  const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMERS[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [transporter, setTransporter] = useState("V-Trans Logistics");
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState("");

  const invoiceRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const cart = useShopStore((s) => s.cart);
  const getCartTotal = useShopStore((s) => s.getCartTotal);
  const getCartItemCount = useShopStore((s) => s.getCartItemCount);
  const clearCart = useShopStore((s) => s.clearCart);
  const setCurrentBooking = useShopStore((s) => s.setCurrentBooking);

  useEffect(() => setMounted(true), []);

  const customer = CUSTOMERS.find((c) => c.id === selectedCustomerId) || CUSTOMERS[0];
  const { stateCode: customerStateCode, stateName: customerStateName } = resolveCustomerStateCode({
    gstin: customer?.gstin,
    stateCode: customer?.stateCode,
    stateName: customer?.state,
  });

  // Calculate authoritative GST breakdown
  const gstBreakdown = calculateGST({
    items: cart.map((item) => ({
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      qty: item.quantity,
      rate: item.price,
    })),
    customerGstin: customer?.gstin,
    customerStateCode,
    customerStateName,
  });

  const taxableAmount = gstBreakdown.taxableAmount;
  const isInterState = gstBreakdown.isInterState;
  const cgst = gstBreakdown.totalCgst;
  const sgst = gstBreakdown.totalSgst;
  const igst = gstBreakdown.totalIgst;
  const grandTotal = gstBreakdown.grandTotal;
  const gstRate = 18;

  const today = new Date().toISOString().split("T")[0];
  const dueDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(paymentTerms));
    return d.toISOString().split("T")[0];
  })();

  const handleProceedToPayment = async () => {
    setIsProcessing(true);

    try {
      // Create real order in server database with stock reservation
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          items: cart.map((i) => ({ itemId: i.itemId, qty: i.quantity, rate: i.price })),
          deliveryDate: addDaysToDate(new Date(), 3),
          notes,
        }),
      });

      const data = await res.json();
      const serverOrder = data.success ? data.order : null;
      const orderId = serverOrder ? serverOrder.id : `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderNumber = serverOrder ? serverOrder.orderNo : `#${orderId.replace("ORD-2026-", "")}`;
      const scheduledFollowUpDate = addDaysToDate(new Date(), 5);

      const booking: CustomerOrderBooking = {
        orderId,
        orderNumber,
        invoiceNumber: `VS/26-27/${orderId.replace(/[^0-9]/g, "").slice(-4)}`,
        customerId: customer.id,
        customerName: customer.contactPerson || customer.name,
        companyName: customer.name,
        phone: customer.phone,
        email: customer.email,
        deliveryAddress: customer.billingAddress || `${customer.city}, ${customerStateName}`,
        city: customer.city,
        state: customerStateName,
        pincode: "400093",
        gstin: customer.gstin,
        items: cart.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          brand: item.brand,
          category: item.category,
          unit: item.unit,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        subtotal: taxableAmount,
        taxableAmount: taxableAmount,
        cgst,
        sgst,
        igst,
        grandTotal,
        paymentMethod: "UPI",
        paymentStatus: "PENDING_VERIFICATION",
        paymentDetails: {},
        transporter,
        orderNotes: notes,
        bookingDate: new Date().toISOString(),
        estimatedDeliveryDate: addDaysToDate(new Date(), 3),
        deliveryStatus: "BOOKED",
        followUp: {
          scheduledDate: scheduledFollowUpDate,
          status: "PENDING",
          prompt: `Follow up in 5 days (${formatDate(scheduledFollowUpDate)}): Call ${customer.contactPerson || customer.name} at ${customer.name} (${customer.phone}) to ask about the ${cart.length} product unit(s).`,
        },
      };

      setCurrentBooking(booking);
      router.push(`/shop/payment?orderId=${orderId}`);
    } catch (e: any) {
      alert("Error initiating order: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: "Direct Store Checkout",
          customerId: customer.id,
          items: cart.map((c) => ({
            itemCode: c.itemCode,
            itemName: c.itemName,
            qty: c.quantity,
            rate: c.price,
          })),
          transporter,
        }),
      });

      const data = await res.json();
      if (data.success && data.invoice) {
        setGeneratedInvoiceNo(data.invoice.invoiceNo);
        setStep("done");
      } else {
        alert("Invoice creation error: " + (data.error || "Failed on server"));
      }
    } catch (e: any) {
      alert("Error generating invoice: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  if (cart.length === 0 && step !== "done") {
    router.push("/shop");
    return null;
  }

  return (
    <div className="pb-8 max-w-5xl mx-auto">
      {/* ─── Progress Steps ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/shop/cart"
          className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#333]" />
        </Link>
        <div className="flex-1 flex items-center justify-center gap-3">
          {[
            { id: "details", label: "Customer Details", icon: User },
            { id: "review", label: "Review & Confirm", icon: FileText },
            { id: "done", label: "Invoice Generated", icon: CheckCircle2 },
          ].map((s, idx) => {
            const isActive = step === s.id;
            const isDone =
              (step === "review" && idx === 0) ||
              (step === "done" && idx < 2);
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={cn(
                      "w-8 h-[2px] rounded-full",
                      isDone ? "bg-emerald-500" : "bg-[#EAEAEA]"
                    )}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-[#111] text-white"
                        : "bg-[#EAEAEA] text-[#999]"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:inline",
                      isActive ? "text-[#111]" : isDone ? "text-emerald-600" : "text-[#999]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: Customer Details ────────────────────────────── */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Customer Selection */}
                <div className="card p-5">
                  <h3 className="font-bold text-[#111] text-sm mb-4 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Select Customer
                  </h3>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="input-field mb-4"
                  >
                    {CUSTOMERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city} ({c.gstin})
                      </option>
                    ))}
                  </select>

                  {customer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA]">
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">Company</span>
                        <span className="text-sm font-semibold text-[#111]">{customer.name}</span>
                      </div>
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">GSTIN</span>
                        <span className="text-sm font-mono text-[#111]">{customer.gstin}</span>
                      </div>
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">City</span>
                        <span className="text-sm text-[#111]">{customer.city}</span>
                      </div>
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">Contact</span>
                        <span className="text-sm text-[#111]">{customer.contactPerson}</span>
                      </div>
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">Phone</span>
                        <span className="text-sm text-[#111]">{customer.phone}</span>
                      </div>
                      <div>
                        <span className="text-label text-[#999] block mb-0.5">Email</span>
                        <span className="text-sm text-[#111]">{customer.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shipping & Payment */}
                <div className="card p-5">
                  <h3 className="font-bold text-[#111] text-sm mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping & Payment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label text-[#666] block mb-1">Payment Terms</label>
                      <select
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="input-field"
                      >
                        <option value="7">7 Days</option>
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                        <option value="45">45 Days</option>
                        <option value="60">60 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-label text-[#666] block mb-1">Transporter</label>
                      <input
                        type="text"
                        placeholder="e.g., V-Trans Logistics"
                        value={transporter}
                        onChange={(e) => setTransporter(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-label text-[#666] block mb-1">Order Notes</label>
                    <textarea
                      placeholder="Any special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Side Summary */}
              <div className="lg:col-span-1">
                <div className="card p-5 sticky top-[68px]">
                  <h3 className="font-bold text-[#111] text-sm mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Summary
                  </h3>
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Items</span>
                      <span className="font-medium text-[#111]">{cart.length} products</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Subtotal</span>
                      <span className="font-medium text-[#111]">{formatCurrency(taxableAmount)}</span>
                    </div>
                    {isInterState ? (
                      <div className="flex justify-between">
                        <span className="text-[#666]">IGST ({gstRate}%)</span>
                        <span className="font-medium text-[#111]">{formatCurrency(igst)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-[#666]">CGST ({gstRate / 2}%)</span>
                          <span className="font-medium text-[#111]">{formatCurrency(cgst)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#666]">SGST ({gstRate / 2}%)</span>
                          <span className="font-medium text-[#111]">{formatCurrency(sgst)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-t border-[#EAEAEA] pt-3 flex justify-between">
                    <span className="text-sm font-bold text-[#111]">Grand Total</span>
                    <span className="text-lg font-bold text-[#111]">{formatCurrency(grandTotal)}</span>
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    className="w-full mt-5 py-3 bg-[#111] text-white rounded-xl text-sm font-semibold hover:bg-[#2a2a2a] transition-all duration-150 flex items-center justify-center gap-2 group active:scale-[0.98] shadow-sm"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setStep("review")}
                    className="w-full mt-2 py-2.5 bg-[#F5F5F5] text-[#333] hover:bg-[#EAEAEA] rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#666]" />
                    Review Proforma Invoice
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 2: Review & Confirm ───────────────────────────── */}
        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div ref={invoiceRef} className="card p-6 mb-6 print:shadow-none print:border-0">
              {/* Invoice Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#EAEAEA]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-[#111] rounded flex items-center justify-center">
                      <Package className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#111]">{CANONICAL_COMPANY_CONFIG.companyName}</h2>
                      <p className="text-[10px] text-[#999]">{CANONICAL_COMPANY_CONFIG.legalEntityName}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#666] mt-2 space-y-0.5">
                    <p>GSTIN: {CANONICAL_COMPANY_CONFIG.gstin}</p>
                    <p>{CANONICAL_COMPANY_CONFIG.registeredAddress.state}, India (State Code: {CANONICAL_COMPANY_CONFIG.stateCode})</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-[#111] mb-1">PROFORMA INVOICE</h3>
                  <div className="text-xs text-[#666] space-y-0.5">
                    <p>
                      <span className="text-[#999]">Date:</span>{" "}
                      <span className="font-medium text-[#111]">{formatDate(today)}</span>
                    </p>
                    <p>
                      <span className="text-[#999]">Due Date:</span>{" "}
                      <span className="font-medium text-[#111]">{formatDate(dueDate)}</span>
                    </p>
                    <p>
                      <span className="text-[#999]">Payment Terms:</span>{" "}
                      <span className="font-medium text-[#111]">{paymentTerms} Days</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-label text-[#999] mb-1.5">BILL TO</h4>
                  <p className="text-sm font-bold text-[#111]">{customer.name}</p>
                  <p className="text-xs text-[#666] mt-0.5">{customer.city}</p>
                  <p className="text-xs text-[#666]">GSTIN: {customer.gstin}</p>
                  <p className="text-xs text-[#666]">{customer.contactPerson} — {customer.phone}</p>
                </div>
                {transporter && (
                  <div>
                    <h4 className="text-label text-[#999] mb-1.5">SHIPPING</h4>
                    <p className="text-xs text-[#666]">Transporter: {transporter}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <table className="data-table mb-4">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th>Unit</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.itemId}>
                      <td className="text-[#999] text-xs">{idx + 1}</td>
                      <td>
                        <div>
                          <span className="text-xs font-semibold text-[#111]">{item.itemName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-[#999]">{item.itemCode}</span>
                            <span className="text-[10px]" style={{ color: getBrandColor(item.brand) }}>
                              {item.brand}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-semibold text-xs tabular-nums">{item.quantity}</td>
                      <td className="text-xs text-[#666]">{item.unit}</td>
                      <td className="text-right text-xs tabular-nums">{formatCurrency(item.price)}</td>
                      <td className="text-right font-semibold text-xs tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-[#666]">Taxable Amount</span>
                    <span className="font-semibold text-[#111] tabular-nums">{formatCurrency(taxableAmount)}</span>
                  </div>
                  {isInterState ? (
                    <div className="flex justify-between py-1">
                      <span className="text-[#666]">IGST @ {gstRate}%</span>
                      <span className="font-semibold text-[#111] tabular-nums">{formatCurrency(igst)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between py-1">
                        <span className="text-[#666]">CGST @ {gstRate / 2}%</span>
                        <span className="font-semibold text-[#111] tabular-nums">{formatCurrency(cgst)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#666]">SGST @ {gstRate / 2}%</span>
                        <span className="font-semibold text-[#111] tabular-nums">{formatCurrency(sgst)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-[#111] font-bold">
                    <span className="text-[#111]">GRAND TOTAL</span>
                    <span className="text-base text-[#111] tabular-nums">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="mt-4 p-3 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA]">
                  <span className="text-label text-[#999]">Notes</span>
                  <p className="text-xs text-[#666] mt-0.5">{notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("details")}
                className="btn-secondary flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </button>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handlePrint}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-2.5 px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Preview
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isProcessing}
                  className="btn-secondary flex items-center gap-1.5 text-xs py-2.5 px-3 disabled:opacity-50"
                  title="Generate proforma invoice on credit terms without immediate payment"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#666]/30 border-t-[#333] rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Issue on Credit
                    </>
                  )}
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="btn-primary py-2.5 px-5 flex items-center gap-2 text-xs font-semibold shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now (UPI / NEFT / COD)
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 3: Success ────────────────────────────────────── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-bold text-[#111] mb-2"
            >
              Invoice Generated Successfully!
            </motion.h2>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-sm text-[#666] mb-1">
                Invoice Number:{" "}
                <span className="font-bold font-mono text-[#111]">{generatedInvoiceNo}</span>
              </p>
              <p className="text-sm text-[#666] mb-8">
                Total Amount:{" "}
                <span className="font-bold text-[#111]">{formatCurrency(grandTotal)}</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="card p-5 max-w-md mx-auto mb-8"
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[#666]">Customer</span>
                <span className="font-semibold text-[#111]">{customer.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[#666]">Items</span>
                <span className="font-semibold text-[#111]">{cart.length} products</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[#666]">Date</span>
                <span className="font-semibold text-[#111]">{formatDate(today)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666]">Due Date</span>
                <span className="font-semibold text-[#111]">{formatDate(dueDate)}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center gap-3"
            >
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-1.5 px-5 py-2.5"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <Link href="/invoices">
                <button className="btn-secondary flex items-center gap-1.5 px-5 py-2.5">
                  <FileText className="w-4 h-4" />
                  View All Invoices
                </button>
              </Link>
              <button
                onClick={() => {
                  clearCart();
                  router.push("/shop");
                }}
                className="btn-primary flex items-center gap-1.5 px-5 py-2.5"
              >
                <ShoppingBag className="w-4 h-4" />
                New Order
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
