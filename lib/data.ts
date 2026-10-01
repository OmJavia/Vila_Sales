// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "STOCK_CHECK"
  | "PURCHASE_REQUIRED"
  | "ALLOCATED"
  | "VERIFIED"
  | "CHALLAN_READY"
  | "DISPATCHED"
  | "INVOICED"
  | "PAYMENT_DONE"
  | "CLOSED"
  | "CANCELLED";

export type StockLevel = "OK" | "LOW" | "CRITICAL" | "OUT";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Customer {
  id: string;
  name: string;
  city: string;
  state?: string;
  stateCode?: string;
  billingAddress?: string;
  gstin: string;
  creditLimit: number;
  creditUsed: number;
  paymentTerms: number;
  phone: string;
  email: string;
  contactPerson: string;
  outstandingAmount: number;
  totalOrders: number;
  lastOrderDate: string;
}

export interface Item {
  id: string;
  name: string;
  code: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  reservedStock: number;
  allocatedStock: number;
  stockLevel: StockLevel;
  godownStock: GodownStock[];
  specifications?: string;
  suggestedSupplier?: string;
}

export interface GodownStock {
  godown: string;
  physical: number;
  reserved: number;
  available: number;
}

export interface OrderItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  qtyOrdered: number;
  qtyAvailable: number;
  qtyReserved: number;
  qtyAllocated: number;
  qtyShort: number;
  rate: number;
  amount: number;
  unit: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  priority: "NORMAL" | "HIGH" | "URGENT";
  orderDate: string;
  deliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  notes: string;
  assignedTo: string;
  createdBy: string;
  workflow: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  label: string;
  status: "COMPLETED" | "CURRENT" | "PENDING";
  completedAt?: string;
  completedBy?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  description: string;
  user: string;
  type: "ORDER" | "STOCK" | "PAYMENT" | "DISPATCH" | "SYSTEM" | "COMPLAINT";
  entityId?: string;
}

export interface KPIData {
  pendingOrders: number;
  purchaseRequired: number;
  ordersReady: number;
  verificationPending: number;
  dispatchPending: number;
  invoicePending: number;
  outstanding: number;
  complaints: number;
}

export interface AttentionItem {
  id: string;
  type: "OVERDUE" | "LOW_STOCK" | "COMPLAINT" | "DISPATCH_PENDING" | "PAYMENT_OVERDUE" | "LR_MISSING" | "OLD_ORDER";
  title: string;
  subtitle: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  entityId: string;
  entityType: "ORDER" | "CUSTOMER" | "ITEM";
  href: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "ABC Industries Pvt. Ltd.",
    city: "Mumbai",
    gstin: "27AABCA1234B1Z5",
    creditLimit: 500000,
    creditUsed: 341000,
    paymentTerms: 30,
    phone: "+91 98765 43210",
    email: "accounts@abcindustries.in",
    contactPerson: "Rajesh Mehta",
    outstandingAmount: 341000,
    totalOrders: 48,
    lastOrderDate: "2026-09-30",
  },
  {
    id: "C002",
    name: "Sunrise Traders",
    city: "Pune",
    gstin: "27BBBST5678C2Z3",
    creditLimit: 200000,
    creditUsed: 87500,
    paymentTerms: 15,
    phone: "+91 98765 11111",
    email: "purchase@sunrisetraders.in",
    contactPerson: "Sunil Patil",
    outstandingAmount: 87500,
    totalOrders: 31,
    lastOrderDate: "2026-09-28",
  },
  {
    id: "C003",
    name: "Metro Hardware Co.",
    city: "Nashik",
    gstin: "27CCCMH9012D3Z1",
    creditLimit: 300000,
    creditUsed: 44800,
    paymentTerms: 45,
    phone: "+91 98765 22222",
    email: "orders@metrohardware.in",
    contactPerson: "Mohan Gupta",
    outstandingAmount: 44800,
    totalOrders: 19,
    lastOrderDate: "2026-09-25",
  },
  {
    id: "C004",
    name: "Bharat Steel Works",
    city: "Nagpur",
    gstin: "27DDDBS3456E4Z8",
    creditLimit: 750000,
    creditUsed: 62500,
    paymentTerms: 60,
    phone: "+91 98765 33333",
    email: "procurement@bharatsteel.in",
    contactPerson: "Vikram Singh",
    outstandingAmount: 62500,
    totalOrders: 62,
    lastOrderDate: "2026-09-29",
  },
  {
    id: "C005",
    name: "Excellent Builders",
    city: "Aurangabad",
    gstin: "27EEEEL7890F5Z6",
    creditLimit: 150000,
    creditUsed: 127000,
    paymentTerms: 7,
    phone: "+91 98765 44444",
    email: "site@excellentbuilders.in",
    contactPerson: "Anil Deshmukh",
    outstandingAmount: 127000,
    totalOrders: 14,
    lastOrderDate: "2026-09-27",
  },
];

import { MIDAS_ITEMS } from "./midasData";

