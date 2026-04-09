/**
 * Review query keys — dùng chung cho TanStack Query
 */

export const reviewKeys = {
  all: ['reviews'] as const,

  byProduct: (productId: string, params?: { page?: number; size?: number }) =>
    [...reviewKeys.all, 'product', productId, params ?? {}] as const,

  list: (params?: {
    page?: number;
    size?: number;
    filter?: string;
    sort?: string;
  }) => [...reviewKeys.all, 'list', params ?? {}] as const,

  detail: (reviewId: string) =>
    [...reviewKeys.all, 'detail', reviewId] as const,
};
