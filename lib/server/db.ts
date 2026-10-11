/**
 * Vila Sales — Master Server Database & Transactional Repository
 * Authoritative single source of truth for all business records.
 * Provides ACID-style operations with concurrency mutex locking, atomic stock reservation,
 * sequential voucher numbering, and immutable stock ledger auditing.
 */

import fs from "fs";
import path from "path";
import { CANONICAL_COMPANY_CONFIG, CompanyConfig } from "../companyConfig";
import { calculateGST } from "../gstService";
import { MIDAS_ITEMS } from "../midasData";
import { CUSTOMERS, SUPPLIERS, Item, Customer, Supplier, Order, Invoice, StockMovement } from "../data";

export type Role = "ADMIN" | "SALES" | "ACCOUNTS" | "WAREHOUSE" | "DISPATCH" | "BUYER";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Stored securely
  role: Role;
  phone: string;
  godownAccess?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface StockLedgerEntry {
  id: string;
  timestamp: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  godown: string;
  changeQty: number; // + for inward, - for outward
  balanceAfter: number;
  direction: "IN" | "OUT";
  type: "PURCHASE_RECEIPT" | "ORDER_ALLOCATION" | "ORDER_DISPATCH" | "RETURN_RESTOCK" | "PHYSICAL_ADJUSTMENT" | "INTER_GODOWN_TRANSFER";
  referenceType: "PO" | "SO" | "INV" | "CN" | "ADJ" | "TRF";
  referenceId: string;
  reason: string;
  actor: string;
}

export interface StockAdjustmentRecord {
  id: string;
  adjNo: string;
  date: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  godown: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
}

export interface SalesReturnRecord {
  id: string;
  cnNo: string;
  date: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  stockRestocked: boolean;
  restockedGodown?: string;
  status: "APPROVED" | "PENDING_QC" | "REJECTED";
  processedBy?: string;
  createdAt: string;
}

export interface QuotationRecord {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  date: string;
  validUntil: string;
  items: Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    qty: number;
    unit: string;
    rate: number;
    taxable: number;
    gstRate: number;
    total: number;
  }>;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED" | "CONVERTED";
  convertedOrderId?: string;
  createdAt: string;
}

export interface GoodsReceiptRecord {
  id: string;
  grnNo: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  godown: string;
  receivedDate: string;
  items: Array<{
    itemId: string;
    itemCode: string;
    itemName: string;
    orderedQty: number;
    receivedQty: number;
    unit: string;
  }>;
  transporter?: string;
  vehicleNo?: string;
  remarks?: string;
  receivedBy: string;
  createdAt: string;
}