export const ITEMS: Item[] = [
  {
    id: "I001",
    name: "AJAX 1000×20 GREEN ANCHOR BOLT",
    code: "AJX-1000-20-GRN",
    brand: "Ajax",
    category: "Anchor Bolts",
    unit: "Box",
    price: 1200,
    stock: 145,
    minStock: 50,
    reservedStock: 20,
    allocatedStock: 10,
    stockLevel: "OK",
    godownStock: [
      { godown: "Main Warehouse", physical: 100, reserved: 15, available: 85 },
      { godown: "Secondary Store", physical: 45, reserved: 5, available: 40 },
    ],
  },
  {
    id: "I002",
    name: "SILVER 750×16 HEX BOLT M16",
    code: "SLV-750-16-HEX",
    brand: "Silver",
    category: "Hex Bolts",
    unit: "Kg",
    price: 350,
    stock: 320,
    minStock: 100,
    reservedStock: 60,
    allocatedStock: 30,
    stockLevel: "OK",
    godownStock: [
      { godown: "Main Warehouse", physical: 250, reserved: 45, available: 205 },
      { godown: "Secondary Store", physical: 70, reserved: 15, available: 55 },
    ],
  },
  {
    id: "I003",
    name: "MAXGRIP 500×12 SOCKET HEAD",
    code: "MGP-500-12-SKT",
    brand: "Maxgrip",
    category: "Socket Head",
    unit: "Box",
    price: 560,
    stock: 18,
    minStock: 30,
    reservedStock: 10,
    allocatedStock: 5,
    stockLevel: "CRITICAL",
    godownStock: [
      { godown: "Main Warehouse", physical: 18, reserved: 10, available: 8 },
      { godown: "Secondary Store", physical: 0, reserved: 0, available: 0 },
    ],
  },
  {
    id: "I004",
    name: "POWERFIT 300×10 SS WASHER",
    code: "PWF-300-10-SS",
    brand: "Powerfit",
    category: "Washers",
    unit: "Kg",
    price: 125,
    stock: 892,
    minStock: 200,
    reservedStock: 150,
    allocatedStock: 80,
    stockLevel: "OK",
    godownStock: [
      { godown: "Main Warehouse", physical: 600, reserved: 100, available: 500 },
      { godown: "Secondary Store", physical: 292, reserved: 50, available: 242 },
    ],
  },
  {
    id: "I005",
    name: "ULTRA 200×8 SELF DRILL SCREW",
    code: "ULT-200-08-SDS",
    brand: "Ultra",
    category: "Self Drill",
    unit: "Box",
    price: 180,
    stock: 67,
    minStock: 50,
    reservedStock: 20,
    allocatedStock: 10,
    stockLevel: "LOW",
    godownStock: [
      { godown: "Main Warehouse", physical: 50, reserved: 15, available: 35 },
      { godown: "Secondary Store", physical: 17, reserved: 5, available: 12 },
    ],
  },
  ...MIDAS_ITEMS,
];

