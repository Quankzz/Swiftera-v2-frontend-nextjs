/**
 * Product prefetch utilities
 *
 * Prefetching là cách hiệu quả nhất để làm UI mượt mà.
 * Gọi prefetch khi user hover hoặc liếc qua một sản phẩm,
 * để khi họ bấm vào thì dữ liệu đã sẵn sàng trong cache.
 */

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/products/api/product.keys";
import { getProductById } from "@/features/products/api/product.service";
import { reviewKeys } from "@/hooks/api/review.keys";
import { getReviewsByProduct } from "@/hooks/api/review.service";
import type { ProductResponse } from "@/features/products/types";

/** Prefetch một sản phẩm vào cache, không block UI */
export function prefetchProduct(productId: string): void {
  if (typeof window === "undefined" || !productId) return;

  const queryClient = (
    window as Window & { __swifteraQueryClient?: QueryClient }
  ).__swifteraQueryClient;
  if (!queryClient) return;

  queryClient.prefetchQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/** Prefetch reviews của một sản phẩm vào cache */
export function prefetchProductReviews(
  productId: string,
  params?: { page?: number; size?: number },
): void {
  if (typeof window === "undefined" || !productId) return;

  const queryClient = (
    window as Window & { __swifteraQueryClient?: QueryClient }
  ).__swifteraQueryClient;
  if (!queryClient) return;

  queryClient.prefetchQuery({
    queryKey: reviewKeys.byProduct(productId, params),
    queryFn: () => getReviewsByProduct(productId, params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/** Hook để prefetch sản phẩm từ một mảng productIds (dùng trong list/grid pages) */
export function useProductPrefetch() {
  const queryClient = useQueryClient();

  return {
    /**
     * Prefetch một sản phẩm vào cache.
     * Gọi từ onMouseEnter hoặc onFocus event của product card/link.
     */
    prefetchOne: (productId: string) => {
      queryClient.prefetchQuery({
        queryKey: productKeys.detail(productId),
        queryFn: () => getProductById(productId),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      });
    },

    /**
     * Prefetch nhiều sản phẩm (dùng khi render một grid/catalog page).
     * Chỉ prefetch top-N để tránh overload network.
     */
    prefetchMany: (productIds: string[], top = 8) => {
      const ids = productIds.slice(0, top);
      ids.forEach((id) => {
        queryClient.prefetchQuery({
          queryKey: productKeys.detail(id),
          queryFn: () => getProductById(id),
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
        });
      });
    },

    /**
     * Prefetch reviews của sản phẩm.
     */
    prefetchReviews: (productId: string) => {
      queryClient.prefetchQuery({
        queryKey: reviewKeys.byProduct(productId, { page: 1, size: 5 }),
        queryFn: () => getReviewsByProduct(productId, { page: 1, size: 5 }),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      });
    },

    /**
     * Kiểm tra xem sản phẩm đã có trong cache chưa.
     */
    hasProduct: (productId: string): boolean => {
      return queryClient.getQueryData(productKeys.detail(productId)) != null;
    },
  };
}
