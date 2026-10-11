/**
 * Vila Sales — GST Calculation & Compliance Engine
 * Handles Place of Supply, CGST / SGST / IGST breakdown, decimal-safe rounding, and HSN validation.
 */

import { CANONICAL_COMPANY_CONFIG, INDIAN_STATE_CODES, getStateCodeFromGstin, isValidGstin } from "./companyConfig";

export interface GSTLineItemInput {
  itemId: string;
  itemCode: string;
  itemName: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  discountPct?: number;
  gstRate?: number; // 0, 5, 12, 18, 28
}

export interface CalculatedGSTLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  qty: number;
  unit?: string;
  rate: number;
  grossAmount: number;
  discountPct: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

export interface GSTCalculationResult {
  sellerGstin: string;
  sellerStateCode: string;
  sellerStateName: string;
  customerGstin?: string;
  customerStateCode: string;
  customerStateName: string;
  placeOfSupply: string;
  isInterState: boolean;
  taxType: "INTRA_STATE (CGST + SGST)" | "INTER_STATE (IGST)";
  lineItems: CalculatedGSTLineItem[];
  subtotalGross: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  amountInWords: string;
}

/**
 * Standard rounding to 2 decimal places using Indian commerce rounding
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Resolve Customer State Code with strict fallback hierarchy:
 * 1. Customer GSTIN first 2 digits (authoritative)
 * 2. Explicitly passed stateCode
 * 3. Inferred state from State Name
 * 4. Default to Seller state ("27" - Maharashtra) if entirely unknown
 */
export function resolveCustomerStateCode(params: {
  gstin?: string;
  stateCode?: string;
  stateName?: string;
}): { stateCode: string; stateName: string } {
  // A supplied GSTIN is authoritative; never silently ignore an invalid one.
  if (params.gstin) {
    if (!isValidGstin(params.gstin)) {
      throw new Error("Customer GSTIN is invalid or fails its checksum. Correct the customer master before calculating GST.");
    }
    const fromGst = getStateCodeFromGstin(params.gstin);
    if (fromGst) {
      return {
        stateCode: fromGst,
        stateName: INDIAN_STATE_CODES[fromGst] || "Unknown",
      };
    }
    throw new Error("Customer GSTIN contains an unknown state code.");
  }

  // 2. From explicit stateCode (pad to 2 digits)
  if (params.stateCode) {
    const padded = params.stateCode.padStart(2, "0");
    if (INDIAN_STATE_CODES[padded]) {
      return {
        stateCode: padded,
        stateName: INDIAN_STATE_CODES[padded],
      };
    }
  }

  // 3. From State Name match
  if (params.stateName) {
    const clean = params.stateName.trim().toLowerCase();
    for (const [code, name] of Object.entries(INDIAN_STATE_CODES)) {
      if (name.toLowerCase() === clean) {
        return { stateCode: code, stateName: name };
      }
    }
  }

  throw new Error("Customer place of supply is missing or invalid. Provide a valid GSTIN, state code, or state name.");
}

/**
 * Authoritative GST calculation on the server.
 */