const makeWorkflow = (currentStatus: OrderStatus): WorkflowStep[] => {
  const steps: { id: string; label: string; statuses: OrderStatus[] }[] = [
    { id: "order", label: "Order", statuses: ["DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "stock", label: "Stock Check", statuses: ["STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "verify", label: "Verify", statuses: ["VERIFIED", "CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "challan", label: "Challan", statuses: ["CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "dispatch", label: "Dispatch", statuses: ["DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "invoice", label: "Invoice", statuses: ["INVOICED", "PAYMENT_DONE", "CLOSED"] },
    { id: "payment", label: "Payment", statuses: ["PAYMENT_DONE", "CLOSED"] },
  ];

  const statusOrder: OrderStatus[] = ["DRAFT", "CONFIRMED", "STOCK_CHECK", "PURCHASE_REQUIRED", "ALLOCATED", "VERIFIED", "CHALLAN_READY", "DISPATCHED", "INVOICED", "PAYMENT_DONE", "CLOSED"];
  const currentIdx = statusOrder.indexOf(currentStatus);

  return steps.map((step, i) => {
    if (i < currentIdx) return { id: step.id, label: step.label, status: "COMPLETED" as const };
    if (i === currentIdx) return { id: step.id, label: step.label, status: "CURRENT" as const };
    return { id: step.id, label: step.label, status: "PENDING" as const };
  });
};

export const ORDERS: Order[] = [
  {
    id: "O001",
    orderNo: "#1048",
    customerId: "C001",
    customerName: "ABC Industries Pvt. Ltd.",
    status: "VERIFIED",
    priority: "HIGH",
    orderDate: "2026-09-30",
    deliveryDate: "2026-10-05",
    totalAmount: 120000,
    notes: "Urgent delivery required for site #4",
    assignedTo: "Priya Patil",
    createdBy: "Amit Sharma",
    items: [
      {
        itemId: "I001",
        itemCode: "AJX-1000-20-GRN",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
        qtyOrdered: 100,
        qtyAvailable: 60,
        qtyReserved: 60,
        qtyAllocated: 60,
        qtyShort: 40,
        rate: 1200,
        amount: 120000,
        unit: "Box",
      },
    ],
    workflow: makeWorkflow("VERIFIED"),
  },
  {
    id: "O002",
    orderNo: "#1047",
    customerId: "C002",
    customerName: "Sunrise Traders",
    status: "DISPATCHED",
    priority: "NORMAL",
    orderDate: "2026-09-28",
    deliveryDate: "2026-10-02",
    totalAmount: 87500,
    notes: "",
    assignedTo: "Raju More",
    createdBy: "Priya Patil",
    items: [
      {
        itemId: "I002",
        itemCode: "SLV-750-16-HEX",
        itemName: "SILVER 750×16 HEX BOLT M16",
        qtyOrdered: 250,
        qtyAvailable: 250,
        qtyReserved: 0,
        qtyAllocated: 250,
        qtyShort: 0,
        rate: 350,
        amount: 87500,
        unit: "Kg",
      },
    ],
    workflow: makeWorkflow("DISPATCHED"),
  },
  {
    id: "O003",
    orderNo: "#1046",
    customerId: "C003",
    customerName: "Metro Hardware Co.",
    status: "PURCHASE_REQUIRED",
    priority: "URGENT",
    orderDate: "2026-09-25",
    deliveryDate: "2026-10-01",
    totalAmount: 44800,
    notes: "Customer has been waiting — escalate",
    assignedTo: "Priya Patil",
    createdBy: "Priya Patil",
    items: [
      {
        itemId: "I003",
        itemCode: "MGP-500-12-SKT",
        itemName: "MAXGRIP 500×12 SOCKET HEAD",
        qtyOrdered: 80,
        qtyAvailable: 18,
        qtyReserved: 10,
        qtyAllocated: 0,
        qtyShort: 62,
        rate: 560,
        amount: 44800,
        unit: "Box",
      },
    ],
    workflow: makeWorkflow("PURCHASE_REQUIRED"),
  },
  {
    id: "O004",
    orderNo: "#1045",
    customerId: "C004",
    customerName: "Bharat Steel Works",
    status: "ALLOCATED",
    priority: "NORMAL",
    orderDate: "2026-09-27",
    deliveryDate: "2026-10-07",
    totalAmount: 62500,
    notes: "",
    assignedTo: "Priya Patil",
    createdBy: "Amit Sharma",
    items: [
      {
        itemId: "I004",
        itemCode: "PWF-300-10-SS",
        itemName: "POWERFIT 300×10 SS WASHER",
        qtyOrdered: 500,
        qtyAvailable: 500,
        qtyReserved: 500,
        qtyAllocated: 500,
        qtyShort: 0,
        rate: 125,
        amount: 62500,
        unit: "Kg",
      },
    ],
    workflow: makeWorkflow("ALLOCATED"),
  },
  {
    id: "O005",
    orderNo: "#1044",
    customerId: "C005",
    customerName: "Excellent Builders",
    status: "INVOICED",
    priority: "NORMAL",
    orderDate: "2026-09-20",
    deliveryDate: "2026-09-25",
    totalAmount: 27000,
    notes: "",
    assignedTo: "Sneha Joshi",
    createdBy: "Priya Patil",
    items: [
      {
        itemId: "I005",
        itemCode: "ULT-200-08-SDS",
        itemName: "ULTRA 200×8 SELF DRILL SCREW",
        qtyOrdered: 150,
        qtyAvailable: 67,
        qtyReserved: 0,
        qtyAllocated: 150,
        qtyShort: 0,
        rate: 180,
        amount: 27000,
        unit: "Box",
      },
    ],
    workflow: makeWorkflow("INVOICED"),
  },
  {
    id: "O006",
    orderNo: "#1043",
    customerId: "C001",
    customerName: "ABC Industries Pvt. Ltd.",
    status: "DRAFT",
    priority: "NORMAL",
    orderDate: "2026-09-30",
    deliveryDate: "2026-10-10",
    totalAmount: 21000,
    notes: "",
    assignedTo: "Priya Patil",
    createdBy: "Priya Patil",
    items: [
      {
        itemId: "I002",
        itemCode: "SLV-750-16-HEX",
        itemName: "SILVER 750×16 HEX BOLT M16",
        qtyOrdered: 60,
        qtyAvailable: 320,
        qtyReserved: 0,
        qtyAllocated: 0,
        qtyShort: 0,
        rate: 350,
        amount: 21000,
        unit: "Kg",
      },
    ],
    workflow: makeWorkflow("DRAFT"),
  },
  {
    id: "O007",
    orderNo: "#1042",
    customerId: "C002",
    customerName: "Sunrise Traders",
    status: "CLOSED",
    priority: "NORMAL",
    orderDate: "2026-09-15",
    deliveryDate: "2026-09-20",
    totalAmount: 240000,
    notes: "",
    assignedTo: "Sneha Joshi",
    createdBy: "Amit Sharma",
    items: [
      {
        itemId: "I001",
        itemCode: "AJX-1000-20-GRN",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
        qtyOrdered: 200,
        qtyAvailable: 200,
        qtyReserved: 0,
        qtyAllocated: 200,
        qtyShort: 0,
        rate: 1200,
        amount: 240000,
        unit: "Box",
      },
    ],
    workflow: makeWorkflow("CLOSED"),
  },
];

export const KPI_DATA: KPIData = {
  pendingOrders: 23,
  purchaseRequired: 8,
  ordersReady: 5,
  verificationPending: 3,
  dispatchPending: 7,
  invoicePending: 11,
  outstanding: 1842000,
  complaints: 3,
};

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "A001",
    type: "OLD_ORDER",
    title: "Order #1046 — 5 days old, no dispatch",
    subtitle: "Metro Hardware Co. · ₹44,800 · PURCHASE REQUIRED",
    severity: "HIGH",
    entityId: "O003",
    entityType: "ORDER",
    href: "/orders/O003",
  },
  {
    id: "A002",
    type: "LOW_STOCK",
    title: "MAXGRIP 500×12 SOCKET HEAD below minimum",
    subtitle: "Stock: 18 units · Minimum: 30 · 4 orders pending",
    severity: "HIGH",
    entityId: "I003",
    entityType: "ITEM",
    href: "/inventory/stock",
  },
  {
    id: "A003",
    type: "PAYMENT_OVERDUE",
    title: "Excellent Builders — payment overdue 3 days",
    subtitle: "Invoice #INV-1044 · ₹27,000 · Due: 27 Sep",
    severity: "HIGH",
    entityId: "C005",
    entityType: "CUSTOMER",
    href: "/customers/C005",
  },
  {
    id: "A004",
    type: "DISPATCH_PENDING",
    title: "7 orders ready but not dispatched",
    subtitle: "Oldest: #1045 (3 days) · Total value: ₹3,82,000",
    severity: "MEDIUM",
    entityId: "O004",
    entityType: "ORDER",
    href: "/dispatch",
  },
  {
    id: "A005",
    type: "COMPLAINT",
    title: "3 open complaints pending response",
    subtitle: "1 high priority · ABC Industries, Sunrise Traders, Metro Hardware",
    severity: "MEDIUM",
    entityId: "C001",
    entityType: "CUSTOMER",
    href: "/customers/complaints",
  },
  {
    id: "A006",
    type: "LR_MISSING",
    title: "Order #1047 dispatched — LR/POD not uploaded",
    subtitle: "Sunrise Traders · Dispatched 28 Sep · 2 days overdue",
    severity: "LOW",
    entityId: "O002",
    entityType: "ORDER",
    href: "/dispatch/lr-pod",
  },
];

export const TODAY_ACTIVITY: ActivityEvent[] = [
  {
    id: "E001",
    timestamp: "2026-09-30T17:45:00+05:30",
    description: "Invoice #INV-1044 sent to Excellent Builders via email",
    user: "Sneha Joshi",
    type: "ORDER",
    entityId: "O005",
  },
  {
    id: "E002",
    timestamp: "2026-09-30T17:20:00+05:30",
    description: "Order #1043 created for ABC Industries — ₹21,000",
    user: "Priya Patil",
    type: "ORDER",
    entityId: "O006",
  },
  {
    id: "E003",
    timestamp: "2026-09-30T15:10:00+05:30",
    description: "Stock verified for Order #1048 — 60 units confirmed, 40 short",
    user: "Raju More",
    type: "STOCK",
    entityId: "O001",
  },
  {
    id: "E004",
    timestamp: "2026-09-30T14:30:00+05:30",
    description: "Purchase requirement raised: MGP-500-12-SKT — 62 units",
    user: "System",
    type: "ORDER",
    entityId: "O003",
  },
  {
    id: "E005",
    timestamp: "2026-09-30T11:30:00+05:30",
    description: "Challan DC-1048 generated for ABC Industries",
    user: "Priya Patil",
    type: "DISPATCH",
    entityId: "O001",
  },
  {
    id: "E006",
    timestamp: "2026-09-30T10:41:00+05:30",
    description: "Stock checked for Order #1048 — 60 available, 40 short",
    user: "Raju More",
    type: "STOCK",
    entityId: "O001",
  },
  {
    id: "E007",
    timestamp: "2026-09-30T10:32:00+05:30",
    description: "Order #1048 created for ABC Industries — ₹1,20,000",
    user: "Amit Sharma",
    type: "ORDER",
    entityId: "O001",
  },
];

export const ORDER_ACTIVITY: ActivityEvent[] = [
  {
    id: "OA001",
    timestamp: "2026-09-30T15:10:00+05:30",
    description: "Stock verified: 60 units confirmed, 40 short · Status → VERIFIED",
    user: "Raju More",
    type: "STOCK",
  },
  {
    id: "OA002",
    timestamp: "2026-09-30T14:41:00+05:30",
    description: "Purchase requirement raised for 40 units of AJAX 1000×20",
    user: "System",
    type: "ORDER",
  },
  {
    id: "OA003",
    timestamp: "2026-09-30T11:35:00+05:30",
    description: "Stock checked: 60 available, 40 short · Status → STOCK_CHECK",
    user: "Priya Patil",
    type: "STOCK",
  },
  {
    id: "OA004",
    timestamp: "2026-09-30T11:30:00+05:30",
    description: "Challan DC-1048 generated",
    user: "Priya Patil",
    type: "DISPATCH",
  },
  {
    id: "OA005",
    timestamp: "2026-09-30T10:32:00+05:30",
    description: "Order created · Status → CONFIRMED",
    user: "Amit Sharma",
    type: "ORDER",
  },
];

// ─── API simulation helpers ──────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  // Merge in any in-memory status overrides from the global store
  try {
    const { useTradeFlowStore } = await import("./store");
    const overrides = useTradeFlowStore.getState().orderOverrides;
    return ORDERS.map((o) =>
      overrides[o.id] ? { ...o, status: overrides[o.id].status } : o
    );
  } catch {
    return ORDERS;
  }
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  const order = ORDERS.find((o) => o.id === id) ?? null;
  if (!order) return null;
  // Merge in any in-memory status override from the global store
  try {
    const { useTradeFlowStore } = await import("./store");
    const override = useTradeFlowStore.getState().orderOverrides[id];
    if (override) {
      return { ...order, status: override.status };
    }
  } catch {}
  return order;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return CUSTOMERS;
}

export async function fetchCustomer(id: string): Promise<Customer | null> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return CUSTOMERS.find((c) => c.id === id) ?? null;
}

