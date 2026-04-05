/**
 * Products API — /api/v1/products
 *
 * Module 8 trong tài liệu API: PRODUCTS (5 endpoints)
 * Base URL: /api/v1
 *
 * Sử dụng httpService (axios) giống cấu trúc userProfileApi.ts
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

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
  name: string;
  description: string | null;
  dailyPrice: number;
  oldDailyPrice: number | null;
  depositAmount: number;
  minRentalDays: number;
  isActive: boolean;
  images: ProductImageResponse[];
  availableStock: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
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

export interface ProductSingleResponse {
  success: boolean;
  message?: string;
  data: ProductResponse;
  meta?: { timestamp: string; instance: string };
}

export interface ProductVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ──────────────────────────────────────────────────────────

export interface CreateProductInput {
  categoryId: string;
  brand?: string;
  color?: string;
  name: string;
  description?: string;
  dailyPrice: number;
  oldDailyPrice?: number;
  depositAmount: number;
  minRentalDays?: number;
  imageUrls?: string[];
}

export interface UpdateProductInput {
  categoryId?: string;
  brand?: string;
  color?: string;
  name?: string;
  description?: string;
  dailyPrice?: number;
  oldDailyPrice?: number;
  depositAmount?: number;
  minRentalDays?: number;
  imageUrls?: string[];
  isActive?: boolean;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const productsApi = {
  /**
   * API-051: Tạo sản phẩm [AUTH]
   */
  create(
    data: CreateProductInput,
  ): Promise<AxiosResponse<ProductSingleResponse>> {
    return httpService.post<ProductSingleResponse>('/products', data, authOpts);
  },

  /**
   * API-052: Lấy sản phẩm theo ID [PUBLIC]
   */
  getById(productId: string): Promise<AxiosResponse<ProductSingleResponse>> {
    return httpService.get<ProductSingleResponse>(
      `/products/${productId}`,
      authOpts,
    );
  },

  /**
   * API-053: Lấy danh sách sản phẩm [PUBLIC]
   *
   * @param params.page   - mặc định 0
   * @param params.size  - mặc định 12
   * @param params.sort - mặc định createdAt,desc
   * @param params.filter - SpringFilter DSL, VD: isActive:true
   */
  list(params?: {
    page?: number;
    size?: number;
    sort?: string;
    filter?: string;
  }): Promise<AxiosResponse<ProductListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 12;
    const sort = params?.sort ?? 'createdAt,desc';
    const searchParams: Record<string, string> = {
      page: String(page),
      size: String(size),
      sort,
    };
    if (params?.filter) searchParams['filter'] = params.filter;
    return httpService.get<ProductListResponse>(`/products`, {
      ...authOpts,
      params: searchParams,
    });
  },

  /**
   * API-054: Cập nhật sản phẩm [AUTH]
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
   * API-055: Xóa sản phẩm [AUTH]
   */
  delete(productId: string): Promise<AxiosResponse<ProductVoidResponse>> {
    return httpService.delete<ProductVoidResponse>(
      `/products/${productId}`,
      authOpts,
    );
  },
};