export function calculateGST(params: {
  items: GSTLineItemInput[];
  customerGstin?: string;
  customerStateCode?: string;
  customerStateName?: string;
  sellerStateCode?: string;
}): GSTCalculationResult {
  if (!isValidGstin(CANONICAL_COMPANY_CONFIG.gstin)) {
    throw new Error("Seller GSTIN is missing or invalid. Configure the actual registered GSTIN before generating orders or invoices.");
  }
  const sellerCode = params.sellerStateCode || CANONICAL_COMPANY_CONFIG.stateCode;
  const sellerName = INDIAN_STATE_CODES[sellerCode];
  if (!sellerName) throw new Error("Seller state code is invalid.");

  const { stateCode: custCode, stateName: custName } = resolveCustomerStateCode({
    gstin: params.customerGstin,
    stateCode: params.customerStateCode,
    stateName: params.customerStateName,
  });

  const isInterState = sellerCode !== custCode;
  const placeOfSupply = `${custCode} - ${custName}`;

  let subtotalGross = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedItems: CalculatedGSTLineItem[] = params.items.map((item) => {
    const qty = Math.max(0, item.qty);
    const rate = Math.max(0, item.rate);
    const gross = round2(qty * rate);
    const discPct = Math.min(100, Math.max(0, item.discountPct || 0));
    const discAmount = round2((gross * discPct) / 100);
    const taxable = round2(gross - discAmount);

    const gstRate = item.gstRate;
    if (typeof gstRate !== "number" || !Number.isFinite(gstRate) || ![0, 5, 12, 18, 28].includes(gstRate)) {
      throw new Error(`Unsupported GST rate for item ${item.itemCode}. Correct the item master before invoicing.`);
    }
    const hsnCode = (item.hsnCode || "").trim();
    if (!/^\d{4,8}$/.test(hsnCode)) {
      throw new Error(`HSN code is missing or invalid for item ${item.itemCode}. Configure the verified product tax master before generating commercial documents.`);
    }

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstRate = gstRate;
      igstAmount = round2((taxable * igstRate) / 100);
    } else {
      cgstRate = gstRate / 2;
      sgstRate = gstRate / 2;
      cgstAmount = round2((taxable * cgstRate) / 100);
      sgstAmount = round2((taxable * sgstRate) / 100);
    }

    const totalTax = round2(cgstAmount + sgstAmount + igstAmount);
    const itemTotal = round2(taxable + totalTax);

    subtotalGross = round2(subtotalGross + gross);
    totalDiscount = round2(totalDiscount + discAmount);
    taxableAmount = round2(taxableAmount + taxable);
    totalCgst = round2(totalCgst + cgstAmount);
    totalSgst = round2(totalSgst + sgstAmount);
    totalIgst = round2(totalIgst + igstAmount);

    return {
      itemId: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      hsnCode,
      qty,
      rate,
      grossAmount: gross,
      discountPct: discPct,
      discountAmount: discAmount,
      taxableAmount: taxable,
      gstRate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalTax,
      totalAmount: itemTotal,
    };
  });

  const totalTax = round2(totalCgst + totalSgst + totalIgst);
  const unroundedTotal = round2(taxableAmount + totalTax);
  const roundedGrandTotal = Math.round(unroundedTotal);
  const roundOff = round2(roundedGrandTotal - unroundedTotal);

  return {
    sellerGstin: CANONICAL_COMPANY_CONFIG.gstin,
    sellerStateCode: sellerCode,
    sellerStateName: sellerName,
    customerGstin: params.customerGstin,
    customerStateCode: custCode,
    customerStateName: custName,
    placeOfSupply,
    isInterState,
    taxType: isInterState ? "INTER_STATE (IGST)" : "INTRA_STATE (CGST + SGST)",
    lineItems: calculatedItems,
    subtotalGross,
    totalDiscount,
    taxableAmount,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax,
    roundOff,
    grandTotal: roundedGrandTotal,
    amountInWords: numberToWordsINR(roundedGrandTotal),
  };
}

/**
 * Converts numbers into Indian Currency words (e.g. "Rupees Forty-Two Thousand Five Hundred Only")
 */
export function numberToWordsINR(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";
  const num = Math.floor(amount);
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    let str = "";
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str.trim();
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundred = Math.floor(remainder / 100);
  let ones = remainder % 100;

  let res = "";
  if (crore > 0) res += inWords(crore) + " Crore ";
  if (lakh > 0) res += inWords(lakh) + " Lakh ";
  if (thousand > 0) res += inWords(thousand) + " Thousand ";
  if (hundred > 0) res += inWords(hundred) + " Hundred ";
  if (ones > 0) res += inWords(ones) + " ";

  return "Rupees " + res.trim() + " Only";
}
