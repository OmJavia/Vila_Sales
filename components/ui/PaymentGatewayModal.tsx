"use client";

import { useState } from "react";
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
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [neftUtr, setNeftUtr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState<{ id: string; mode: string } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSimulatePayment = (mode: string) => {
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      const randomTx = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      setSuccess(true);
      setTxDetails({ id: randomTx, mode });

      if (onPaymentSuccess) {
        onPaymentSuccess({
          transactionId: randomTx,
          mode,
          amount,
        });
      }
    }, 1200);
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
              TF
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                TradeFlow B2B Payment Rails
              </div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Direct Settlement</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <div className="text-[11px] text-white/60">Amount Payable</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(amount)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Summary Banner */}
        <div className="bg-bg-canvas px-4 py-2.5 border-b border-border flex items-center justify-between text-xs">
          <div className="text-text-muted">
            Invoice: <span className="font-mono font-bold text-text-primary">{invoiceNo}</span>
          </div>
          <div className="text-text-muted">
            Customer: <span className="font-semibold text-text-primary">{customerName}</span>
          </div>
        </div>

        {/* Success View */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Payment Successful!</h3>
              <p className="text-xs text-text-muted mt-1">
                Remittance of <strong>{formatCurrency(amount)}</strong> has been settled into TradeFlow Current A/c.
              </p>
            </div>

            <div className="bg-bg-canvas p-4 rounded border border-border text-left space-y-2 text-xs font-mono max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-text-muted">Transaction ID:</span>
                <span className="font-bold text-text-primary">{txDetails?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Method:</span>
                <span className="text-text-primary font-sans">{txDetails?.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-emerald-600 font-bold">PAID / SETTLED</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Downloading Official Payment Receipt for ${txDetails?.id}...`);
                }}
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-4"
              >
                <Download className="w-3.5 h-3.5" />
                Receipt PDF
              </button>
              <button
                onClick={onClose}
                className="btn-primary text-xs py-2 px-5"
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
                Connecting to Banking Network...
              </div>
              <p className="text-xs text-text-muted mt-1">
                Verifying bank authentication & debit authorization. Please do not close this window.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-4 gap-1.5 border border-border p-1 bg-bg-canvas rounded-lg text-xs">
              {[
                { id: "UPI", label: "Instant UPI", icon: QrCode },
                { id: "NETBANKING", label: "NetBanking", icon: Building2 },
                { id: "NEFT_RTGS", label: "RTGS / NEFT", icon: Receipt },
                { id: "CARD", label: "Corporate Card", icon: CreditCard },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
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
                  {/* QR Graphic */}
                  <div className="w-36 h-36 bg-white p-2.5 rounded-lg border border-border flex flex-col items-center justify-center shadow-xs flex-shrink-0 relative overflow-hidden">
                    <div className="w-full h-full border-2 border-dashed border-[#111111] p-1 flex items-center justify-center">
                      {/* Simulated QR Code SVG pattern */}
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#111111] fill-current">
                        <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                        <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                        <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                        <rect x="40" y="10" width="10" height="20" />
                        <rect x="40" y="40" width="20" height="20" />
                        <rect x="10" y="40" width="20" height="10" />
                        <rect x="70" y="40" width="20" height="10" />
                        <rect x="40" y="70" width="10" height="20" />
                        <rect x="70" y="70" width="20" height="20" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="font-semibold text-text-primary text-sm">Scan with any UPI App</div>
                      <div className="text-text-muted mt-0.5">
                        Supports Google Pay, PhonePe, Paytm, CRED, BHIM & Corporate Banking UPI.
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded border border-border font-mono text-[11px] flex items-center justify-between">
                      <span>tradeflow.ops@yesbank</span>
                      <button
                        onClick={() => handleCopy("tradeflow.ops@yesbank", "upi")}
                        className="text-brand-primary hover:underline font-sans text-xs flex items-center gap-1"
                      >
                        {copied === "upi" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copied === "upi" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Dynamic QR valid for this invoice amount: <strong>{formatCurrency(amount)}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulatePayment("UPI App (GPay / PhonePe)")}
                  className="btn-primary w-full py-2.5 text-xs font-semibold justify-center flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Simulate Instant UPI Approval
                </button>
              </div>
            )}

            {/* Tab 2: NetBanking */}
            {activeTab === "NETBANKING" && (
              <div className="space-y-4">
                <label className="block text-xs font-medium text-text-muted">
                  Select Corporate or Retail Bank
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {banks.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-3 border rounded text-xs font-semibold transition-all text-center ${
                        selectedBank === b.id
                          ? "border-[#111111] bg-[#111111] text-white shadow-xs"
                          : "border-border bg-white text-text-primary hover:bg-[#F7F7F7]"
                      }`}
                    >
                      <div className="text-sm font-bold">{b.logo}</div>
                      <div className="text-[10px] font-normal truncate mt-0.5">{b.name}</div>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-bg-canvas rounded border border-border text-xs text-text-secondary flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Corporate Maker/Checker tokens and multi-signatory approvals will be validated seamlessly via the host bank&apos;s corporate internet banking portal.
                  </span>
                </div>

                <button
                  onClick={() => handleSimulatePayment(`NetBanking (${selectedBank} Bank)`)}
                  className="btn-primary w-full py-2.5 text-xs font-semibold justify-center flex items-center gap-2"
                >
                  Proceed to Bank Portal & Pay {formatCurrency(amount)}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 3: NEFT / RTGS Virtual Account */}
            {activeTab === "NEFT_RTGS" && (
              <div className="space-y-4">
                <div className="p-4 bg-bg-canvas rounded-lg border border-border space-y-3 text-xs">
                  <div className="font-semibold text-text-primary">
                    Dedicated CMS Virtual Account for Invoice {invoiceNo}
                  </div>

                  <div className="space-y-2 font-mono text-[11px] bg-white p-3 rounded border border-border">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-text-muted font-sans">Beneficiary Name:</span>
                      <span className="font-bold text-text-primary">TRADEFLOW FASTENERS PVT LTD</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-text-muted font-sans">Virtual A/C Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-primary">TRDFLW0051044</span>
                        <button
                          onClick={() => handleCopy("TRDFLW0051044", "ac")}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-text-muted font-sans">IFSC Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">YESB0CMSNOC</span>
                        <button
                          onClick={() => handleCopy("YESB0CMSNOC", "ifsc")}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-text-muted font-sans">Bank & Branch:</span>
                      <span className="text-text-secondary font-sans">Yes Bank Ltd, Mumbai Corporate CMS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Already transferred? Enter Bank UTR / Reference No.
                  </label>
                  <input
                    type="text"
                    value={neftUtr}
                    onChange={(e) => setNeftUtr(e.target.value)}
                    placeholder="e.g. HDFC000192830192"
                    className="w-full border border-border rounded p-2 text-xs font-mono bg-background"
                  />
                </div>

                <button
                  onClick={() => handleSimulatePayment(`NEFT / RTGS (UTR: ${neftUtr || "AUTO_CMS_MATCH"})`)}
                  className="btn-primary w-full py-2.5 text-xs font-semibold justify-center flex items-center gap-2"
                >
                  Confirm Remittance & Close Invoice
                </button>
              </div>
            )}

            {/* Tab 4: Card */}
            {activeTab === "CARD" && (
              <div className="space-y-4">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-text-muted mb-1 font-medium">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8912"
                      className="w-full border border-border rounded p-2 bg-background font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-muted mb-1 font-medium">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full border border-border rounded p-2 bg-background font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-text-muted mb-1 font-medium">CVV</label>
                      <input
                        type="password"
                        defaultValue="•••"
                        className="w-full border border-border rounded p-2 bg-background font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-medium">Cardholder / Corporate Name</label>
                    <input
                      type="text"
                      defaultValue="EXCELLENT BUILDERS PVT LTD"
                      className="w-full border border-border rounded p-2 bg-background font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSimulatePayment("Corporate Visa Commercial Card")}
                  className="btn-primary w-full py-2.5 text-xs font-semibold justify-center flex items-center gap-2"
                >
                  Pay {formatCurrency(amount)} with 3D Secure OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
