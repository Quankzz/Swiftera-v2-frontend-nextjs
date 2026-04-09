/**
 * Product service — tất cả API calls cho products module (dashboard).
 * Dùng apiService.ts làm HTTP layer, KHÔNG dùng client.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 8: PRODUCTS (API-051 → API-055)
 *
 * Category service đã tách sang: src/features/categories/api/category.service.ts
 */

import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  CreateInventoryItemInput,
  CreateProductInput,
  InventoryItemListParams,
  InventoryItemResponse,
  PaginatedInventoryItemsResponse,
  PaginatedProductsResponse,
  ProductListParams,
  ProductResponse,
  UpdateInventoryItemInput,
  UpdateProductInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build URLSearchParams string from a plain params object (skips undefined).
 *
 * NOTE: URLSearchParams encodes spaces as `+` (form-encoding), but Spring's
 * SpringFilter DSL parser expects `%20`.  We replace `+` → `%20` in the
 * final string so that RSQL expressions like `isActive:true and categoryId:'…'`
 * arrive at the server with proper spaces, not literal `+` characters.
 */
function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val));
    }
  }
  // Replace form-encoded `+` (space) with percent-encoded `%20` so Spring
  // receives proper spaces inside RSQL filter expressions.
  const str = q.toString().replace(/\+/g, '%20');
  return str ? `?${str}` : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Products CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-053: GET /api/v1/products
 * Paginated, filterable, sortable product list.
 *
 * sort:   "field,direction"  e.g. "dailyPrice,asc" | "name,desc"
 * filter: RSQL               e.g. "name:'Canon' and isActive:true"
 */
export function getProducts(
  params: ProductListParams = {},
): Promise<PaginatedProductsResponse> {
  const { page = 1, size = 12, sort, filter, includeDescendants } = params;
  const query = buildQuery({
    page,
    size,
    sort,
    filter,
    ...(includeDescendants ? { includeDescendants: true } : {}),
  });
  return apiGet<PaginatedProductsResponse>(`/products${query}`);
}

/**
 * API-052: GET /api/v1/products/{productId}
 * Fetch a single product by ID.
 */
export function getProductById(productId: string): Promise<ProductResponse> {
  return apiGet<ProductResponse>(`/products/${productId}`);
}

/**
 * API-051: POST /api/v1/products
 * Create a new product.
 * Images should be uploaded first via useUploadFilesMutation,
 * then pass the resulting URLs in imageUrls[].
 */
export function createProduct(
  payload: CreateProductInput,
): Promise<ProductResponse> {
  return apiPost<ProductResponse>('/products', payload);
}

/**
 * API-054: PATCH /api/v1/products/{productId}
 * Update an existing product (partial update).
 * imageUrls replaces all images when provided.
 */
export function updateProduct(
  productId: string,
  payload: UpdateProductInput,
): Promise<ProductResponse> {
  return apiPatch<ProductResponse>(`/products/${productId}`, payload);
}

/**
 * API-055: DELETE /api/v1/products/{productId}
 * Soft-delete a product. Returns void/null.
 */
export function deleteProduct(productId: string): Promise<null> {
  return apiDelete<null>(`/products/${productId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 9: INVENTORY ITEMS (API-056 → API-060)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-058: GET /api/v1/inventory-items
 * Paginated list of inventory items. Filter by productId via RSQL:
 *   filter = "productId:'<uuid>'"
 */
export function getInventoryItems(
  params?: InventoryItemListParams,
): Promise<PaginatedInventoryItemsResponse> {
  return apiGet<PaginatedInventoryItemsResponse>('/inventory-items', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });
}

/**
 * API-057: GET /api/v1/inventory-items/{inventoryItemId}
 * Get a single inventory item by ID.
 */
export function getInventoryItemById(
  inventoryItemId: string,
): Promise<InventoryItemResponse> {
  return apiGet<InventoryItemResponse>(`/inventory-items/${inventoryItemId}`);
}

/**
 * API-056: POST /api/v1/inventory-items
 * Create a new inventory item. productId and hubId are required.
 */
export function createInventoryItem(
  payload: CreateInventoryItemInput,
): Promise<InventoryItemResponse> {
  return apiPost<InventoryItemResponse>('/inventory-items', payload);
}

/**
 * API-059: PATCH /api/v1/inventory-items/{inventoryItemId}
 * Partial update of an inventory item.
 */
export function updateInventoryItem(
  inventoryItemId: string,
  payload: UpdateInventoryItemInput,
): Promise<InventoryItemResponse> {
  return apiPatch<InventoryItemResponse>(
    `/inventory-items/${inventoryItemId}`,
    payload,
  );
}

/**
 * API-060: DELETE /api/v1/inventory-items/{inventoryItemId}
 * Delete an inventory item. Returns void/null.
 */
export function deleteInventoryItem(inventoryItemId: string): Promise<null> {
  return apiDelete<null>(`/inventory-items/${inventoryItemId}`);
}
