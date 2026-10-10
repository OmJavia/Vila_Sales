"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  MapPin,
  Search,
  LogIn,
  ShieldCheck,
  ChevronDown,
  Clock,
  Sparkles,
  Phone,
  User,
  X,
  Check,
  LayoutDashboard,
  AlertCircle,
  Truck,
} from "lucide-react";
import { useShopStore } from "@/lib/shopStore";
import { useAbandonedCartStore } from "@/lib/abandonedCartStore";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, cn } from "@/lib/utils";

const LOCATIONS = [
  { id: "mum-1", name: "MIDC Andheri East, Mumbai", pincode: "400093", eta: "10-15 mins" },
  { id: "mum-2", name: "Bhiwandi Logistics Hub", pincode: "421302", eta: "25-30 mins" },
  { id: "mum-3", name: "Thane Industrial Estate", pincode: "400604", eta: "15-20 mins" },
  { id: "mum-4", name: "Navi Mumbai (TTC Area)", pincode: "400705", eta: "20-25 mins" },
  { id: "pun-1", name: "Bhosari MIDC, Pune", pincode: "411026", eta: "45 mins" },
];

export function ShopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  const cart = useShopStore((s) => s.cart);
  const getCartTotal = useShopStore((s) => s.getCartTotal);
  const getCartItemCount = useShopStore((s) => s.getCartItemCount);
  const customerPhone = useShopStore((s) => s.customerPhone);
  const customerName = useShopStore((s) => s.customerName);
  const setCustomerInfo = useShopStore((s) => s.setCustomerInfo);
  const simulate7HourIdle = useShopStore((s) => s.simulate7HourIdle);

  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState(customerPhone);
  const [nameInput, setNameInput] = useState(customerName);

  // Check if admin is logged in from localStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const logged = localStorage.getItem("tradeflow_admin_logged_in") === "true";
      setIsAdminLoggedIn(logged);
    }
  }, []);

  const itemCount = mounted ? getCartItemCount() : 0;
  const cartTotal = mounted ? getCartTotal() : 0;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerInfo({ name: nameInput, phone: phoneInput });
    toast.success("Contact Saved", "Your cart is backed up. Stock will be held for you.");
    setCustomerModalOpen(false);
  };

  const handleSimulate7HourIdle = () => {
    simulate7HourIdle();
    toast.warning(
      "Simulated 7-Hour Idle Alert Sent!",
      "A critical notification has been dispatched to the Manager's portal so he can call you."
    );
  };

  return (
    <>
      {/* ── Top Notice Bar (Blinkit Style Quick Delivery) ── */}
      <div className="bg-[#111111] text-white text-[11px] px-3 sm:px-6 py-1.5 flex items-center justify-between border-b border-[#222]">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-[#F8CB46] text-[#111] font-extrabold px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> 10-Min Delivery
          </span>
          <span className="text-white/80 hidden sm:inline">
            Fastest B2B tire retreading &amp; hardware delivery in Maharashtra &amp; Gujarat
          </span>
          <span className="text-white/80 sm:hidden">Fastest B2B Delivery</span>
        </div>

        <div className="flex items-center gap-3">
          {itemCount > 0 && (
            <button
              onClick={handleSimulate7HourIdle}
              className="text-[#F8CB46] hover:underline flex items-center gap-1 text-[10px] font-semibold"
              title="Test the 7-hour abandoned cart manager alert immediately"
            >
              <Clock className="w-3 h-3" />
              <span>Simulate 7h Idle Alert</span>
            </button>
          )}

          {isAdminLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-white/70 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <LogIn className="w-3 h-3" />
              <span>Staff Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── Main Blinkit Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EAEAEA] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Delivery Location */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            {/* Blinkit-inspired Logo */}
            <Link href="/shop" className="flex items-center gap-1.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#F8CB46] flex items-center justify-center font-black text-[#111] text-lg shadow-xs group-hover:scale-105 transition-transform">
                V
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-lg sm:text-xl text-[#111] tracking-tight">
                  vila<span className="text-emerald-600">store</span>
                </span>
                <span className="block text-[9px] font-semibold text-[#888] tracking-wider uppercase">
                  Quick B2B
                </span>
              </div>
            </Link>

            {/* Location Pill */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-[#EAEAEA] hover:border-[#CCC] bg-[#FAFAFA] text-left transition-colors max-w-[260px]"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#111] flex items-center gap-1">
                  <span>Delivery in {selectedLocation.eta}</span>
                  <ChevronDown className="w-3 h-3 text-[#888]" />
                </div>
                <div className="text-[10px] text-[#666] truncate">{selectedLocation.name}</div>
              </div>
            </button>
          </div>

          {/* Quick links & Cart */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Customer Contact / Phone Saver */}
            <button
              type="button"
              onClick={() => setCustomerModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#444] hover:bg-[#F5F5F5] border border-transparent hover:border-[#EAEAEA] transition-colors"
              title="Save contact to reserve cart items"
            >
              <User className="w-3.5 h-3.5 text-[#666]" />
              <span>{customerName ? customerName.split(" ")[0] : "Guest"}</span>
              <span className="text-[10px] text-[#888]">({customerPhone.slice(-4)})</span>
            </button>

            {/* Admin or Login Button */}
            {isAdminLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#222] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Cart Button (Blinkit Style Emerald Green) */}
            <Link
              href="/shop/cart"
              className={cn(
                "relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all",
                itemCount > 0
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md scale-100 active:scale-95"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center bg-white/20 px-1.5 py-0.5 rounded text-[11px]">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-extrabold">{formatCurrency(cartTotal)}</span>
                </div>
              ) : (
                <span>My Cart</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Floating Mobile Bottom Cart Bar (Blinkit Signature UI) ── */}
      {itemCount > 0 && !pathname.includes("/cart") && !pathname.includes("/payment") && (
        <div className="fixed bottom-3 inset-x-3 sm:hidden z-50">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-emerald-600 text-white p-3 px-4 rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"} • {formatCurrency(cartTotal)}
                </div>
                <div className="text-[10px] text-emerald-100">Stock held for 7 hours</div>
              </div>
            </div>

            <Link
              href="/shop/cart"
              className="bg-white text-emerald-800 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs"
            >
              View Cart →
            </Link>
          </motion.div>
        </div>
      )}

      {/* ── Location Modal ── */}
      <AnimatePresence>
        {locationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#EAEAEA]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#111] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Select Delivery Location
                </h3>
                <button
                  onClick={() => setLocationModalOpen(false)}
                  className="p-1 rounded text-[#999] hover:text-[#111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#666] mb-3">
                Choose your warehouse or factory location for 10-min instant inventory delivery.
              </p>

              <div className="space-y-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocationModalOpen(false);
                      toast.info("Location Updated", `Delivering to ${loc.name}`);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between",
                      selectedLocation.id === loc.id
                        ? "border-emerald-600 bg-emerald-50/50"
                        : "border-[#EAEAEA] hover:border-[#CCC]"
                    )}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111]">{loc.name}</div>
                      <div className="text-[11px] text-[#666]">
                        PIN {loc.pincode} • ETA: <span className="font-semibold text-emerald-700">{loc.eta}</span>
                      </div>
                    </div>
                    {selectedLocation.id === loc.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Customer Phone & Name Modal ── */}
      <AnimatePresence>
        {customerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#EAEAEA]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-[#111] flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Save Cart &amp; Contact Info
                </h3>
                <button
                  onClick={() => setCustomerModalOpen(false)}
                  className="p-1 rounded text-[#999] hover:text-[#111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#666] mb-4">
                We reserve items in your cart for up to 7 hours. If unpurchased after 7 hours, our manager will call you to confirm dispatch.
              </p>

              <form onSubmit={handleSaveContact} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#444] block mb-1">
                    Your Name / Company
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Ramesh Sharma / ABC Retreads"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#444] block mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98201 12345"
                    className="w-full text-xs p-2.5 border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerModalOpen(false)}
                    className="btn-secondary flex-1 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
