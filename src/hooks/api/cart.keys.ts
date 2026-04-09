/**
 * Cart API keys — dùng chung cho TanStack Query
 */

export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'detail'] as const,
};
