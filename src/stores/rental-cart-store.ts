"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  computeVoucherDiscount,
  type RentalVoucher,
} from "@/lib/rental-voucher";

export type RentalCartLine = {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  sku: string;
  variantId?: string;
  variantLabel?: string;
  durationId: string;
  durationLabel: string;
  rentalPricePerUnit: number;
  quantity: number;
  depositPerUnit: number;
  voucher: RentalVoucher | null;
};

export type RentalCartLineInput = Omit<RentalCartLine, "lineId"> & {
  lineId?: string;
};

function lineMergeKey(
  line: Pick<
    RentalCartLine,
    "productId" | "variantId" | "durationId" | "voucher"
  >,
) {
  const vid = line.voucher?.id ?? "";
  return `${line.productId}|${line.variantId ?? ""}|${line.durationId}|${vid}`;
}

function rentalSubtotal(line: RentalCartLine) {
  return line.rentalPricePerUnit * line.quantity;
}

export function lineRentalAfterVoucher(line: RentalCartLine) {
  const sub = rentalSubtotal(line);
  if (!line.voucher) return sub;
  const d = computeVoucherDiscount(sub, line.voucher);
  return sub - d;
}

export function lineDepositTotal(line: RentalCartLine) {
  return line.depositPerUnit * line.quantity;
}

export function lineGrandTotal(line: RentalCartLine) {
  return lineRentalAfterVoucher(line) + lineDepositTotal(line);
}

type RentalCartState = {
  lines: RentalCartLine[];
  addLine: (input: RentalCartLineInput) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  updateLineVoucher: (lineId: string, voucher: RentalVoucher | null) => void;
  clearCart: () => void;
  /** Tổng số lượng thiết bị (cộng quantity từng dòng) */
  getTotalQuantity: () => number;
  getTotals: () => {
    rentalSubtotal: number;
    voucherDiscount: number;
    rentalAfterVoucher: number;
    depositTotal: number;
    grandTotal: number;
  };
};

function stripInvalidVoucher(line: RentalCartLine): RentalCartLine {
  if (!line.voucher) return line;
  const sub = rentalSubtotal(line);
  if (computeVoucherDiscount(sub, line.voucher) <= 0) {
    return { ...line, voucher: null };
  }
  return line;
}

export const useRentalCartStore = create<RentalCartState>()(
  persist(
    (set, get) => ({
      lines: [],

      addLine: (input) => {
        const lineId =
          input.lineId ??
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

        const newLine: RentalCartLine = stripInvalidVoucher({
          lineId,
          productId: input.productId,
          name: input.name,
          image: input.image,
          sku: input.sku,
          variantId: input.variantId,
          variantLabel: input.variantLabel,
          durationId: input.durationId,
          durationLabel: input.durationLabel,
          rentalPricePerUnit: input.rentalPricePerUnit,
          quantity: input.quantity,
          depositPerUnit: input.depositPerUnit,
          voucher: input.voucher,
        });

        set((state) => {
          const key = lineMergeKey(newLine);
          const idx = state.lines.findIndex((l) => lineMergeKey(l) === key);
          if (idx === -1) {
            return { lines: [...state.lines, newLine] };
          }
          const next = [...state.lines];
          const merged = stripInvalidVoucher({
            ...next[idx],
            quantity: next[idx].quantity + newLine.quantity,
            rentalPricePerUnit: newLine.rentalPricePerUnit,
            depositPerUnit: newLine.depositPerUnit,
            voucher: newLine.voucher ?? next[idx].voucher,
          });
          next[idx] = merged;
          return { lines: next };
        });
      },

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      updateQuantity: (lineId, quantity) => {
        const q = Math.max(1, Math.floor(quantity) || 1);
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId
              ? stripInvalidVoucher({ ...l, quantity: q })
              : l,
          ),
        }));
      },

      updateLineVoucher: (lineId, voucher) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId ? stripInvalidVoucher({ ...l, voucher }) : l,
          ),
        })),

      clearCart: () => set({ lines: [] }),

      getTotalQuantity: () =>
        get().lines.reduce((acc, l) => acc + l.quantity, 0),

      getTotals: () => computeCartTotals(get().lines),
    }),
    {
      name: "swiftera-rental-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/** Tổng tiền thuê của một dòng (trước voucher) */
export function rentalSubtotalLine(line: RentalCartLine) {
  return line.rentalPricePerUnit * line.quantity;
}

export function computeCartTotals(lines: RentalCartLine[]) {
  let rentalSubtotal = 0;
  let voucherDiscount = 0;
  let depositTotal = 0;
  for (const line of lines) {
    const sub = rentalSubtotalLine(line);
    rentalSubtotal += sub;
    if (line.voucher) {
      voucherDiscount += computeVoucherDiscount(sub, line.voucher);
    }
    depositTotal += lineDepositTotal(line);
  }
  const rentalAfterVoucher = rentalSubtotal - voucherDiscount;
  return {
    rentalSubtotal,
    voucherDiscount,
    rentalAfterVoucher,
    depositTotal,
    grandTotal: rentalAfterVoucher + depositTotal,
  };
}

/** Hook tiện dụng: số lượng trong giỏ (reactive) */
export function useRentalCartQuantity() {
  return useRentalCartStore((s) =>
    s.lines.reduce((acc, l) => acc + l.quantity, 0),
  );
}
