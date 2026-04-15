import { create } from 'zustand';
import type { OrderStatus } from '@/types/dashboard.types';

interface StaffOrderCountsState {
  /** Count of orders per status — empty until the orders page loads data. */
  counts: Partial<Record<OrderStatus, number>>;
  /** Whether a load has ever completed (used to distinguish "loading" from "empty"). */
  isLoaded: boolean;

  /** Replace the entire counts map after a fresh data load. */
  setCounts: (counts: Partial<Record<OrderStatus, number>>) => void;
  /**
   * Optimistically adjust counts after a single order's status changes.
   * Decrements `from` and increments `to` without re-fetching the full list.
   */
  updateCount: (from: OrderStatus, to: OrderStatus) => void;
  /** Clear on logout / user switch. */
  clear: () => void;
}

export const useStaffOrderCounts = create<StaffOrderCountsState>((set) => ({
  counts: {},
  isLoaded: false,

  setCounts: (counts) => set({ counts, isLoaded: true }),

  updateCount: (from, to) =>
    set((state) => {
      const prev = state.counts;
      const fromVal = (prev[from] ?? 0) - 1;
      const toVal = (prev[to] ?? 0) + 1;
      return {
        counts: {
          ...prev,
          ...(fromVal > 0 ? { [from]: fromVal } : { [from]: 0 }),
          [to]: toVal,
        },
      };
    }),

  clear: () => set({ counts: {}, isLoaded: false }),
}));

// ─── Derived selectors ────────────────────────────────────────────────────────

/** Returns the count for a single status, defaulting to 0. */
export function selectCount(
  counts: Partial<Record<OrderStatus, number>>,
  status: OrderStatus,
): number {
  return counts[status] ?? 0;
}

/** Sum of PAID + PENDING_PICKUP — actions that require immediate staff attention. */
export function selectUrgentTotal(
  counts: Partial<Record<OrderStatus, number>>,
): number {
  return (counts['PAID'] ?? 0) + (counts['PENDING_PICKUP'] ?? 0);
}

/** Total of all assigned orders across every status. */
export function selectTotalOrders(
  counts: Partial<Record<OrderStatus, number>>,
): number {
  return (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
}
