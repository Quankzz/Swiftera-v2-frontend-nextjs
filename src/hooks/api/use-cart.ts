/**
 * Cart hooks — TanStack Query
 * Module 10: CART (API-061 → API-065)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { cartKeys } from './cart.keys';
import {
  getCart,
  addCartLine,
  updateCartLine,
  removeCartLine,
  clearCart,
} from './cart.service';
import type { AddCartLineInput, CartResponse } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';

/**
 * Lấy giỏ hàng hiện tại [AUTH]
 */
export function useCartQuery() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Thêm dòng vào giỏ hàng [AUTH]
 *
 * Sau khi thêm thành công → invalidate cart query → re-fetch từ backend.
 * Nếu user chưa login → redirect sang trang login.
 */
export function useAddToCart(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (input: AddCartLineInput) => {
      if (!isAuthenticated) {
        router.push('/login?redirect=/cart');
        throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      }
      return addCartLine(input);
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.cart(),
      );

      queryClient.setQueryData<CartResponse>(cartKeys.cart(), (old) => {
        if (!old) return old;
        return {
          ...old,
          cartLines: [
            ...old.cartLines,
            {
              cartLineId: `optimistic-${Date.now()}`,
              productId: input.productId,
              productColorId: input.productColorId ?? null,
              colorName: null,
              colorCode: null,
              productName: '',
              productImageUrl: null,
              dailyPrice: 0,
              rentalDurationDays: input.rentalDurationDays,
              quantity: input.quantity ?? 1,
              lineTotal: 0,
              availableVouchers: [],
            },
          ],
        };
      });

      return { previousCart };
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
      options?.onError?.(error);
    },
  });
}

/**
 * Cập nhật số lượng / thời gian thuê của một dòng giỏ [AUTH]
 */
export function useUpdateCartLine(
  cartLineId: string,
  options?: { onSuccess?: () => void; onError?: (error: Error) => void },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      rentalDurationDays?: number;
      quantity?: number;
    }) => updateCartLine(cartLineId, input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Xóa một dòng khỏi giỏ hàng [AUTH]
 */
export function useRemoveCartLine(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartLineId: string) => removeCartLine(cartLineId),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Xóa toàn bộ giỏ hàng [AUTH]
 */
export function useClearCart(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => clearCart(),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Cập nhật số lượng và/hoặc thời gian thuê của một dòng giỏ [AUTH]
 * Dùng cho cart page — gọi mutation trực tiếp với cartLineId động.
 */
export function useUpdateCartLineQuantity(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartLineId,
      quantity,
      rentalDurationDays,
    }: {
      cartLineId: string;
      quantity?: number;
      rentalDurationDays?: number;
    }) => updateCartLine(cartLineId, { quantity, rentalDurationDays }),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
