/**
 * Hooks cho products module (dashboard):
 *  - useProductsQuery        - paginated list
 *  - useProductQuery         - single product by ID
 *  - useCreateProductMutation
 *  - useUpdateProductMutation
 *  - useDeleteProductMutation
 *
 * Category hooks đã tách sang: src/features/categories/hooks/use-category-management.ts
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 8: PRODUCTS (API-051 → API-055)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "../api/product.keys";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/product.service";
import type {
  CreateProductInput,
  PaginatedProductsResponse,
  ProductListParams,
  ProductResponse,
  UpdateProductInput,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-053: GET /api/v1/products
 * Paginated, filterable, sortable list.
 */
export function useProductsQuery(params?: ProductListParams) {
  return useQuery<PaginatedProductsResponse>({
    queryKey: productKeys.list(params),
    queryFn: () => getProducts(params),
    staleTime: 30 * 1000,
  });
}

/**
 * API-052: GET /api/v1/products/{productId}
 * Only runs when productId is truthy.
 */
export function useProductQuery(productId: string | undefined) {
  return useQuery<ProductResponse>({
    enabled: !!productId,
    queryKey: productId ? productKeys.detail(productId) : productKeys.details(),
    queryFn: () => getProductById(productId as string),
    staleTime: 30 * 1000,
  });
}

/**
 * API-051: POST /api/v1/products
 */
export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation<ProductResponse, Error, CreateProductInput>({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

/**
 * API-054: PATCH /api/v1/products/{productId}
 */
export function useUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation<
    ProductResponse,
    Error,
    { productId: string; payload: UpdateProductInput }
  >({
    mutationFn: ({ productId, payload }) => updateProduct(productId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}

/**
 * API-055: DELETE /api/v1/products/{productId}
 */
export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
