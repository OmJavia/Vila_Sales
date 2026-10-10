import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./shopStore";
import { useNotificationStore } from "./notificationStore";

export type CartStatus = "PENDING_CALL" | "CALLED" | "RECOVERED" | "DISMISSED";

export interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  cartUpdatedAt: string; // ISO string
  idleHours: number;
  status: CartStatus;
  callAttempts: number;
  lastCalledAt?: string;
  notes?: string;
  notifiedManager: boolean;
}

interface AbandonedCartStore {
  abandonedCarts: AbandonedCart[];
  addOrUpdateCart: (params: {
    customerName: string;
    phone: string;
    email?: string;
    city?: string;
    items: CartItem[];
    cartUpdatedAt?: string;
    idleHours?: number;
  }) => AbandonedCart;
  markAsCalled: (id: string, notes?: string) => void;
  markAsRecovered: (id: string) => void;
  dismissCart: (id: string) => void;
  simulate7HourAbandonment: (params?: { customerName?: string; phone?: string; items?: CartItem[] }) => AbandonedCart;
  checkAndTriggerIdleAlerts: () => number;
  clearAll: () => void;
}

// 3 realistic initial abandoned carts (seeded as having been idle for >7 hours)
const SEEDED_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: "ac-seed-01",
    customerName: "Rajesh Patel",
    phone: "+91 98204 88123",
    email: "rajesh@patelenterprises.in",
    city: "Mumbai (MIDC Andheri)",
    items: [
      {
        itemId: "ITM001",
        itemName: "Premium Bonding Gum 1.2mm",
        itemCode: "BG-12-PR",
        brand: "Vila Bond",
        category: "Bonding Gum",
        unit: "Roll (25kg)",
        price: 4500,
        quantity: 3,
        availableStock: 48,
      },
      {
        itemId: "ITM003",
        itemName: "Super Vulcanizing Solution 5L",
        itemCode: "VS-05-IND",
        brand: "Vila Chem",
        category: "Vulcanizing Solution",
        unit: "Can (5L)",
        price: 1850,
        quantity: 2,
        availableStock: 30,
      },
    ],
    totalAmount: 17200,
    itemCount: 5,
    cartUpdatedAt: new Date(Date.now() - 8.5 * 60 * 60 * 1000).toISOString(),
    idleHours: 8.5,
    status: "PENDING_CALL",
    callAttempts: 0,
    notifiedManager: true,
  },
  {
    id: "ac-seed-02",
    customerName: "Karan Logistics & Retreading",
    phone: "+91 98191 22938",
    email: "procurement@karanlogistics.com",
    city: "Bhiwandi Hub",
    items: [
      {
        itemId: "ITM005",
        itemName: "Precured Tread Radial 295/80",
        itemCode: "TR-295-RAD",
        brand: "Vila Grip",
        category: "Precured Treads",
        unit: "Piece",
        price: 6800,
        quantity: 4,
        availableStock: 25,
      },
      {
        itemId: "ITM008",
        itemName: "High Heat Curing Envelope 10.00-20",
        itemCode: "CE-1000-HD",
        brand: "Vila Cure",
        category: "Curing Envelopes",
        unit: "Piece",
        price: 3200,
        quantity: 2,
        availableStock: 18,
      },
    ],
    totalAmount: 33600,
    itemCount: 6,
    cartUpdatedAt: new Date(Date.now() - 11.2 * 60 * 60 * 1000).toISOString(),
    idleHours: 11.2,
    status: "PENDING_CALL",
    callAttempts: 0,
    notifiedManager: true,
  },
  {
    id: "ac-seed-03",
    customerName: "Sunil Sharma (Highway Retreads)",
    phone: "+91 97022 55431",
    email: "sunil.retreads@gmail.com",
    city: "Thane West",
    items: [
      {
        itemId: "ITM002",
        itemName: "Heavy Duty Cushion Gum 0.8mm",
        itemCode: "CG-08-HD",
        brand: "Vila Flex",
        category: "Cushion Gum",
        unit: "Roll (20kg)",
        price: 3900,
        quantity: 2,
        availableStock: 40,
      },
      {
        itemId: "ITM011",
        itemName: "High Tensile Hex Bolt M16x80",
        itemCode: "HB-M16-80",
        brand: "Vila Fasteners",
        category: "Hex Bolts",
        unit: "Box (50pcs)",
        price: 1100,
        quantity: 3,
        availableStock: 85,
      },
    ],
    totalAmount: 11100,
    itemCount: 5,
    cartUpdatedAt: new Date(Date.now() - 7.3 * 60 * 60 * 1000).toISOString(),
    idleHours: 7.3,
    status: "PENDING_CALL",
    callAttempts: 0,
    notifiedManager: true,
  },
];

