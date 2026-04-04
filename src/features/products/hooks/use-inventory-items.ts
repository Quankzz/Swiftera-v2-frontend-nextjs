/**
 * Hooks cho inventory items module (dashboard):
 *  - useInventoryItemsQuery       — paginated list filtered by productId
 *  - useInventoryItemQuery        — single item by ID
 *  - useCreateInventoryItemMutation
 *  - useUpdateInventoryItemMutation
 *  - useDeleteInventoryItemMutation
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 9: INVENTORY ITEMS (API-056 → API-060)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItemById,
  getInventoryItems,
  updateInventoryItem,
} from '../api/product.service';
import type {
  CreateInventoryItemInput,
  InventoryItemListParams,
  InventoryItemResponse,
  PaginatedInventoryItemsResponse,
  UpdateInventoryItemInput,
} from '../types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const inventoryKeys = {
  all: ['inventory-items'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: InventoryItemListParams) =>
    [...inventoryKeys.lists(), params] as const,
  byProduct: (productId: string) =>
    [...inventoryKeys.lists(), { filter: `productId:'${productId}'` }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-058: GET /api/v1/inventory-items?filter=productId:'<uuid>'
 * Only runs when productId is truthy.
 */
export function useInventoryItemsQuery(
  productId: string | undefined,
  params?: Omit<InventoryItemListParams, 'filter'>,
) {
  const filter = productId ? `productId:'${productId}'` : undefined;
  const fullParams: InventoryItemListParams = {
    page: 0,
    size: 50,
    ...params,
    filter,
  };

  return useQuery<PaginatedInventoryItemsResponse>({
    enabled: !!productId,
    queryKey: inventoryKeys.byProduct(productId ?? ''),
    queryFn: () => getInventoryItems(fullParams),
    staleTime: 30 * 1000,
  });
}

/**
 * API-057: GET /api/v1/inventory-items/{inventoryItemId}
 */
export function useInventoryItemQuery(inventoryItemId: string | undefined) {
  return useQuery<InventoryItemResponse>({
    enabled: !!inventoryItemId,
    queryKey: inventoryItemId
      ? inventoryKeys.detail(inventoryItemId)
      : inventoryKeys.details(),
    queryFn: () => getInventoryItemById(inventoryItemId as string),
    staleTime: 30 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-056: POST /api/v1/inventory-items
 * After success, invalidates the list for the affected productId.
 */
export function useCreateInventoryItemMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation<InventoryItemResponse, Error, CreateInventoryItemInput>({
    mutationFn: (payload) => createInventoryItem(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.byProduct(productId) });
    },
  });
}

/**
 * API-059: PATCH /api/v1/inventory-items/{inventoryItemId}
 */
export function useUpdateInventoryItemMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation<
    InventoryItemResponse,
    Error,
    { inventoryItemId: string; payload: UpdateInventoryItemInput }
  >({
    mutationFn: ({ inventoryItemId, payload }) =>
      updateInventoryItem(inventoryItemId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.byProduct(productId) });
      qc.invalidateQueries({
        queryKey: inventoryKeys.detail(data.inventoryItemId),
      });
    },
  });
}

/**
 * API-060: DELETE /api/v1/inventory-items/{inventoryItemId}
 */
export function useDeleteInventoryItemMutation(productId: string) {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: (inventoryItemId) => deleteInventoryItem(inventoryItemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.byProduct(productId) });
    },
  });
}
