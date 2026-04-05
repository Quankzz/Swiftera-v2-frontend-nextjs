// ─── Product Feature Types ─────────────────────────────────────────────────
// Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
// Module 8: PRODUCTS (API-051 → API-055)
//
// Category types đã tách sang: src/features/categories/types.ts
// ───────────────────────────────────────────────────────────────────────────

// ── Shared pagination meta ──────────────────────────────────────────────────
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  content: T[];
}

// ── Product image type ──────────────────────────────────────────────────────
// BE response field is `images` (not `productImages`)

export interface ProductImageResponse {
  productImageId: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

// ── Product response (API-051 / API-052 / API-053 / API-054) ────────────────

export interface ProductInventoryItemResponse {
  inventoryItemId: string;
  serialNumber: string;
  status:
    | 'AVAILABLE'
    | 'RESERVED'
    | 'RENTED'
    | 'MAINTENANCE'
    | 'DAMAGED'
    | 'RETIRED';
  conditionGrade: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | null;
  staffNote: string | null;
  hubId: string;
  hubCode: string;
  hubName: string;
}

export interface ProductResponse {
  productId: string;
  categoryId: string;
  categoryName: string;
  /** e.g. "Canon", "Sony" — single string, not array */
  brand: string | null;
  /** e.g. "Black", "Silver" — single string, not array */
  color: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  dailyPrice: number;
  oldDailyPrice: number | null;
  depositAmount: number | null;
  minRentalDays: number;
  isActive: boolean;
  /** BE field name is `images` (not `productImages`) */
  images: ProductImageResponse[];
  /** Các thiết bị vật lý (serial) của sản phẩm này */
  inventoryItems: ProductInventoryItemResponse[];
  availableStock: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export type PaginatedProductsResponse = PaginatedResponse<ProductResponse>;

// ── Create product input (API-051 POST /api/v1/products) ────────────────────

export interface CreateProductInput {
  /** required */
  categoryId: string;
  /** required */
  name: string;
  /** required, > 0 */
  dailyPrice: number;
  /** required, >= 0 */
  depositAmount: number;
  brand?: string;
  /** single color string, e.g. "Black" */
  color?: string;
  description?: string;
  /** optional, must be >= dailyPrice if provided */
  oldDailyPrice?: number;
  minRentalDays?: number;
  /** array of image URL strings (upload first, then pass URLs) */
  imageUrls?: string[];
}

// ── Update product input (API-054 PATCH /api/v1/products/{productId}) ───────
// Same as create but all fields optional + isActive flag

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

// ── Query params for paginated list (API-053 GET /api/v1/products) ──────────
// sort format: "field,direction" e.g. "dailyPrice,asc" | "name,asc"
// filter format: RSQL e.g. "name:'query' and categoryId:'uuid'"

export interface ProductListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}

// ── Inventory Item Types (Module 9: INVENTORY ITEMS — API-056 to API-060) ──
// Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md

export type InventoryItemStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'DAMAGED'
  | 'RETIRED';

export type InventoryItemConditionGrade = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';

/** Response shape from API-056 / API-057 / API-058 / API-059 */
export interface InventoryItemResponse {
  inventoryItemId: string;
  productId: string;
  productName: string;
  hubId: string;
  hubName: string;
  serialNumber: string;
  status: InventoryItemStatus;
  conditionGrade: InventoryItemConditionGrade | null;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaginatedInventoryItemsResponse =
  PaginatedResponse<InventoryItemResponse>;

/** Body for API-056: POST /api/v1/inventory-items */
export interface CreateInventoryItemInput {
  /** required */
  productId: string;
  /** required */
  hubId: string;
  /** required */
  serialNumber: string;
  conditionGrade?: InventoryItemConditionGrade;
  staffNote?: string;
}

/** Body for API-059: PATCH /api/v1/inventory-items/{inventoryItemId} */
export interface UpdateInventoryItemInput {
  hubId?: string;
  status?: InventoryItemStatus;
  conditionGrade?: InventoryItemConditionGrade;
  staffNote?: string;
}

/** Query params for API-058: GET /api/v1/inventory-items */
export interface InventoryItemListParams {
  page?: number;
  size?: number;
  /** RSQL filter, e.g. "productId:'uuid'" */
  filter?: string;
}
