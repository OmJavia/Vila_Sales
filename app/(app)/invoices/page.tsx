"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Receipt, Download, FileText, CheckCircle, CreditCard, ArrowRight, Eye, Plus, Mail } from "lucide-react";
import { INVOICES, Invoice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentGatewayModal } from "@/components/ui/PaymentGatewayModal";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { EmailInvoiceModal } from "@/components/invoices/EmailInvoiceModal";
import { useToast } from "@/components/ui/Toast";

export default function InvoicesPage() {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeEmailInvoice, setActiveEmailInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderNo.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalReceived = invoices.reduce((acc, i) => acc + i.amountReceived, 0);
  const totalPending = totalInvoiced - totalReceived;

  const handlePaymentSuccess = () => {
    if (!activePaymentInvoice) return;
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === activePaymentInvoice.id
          ? { ...i, paymentStatus: "PAID", amountReceived: i.totalAmount }
          : i
      )
    );
    toast.success("Payment recorded successfully", `Invoice ${activePaymentInvoice.invoiceNo} marked as PAID`);
  };

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    toast.success(
      "Invoice Created Successfully",
      `Invoice ${newInvoice.invoiceNo} generated and emailed to omjavia18@gmail.com`
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Tax Invoices (GST)</h1>
          <p className="text-xs text-text-muted mt-0.5">
            B2B GST compliant sales invoices, CGST/SGST/IGST breakdown, email delivery, and payment gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invoices/INV-1044"
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
          >
            <Eye className="w-3.5 h-3.5" />
            View Demo GST Invoice
          </Link>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Tax Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-text-muted">Total Invoiced (This Month)</div>
          <div className="text-xl font-bold font-mono text-text-primary mt-1">
            {formatCurrency(totalInvoiced)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Total Collections Received</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            {formatCurrency(totalReceived)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-text-muted">Pending Outstanding Due</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">
            {formatCurrency(totalPending)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search invoice #, customer or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded bg-background focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "PAID", "PARTIAL", "PENDING", "OVERDUE"].map((st) => (
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

      {/* Mobile Invoices Card List */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-text-muted text-sm">
            No invoices match your search or filter.
          </div>
        ) : (
          filtered.map((inv) => (
            <div key={inv.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-mono font-bold text-sm text-brand-primary hover:underline block"
                  >
                    {inv.invoiceNo}
                  </Link>
                  <div className="text-sm font-semibold text-text-primary mt-0.5">
                    {inv.customerName}
                  </div>
                  <div className="text-[11px] text-text-muted font-mono mt-0.5">
                    Order: {inv.orderNo}
                  </div>
                </div>
                <span
                  className={`badge ${
                    inv.paymentStatus === "PAID"
                      ? "badge-ok"
                      : inv.paymentStatus === "PARTIAL"
                      ? "badge-low"
                      : "badge-critical"
                  }`}
                >
                  {inv.paymentStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-bg-canvas p-2.5 rounded-lg border border-border">
                <div>
                  <span className="text-text-muted block text-[10px]">Invoice Date</span>
                  <span className="font-mono text-text-secondary">{formatDate(inv.invoiceDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Due Date</span>
                  <span className="font-mono text-text-secondary">{formatDate(inv.dueDate)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Taxable Amount</span>
                  <span className="font-mono font-medium text-text-primary">{formatCurrency(inv.taxableAmount)}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Total Amount</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(inv.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => setActiveEmailInvoice(inv)}
                  className="btn-secondary text-xs py-1.5 px-2.5 inline-flex items-center gap-1 text-brand-primary"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>

                <Link
                  href={`/invoices/${inv.id}`}
                  className="btn-secondary text-xs py-1.5 px-2.5 inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>

                {inv.paymentStatus !== "PAID" ? (
                  <button
                    onClick={() => setActivePaymentInvoice(inv)}
                    className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold px-2 py-1">
                    Settled
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-bg-canvas text-text-muted font-medium border-b border-border">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Invoice Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Taxable (₹)</th>
                <th className="p-3 text-right">GST (₹)</th>
                <th className="p-3 text-right">Invoice Total (₹)</th>
                <th className="p-3 text-center">Payment Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-hover/50">
                  <td className="p-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono font-semibold text-brand-primary hover:underline block"
                    >
                      {inv.invoiceNo}
                    </Link>
                    <div className="text-[10px] text-text-muted">Order: {inv.orderNo}</div>
                  </td>
                  <td className="p-3 font-medium text-text-primary">{inv.customerName}</td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(inv.invoiceDate)}</td>
                  <td className="p-3 font-mono text-text-muted">{formatDate(inv.dueDate)}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(inv.taxableAmount)}</td>
                  <td className="p-3 text-right font-mono text-text-muted">
                    {formatCurrency(inv.cgst + inv.sgst + inv.igst)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-text-primary">
                    {formatCurrency(inv.totalAmount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`badge ${
                        inv.paymentStatus === "PAID"
                          ? "badge-ok"
                          : inv.paymentStatus === "PARTIAL"
                          ? "badge-low"
                          : "badge-critical"
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setActiveEmailInvoice(inv)}
                        title="Email Invoice to omjavia18@gmail.com"
                        className="btn-secondary text-[11px] py-1 px-2 inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary hover:border-brand-primary/50"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </button>

                      <Link
                        href={`/invoices/${inv.id}`}
                        className="btn-secondary text-[11px] py-1 px-2 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>

                      {inv.paymentStatus !== "PAID" ? (
                        <button
                          onClick={() => setActivePaymentInvoice(inv)}
                          className="btn-primary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold px-2 py-0.5">
                          Settled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {activePaymentInvoice && (
        <PaymentGatewayModal
          isOpen={!!activePaymentInvoice}
          onClose={() => setActivePaymentInvoice(null)}
          invoiceNo={activePaymentInvoice.invoiceNo}
          customerName={activePaymentInvoice.customerName}
          amount={activePaymentInvoice.totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Email Invoice Modal */}
      {activeEmailInvoice && (
        <EmailInvoiceModal
          isOpen={!!activeEmailInvoice}
          onClose={() => setActiveEmailInvoice(null)}
          invoice={activeEmailInvoice}
          defaultEmail="omjavia18@gmail.com"
          onSuccess={() => {
            toast.success(
              "Invoice Emailed",
              `Invoice ${activeEmailInvoice.invoiceNo} was dispatched to omjavia18@gmail.com`
            );
          }}
        />
      )}
    </div>
  );
}
