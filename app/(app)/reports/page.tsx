"use client";

import { useState } from "react";
import { BarChart2, TrendingUp, DollarSign, Package, Users, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>("THIS_MONTH");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Reports & Business Analytics</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Operational summaries, gross margins, SKU turnover rate, and customer concentration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-border rounded px-3 py-1.5 bg-background font-medium"
          >
            <option value="THIS_MONTH">This Month (September 2026)</option>
            <option value="LAST_MONTH">Last Month (August 2026)</option>
            <option value="Q2">Q2 FY 26-27</option>
            <option value="YTD">YTD FY 26-27</option>
          </select>
          <button
            onClick={() => alert("Exporting report as Excel spreadsheet...")}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* High-Level Financial Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-text-muted">Total Sales Turnover</div>
          <div className="text-xl font-bold font-mono text-text-primary mt-1">₹48,20,000</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">↑ +14.2% vs last month</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Material Procurement Cost</div>
          <div className="text-xl font-bold font-mono text-text-primary mt-1">₹37,60,000</div>
          <div className="text-[11px] text-text-muted mt-1">COGS 78%</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Estimated Gross Margin</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">₹10,60,000</div>
          <div className="text-[11px] text-text-muted mt-1">21.9% Margin</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Inventory Valuation</div>
          <div className="text-xl font-bold font-mono text-text-primary mt-1">₹62,40,000</div>
          <div className="text-[11px] text-text-muted mt-1">Across 2 Godowns</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Items */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Top 5 Fast-Moving Items by Turnover
          </h2>
          <div className="space-y-3">
            {[
              { name: "AJAX 1000×20 GREEN ANCHOR BOLT", code: "AJX-1000-20-GRN", sold: "450 Boxes", revenue: 540000 },
              { name: "SILVER 750×16 HEX BOLT M16", code: "SLV-750-16-HEX", sold: "1,200 Kg", revenue: 420000 },
              { name: "POWERFIT 300×10 SS WASHER", code: "PWF-300-10-SS", sold: "2,400 Kg", revenue: 300000 },
              { name: "ULTRA 200×8 SELF DRILL SCREW", code: "ULT-200-08-SDS", sold: "850 Boxes", revenue: 153000 },
              { name: "MAXGRIP 500×12 SOCKET HEAD", code: "MGP-500-12-SKT", sold: "190 Boxes", revenue: 106400 },
            ].map((it, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-border pb-2">
                <div>
                  <div className="font-medium text-text-primary">{it.name}</div>
                  <div className="text-[10px] font-mono text-text-muted">{it.code} · Vol: {it.sold}</div>
                </div>
                <div className="font-mono font-semibold text-text-primary">
                  {formatCurrency(it.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Revenue Concentration */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Customer Revenue Contribution
          </h2>
          <div className="space-y-3">
            {[
              { name: "ABC Industries Pvt. Ltd.", city: "Mumbai", share: "34%", amount: 1638800 },
              { name: "Sunrise Traders", city: "Pune", share: "24%", amount: 1156800 },
              { name: "Bharat Steel Works", city: "Nagpur", share: "18%", amount: 867600 },
              { name: "Metro Hardware Co.", city: "Nashik", share: "14%", amount: 674800 },
              { name: "Excellent Builders", city: "Aurangabad", share: "10%", amount: 482000 },
            ].map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">{c.name} ({c.city})</span>
                  <span className="font-mono text-text-secondary">{formatCurrency(c.amount)} ({c.share})</span>
                </div>
                <div className="h-1.5 bg-bg-canvas rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-brand-primary rounded-full"
                    style={{ width: c.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
