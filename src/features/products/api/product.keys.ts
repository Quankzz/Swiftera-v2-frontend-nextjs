import type { ProductListParams } from '../types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
  /** Gợi ý trên trang chi tiết — queryKey theo sản phẩm đang xem (loại trừ ở client) */
  related: (excludeProductId: string) =>
    [...productKeys.all, 'related', excludeProductId] as const,
};
