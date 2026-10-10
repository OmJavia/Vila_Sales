import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerOrderBooking } from "./customerOrderService";
import { useAbandonedCartStore } from "./abandonedCartStore";

export interface CartItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  availableStock: number;
}

interface ShopStore {
  cart: CartItem[];
  customerPhone: string;
  customerName: string;
  customerCity: string;
  cartUpdatedAt: string;
  currentBooking: CustomerOrderBooking | null;
  setCurrentBooking: (booking: CustomerOrderBooking | null) => void;
  setCustomerInfo: (info: { name?: string; phone?: string; city?: string }) => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  getCartItemQuantity: (itemId: string) => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
  syncToAbandonedCartStore: () => void;
  simulate7HourIdle: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      cart: [],
      customerPhone: "+91 98201 12345",
      customerName: "Ramesh Sharma",
      customerCity: "Mumbai (MIDC Andheri)",
      cartUpdatedAt: new Date().toISOString(),
      currentBooking: null,
      setCurrentBooking: (booking) => set({ currentBooking: booking }),

      setCustomerInfo: (info) => {
        set((state) => ({
          customerName: info.name !== undefined ? info.name : state.customerName,
          customerPhone: info.phone !== undefined ? info.phone : state.customerPhone,
          customerCity: info.city !== undefined ? info.city : state.customerCity,
        }));
        get().syncToAbandonedCartStore();
      },

      syncToAbandonedCartStore: () => {
        const { cart, customerName, customerPhone, customerCity, cartUpdatedAt } = get();
        if (cart.length > 0 && typeof window !== "undefined") {
          try {
            useAbandonedCartStore.getState().addOrUpdateCart({
              customerName: customerName || "Guest Shopper",
              phone: customerPhone || "+91 98200 00000",
              city: customerCity || "Mumbai",
              items: cart,
              cartUpdatedAt,
            });
          } catch (e) {
            // safely ignore
          }
        }
      },

      addToCart: (item) => {
        const now = new Date().toISOString();
        set((state) => {
          const existing = state.cart.find((c) => c.itemId === item.itemId);
          let newCart: CartItem[];
          if (existing) {
            newCart = state.cart.map((c) =>
              c.itemId === item.itemId
                ? { ...c, quantity: Math.min(c.quantity + 1, c.availableStock) }
                : c
            );
          } else {
            newCart = [...state.cart, { ...item, quantity: 1 }];
          }
          return {
            cart: newCart,
            cartUpdatedAt: now,
          };
        });
        get().syncToAbandonedCartStore();
      },

      removeFromCart: (itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          cart: state.cart.filter((c) => c.itemId !== itemId),
          cartUpdatedAt: now,
        }));
        get().syncToAbandonedCartStore();
      },

      updateQuantity: (itemId, quantity) => {
        const now = new Date().toISOString();
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => c.itemId !== itemId)
              : state.cart.map((c) =>
                  c.itemId === itemId
                    ? { ...c, quantity: Math.min(quantity, c.availableStock) }
                    : c
                ),
          cartUpdatedAt: now,
        }));
        get().syncToAbandonedCartStore();
      },

      incrementQuantity: (itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          cart: state.cart.map((c) =>
            c.itemId === itemId
              ? { ...c, quantity: Math.min(c.quantity + 1, c.availableStock) }
              : c
          ),
          cartUpdatedAt: now,
        }));
        get().syncToAbandonedCartStore();
      },

      decrementQuantity: (itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          cart: state.cart
            .map((c) => (c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c))
            .filter((c) => c.quantity > 0),
          cartUpdatedAt: now,
        }));
        get().syncToAbandonedCartStore();
      },

      getCartItemQuantity: (itemId) => {
        const item = get().cart.find((c) => c.itemId === itemId);
        return item ? item.quantity : 0;
      },

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getCartItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      clearCart: () => set({ cart: [] }),

      simulate7HourIdle: () => {
        const { cart, customerName, customerPhone } = get();
        // Set timestamp 7.5 hours ago
        const past = new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString();
        set({ cartUpdatedAt: past });
        // Trigger simulation in abandonedCartStore
        useAbandonedCartStore.getState().simulate7HourAbandonment({
          customerName: customerName || "Anand Transport Fleet",
          phone: customerPhone || "+91 98205 77665",
          items: cart.length > 0 ? cart : undefined,
        });
      },
    }),
    {
      name: "tradeflow-shop-cart",
    }
  )
);
