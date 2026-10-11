/**
 * Vila Sales — Indian Payment Engine & Gateway Integration
 * Handles Dynamic UPI QR, Mobile UPI Intent, Razorpay/Cashfree signature verification,
 * and accounts-verified manual bank transfer (NEFT/RTGS) reconciliation.
 */

import crypto from "crypto";
import { CANONICAL_COMPANY_CONFIG } from "./companyConfig";
import { generateQrSvg } from "./qrGenerator";

export type PaymentRail = "UPI_QR" | "UPI_INTENT" | "RAZORPAY" | "CASHFREE" | "NEFT_RTGS" | "COD";

export type PaymentLifecycleStatus =
  | "INITIATED"
  | "PENDING_VERIFICATION"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "PARTIALLY_PAID"
  | "REFUNDED";

export interface PaymentRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: "INR";
  rail: PaymentRail;
  status: PaymentLifecycleStatus;
  upiUri?: string;
  qrSvg?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  utrNumber?: string;
  bankReference?: string;
  senderBank?: string;
  accountHolder?: string;
  receiptUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate standard NPCI-compliant UPI URI
 * e.g. upi://pay?pa=vilasales@hdfcbank&pn=Vila%20Sales%20Pvt%20Ltd&am=12500.00&tr=ORD-2026-1048&tn=Vila%20Sales%20Order%20Payment&cu=INR
 */
export function buildUpiPaymentUri(params: {
  amount: number;
  orderId: string;
  orderNumber?: string;
  note?: string;
  vpa?: string;
  payeeName?: string;
}): string {
  const vpa = params.vpa || CANONICAL_COMPANY_CONFIG.banking.upiVpa;
  const payeeName = params.payeeName || CANONICAL_COMPANY_CONFIG.banking.upiQrPayeeName;
  const note = params.note || `Payment for ${params.orderNumber || params.orderId}`;
  const amountStr = params.amount.toFixed(2);
  const txnRef = params.orderId.replace(/[^a-zA-Z0-9]/g, "");

  const query = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amountStr,
    tr: txnRef,
    tn: note,
    cu: "INR",
  });

  return `upi://pay?${query.toString()}`;
}

/**
 * Generates dynamic, order-linked UPI QR SVG
 */
export function generateDynamicUpiQr(params: {
  amount: number;
  orderId: string;
  orderNumber?: string;
  note?: string;
}): { upiUri: string; qrSvg: string } {
  const upiUri = buildUpiPaymentUri(params);
  const qrSvg = generateQrSvg(upiUri, 280);
  return { upiUri, qrSvg };
}

/**
 * Razorpay Signature Verification
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.warn("[Payment Gateway] RAZORPAY_KEY_SECRET not set in environment.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  const expected = Buffer.from(generatedSignature, "utf-8");
  const actual = Buffer.from(params.signature || "", "utf-8");
  return actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Razorpay Webhook Signature Verification
 */
export function verifyRazorpayWebhookSignature(params: {
  body: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Payment Gateway] RAZORPAY_WEBHOOK_SECRET not set in environment.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(params.body)
    .digest("hex");

  const expected = Buffer.from(generatedSignature, "utf-8");
  const actual = Buffer.from(params.signature || "", "utf-8");
  return actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Cashfree Webhook Signature Verification
 */
export function verifyCashfreeSignature(params: {
  rawBody: string;
  timestamp: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.CASHFREE_API_SECRET;
  if (!secret) return false;

  const data = `${params.timestamp}${params.rawBody}`;
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64");

  const expected = Buffer.from(generatedSignature, "utf-8");
  const actual = Buffer.from(params.signature || "", "utf-8");
  return actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Checks gateway operational status based on environment configuration
 */
export function getPaymentGatewayEnvironment(): {
  isConfigured: boolean;
  activeProvider: "RAZORPAY" | "CASHFREE" | "SANDBOX_MOCK";
  mode: "LIVE" | "TEST_SANDBOX";
  keyIdPresent: boolean;
} {
  const rzpKey = process.env.RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
  const cfAppId = process.env.CASHFREE_APP_ID;
  const cfSecret = process.env.CASHFREE_API_SECRET;

  if (rzpKey && rzpSecret) {
    return {
      isConfigured: true,
      activeProvider: "RAZORPAY",
      mode: rzpKey.startsWith("rzp_live_") ? "LIVE" : "TEST_SANDBOX",
      keyIdPresent: true,
    };
  }

  if (cfAppId && cfSecret) {
    return {
      isConfigured: true,
      activeProvider: "CASHFREE",
      mode: process.env.CASHFREE_ENV === "PRODUCTION" ? "LIVE" : "TEST_SANDBOX",
      keyIdPresent: true,
    };
  }

  return {
    isConfigured: false,
    activeProvider: "SANDBOX_MOCK",
    mode: "TEST_SANDBOX",
    keyIdPresent: false,
  };
}