export const useAbandonedCartStore = create<AbandonedCartStore>()(
  persist(
    (set, get) => ({
      abandonedCarts: SEEDED_ABANDONED_CARTS,

      addOrUpdateCart: ({
        customerName,
        phone,
        email,
        city = "Mumbai",
        items,
        cartUpdatedAt,
        idleHours,
      }) => {
        const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
        const updatedAt = cartUpdatedAt || new Date().toISOString();
        const calculatedIdleHours =
          idleHours !== undefined
            ? idleHours
            : (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);

        const existing = get().abandonedCarts.find(
          (c) => c.phone === phone || (c.customerName === customerName && phone)
        );

        let savedCart: AbandonedCart;

        if (existing) {
          savedCart = {
            ...existing,
            customerName: customerName || existing.customerName,
            phone: phone || existing.phone,
            email: email || existing.email,
            city: city || existing.city,
            items,
            totalAmount,
            itemCount,
            cartUpdatedAt: updatedAt,
            idleHours: calculatedIdleHours,
          };
          set((state) => ({
            abandonedCarts: state.abandonedCarts.map((c) =>
              c.id === existing.id ? savedCart : c
            ),
          }));
        } else {
          savedCart = {
            id: "ac-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            customerName: customerName || "Customer (" + (phone || "Guest") + ")",
            phone: phone || "+91 98200 00000",
            email,
            city,
            items,
            totalAmount,
            itemCount,
            cartUpdatedAt: updatedAt,
            idleHours: calculatedIdleHours,
            status: "PENDING_CALL",
            callAttempts: 0,
            notifiedManager: false,
          };
          set((state) => ({
            abandonedCarts: [savedCart, ...state.abandonedCarts],
          }));
        }

        // If >= 7 hours, trigger alert
        if (savedCart.idleHours >= 7 && !savedCart.notifiedManager) {
          try {
            useNotificationStore.getState().addNotification({
              type: "ABANDONED_CART",
              title: "🚨 Abandoned Cart Alert (>7 Hours Idle)",
              message: `${savedCart.customerName} (${savedCart.phone}) has ${savedCart.itemCount} items worth ₹${savedCart.totalAmount.toLocaleString("en-IN")} in cart for ${savedCart.idleHours.toFixed(1)} hrs. Call customer to close order!`,
              severity: "CRITICAL",
              entityId: savedCart.id,
              entityType: "ORDER",
              href: `/customers/abandoned-carts`,
            });
            // Mark notified
            set((state) => ({
              abandonedCarts: state.abandonedCarts.map((c) =>
                c.id === savedCart.id ? { ...c, notifiedManager: true } : c
              ),
            }));
          } catch (e) {
            console.error("Failed to add abandoned cart notification", e);
          }
        }

        return savedCart;
      },

      markAsCalled: (id, notes) => {
        const now = new Date().toISOString();
        set((state) => ({
          abandonedCarts: state.abandonedCarts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "CALLED",
                  callAttempts: c.callAttempts + 1,
                  lastCalledAt: now,
                  notes: notes ? (c.notes ? `${c.notes} | ${notes}` : notes) : c.notes,
                }
              : c
          ),
        }));
      },

      markAsRecovered: (id) => {
        set((state) => ({
          abandonedCarts: state.abandonedCarts.map((c) =>
            c.id === id ? { ...c, status: "RECOVERED" } : c
          ),
        }));
      },

      dismissCart: (id) => {
        set((state) => ({
          abandonedCarts: state.abandonedCarts.filter((c) => c.id !== id),
        }));
      },

      simulate7HourAbandonment: (params) => {
        const dummyItems: CartItem[] = params?.items && params.items.length > 0 ? params.items : [
          {
            itemId: "ITM001",
            itemName: "Premium Bonding Gum 1.2mm",
            itemCode: "BG-12-PR",
            brand: "Vila Bond",
            category: "Bonding Gum",
            unit: "Roll (25kg)",
            price: 4500,
            quantity: 2,
            availableStock: 48,
          },
          {
            itemId: "ITM004",
            itemName: "Chemical Vulcanizing Cement 1L",
            itemCode: "VC-01-IND",
            brand: "Vila Chem",
            category: "Vulcanizing Solution",
            unit: "Can (1L)",
            price: 850,
            quantity: 3,
            availableStock: 60,
          },
        ];

        const totalAmount = dummyItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const itemCount = dummyItems.reduce((sum, i) => sum + i.quantity, 0);
        const simulatedIdleHours = 7.5; // Exactly 7.5 hours idle
        const pastTimestamp = new Date(Date.now() - simulatedIdleHours * 60 * 60 * 1000).toISOString();

        const customerName = params?.customerName || "Vikram Enterprises";
        const phone = params?.phone || "+91 98211 44556";

        const newCart: AbandonedCart = {
          id: "ac-sim-" + Date.now(),
          customerName,
          phone,
          city: "Navi Mumbai (TTC Industrial)",
          items: dummyItems,
          totalAmount,
          itemCount,
          cartUpdatedAt: pastTimestamp,
          idleHours: simulatedIdleHours,
          status: "PENDING_CALL",
          callAttempts: 0,
          notifiedManager: true,
        };

        set((state) => ({
          abandonedCarts: [newCart, ...state.abandonedCarts],
        }));

        // Dispatch manager notification
        try {
          useNotificationStore.getState().addNotification({
            type: "ABANDONED_CART",
            title: "🚨 Abandoned Cart Alert (>7 Hours Idle)",
            message: `${newCart.customerName} (${newCart.phone}) has ${newCart.itemCount} items worth ₹${newCart.totalAmount.toLocaleString("en-IN")} idle in cart for ${simulatedIdleHours} hrs. Call manager attention required!`,
            severity: "CRITICAL",
            entityId: newCart.id,
            entityType: "ORDER",
            href: `/customers/abandoned-carts`,
          });
        } catch (e) {
          console.error("Failed to notify manager", e);
        }

        return newCart;
      },

      checkAndTriggerIdleAlerts: () => {
        let triggeredCount = 0;
        const now = Date.now();
        const carts = get().abandonedCarts;

        const updated = carts.map((cart) => {
          const diffMs = now - new Date(cart.cartUpdatedAt).getTime();
          const hours = diffMs / (1000 * 60 * 60);

          if (hours >= 7 && !cart.notifiedManager && cart.status === "PENDING_CALL") {
            triggeredCount++;
            useNotificationStore.getState().addNotification({
              type: "ABANDONED_CART",
              title: "🚨 Abandoned Cart Alert (>7 Hours Idle)",
              message: `${cart.customerName} (${cart.phone}) has ${cart.itemCount} items worth ₹${cart.totalAmount.toLocaleString("en-IN")} idle in cart for ${hours.toFixed(1)} hrs. Call customer to close order!`,
              severity: "CRITICAL",
              entityId: cart.id,
              entityType: "ORDER",
              href: `/customers/abandoned-carts`,
            });
            return { ...cart, idleHours: hours, notifiedManager: true };
          }
          return { ...cart, idleHours: hours };
        });

        set({ abandonedCarts: updated });
        return triggeredCount;
      },

      clearAll: () => set({ abandonedCarts: [] }),
    }),
    {
      name: "vilasales-abandoned-carts",
    }
  )
);
