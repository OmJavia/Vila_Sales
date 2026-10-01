import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, StockLevel } from "./data";

interface OrderOverride {
  status: OrderStatus;
  cancelReason?: string;
}

export interface ShipmentReminder {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  minStock: number;
  suggestedOrderQty: number;
  unit: string;
  supplier: string;
  addedAt: string;
  notes?: string;
  urgency: "HIGH" | "URGENT" | "NORMAL";
}

interface TradeFlowStore {
  /** Map of orderId → override data */
  orderOverrides: Record<string, OrderOverride>;
  setOrderStatus: (orderId: string, status: OrderStatus, cancelReason?: string) => void;
  clearOrderOverride: (orderId: string) => void;
  getOrderOverride: (orderId: string) => OrderOverride | undefined;

  /** Reminders to order out-of-stock or critical items in the next shipment */
  shipmentReminders: Record<string, ShipmentReminder>;
  addShipmentReminder: (reminder: ShipmentReminder) => void;
  removeShipmentReminder: (itemId: string) => void;
  clearShipmentReminders: () => void;
  isItemInShipment: (itemId: string) => boolean;

  /** Item stock overrides (to simulate depleting or restocking items) */
  itemStockOverrides: Record<string, number>;
  setItemStock: (itemId: string, stock: number) => void;
  resetItemStock: (itemId: string) => void;
}

export const useTradeFlowStore = create<TradeFlowStore>()(
  persist(
    (set, get) => ({
      orderOverrides: {},
      shipmentReminders: {},
      itemStockOverrides: {},

      setOrderStatus: (orderId, status, cancelReason) =>
        set((state) => ({
          orderOverrides: {
            ...state.orderOverrides,
            [orderId]: { status, cancelReason },
          },
        })),

      clearOrderOverride: (orderId) =>
        set((state) => {
          const next = { ...state.orderOverrides };
          delete next[orderId];
          return { orderOverrides: next };
        }),

      getOrderOverride: (orderId) => get().orderOverrides[orderId],

      addShipmentReminder: (reminder) =>
        set((state) => ({
          shipmentReminders: {
            ...state.shipmentReminders,
            [reminder.itemId]: reminder,
          },
        })),

      removeShipmentReminder: (itemId) =>
        set((state) => {
          const next = { ...state.shipmentReminders };
          delete next[itemId];
          return { shipmentReminders: next };
        }),

      clearShipmentReminders: () =>
        set(() => ({
          shipmentReminders: {},
        })),

      isItemInShipment: (itemId) => {
        return Boolean(get().shipmentReminders[itemId]);
      },

      setItemStock: (itemId, stock) =>
        set((state) => ({
          itemStockOverrides: {
            ...state.itemStockOverrides,
            [itemId]: stock,
          },
        })),

      resetItemStock: (itemId) =>
        set((state) => {
          const next = { ...state.itemStockOverrides };
          delete next[itemId];
          return { itemStockOverrides: next };
        }),
    }),
    {
      name: "tradeflow-app-store",
      partialize: (state) => ({
        orderOverrides: state.orderOverrides,
        shipmentReminders: state.shipmentReminders,
        itemStockOverrides: state.itemStockOverrides,
      }),
    }
  )
);

