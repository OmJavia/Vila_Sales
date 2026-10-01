"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Filter,
  Grid3X3,
  List,
  Package,
  X,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Tag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ITEMS, Item } from "@/lib/data";
import { useShopStore } from "@/lib/shopStore";
import { getCategoryImage, getCategoryColor, getBrandColor, getProductGradient } from "@/lib/productImages";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Category Icon Map ─────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  "Bonding Gum": "🔗",
  "Cushion Gum": "🧽",
  "Vulcanizing Solution": "🧪",
  "Repair Compounds": "🔧",
  "Precured Treads": "🛞",
  "Conventional Rubber": "⚫",
  "Curing Bags": "👜",
  "Curing Envelopes": "✉️",
  "Flaps": "🔘",
  "OTR Sealing Rings": "⭕",
  "Wicking Pads": "📋",
  "Anchor Bolts": "🔩",
  "Hex Bolts": "🔩",
  "Socket Head": "🔩",
  "Washers": "⚙️",
  "Self Drill": "🪛",
};

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "stock">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cart = useShopStore((s) => s.cart);
  const addToCart = useShopStore((s) => s.addToCart);
  const incrementQuantity = useShopStore((s) => s.incrementQuantity);
  const decrementQuantity = useShopStore((s) => s.decrementQuantity);
  const getCartItemQuantity = useShopStore((s) => s.getCartItemQuantity);
  const getCartTotal = useShopStore((s) => s.getCartTotal);
  const getCartItemCount = useShopStore((s) => s.getCartItemCount);

  useEffect(() => setMounted(true), []);

  // ── Only consider in-stock items for the entire page ────────────────────
  // FIX: previously categories were derived from ALL items, so clicking a
  // category pill that only had zero-stock items would show 0 results.
  const inStockItems = useMemo(() => ITEMS.filter((item) => item.stock > 0), []);

  // Get unique categories — only from in-stock items so filter always returns results
  const categories = useMemo(() => {
    const cats = Array.from(new Set(inStockItems.map((item) => item.category)));
    return cats.sort();
  }, [inStockItems]);

  // Get category counts — from in-stock items only
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inStockItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [inStockItems]);

  // Filter & sort items
  const filteredItems = useMemo(() => {
    let result = [...inStockItems];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        result.sort((a, b) => b.stock - a.stock);
        break;
    }

    return result;
  }, [inStockItems, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (item: Item) => {
    addToCart({
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      brand: item.brand,
      category: item.category,
      unit: item.unit,
      price: item.price,
      availableStock: item.stock,
    });
  };

  const cartItemCount = mounted ? getCartItemCount() : 0;
  const cartTotal = mounted ? getCartTotal() : 0;

  return (
    <div className="min-h-screen pb-32">
      {/* ─── Hero Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#111111] via-[#1a1a2e] to-[#16213e] p-4 sm:p-6 md:p-8 mb-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-[11px] font-semibold tracking-wider uppercase">
              Product Catalog
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
            Browse &amp; Order Products
          </h1>
          <p className="text-white/50 text-xs sm:text-sm max-w-xl hidden sm:block">
            Browse our complete product catalog. Add items to your cart and generate invoices.
          </p>

          {/* Search + Filter toggle */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/15 transition-all duration-200 backdrop-blur-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border flex-shrink-0",
                showFilters || selectedCategory
                  ? "bg-white text-[#111] border-white"
                  : "bg-white/10 text-white/70 border-white/10 hover:bg-white/15 hover:text-white"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {selectedCategory ? (
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{selectedCategory}</span>
              ) : (
                "Filter"
              )}
              {selectedCategory && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Category Filter Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className="card p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#666] uppercase tracking-wider">
                  Filter by Category ({categories.length})
                </span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    Clear <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Horizontally scrollable on mobile, wraps on desktop */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 sm:mx-0 px-3 sm:px-0 sm:flex-wrap">
                <motion.button
                  onClick={() => setSelectedCategory(null)}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0 whitespace-nowrap",
                    selectedCategory === null
                      ? "ring-2 ring-offset-1 ring-[#111] bg-[#111] text-white border-[#111]"
                      : "bg-[#F7F7F7] text-[#666] border-[#EAEAEA] hover:bg-[#EAEAEA]"
                  )}
                >
                  <span>✨</span>
                  All Products
                  <span
                    className={cn(
                      "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                      selectedCategory === null ? "bg-white/20 text-white" : "bg-black/5 text-[#666]"
                    )}
                  >
                    {inStockItems.length}
                  </span>
                </motion.button>
                {categories.map((cat) => {
                  const colors = getCategoryColor(cat);
                  const isSelected = selectedCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? null : cat)}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex-shrink-0 whitespace-nowrap",
                        isSelected
                          ? "ring-2 ring-offset-1 ring-[#111] bg-[#111] text-white border-[#111]"
                          : "hover:shadow-sm"
                      )}
                      style={
                        !isSelected
                          ? {
                              backgroundColor: colors.bg,
                              color: colors.text,
                              borderColor: colors.border,
                            }
                          : undefined
                      }
                    >
                      <span>{CATEGORY_ICONS[cat] || "📦"}</span>
                      {cat}
                      <span
                        className={cn(
                          "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          isSelected ? "bg-white/20 text-white" : "bg-black/5"
                        )}
                      >
                        {categoryCounts[cat] || 0}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-[#666] truncate">
            <span className="font-semibold text-[#111]">{filteredItems.length}</span>{" "}
            {filteredItems.length === 1 ? "product" : "products"}
            {selectedCategory && (
              <span className="ml-1 hidden sm:inline">
                in{" "}
                <span className="font-medium text-[#111]">{selectedCategory}</span>
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input-field !w-auto !py-1.5 !text-xs !pr-7"
          >
            <option value="name">Name</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="stock">Stock ↓</option>
          </select>
          <div className="flex border border-[#EAEAEA] rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-[#111] text-white"
                  : "bg-white text-[#666] hover:bg-[#F0F0F0]"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "list"
                  ? "bg-[#111] text-white"
                  : "bg-white text-[#666] hover:bg-[#F0F0F0]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Product Grid ─────────────────────────────────────────────── */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                index={i}
                onAdd={handleAddToCart}
                quantity={mounted ? getCartItemQuantity(item.id) : 0}
                onIncrement={() => incrementQuantity(item.id)}
                onDecrement={() => decrementQuantity(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <ProductListItem
                key={item.id}
                item={item}
                index={i}
                onAdd={handleAddToCart}
                quantity={mounted ? getCartItemQuantity(item.id) : 0}
                onIncrement={() => incrementQuantity(item.id)}
                onDecrement={() => decrementQuantity(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-16 card p-6 my-4">
          <Package className="w-12 h-12 text-[#CCC] mx-auto mb-3" />
          <p className="text-[#111] font-semibold text-base">No products found</p>
          <p className="text-[#666] text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {searchQuery && selectedCategory
              ? `No products in "${selectedCategory}" match "${searchQuery}".`
              : selectedCategory
              ? `No items currently in-stock in "${selectedCategory}".`
              : "Try adjusting your search query or category filter."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Clear Search
              </button>
            )}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn-primary text-xs py-1.5 px-3"
              >
                View All Categories
              </button>
            )}
            {!searchQuery && !selectedCategory && (
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Floating Cart Bar ────────────────────────────────────────── */}
      <AnimatePresence>
        {mounted && cartItemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-[72px] lg:bottom-6 left-0 lg:left-[240px] right-0 z-40 px-3 sm:px-6"
          >
            <Link href="/shop/cart">
              <div className="max-w-3xl mx-auto bg-[#111] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {cart.length} {cart.length === 1 ? "item" : "items"}
                    </span>
                    <span className="text-white/40 text-[11px] sm:text-xs ml-1 sm:ml-2">
                      ({cartItemCount} units)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-white font-bold text-sm sm:text-lg">
                    {formatCurrency(cartTotal)}
                  </span>
                  <div className="bg-white text-[#111] rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold flex items-center gap-1 group-hover:bg-amber-400 transition-colors">
                    <span className="hidden sm:inline">View</span> Cart
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Card (Grid View) ────────────────────────────────────────────
function ProductCard({
  item,
  index,
  onAdd,
  quantity,
  onIncrement,
  onDecrement,
}: {
  item: Item;
  index: number;
  onAdd: (item: Item) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const categoryImg = getCategoryImage(item.category);
  const categoryColor = getCategoryColor(item.category);
  const brandColor = getBrandColor(item.brand);
  const [grad1, grad2] = getProductGradient(item.id);

  const stockLabel =
    item.stockLevel === "OK"
      ? "In Stock"
      : item.stockLevel === "LOW"
      ? "Low Stock"
      : item.stockLevel === "CRITICAL"
      ? "Very Low"
      : "Out of Stock";

  const stockColor =
    item.stockLevel === "OK"
      ? "text-emerald-600"
      : item.stockLevel === "LOW"
      ? "text-amber-600"
      : "text-red-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="group card overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Brand color strip */}
      <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />

      {/* Product Image */}
      <div
        className="relative h-28 sm:h-36 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${grad1}, ${grad2})` }}
      >
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
          <Image
            src={categoryImg}
            alt={item.name}
            fill
            className="object-contain drop-shadow-md"
            sizes="96px"
          />
        </div>

        {/* Stock badge */}
        <div
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold backdrop-blur-sm",
            item.stockLevel === "OK"
              ? "bg-emerald-100/80 text-emerald-700"
              : item.stockLevel === "LOW"
              ? "bg-amber-100/80 text-amber-700"
              : "bg-red-100/80 text-red-700"
          )}
        >
          {item.stock} {item.unit}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {/* Category */}
        <div className="mb-1">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold border max-w-full truncate"
            style={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              borderColor: categoryColor.border,
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-[11px] sm:text-[12px] font-semibold text-[#111] leading-tight line-clamp-2 mb-1 min-h-[28px] sm:min-h-[32px]">
          {item.name}
        </h3>

        {/* Code & Brand */}
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-[#999] mb-2 overflow-hidden">
          <Tag className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="font-mono truncate">{item.code}</span>
          <span className="mx-0.5 flex-shrink-0">·</span>
          <span className="font-medium truncate" style={{ color: brandColor }}>
            {item.brand}
          </span>
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm sm:text-base font-bold text-[#111]">
              {formatCurrency(item.price)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#999]">/ {item.unit}</span>
          </div>

          {/* Add to Cart / Quantity Selector */}
          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAdd(item)}
              className="w-full py-1.5 sm:py-2 bg-[#111] text-white rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-1 active:bg-black"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Add to Cart
            </motion.button>
          ) : (
            <div className="flex items-center justify-between bg-[#111] rounded-lg overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onDecrement}
                className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </motion.button>
              <motion.span
                key={quantity}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white font-bold text-sm tabular-nums min-w-[24px] text-center"
              >
                {quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onIncrement}
                disabled={quantity >= item.stock}
                className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product List Item (List View) ───────────────────────────────────────
function ProductListItem({
  item,
  index,
  onAdd,
  quantity,
  onIncrement,
  onDecrement,
}: {
  item: Item;
  index: number;
  onAdd: (item: Item) => void;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const categoryImg = getCategoryImage(item.category);
  const categoryColor = getCategoryColor(item.category);
  const brandColor = getBrandColor(item.brand);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
      className="card p-3 flex items-center gap-3 hover:shadow-sm transition-all duration-150"
    >
      {/* Image */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 overflow-hidden">
        <div className="relative w-9 h-9 sm:w-12 sm:h-12">
          <Image
            src={categoryImg}
            alt={item.name}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 overflow-hidden">
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border flex-shrink-0 max-w-[100px] truncate"
            style={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              borderColor: categoryColor.border,
            }}
          >
            {item.category}
          </span>
          <span className="text-[10px] font-mono text-[#999] hidden sm:block truncate">{item.code}</span>
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-[#111] line-clamp-2 sm:line-clamp-1 leading-snug">{item.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: brandColor }}>
            {item.brand}
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#999]">
            {item.stock} {item.unit}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <div className="text-xs sm:text-sm font-bold text-[#111]">{formatCurrency(item.price)}</div>
        <div className="text-[9px] sm:text-[10px] text-[#999]">/{item.unit}</div>
      </div>

      {/* Add/Remove */}
      <div className="flex-shrink-0 min-w-[95px] sm:w-[120px]">
        {quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onAdd(item)}
            className="w-full py-2 bg-[#111] text-white rounded-lg text-xs font-semibold hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-[#111] rounded-lg overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onDecrement}
              className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </motion.button>
            <motion.span
              key={quantity}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white font-bold text-sm tabular-nums"
            >
              {quantity}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onIncrement}
              disabled={quantity >= item.stock}
              className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
