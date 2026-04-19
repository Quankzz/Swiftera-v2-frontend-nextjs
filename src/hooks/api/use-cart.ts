/**
 * Cart hooks - TanStack Query
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
import type { AddCartLineInput, CartLineResponse, CartResponse } from '@/api/cart';
import { useAuth } from '@/context/AuthContext';
import { buildLoginHref, getCurrentPathWithSearch } from '@/lib/auth-redirect';

function requireAuthForMutation(params: {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  router: { push: (href: string) => void };
  errorMessage: string;
  fallbackPath: string;
}): void {
  if (params.isAuthenticated) return;

  if (!params.isAuthLoading) {
    params.router.push(
      buildLoginHref(getCurrentPathWithSearch(params.fallbackPath)),
    );
  }

  throw new Error(
    params.isAuthLoading
      ? 'Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.'
      : params.errorMessage,
  );
}

function patchLineTotals(
  line: CartLineResponse,
  quantity: number,
  rentalDurationDays: number,
): CartLineResponse {
  const lineTotal = Math.max(line.dailyPrice, 0) * quantity * rentalDurationDays;
  const depositHoldAmount =
    line.depositAmount != null ? line.depositAmount * quantity : line.depositHoldAmount;

  return {
    ...line,
    quantity,
    rentalDurationDays,
    lineTotal,
    depositHoldAmount,
  };
}

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
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async (input: AddCartLineInput) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để thêm vào giỏ hàng.',
      });

      return addCartLine(input);
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.cart(),
      );

      queryClient.setQueryData<CartResponse>(cartKeys.cart(), (old) => {
        if (!old) return old;

        const quantity = Math.max(1, input.quantity ?? 1);
        const existingIndex = old.cartLines.findIndex(
          (line) =>
            line.productId === input.productId &&
            line.productColorId === (input.productColorId ?? null) &&
            line.rentalDurationDays === input.rentalDurationDays,
        );

        if (existingIndex >= 0) {
          const lines = [...old.cartLines];
          const existing = lines[existingIndex];
          lines[existingIndex] = patchLineTotals(
            existing,
            existing.quantity + quantity,
            existing.rentalDurationDays,
          );

          return {
            ...old,
            cartLines: lines,
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...old,
          cartLines: [
            ...old.cartLines,
            {
              cartLineId: `optimistic-${Date.now()}-${Math.random()}`,
              productId: input.productId,
              productColorId: input.productColorId ?? null,
              colorName: null,
              colorCode: null,
              productName: 'Đang thêm sản phẩm...',
              productImageUrl: null,
              dailyPrice: 0,
              rentalDurationDays: input.rentalDurationDays,
              quantity,
              lineTotal: 0,
              availableVouchers: [],
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousCart };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      rentalDurationDays?: number;
      quantity?: number;
    }) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để cập nhật giỏ hàng.',
      });

      return updateCartLine(cartLineId, input);
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
          cartLines: old.cartLines.map((line) => {
            if (line.cartLineId !== cartLineId) return line;

            const nextQuantity = Math.max(1, input.quantity ?? line.quantity);
            const nextDuration = Math.max(
              1,
              input.rentalDurationDays ?? line.rentalDurationDays,
            );
            return patchLineTotals(line, nextQuantity, nextDuration);
          }),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousCart };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
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
 * Xóa một dòng khỏi giỏ hàng [AUTH]
 */
export function useRemoveCartLine(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async (cartLineId: string) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để chỉnh sửa giỏ hàng.',
      });

      return removeCartLine(cartLineId);
    },

    onMutate: async (cartLineId) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.cart(),
      );

      queryClient.setQueryData<CartResponse>(cartKeys.cart(), (old) => {
        if (!old) return old;

        return {
          ...old,
          cartLines: old.cartLines.filter(
            (line) => line.cartLineId !== cartLineId,
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousCart };
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error: Error, _cartLineId, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async () => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để chỉnh sửa giỏ hàng.',
      });

      return clearCart();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.cart(),
      );

      queryClient.setQueryData<CartResponse>(cartKeys.cart(), (old) => {
        if (!old) return old;
        return {
          ...old,
          cartLines: [],
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousCart };
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
}

/**
 * Cập nhật số lượng và/hoặc thời gian thuê của một dòng giỏ [AUTH]
 * Dùng cho cart page - gọi mutation trực tiếp với cartLineId động.
 */
export function useUpdateCartLineQuantity(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async ({
      cartLineId,
      quantity,
      rentalDurationDays,
    }: {
      cartLineId: string;
      quantity?: number;
      rentalDurationDays?: number;
    }) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để cập nhật giỏ hàng.',
      });

      return updateCartLine(cartLineId, { quantity, rentalDurationDays });
    },

    onMutate: async ({ cartLineId, quantity, rentalDurationDays }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });
      const previousCart = queryClient.getQueryData<CartResponse>(
        cartKeys.cart(),
      );

      queryClient.setQueryData<CartResponse>(cartKeys.cart(), (old) => {
        if (!old) return old;

        return {
          ...old,
          cartLines: old.cartLines.map((line) => {
            if (line.cartLineId !== cartLineId) return line;

            const nextQuantity = Math.max(1, quantity ?? line.quantity);
            const nextDuration = Math.max(
              1,
              rentalDurationDays ?? line.rentalDurationDays,
            );
            return patchLineTotals(line, nextQuantity, nextDuration);
          }),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousCart };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
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
