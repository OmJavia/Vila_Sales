import { CUSTOMERS, Customer, Order, OrderItem, ITEMS } from "./data";
import { useTradeFlowStore } from "./store";
import type { NotificationType, NotificationSeverity } from "./notificationStore";

export type PaymentMethod = "UPI" | "NEFT_RTGS" | "COD" | "CARD" | "NETBANKING";
export type PaymentStatus = "PAID" | "PENDING_VERIFICATION" | "COD_CONFIRMED" | "FAILED";

export interface BookedOrderItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CustomerFollowUp {
  scheduledDate: string; // Order Date + 5 days (YYYY-MM-DD)
  status: "PENDING" | "CONTACTED" | "RESOLVED";
  prompt: string;
  lastContactedAt?: string;
  customerFeedback?: string;
  satisfactionRating?: number; // 1-5
  notes?: string;
}

export interface CustomerOrderBooking {
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  items: BookedOrderItem[];
  subtotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails: {
    transactionId?: string; // UPI UTR or NEFT reference
    upiId?: string;
    appUsed?: string;
    senderBank?: string;
    accountHolder?: string;
    receiptFileName?: string;
    siteContactPerson?: string;
    cardLast4?: string;
    bankName?: string;
    paidAt?: string;
  };
  transporter?: string;
  orderNotes?: string;
  bookingDate: string; // ISO string
  estimatedDeliveryDate: string;
  deliveryStatus: "BOOKED" | "PREPARING" | "DISPATCHED" | "DELIVERED";
  followUp: CustomerFollowUp;
}

const STORAGE_ORDERS_KEY = "tradeflow_customer_booked_orders";
const STORAGE_CUSTOMERS_KEY = "tradeflow_customer_profiles";

/**
 * Calculates a date N days in the future from a given date (or today)
 */
export function addDaysToDate(date: Date, days: number): string {
  const target = new Date(date);
  target.setDate(target.getDate() + days);
  return target.toISOString().split("T")[0];
}

const DEFAULT_SEEDED_ORDERS: CustomerOrderBooking[] = [
  {
    orderId: "ORD-2026-1048",
    orderNumber: "#ORD-1048",
    invoiceNumber: "INV/26-27/1048",
    customerId: "C001",
    customerName: "Ramesh Sharma",
    companyName: "ABC Industries Pvt. Ltd.",
    phone: "+91 98201 12345",
    email: "procurement@abcindustries.com",
    deliveryAddress: "Plot C-12, MIDC Industrial Area, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400093",
    gstin: "27AABCA1234A1Z5",
    items: [
      {
        itemId: "I001",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
        itemCode: "AJX-ANC-1000",
        brand: "Ajax",
        category: "Anchor Bolts",
        unit: "Box",
        price: 2450,
        quantity: 20,
        subtotal: 49000,
      },
      {
        itemId: "I002",
        itemName: "POWERFIT 300×10 SS WASHER",
        itemCode: "PWF-WSH-300",
        brand: "Powerfit",
        category: "Washers",
        unit: "Kg",
        price: 340,
        quantity: 50,
        subtotal: 17000,
      },
    ],
    subtotal: 66000,
    taxableAmount: 66000,
    cgst: 5940,
    sgst: 5940,
    igst: 0,
    grandTotal: 77880,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    paymentDetails: {
      transactionId: "UPI492019482019",
      upiId: "abc.procurement@oksbi",
      appUsed: "Google Pay",
      paidAt: "2026-10-05T11:30:00+05:30",
    },
    transporter: "V-Trans Express",
    orderNotes: "Delivered to Main Plant Gate 2",
    bookingDate: "2026-10-05T11:28:00+05:30",
    estimatedDeliveryDate: "2026-10-08",
    deliveryStatus: "DELIVERED",
    followUp: {
      scheduledDate: "2026-10-10", // Exactly 5 days after Oct 5!
      status: "PENDING",
      prompt: "Follow up: How did the 20 boxes of AJAX anchor bolts and SS washers perform at their Andheri plant?",
      notes: "High priority client - check if they require additional stock for Phase 2.",
    },
  },
  {
    orderId: "ORD-2026-1047",
    orderNumber: "#ORD-1047",
    invoiceNumber: "INV/26-27/1047",
    customerId: "C002",
    customerName: "Sanjay Patel",
    companyName: "Sunrise Traders",
    phone: "+91 98220 54321",
    email: "sunrisetraders@gmail.com",
    deliveryAddress: "Gala No. 4, Loha Bhavan, Market Yard",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411037",
    gstin: "27AABCS5678B1Z2",
    items: [
      {
        itemId: "I003",
        itemName: "SILVER 750×16 HEX BOLT M16",
        itemCode: "SLV-HEX-750",
        brand: "Silver",
        category: "Hex Bolts",
        unit: "Kg",
        price: 180,
        quantity: 150,
        subtotal: 27000,
      },
    ],
    subtotal: 27000,
    taxableAmount: 27000,
    cgst: 2430,
    sgst: 2430,
    igst: 0,
    grandTotal: 31860,
    paymentMethod: "NEFT_RTGS",
    paymentStatus: "PAID",
    paymentDetails: {
      transactionId: "HDFCN2627918291",
      senderBank: "HDFC Bank",
      accountHolder: "Sunrise Traders",
      paidAt: "2026-10-02T14:15:00+05:30",
    },
    transporter: "ARC Carrier",
    bookingDate: "2026-10-02T14:10:00+05:30",
    estimatedDeliveryDate: "2026-10-05",
    deliveryStatus: "DELIVERED",
    followUp: {
      scheduledDate: "2026-10-07",
      status: "RESOLVED",
      prompt: "Checked on M16 Hex Bolt quality",
      customerFeedback: "Product quality is very good. Finishing is clean, bolts fitted well with nuts.",
      satisfactionRating: 5,
    },
  },
];