export async function fetchItems(): Promise<Item[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return ITEMS;
}

export async function fetchKPIData(): Promise<KPIData> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return KPI_DATA;
}

export async function fetchAttentionItems(): Promise<AttentionItem[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return ATTENTION_ITEMS;
}

export async function fetchTodayActivity(): Promise<ActivityEvent[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return TODAY_ACTIVITY;
}

// ─── Additional Module Types & Data ──────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstin: string;
  paymentTerms: number; // days
  balancePayable: number;
  openOrdersCount: number;
  rating: number; // 1-5
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "SUP-001",
    name: "Apex Forgings & Fasteners Ltd.",
    contactPerson: "Dinesh Khandelwal",
    phone: "+91 98200 44211",
    email: "sales@apexforgings.in",
    city: "Ludhiana",
    state: "Punjab",
    gstin: "03AABCA7890B1Z2",
    paymentTerms: 45,
    balancePayable: 420000,
    openOrdersCount: 2,
    rating: 4.8,
  },
  {
    id: "SUP-002",
    name: "Tata Precision Metals",
    contactPerson: "Kavita Rao",
    phone: "+91 98211 99882",
    email: "procure@tataprecision.com",
    city: "Jamshedpur",
    state: "Jharkhand",
    gstin: "20AABCT1234F1Z8",
    paymentTerms: 30,
    balancePayable: 685000,
    openOrdersCount: 3,
    rating: 4.9,
  },
  {
    id: "SUP-003",
    name: "Maxgrip Industrial Fasteners",
    contactPerson: "Suresh Agarwal",
    phone: "+91 98330 11223",
    email: "suresh@maxgripfasteners.co.in",
    city: "Ahmedabad",
    state: "Gujarat",
    gstin: "24AABCM9988D1Z4",
    paymentTerms: 15,
    balancePayable: 112000,
    openOrdersCount: 1,
    rating: 4.2,
  },
  {
    id: "SUP-004",
    name: "Sterling Stainless Components",
    contactPerson: "Gaurav Malhotra",
    phone: "+91 98450 77665",
    email: "orders@sterlingstainless.com",
    city: "Faridabad",
    state: "Haryana",
    gstin: "06AABCS4455C1Z1",
    paymentTerms: 30,
    balancePayable: 215000,
    openOrdersCount: 1,
    rating: 4.5,
  },
  {
    id: "SUP-005",
    name: "Midas Treads (India) Pvt. Ltd.",
    contactPerson: "Sivaramakrishnan / Ramnath R.",
    phone: "+91 481 2561215",
    email: "sales@midastreads.com",
    city: "Kottayam",
    state: "Kerala",
    gstin: "32AABCM1969M1Z5",
    paymentTerms: 30,
    balancePayable: 185000,
    openOrdersCount: 2,
    rating: 4.95,
  },
];

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  date: string;
  validUntil: string;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED" | "REJECTED";
  itemsCount: number;
  contactPerson: string;
}

