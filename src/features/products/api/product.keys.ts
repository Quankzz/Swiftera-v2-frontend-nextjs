import type { ProductAvailabilityParams, ProductListParams } from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
  availabilities: () => [...productKeys.all, 'availability'] as const,
  availability: (productId: string | undefined, params?: ProductAvailabilityParams) =>
    [...productKeys.availabilities(), productId ?? '', params ?? {}] as const,
  /** Gợi ý trên trang chi tiết - tách cache theo sản phẩm và category hiện tại */
  related: (excludeProductId: string, categoryId?: string | null) =>
    [...productKeys.all, 'related', excludeProductId, categoryId ?? ''] as const,
};