/**
 * Retrieves all booked orders from localStorage merged with defaults
 */
export function getAllBookedOrders(): CustomerOrderBooking[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(DEFAULT_SEEDED_ORDERS));
      return DEFAULT_SEEDED_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading booked orders:", err);
    return DEFAULT_SEEDED_ORDERS;
  }
}

/**
 * Saves a new booked order to persistent localStorage and updates customer directory
 */
export function saveBookedOrder(order: CustomerOrderBooking): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getAllBookedOrders();
    const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));

    // Update customer profiles
    updateCustomerProfileFromOrder(order);

    // Also inject order into TradeFlow in-memory store so it shows in orders list & dashboard
    injectIntoTradeFlowOrders(order);
  } catch (err) {
    console.error("Error saving booked order:", err);
  }
}

/**
 * Get all customer profiles (default CUSTOMERS + any new customer created during checkout)
 */
export function getAllCustomerProfiles(): Customer[] {
  if (typeof window === "undefined") return CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(CUSTOMERS));
      return CUSTOMERS;
    }
    const stored: Customer[] = JSON.parse(raw);
    return stored;
  } catch {
    return CUSTOMERS;
  }
}

/**
 * Updates or creates a customer profile after an order is placed
 */
export function updateCustomerProfileFromOrder(order: CustomerOrderBooking): void {
  if (typeof window === "undefined") return;
  try {
    const profiles = getAllCustomerProfiles();
    const existingIdx = profiles.findIndex(
      (c) =>
        c.id === order.customerId ||
        c.phone.replace(/\D/g, "") === order.phone.replace(/\D/g, "") ||
        c.name.toLowerCase() === order.companyName.toLowerCase()
    );

    const now = order.bookingDate.split("T")[0];

    if (existingIdx >= 0) {
      const existing = profiles[existingIdx];
      const updatedProfile: Customer = {
        ...existing,
        name: order.companyName || existing.name,
        contactPerson: order.customerName || existing.contactPerson,
        phone: order.phone || existing.phone,
        email: order.email || existing.email,
        city: order.city || existing.city,
        state: order.state || existing.state,
        billingAddress: order.deliveryAddress || existing.billingAddress,
        gstin: order.gstin || existing.gstin,
        lastOrderDate: now,
        totalOrders: (existing.totalOrders || 1) + 1,
      };
      profiles[existingIdx] = updatedProfile;
    } else {
      const newCustomer: Customer = {
        id: order.customerId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: order.companyName || order.customerName,
        contactPerson: order.customerName,
        city: order.city,
        state: order.state,
        billingAddress: order.deliveryAddress,
        gstin: order.gstin || "27AABC" + Math.floor(1000 + Math.random() * 9000) + "1Z5",
        phone: order.phone,
        email: order.email,
        creditLimit: 500000,
        creditUsed: 0,
        paymentTerms: 30,
        outstandingAmount: 0,
        totalOrders: 1,
        lastOrderDate: now,
      };
      profiles.unshift(newCustomer);
    }

    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Error updating customer profile:", err);
  }
}

