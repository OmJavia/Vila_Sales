"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ToastContainer } from "@/components/ui/Toast";
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

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-[240px] w-full min-w-0 transition-all duration-200">
        <TopBar />
        <main className="pt-[52px] pb-20 lg:pb-6 min-h-screen">
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
