"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Copy, Send, ExternalLink, X, Eye, FileText } from "lucide-react";
import { Invoice } from "@/lib/data";
import { generateInvoiceHtml, SendEmailResult } from "@/lib/invoiceEmail";
import { formatCurrency, formatDate } from "@/lib/utils";

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function EmailInvoiceModal({
  isOpen,
  onClose,
  invoice,
  defaultEmail = "omjavia18@gmail.com",
  onSuccess,
}: EmailInvoiceModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [customNote, setCustomNote] = useState(
    "Please find attached your Tax Invoice for recent hardware supply. Kindly arrange remittance by the due date."
  );
  const [isSending, setIsSending] = useState(false);
  const [sentResult, setSentResult] = useState<SendEmailResult | null>(null);
  const [activeTab, setActiveTab] = useState<"send" | "preview">("send");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlPreview = generateInvoiceHtml(invoice, customNote);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/invoices/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice,
          recipientEmail: email,
          notes: customNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSentResult(data.details);
        onSuccess?.();
      } else {
        alert("Failed to send email: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error sending email: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(`[TradeFlow] Tax Invoice ${invoice.invoiceNo} - ₹${invoice.totalAmount.toLocaleString("en-IN")}`);
    const body = encodeURIComponent(
      `Dear ${invoice.customerName},\n\nPlease find the details of your Tax Invoice ${invoice.invoiceNo}:\n\n` +
      `Invoice Amount: ₹${invoice.totalAmount.toLocaleString("en-IN")}\n` +
      `Due Date: ${formatDate(invoice.dueDate)}\n` +
      `A/C No: 00192830192839 (Yes Bank Ltd)\n` +
      `IFSC: YESB0000019\n` +
      `UPI ID: tradeflow.ops@yesbank\n\n` +
      `View invoice online: http://localhost:3001/invoices/${invoice.id}\n\n` +
      `Regards,\nTradeFlow Fasteners & Hardware Pvt. Ltd.`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-bg-card rounded-xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-canvas/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Email GST Invoice {invoice.invoiceNo}
              </h2>
              <p className="text-xs text-text-muted">
                Send professional Tax Invoice directly to customer & your email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-hover rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-border bg-bg-canvas/20 px-6">
          <button
            onClick={() => setActiveTab("send")}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "send"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Send Email
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "preview"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Email Template Preview
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {sentResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Invoice Dispatched Successfully!
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                  A copy of Tax Invoice <strong>{invoice.invoiceNo}</strong> (₹{invoice.totalAmount.toLocaleString("en-IN")}) has been sent to{" "}
                  <span className="text-brand-primary font-semibold">{sentResult.deliveredTo}</span>.
                </p>
              </div>

              <div className="bg-bg-canvas/60 border border-border rounded-lg p-3 max-w-md mx-auto text-left text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Recipient:</span>
                  <span className="font-semibold text-text-primary">{sentResult.deliveredTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Status:</span>
                  <span className="text-emerald-600 font-semibold">Delivered / Sent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Message Ref:</span>
                  <span className="text-text-secondary truncate">{sentResult.messageId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-sans">Dispatched At:</span>
                  <span className="text-text-secondary">{new Date(sentResult.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleOpenMailto}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Email Client
                </button>
                <button
                  onClick={() => {
                    setSentResult(null);
                    onClose();
                  }}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeTab === "send" ? (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-text-muted uppercase font-semibold">
                    Invoice Details
                  </div>
                  <div className="font-bold text-sm text-text-primary mt-0.5">
                    {invoice.invoiceNo} &bull; {invoice.customerName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-text-muted uppercase font-semibold">
                    Total Amount
                  </div>
                  <div className="font-bold font-mono text-base text-brand-primary mt-0.5">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Recipient Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. omjavia18@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                    <span>Default recipient set to: <strong>omjavia18@gmail.com</strong></span>
                    <button
                      type="button"
                      onClick={() => setEmail("omjavia18@gmail.com")}
                      className="text-brand-primary hover:underline"
                    >
                      Reset to omjavia18@gmail.com
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`[TradeFlow] Tax Invoice ${invoice.invoiceNo} - ₹${invoice.totalAmount.toLocaleString("en-IN")}`}
                    className="w-full px-3 py-2 text-xs border border-border rounded-md bg-bg-canvas/50 text-text-secondary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Additional Message / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full p-2.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:border-brand-primary resize-none"
                  />
                </div>
              </div>

              {/* Features list */}
              <div className="bg-bg-canvas/40 border border-border rounded-lg p-3 text-[11px] text-text-muted space-y-1">
                <div className="font-semibold text-text-primary">What this email includes:</div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Official GST compliant B2B tax invoice table with HSN breakdown</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Direct online payment link & QR code instructions (UPI, RTGS, NetBanking)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Instant delivery confirmation to omjavia18@gmail.com</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-text-muted">
                This is a live rendering of the email that will be delivered to <strong>{email}</strong>:
              </div>
              <div className="border border-border rounded-lg overflow-hidden bg-white shadow-inner max-h-[420px] overflow-y-auto">
                <iframe
                  srcDoc={htmlPreview}
                  title="Invoice Email Preview"
                  className="w-full h-[400px] border-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sentResult && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-canvas/50">
            <button
              onClick={handleOpenMailto}
              className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open via Default Mailer
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !email}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending to {email}...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send to {email}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
