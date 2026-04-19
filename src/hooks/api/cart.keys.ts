/**
 * Cart API keys - dùng chung cho TanStack Query
 */

export const cartKeys = {
  all: ['cart'] as const,
  cart: (deliveryDate?: string) =>
    deliveryDate
      ? [...cartKeys.all, 'detail', { deliveryDate }] as const
      : [...cartKeys.all, 'detail'] as const,
};
