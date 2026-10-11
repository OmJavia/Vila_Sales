"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FileText, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { QUOTATIONS, Quotation } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function QuotationsPage() {
  const toast = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(QUOTATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConvert = async (id: string) => {
    try {
      const res = await fetch(`/api/quotations/${encodeURIComponent(id)}/convert`, {
        method: "POST",
      });

      const data = await res.json();
      if (!data.success) {
        toast.error("Conversion Failed", data.error || "Server could not convert quote");
        return;
      }

      setQuotations((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "ACCEPTED" as const } : q))
      );

      toast.success(
        "Quotation Converted to Order",
        `Created Sales Order ${data.order.orderNo}. Stock allocated and customer credit reserved.`
      );
    } catch (err: any) {
      toast.error("Network Error", err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Sales Quotations</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Formal price estimates and commercial proposals. Easily convert accepted quotes to orders.
          </p>
        </div>

        <Link href="/orders/new" className="btn-primary text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Create Quotation
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search quotation # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "SENT", "ACCEPTED", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                statusFilter === st
                  ? "bg-brand-primary text-white"
                  : "bg-bg-canvas text-text-secondary hover:bg-hover border border-border"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-sm">
            No quotations found matching filter.
          </div>
        ) : (
          filtered.map((quote) => (
            <div key={quote.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-sm text-brand-primary">
                    {quote.quotationNo}
                  </span>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {quote.customerName}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Attn: {quote.contactPerson}
                  </div>
                </div>
                <span
                  className={`badge ${
                    quote.status === "ACCEPTED"
                      ? "badge-ok"
                      : quote.status === "SENT"
                      ? "badge-low"
                      : "badge-normal"
                  }`}
                >
                  {quote.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-bg-canvas p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[10px]">Quote Date</span>
                  <span className="font-mono text-text-secondary">{formatDate(quote.date)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Valid Until</span>
                  <span className="font-mono text-text-secondary">{formatDate(quote.validUntil)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Items</span>
                  <span className="font-mono font-medium text-text-primary">{quote.itemsCount} items</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Total Value</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(quote.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                {quote.status === "ACCEPTED" ? (
                  <Link
                    href="/orders/new"
                    className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                  >
                    Create Order <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleConvert(quote.id)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Mark Accepted
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Quotations Table */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
              <tr>
                <th className="p-3">Quote #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Quote Date</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3 text-center">Items</th>
                <th className="p-3 text-right">Value (₹)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    No quotations found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => (
                  <tr key={quote.id} className="hover:bg-hover/50">
                    <td className="p-3 font-mono font-semibold text-brand-primary">
                      {quote.quotationNo}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-text-primary">{quote.customerName}</div>
                      <div className="text-[10px] text-text-muted">Attn: {quote.contactPerson}</div>
                    </td>
                    <td className="p-3 font-mono text-text-muted">{formatDate(quote.date)}</td>
                    <td className="p-3 font-mono text-text-muted">{formatDate(quote.validUntil)}</td>
                    <td className="p-3 text-center font-mono">{quote.itemsCount} items</td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {formatCurrency(quote.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`badge ${
                          quote.status === "ACCEPTED"
                            ? "badge-ok"
                            : quote.status === "SENT"
                            ? "badge-low"
                            : "badge-normal"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {quote.status === "ACCEPTED" ? (
                        <Link
                          href="/orders/new"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium hover:underline"
                        >
                          Create Order <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleConvert(quote.id)}
                          className="btn-secondary text-[11px] py-1 px-2.5"
                        >
                          Mark Accepted
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
