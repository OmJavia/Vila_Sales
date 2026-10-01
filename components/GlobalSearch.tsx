"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Users,
  Package,
  FileText,
  Truck,
  CreditCard,
  X,
} from "lucide-react";
import { ORDERS, CUSTOMERS, ITEMS } from "@/lib/data";

interface SearchResult {
  id: string;
  type: "order" | "customer" | "item" | "invoice";
  title: string;
  subtitle: string;
  href: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const TYPE_ICON = {
  order: ShoppingCart,
  customer: Users,
  item: Package,
  invoice: FileText,
};

const TYPE_LABEL = {
  order: "Order",
  customer: "Customer",
  item: "Item",
  invoice: "Invoice",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 200);

  // Cmd+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results: SearchResult[] = [];

  if (debouncedQuery.length >= 1) {
    const q = debouncedQuery.toLowerCase();

    ORDERS.forEach((order) => {
      if (
        order.orderNo.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q)
      ) {
        results.push({
          id: order.id,
          type: "order",
          title: `Order ${order.orderNo}`,
          subtitle: `${order.customerName} · ₹${order.totalAmount.toLocaleString("en-IN")} · ${order.status}`,
          href: `/orders/${order.id}`,
        });
      }
    });

    CUSTOMERS.forEach((customer) => {
      if (
        customer.name.toLowerCase().includes(q) ||
        customer.gstin.toLowerCase().includes(q) ||
        customer.city.toLowerCase().includes(q)
      ) {
        results.push({
          id: customer.id,
          type: "customer",
          title: customer.name,
          subtitle: `${customer.city} · GSTIN: ${customer.gstin}`,
          href: `/customers/${customer.id}`,
        });
      }
    });

    ITEMS.forEach((item) => {
      if (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q)
      ) {
        results.push({
          id: item.id,
          type: "item",
          title: item.name,
          subtitle: `${item.code} · Stock: ${item.stock} ${item.unit} · ₹${item.price}/${item.unit}`,
          href: `/inventory/stock`,
        });
      }
    });
  }

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
    },
    [router]
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-[#EAEAEA] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter={false}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EAEAEA]">
                    <Search className="w-4 h-4 text-[#666666] flex-shrink-0" />
                    <Command.Input
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Search orders, customers, items..."
                      className="flex-1 text-sm outline-none bg-transparent text-[#111111] placeholder:text-[#999999]"
                      autoFocus
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="text-[#999999] hover:text-[#111111]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <kbd className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#F7F7F7] border border-[#EAEAEA] rounded text-[#666666]">
                      ESC
                    </kbd>
                  </div>

                  <Command.List className="max-h-[360px] overflow-y-auto p-2">
                    {!query && (
                      <Command.Empty className="py-8 text-center text-sm text-[#999999]">
                        Start typing to search across orders, customers, and items
                      </Command.Empty>
                    )}

                    {query && results.length === 0 && (
                      <Command.Empty className="py-8 text-center text-sm text-[#999999]">
                        No results for "{query}"
                      </Command.Empty>
                    )}

                    {results.length > 0 && (
                      <Command.Group>
                        {results.map((result) => {
                          const Icon = TYPE_ICON[result.type];
                          return (
                            <Command.Item
                              key={result.id}
                              value={result.id}
                              onSelect={() => navigate(result.href)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer hover:bg-[#F7F7F7] data-[selected=true]:bg-[#F7F7F7] transition-colors duration-100"
                            >
                              <div className="w-7 h-7 rounded-md bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                                <Icon className="w-3.5 h-3.5 text-[#666666]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#111111]">{result.title}</div>
                                <div className="text-xs text-[#666666] truncate">{result.subtitle}</div>
                              </div>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#EAEAEA] rounded text-[#666666]">
                                {TYPE_LABEL[result.type]}
                              </span>
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
