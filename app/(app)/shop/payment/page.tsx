"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Building,
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  FileText,
  Clock,
  Printer,
  ShoppingBag,
  ExternalLink,
  Upload,
  AlertCircle,
  Sparkles,
  Phone,
  Calendar,
  Lock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useShopStore } from "@/lib/shopStore";
import { useNotificationStore } from "@/lib/notificationStore";
import {
  CustomerOrderBooking,
  PaymentMethod,
  saveBookedOrder,
  checkStockAndNotify,
  getAllBookedOrders,
  addDaysToDate,
} from "@/lib/customerOrderService";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { CUSTOMERS } from "@/lib/data";
import { generateDynamicUpiQr } from "@/lib/paymentService";
import { CANONICAL_COMPANY_CONFIG } from "@/lib/companyConfig";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("UPI");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for different methods
  // UPI
  const [upiUtr, setUpiUtr] = useState("");
  const [upiApp, setUpiApp] = useState("Google Pay");

  // NEFT/RTGS
  const [neftUtr, setNeftUtr] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [receiptFile, setReceiptFile] = useState<string | null>(null);

  // COD
  const [siteContactPerson, setSiteContactPerson] = useState("");
  const [sitePhone, setSitePhone] = useState("");
  const [codInstructions, setCodInstructions] = useState("");

  // Card / NetBanking
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [cardSubMode, setCardSubMode] = useState<"CARD" | "NETBANKING">("CARD");

  // Simulation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrderBooking | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Store access
  const cart = useShopStore((s) => s.cart);
  const currentBooking = useShopStore((s) => s.currentBooking);
  const clearCart = useShopStore((s) => s.clearCart);
  const setCurrentBooking = useShopStore((s) => s.setCurrentBooking);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Retrieve current order: from store, search param fallback, or active cart
  const bookingData = useMemo(() => {
    if (currentBooking) return currentBooking;

    const orderIdParam = searchParams.get("orderId");
    if (orderIdParam) {
      const all = getAllBookedOrders();
      const found = all.find((o) => o.orderId === orderIdParam);
      if (found) return found;
    }

    // Auto-synthesize booking if coming directly with items in cart
    if (cart.length > 0) {
      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const customer = CUSTOMERS[0];
      const taxable = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const isInterState = customer.stateCode !== "27";
      const cgst = isInterState ? 0 : taxable * 0.09;
      const sgst = isInterState ? 0 : taxable * 0.09;
      const igst = isInterState ? taxable * 0.18 : 0;
      const grandTotal = taxable + cgst + sgst + igst;
      const scheduledFollowUpDate = addDaysToDate(new Date(), 5);

      return {
        orderId,
        orderNumber: `#${orderId.replace("ORD-2026-", "")}`,
        invoiceNumber: `INV/26-27/${orderId.split("-")[2]}`,
        customerId: customer.id,
        customerName: customer.contactPerson || customer.name,
        companyName: customer.name,
        phone: customer.phone,
        email: customer.email,
        deliveryAddress: `${customer.city}, Maharashtra`,
        city: customer.city,
        state: "Maharashtra",
        pincode: "400001",
        gstin: customer.gstin,
        items: cart.map((i) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          itemCode: i.itemCode,
          brand: i.brand,
          category: i.category,
          unit: i.unit,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        })),
        subtotal: taxable,
        taxableAmount: taxable,
        cgst,
        sgst,
        igst,
        grandTotal,
        paymentMethod: "UPI",
        paymentStatus: "PENDING_VERIFICATION",
        paymentDetails: {},
        bookingDate: new Date().toISOString(),
        estimatedDeliveryDate: addDaysToDate(new Date(), 3),
        deliveryStatus: "BOOKED",
        followUp: {
          scheduledDate: scheduledFollowUpDate,
          status: "PENDING",
          prompt: `Follow up in 5 days (${formatDate(scheduledFollowUpDate)}): Call ${customer.contactPerson || customer.name} at ${customer.name} to check satisfaction.`,
        },
      } as CustomerOrderBooking;
    }

    return null;
  }, [currentBooking, searchParams, cart]);

  // If order already paid or confirmed, initialize view
  useEffect(() => {
    if (bookingData && (bookingData.paymentStatus === "PAID" || bookingData.paymentStatus === "COD_CONFIRMED")) {
      setConfirmedOrder(bookingData);
      setIsSuccess(true);
    }
  }, [bookingData]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard", text);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleFillTestUtr = () => {
    const randomUtr = "4" + Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setUpiUtr(randomUtr);
    toast.info("Test UTR populated", "Simulated 12-digit transaction ID");
  };

  const handleFillTestNeft = () => {
    const randomNeft = "HDFCN" + Math.floor(10000000 + Math.random() * 90000000).toString();
    setNeftUtr(randomNeft);
    setSenderBank("ICICI Bank Ltd");
    setAccountHolder(bookingData?.companyName || "Industrial Partner");
    setReceiptFile("neft_transfer_receipt_2026.pdf");
    toast.info("NEFT details populated", "Ready to submit");
  };

  // Complete Payment Action
  const handleConfirmPayment = async () => {
    if (!bookingData) return;

    if (activeMethod === "UPI") {
      if (!upiUtr || upiUtr.trim().length < 6) {
        toast.error("Reference required", "Please enter the 12-digit UPI UTR / Reference number.");
        return;
      }
    } else if (activeMethod === "NEFT_RTGS") {
      if (!neftUtr || neftUtr.trim().length < 6) {
        toast.error("UTR required", "Please enter the NEFT/RTGS transaction UTR reference.");
        return;
      }
    } else if (activeMethod === "CARD" && cardSubMode === "CARD") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Card details needed", "Please enter a valid 16-digit card number.");
        return;
      }
      setShowOtpModal(true);
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    finalizeBooking();
  };

  const finalizeBooking = async () => {
    if (!bookingData) return;

    const todayDate = new Date();
    const scheduledFollowUpDate = addDaysToDate(todayDate, 5);
    const utrRef = activeMethod === "UPI" ? upiUtr : activeMethod === "NEFT_RTGS" ? neftUtr : "CARD_PENDING";

    // Call server payment verification API
    try {
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MANUAL_UTR_SUBMISSION",
          orderId: bookingData.orderId,
          utrNumber: utrRef,
          amount: bookingData.grandTotal,
          senderBank,
          accountHolder,
        }),
      });
    } catch (e) {
      console.warn("Server payment registration error:", e);
    }

    const updatedBooking: CustomerOrderBooking = {
      ...bookingData,
      paymentMethod: activeMethod,
      paymentStatus:
        activeMethod === "COD"
          ? "COD_CONFIRMED"
          : "PENDING_VERIFICATION",
      paymentDetails: {
        ...bookingData.paymentDetails,
        transactionId: utrRef,
        upiId: activeMethod === "UPI" ? CANONICAL_COMPANY_CONFIG.banking.upiVpa : undefined,
        appUsed: activeMethod === "UPI" ? upiApp : undefined,
        senderBank: activeMethod === "NEFT_RTGS" ? senderBank || "State Bank" : undefined,
        accountHolder: activeMethod === "NEFT_RTGS" ? accountHolder : undefined,
        receiptFileName: activeMethod === "NEFT_RTGS" ? receiptFile || undefined : undefined,
        siteContactPerson: activeMethod === "COD" ? siteContactPerson || bookingData.customerName : undefined,
        cardLast4: activeMethod === "CARD" && cardNumber ? cardNumber.slice(-4) : "8821",
        bankName: activeMethod === "CARD" && cardSubMode === "NETBANKING" ? selectedBank : undefined,
        paidAt: new Date().toISOString(),
      },
      followUp: {
        scheduledDate: scheduledFollowUpDate,
        status: "PENDING",
        prompt: `Follow up in 5 days (${formatDate(scheduledFollowUpDate)}): Call ${
          bookingData.customerName
        } at ${bookingData.companyName} (${bookingData.phone}) to ask how the ${bookingData.items.length} product unit(s) were and check reorder needs.`,
        notes: `5-day check-in booked automatically on order placement.`,
      },
    };

    saveBookedOrder(updatedBooking);
    checkStockAndNotify(updatedBooking, addNotification);
    setConfirmedOrder(updatedBooking);
    setCurrentBooking(updatedBooking);
    clearCart();
    setIsProcessing(false);
    setShowOtpModal(false);
    setIsSuccess(true);

    toast.success(
      activeMethod === "COD" ? "Order Confirmed!" : "Payment Reference Submitted!",
      activeMethod === "COD"
        ? `Order ${updatedBooking.orderNumber} placed via Cash on Delivery.`
        : `Order ${updatedBooking.orderNumber} placed. Status: Pending Accounts Verification.`
    );
  };

  const handleSimulateOtpSubmit = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    finalizeBooking();
  };

  if (!mounted) return null;

  // If no booking found, show redirect prompt
  if (!bookingData && !isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#111] mb-2">No Active Booking Found</h2>
        <p className="text-sm text-[#666] mb-6">
          Please select your product units from our B2B catalog and proceed to checkout first.
        </p>
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Browse Product Catalog
        </Link>
      </div>
    );
  }

  const order = confirmedOrder || bookingData!;

  // ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (isSuccess && order) {
    return (
      <div className="max-w-3xl mx-auto pb-16 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card p-6 sm:p-8 bg-white border border-[#EAEAEA] shadow-sm rounded-2xl"
        >
          {/* Header celebration */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {order.paymentMethod === "COD" ? "Booking Confirmed" : "Payment & Order Confirmed"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111]">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-[#666] mt-1 max-w-md mx-auto">
              Your unit booking is confirmed. We are packing your goods and preparing the transport dispatch.
            </p>
          </div>

          {/* Key order credentials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F9F9F9] rounded-xl border border-[#EAEAEA] mb-6 text-center">
            <div>
              <span className="text-[11px] font-medium text-[#888] block">Order Number</span>
              <span className="text-sm font-bold font-mono text-[#111]">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#888] block">Invoice No</span>
              <span className="text-sm font-bold font-mono text-[#111]">{order.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#888] block">Payment Mode</span>
              <span className="text-sm font-semibold text-[#111] capitalize">
                {order.paymentMethod === "NEFT_RTGS" ? "NEFT / RTGS" : order.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#888] block">Grand Total</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>

          {/* 🌟 USER HIGHLIGHT: 5-Day Quality Reminder Notice 🌟 */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/40 rounded-xl border border-indigo-100 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-[#111]">
                    Customer Care & 5-Day Quality Check Scheduled
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                    {formatDate(order.followUp.scheduledDate)}
                  </span>
                </div>
                <p className="text-xs text-[#555] mt-1 leading-relaxed">
                  We have saved your details. Our relationship manager will reach out to{" "}
                  <strong className="text-[#111]">{order.customerName}</strong> in 5 days to confirm
                  how the units performed, ensure zero defects, and see if any replenishment is required.
                </p>
                <div className="mt-2 text-[11px] text-[#777] flex items-center gap-3">
                  <span>Contact: {order.phone}</span>
                  <span>•</span>
                  <span>Company: {order.companyName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Accordion / Summary */}
          <div className="border border-[#EAEAEA] rounded-xl overflow-hidden mb-6">
            <div className="bg-[#FAFAFA] px-4 py-3 border-b border-[#EAEAEA] flex items-center justify-between">
              <span className="text-xs font-bold text-[#111] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#666]" />
                Delivery & Customer Details
              </span>
              <span className="text-xs text-[#888]">{order.city}, {order.state}</span>
            </div>
            <div className="p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666]">Deliver To:</span>
                <span className="font-semibold text-[#111] text-right">
                  {order.companyName} ({order.customerName})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shipping Address:</span>
                <span className="text-[#333] text-right max-w-xs">{order.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">GSTIN:</span>
                <span className="font-mono text-[#333]">{order.gstin || "Unregistered / B2C"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Estimated Delivery:</span>
                <span className="font-medium text-[#111]">{formatDate(order.estimatedDeliveryDate)}</span>
              </div>
              {order.paymentDetails.transactionId && (
                <div className="flex justify-between pt-1 border-t border-[#F0F0F0]">
                  <span className="text-[#666]">Transaction Reference / UTR:</span>
                  <span className="font-mono font-bold text-[#111]">
                    {order.paymentDetails.transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table Snapshot */}
          <div className="border border-[#EAEAEA] rounded-xl overflow-hidden mb-8">
            <div className="bg-[#FAFAFA] px-4 py-3 border-b border-[#EAEAEA] flex items-center justify-between">
              <span className="text-xs font-bold text-[#111]">
                Booked Items ({order.items.length})
              </span>
              <span className="text-xs text-[#888]">Qty Breakdown</span>
            </div>
            <div className="divide-y divide-[#F0F0F0]">
              {order.items.map((item) => (
                <div key={item.itemId} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#111] block">{item.itemName}</span>
                    <span className="text-[10px] text-[#888] font-mono">{item.itemCode} • {item.brand}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#111] block">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-[11px] text-[#777]">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#EAEAEA]">
            <button
              onClick={() => window.print()}
              className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save Invoice Slip
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/orders" className="flex-1 sm:flex-initial">
                <button className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold">
                  <FileText className="w-3.5 h-3.5" />
                  View All Orders
                </button>
              </Link>
              <Link href="/shop" className="flex-1 sm:flex-initial">
                <button className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-semibold">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Book New Order
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── ACTIVE PAYMENT PAGE ─────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/shop/checkout")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666] hover:text-[#111] transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order Review
        </button>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-medium">256-Bit Encrypted B2B Rails</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Payment Methods & Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Method Tabs */}
          <div className="card p-2 bg-white rounded-xl border border-[#EAEAEA]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                {
                  id: "UPI" as PaymentMethod,
                  label: "Online UPI",
                  badge: "Instant",
                  icon: QrCode,
                },
                {
                  id: "NEFT_RTGS" as PaymentMethod,
                  label: "NEFT / RTGS",
                  badge: "B2B Wire",
                  icon: Building,
                },
                {
                  id: "COD" as PaymentMethod,
                  label: "Pay on Delivery",
                  badge: "COD",
                  icon: Truck,
                },
                {
                  id: "CARD" as PaymentMethod,
                  label: "Card / Net Banking",
                  badge: "Gateway",
                  icon: CreditCard,
                },
              ].map((m) => {
                const isSelected = activeMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-150",
                      isSelected
                        ? "bg-[#111] text-white border-[#111] shadow-xs"
                        : "bg-[#F9F9F9] text-[#666] border-transparent hover:bg-[#F0F0F0] hover:text-[#111]"
                    )}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-bold leading-tight">{m.label}</span>
                    <span
                      className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1",
                        isSelected ? "bg-white/20 text-white" : "bg-[#EAEAEA] text-[#777]"
                      )}
                    >
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE METHOD CARD */}
          <AnimatePresence mode="wait">
            {/* ─── 1. ONLINE UPI ─────────────────────────────────────────── */}
            {activeMethod === "UPI" && (
              <motion.div
                key="upi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="card p-6 bg-white rounded-xl border border-[#EAEAEA]"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-[#111] flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-600" />
                      Scan & Pay with Any UPI App
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Google Pay, PhonePe, Paytm, BHIM, Cred or direct UPI transfer
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                    Zero Surcharge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center p-4 bg-[#F9F9FB] rounded-xl border border-[#E8E8EE] mb-5">
                  {/* Real Dynamic Scannable QR Code Display */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-[#E0E0E0] shadow-xs">
                    <div className="relative w-44 h-44 bg-white p-2 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: generateDynamicUpiQr({
                            amount: bookingData?.grandTotal || 0,
                            orderId: bookingData?.orderId || "SO-1048",
                            orderNumber: bookingData?.orderNumber,
                            note: `Vila Sales Order ${bookingData?.orderNumber || ""}`,
                          }).qrSvg,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#111] mt-2">
                      Amount: {formatCurrency(bookingData?.grandTotal || 0)}
                    </span>
                    <span className="text-[10px] text-[#888]">Order #{bookingData?.orderNumber}</span>
                  </div>

                  {/* UPI Details & App Launchers */}
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[11px] font-medium text-[#777] block mb-1">
                        Verified Corporate UPI ID
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#111] select-all">
                          {CANONICAL_COMPANY_CONFIG.banking.upiVpa}
                        </div>
                        <button
                          onClick={() => handleCopy(CANONICAL_COMPANY_CONFIG.banking.upiVpa, "upiId")}
                          className="btn-secondary px-3 py-2 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
                          title="Copy UPI ID"
                        >
                          {copiedKey === "upiId" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#777] block mb-1">
                        Supported UPI Applications
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {["Google Pay", "PhonePe", "Paytm", "BHIM / Cred"].map((app) => (
                          <button
                            key={app}
                            onClick={() => setUpiApp(app)}
                            className={cn(
                              "text-[10px] font-semibold py-1.5 px-2 rounded border text-center transition-all",
                              upiApp === app
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-[#555] border-[#E0E0E0] hover:border-gray-400"
                            )}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#666] bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>
                        After scanning and authorizing payment on your mobile app, enter the 12-digit
                        UTR below to instantly lock in your stock and generate your dispatch challan.
                      </span>
                    </div>
                  </div>
                </div>

                {/* UTR Reference Input */}
                <div className="border-t border-[#EAEAEA] pt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-label text-[#111]">
                      12-Digit UPI Transaction ID / UTR Number
                    </label>
                    <button
                      type="button"
                      onClick={handleFillTestUtr}
                      className="text-[11px] text-indigo-600 hover:underline font-medium"
                    >
                      Fill Demo UTR
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="e.g. 429102948192"
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value.replace(/\D/g, ""))}
                      className="input-field font-mono text-sm tracking-wider flex-1"
                    />
                    <button
                      onClick={handleConfirmPayment}
                      disabled={isProcessing || !upiUtr}
                      className="btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm & Book Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── 2. NEFT / RTGS ────────────────────────────────────────── */}
            {activeMethod === "NEFT_RTGS" && (
              <motion.div
                key="neft"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="card p-6 bg-white rounded-xl border border-[#EAEAEA]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111] flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-600" />
                      Direct Corporate Bank Transfer (NEFT / RTGS / IMPS)
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Transfer directly from your company current account to our verified bank account
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    Ideal for High Value
                  </span>
                </div>

                {/* Company Beneficiary Details Card */}
                <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-5">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
                    <span className="text-xs font-bold text-[#111] uppercase tracking-wider">
                      Official Beneficiary Details
                    </span>
                    <button
                      onClick={handleFillTestNeft}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Fill Demo Reference
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#888] block text-[10px]">Beneficiary Name</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-[#111]">
                          {CANONICAL_COMPANY_CONFIG.bankDetails.beneficiaryName}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(CANONICAL_COMPANY_CONFIG.bankDetails.beneficiaryName, "bName")
                          }
                          className="text-[#888] hover:text-[#111]"
                          title="Copy Name"
                        >
                          {copiedKey === "bName" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#888] block text-[10px]">Current Account Number</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-[#111] text-sm">
                          {CANONICAL_COMPANY_CONFIG.bankDetails.accountNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(CANONICAL_COMPANY_CONFIG.bankDetails.accountNumber, "acNum")}
                          className="text-[#888] hover:text-[#111]"
                          title="Copy Account Number"
                        >
                          {copiedKey === "acNum" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#888] block text-[10px]">Bank Name & Branch</span>
                      <span className="font-medium text-[#111] block mt-0.5">
                        {CANONICAL_COMPANY_CONFIG.bankDetails.bankName} • {CANONICAL_COMPANY_CONFIG.bankDetails.branch}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#888] block text-[10px]">IFSC Code</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-[#111]">{CANONICAL_COMPANY_CONFIG.bankDetails.ifscCode}</span>
                        <button
                          onClick={() => handleCopy(CANONICAL_COMPANY_CONFIG.bankDetails.ifscCode, "ifsc")}
                          className="text-[#888] hover:text-[#111]"
                          title="Copy IFSC"
                        >
                          {copiedKey === "ifsc" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transfer Confirmation Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Bank UTR / Transaction Reference *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFCN2629182918"
                        value={neftUtr}
                        onChange={(e) => setNeftUtr(e.target.value.toUpperCase())}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Remitting Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India"
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Remitter / Account Holder Name
                      </label>
                      <input
                        type="text"
                        placeholder={order.companyName || "Company Account Name"}
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Upload Transfer Advice / Screenshot (Optional)
                      </label>
                      <div
                        onClick={() => setReceiptFile("bank_transfer_slip_uploaded.pdf")}
                        className="border border-dashed border-[#CCC] rounded-lg p-2.5 text-center cursor-pointer hover:bg-[#F9F9F9] transition-colors"
                      >
                        {receiptFile ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {receiptFile}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-[#777]">
                            <Upload className="w-3.5 h-3.5" />
                            Click to attach transfer slip
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing || !neftUtr}
                    className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting NEFT/RTGS Reference...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Submit NEFT Reference & Confirm Order ({formatCurrency(order.grandTotal)})
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── 3. CASH ON DELIVERY (COD) ─────────────────────────────── */}
            {activeMethod === "COD" && (
              <motion.div
                key="cod"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="card p-6 bg-white rounded-xl border border-[#EAEAEA]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#111] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-600" />
                      Cash on Delivery / Pay on Unloading
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Pay via Cash, Cheque, or Driver QR Code upon physical delivery at your site
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Zero Advance Required
                  </span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 mb-5 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    How Cash on Delivery works for B2B orders:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] pl-1">
                    <li>Your goods will be dispatched immediately via registered transport.</li>
                    <li>
                      Our delivery associate will provide the original Tax Invoice and Delivery Challan.
                    </li>
                    <li>
                      Payment of <strong>{formatCurrency(order.grandTotal)}</strong> can be handed
                      over in Cash or via instant driver UPI scan at your gate.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Site Receiving Person Name
                      </label>
                      <input
                        type="text"
                        placeholder={order.customerName || "e.g. Ramesh Site Supervisor"}
                        value={siteContactPerson}
                        onChange={(e) => setSiteContactPerson(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-label text-[#111] block mb-1">
                        Site Contact Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder={order.phone || "+91 98200 00000"}
                        value={sitePhone}
                        onChange={(e) => setSitePhone(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-label text-[#111] block mb-1">
                      Unloading & Gate Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Gate 2 entry, please call 1 hour prior to reaching..."
                      value={codInstructions}
                      onChange={(e) => setCodInstructions(e.target.value)}
                      className="input-field text-xs resize-none"
                    />
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Confirming COD Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Cash on Delivery Order ({formatCurrency(order.grandTotal)})
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── 4. CARDS & NET BANKING ────────────────────────────────── */}
            {activeMethod === "CARD" && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="card p-6 bg-white rounded-xl border border-[#EAEAEA]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCardSubMode("CARD")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        cardSubMode === "CARD"
                          ? "bg-[#111] text-white"
                          : "bg-[#F0F0F0] text-[#666] hover:text-[#111]"
                      )}
                    >
                      Credit / Debit Card
                    </button>
                    <button
                      onClick={() => setCardSubMode("NETBANKING")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        cardSubMode === "NETBANKING"
                          ? "bg-[#111] text-white"
                          : "bg-[#F0F0F0] text-[#666] hover:text-[#111]"
                      )}
                    >
                      Corporate Net Banking
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#777]">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>256-bit SSL</span>
                  </div>
                </div>

                {cardSubMode === "CARD" ? (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-label text-[#111] block mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4532 •••• •••• 8821"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                          setCardNumber(formatted);
                        }}
                        className="input-field font-mono text-xs tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-label text-[#111] block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                            setCardExpiry(val);
                          }}
                          className="input-field font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-label text-[#111] block mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          className="input-field font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-label text-[#111] block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder={order.customerName || "Name as printed on card"}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="input-field text-xs"
                      />
                    </div>

                    <button
                      onClick={handleConfirmPayment}
                      className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Pay Securely {formatCurrency(order.grandTotal)}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-label text-[#111] block mb-2">
                        Select Corporate Banking Portal
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "HDFC Bank",
                          "State Bank of India",
                          "ICICI Bank",
                          "Axis Bank",
                          "Kotak Mahindra",
                          "Bank of Baroda",
                        ].map((bank) => (
                          <button
                            key={bank}
                            onClick={() => setSelectedBank(bank)}
                            className={cn(
                              "p-2.5 rounded-lg border text-xs font-semibold text-left transition-all",
                              selectedBank === bank
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                                : "bg-white border-[#E0E0E0] text-[#555] hover:border-gray-400"
                            )}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmPayment}
                      className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Proceed to {selectedBank} NetBanking
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Order Summary & Review */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5 bg-white rounded-xl border border-[#EAEAEA] sticky top-[68px]">
            <h3 className="text-sm font-bold text-[#111] mb-3 flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#555]" />
                Order Summary
              </span>
              <span className="font-mono text-xs text-[#888]">{order.orderNumber}</span>
            </h3>

            {/* Customer Details Pill */}
            <div className="p-3 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA] mb-4 text-xs space-y-1">
              <div className="font-semibold text-[#111] truncate">{order.companyName}</div>
              <div className="text-[#666] flex items-center gap-1.5">
                <Building className="w-3 h-3 text-[#999]" />
                <span>{order.city}, {order.state}</span>
              </div>
              <div className="text-[#666] flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-[#999]" />
                <span>{order.phone}</span>
              </div>
            </div>

            {/* Item list snapshot */}
            <div className="space-y-2 mb-4 text-xs max-h-48 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between py-1">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium text-[#111] block truncate text-[11px]">
                      {item.itemName}
                    </span>
                    <span className="text-[10px] text-[#888]">
                      {item.quantity} {item.unit} × {formatCurrency(item.price)}
                    </span>
                  </div>
                  <span className="font-semibold text-[#111] text-[11px] tabular-nums whitespace-nowrap">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-[#EAEAEA] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#666]">
                <span>Taxable Amount</span>
                <span className="font-medium text-[#111] tabular-nums">
                  {formatCurrency(order.taxableAmount)}
                </span>
              </div>

              {order.igst > 0 ? (
                <div className="flex justify-between text-[#666]">
                  <span>IGST @ 18%</span>
                  <span className="font-medium text-[#111] tabular-nums">
                    {formatCurrency(order.igst)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-[#666]">
                    <span>CGST @ 9%</span>
                    <span className="font-medium text-[#111] tabular-nums">
                      {formatCurrency(order.cgst)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#666]">
                    <span>SGST @ 9%</span>
                    <span className="font-medium text-[#111] tabular-nums">
                      {formatCurrency(order.sgst)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-[#666]">
                <span>Logistics & Freight</span>
                <span className="text-emerald-600 font-semibold">Free B2B Transit</span>
              </div>

              <div className="border-t-2 border-[#111] pt-2.5 mt-2 flex justify-between items-baseline font-bold">
                <span className="text-sm text-[#111]">Grand Total</span>
                <span className="text-xl text-[#111] tabular-nums font-mono">
                  {formatCurrency(order.grandTotal)}
                </span>
              </div>
            </div>

            {/* Assurance footer */}
            <div className="mt-5 pt-3 border-t border-[#EAEAEA] text-[11px] text-[#777] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full GST Input Tax Credit invoice will be issued.</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP MODAL FOR CARD SIMULATION */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="card w-full max-w-sm bg-white p-6 rounded-2xl border border-border shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111]">3D Secure Authentication</h3>
              <p className="text-xs text-[#666] mt-0.5">
                Enter the simulated one-time password sent to your registered mobile number ending in{" "}
                <strong>••42</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="text-label text-[#666] block mb-1">Enter OTP (Demo: 123456)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="input-field text-center font-mono text-lg tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateOtpSubmit}
                disabled={isProcessing}
                className="btn-primary flex-1 py-2 text-xs font-semibold"
              >
                {isProcessing ? "Verifying..." : "Authorize"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#999]">Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  );
}