export const QUOTATIONS: Quotation[] = [
  {
    id: "QT-2026-101",
    quotationNo: "QT-101",
    customerId: "C001",
    customerName: "ABC Industries Pvt. Ltd.",
    date: "2026-09-29",
    validUntil: "2026-10-15",
    totalAmount: 185000,
    status: "SENT",
    itemsCount: 3,
    contactPerson: "Rajesh Mehta",
  },
  {
    id: "QT-2026-102",
    quotationNo: "QT-102",
    customerId: "C003",
    customerName: "Metro Hardware Co.",
    date: "2026-09-28",
    validUntil: "2026-10-10",
    totalAmount: 94000,
    status: "ACCEPTED",
    itemsCount: 2,
    contactPerson: "Mohan Gupta",
  },
  {
    id: "QT-2026-103",
    quotationNo: "QT-103",
    customerId: "C004",
    customerName: "Bharat Steel Works",
    date: "2026-09-24",
    validUntil: "2026-10-08",
    totalAmount: 312000,
    status: "DRAFT",
    itemsCount: 4,
    contactPerson: "Vikram Singh",
  },
];

export interface Challan {
  id: string;
  challanNo: string;
  orderNo: string;
  customerName: string;
  dispatchDate: string;
  vehicleNo: string;
  transporter: string;
  packagesCount: number;
  status: "PENDING_DISPATCH" | "DISPATCHED" | "DELIVERED";
  ewayBillNo: string;
}

