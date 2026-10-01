"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Package,
  Menu,
} from "lucide-react";
import { useMobileNav } from "@/lib/mobileNavStore";
import { useShopStore } from "@/lib/shopStore";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleDrawer, isOpen } = useMobileNav();
  const [mounted, setMounted] = useState(false);
  const cartCount = useShopStore((s) => s.cart.reduce((acc, i) => acc + i.quantity, 0));

  useEffect(() => setMounted(true), []);

  if (pathname === "/login" || pathname === "/") return null;

  const isMoreActive =
    !["/dashboard", "/shop", "/shop/cart", "/shop/checkout", "/orders", "/inventory/stock"].some(
      (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(path + "/"))
    );

  const tabs = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "B2B Store",
      href: "/shop",
      icon: Store,
      isActive: pathname.startsWith("/shop"),
      badge: mounted && cartCount > 0 ? cartCount : undefined,
    },
    {
      label: "Sales",
      href: "/orders",
      icon: ShoppingCart,
      isActive:
        pathname.startsWith("/orders") ||
        pathname.startsWith("/invoices") ||
        pathname.startsWith("/quotations") ||
        pathname.startsWith("/challans") ||
        pathname.startsWith("/returns"),
    },
    {
      label: "Inventory",
      href: "/inventory/stock",
      icon: Package,
      isActive: pathname.startsWith("/inventory"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] lg:hidden pb-safe">
      <div className="flex items-center justify-around h-14 px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center py-1 select-none transition-colors",
                tab.isActive ? "text-[#111111]" : "text-[#888888] hover:text-[#555555]"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", tab.isActive ? "stroke-[2.2px]" : "stroke-[1.8px]")} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black font-extrabold text-[9px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] mt-0.5 font-medium leading-none", tab.isActive ? "font-bold text-[#111111]" : "")}>
                {tab.label}
              </span>
              {tab.isActive && (
                <motion.div
                  layoutId="mobileNavActiveIndicator"
                  className="absolute bottom-0 w-8 h-[2.5px] bg-[#111111] rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={toggleDrawer}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center py-1 select-none transition-colors",
            isOpen || isMoreActive ? "text-[#111111]" : "text-[#888888] hover:text-[#555555]"
          )}
          aria-label="Open Full Navigation Menu"
        >
          <div className="relative">
            <Menu className={cn("w-5 h-5", isOpen || isMoreActive ? "stroke-[2.2px]" : "stroke-[1.8px]")} />
            {isMoreActive && (
              <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 bg-[#111111] rounded-full" />
            )}
          </div>
          <span className={cn("text-[10px] mt-0.5 font-medium leading-none", isOpen || isMoreActive ? "font-bold text-[#111111]" : "")}>
            Menu
          </span>
          {(isOpen || isMoreActive) && (
            <motion.div
              layoutId="mobileNavActiveIndicator"
              className="absolute bottom-0 w-8 h-[2.5px] bg-[#111111] rounded-full"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </button>
      </div>
    </nav>
  );
}