/**
 * Finds customer and their previous order history by phone number or company name
 */
export function findCustomerAndPreviousOrders(query: string): {
  customer: Customer | null;
  previousOrders: CustomerOrderBooking[];
  lastOrder: CustomerOrderBooking | null;
} {
  if (!query || query.trim().length < 3) {
    return { customer: null, previousOrders: [], lastOrder: null };
  }

  const cleanQuery = query.toLowerCase().trim();
  const digitsOnly = query.replace(/\D/g, "");

  const profiles = getAllCustomerProfiles();
  const matchedCustomer =
    profiles.find((c) => {
      const pClean = c.phone.replace(/\D/g, "");
      if (digitsOnly.length >= 6 && pClean.includes(digitsOnly)) return true;
      if (c.name.toLowerCase().includes(cleanQuery)) return true;
      if (c.contactPerson?.toLowerCase().includes(cleanQuery)) return true;
      if (c.email?.toLowerCase().includes(cleanQuery)) return true;
      return false;
    }) || null;

  const allOrders = getAllBookedOrders();
  const customerOrders = allOrders.filter((o) => {
    if (matchedCustomer && o.customerId === matchedCustomer.id) return true;
    if (digitsOnly.length >= 6 && o.phone.replace(/\D/g, "").includes(digitsOnly)) return true;
    if (o.companyName.toLowerCase().includes(cleanQuery)) return true;
    if (o.customerName.toLowerCase().includes(cleanQuery)) return true;
    return false;
  });

  return {
    customer: matchedCustomer,
    previousOrders: customerOrders,
    lastOrder: customerOrders[0] || null,
  };
}

/**
 * Saves customer feedback on previous order
 */
export function recordPreviousOrderFeedback(
  orderId: string,
  feedback: string,
  rating: number = 5
): void {
  if (typeof window === "undefined") return;
  try {
    const orders = getAllBookedOrders();
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx >= 0) {
      orders[idx].followUp = {
        ...orders[idx].followUp,
        status: "RESOLVED",
        lastContactedAt: new Date().toISOString(),
        customerFeedback: feedback,
        satisfactionRating: rating,
      };
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    }
  } catch (err) {
    console.error("Error recording feedback:", err);
  }
}

/**
 * Helper to inject the booked order into in-memory store so it appears across dashboard & orders
 */