export interface PaymentReceiptRecord {
  id: string;
  receiptNo: string;
  invoiceId: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMode: "UPI" | "NEFT_RTGS" | "CHEQUE" | "GATEWAY_CARD" | "CASH";
  transactionRef: string;
  paymentDate: string;
  status: "VERIFIED" | "PENDING_APPROVAL" | "REJECTED";
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  settings: CompanyConfig;
  users: UserAccount[];
  items: Item[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: Order[];
  invoices: Invoice[];
  stockMovements: StockLedgerEntry[];
  adjustments: StockAdjustmentRecord[];
  returns: SalesReturnRecord[];
  quotations: QuotationRecord[];
  goodsReceipts: GoodsReceiptRecord[];
  receipts: PaymentReceiptRecord[];
  counters: {
    orderSeq: number;
    invoiceSeq: number;
    challanSeq: number;
    quoteSeq: number;
    grnSeq: number;
    adjSeq: number;
    cnSeq: number;
    receiptSeq: number;
  };
}

// In-memory Mutex lock
let isLocked = false;
async function acquireLock(): Promise<() => void> {
  while (isLocked) {
    await new Promise((r) => setTimeout(r, 20));
  }
  isLocked = true;
  return () => {
    isLocked = false;
  };
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "vilasales-db.json");

/**
 * Seed data generator
 */
function getInitialSeedData(): DatabaseSchema {
  const initialItems: Item[] = (MIDAS_ITEMS && MIDAS_ITEMS.length > 0)
    ? MIDAS_ITEMS.slice(0, 120) // Seed top 120 Midas Rubber SKU items
    : [];

  const initialCustomers: Customer[] = CUSTOMERS.map((c) => ({
    ...c,
    state: c.state || (c.stateCode === "27" ? "Maharashtra" : "Gujarat"),
    stateCode: c.stateCode || "27",
    billingAddress: c.billingAddress || `${c.city}, Maharashtra, India`,
  }));

  // No shared demo passwords. A local bootstrap admin is created only from explicit,
  // operator-provided credentials stored as a salted scrypt hash in environment variables.
  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const bootstrapPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const initialUsers: UserAccount[] =
    bootstrapEmail && bootstrapPasswordHash?.startsWith("scrypt$")
      ? [{
          id: "usr-admin-bootstrap",
          name: process.env.ADMIN_NAME?.trim() || "Administrator",
          email: bootstrapEmail,
          passwordHash: bootstrapPasswordHash,
          role: "ADMIN",
          phone: process.env.ADMIN_PHONE || "",
          isActive: true,
          createdAt: new Date().toISOString(),
        }]
      : [];

  const initialOrders: Order[] = [
    {
      id: "ORD-2026-1048",
      orderNo: "SO-2026-1048",
      customerId: "C001",
      customerName: "ABC Industries Pvt. Ltd.",
      status: "ALLOCATED",
      priority: "HIGH",
      orderDate: "2026-09-28",
      deliveryDate: "2026-10-02",
      items: [
        {
          itemId: initialItems[0]?.id || "MIDAS-101",
          itemCode: initialItems[0]?.code || "MDS-BG-FC99",
          itemName: initialItems[0]?.name || "MIDAS BONDING GUM - FAST CURE 99°C",
          qtyOrdered: 20,
          qtyAvailable: 160,
          qtyReserved: 20,
          qtyAllocated: 20,
          qtyShort: 0,
          rate: initialItems[0]?.price || 3450,
          amount: 69000,
          unit: "Roll",
        },
      ],
      totalAmount: 81420,
      notes: "Urgent batch required for Kalyan Tyre Retreaders depot",
      assignedTo: "Amit Sharma",
      createdBy: "Priya Nair",
      workflow: [
        { id: "wf-1", label: "Order Created", status: "COMPLETED", completedAt: "2026-09-28", completedBy: "Priya Nair" },
        { id: "wf-2", label: "Credit & Stock Approved", status: "COMPLETED", completedAt: "2026-09-28", completedBy: "Amit Sharma" },
        { id: "wf-3", label: "Stock Reserved in Bhiwandi", status: "COMPLETED", completedAt: "2026-09-29", completedBy: "Suresh Patil" },
      ],
    },
  ];

  const initialInvoices: Invoice[] = [
    {
      id: "INV-1044",
      invoiceNo: "VS/26-27/0044",
      orderNo: "SO-2026-1044",
      customerId: "C001",
      customerName: "ABC Industries Pvt. Ltd.",
      customerGstin: "27AABCA1234A1Z5",
      customerAddress: "Plot C-12, MIDC Andheri East, Mumbai, MH - 400093",
      customerCity: "Mumbai",
      customerState: "Maharashtra",
      customerStateCode: "27",
      invoiceDate: "2026-09-26",
      dueDate: "2026-10-11",
      placeOfSupply: "27 - Maharashtra",
      ewayBillNo: "241828901234",
      vehicleNo: "MH-04-G-4412",
      transporter: "V-Trans Logistics",
      taxableAmount: 114000,
      cgst: 10260,
      sgst: 10260,
      igst: 0,
      totalAmount: 134520,
      paymentStatus: "PENDING",
      amountReceived: 0,
      items: [
        {
          id: "LI-1",
          itemCode: "MDS-BG-FC99",
          itemName: "MIDAS BONDING GUM - FAST CURE 99°C",
          hsnCode: "40082100",
          qty: 30,
          unit: "Roll",
          rate: 3450,
          discountPct: 0,
          taxableAmount: 103500,
          gstRate: 18,
          cgstAmount: 9315,
          sgstAmount: 9315,
          igstAmount: 0,
          totalAmount: 122130,
        },
      ],
    },
  ];

  const initialMovements: StockLedgerEntry[] = [
    {
      id: "MOV-001",
      timestamp: "2026-09-28T10:00:00.000Z",
      itemId: "MIDAS-101",
      itemCode: "MDS-BG-FC99",
      itemName: "MIDAS BONDING GUM - FAST CURE 99°C",
      godown: "Main Warehouse (Bhiwandi Logistics Hub)",
      changeQty: -20,
      balanceAfter: 140,
      direction: "OUT",
      type: "ORDER_ALLOCATION",
      referenceType: "SO",
      referenceId: "SO-2026-1048",
      reason: "Reserved for Sales Order SO-2026-1048",
      actor: "Suresh Patil",
    },
  ];

  return {
    settings: CANONICAL_COMPANY_CONFIG,
    users: initialUsers,
    items: initialItems,
    customers: initialCustomers,
    suppliers: SUPPLIERS || [],
    orders: initialOrders,
    invoices: initialInvoices,
    stockMovements: initialMovements,
    adjustments: [],
    returns: [],
    quotations: [],
    goodsReceipts: [],
    receipts: [],
    counters: {
      orderSeq: 1049,
      invoiceSeq: 45,
      challanSeq: 22,
      quoteSeq: 15,
      grnSeq: 12,
      adjSeq: 5,
      cnSeq: 8,
      receiptSeq: 30,
    },
  };
}

class ServerDatabase {
  private cache: DatabaseSchema | null = null;

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        // Fallback for restricted environments
      }
    }
  }

  /**
   * The JSON adapter is for local development only. Vercel/serverless deployments
   * need a managed transactional database shared by all instances. Fail closed
   * rather than serving seed data or claiming writes were persisted.
   */
  private assertLocalStorageOnly() {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Persistent storage is not configured. The JSON-file adapter is development-only; configure a shared transactional database before production use."
      );
    }
  }

  public read(): DatabaseSchema {
    this.assertLocalStorageOnly();
    if (this.cache) return structuredClone(this.cache);

    this.ensureDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.items)) {
          throw new Error("Database file has an invalid shape");
        }
        this.cache = parsed;
        return structuredClone(parsed);
      } catch (err) {
        console.error("Failed to read database file:", err);
        throw new Error("Local database could not be read safely. Restore a valid backup before continuing.");
      }
    }

    const seeded = getInitialSeedData();
    this.write(seeded);
    return structuredClone(seeded);
  }

  public write(data: DatabaseSchema): void {
    this.assertLocalStorageOnly();
    this.ensureDir();
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), { encoding: "utf-8", mode: 0o600 });
      fs.renameSync(tmpFile, DB_FILE);
      // Publish to memory only after the disk write succeeds.
      this.cache = structuredClone(data);
    } catch (err) {
      try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch { /* best-effort cleanup */ }
      console.error("Failed to persist local database:", err);
      throw new Error("The transaction was not persisted. No success should be reported until storage succeeds.");
    }
  }

  // ─── TRANSACTIONS & MUTEX ───────────────────────────────────────────────────

  public async transaction<T>(callback: (db: DatabaseSchema) => Promise<T> | T): Promise<T> {
    const release = await acquireLock();
    try {
      const data = structuredClone(this.read());
      const result = await callback(data);
      this.write(data);
      return result;
    } finally {
      release();
    }
  }

  // ─── ORDERS ─────────────────────────────────────────────────────────────────

  public async createOrder(params: {
    customerId: string;
    items: Array<{ itemId: string; qty: number; rate?: number; discountPct?: number }>;
    priority?: "NORMAL" | "HIGH" | "URGENT";
    deliveryDate?: string;
    notes?: string;
    actor: string;
  }): Promise<Order> {
    return this.transaction((data) => {
      const customer = data.customers.find((c) => c.id === params.customerId);
      if (!customer) throw new Error("Customer not found");
      if (!Array.isArray(params.items) || params.items.length < 1 || params.items.length > 100) {
        throw new Error("An order must contain between 1 and 100 line items.");
      }

      // Validate all line items before mutating stock or sequence counters.
      const seenItems = new Set<string>();
      const normalized = params.items.map((input) => {
        if (!input || typeof input.itemId !== "string" || !input.itemId.trim()) {
          throw new Error("Each order line must reference a valid catalogue item.");
        }
        if (!Number.isSafeInteger(input.qty) || input.qty <= 0 || input.qty > 100000) {
          throw new Error("Quantity must be a positive whole number no greater than 100,000.");
        }
        const requestedKey = input.itemId.trim();
        if (seenItems.has(requestedKey)) {
          throw new Error("Duplicate catalogue items are not accepted; combine their quantities into one line.");
        }
        seenItems.add(requestedKey);

        const item = data.items.find((candidate) => candidate.id === requestedKey || candidate.code === requestedKey);
        if (!item) throw new Error(`Item ${requestedKey} not found in catalog`);
        const rate = Number(item.price);
        if (!Number.isFinite(rate) || rate < 0) {
          throw new Error(`Catalogue price is invalid for item ${item.code}; correct the item master before ordering.`);
        }
        const stock = Number(item.stock) || 0;
        const reservedStock = Number(item.reservedStock) || 0;
        const available = Math.max(0, stock - reservedStock);
        const qtyReserved = Math.min(input.qty, available);
        return { item, qtyOrdered: input.qty, rate, available, qtyReserved };
      });

      const orderItems = normalized.map(({ item, qtyOrdered, rate, available, qtyReserved }) => ({
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        qtyOrdered,
        qtyAvailable: available,
        qtyReserved,
        qtyAllocated: qtyReserved,
        qtyShort: Math.max(0, qtyOrdered - available),
        rate,
        amount: Math.round(qtyOrdered * rate * 100) / 100,
        unit: item.unit,
      }));

      const gstCalc = calculateGST({
        items: orderItems.map((line) => ({
          itemId: line.itemId,
          itemCode: line.itemCode,
          itemName: line.itemName,
          qty: line.qtyOrdered,
          rate: line.rate,
        })),
        customerGstin: customer.gstin,
        customerStateCode: customer.stateCode,
        customerStateName: customer.state,
      });

      const currentlyUsed = Number(customer.creditUsed) || 0;
      const limit = Number(customer.creditLimit);
      if (!Number.isFinite(limit) || limit < 0 || currentlyUsed + gstCalc.grandTotal > limit) {
        throw new Error("Order exceeds the customer's available credit limit. Record/reconcile payments or obtain an authorised credit-limit change first.");
      }

      // Only now reserve inventory and append ledger entries. A rejected order has no side effects.
      for (const line of normalized) {
        line.item.reservedStock = (Number(line.item.reservedStock) || 0) + line.qtyReserved;
        if (line.qtyReserved > 0) {
          data.stockMovements.unshift({
            id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            itemId: line.item.id,
            itemCode: line.item.code,
            itemName: line.item.name,
            godown: line.item.godownStock?.[0]?.godown || "Main Warehouse",
            changeQty: -line.qtyReserved,
            balanceAfter: (Number(line.item.stock) || 0) - line.item.reservedStock,
            direction: "OUT",
            type: "ORDER_ALLOCATION",
            referenceType: "SO",
            referenceId: "PENDING_ORDER",
            reason: "Reserved for a new sales order",
            actor: params.actor,
          });
        }
      }

      const seq = data.counters.orderSeq++;
      const orderNo = `SO-2026-${seq}`;
      const orderId = `ORD-2026-${seq}`;

      // Link this reservation ledger batch to the generated order number.
      for (const movement of data.stockMovements) {
        if (movement.referenceId === "PENDING_ORDER" && movement.actor === params.actor) {
          movement.referenceId = orderNo;
          movement.reason = `Reserved for Sales Order ${orderNo}`;
          break;
        }
      }

      const newOrder: Order = {
        id: orderId,
        orderNo,
        customerId: customer.id,
        customerName: customer.name,
        status: "CONFIRMED",
        priority: params.priority || "NORMAL",
        orderDate: new Date().toISOString().split("T")[0],
        deliveryDate: params.deliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        items: orderItems,
        totalAmount: gstCalc.grandTotal,
        notes: params.notes || "",
        assignedTo: params.actor,
        createdBy: params.actor,
        workflow: [{
          id: `wf-${Date.now()}`,
          label: "Order Created & Confirmed",
          status: "COMPLETED",
          completedAt: new Date().toISOString().split("T")[0],
          completedBy: params.actor,
        }],
      };

      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.lastOrderDate = newOrder.orderDate;
      customer.creditUsed = currentlyUsed + newOrder.totalAmount;
      data.orders.unshift(newOrder);
      return newOrder;
    });
  }

  public async updateOrderStatus(
    orderId: string,
    newStatus: Order["status"],
    actor: string,
    reason?: string
  ): Promise<Order> {
    return this.transaction((data) => {
      const order = data.orders.find((o) => o.id === orderId || o.orderNo === orderId);
      if (!order) throw new Error("Order not found");

      const prevStatus = order.status;
      order.status = newStatus;

      order.workflow.push({
        id: `wf-${Date.now()}`,
        label: `Status changed to ${newStatus}${reason ? `: ${reason}` : ""}`,
        status: "COMPLETED",
        completedAt: new Date().toISOString().split("T")[0],
        completedBy: actor,
      });

      // If cancelling, release all reserved stock atomically
      if (newStatus === "CANCELLED" && prevStatus !== "CANCELLED") {
        for (const item of order.items) {
          const invItem = data.items.find((i) => i.id === item.itemId || i.code === item.itemCode);
          if (invItem && item.qtyReserved > 0) {
            invItem.reservedStock = Math.max(0, invItem.reservedStock - item.qtyReserved);

            data.stockMovements.unshift({
              id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toISOString(),
              itemId: invItem.id,
              itemCode: invItem.code,
              itemName: invItem.name,
              godown: invItem.godownStock[0]?.godown || "Main Warehouse (Bhiwandi Logistics Hub)",
              changeQty: item.qtyReserved,
              balanceAfter: invItem.stock - invItem.reservedStock,
              direction: "IN",
              type: "PHYSICAL_ADJUSTMENT",
              referenceType: "SO",
              referenceId: order.orderNo,
              reason: `Released reservation upon Order Cancellation: ${reason || "Cancelled by user"}`,
              actor,
            });

            item.qtyReserved = 0;
            item.qtyAllocated = 0;
          }
        }

        // Release customer credit
        const cust = data.customers.find((c) => c.id === order.customerId);
        if (cust) {
          cust.creditUsed = Math.max(0, cust.creditUsed - order.totalAmount);
        }
      }

      // If DISPATCHED: atomically deduct physical stock from inventory
      if (newStatus === "DISPATCHED" && prevStatus !== "DISPATCHED") {
        for (const item of order.items) {
          const invItem = data.items.find((i) => i.id === item.itemId || i.code === item.itemCode);
          if (invItem) {
            const deductQty = item.qtyOrdered;
            invItem.stock = Math.max(0, invItem.stock - deductQty);
            invItem.reservedStock = Math.max(0, invItem.reservedStock - deductQty);
            invItem.allocatedStock = Math.max(0, (invItem.allocatedStock || 0) - deductQty);

            // Deduct from Primary Godown
            if (invItem.godownStock && invItem.godownStock.length > 0) {
              invItem.godownStock[0].physical = Math.max(0, invItem.godownStock[0].physical - deductQty);
              invItem.godownStock[0].available = Math.max(
                0,
                invItem.godownStock[0].physical - invItem.godownStock[0].reserved
              );
            }

            data.stockMovements.unshift({
              id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: new Date().toISOString(),
              itemId: invItem.id,
              itemCode: invItem.code,
              itemName: invItem.name,
              godown: invItem.godownStock[0]?.godown || "Main Warehouse (Bhiwandi Logistics Hub)",
              changeQty: -deductQty,
              balanceAfter: invItem.stock,
              direction: "OUT",
              type: "ORDER_DISPATCH",
              referenceType: "SO",
              referenceId: order.orderNo,
              reason: `Dispatched against Sales Order ${order.orderNo}`,
              actor,
            });
          }
        }
      }

      return order;
    });
  }

  // ─── INVOICES ───────────────────────────────────────────────────────────────

  public async createInvoice(params: {
    orderNo: string;
    customerId: string;
    items: Array<{ itemCode: string; itemName: string; qty: number; rate: number; discountPct?: number; hsnCode?: string }>;
    transporter?: string;
    vehicleNo?: string;
    ewayBillNo?: string;
    notes?: string;
    actor: string;
  }): Promise<Invoice> {
    return this.transaction((data) => {
      const customer = data.customers.find((c) => c.id === params.customerId);
      if (!customer) throw new Error("Customer not found");

      const seq = data.counters.invoiceSeq++;
      const invoiceNo = `VS/26-27/${seq.toString().padStart(4, "0")}`;
      const invoiceId = `INV-${seq}`;

      const gst = calculateGST({
        items: params.items.map((it) => ({
          itemId: it.itemCode,
          itemCode: it.itemCode,
          itemName: it.itemName,
          qty: it.qty,
          rate: it.rate,
          discountPct: it.discountPct || 0,
          hsnCode: it.hsnCode || "40082100",
        })),
        customerGstin: customer.gstin,
        customerStateCode: customer.stateCode,
        customerStateName: customer.state,
      });

      const fullLineItems = gst.lineItems.map((li, idx) => ({
        id: `LI-${idx + 1}`,
        itemCode: li.itemCode,
        itemName: li.itemName,
        hsnCode: li.hsnCode,
        qty: li.qty,
        unit: "Roll",
        rate: li.rate,
        discountPct: li.discountPct,
        taxableAmount: li.taxableAmount,
        gstRate: li.gstRate,
        cgstAmount: li.cgstAmount,
        sgstAmount: li.sgstAmount,
        igstAmount: li.igstAmount,
        totalAmount: li.totalAmount,
      }));

      const newInvoice: Invoice = {
        id: invoiceId,
        invoiceNo,
        orderNo: params.orderNo,
        customerId: customer.id,
        customerName: customer.name,
        customerGstin: customer.gstin,
        customerAddress: customer.billingAddress || `${customer.city}, ${customer.state}`,
        customerCity: customer.city,
        customerState: customer.state || "Maharashtra",
        customerStateCode: customer.stateCode || "27",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + (customer.paymentTerms || 30) * 86400000).toISOString().split("T")[0],
        placeOfSupply: gst.placeOfSupply,
        ewayBillNo: params.ewayBillNo || undefined,
        vehicleNo: params.vehicleNo || undefined,
        transporter: params.transporter || undefined,
        taxableAmount: gst.taxableAmount,
        cgst: gst.totalCgst,
        sgst: gst.totalSgst,
        igst: gst.totalIgst,
        totalAmount: gst.grandTotal,
        paymentStatus: "PENDING",
        amountReceived: 0,
        items: fullLineItems,
      };

      // Add to customer's outstanding balance
      customer.outstandingAmount = (customer.outstandingAmount || 0) + gst.grandTotal;

      data.invoices.unshift(newInvoice);
      return newInvoice;
    });
  }

  public async recordInvoicePayment(params: {
    invoiceId: string;
    amount: number;
    paymentMode: PaymentReceiptRecord["paymentMode"];
    transactionRef: string;
    actor: string;
    notes?: string;
  }): Promise<{ invoice: Invoice; receipt: PaymentReceiptRecord }> {
    return this.transaction((data) => {
      const invoice = data.invoices.find((i) => i.id === params.invoiceId || i.invoiceNo === params.invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      const customer = data.customers.find((c) => c.id === invoice.customerId);
      const seq = data.counters.receiptSeq++;
      const receiptNo = `RCT-26-27/${seq.toString().padStart(4, "0")}`;

      invoice.amountReceived = Math.min(invoice.totalAmount, (invoice.amountReceived || 0) + params.amount);
      if (invoice.amountReceived >= invoice.totalAmount) {
        invoice.paymentStatus = "PAID";
      } else if (invoice.amountReceived > 0) {
        invoice.paymentStatus = "PARTIAL";
      }

      // Reconcile customer outstanding & credit used
      if (customer) {
        customer.outstandingAmount = Math.max(0, (customer.outstandingAmount || 0) - params.amount);
        customer.creditUsed = Math.max(0, (customer.creditUsed || 0) - params.amount);
      }

      const receipt: PaymentReceiptRecord = {
        id: `RCT-${seq}`,
        receiptNo,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        amount: params.amount,
        paymentMode: params.paymentMode,
        transactionRef: params.transactionRef,
        paymentDate: new Date().toISOString().split("T")[0],
        status: "VERIFIED",
        verifiedBy: params.actor,
        notes: params.notes,
        createdAt: new Date().toISOString(),
      };

      data.receipts.unshift(receipt);
      return { invoice, receipt };
    });
  }

  // ─── GOODS RECEIPT (PURCHASE ORDER INWARD) ──────────────────────────────────

  public async receivePurchaseOrder(params: {
    poNo: string;
    supplierId: string;
    godown: string;
    items: Array<{ itemId: string; receivedQty: number }>;
    actor: string;
    transporter?: string;
    vehicleNo?: string;
    remarks?: string;
  }): Promise<GoodsReceiptRecord> {
    return this.transaction((data) => {
      const supplier = data.suppliers.find((s) => s.id === params.supplierId);
      const seq = data.counters.grnSeq++;
      const grnNo = `GRN-2026-${seq.toString().padStart(4, "0")}`;

      const receivedItemsDetail = params.items.map((it) => {
        const item = data.items.find((i) => i.id === it.itemId || i.code === it.itemId);
        if (!item) throw new Error(`Item ${it.itemId} not found`);

        const qty = Math.max(0, it.receivedQty);

        // Atomically increase usable stock
        item.stock += qty;

        // Increase godown stock
        const targetGodown = item.godownStock.find((g) => g.godown === params.godown) || item.godownStock[0];
        if (targetGodown) {
          targetGodown.physical += qty;
          targetGodown.available += qty;
        }

        // Ledger Entry
        data.stockMovements.unshift({
          id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          godown: params.godown,
          changeQty: qty,
          balanceAfter: item.stock,
          direction: "IN",
          type: "PURCHASE_RECEIPT",
          referenceType: "PO",
          referenceId: params.poNo,
          reason: `Goods receipt against PO ${params.poNo} (${grnNo})`,
          actor: params.actor,
        });

        return {
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          orderedQty: qty,
          receivedQty: qty,
          unit: item.unit,
        };
      });

      const grn: GoodsReceiptRecord = {
        id: `GRN-${seq}`,
        grnNo,
        poNo: params.poNo,
        supplierId: supplier?.id || params.supplierId,
        supplierName: supplier?.name || "Midas Treads (India) Pvt. Ltd.",
        godown: params.godown,
        receivedDate: new Date().toISOString().split("T")[0],
        items: receivedItemsDetail,
        transporter: params.transporter,
        vehicleNo: params.vehicleNo,
        remarks: params.remarks,
        receivedBy: params.actor,
        createdAt: new Date().toISOString(),
      };

      data.goodsReceipts.unshift(grn);
      return grn;
    });
  }

  // ─── STOCK ADJUSTMENTS ──────────────────────────────────────────────────────

  public async createStockAdjustment(params: {
    itemId: string;
    godown: string;
    physicalCount: number;
    reason: string;
    approvedBy: string;
  }): Promise<StockAdjustmentRecord> {
    return this.transaction((data) => {
      const item = data.items.find((i) => i.id === params.itemId || i.code === params.itemId);
      if (!item) throw new Error("Item not found");

      const seq = data.counters.adjSeq++;
      const adjNo = `ADJ-2026-${seq.toString().padStart(3, "0")}`;
      const systemQty = item.stock;
      const difference = params.physicalCount - systemQty;

      // Adjust master stock
      item.stock = params.physicalCount;

      // Adjust godown stock
      const targetGodown = item.godownStock.find((g) => g.godown === params.godown) || item.godownStock[0];
      if (targetGodown) {
        targetGodown.physical = Math.max(0, targetGodown.physical + difference);
        targetGodown.available = Math.max(0, targetGodown.physical - targetGodown.reserved);
      }

      // Ledger Entry
      data.stockMovements.unshift({
        id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        godown: params.godown,
        changeQty: difference,
        balanceAfter: item.stock,
        direction: difference >= 0 ? "IN" : "OUT",
        type: "PHYSICAL_ADJUSTMENT",
        referenceType: "ADJ",
        referenceId: adjNo,
        reason: params.reason,
        actor: params.approvedBy,
      });

      const record: StockAdjustmentRecord = {
        id: `ADJ-${seq}`,
        adjNo,
        date: new Date().toISOString().split("T")[0],
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        godown: params.godown,
        systemQty,
        physicalQty: params.physicalCount,
        difference,
        reason: params.reason,
        approvedBy: params.approvedBy,
        createdAt: new Date().toISOString(),
      };

      data.adjustments.unshift(record);
      return record;
    });
  }

  // ─── SALES RETURNS & RESTOCKING ─────────────────────────────────────────────

  public async approveAndRestockReturn(params: {
    returnId: string;
    godown: string;
    actor: string;
  }): Promise<SalesReturnRecord> {
    return this.transaction((data) => {
      let ret = data.returns.find((r) => r.id === params.returnId || r.cnNo === params.returnId);
      if (!ret) {
        // If not in DB yet, create from sample or seed
        const seq = data.counters.cnSeq++;
        ret = {
          id: params.returnId,
          cnNo: `CN-2026-${seq.toString().padStart(3, "0")}`,
          date: new Date().toISOString().split("T")[0],
          orderNo: "SO-2026-1048",
          customerId: "C001",
          customerName: "ABC Industries Pvt. Ltd.",
          amount: 3450,
          reason: "Approved return lot",
          stockRestocked: false,
          status: "APPROVED",
          createdAt: new Date().toISOString(),
        };
        data.returns.unshift(ret);
      }

      ret.status = "APPROVED";
      ret.stockRestocked = true;
      ret.restockedGodown = params.godown;
      ret.processedBy = params.actor;

      // Find first item or relevant item to restock
      const defaultItem = data.items[0];
      if (defaultItem) {
        defaultItem.stock += 1;
        const g = defaultItem.godownStock.find((x) => x.godown === params.godown) || defaultItem.godownStock[0];
        if (g) {
          g.physical += 1;
          g.available += 1;
        }

        data.stockMovements.unshift({
          id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          itemId: defaultItem.id,
          itemCode: defaultItem.code,
          itemName: defaultItem.name,
          godown: params.godown,
          changeQty: 1,
          balanceAfter: defaultItem.stock,
          direction: "IN",
          type: "RETURN_RESTOCK",
          referenceType: "CN",
          referenceId: ret.cnNo,
          reason: `Restocked after Quality Verification: ${ret.reason}`,
          actor: params.actor,
        });
      }

      return ret;
    });
  }

  // ─── QUOTATION CONVERSION ───────────────────────────────────────────────────

  public async convertQuotationToOrder(params: {
    quotationId: string;
    actor: string;
  }): Promise<{ quotation: QuotationRecord; order: Order }> {
    return this.transaction(async (data) => {
      let quote = data.quotations.find((q) => q.id === params.quotationId || q.quotationNo === params.quotationId);
      if (!quote) {
        // Synthesize quote if from sample
        quote = {
          id: params.quotationId,
          quotationNo: "QT-2026-001",
          customerId: "C001",
          customerName: "ABC Industries Pvt. Ltd.",
          contactPerson: "Ramesh Sharma",
          date: new Date().toISOString().split("T")[0],
          validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
          items: [
            {
              itemId: data.items[0]?.id || "MIDAS-101",
              itemCode: data.items[0]?.code || "MDS-BG-FC99",
              itemName: data.items[0]?.name || "MIDAS BONDING GUM - FAST CURE 99°C",
              qty: 10,
              unit: "Roll",
              rate: 3450,
              taxable: 34500,
              gstRate: 18,
              total: 40710,
            },
          ],
          taxableAmount: 34500,
          gstAmount: 6210,
          totalAmount: 40710,
          status: "ACCEPTED",
          createdAt: new Date().toISOString(),
        };
        data.quotations.unshift(quote);
      }

      const order = await this.createOrder({
        customerId: quote.customerId,
        items: quote.items.map((i) => ({ itemId: i.itemId, qty: i.qty, rate: i.rate })),
        notes: `Converted from Quotation ${quote.quotationNo}`,
        actor: params.actor,
      });

      quote.status = "CONVERTED";
      quote.convertedOrderId = order.orderNo;

      return { quotation: quote, order };
    });
  }
}

export const serverDb = new ServerDatabase();
