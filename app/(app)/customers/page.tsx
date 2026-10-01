"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Plus, Search, ChevronRight, Building2, TrendingUp, AlertCircle } from "lucide-react";
import { fetchCustomers } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency, cn } from "@/lib/utils";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const filtered = useMemo(() => {
    if (!customers) return [];
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Customers</h1>
          <p className="text-sm text-[#666666] mt-0.5">
            {isLoading ? "Loading..." : `${filtered.length} customers`}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-semibold rounded-md hover:bg-[#333333] transition-colors duration-100">
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white border border-[#EAEAEA] rounded-lg shadow-xs p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, GSTIN, contact person..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#EAEAEA] rounded-md outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all duration-150"
          />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-2.5">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 space-y-2">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-[#999999] text-sm">
            No customers match your search
          </div>
        ) : (
          filtered.map((customer, index) => {
            const creditPct = (customer.creditUsed / customer.creditLimit) * 100;
            const creditWarning = creditPct > 85;
            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 6) * 0.03 }}
                onClick={() => router.push(`/customers/${customer.id}`)}
                className="card p-3.5 space-y-2.5 cursor-pointer active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center text-[11px] font-bold text-[#444] flex-shrink-0">
                      {customer.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111111] truncate">{customer.name}</div>
                      <div className="text-[11px] text-[#666666] flex items-center gap-2 mt-0.5">
                        <span>{customer.city}</span>
                        <span>•</span>
                        <span>{customer.contactPerson}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#999] flex-shrink-0 mt-1" />
                </div>

                {/* Credit usage bar */}
                <div className="bg-[#F9F9F9] rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#666]">Credit Used</span>
                    <span className={cn("font-semibold", creditWarning ? "text-[#DC2626]" : "text-[#111]")}>
                      {Math.round(creditPct)}% (₹{(customer.creditUsed / 100000).toFixed(1)}L / ₹{(customer.creditLimit / 100000).toFixed(1)}L)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", creditWarning ? "bg-[#DC2626]" : "bg-[#16A34A]")}
                      style={{ width: `${Math.min(creditPct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-[#F0F0F0] text-xs">
                  <div>
                    <span className="text-[#999]">Outstanding: </span>
                    <span className={cn(
                      "font-semibold font-mono",
                      customer.outstandingAmount > customer.creditLimit * 0.8 ? "text-[#DC2626]" : "text-[#111]"
                    )}>
                      ₹{customer.outstandingAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[#666]">
                    <span>{customer.paymentTerms}d terms</span>
                    <span className="font-semibold text-[#111]">{customer.totalOrders} orders</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white border border-[#EAEAEA] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>City</th>
                <th>GSTIN</th>
                <th>Contact</th>
                <th>Credit Limit</th>
                <th>Credit Used</th>
                <th>Outstanding</th>
                <th>Terms</th>
                <th>Orders</th>
                <th className="w-8" />
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={5} cols={10} />
            ) : (
              <tbody>
                {filtered.map((customer, index) => {
                  const creditPct = (customer.creditUsed / customer.creditLimit) * 100;
                  const creditWarning = creditPct > 85;
                  return (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 4) * 0.04 }}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#F7F7F7] border border-[#EAEAEA] flex items-center justify-center text-[10px] font-semibold text-[#666666]">
                            {customer.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#111111]">{customer.name}</div>
                            <div className="text-xs text-[#999999]">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-[#666666]">{customer.city}</td>
                      <td>
                        <span className="font-mono text-xs text-[#666666]">{customer.gstin}</span>
                      </td>
                      <td className="text-sm text-[#666666]">{customer.contactPerson}</td>
                      <td className="tabular-nums text-sm text-[#666666]">
                        ₹{(customer.creditLimit / 100000).toFixed(1)}L
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                creditWarning ? "bg-[#DC2626]" : "bg-[#16A34A]"
                              )}
                              style={{ width: `${Math.min(creditPct, 100)}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-semibold tabular-nums", creditWarning ? "text-[#DC2626]" : "text-[#666666]")}>
                            {Math.round(creditPct)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={cn(
                          "tabular-nums text-sm font-semibold",
                          customer.outstandingAmount > customer.creditLimit * 0.8
                            ? "text-[#DC2626]"
                            : "text-[#111111]"
                        )}>
                          ₹{(customer.outstandingAmount / 1000).toFixed(0)}K
                        </span>
                      </td>
                      <td className="text-sm text-[#666666]">{customer.paymentTerms}d</td>
                      <td className="text-sm font-semibold text-[#111111] tabular-nums">{customer.totalOrders}</td>
                      <td>
                        <ChevronRight className="w-4 h-4 text-[#EAEAEA]" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