export const CHALLANS: Challan[] = [
  {
    id: "CH-1048",
    challanNo: "DC-1048",
    orderNo: "#1048",
    customerName: "ABC Industries Pvt. Ltd.",
    dispatchDate: "2026-09-30",
    vehicleNo: "MH-04-GP-3829",
    transporter: "V-Trans India Ltd.",
    packagesCount: 12,
    status: "PENDING_DISPATCH",
    ewayBillNo: "241829103948",
  },
  {
    id: "CH-1047",
    challanNo: "DC-1047",
    orderNo: "#1047",
    customerName: "Sunrise Traders",
    dispatchDate: "2026-09-28",
    vehicleNo: "MH-12-QE-7721",
    transporter: "Navata Road Transport",
    packagesCount: 8,
    status: "DISPATCHED",
    ewayBillNo: "241829094821",
  },
  {
    id: "CH-1044",
    challanNo: "DC-1044",
    orderNo: "#1044",
    customerName: "Excellent Builders",
    dispatchDate: "2026-09-21",
    vehicleNo: "MH-20-AB-1102",
    transporter: "TCI Freight",
    packagesCount: 5,
    status: "DELIVERED",
    ewayBillNo: "241828901234",
  },
];

export interface InvoiceLineItem {
  id: string;
  itemCode: string;
  itemName: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
  discountPct: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerStateCode: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  ewayBillNo?: string;
  vehicleNo?: string;
  transporter?: string;
  irnNumber?: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  amountReceived: number;
  items: InvoiceLineItem[];
}

export const INVOICES: Invoice[] = [
  {
    id: "INV-1044",
    invoiceNo: "INV/26-27/0482",
    orderNo: "#1044",
    customerId: "C005",
    customerName: "Excellent Builders",
    customerGstin: "27EEEEL7890F5Z6",
    customerAddress: "Site Office, Plot 88, MIDC Waluj, Aurangabad - 431136",
    customerCity: "Aurangabad",
    customerState: "Maharashtra",
    customerStateCode: "27",
    invoiceDate: "2026-09-20",
    dueDate: "2026-09-27",
    placeOfSupply: "27 - Maharashtra",
    ewayBillNo: "241828901234",
    vehicleNo: "MH-20-AB-1102",
    transporter: "TCI Freight",
    irnNumber: "4a7f29b8c31e90a5d627b4e8912c3f87a64e910283c47e819b0234a5d891c2e4",
    taxableAmount: 22881.36,
    cgst: 2059.32,
    sgst: 2059.32,
    igst: 0,
    totalAmount: 27000,
    paymentStatus: "OVERDUE",
    amountReceived: 0,
    items: [
      {
        id: "LI-01",
        itemCode: "ULT-200-08-SDS",
        itemName: "ULTRA 200×8 SELF DRILL SCREW (Zinc Coated)",
        hsnCode: "73181500",
        qty: 150,
        unit: "Box",
        rate: 180,
        discountPct: 15.25,
        taxableAmount: 22881.36,
        gstRate: 18,
        cgstAmount: 2059.32,
        sgstAmount: 2059.32,
        igstAmount: 0,
        totalAmount: 27000,
      },
    ],
  },
  {
    id: "INV-1042",
    invoiceNo: "INV/26-27/0471",
    orderNo: "#1042",
    customerId: "C002",
    customerName: "Sunrise Traders",
    customerGstin: "27BBBST5678C2Z3",
    customerAddress: "Shop 12-14, Laxmi Road Commercial Complex, Pune - 411030",
    customerCity: "Pune",
    customerState: "Maharashtra",
    customerStateCode: "27",
    invoiceDate: "2026-09-15",
    dueDate: "2026-09-30",
    placeOfSupply: "27 - Maharashtra",
    ewayBillNo: "241829094821",
    vehicleNo: "MH-12-QE-7721",
    transporter: "Navata Road Transport",
    irnNumber: "9b3c41e8f20a7d91e847c2b5034a1f68e92038b47c912e038a1928b4c730e912",
    taxableAmount: 203389.83,
    cgst: 18305.08,
    sgst: 18305.08,
    igst: 0,
    totalAmount: 240000,
    paymentStatus: "PAID",
    amountReceived: 240000,
    items: [
      {
        id: "LI-02",
        itemCode: "AJX-1000-20-GRN",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT (Grade 8.8)",
        hsnCode: "73181300",
        qty: 200,
        unit: "Box",
        rate: 1200,
        discountPct: 15.25,
        taxableAmount: 203389.83,
        gstRate: 18,
        cgstAmount: 18305.08,
        sgstAmount: 18305.08,
        igstAmount: 0,
        totalAmount: 240000,
      },
    ],
  },
  {
    id: "INV-1040",
    invoiceNo: "INV/26-27/0468",
    orderNo: "#1040",
    customerId: "C004",
    customerName: "Bharat Steel Works",
    customerGstin: "27DDDBS3456E4Z8",
    customerAddress: "Industrial Estate, Hingna Road, Nagpur - 440016",
    customerCity: "Nagpur",
    customerState: "Maharashtra",
    customerStateCode: "27",
    invoiceDate: "2026-09-12",
    dueDate: "2026-11-11",
    placeOfSupply: "27 - Maharashtra",
    ewayBillNo: "241828119023",
    vehicleNo: "MH-31-TR-9004",
    transporter: "V-Trans India Ltd.",
    irnNumber: "7f1e40a9b83c2d61e59048a123b7c890e41920b38c471e920a3847b2c910e345",
    taxableAmount: 144067.8,
    cgst: 12966.1,
    sgst: 12966.1,
    igst: 0,
    totalAmount: 170000,
    paymentStatus: "PARTIAL",
    amountReceived: 100000,
    items: [
      {
        id: "LI-03",
        itemCode: "SLV-750-16-HEX",
        itemName: "SILVER 750×16 HEX BOLT M16 (High Tensile)",
        hsnCode: "73181500",
        qty: 400,
        unit: "Kg",
        rate: 350,
        discountPct: 0,
        taxableAmount: 144067.8,
        gstRate: 18,
        cgstAmount: 12966.1,
        sgstAmount: 12966.1,
        igstAmount: 0,
        totalAmount: 170000,
      },
    ],
  },
];

