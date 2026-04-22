import type { AxiosResponse } from "axios";
import { httpService } from "@/api/http";

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventoryItemStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "MAINTENANCE"
  | "DAMAGED"
  | "RETIRED";

export type ConditionGrade = "NEW" | "GOOD" | "FAIR" | "POOR";

export interface ProductColorResponse {
  productColorId: string;
  name: string;
  code: string;
  quantity: number;
  availableQuantity: number;
}

export interface ProductImageResponse {
  productImageId: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductResponse {
  productId: string;
  categoryId: string;
  categoryName: string;
  brand: string | null;
  color: string | null;
  colors: ProductColorResponse[];
  name: string;
  shortDescription: string | null;
  description: string | null;
  dailyPrice: number;
  oldDailyPrice: number | null;
  depositAmount: number;
  minRentalDays: number;
  isActive: boolean;
  images: ProductImageResponse[];
  availableStock: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSingleResponse {
  success: boolean;
  message?: string;
  data: ProductResponse;
  meta?: { timestamp: string; instance: string };
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data: {
    meta: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    content: ProductResponse[];
  };
  meta?: { timestamp: string; instance: string };
}

export interface ProductVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

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
  conditionGrade: ConditionGrade | null;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemSingleResponse {
  success: boolean;
  message?: string;
  data: InventoryItemResponse;
  meta?: { timestamp: string; instance: string };
}

export interface InventoryItemListResponse {
  success: boolean;
  message?: string;
  data: {
    meta: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    content: InventoryItemResponse[];
  };
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateProductInput {
  categoryId: string;
  name: string;
  dailyPrice: number;
  depositAmount: number;
  brand?: string;
  color?: string;
  shortDescription?: string;
  description?: string;
  oldDailyPrice?: number;
  minRentalDays?: number;
  colors?: { name: string; code: string }[];
  imageUrls?: string[];
}

export interface UpdateProductInput {
  categoryId?: string;
  brand?: string;
  color?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  dailyPrice?: number;
  oldDailyPrice?: number;
  depositAmount?: number;
  minRentalDays?: number;
  colors?: { productColorId?: string; name: string; code: string }[];
  imageUrls?: string[];
  isActive?: boolean;
}

export interface CreateInventoryItemInput {
  productId: string;
  hubId: string;
  serialNumber: string;
  productColorId?: string;
  conditionGrade?: ConditionGrade;
  staffNote?: string;
}

export interface UpdateInventoryItemInput {
  hubId?: string;
  productColorId?: string;
  status?: InventoryItemStatus;
  conditionGrade?: ConditionGrade;
  staffNote?: string;
}

// ─── Product API ──────────────────────────────────────────────────────────────

export const productsApi = {
  /**
   * API-052: Tạo sản phẩm [AUTH]
   *
   * Rule: oldDailyPrice >= dailyPrice (nếu có oldDailyPrice)
   */
  create(
    data: CreateProductInput,
  ): Promise<AxiosResponse<ProductSingleResponse>> {
    return httpService.post<ProductSingleResponse>("/products", data, authOpts);
  },

  /**
   * API-053: Lấy sản phẩm theo ID [PUBLIC]
   *
   * Response bao gồm thêm inventoryItems[]
   */
  getById(productId: string): Promise<AxiosResponse<ProductSingleResponse>> {
    return httpService.get<ProductSingleResponse>(`/products/${productId}`);
  },

  /**
   * API-054: Lấy danh sách sản phẩm [PUBLIC]
   *
   * @param params.page               - one-indexed (mặc định 1)
   * @param params.size               - mặc định 12
   * @param params.sort               - VD: createdAt,desc
   * @param params.filter             - SpringFilter DSL
   * @param params.includeDescendants - true: include products của category con
   */
  list(params?: {
    page?: number;
    size?: number;
    sort?: string;
    filter?: string;
    includeDescendants?: boolean;
  }): Promise<AxiosResponse<ProductListResponse>> {
    return httpService.get<ProductListResponse>("/products", { params });
  },

  /**
   * API-055: Cập nhật sản phẩm [AUTH]
   *
   * Nếu truyền colors[], backend sync full danh sách màu theo payload.
   */
  update(
    productId: string,
    data: UpdateProductInput,
  ): Promise<AxiosResponse<ProductSingleResponse>> {
    return httpService.patch<ProductSingleResponse>(
      `/products/${productId}`,
      data,
      authOpts,
    );
  },

  /**
   * API-056: Xóa sản phẩm [AUTH]
   */
  delete(productId: string): Promise<AxiosResponse<ProductVoidResponse>> {
    return httpService.delete<ProductVoidResponse>(
      `/products/${productId}`,
      authOpts,
    );
  },
};

// ─── Inventory Items API ──────────────────────────────────────────────────────

export const inventoryApi = {
  /**
   * API-057: Tạo mục kho (serial) [AUTH]
   *
   * Lỗi: PRODUCT_NOT_FOUND, HUB_NOT_FOUND, INVENTORY_SERIAL_DUPLICATE
   */
  create(
    data: CreateInventoryItemInput,
  ): Promise<AxiosResponse<InventoryItemSingleResponse>> {
    return httpService.post<InventoryItemSingleResponse>(
      "/inventory-items",
      data,
      authOpts,
    );
  },

  /**
   * API-058: Lấy mục kho theo ID [AUTH]
   */
  getById(
    inventoryItemId: string,
  ): Promise<AxiosResponse<InventoryItemSingleResponse>> {
    return httpService.get<InventoryItemSingleResponse>(
      `/inventory-items/${inventoryItemId}`,
      authOpts,
    );
  },

  /**
   * API-059: Lấy danh sách mục kho [AUTH]
   *
   * @param params.filter - SpringFilter DSL, VD: productId:'...' and status:'AVAILABLE'
   */
  list(params?: {
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<AxiosResponse<InventoryItemListResponse>> {
    return httpService.get<InventoryItemListResponse>("/inventory-items", {
      ...authOpts,
      params,
    });
  },

  /**
   * API-060: Cập nhật mục kho [AUTH]
   *
   * Dùng để cập nhật status (AVAILABLE/MAINTENANCE/etc.), conditionGrade, staffNote, hub
   */
  update(
    inventoryItemId: string,
    data: UpdateInventoryItemInput,
  ): Promise<AxiosResponse<InventoryItemSingleResponse>> {
    return httpService.patch<InventoryItemSingleResponse>(
      `/inventory-items/${inventoryItemId}`,
      data,
      authOpts,
    );
  },

  /**
   * API-061: Xóa mục kho [AUTH]
   */
  delete(
    inventoryItemId: string,
  ): Promise<AxiosResponse<{ success: boolean; message: string; data: null }>> {
    return httpService.delete(`/inventory-items/${inventoryItemId}`, authOpts);
  },
};
