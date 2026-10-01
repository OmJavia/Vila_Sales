import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  incrementQuantity: (itemId: string) => void;
  decrementQuantity: (itemId: string) => void;
  getCartItemQuantity: (itemId: string) => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearCart: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.itemId === item.itemId);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.itemId === item.itemId
                  ? { ...c, quantity: Math.min(c.quantity + 1, c.availableStock) }
                  : c
              ),
            };
          }
          return {
            cart: [...state.cart, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.itemId !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => c.itemId !== itemId)
              : state.cart.map((c) =>
                  c.itemId === itemId
                    ? { ...c, quantity: Math.min(quantity, c.availableStock) }
                    : c
                ),
        })),

      incrementQuantity: (itemId) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.itemId === itemId
              ? { ...c, quantity: Math.min(c.quantity + 1, c.availableStock) }
              : c
          ),
        })),

      decrementQuantity: (itemId) =>
        set((state) => ({
          cart:
            state.cart
              .map((c) =>
                c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c
              )
              .filter((c) => c.quantity > 0),
        })),

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
    }),
    {
      name: "tradeflow-shop-cart",
    }
  )
);
