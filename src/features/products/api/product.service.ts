/**
 * Product service - tất cả API calls cho products module (dashboard).
 * HTTP layer: httpService (axios) - dùng http.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 8: PRODUCTS (API-051 → API-055)
 *
 * Category service đã tách sang: src/features/categories/api/category.service.ts
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type {
  CreateInventoryItemInput,
  CreateProductInput,
  InventoryItemListParams,
  InventoryItemResponse,
  PaginatedInventoryItemsResponse,
  PaginatedProductsResponse,
  ProductAvailabilityParams,
  ProductAvailabilityResponse,
  ProductListParams,
  ProductResponse,
  UpdateInventoryItemInput,
  UpdateProductInput,
} from '../types';

const authOpts = { requireToken: true as const };

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
export async function getProducts(
  params: ProductListParams = {},
): Promise<PaginatedProductsResponse> {
  const { page = 1, size = 12, sort, filter, includeDescendants, onlyWithStock } = params;
  const res = await httpService.get<ApiResponse<PaginatedProductsResponse>>(
    '/products',
    {
      params: {
        page,
        size,
        ...(sort ? { sort } : {}),
        filter,
        ...(includeDescendants ? { includeDescendants: true } : {}),
        ...(onlyWithStock ? { onlyWithStock: true } : {}),
      },
    },
  );
  return res.data.data!;
}

/**
 * GET /api/v1/products/hub/{hubId}
 * Lấy danh sách sản phẩm theo hub (public).
 * Chỉ trả sản phẩm isActive=true (lọc qua filter param).
 */
export async function getProductsByHub(
  hubId: string,
  params: ProductListParams = {},
): Promise<PaginatedProductsResponse> {
  const {
    page = 1,
    size = 50,
    sort = 'createdAt,desc',
    filter = 'isActive:true',
    includeDescendants = false,
  } = params;
  const res = await httpService.get<ApiResponse<PaginatedProductsResponse>>(
    `/products/hub/${hubId}`,
    {
      params: {
        page,
        size,
        sort,
        filter,
        ...(includeDescendants ? { includeDescendants: true } : {}),
      },
    },
  );
  return res.data.data!;
}

/**
 * API-052: GET /api/v1/products/{productId}
 * Fetch a single product by ID.
 */
export async function getProductById(
  productId: string,
): Promise<ProductResponse> {
  const res = await httpService.get<ApiResponse<ProductResponse>>(
    `/products/${productId}`,
  );
  return res.data.data!;
}

/**
 * API-055-B: GET /api/v1/products/{productId}/availability
 * Kiểm tra tình trạng khả dụng của sản phẩm theo ngày giao & thời hạn thuê cụ thể.
 * Dùng khi user chọn ngày giao / số ngày thuê / màu sắc trên product detail.
 * Params là all optional nhưng FE nên truyền deliveryDate + rentalDurationDays khi có.
 */
export async function getProductAvailability(
  productId: string,
  params?: ProductAvailabilityParams,
): Promise<ProductAvailabilityResponse> {
  const res = await httpService.get<ApiResponse<ProductAvailabilityResponse>>(
    `/products/${productId}/availability`,
    { params },
  );
  return res.data.data!;
}

/**
 * API-051: POST /api/v1/products
 * Create a new product.
 * Images should be uploaded first via useUploadFilesMutation,
 * then pass the resulting URLs in imageUrls[].
 */
export async function createProduct(
  payload: CreateProductInput,
): Promise<ProductResponse> {
  const res = await httpService.post<ApiResponse<ProductResponse>>(
    '/products',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-054: PATCH /api/v1/products/{productId}
 * Update an existing product (partial update).
 * imageUrls replaces all images when provided.
 */
export async function updateProduct(
  productId: string,
  payload: UpdateProductInput,
): Promise<ProductResponse> {
  const res = await httpService.patch<ApiResponse<ProductResponse>>(
    `/products/${productId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-055: DELETE /api/v1/products/{productId}
 * Soft-delete a product. Returns void/null.
 */
export async function deleteProduct(productId: string): Promise<null> {
  await httpService.delete(`/products/${productId}`, authOpts);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 9: INVENTORY ITEMS (API-056 → API-060)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-058: GET /api/v1/inventory-items
 * Paginated list of inventory items. Filter by productId via RSQL:
 *   filter = "productId:'<uuid>'"
 */
export async function getInventoryItems(
  params?: InventoryItemListParams,
): Promise<PaginatedInventoryItemsResponse> {
  const res = await httpService.get<
    ApiResponse<PaginatedInventoryItemsResponse>
  >('/inventory-items', { ...authOpts, params });
  return (
    res.data.data ?? {
      meta: {
        currentPage: 1,
        pageSize: 50,
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false,
      },
      content: [],
    }
  );
}

/**
 * API-057: GET /api/v1/inventory-items/{inventoryItemId}
 * Get a single inventory item by ID.
 */
export async function getInventoryItemById(
  inventoryItemId: string,
): Promise<InventoryItemResponse> {
  const res = await httpService.get<ApiResponse<InventoryItemResponse>>(
    `/inventory-items/${inventoryItemId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-056: POST /api/v1/inventory-items
 * Create a new inventory item. productId and hubId are required.
 */
export async function createInventoryItem(
  payload: CreateInventoryItemInput,
): Promise<InventoryItemResponse> {
  const res = await httpService.post<ApiResponse<InventoryItemResponse>>(
    '/inventory-items',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-059: PATCH /api/v1/inventory-items/{inventoryItemId}
 * Partial update of an inventory item.
 */
export async function updateInventoryItem(
  inventoryItemId: string,
  payload: UpdateInventoryItemInput,
): Promise<InventoryItemResponse> {
  const res = await httpService.patch<ApiResponse<InventoryItemResponse>>(
    `/inventory-items/${inventoryItemId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-060: DELETE /api/v1/inventory-items/{inventoryItemId}
 * Delete an inventory item. Returns void/null.
 */
export async function deleteInventoryItem(
  inventoryItemId: string,
): Promise<null> {
  await httpService.delete(`/inventory-items/${inventoryItemId}`, authOpts);
  return null;
}