export interface StockMovement {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  godown: string;
  referenceDoc: string;
  balanceAfter: number;
  notes: string;
}

export const STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "SM-901",
    date: "2026-09-30 15:10",
    itemCode: "AJX-1000-20-GRN",
    itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
    type: "OUT",
    quantity: -60,
    godown: "Main Warehouse (Bhiwandi)",
    referenceDoc: "DC-1048",
    balanceAfter: 85,
    notes: "Allocated & packed for Order #1048",
  },
  {
    id: "SM-900",
    date: "2026-09-29 11:20",
    itemCode: "PWF-300-10-SS",
    itemName: "POWERFIT 300×10 SS WASHER",
    type: "IN",
    quantity: +400,
    godown: "Main Warehouse (Bhiwandi)",
    referenceDoc: "GRN-2026-092",
    balanceAfter: 892,
    notes: "Received from Sterling Stainless Components",
  },
  {
    id: "SM-899",
    date: "2026-09-28 16:45",
    itemCode: "SLV-750-16-HEX",
    itemName: "SILVER 750×16 HEX BOLT M16",
    type: "OUT",
    quantity: -250,
    godown: "Secondary Store (Kalamboli)",
    referenceDoc: "DC-1047",
    balanceAfter: 320,
    notes: "Dispatched to Sunrise Traders",
  },
  {
    id: "SM-898",
    date: "2026-09-27 10:05",
    itemCode: "MGP-500-12-SKT",
    itemName: "MAXGRIP 500×12 SOCKET HEAD",
    type: "ADJUSTMENT",
    quantity: -2,
    godown: "Main Warehouse (Bhiwandi)",
    referenceDoc: "ADJ-2026-014",
    balanceAfter: 18,
    notes: "Thread defect identified during physical inspection",
  },
];

export interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "PARTIAL_RECEIVED" | "COMPLETED" | "CANCELLED";
  items: {
    itemCode: string;
    itemName: string;
    qtyOrdered: number;
    qtyReceived: number;
    unitPrice: number;
    unit: string;
  }[];
}

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-081",
    poNo: "PO-2026-081",
    supplierId: "SUP-003",
    supplierName: "Maxgrip Industrial Fasteners",
    orderDate: "2026-09-26",
    expectedDate: "2026-10-03",
    totalAmount: 48000,
    status: "SENT",
    items: [
      {
        itemCode: "MGP-500-12-SKT",
        itemName: "MAXGRIP 500×12 SOCKET HEAD",
        qtyOrdered: 100,
        qtyReceived: 0,
        unitPrice: 480,
        unit: "Box",
      },
    ],
  },
  {
    id: "PO-080",
    poNo: "PO-2026-080",
    supplierId: "SUP-001",
    supplierName: "Apex Forgings & Fasteners Ltd.",
    orderDate: "2026-09-22",
    expectedDate: "2026-09-29",
    totalAmount: 180000,
    status: "PARTIAL_RECEIVED",
    items: [
      {
        itemCode: "AJX-1000-20-GRN",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
        qtyOrdered: 200,
        qtyReceived: 100,
        unitPrice: 900,
        unit: "Box",
      },
    ],
  },
];

