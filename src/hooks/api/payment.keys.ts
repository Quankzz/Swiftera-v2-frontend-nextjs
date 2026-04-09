/**
 * Payment query keys — TanStack Query key factory
 */

export const paymentKeys = {
  all: ['payments'] as const,

  /** Danh sách giao dịch */
  list: (params?: {
    page?: number;
    size?: number;
    filter?: string;
    sort?: string;
  }) =>
    params
      ? (['payments', 'list', params] as const)
      : (['payments', 'list'] as const),

  /** Chi tiết 1 giao dịch */
  detail: (paymentTransactionId: string) =>
    ['payments', 'detail', paymentTransactionId] as const,

  /** Danh sách giao dịch theo đơn thuê */
  byOrder: (
    rentalOrderId: string,
    params?: { page?: number; size?: number },
  ) =>
    params
      ? (['payments', 'byOrder', rentalOrderId, params] as const)
      : (['payments', 'byOrder', rentalOrderId] as const),
} as const;
