"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Search, Bell, Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMobileNav } from "@/lib/mobileNavStore";
import { useShopStore } from "@/lib/shopStore";

const BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/shop": ["B2B Store", "Catalog"],
  "/shop/cart": ["B2B Store", "Cart"],
  "/shop/checkout": ["B2B Store", "Checkout"],
  "/orders": ["Sales", "Orders"],
  "/quotations": ["Sales", "Quotations"],
  "/challans": ["Sales", "Challans"],
  "/invoices": ["Sales", "Invoices"],
  "/returns": ["Sales", "Returns"],
  "/inventory/stock": ["Inventory", "Stock"],
  "/inventory/movements": ["Inventory", "Movements"],
  "/inventory/allocation": ["Inventory", "Allocation"],
  "/purchase/suppliers": ["Purchase", "Suppliers"],
  "/purchase/requirements": ["Purchase", "Requirements"],
  "/purchase/rfq": ["Purchase", "Request for Quotation (RFQ)"],
  "/purchase/orders": ["Purchase", "Purchase Orders"],
  "/purchase/receipt": ["Purchase", "Goods Receipt"],
  "/dispatch": ["Dispatch"],
  "/dispatch/ready": ["Dispatch", "Ready"],
  "/dispatch/lr-pod": ["Dispatch", "LR / POD"],
  "/customers": ["Customers"],
  "/customers/complaints": ["Customers", "Complaints"],
  "/customers/followups": ["Customers", "Follow-ups"],
  "/finance/payments": ["Finance", "Payments"],
  "/finance/outstanding": ["Finance", "Outstanding"],
  "/reports": ["Reports"],
  "/settings": ["Settings"],
};

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const pathname = usePathname();
  const { toggleDrawer } = useMobileNav();
  const [mounted, setMounted] = useState(false);
  const cartCount = useShopStore((s) => s.cart.reduce((sum, i) => sum + i.quantity, 0));

  useEffect(() => setMounted(true), []);

  if (pathname === "/login" || pathname === "/") return null;

  // Build breadcrumbs
  const breadcrumbs = BREADCRUMBS[pathname] ?? [];
  const dynamicTitle = title ?? breadcrumbs[breadcrumbs.length - 1] ?? "Page";

  return (
    <header className="fixed top-0 left-0 lg:left-[240px] right-0 h-[52px] bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] z-30 flex items-center px-3 sm:px-5 gap-2 sm:gap-4">
      {/* Mobile Hamburger Drawer Trigger */}
      <button
        onClick={toggleDrawer}
        className="lg:hidden p-2 -ml-1 rounded-md text-[#444444] hover:text-[#111111] hover:bg-[#F0F0F0] active:bg-[#EAEAEA] transition-colors"
        aria-label="Toggle navigation drawer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <div className="hidden sm:flex items-center gap-1.5 text-[#999999] truncate">
          {breadcrumbs.slice(0, -1).map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs sm:text-sm">{crumb}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ))}
        </div>
        <span className="text-sm font-semibold text-[#111111] truncate">{dynamicTitle}</span>
      </div>

      {/* Mobile & Desktop Search Trigger */}
      <button
        onClick={() => {
          const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
          window.dispatchEvent(event);
        }}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-[#F7F7F7] border border-[#EAEAEA] rounded-md text-[#999999] text-sm hover:border-[#ccc] transition-colors duration-100"
        aria-label="Search items and orders"
      >
        <Search className="w-3.5 h-3.5 text-[#666666]" />
        <span className="text-xs hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-[10px] font-semibold px-1 py-0.5 bg-white border border-[#EAEAEA] rounded">
          ⌘K
        </kbd>
      </button>

      {/* Mobile B2B Cart Shortcut */}
      {mounted && cartCount > 0 && (
        <Link
          href="/shop/cart"
          className="relative p-2 rounded-md hover:bg-[#F7F7F7] transition-colors duration-100 text-[#333333]"
          aria-label="View Shopping Cart"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="absolute top-1 right-1 bg-amber-500 text-black font-extrabold text-[9px] px-1 py-0.2 rounded-full min-w-[15px] text-center leading-none">
            {cartCount}
          </span>
        </Link>
      )}

      {/* Page-Specific Actions */}
      {actions && <div className="hidden sm:flex items-center gap-2">{actions}</div>}

      {/* Notifications */}
      <button
        className="relative p-2 rounded-md hover:bg-[#F7F7F7] transition-colors duration-100"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-[#666666]" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer hover:bg-[#333333] transition-colors duration-100 flex-shrink-0">
        AS
      </div>
    </header>
  );
}
