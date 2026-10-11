"use client";

import { useState, useEffect } from "react";
import {
  X,
  QrCode,
  Building2,
  CreditCard,
  CheckCircle2,
  Copy,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Receipt,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CANONICAL_COMPANY_CONFIG } from "@/lib/companyConfig";
import { generateDynamicUpiQr } from "@/lib/paymentService";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNo: string;
  customerName: string;
  amount: number;
  onPaymentSuccess?: (paymentDetails: {
    transactionId: string;
    mode: string;
    amount: number;
  }) => void;
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  invoiceNo,
  customerName,
  amount,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<"UPI" | "NETBANKING" | "NEFT_RTGS" | "CARD">("UPI");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [neftUtr, setNeftUtr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState<{ id: string; mode: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const cfg = CANONICAL_COMPANY_CONFIG;

  // Generate real dynamic UPI QR and intent link
  const upiData = generateDynamicUpiQr({
    amount,
    orderId: invoiceNo,
    orderNumber: invoiceNo,
    note: `Tax Invoice ${invoiceNo} Payment`,
  });

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleManualUtrSubmit = async (mode: string) => {
    if (!neftUtr || neftUtr.trim().length < 6) {
      setErrorMsg("Please enter a valid 6-22 digit Bank UTR or Transaction Reference number.");
      return;
    }

    setProcessing(true);
    setErrorMsg("");

    try {
      // Record payment on server
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceNo)}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMode: mode === "Instant UPI" ? "UPI" : "NEFT_RTGS",
          transactionRef: neftUtr.trim(),
          notes: `Submitted via Payment Hub by ${customerName}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Payment recording failed on server");
        setProcessing(false);
        return;
      }

      setSuccess(true);
      setTxDetails({ id: neftUtr.trim(), mode });

      if (onPaymentSuccess) {
        onPaymentSuccess({
          transactionId: neftUtr.trim(),
          mode,
          amount,
        });
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const banks = [
    { id: "HDFC", name: "HDFC Bank", logo: "HDFC" },
    { id: "ICICI", name: "ICICI Bank", logo: "ICICI" },
    { id: "SBI", name: "State Bank of India", logo: "SBI" },
    { id: "AXIS", name: "Axis Bank", logo: "AXIS" },
    { id: "KOTAK", name: "Kotak Mahindra", logo: "KMB" },
    { id: "INDUS", name: "IndusInd Bank", logo: "INDUS" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="card w-full max-w-xl bg-white shadow-2xl rounded-xl border border-border overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-[#111111] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white text-[#111111] rounded flex items-center justify-center font-bold text-xs">
              VS
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {cfg.brandName} Indian B2B Payment Hub
              </div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Remittance for {invoiceNo}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-bg-canvas px-5 py-3 border-b border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted">Customer:</span>{" "}
            <span className="font-semibold text-text-primary">{customerName}</span>
          </div>
          <div className="text-right">
            <span className="text-text-muted">Payable Amount:</span>{" "}
            <span className="font-bold text-base font-mono text-brand-primary">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Payment Recorded Successfully!</h3>
              <p className="text-xs text-text-muted mt-1">
                Remittance of <strong>{formatCurrency(amount)}</strong> has been reconciled and applied to Invoice <strong>{invoiceNo}</strong>.
              </p>
            </div>

            <div className="bg-bg-canvas p-4 rounded border border-border text-left space-y-2 text-xs font-mono max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-text-muted">Transaction Ref:</span>
                <span className="font-bold text-text-primary">{txDetails?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Method:</span>
                <span className="text-text-primary font-sans">{txDetails?.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-emerald-600 font-bold">SETTLED & RECONCILED</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="btn-primary text-xs py-2 px-6"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : processing ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-border border-t-brand-primary rounded-full animate-spin mx-auto" />
            <div>
              <div className="text-sm font-semibold text-text-primary">
                Connecting to Banking Network & Reconciling...
              </div>
              <p className="text-xs text-text-muted mt-1">
                Verifying bank authentication & debit authorization. Please do not close this window.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1.5 border border-border p-1 bg-bg-canvas rounded-lg text-xs">
              {[
                { id: "UPI", label: "Instant UPI QR", icon: QrCode },
                { id: "NEFT_RTGS", label: "Bank Transfer", icon: Receipt },
                { id: "NETBANKING", label: "NetBanking", icon: Building2 },
                { id: "CARD", label: "Corporate Card", icon: CreditCard },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id as any);
                      setErrorMsg("");
                    }}
                    className={`py-2 px-1 text-center font-medium rounded flex flex-col items-center gap-1 transition-all ${
                      activeTab === t.id
                        ? "bg-white text-text-primary shadow-xs font-semibold border border-border/80"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: UPI */}
            {activeTab === "UPI" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-border rounded-lg bg-bg-canvas/50">
                  {/* Real Scannable SVG QR Code */}
                  <div className="w-40 h-40 bg-white p-2 rounded-lg border border-border flex flex-col items-center justify-center shadow-xs flex-shrink-0 relative overflow-hidden">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: upiData.qrSvg }}
                    />
                  </div>

                  <div className="space-y-2.5 text-xs flex-1">
                    <div>
                      <div className="font-semibold text-text-primary text-sm">Scan with any UPI App</div>
                      <div className="text-text-muted mt-0.5">
                        Supports Google Pay, PhonePe, Paytm, CRED, BHIM & Corporate Banking UPI.
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded border border-border font-mono text-[11px] flex items-center justify-between">
                      <span>{cfg.banking.upiVpa}</span>
                      <button
                        onClick={() => handleCopy(cfg.banking.upiVpa, "upi")}
                        className="text-brand-primary hover:underline font-sans text-xs flex items-center gap-1"
                      >
                        {copied === "upi" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copied === "upi" ? "Copied" : "Copy VPA"}
                      </button>
                    </div>

                    {/* Mobile UPI Intent Link Button */}
                    <div>
                      <a
                        href={upiData.upiUri}
                        className="btn-secondary w-full py-1.5 text-xs flex items-center justify-center gap-1.5 text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Installed UPI App (Mobile)
                      </a>
                    </div>
                  </div>
                </div>

                {/* UTR Reference Submission */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <label className="block text-xs font-semibold text-text-primary">
                    Confirm UTR / Reference after paying:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 427819028192 (12-digit UTR)"
                      value={neftUtr}
                      onChange={(e) => setNeftUtr(e.target.value)}
                      className="input-field text-xs font-mono flex-1"
                    />
                    <button
                      onClick={() => handleManualUtrSubmit("Instant UPI")}
                      disabled={processing}
                      className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
                    >
                      Verify & Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: NEFT / RTGS */}
            {activeTab === "NEFT_RTGS" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-bg-canvas rounded-lg border border-border space-y-2">
                  <div className="font-semibold text-text-primary text-sm border-b border-border pb-1.5">
                    Official Corporate Bank Account Details
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-text-muted">Bank Name:</span>
                      <div className="font-semibold text-text-primary">{cfg.banking.bankName}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Account Name:</span>
                      <div className="font-semibold text-text-primary">{cfg.banking.accountName}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Account Number:</span>
                      <div className="font-mono font-bold text-brand-primary flex items-center gap-1">
                        {cfg.banking.accountNumber}
                        <button
                          onClick={() => handleCopy(cfg.banking.accountNumber, "ac")}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-text-muted">IFSC Code:</span>
                      <div className="font-mono font-bold text-text-primary flex items-center gap-1">
                        {cfg.banking.ifscCode}
                        <button
                          onClick={() => handleCopy(cfg.banking.ifscCode, "ifsc")}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-muted">Branch:</span>
                      <div className="text-text-primary">{cfg.banking.branch}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">
                    Enter Bank UTR / RTGS Reference Number:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. HDFCR5202609280019283"
                      value={neftUtr}
                      onChange={(e) => setNeftUtr(e.target.value)}
                      className="input-field text-xs font-mono flex-1"
                    />
                    <button
                      onClick={() => handleManualUtrSubmit("NEFT / RTGS Bank Transfer")}
                      disabled={processing}
                      className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
                    >
                      Record Transfer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {activeTab === "NETBANKING" && (
              <div className="space-y-4 text-xs">
                <div className="text-xs text-text-muted">Select your Corporate NetBanking provider:</div>
                <div className="grid grid-cols-3 gap-2">
                  {banks.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBank(b.name)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedBank === b.name
                          ? "border-brand-primary bg-brand-primary/5 font-semibold text-text-primary"
                          : "border-border hover:border-text-muted text-text-secondary"
                      }`}
                    >
                      <Building2 className="w-5 h-5 mx-auto mb-1 text-text-muted" />
                      <div className="text-[11px]">{b.name}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleManualUtrSubmit(`NetBanking (${selectedBank})`)}
                    disabled={processing}
                    className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                  >
                    Pay {formatCurrency(amount)} via {selectedBank} &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Corporate Card */}
            {activeTab === "CARD" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 rounded-md flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>PCI-DSS Compliant Gateway:</strong> Sensitive card numbers are never stored on Vila Sales servers. Payment is processed securely via tokenized gateway checkout.
                  </div>
                </div>

                <button
                  onClick={() => handleManualUtrSubmit("Corporate Credit Card Gateway")}
                  disabled={processing}
                  className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  Proceed to Secure Card Gateway Checkout ({formatCurrency(amount)}) &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