function injectIntoTradeFlowOrders(booking: CustomerOrderBooking): void {
  try {
    const orderItems: OrderItem[] = booking.items.map((i) => ({
      itemId: i.itemId,
      itemCode: i.itemCode,
      itemName: i.itemName,
      qtyOrdered: i.quantity,
      qtyAvailable: i.quantity,
      qtyReserved: i.quantity,
      qtyAllocated: i.quantity,
      qtyShort: 0,
      rate: i.price,
      amount: i.subtotal,
      unit: i.unit,
    }));

    const newOrder: Order = {
      id: booking.orderId,
      orderNo: booking.orderNumber,
      customerId: booking.customerId,
      customerName: booking.companyName || booking.customerName,
      status: booking.paymentMethod === "COD" ? "CONFIRMED" : "CONFIRMED",
      priority: "NORMAL",
      orderDate: booking.bookingDate.split("T")[0],
      deliveryDate: booking.estimatedDeliveryDate,
      items: orderItems,
      totalAmount: booking.grandTotal,
      notes: booking.orderNotes || `Booked via Customer Portal (${booking.paymentMethod})`,
      assignedTo: "Sales Desk",
      createdBy: booking.customerName,
      workflow: [
        {
          id: "W1",
          label: "Order Booked",
          status: "COMPLETED",
          completedAt: booking.bookingDate,
          completedBy: booking.customerName,
        },
        {
          id: "W2",
          label:
            booking.paymentMethod === "COD"
              ? "COD Verified"
              : booking.paymentStatus === "PAID"
              ? "Payment Received"
              : "Payment Verification",
          status: booking.paymentStatus === "PAID" ? "COMPLETED" : "CURRENT",
          completedAt: booking.bookingDate,
        },
        { id: "W3", label: "Stock Allocation", status: "PENDING" },
        { id: "W4", label: "Dispatch & Challan", status: "PENDING" },
      ],
    };

    // Push into global array if not already present
    const { ORDERS } = require("./data");
    if (!ORDERS.some((o: Order) => o.id === newOrder.id)) {
      ORDERS.unshift(newOrder);
    }
  } catch (err) {
    // Non-critical fallback
  }
}/**
 * Checks stock levels for a new order and dispatches notifications to the manager.
 * Call this right after saveBookedOrder() in the checkout flow.
 *
 * @param booking - The just-placed customer order
 * @param addNotification - From useNotificationStore().addNotification
 */
export function checkStockAndNotify(
  booking: CustomerOrderBooking,
  addNotification: (n: {
    type: NotificationType;
    title: string;
    message: string;
    severity: NotificationSeverity;
    entityId?: string;
    entityType?: "ORDER" | "ITEM" | "TASK" | "WORKER";
    href?: string;
  }) => void
): void {
  if (typeof window === "undefined") return;

  try {
    const { ITEMS: items } = require("./data");

    // 1. New Order notification
    const itemSummary = booking.items
      .map((i) => `${i.quantity}× ${i.itemName}`)
      .join(", ");

    addNotification({
      type: "NEW_ORDER",
      title: "New Order Received",
      message: `${booking.companyName || booking.customerName} placed ${booking.orderNumber} for ${itemSummary} (₹${booking.grandTotal.toLocaleString("en-IN")})`,
      severity: "INFO",
      entityId: booking.orderId,
      entityType: "ORDER",
      href: `/orders/${booking.orderId}`,
    });

    // 2. Per-item stock checks
    for (const orderedItem of booking.items) {
      const stockItem = items.find((i: { id: string }) => i.id === orderedItem.itemId);
      if (!stockItem) continue;

      const available = stockItem.stock - stockItem.reservedStock;
      const needed = orderedItem.quantity;
      const locationStr = stockItem.godownStock
        .filter((g: { location?: string }) => g.location)
        .map((g: { godown: string; location?: string; available: number }) =>
          `${g.godown}@${g.location}(${g.available})`
        )
        .join(", ") || "check stock";

      if (available < needed) {
        // Out of stock / insufficient
        addNotification({
          type: "STOCK_OUT",
          title: "⚠ Stock Insufficient for New Order",
          message: `${booking.orderNumber}: ${orderedItem.itemName} — Need ${needed}, only ${Math.max(available, 0)} available. Short by ${needed - available}. Locations: ${locationStr}`,
          severity: "CRITICAL",
          entityId: orderedItem.itemId,
          entityType: "ITEM",
          href: "/inventory/stock",
        });
      } else if (stockItem.stock - needed < stockItem.minStock) {
        // Stock will drop below min after this order
        addNotification({
          type: "STOCK_LOW",
          title: "Stock Will Drop Below Minimum",
          message: `After fulfilling ${booking.orderNumber}, ${orderedItem.itemName} will have ${stockItem.stock - needed} units (min: ${stockItem.minStock}). Reorder soon.`,
          severity: "WARNING",
          entityId: orderedItem.itemId,
          entityType: "ITEM",
          href: "/inventory/stock",
        });
      }
    }
  } catch (err) {
    console.error("Stock check error:", err);
  }
}