export interface Complaint {
  id: string;
  ticketNo: string;
  customerId: string;
  customerName: string;
  orderNo: string;
  itemCode: string;
  type: "DEFECTIVE_MATERIAL" | "SHORT_DELIVERY" | "DELAYED_DISPATCH" | "WRONG_BILLING";
  description: string;
  createdAt: string;
  status: ComplaintStatus;
  priority: "HIGH" | "MEDIUM" | "LOW";
  assignedTo: string;
}

export const COMPLAINTS: Complaint[] = [
  {
    id: "CMP-01",
    ticketNo: "TKT-1082",
    customerId: "C001",
    customerName: "ABC Industries Pvt. Ltd.",
    orderNo: "#1048",
    itemCode: "AJX-1000-20-GRN",
    type: "SHORT_DELIVERY",
    description: "40 boxes pending delivery from order #1048, site construction waiting.",
    createdAt: "2026-09-30",
    status: "OPEN",
    priority: "HIGH",
    assignedTo: "Priya Patil",
  },
  {
    id: "CMP-02",
    ticketNo: "TKT-1080",
    customerId: "C002",
    customerName: "Sunrise Traders",
    orderNo: "#1047",
    itemCode: "SLV-750-16-HEX",
    type: "DELAYED_DISPATCH",
    description: "Transporter tracking not active for LR copy.",
    createdAt: "2026-09-29",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedTo: "Raju More",
  },
  {
    id: "CMP-03",
    ticketNo: "TKT-1075",
    customerId: "C003",
    customerName: "Metro Hardware Co.",
    orderNo: "#1046",
    itemCode: "MGP-500-12-SKT",
    type: "DEFECTIVE_MATERIAL",
    description: "2 boxes found with rusted plating from previous batch.",
    createdAt: "2026-09-26",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignedTo: "Sneha Joshi",
  },
];

export interface OutstandingRecord {
  customerId: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  totalOutstanding: number;
  bucket0to30: number;
  bucket31to60: number;
  bucket61to90: number;
  bucket90Plus: number;
  lastPaymentDate: string;
}

export const OUTSTANDING_RECORDS: OutstandingRecord[] = [
  {
    customerId: "C001",
    customerName: "ABC Industries Pvt. Ltd.",
    contactPerson: "Rajesh Mehta",
    phone: "+91 98765 43210",
    totalOutstanding: 341000,
    bucket0to30: 215000,
    bucket31to60: 126000,
    bucket61to90: 0,
    bucket90Plus: 0,
    lastPaymentDate: "2026-09-10",
  },
  {
    customerId: "C005",
    customerName: "Excellent Builders",
    contactPerson: "Anil Deshmukh",
    phone: "+91 98765 44444",
    totalOutstanding: 127000,
    bucket0to30: 27000,
    bucket31to60: 55000,
    bucket61to90: 45000,
    bucket90Plus: 0,
    lastPaymentDate: "2026-08-28",
  },
  {
    customerId: "C002",
    customerName: "Sunrise Traders",
    contactPerson: "Sunil Patil",
    phone: "+91 98765 11111",
    totalOutstanding: 87500,
    bucket0to30: 87500,
    bucket31to60: 0,
    bucket61to90: 0,
    bucket90Plus: 0,
    lastPaymentDate: "2026-09-15",
  },
  {
    customerId: "C004",
    customerName: "Bharat Steel Works",
    contactPerson: "Vikram Singh",
    phone: "+91 98765 33333",
    totalOutstanding: 62500,
    bucket0to30: 62500,
    bucket31to60: 0,
    bucket61to90: 0,
    bucket90Plus: 0,
    lastPaymentDate: "2026-09-18",
  },
  {
    customerId: "C003",
    customerName: "Metro Hardware Co.",
    contactPerson: "Mohan Gupta",
    phone: "+91 98765 22222",
    totalOutstanding: 44800,
    bucket0to30: 0,
    bucket31to60: 44800,
    bucket61to90: 0,
    bucket90Plus: 0,
    lastPaymentDate: "2026-08-15",
  },
];

// Async fetch helpers for new modules
export async function fetchSuppliers(): Promise<Supplier[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return SUPPLIERS;
}

export async function fetchQuotations(): Promise<Quotation[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return QUOTATIONS;
}

export async function fetchChallans(): Promise<Challan[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return CHALLANS;
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return INVOICES;
}

export async function fetchInvoice(id: string): Promise<Invoice | null> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return INVOICES.find((i) => i.id === id || i.invoiceNo === id) ?? INVOICES[0];
}

export async function fetchStockMovements(): Promise<StockMovement[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return STOCK_MOVEMENTS;
}

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return PURCHASE_ORDERS;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return COMPLAINTS;
}

export async function fetchOutstandingRecords(): Promise<OutstandingRecord[]> {
  const { randomDelay } = await import("./utils");
  await randomDelay();
  return OUTSTANDING_RECORDS;
}
