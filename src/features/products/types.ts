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

// ── Product color types ─────────────────────────────────────────────────────
// API-052: colors[] is the canonical color list. `color` string is legacy.

/** Input item for creating/updating product colors */
export interface ProductColorInput {
  /** Only present when updating an existing color (edit mode) */
  productColorId?: string;
  name: string;
  /** Hex color code, e.g. "#111111" */
  code: string;
}

/** Color as returned from BE (has productColorId + stock info) */
export interface ProductColorResponse {
  productColorId: string;
  name: string;
  /** Hex color code, e.g. "#111111" */
  code: string;
  /** Tổng số serial của màu này */
  quantity: number;
  /** Số serial đang AVAILABLE */
  availableQuantity: number;
}

/**
 * Inventory item as embedded in a product detail response (API-053).
 * Subset of InventoryItemResponse - productId/productName are omitted
 * because they're implicit (you're already in the product context).
 * The full InventoryItemResponse (with productId/productName) is used
 * by the standalone inventory-items API (API-057..061).
 */
export interface InventoryItemInProduct {
  inventoryItemId: string;
  serialNumber: string;
  status: InventoryItemStatus;
  conditionGrade: InventoryItemConditionGrade | null;
  staffNote: string | null;
  hubId: string;
  hubCode: string;
  hubName: string;
  /** Color this serial is associated with (optional if product has 1 color) */
  productColorId: string | null;
  colorName: string | null;
  colorCode: string | null;
}

// InventoryItemStatus / InventoryItemConditionGrade are declared later in
// the Inventory Item Types section - forward references are fine in TS.

// ── Product response (API-051 / API-052 / API-053 / API-054) ────────────────
//
// API-053 (GET /api/v1/products/{productId}) returns inventoryItems embedded
// in the product detail response - no separate inventory API call needed.

export interface ProductResponse {
  productId: string;
  categoryId: string;
  categoryName: string;
  /** e.g. "Canon", "Sony" - single string, not array */
  brand: string | null;
  /**
   * voucherId linked to this product (PRODUCT_DISCOUNT voucher).
   * Send empty string "" to unlink. Absent or null = no voucher.
   */
  voucherId: string | null;
  /**
   * Legacy summary string, e.g. "Black, Silver".
   * Use `colors[]` for structured data.
   */
  color: string | null;
  /** Structured color list - canonical source for UI */
  colors: ProductColorResponse[];
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
  /**
   * Embedded inventory items - only present in detail responses (API-053).
   * List responses (API-054) do NOT include inventoryItems.
   */
  inventoryItems?: InventoryItemInProduct[];
  availableStock: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
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
  /**
   * Link to a PRODUCT_DISCOUNT voucher.
   * Send empty string "" to explicitly unlink.
   */
  voucherId?: string;
  description?: string;
  shortDescription?: string;
  /** optional, must be >= dailyPrice if provided */
  oldDailyPrice?: number;
  minRentalDays?: number;
  /** Structured color list - preferred over legacy `color` string */
  colors?: ProductColorInput[];
  /** array of image URL strings (upload first, then pass URLs) */
  imageUrls?: string[];
}

// ── Update product input (API-055 PATCH /api/v1/products/{productId}) ───────
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
  /** API-054: include products from descendant categories when filtering by categoryId */
  includeDescendants?: boolean;
  /** API-054: when true, only return products that have at least one InventoryItem in AVAILABLE state */
  onlyWithStock?: boolean;
}

// ── Inventory Item Types (Module 9: INVENTORY ITEMS - API-056 to API-060) ──
// Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md

export type InventoryItemStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'DAMAGED'
  | 'RETIRED';

export type InventoryItemConditionGrade = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';

/** Response shape from API-057 / API-058 / API-059 / API-060 */
export interface InventoryItemResponse {
  inventoryItemId: string;
  productId: string;
  productName: string;
  productColorId: string | null;
  colorName: string | null;
  colorCode: string | null;
  hubId: string;
  hubCode: string;
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

/** Body for API-057: POST /api/v1/inventory-items */
export interface CreateInventoryItemInput {
  /** required */
  productId: string;
  /** required */
  hubId: string;
  /** required */
  serialNumber: string;
  /**
   * UUID của màu thuộc product; bắt buộc nếu product có >1 màu.
   * API-057 docs: "productColorId: tùy chọn; bắt buộc nếu product có >1 màu"
   */
  productColorId?: string;
  conditionGrade?: InventoryItemConditionGrade;
  staffNote?: string;
}

/** Body for API-060: PATCH /api/v1/inventory-items/{inventoryItemId} */
export interface UpdateInventoryItemInput {
  hubId?: string;
  productColorId?: string;
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
