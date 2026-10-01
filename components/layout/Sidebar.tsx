"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Truck,
  Package,
  ArrowLeftRight,
  Users,
  AlertCircle,
  DollarSign,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  FileCheck,
  RotateCcw,
  ClipboardList,
  PackageSearch,
  PackageCheck,
  Layers,
  Receipt,
  CreditCard,
  TrendingUp,
  Building,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useShopStore } from "@/lib/shopStore";
import { useMobileNav } from "@/lib/mobileNavStore";
import { X } from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "B2B Store", href: "/shop", icon: Store },
  {
    label: "Sales",
    icon: ShoppingCart,
    children: [
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Quotations", href: "/quotations", icon: FileText },
      { label: "Challans", href: "/challans", icon: FileCheck },
      { label: "Invoices", href: "/invoices", icon: Receipt },
      { label: "Returns", href: "/returns", icon: RotateCcw },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Stock", href: "/inventory/stock", icon: Package },
      { label: "Movements", href: "/inventory/movements", icon: ArrowLeftRight },
      { label: "Allocation", href: "/inventory/allocation", icon: Layers },
      { label: "Transfers", href: "/inventory/transfers", icon: ArrowLeftRight },
      { label: "Adjustments", href: "/inventory/adjustments", icon: ClipboardList },
    ],
  },
  {
    label: "Purchase",
    icon: ShoppingBag,
    children: [
      { label: "Suppliers", href: "/purchase/suppliers", icon: Building },
      { label: "Requirements", href: "/purchase/requirements", icon: ClipboardList },
      { label: "RFQ", href: "/purchase/rfq", icon: FileText },
      { label: "Purchase Orders", href: "/purchase/orders", icon: ShoppingBag },
      { label: "Goods Receipt", href: "/purchase/receipt", icon: PackageCheck },
    ],
  },
  {
    label: "Dispatch",
    icon: Truck,
    children: [
      { label: "Ready to Dispatch", href: "/dispatch/ready", icon: PackageSearch },
      { label: "Dispatch", href: "/dispatch", icon: Truck },
      { label: "LR / POD", href: "/dispatch/lr-pod", icon: FileCheck },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    children: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Complaints", href: "/customers/complaints", icon: AlertCircle },
      { label: "Follow-ups", href: "/customers/followups", icon: ClipboardList },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    children: [
      { label: "Payments", href: "/finance/payments", icon: CreditCard },
      { label: "Receipts", href: "/finance/receipts", icon: Receipt },
      { label: "Outstanding", href: "/finance/outstanding", icon: TrendingUp },
    ],
  },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavSection({
  item,
  depth = 0,
  onLinkClick,
}: {
  item: NavItem;
  depth?: number;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((child) => child.href && pathname.startsWith(child.href));
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = useShopStore((s) => s.cart.reduce((sum, i) => sum + i.quantity, 0));

  if (!item.children) {
    const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
    const Icon = item.icon;
    const showCartBadge = mounted && item.href === "/shop" && cartCount > 0;

    return (
      <Link
        href={item.href ?? "#"}
        onClick={onLinkClick}
        className={cn(
          "nav-item flex items-center justify-between",
          isActive && "active",
          depth > 0 && "pl-8 text-[13px]"
        )}
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {item.label}
        </span>
        {showCartBadge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-black rounded-full leading-none">
            {cartCount}
          </span>
        )}
      </Link>
    );
  }

  const Icon = item.icon;
  const hasActiveChild = item.children.some(
    (child) => child.href && pathname.startsWith(child.href)
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "nav-item w-full justify-between",
          hasActiveChild && "text-white"
        )}
      >
        <span className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {item.label}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[rgba(255,255,255,0.3)]" />
        )}
      </button>

      {open && (
        <div className="mt-0.5 ml-0">
          {item.children.map((child) => (
            <NavSection
              key={child.label}
              item={child}
              depth={depth + 1}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeDrawer } = useMobileNav();

  // Automatically close mobile drawer when the route changes
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Don't show sidebar on login or landing
  if (pathname === "/login" || pathname === "/") return null;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Fixed on Desktop, Slide-over Drawer on Mobile) */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-[260px] lg:w-[240px] bg-[#111111] flex flex-col z-50 overflow-hidden transition-transform duration-250 ease-in-out shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Mobile Dismiss Button */}
        <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
              <Package className="w-4 h-4 text-[#111111]" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">TradeFlow</div>
              <div className="text-[rgba(255,255,255,0.4)] text-[10px] mt-0.5">Business Operations</div>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="lg:hidden p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 overscroll-contain">
          {NAV.map((item) => (
            <NavSection key={item.label} item={item} onLinkClick={closeDrawer} />
          ))}
        </nav>

        {/* User Info Bar */}
        <div className="border-t border-white/10 p-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
            AS
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-[13px] font-medium truncate">Amit Sharma</div>
            <div className="text-[rgba(255,255,255,0.4)] text-[10px]">Owner / Admin</div>
          </div>
        </div>
      </aside>
    </>
  );
}
