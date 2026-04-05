/**
 * Reviews API — /api/v1/reviews
 *
 * Module 15 trong tài liệu API: REVIEWS (5 endpoints)
 * Base URL: /api/v1
 *
 * NOTE: Tất cả endpoints đều yêu cầu xác thực [AUTH]
 *
 * Sử dụng httpService (axios) giống cấu trúc userProfileApi.ts
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductReviewResponse {
  productReviewId: string;
  rentalOrderId: string;
  userId: string;
  userNickname: string | null;
  productId: string;
  productName: string;
  rating: number; // 1–5
  content: string | null;
  staffRating: number | null;
  sellerReply: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
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
    content: ProductReviewResponse[];
  };
  meta?: { timestamp: string; instance: string };
}

export interface ReviewSingleResponse {
  success: boolean;
  message?: string;
  data: ProductReviewResponse;
  meta?: { timestamp: string; instance: string };
}

export interface ReviewVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ──────────────────────────────────────────────────────────

export interface CreateReviewInput {
  rentalOrderId: string; // UUID đơn thuê đã COMPLETED
  productId: string; // UUID product có trong đơn
  rating: number; // 1–5
  content?: string; // nội dung đánh giá (tùy chọn)
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const reviewsApi = {
  /**
   * API-094: Tạo đánh giá sản phẩm [AUTH]
   *
   * @param data.rentalOrderId - UUID đơn thuê đã COMPLETED
   * @param data.productId     - UUID product có trong đơn
   * @param data.rating       - 1–5 sao
   * @param data.content       - nội dung đánh giá (tùy chọn)
   */
  create(
    data: CreateReviewInput,
  ): Promise<AxiosResponse<ReviewSingleResponse>> {
    return httpService.post<ReviewSingleResponse>('/reviews', data, authOpts);
  },

  /**
   * API-095: Lấy đánh giá theo ID [AUTH]
   */
  getById(reviewId: string): Promise<AxiosResponse<ReviewSingleResponse>> {
    return httpService.get<ReviewSingleResponse>(
      `/reviews/${reviewId}`,
      authOpts,
    );
  },

  /**
   * API-096: Lấy danh sách đánh giá [AUTH]
   *
   * @param params.page   - mặc định 0
   * @param params.size  - mặc định 10
   * @param params.filter - SpringFilter DSL, VD: productId:'...'
   */
  list(params?: {
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<AxiosResponse<ReviewListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const qs = new URLSearchParams({ page: String(page), size });
    if (params?.filter) qs.set('filter', params.filter);
    return httpService.get<ReviewListResponse>(
      `/reviews?${qs.toString()}`,
      authOpts,
    );
  },

  /**
   * API-097: Lấy đánh giá theo sản phẩm [AUTH]
   *
   * @param productId    - UUID sản phẩm
   * @param params.page  - mặc định 0
   * @param params.size  - mặc định 10
   */
  getByProduct(
    productId: string,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<ReviewListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const qs = new URLSearchParams({ page: String(page), size });
    return httpService.get<ReviewListResponse>(
      `/reviews/product/${productId}?${qs.toString()}`,
      authOpts,
    );
  },

  /**
   * API-098: Xóa đánh giá [AUTH]
   */
  delete(reviewId: string): Promise<AxiosResponse<ReviewVoidResponse>> {
    return httpService.delete<ReviewVoidResponse>(
      `/reviews/${reviewId}`,
      authOpts,
    );
  },
};
