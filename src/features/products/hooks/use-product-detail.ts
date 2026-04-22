/**
 * useProductDetailQuery
 * API-052: GET /api/v1/products/{productId}
 *
 * Lấy chi tiết 1 sản phẩm theo productId.
 */

import { useQuery } from "@tanstack/react-query";
import { productKeys } from "../api/product.keys";
import { getProductById } from "../api/product.service";
import type { ProductResponse } from "../types";

export function useProductDetailQuery(productId: string) {
  return useQuery<ProductResponse, Error>({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
