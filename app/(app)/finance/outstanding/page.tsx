"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, MessageCircle, Phone, Search, Download, AlertTriangle } from "lucide-react";
import { OUTSTANDING_RECORDS, OutstandingRecord } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OutstandingPage() {
  const [records] = useState<OutstandingRecord[]>(OUTSTANDING_RECORDS);
  const [search, setSearch] = useState("");

  const filtered = records.filter(
    (r) =>
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = records.reduce((acc, r) => acc + r.totalOutstanding, 0);
  const total0to30 = records.reduce((acc, r) => acc + r.bucket0to30, 0);
  const total31to60 = records.reduce((acc, r) => acc + r.bucket31to60, 0);
  const total61to90 = records.reduce((acc, r) => acc + r.bucket61to90, 0);

  const handleWhatsAppReminder = (record: OutstandingRecord) => {
    const text = encodeURIComponent(
      `Dear ${record.contactPerson}, Greetings from Vila Sales! This is a gentle reminder regarding your outstanding balance of ₹${record.totalOutstanding.toLocaleString(
        "en-IN"
      )}. Kindly process the payment at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/${record.phone.replace(/[^0-9]/g, "")}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Accounts Receivable & Aging Analysis</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Credit exposure monitoring, aged debtors buckets (0-30, 31-60, 61-90 days), and payment reminders.
          </p>
        </div>
      </div>

      {/* Aging KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-brand-primary">
          <div className="text-xs text-text-muted">Total Receivables</div>
          <div className="text-xl font-bold font-mono text-text-primary mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-emerald-500">
          <div className="text-xs text-text-muted">Current (0 - 30 Days)</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatCurrency(total0to30)}
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-amber-500">
          <div className="text-xs text-text-muted">Due (31 - 60 Days)</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            {formatCurrency(total31to60)}
          </div>
        </div>
        <div className="card p-4 border-l-4 border-l-red-500">
          <div className="text-xs text-text-muted">Critical (61 - 90 Days)</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">
            {formatCurrency(total61to90)}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Primary Contact</th>
              <th className="p-3 text-right">0 - 30 Days</th>
              <th className="p-3 text-right">31 - 60 Days</th>
              <th className="p-3 text-right">61 - 90 Days</th>
              <th className="p-3 text-right">Total Due (₹)</th>
              <th className="p-3 text-center">Last Payment</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.customerId} className="hover:bg-hover/50">
                <td className="p-3">
                  <Link
                    href={`/customers/${r.customerId}`}
                    className="font-semibold text-text-primary hover:text-brand-primary hover:underline"
                  >
                    {r.customerName}
                  </Link>
                </td>
                <td className="p-3">
                  <div className="text-text-primary">{r.contactPerson}</div>
                  <div className="text-[10px] font-mono text-text-muted">{r.phone}</div>
                </td>
                <td className="p-3 text-right font-mono">{formatCurrency(r.bucket0to30)}</td>
                <td className="p-3 text-right font-mono text-amber-600 font-medium">
                  {formatCurrency(r.bucket31to60)}
                </td>
                <td className="p-3 text-right font-mono text-red-600 font-medium">
                  {formatCurrency(r.bucket61to90)}
                </td>
                <td className="p-3 text-right font-mono font-bold text-text-primary">
                  {formatCurrency(r.totalOutstanding)}
                </td>
                <td className="p-3 text-center font-mono text-text-muted">
                  {formatDate(r.lastPaymentDate)}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleWhatsAppReminder(r)}
                    className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1.5 text-emerald-700 hover:border-emerald-300"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
