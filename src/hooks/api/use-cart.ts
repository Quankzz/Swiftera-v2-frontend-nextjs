/**
 * Cart hooks - TanStack Query
 * Module 10: CART (API-061 → API-065)
 */

import { useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
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

export const CART_CACHE_KEY = 'swiftera:cart:cache:v1';
const CART_CACHE_TTL_MS = 5 * 60 * 1000;

type PersistedCartPayload = {
  cachedAt: number;
  cart: CartResponse;
};

function readPersistedCartPayload(): PersistedCartPayload | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = window.localStorage.getItem(CART_CACHE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as PersistedCartPayload;
    if (!parsed?.cachedAt || !parsed?.cart) {
      window.localStorage.removeItem(CART_CACHE_KEY);
      return undefined;
    }

    if (Date.now() - parsed.cachedAt > CART_CACHE_TTL_MS) {
      window.localStorage.removeItem(CART_CACHE_KEY);
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

function readPersistedCart(): CartResponse | undefined {
  return readPersistedCartPayload()?.cart;
}

function readPersistedCartUpdatedAt(): number | undefined {
  return readPersistedCartPayload()?.cachedAt;
}

function persistCart(cart: CartResponse | undefined): void {
  if (typeof window === 'undefined') return;

  if (!cart) {
    window.localStorage.removeItem(CART_CACHE_KEY);
    return;
  }

  const payload: PersistedCartPayload = {
    cachedAt: Date.now(),
    cart,
  };
  window.localStorage.setItem(CART_CACHE_KEY, JSON.stringify(payload));
}

function clearPersistedCart(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CART_CACHE_KEY);
}

function getCachedCartFromQueryClient(queryClient: QueryClient): CartResponse | undefined {
  const cachedEntries = queryClient.getQueriesData<CartResponse>({
    queryKey: cartKeys.all,
  });
  for (const [, data] of cachedEntries) {
    if (data) return data;
  }
  return undefined;
}

function setCachedCartForAllKeys(
  queryClient: QueryClient,
  nextCart: CartResponse | undefined,
): void {
  queryClient.setQueriesData<CartResponse>({ queryKey: cartKeys.all }, nextCart);
}

function normalizeColorId(value: string | null | undefined): string | null {
  return value ?? null;
}

function hasMatchingCartLine(cart: CartResponse, input: AddCartLineInput): boolean {
  return cart.cartLines.some((line) => {
    return (
      line.productId === input.productId &&
      normalizeColorId(line.productColorId) ===
        normalizeColorId(input.productColorId) &&
      line.rentalDurationDays === input.rentalDurationDays
    );
  });
}

function applyOptimisticAdd(
  old: CartResponse | undefined,
  input: AddCartLineInput,
): CartResponse {
  const now = new Date().toISOString();
  const quantity = Math.max(1, input.quantity ?? 1);

  const base: CartResponse = old ?? {
    cartId: 'optimistic-cart',
    userId: 'optimistic-user',
    cartLines: [],
    createdAt: now,
    updatedAt: now,
  };

  const existingIndex = base.cartLines.findIndex(
    (line) =>
      line.productId === input.productId &&
      normalizeColorId(line.productColorId) ===
        normalizeColorId(input.productColorId) &&
      line.rentalDurationDays === input.rentalDurationDays,
  );

  if (existingIndex >= 0) {
    const lines = [...base.cartLines];
    const existing = lines[existingIndex];
    lines[existingIndex] = patchLineTotals(
      existing,
      existing.quantity + quantity,
      existing.rentalDurationDays,
    );
    return {
      ...base,
      cartLines: lines,
      updatedAt: now,
    };
  }

  return {
    ...base,
    cartLines: [
      ...base.cartLines,
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
        rentalFeeAmount: 0,
        depositHoldAmount: 0,
        totalPayableAmount: 0,
        availableVouchers: [],
      },
    ],
    updatedAt: now,
  };
}

/**
 * Lấy ngày giao hàng mặc định: ngày mai, format YYYY-MM-DD.
 * Dùng làm deliveryDate mặc định cho cart query để stock count chính xác.
 */
function getDefaultDeliveryDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

/**
 * Lấy giỏ hàng hiện tại [AUTH]
 *
 * @param deliveryDate - optional YYYY-MM-DD. Khi được cung cấp, backend trả về
 * available stock chính xác hơn (loại trừ booking conflict theo ngày).
 * Mặc định là ngày mai (cùng logic với handleCreateOrder) để FE luôn hiển thị
 * stock chính xác nhất, tránh tình trạng "FE báo còn hàng nhưng BE tạo đơn thất bại".
 */
export function useCartQuery(options?: { deliveryDate?: string }) {
  const { isAuthenticated } = useAuth();
  const effectiveDeliveryDate = options?.deliveryDate ?? getDefaultDeliveryDate();

  const query = useQuery({
    queryKey: cartKeys.cart(effectiveDeliveryDate),
    queryFn: async () => {
      const cart = await getCart(effectiveDeliveryDate);
      persistCart(cart);
      return cart;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    gcTime: 30 * 60_000,
    initialData: isAuthenticated ? readPersistedCart : undefined,
    initialDataUpdatedAt: isAuthenticated ? readPersistedCartUpdatedAt : undefined,
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      clearPersistedCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && query.data) {
      persistCart(query.data);
    }
  }, [isAuthenticated, query.data]);

  return query;
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
      if (!isAuthenticated) {
        if (!isAuthLoading) {
          router.push(
            buildLoginHref(getCurrentPathWithSearch('/cart')),
          );
        }
        throw new Error(
          isAuthLoading
            ? 'Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.'
            : 'Vui lòng đăng nhập để thêm vào giỏ hàng.',
        );
      }

      const normalizedInput: AddCartLineInput = {
        ...input,
        quantity: Math.max(1, input.quantity ?? 1),
      };

      const addedCart = await addCartLine(normalizedInput);
      if (hasMatchingCartLine(addedCart, normalizedInput)) {
        return addedCart;
      }

      // Fallback lấy cart authoritative từ backend khi response add-line chưa phản ánh merge line.
      return getCart(getDefaultDeliveryDate());
    },

    onMutate: async (input) => {
      if (!isAuthenticated) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart =
        getCachedCartFromQueryClient(queryClient) ?? readPersistedCart();

      const optimisticCart = applyOptimisticAdd(previousCart, input);
      setCachedCartForAllKeys(queryClient, optimisticCart);
      persistCart(optimisticCart);

      return { previousCart };
    },

    onSuccess: (data) => {
      setCachedCartForAllKeys(queryClient, data);
      persistCart(data);
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        setCachedCartForAllKeys(queryClient, context.previousCart);
        persistCart(context.previousCart);
      } else {
        queryClient.removeQueries({ queryKey: cartKeys.all });
        clearPersistedCart();
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
      if (!isAuthenticated) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart =
        getCachedCartFromQueryClient(queryClient) ?? readPersistedCart();

      const optimisticCart = previousCart
        ? {
            ...previousCart,
            cartLines: previousCart.cartLines.map((line) => {
              if (line.cartLineId !== cartLineId) return line;

              const nextQuantity = Math.max(1, input.quantity ?? line.quantity);
              const nextDuration = Math.max(
                1,
                input.rentalDurationDays ?? line.rentalDurationDays,
              );
              return patchLineTotals(line, nextQuantity, nextDuration);
            }),
            updatedAt: new Date().toISOString(),
          }
        : previousCart;

      setCachedCartForAllKeys(queryClient, optimisticCart);

      persistCart(optimisticCart);

      return { previousCart };
    },

    onSuccess: (data) => {
      setCachedCartForAllKeys(queryClient, data);
      persistCart(data);
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        setCachedCartForAllKeys(queryClient, context.previousCart);
        persistCart(context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
      if (!isAuthenticated) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart =
        getCachedCartFromQueryClient(queryClient) ?? readPersistedCart();

      const optimisticCart = previousCart
        ? {
            ...previousCart,
            cartLines: previousCart.cartLines.filter(
              (line) => line.cartLineId !== cartLineId,
            ),
            updatedAt: new Date().toISOString(),
          }
        : previousCart;

      setCachedCartForAllKeys(queryClient, optimisticCart);

      persistCart(optimisticCart);

      return { previousCart };
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error: Error, _cartLineId, context) => {
      if (context?.previousCart !== undefined) {
        setCachedCartForAllKeys(queryClient, context.previousCart);
        persistCart(context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
      if (!isAuthenticated) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart =
        getCachedCartFromQueryClient(queryClient) ?? readPersistedCart();

      const optimisticCart = previousCart
        ? {
            ...previousCart,
            cartLines: [],
            updatedAt: new Date().toISOString(),
          }
        : previousCart;

      setCachedCartForAllKeys(queryClient, optimisticCart);

      persistCart(optimisticCart);

      return { previousCart };
    },

    onSuccess: () => {
      clearPersistedCart();
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        setCachedCartForAllKeys(queryClient, context.previousCart);
        persistCart(context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
      if (!isAuthenticated) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousCart =
        getCachedCartFromQueryClient(queryClient) ?? readPersistedCart();

      const optimisticCart = previousCart
        ? {
            ...previousCart,
            cartLines: previousCart.cartLines.map((line) => {
              if (line.cartLineId !== cartLineId) return line;

              const nextQuantity = Math.max(1, quantity ?? line.quantity);
              const nextDuration = Math.max(
                1,
                rentalDurationDays ?? line.rentalDurationDays,
              );
              return patchLineTotals(line, nextQuantity, nextDuration);
            }),
            updatedAt: new Date().toISOString(),
          }
        : previousCart;

      setCachedCartForAllKeys(queryClient, optimisticCart);

      persistCart(optimisticCart);

      return { previousCart };
    },

    onSuccess: (data) => {
      setCachedCartForAllKeys(queryClient, data);
      persistCart(data);
      options?.onSuccess?.();
    },

    onError: (error: Error, _input, context) => {
      if (context?.previousCart !== undefined) {
        setCachedCartForAllKeys(queryClient, context.previousCart);
        persistCart(context.previousCart);
      }
      options?.onError?.(error);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}
