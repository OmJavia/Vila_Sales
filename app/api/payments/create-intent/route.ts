import { NextRequest, NextResponse } from "next/server";
import {
  generateDynamicUpiQr,
  buildUpiPaymentUri,
  getPaymentGatewayEnvironment,
} from "@/lib/paymentService";
import { CANONICAL_COMPANY_CONFIG } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, orderNumber, note, rail = "UPI_QR" } = body;

    if (!amount || amount <= 0 || !orderId) {
      return NextResponse.json(
        { success: false, error: "Valid amount and orderId are required" },
        { status: 400 }
      );
    }

    const gatewayEnv = getPaymentGatewayEnvironment();
    const upiDetails = generateDynamicUpiQr({
      amount: Number(amount),
      orderId,
      orderNumber,
      note,
    });

    let gatewayOrderId = undefined;

    // If Razorpay is configured and requested
    if (rail === "RAZORPAY" && gatewayEnv.keyIdPresent) {
      try {
        const auth = Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64");

        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(Number(amount) * 100), // paise
            currency: "INR",
            receipt: orderNumber || orderId,
            notes: { orderId, company: CANONICAL_COMPANY_CONFIG.brandName },
          }),
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          gatewayOrderId = rzpData.id;
        }
      } catch (e) {
        console.warn("Razorpay API request error, falling back to standard UPI rails:", e);
      }
    }

    return NextResponse.json({
      success: true,
      amount: Number(amount),
      currency: "INR",
      orderId,
      orderNumber: orderNumber || orderId,
      rail,
      upiUri: upiDetails.upiUri,
      qrSvg: upiDetails.qrSvg,
      gatewayOrderId,
      gatewayConfig: {
        provider: gatewayEnv.activeProvider,
        mode: gatewayEnv.mode,
        keyId: process.env.RAZORPAY_KEY_ID || undefined,
      },
      payee: {
        name: CANONICAL_COMPANY_CONFIG.banking.upiQrPayeeName,
        vpa: CANONICAL_COMPANY_CONFIG.banking.upiVpa,
        bank: CANONICAL_COMPANY_CONFIG.banking.bankName,
        accountNo: CANONICAL_COMPANY_CONFIG.banking.accountNumber,
        ifsc: CANONICAL_COMPANY_CONFIG.banking.ifscCode,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
