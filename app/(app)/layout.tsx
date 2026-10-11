"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ToastContainer } from "@/components/ui/Toast";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement>(null);

  // Lightweight CSS-only page transition — no full remount
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.classList.remove("page-enter");
    // Force reflow to restart animation
    void el.offsetHeight;
    el.classList.add("page-enter");
  }, [pathname]);

  const isStoreRoute = pathname === "/" || pathname?.startsWith("/shop");

  if (isStoreRoute) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
        <ShopHeader />
        <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs leading-5 text-amber-900">
          Preview catalogue only: live inventory, customer accounts, and secure checkout are not enabled in this environment. Do not use this preview to place an order or make a payment.
        </div>
        <main className="flex-1 min-h-[calc(100vh-90px)]">
          <div ref={mainRef} className="p-3 sm:p-4 md:p-6 page-enter max-w-7xl mx-auto overflow-x-hidden w-full">
            {children}
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-[240px] w-full min-w-0 transition-all duration-200">
        <TopBar />
        <main className="pt-[52px] pb-20 lg:pb-6 min-h-screen">
          <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs leading-5 text-amber-900">
            Prototype workspace: reports and operating screens may include demo fixtures. Shared production persistence, verified business masters, and end-to-end workflows are not configured. Do not use this environment for live transactions.
          </div>
          <div ref={mainRef} className="p-3 sm:p-4 md:p-6 page-enter max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav />
      <GlobalSearch />
      <ToastContainer />
    </div>
  );
}
