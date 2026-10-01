"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  QrCode,
  Share2,
  Mail,
} from "lucide-react";
import { INVOICES, Invoice } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentGatewayModal } from "@/components/ui/PaymentGatewayModal";
import { EmailInvoiceModal } from "@/components/invoices/EmailInvoiceModal";
import { useToast } from "@/components/ui/Toast";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = typeof params.id === "string" ? params.id : "INV-1044";

  const initialInvoice = INVOICES.find((i) => i.id === id || i.invoiceNo === id) || INVOICES[0];
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handlePaymentSuccess = (details: { transactionId: string; mode: string }) => {
    setInvoice((prev) => ({
      ...prev,
      paymentStatus: "PAID",
      amountReceived: prev.totalAmount,
    }));
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${invoice.customerName}, please find Tax Invoice ${invoice.invoiceNo} dated ${formatDate(
        invoice.invoiceDate
      )} for ₹${invoice.totalAmount.toLocaleString(
        "en-IN"
      )}. You can remit via NEFT or pay instantly online. Thank you! — TradeFlow Fasteners`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 border border-border rounded hover:bg-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                Tax Invoice {invoice.invoiceNo}
              </h1>
              <span
                className={`badge ${
                  invoice.paymentStatus === "PAID"
                    ? "badge-ok"
                    : invoice.paymentStatus === "PARTIAL"
                    ? "badge-low"
                    : "badge-critical"
                }`}
              >
                {invoice.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              GST Registered Tax Invoice under Section 31 of CGST Act, 2017
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="w-3.5 h-3.5" />
            Email to omjavia18@gmail.com
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp
          </button>

          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>

          {invoice.paymentStatus !== "PAID" && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Collect Payment Online
            </button>
          )}
        </div>
      </div>

      {/* Official GST Tax Invoice Sheet */}
      <div className="bg-white border border-border rounded-lg shadow-sm p-8 print:p-0 print:border-none print:shadow-none space-y-6 text-xs text-text-primary">
        {/* Invoice Title & Category */}
        <div className="border-b-2 border-[#111111] pb-4 flex items-start justify-between">
          <div>
            <div className="text-xl font-black tracking-tight text-text-primary uppercase">
              TradeFlow Fasteners & Hardware Pvt. Ltd.
            </div>
            <div className="text-text-muted text-[11px] mt-1 space-y-0.5">
              <div>Plot 14-B, Steel Market Yard, Kalamboli, Navi Mumbai, Maharashtra - 410218</div>
              <div>
                <strong>GSTIN:</strong> 27AABCT9981E1Z5 &nbsp;|&nbsp; <strong>PAN:</strong> AABCT9981E &nbsp;|&nbsp; <strong>State Code:</strong> 27 (Maharashtra)
              </div>
              <div>Email: accounts@tradeflow.in &nbsp;|&nbsp; Contact: +91 22 2742 8899</div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-[#111111] text-white font-bold text-xs px-3 py-1 uppercase tracking-wider rounded-sm">
              TAX INVOICE
            </span>
            <div className="text-[10px] text-text-muted mt-1 font-medium">
              Original for Recipient
            </div>
          </div>
        </div>

        {/* E-Invoice IRN Banner */}
        {invoice.irnNumber && (
          <div className="bg-bg-canvas border border-border p-2.5 rounded text-[11px] font-mono flex items-center justify-between">
            <div className="truncate max-w-xl">
              <span className="font-semibold font-sans text-text-muted">IRN (Invoice Ref): </span>
              <span className="text-text-primary text-[10px]">{invoice.irnNumber}</span>
            </div>
            <div className="text-text-muted text-[10px] font-sans flex-shrink-0">
              Ack No: 12261092839182 &nbsp;|&nbsp; Date: {formatDate(invoice.invoiceDate)}
            </div>
          </div>
        )}

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 border border-border rounded bg-bg-canvas/40">
          <div>
            <div className="text-text-muted text-[10px] uppercase font-semibold">Invoice Number</div>
            <div className="font-mono font-bold text-sm text-brand-primary">{invoice.invoiceNo}</div>
          </div>
          <div>
            <div className="text-text-muted text-[10px] uppercase font-semibold">Invoice Date</div>
            <div className="font-medium text-text-primary">{formatDate(invoice.invoiceDate)}</div>
          </div>
          <div>
            <div className="text-text-muted text-[10px] uppercase font-semibold">Payment Due Date</div>
            <div className="font-medium text-red-600">{formatDate(invoice.dueDate)}</div>
          </div>
          <div>
            <div className="text-text-muted text-[10px] uppercase font-semibold">Order Reference</div>
            <div className="font-mono font-medium text-text-primary">{invoice.orderNo}</div>
          </div>
        </div>

        {/* Transport & Supply Details */}
        <div className="grid grid-cols-3 gap-4 border-b border-border pb-4 text-[11px]">
          <div>
            <span className="text-text-muted">Place of Supply:</span>{" "}
            <strong>{invoice.placeOfSupply}</strong>
          </div>
          <div>
            <span className="text-text-muted">E-Way Bill No:</span>{" "}
            <span className="font-mono font-semibold">{invoice.ewayBillNo || "N/A"}</span>
          </div>
          <div>
            <span className="text-text-muted">Transporter & Vehicle:</span>{" "}
            <span>{invoice.transporter} ({invoice.vehicleNo})</span>
          </div>
        </div>

        {/* Billed To vs Shipped To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border pb-6">
          <div className="border border-border p-3.5 rounded bg-bg-canvas/30 space-y-1">
            <div className="font-bold text-text-muted text-[10px] uppercase tracking-wider">
              Details of Receiver / Billed To:
            </div>
            <div className="font-bold text-sm text-text-primary">{invoice.customerName}</div>
            <div className="text-text-secondary text-[11px]">{invoice.customerAddress}</div>
            <div className="text-[11px] pt-1">
              <strong>GSTIN / UIN:</strong> <span className="font-mono">{invoice.customerGstin}</span>
            </div>
            <div className="text-[11px]">
              <strong>State & Code:</strong> {invoice.customerState} ({invoice.customerStateCode})
            </div>
          </div>

          <div className="border border-border p-3.5 rounded bg-bg-canvas/30 space-y-1">
            <div className="font-bold text-text-muted text-[10px] uppercase tracking-wider">
              Details of Consignee / Shipped To:
            </div>
            <div className="font-bold text-sm text-text-primary">{invoice.customerName}</div>
            <div className="text-text-secondary text-[11px]">{invoice.customerAddress}</div>
            <div className="text-[11px] pt-1">
              <strong>Delivery Godown / Site:</strong> Sector 4 Unloading Yard
            </div>
            <div className="text-[11px]">
              <strong>Dispatch Date:</strong> {formatDate(invoice.invoiceDate)}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto border border-border rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111111] text-white text-[11px]">
              <tr>
                <th className="p-2.5 w-10 text-center">#</th>
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 w-24 text-center">HSN/SAC</th>
                <th className="p-2.5 w-20 text-center">Qty</th>
                <th className="p-2.5 w-24 text-right">Rate (₹)</th>
                <th className="p-2.5 w-20 text-center">Disc %</th>
                <th className="p-2.5 w-28 text-right">Taxable (₹)</th>
                <th className="p-2.5 w-24 text-right">CGST (9%)</th>
                <th className="p-2.5 w-24 text-right">SGST (9%)</th>
                <th className="p-2.5 w-28 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {invoice.items.map((line, idx) => (
                <tr key={line.id} className="hover:bg-hover/30">
                  <td className="p-2.5 text-center text-text-muted">{idx + 1}</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-text-primary">{line.itemName}</div>
                    <div className="font-mono text-[10px] text-text-muted">{line.itemCode}</div>
                  </td>
                  <td className="p-2.5 text-center font-mono text-[11px]">{line.hsnCode}</td>
                  <td className="p-2.5 text-center font-mono font-medium">
                    {line.qty} {line.unit}
                  </td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(line.rate)}</td>
                  <td className="p-2.5 text-center font-mono text-text-muted">
                    {line.discountPct > 0 ? `${line.discountPct}%` : "—"}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold">
                    {formatCurrency(line.taxableAmount)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-text-secondary">
                    {formatCurrency(line.cgstAmount)}
                  </td>
                  <td className="p-2.5 text-right font-mono text-text-secondary">
                    {formatCurrency(line.sgstAmount)}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-text-primary">
                    {formatCurrency(line.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Bank Account Details & UPI QR */}
          <div className="space-y-4">
            <div className="border border-border p-3 rounded bg-bg-canvas/40 space-y-2">
              <div className="font-bold text-[11px] text-text-primary flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-brand-primary" />
                <span>Bank Details for Electronic Remittance (RTGS / NEFT)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-text-muted block font-sans">Beneficiary:</span>
                  <span className="font-bold">TradeFlow Fasteners Pvt Ltd</span>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">Bank Name:</span>
                  <span>Yes Bank Ltd, Corporate Branch</span>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">Account No:</span>
                  <span className="font-bold text-brand-primary">00192830192839</span>
                </div>
                <div>
                  <span className="text-text-muted block font-sans">IFSC Code:</span>
                  <span className="font-bold">YESB0000019</span>
                </div>
              </div>
            </div>

            <div className="p-3 border border-border rounded flex items-center gap-3 bg-bg-canvas/20">
              <div className="w-14 h-14 bg-white p-1 border border-border rounded flex-shrink-0 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-[#111111]" />
              </div>
              <div className="text-[11px] space-y-0.5">
                <div className="font-bold text-text-primary">Scan to Pay via UPI</div>
                <div className="text-text-muted text-[10px]">
                  UPI ID: <strong>tradeflow.ops@yesbank</strong>
                </div>
                <div className="text-text-muted text-[10px]">
                  Supports GPay, PhonePe, Paytm, BHIM & All Banks
                </div>
              </div>
            </div>
          </div>

          {/* Amount Calculation Summary */}
          <div className="border border-border rounded p-4 bg-bg-canvas/30 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between py-1 text-text-secondary border-b border-border">
              <span>Total Taxable Amount:</span>
              <span className="font-bold text-text-primary">{formatCurrency(invoice.taxableAmount)}</span>
            </div>
            <div className="flex justify-between py-1 text-text-secondary border-b border-border">
              <span>Central GST (CGST 9%):</span>
              <span>{formatCurrency(invoice.cgst)}</span>
            </div>
            <div className="flex justify-between py-1 text-text-secondary border-b border-border">
              <span>State GST (SGST 9%):</span>
              <span>{formatCurrency(invoice.sgst)}</span>
            </div>
            <div className="flex justify-between py-1 text-text-secondary border-b border-border">
              <span>Integrated GST (IGST):</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-bold text-text-primary bg-bg-canvas px-2 rounded">
              <span>Invoice Total (INR):</span>
              <span className="text-base text-brand-primary">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="text-[10px] font-sans text-text-muted italic pt-1">
              Amount in words: Indian Rupees Twenty Seven Thousand Only
            </div>
          </div>
        </div>

        {/* Declarations & Signature */}
        <div className="pt-6 border-t border-border grid grid-cols-2 gap-6 items-end text-[11px]">
          <div className="space-y-1 text-text-muted">
            <div className="font-semibold text-text-primary">Terms & Conditions:</div>
            <div>1. Goods once sold will not be accepted back without prior written QC clearance.</div>
            <div>2. Interest @ 18% p.a. will be levied on overdue invoices past {invoice.dueDate}.</div>
            <div>3. Subject to Mumbai / Navi Mumbai jurisdiction only.</div>
          </div>

          <div className="text-right space-y-8">
            <div className="font-bold text-text-primary">
              For TradeFlow Fasteners & Hardware Pvt. Ltd.
            </div>
            <div className="text-text-muted text-[10px] border-t border-border/80 pt-1 inline-block min-w-[200px]">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoiceNo={invoice.invoiceNo}
        customerName={invoice.customerName}
        amount={invoice.totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Email Invoice Modal */}
      <EmailInvoiceModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        invoice={invoice}
        defaultEmail="omjavia18@gmail.com"
        onSuccess={() => {
          toast.success(
            "Invoice Sent",
            `Tax Invoice ${invoice.invoiceNo} was delivered to omjavia18@gmail.com`
          );
        }}
      />
    </div>
  );
}
