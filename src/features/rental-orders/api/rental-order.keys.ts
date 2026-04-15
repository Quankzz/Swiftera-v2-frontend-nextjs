/**
 * Rental Orders query keys
 * Dùng với TanStack Query để invalidate đúng cache.
 */

import type { RentalOrderListParams } from '../types';

export const rentalOrderKeys = {
  all: ['rental-orders'] as const,
  lists: () => [...rentalOrderKeys.all, 'list'] as const,
  list: (params?: RentalOrderListParams) =>
    [...rentalOrderKeys.lists(), params ?? {}] as const,
  details: () => [...rentalOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...rentalOrderKeys.details(), id] as const,
  contracts: () => [...rentalOrderKeys.all, 'contract'] as const,
  contract: (rentalOrderId: string) =>
    [...rentalOrderKeys.contracts(), rentalOrderId] as const,
} as const;
