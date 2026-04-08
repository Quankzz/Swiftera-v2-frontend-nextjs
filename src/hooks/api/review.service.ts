/**
 * Review API service — dùng cho TanStack Query hooks
 * Module 15: REVIEWS (API-095 → API-099)
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';
import type {
  CreateReviewInput,
  ReviewSingleResponse,
  ReviewVoidResponse,
  ReviewListResponse,
  ProductReviewResponse,
} from '@/api/reviews';

const authOpts = { requireToken: true as const };

export interface NormalizedPaginatedReviews {
  items: ProductReviewResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

function normalize(
  res: AxiosResponse<ReviewListResponse>,
): NormalizedPaginatedReviews {
  const raw = res.data;
  return {
    items: raw.data.content ?? [],
    page: raw.data.meta?.currentPage ?? 1,
    size: raw.data.meta?.pageSize ?? 10,
    totalItems: raw.data.meta?.totalElements ?? 0,
    totalPages: raw.data.meta?.totalPages ?? 1,
  };
}

export async function getReviewsByProduct(
  productId: string,
  params?: { page?: number; size?: number },
): Promise<NormalizedPaginatedReviews> {
  const res = await httpService.get<ReviewListResponse>(
    `/reviews/product/${productId}`,
    { ...authOpts, params },
  );
  return normalize(res);
}

export async function getReviews(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<NormalizedPaginatedReviews> {
  const res = await httpService.get<ReviewListResponse>('/reviews', {
    ...authOpts,
    params,
  });
  return normalize(res);
}

/**
 * Kiểm tra user hiện tại đã đánh giá sản phẩm này chưa.
 * Dùng filter = productId + userId trên API-097.
 * Trả về review đã tồn tại, hoặc null nếu chưa đánh giá.
 */
export async function getMyReviewForProduct(
  productId: string,
  userId: string,
): Promise<ProductReviewResponse | null> {
  const res = await httpService.get<ReviewListResponse>('/reviews', {
    ...authOpts,
    params: {
      filter: `productId:'${productId}' and userId:'${userId}'`,
      size: 1,
    },
  });
  const items = res.data.data.content ?? [];
  return items.length > 0 ? items[0] : null;
}

export async function getReviewById(
  reviewId: string,
): Promise<ProductReviewResponse> {
  const res = await httpService.get<ReviewSingleResponse>(
    `/reviews/${reviewId}`,
    authOpts,
  );
  return res.data.data;
}

export async function createReview(
  input: CreateReviewInput,
): Promise<ProductReviewResponse> {
  const res = await httpService.post<ReviewSingleResponse>(
    '/reviews',
    input,
    authOpts,
  );
  return res.data.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await httpService.delete<ReviewVoidResponse>(
    `/reviews/${reviewId}`,
    authOpts,
  );
}
