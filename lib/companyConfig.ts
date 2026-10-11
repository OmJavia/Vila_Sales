/**
 * Vila Sales — Canonical Master Company Configuration
 * Authoritative business identity, Indian GSTIN, banking rails, and warehouse definitions.
 */

export interface GodownDefinition {
  id: string;
  name: string;
  code: string;
  stateCode: string;
  state: string;
  address: string;
  isPrimaryHub: boolean;
}

export interface BankAccountDetails {
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "CURRENT" | "CASH_CREDIT";
  upiVpa: string;
  upiQrPayeeName: string;
}

export interface CompanyConfig {
  brandName: string;
  legalEntityName: string;
  tradeName: string;
  gstin: string;
  pan: string;
  stateCode: string;
  stateName: string;
  cin?: string;
  registeredAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    supportEmail: string;
    website: string;
  };
  banking: BankAccountDetails;
  godowns: GodownDefinition[];
  documentPrefixes: {
    invoice: string;
    order: string;
    challan: string;
    quotation: string;
    creditNote: string;
    goodsReceipt: string;
    adjustment: string;
  };
  financialYear: string;
  companyName?: string;
  email?: string;
  phone?: string;
  bankDetails?: {
    bankName: string;
    branch: string;
    accountName: string;
    beneficiaryName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    upiVpa: string;
    upiQrPayeeName: string;
  };
}

export const CANONICAL_COMPANY_CONFIG: CompanyConfig & {
  companyName: string;
  email: string;
  phone: string;
  bankDetails: {
    bankName: string;
    branch: string;
    accountName: string;
    beneficiaryName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    upiVpa: string;
    upiQrPayeeName: string;
  };
} = {
  brandName: "Vila Sales",
  companyName: "Vila Sales",
  legalEntityName: process.env.VILA_LEGAL_ENTITY_NAME?.trim() || "Vila Sales",
  tradeName: process.env.VILA_TRADE_NAME?.trim() || "",
  gstin: process.env.VILA_GSTIN?.trim() || "",
  pan: process.env.VILA_PAN?.trim() || "",
  stateCode: process.env.VILA_STATE_CODE?.trim() || "",
  stateName: process.env.VILA_STATE_NAME?.trim() || "",
  cin: process.env.VILA_CIN?.trim() || undefined,
  registeredAddress: {
    line1: process.env.VILA_ADDRESS_LINE1?.trim() || "",
    line2: process.env.VILA_ADDRESS_LINE2?.trim() || undefined,
    city: process.env.VILA_CITY?.trim() || "",
    state: process.env.VILA_STATE_NAME?.trim() || "",
    pincode: process.env.VILA_PINCODE?.trim() || "",
    country: "India",
  },
  contact: {
    phone: process.env.VILA_PHONE?.trim() || "",
    email: process.env.VILA_BILLING_EMAIL?.trim() || "",
    supportEmail: process.env.VILA_SUPPORT_EMAIL?.trim() || "",
    website: "https://vilasales.vercel.app",
  },
  email: process.env.VILA_BILLING_EMAIL?.trim() || "",
  phone: process.env.VILA_PHONE?.trim() || "",
  banking: {
    bankName: process.env.VILA_BANK_NAME?.trim() || "",
    branch: process.env.VILA_BANK_BRANCH?.trim() || "",
    accountName: process.env.VILA_BANK_ACCOUNT_NAME?.trim() || "",
    accountNumber: process.env.VILA_BANK_ACCOUNT_NUMBER?.trim() || "",
    ifscCode: process.env.VILA_BANK_IFSC?.trim() || "",
    accountType: "CURRENT",
    upiVpa: process.env.VILA_UPI_VPA?.trim() || "",
    upiQrPayeeName: process.env.VILA_UPI_PAYEE_NAME?.trim() || "",
  },
  bankDetails: {
    bankName: process.env.VILA_BANK_NAME?.trim() || "",
    branch: process.env.VILA_BANK_BRANCH?.trim() || "",
    accountName: process.env.VILA_BANK_ACCOUNT_NAME?.trim() || "",
    beneficiaryName: process.env.VILA_BANK_BENEFICIARY_NAME?.trim() || "",
    accountNumber: process.env.VILA_BANK_ACCOUNT_NUMBER?.trim() || "",
    ifscCode: process.env.VILA_BANK_IFSC?.trim() || "",
    accountType: "CURRENT",
    upiVpa: process.env.VILA_UPI_VPA?.trim() || "",
    upiQrPayeeName: process.env.VILA_UPI_PAYEE_NAME?.trim() || "",
  },
  godowns: [
    {
      id: "godown-bhw",
      name: "Main Warehouse (Bhiwandi Logistics Hub)",
      code: "BHW-01",
      stateCode: "27",
      state: "Maharashtra",
      address: "Shed #4, Arihant Logistics Park, Bhiwandi, Thane, MH - 421302",
      isPrimaryHub: true,
    },
    {
      id: "godown-ktm",
      name: "Midas Central Depot (Kottayam)",
      code: "KTM-01",
      stateCode: "32",
      state: "Kerala",
      address: "Midas Treads Industrial Complex, Baker Hill, Kottayam, KL - 686001",
      isPrimaryHub: false,
    },
    {
      id: "godown-klm",
      name: "Kalamboli Steel & Depot Yard",
      code: "KLM-01",
      stateCode: "27",
      state: "Maharashtra",
      address: "Plot 14-B, Steel Yard, Kalamboli, Navi Mumbai, MH - 410218",
      isPrimaryHub: false,
    },
  ],
  documentPrefixes: {
    invoice: "VS/26-27/",
    order: "SO-2026-",
    challan: "DC-26-27/",
    quotation: "QT-2026-",
    creditNote: "CN-26-27/",
    goodsReceipt: "GRN-2026-",
    adjustment: "ADJ-2026-",
  },
  financialYear: "2026-27",
};

/**
 * Standard Indian State Code Dictionary (GSTIN first 2 digits)
 */
export const INDIAN_STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

/**
 * Validates an Indian GSTIN format (15 characters)
 */
export function isValidGstin(gstin: string): boolean {
  if (!gstin) return false;
  const cleaned = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(cleaned)) return false;

  const valueOf = (character: string) =>
    character >= "0" && character <= "9"
      ? character.charCodeAt(0) - 48
      : character.charCodeAt(0) - 55;
  const characterOf = (value: number) =>
    value < 10 ? String(value) : String.fromCharCode(value + 55);

  let factor = 2;
  let sum = 0;
  for (let index = cleaned.length - 2; index >= 0; index--) {
    const product = valueOf(cleaned[index]) * factor;
    sum += Math.floor(product / 36) + (product % 36);
    factor = factor === 2 ? 1 : 2;
  }

  const checkValue = (36 - (sum % 36)) % 36;
  return characterOf(checkValue) === cleaned[14];
}

/**
 * Extracts State Code from GSTIN
 */
export function getStateCodeFromGstin(gstin?: string): string | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  return INDIAN_STATE_CODES[code] ? code : null;
}
