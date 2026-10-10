"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  FileText,
  Package,
  Tag,
  X,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Clock,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShopStore, CartItem } from "@/lib/shopStore";
import { getCategoryImage, getCategoryColor, getBrandColor } from "@/lib/productImages";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { CUSTOMERS } from "@/lib/data";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const cart = useShopStore((s) => s.cart);
  const removeFromCart = useShopStore((s) => s.removeFromCart);
  const updateQuantity = useShopStore((s) => s.updateQuantity);
  const incrementQuantity = useShopStore((s) => s.incrementQuantity);
  const decrementQuantity = useShopStore((s) => s.decrementQuantity);
  const getCartTotal = useShopStore((s) => s.getCartTotal);
  const getCartItemCount = useShopStore((s) => s.getCartItemCount);
  const clearCart = useShopStore((s) => s.clearCart);
  const customerPhone = useShopStore((s) => s.customerPhone);
  const simulate7HourIdle = useShopStore((s) => s.simulate7HourIdle);
  const toast = useToast();

  useEffect(() => setMounted(true), []);

  const cartTotal = mounted ? getCartTotal() : 0;
  const cartItemCount = mounted ? getCartItemCount() : 0;
  const gstRate = 18;
  const gstAmount = cartTotal * (gstRate / 100);
  const grandTotal = cartTotal + gstAmount;

  // Group by category
  const groupedCart = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    cart.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [cart]);

  if (!mounted) return null;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-[#CCC]" />
          </div>
          <h2 className="text-xl font-bold text-[#111] mb-2">Your cart is empty</h2>
          <p className="text-sm text-[#666] mb-6 max-w-sm">
            Browse our product catalog and add items to start building your order.
          </p>
          <Link
            href="/shop"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-28 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/shop"
            className="p-2 -ml-2 rounded-lg hover:bg-[#F0F0F0] active:bg-[#E5E5E5] transition-colors flex-shrink-0"
            aria-label="Back to catalog"
          >
            <ArrowLeft className="w-5 h-5 text-[#333]" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#111] truncate">Shopping Cart</h1>
            <p className="text-[11px] sm:text-xs text-[#666] mt-0.5 truncate">
              {cart.length} {cart.length === 1 ? "product" : "products"} •{" "}
              {cartItemCount} total units
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to clear your entire cart?")) {
              clearCart();
            }
          }}
          className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 text-xs flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Cart</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Cart Items ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedCart).map(([category, items]) => {
            const catColor = getCategoryColor(category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border"
                    style={{
                      backgroundColor: catColor.bg,
                      color: catColor.text,
                      borderColor: catColor.border,
                    }}
                  >
                    {category}
                  </span>
                  <span className="text-[11px] text-[#999]">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.itemId}
                        item={item}
                        onRemove={() => removeFromCart(item.itemId)}
                        onIncrement={() => incrementQuantity(item.itemId)}
                        onDecrement={() => decrementQuantity(item.itemId)}
                        onUpdateQty={(qty) => updateQuantity(item.itemId, qty)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Order Summary ──────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-[68px]">
            <h3 className="font-bold text-[#111] text-sm mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Order Summary
            </h3>

            {/* Items Summary */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[#666] truncate flex-1 mr-2">
                    {item.itemName}
                    <span className="text-[#999] ml-1">×{item.quantity}</span>
                  </span>
                  <span className="text-[#111] font-medium tabular-nums whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#EAEAEA] pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#666]">Subtotal</span>
                <span className="font-semibold text-[#111]">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#666]">GST ({gstRate}%)</span>
                <span className="font-semibold text-[#111]">
                  {formatCurrency(gstAmount)}
                </span>
              </div>
              <div className="border-t border-[#EAEAEA] pt-2 flex justify-between">
                <span className="text-sm font-bold text-[#111]">Grand Total</span>
                <span className="text-lg font-bold text-[#111]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <Link href="/shop/checkout" className="block">
                <button className="w-full py-3 bg-[#111] text-white rounded-xl text-sm font-semibold hover:bg-[#2a2a2a] transition-all duration-150 flex items-center justify-center gap-2 group active:scale-[0.98]">
                  <FileText className="w-4 h-4" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/shop" className="block">
                <button className="w-full py-2.5 bg-white text-[#333] rounded-xl text-xs font-medium border border-[#EAEAEA] hover:bg-[#F7F7F7] transition-colors flex items-center justify-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Continue Shopping
                </button>
              </Link>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-0.5">Before checkout:</p>
                  <p>
                    Quantities are subject to real-time stock availability. 
                    Final pricing including applicable discounts will be 
                    confirmed at checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* 7-Hour Cart Policy & Manager Follow-up Alert Box */}
            <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 leading-relaxed">
                  <p className="font-bold">7-Hour Stock Reservation Guarantee</p>
                  <p className="mt-0.5 text-amber-800">
                    Items kept in cart are held for up to 7 hours. If unpurchased for 7 hours, an automated callback alert is sent to our dispatch manager ({customerPhone}) so we can call you and hold stock.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-amber-700 font-medium">Test this workflow:</span>
                    <button
                      onClick={() => {
                        simulate7HourIdle();
                        toast.warning(
                          "Alert Dispatched to Manager!",
                          "Simulated 7-hour abandonment. The manager has received an urgent callback notification."
                        );
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Simulate 7h Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Item Row ───────────────────────────────────────────────────────
function CartItemRow({
  item,
  onRemove,
  onIncrement,
  onDecrement,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  const categoryImg = getCategoryImage(item.category);
  const brandColor = getBrandColor(item.brand);
  const lineTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-3.5 sm:p-4 group space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4 transition-all"
    >
      {/* ── Product Header / Info Section (Full width on mobile, inline on desktop) ── */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Product Image Thumbnail */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#EAEAEA]/80 p-1.5">
          <div className="relative w-full h-full">
            <Image
              src={categoryImg}
              alt={item.itemName}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 56px, 64px"
            />
          </div>
        </div>

        {/* Product Title, Code, Brand, Unit Rate */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-sm font-semibold text-[#111] leading-snug line-clamp-2 sm:line-clamp-1 break-words">
            {item.itemName}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            <span className="text-[10px] font-mono text-[#888] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
              {item.itemCode}
            </span>
            <span className="text-[10.5px] font-medium" style={{ color: brandColor }}>
              {item.brand}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1.5 text-xs">
            <span className="font-semibold text-[#111]">
              {formatCurrency(item.price)}
              <span className="text-[#888] font-normal text-[11px]">/{item.unit}</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">
              {item.availableStock} {item.unit} stock
            </span>
          </div>
        </div>

        {/* Mobile-only Direct Delete Button (Top-Right) */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onRemove}
          className="sm:hidden p-1.5 -mr-1 -mt-1 text-[#AAA] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* ── Quantity Controls & Total Section ── */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2.5 sm:pt-0 border-t border-[#F0F0F0] sm:border-0 flex-shrink-0">
        {/* Quantity Stepper Bar */}
        <div className="flex items-center bg-[#F7F7F7] rounded-xl overflow-hidden border border-[#E5E5E5] shadow-xs">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onDecrement}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#EAEAEA] active:bg-[#DDD] transition-colors text-[#222]"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </motion.button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onUpdateQty(Math.min(val, item.availableStock));
            }}
            className="w-12 sm:w-11 text-center text-sm font-bold text-[#111] bg-transparent outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            min={0}
            max={item.availableStock}
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onIncrement}
            disabled={item.quantity >= item.availableStock}
            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-[#EAEAEA] active:bg-[#DDD] transition-colors text-[#222] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </motion.button>
        </div>

        {/* Line Total */}
        <div className="text-right sm:min-w-[90px]">
          <div className="text-sm sm:text-base font-bold text-[#111] tabular-nums">
            {formatCurrency(lineTotal)}
          </div>
          <div className="text-[10px] text-[#888]">
            {item.quantity} × {formatCurrency(item.price)}
          </div>
        </div>

        {/* Desktop-only Remove Button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onRemove}
          className="hidden sm:flex p-2 rounded-lg text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
