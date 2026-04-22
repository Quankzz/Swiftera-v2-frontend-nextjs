"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RentalCartLine } from "@/stores/rental-cart-store";
import { computeCartTotals } from "@/stores/rental-cart-store";

export type RentalOrderTotals = ReturnType<typeof computeCartTotals>;

export type RentalPaymentMethod = "bank_transfer" | "e_wallet";

export interface RentalOrder {
  id: string;
  orderCode: string;
  createdAt: string;
  lines: RentalCartLine[];
  totals: RentalOrderTotals;
  paymentMethod: RentalPaymentMethod;
  customerName: string;
  customerPhone: string;
}

function makeOrderCode() {
  const part = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `SWF-${part}${rand}`;
}

type RentalOrderState = {
  orders: RentalOrder[];
  addOrder: (input: {
    lines: RentalCartLine[];
    paymentMethod: RentalPaymentMethod;
    customerName: string;
    customerPhone: string;
  }) => string;
  getOrder: (id: string) => RentalOrder | undefined;
};

export const useRentalOrderStore = create<RentalOrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: ({ lines, paymentMethod, customerName, customerPhone }) => {
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `ord-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const snapshot = JSON.parse(JSON.stringify(lines)) as RentalCartLine[];
        const order: RentalOrder = {
          id,
          orderCode: makeOrderCode(),
          createdAt: new Date().toISOString(),
          lines: snapshot,
          totals: computeCartTotals(snapshot),
          paymentMethod,
          customerName,
          customerPhone,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return id;
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: "swiftera-rental-orders",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ orders: s.orders }),
    },
  ),
);
