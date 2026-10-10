"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Search, Menu, ShoppingCart, Users, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMobileNav } from "@/lib/mobileNavStore";
import { useShopStore } from "@/lib/shopStore";
import { NotificationBell } from "@/components/ui/NotificationPanel";
import { useWorkerStore, WORKERS } from "@/lib/workerStore";

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
  "/workers": ["Workers", "Manage Workers"],
  "/worker": ["Worker Portal", "Dashboard"],
  "/worker/tasks": ["Worker Portal", "My Tasks"],
  "/notifications/test": ["Notifications", "Expo Push Tester"],
};

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleDrawer } = useMobileNav();
  const [mounted, setMounted] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const cartCount = useShopStore((s) => s.cart.reduce((sum, i) => sum + i.quantity, 0));
  const { currentRole, currentWorkerId, switchToWorker, switchToAdmin } = useWorkerStore();
  const currentWorker = currentWorkerId ? WORKERS.find(w => w.id === currentWorkerId) : null;

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
      <NotificationBell />

      {/* Role / Avatar */}
      <div className="relative">
        <button
          onClick={() => setShowRoleSwitcher(v => !v)}
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold cursor-pointer transition-colors duration-100 flex-shrink-0",
            currentRole === "WORKER" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#111111] hover:bg-[#333333]"
          )}
          title={currentRole === "WORKER" ? `Worker: ${currentWorker?.name}` : "Admin"}
        >
          {currentRole === "WORKER" ? (currentWorker?.initials ?? "W") : "AS"}
        </button>

        {/* Role Switcher Dropdown */}
        {showRoleSwitcher && mounted && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRoleSwitcher(false)} />
            <div className="absolute right-0 top-9 w-56 bg-white rounded-xl border border-[#EAEAEA] shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-[#EAEAEA] bg-[#FAFAFA]">
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Switch Role</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { switchToAdmin(); router.push("/dashboard"); setShowRoleSwitcher(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    currentRole === "ADMIN" ? "bg-[#111] text-white" : "hover:bg-[#F5F5F5] text-[#333]"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-[#111] flex items-center justify-center text-white text-[10px] font-bold">AS</div>
                  <div>
                    <div className="font-semibold text-[13px]">Admin View</div>
                    <div className="text-[10px] opacity-60">Amit Sharma</div>
                  </div>
                </button>
                <div className="h-px bg-[#EAEAEA] my-1" />
                {WORKERS.filter(w => w.isActive).map(worker => (
                  <button
                    key={worker.id}
                    onClick={() => { switchToWorker(worker.id); router.push("/worker"); setShowRoleSwitcher(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                      currentRole === "WORKER" && currentWorkerId === worker.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-[#F5F5F5] text-[#333]"
                    )}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">{worker.initials}</div>
                    <div>
                      <div className="font-semibold text-[13px]">{worker.name}</div>
                      <div className="text-[10px] opacity-60">{worker.role} · {worker.godown}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
