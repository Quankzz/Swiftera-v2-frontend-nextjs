/**
 * Voucher query key factory - TanStack Query
 * Module 11: VOUCHERS
 */

export const voucherKeys = {
  /** Root key cho toàn bộ voucher queries */
  all: ['vouchers'] as const,

  /** Key cho danh sách (có thể kèm params) */
  lists: () => [...voucherKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...voucherKeys.lists(), params ?? {}] as const,

  /** Key cho chi tiết 1 voucher */
  details: () => [...voucherKeys.all, 'detail'] as const,
  detail: (voucherId: string) => [...voucherKeys.details(), voucherId] as const,
} as const;
