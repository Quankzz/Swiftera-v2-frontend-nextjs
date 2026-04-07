/**
 * Reviews API — Module 15: REVIEWS (API-095 → API-099)
 *
 * Base URL: /api/v1
 * Tất cả endpoints yêu cầu xác thực [AUTH]
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

// ─── Response Types ─────────────────────────────────────────────────────────

export interface ProductReviewResponse {
  productReviewId: string;
  rentalOrderId: string;
  userId: string;
  userNickname: string | null;
  productId: string;
  productName: string;
  rating: number;
  content: string | null;
  staffRating: number | null;
  sellerReply: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
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

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedReviewsData {
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  content: ProductReviewResponse[];
}

export interface PaginatedReviewsResponse {
  success: boolean;
  message?: string;
  data: PaginatedReviewsData;
  meta?: { timestamp: string; instance: string };
}

// ─── Request Payloads ───────────────────────────────────────────────────────

export interface CreateReviewInput {
  rentalOrderId: string;
  productId: string;
  rating: number;
  content?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

const authOpts = { requireToken: true as const };

/**
 * API-095: Tạo đánh giá sản phẩm [AUTH]
 *
 * @param input - rentalOrderId, productId, rating (1-5), content (optional)
 *
 * Lỗi: REVIEW_ALREADY_EXISTS, REVIEW_ORDER_NOT_COMPLETED
 */
export function createReview(
  input: CreateReviewInput,
): Promise<AxiosResponse<ReviewSingleResponse>> {
  return httpService.post<ReviewSingleResponse>('/reviews', input, authOpts);
}

/**
 * API-096: Lấy đánh giá theo ID [AUTH]
 *
 * @param reviewId - UUID của đánh giá
 */
export function getReviewById(
  reviewId: string,
): Promise<AxiosResponse<ReviewSingleResponse>> {
  return httpService.get<ReviewSingleResponse>(
    `/reviews/${reviewId}`,
    authOpts,
  );
}

/**
 * API-097: Lấy danh sách đánh giá [AUTH]
 *
 * @param params - page, size, sort, filter (SpringFilter DSL)
 *
 * Ví dụ filter: productId:'...' hoặc rating:4
 */
export function getReviews(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<AxiosResponse<PaginatedReviewsResponse>> {
  return httpService.get<PaginatedReviewsResponse>('/reviews', {
    ...authOpts,
    params,
  });
}

/**
 * API-098: Lấy đánh giá theo sản phẩm [AUTH]
 *
 * @param productId - UUID của sản phẩm
 * @param params - page, size
 */
export function getReviewsByProduct(
  productId: string,
  params?: { page?: number; size?: number },
): Promise<AxiosResponse<PaginatedReviewsResponse>> {
  return httpService.get<PaginatedReviewsResponse>(
    `/reviews/product/${productId}`,
    { ...authOpts, params },
  );
}

/**
 * API-099: Xóa đánh giá [AUTH]
 *
 * @param reviewId - UUID của đánh giá
 */
export function deleteReview(
  reviewId: string,
): Promise<AxiosResponse<ReviewVoidResponse>> {
  return httpService.delete<ReviewVoidResponse>(
    `/reviews/${reviewId}`,
    authOpts,
  );
}
