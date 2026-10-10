"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  Clock,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RotateCcw,
  User,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Check,
  X,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useAbandonedCartStore, AbandonedCart } from "@/lib/abandonedCartStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, cn } from "@/lib/utils";

export default function AbandonedCartsPage() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callNote, setCallNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING_CALL" | "CALLED" | "RECOVERED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    abandonedCarts,
    markAsCalled,
    markAsRecovered,
    dismissCart,
    simulate7HourAbandonment,
    checkAndTriggerIdleAlerts,
  } = useAbandonedCartStore();

  useEffect(() => {
    setMounted(true);
    // Automatically check for carts that hit the 7-hour threshold
    checkAndTriggerIdleAlerts();
  }, [checkAndTriggerIdleAlerts]);

  if (!mounted) return null;

  // Filtered carts
  const filteredCarts = abandonedCarts.filter((cart) => {
    const matchesFilter =
      filterStatus === "ALL"
        ? true
        : filterStatus === "PENDING_CALL"
        ? cart.status === "PENDING_CALL"
        : filterStatus === "CALLED"
        ? cart.status === "CALLED"
        : cart.status === "RECOVERED";

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      cart.customerName.toLowerCase().includes(q) ||
      cart.phone.toLowerCase().includes(q) ||
      cart.city.toLowerCase().includes(q) ||
      cart.items.some((i) => i.itemName.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Analytics
  const totalRevenueAtRisk = abandonedCarts
    .filter((c) => c.status === "PENDING_CALL")
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const pendingCallCount = abandonedCarts.filter((c) => c.status === "PENDING_CALL").length;
  const criticalCount = abandonedCarts.filter((c) => c.idleHours >= 7 && c.status === "PENDING_CALL").length;
  const recoveredCount = abandonedCarts.filter((c) => c.status === "RECOVERED").length;

  const handleOpenCallModal = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setCallNote("");
    setCallModalOpen(true);
  };

  const handleRecordCall = () => {
    if (!selectedCart) return;
    markAsCalled(selectedCart.id, callNote || "Manager called customer to follow up on cart items.");
    toast.success("Call Logged", `Recorded call follow-up for ${selectedCart.customerName}`);
    setCallModalOpen(false);
    setSelectedCart(null);
  };

  const handleWhatsApp = (cart: AbandonedCart) => {
    const cleanPhone = cart.phone.replace(/[^0-9]/g, "");
    const itemList = cart.items.map((i) => `${i.quantity}x ${i.itemName}`).join(", ");
    const text = encodeURIComponent(
      `Hello ${cart.customerName}, this is Vila Sales team. We noticed you have ${itemList} in your cart (₹${cart.totalAmount.toLocaleString(
        "en-IN"
      )}). We have stock reserved for you! Would you like us to confirm fast dispatch today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handleSimulate = () => {
    const newCart = simulate7HourAbandonment({
      customerName: "Rohan Automotive Care",
      phone: "+91 98332 99881",
    });
    toast.warning(
      "Simulated 7-Hour Abandoned Cart",
      `Triggered manager notification for ${newCart.customerName} (₹${newCart.totalAmount.toLocaleString("en-IN")})`
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[11px] rounded uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              7-Hour Idle Rule
            </span>
            <span className="text-xs text-[#999]">Automated Manager Follow-up</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111]">Abandoned Carts &amp; Customer Callback</h1>
          <p className="text-sm text-[#666] mt-0.5">
            Customers who kept items in cart without purchasing for &gt;7 hours. Call them to close the sale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            title="Simulate a customer cart that has been idle for 7.5 hours"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate 7h Idle Alert</span>
          </button>
          <button
            onClick={() => {
              const count = checkAndTriggerIdleAlerts();
              toast.info("Scanned Carts", `Checked carts. ${count} new alerts triggered.`);
            }}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Now</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666] mb-1">
            <span className="text-xs font-medium">Pending Call (&gt;7h)</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          <p className="text-[11px] text-[#999] mt-1">Requires immediate phone call</p>
        </div>

        <div className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666] mb-1">
            <span className="text-xs font-medium">Revenue at Risk</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111]">₹{totalRevenueAtRisk.toLocaleString("en-IN")}</div>
          <p className="text-[11px] text-[#999] mt-1">From unpurchased items</p>
        </div>

        <div className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666] mb-1">
            <span className="text-xs font-medium">Total Pending Carts</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111]">{pendingCallCount}</div>
          <p className="text-[11px] text-[#999] mt-1">Across all customers</p>
        </div>

        <div className="bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666] mb-1">
            <span className="text-xs font-medium">Recovered Orders</span>
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{recoveredCount}</div>
          <p className="text-[11px] text-[#999] mt-1">Saved through callback</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl border border-[#EAEAEA]">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "PENDING_CALL", "CALLED", "RECOVERED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                filterStatus === status
                  ? "bg-[#111] text-white"
                  : "text-[#666] hover:bg-[#F5F5F5] hover:text-[#111]"
              )}
            >
              {status === "ALL"
                ? "All Carts"
                : status === "PENDING_CALL"
                ? "Pending Call (>7h)"
                : status === "CALLED"
                ? "Called"
                : "Recovered"}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="Search by customer, phone, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#111]"
          />
        </div>
      </div>

      {/* Carts List */}
      <div className="space-y-3">
        {filteredCarts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#EAEAEA] p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-[#DDD] mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#111]">No abandoned carts matching criteria</h3>
            <p className="text-xs text-[#999] mt-1 max-w-sm mx-auto">
              Carts idle for more than 7 hours will automatically appear here with notification alerts to the manager.
            </p>
          </div>
        ) : (
          filteredCarts.map((cart) => {
            const isCritical = cart.idleHours >= 7 && cart.status === "PENDING_CALL";

            return (
              <motion.div
                key={cart.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-white rounded-xl border p-4 sm:p-5 transition-all shadow-xs",
                  isCritical ? "border-red-300 ring-1 ring-red-200" : "border-[#EAEAEA]"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Customer Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-[#111]">{cart.customerName}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-[#555] rounded text-xs font-mono">
                        {cart.phone}
                      </span>
                      {isCritical && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          IDLE {cart.idleHours.toFixed(1)} HOURS (&gt;7h)
                        </span>
                      )}
                      {cart.status === "CALLED" && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold text-[10px] rounded-full">
                          Called ({cart.callAttempts}x)
                        </span>
                      )}
                      {cart.status === "RECOVERED" && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 font-semibold text-[10px] rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Recovered / Converted
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#666]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#999]" />
                        {cart.city}
                      </span>
                      <span>•</span>
                      <span>Last active: {new Date(cart.cartUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(cart.cartUpdatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Cart Items Pill List */}
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-semibold text-[#444]">Items in Cart:</span>
                      {cart.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#F7F7F7] border border-[#EAEAEA] rounded text-xs text-[#333]"
                        >
                          <span className="font-semibold text-emerald-700">{item.quantity}×</span>
                          <span>{item.itemName}</span>
                          <span className="text-[#999]">({formatCurrency(item.price * item.quantity)})</span>
                        </span>
                      ))}
                    </div>

                    {cart.notes && (
                      <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded mt-2 border border-amber-200">
                        <span className="font-semibold">Manager Log:</span> {cart.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Value & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between sm:justify-end gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EAEAEA]">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-[#999]">Total Cart Value</div>
                      <div className="text-xl font-bold text-[#111]">
                        {formatCurrency(cart.totalAmount)}
                      </div>
                      <div className="text-[11px] text-[#666]">{cart.itemCount} units</div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${cart.phone.replace(/[^0-9+]/g, "")}`}
                        onClick={() => handleOpenCallModal(cart)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Call Customer via Phone"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>

                      <button
                        onClick={() => handleWhatsApp(cart)}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Send WhatsApp Follow-up Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {cart.status !== "RECOVERED" && (
                        <button
                          onClick={() => {
                            markAsRecovered(cart.id);
                            toast.success("Order Recovered!", `Marked ${cart.customerName}'s cart as recovered.`);
                          }}
                          className="px-3 py-2 bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] text-[#333] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Mark as Recovered / Paid"
                        >
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span>Recovered</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          dismissCart(cart.id);
                          toast.info("Cart Dismissed", "Removed from abandoned list.");
                        }}
                        className="p-2 text-[#999] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Dismiss Cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Call Logging Modal */}
      <AnimatePresence>
        {callModalOpen && selectedCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111]">Log Customer Call</h3>
                    <p className="text-xs text-[#666]">{selectedCart.customerName} ({selectedCart.phone})</p>
                  </div>
                </div>
                <button
                  onClick={() => setCallModalOpen(false)}
                  className="p-1 rounded text-[#999] hover:text-[#111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                  <p className="font-semibold mb-1">📞 Dialing {selectedCart.phone}...</p>
                  <p>Cart total: {formatCurrency(selectedCart.totalAmount)} ({selectedCart.itemCount} items). Idle for {selectedCart.idleHours.toFixed(1)} hours.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#333] block mb-1">
                    Call Notes &amp; Outcome
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Spoke to procurement manager. Offered 3% spot discount on bulk bonding gum. Customer will complete checkout in 30 mins."
                    value={callNote}
                    onChange={(e) => setCallNote(e.target.value)}
                    className="w-full text-xs p-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#111]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCallModalOpen(false)}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordCall}
                  className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Call Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
