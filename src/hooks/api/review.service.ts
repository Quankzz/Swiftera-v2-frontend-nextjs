/**
 * Review API service - dùng cho TanStack Query hooks
 * Module 15: REVIEWS (API-095 → API-099)
 */

import type { AxiosResponse } from "axios";
import { httpService } from "@/api/http";
import type {
  CreateReviewInput,
  ReviewSingleResponse,
  ReviewVoidResponse,
  ReviewListResponse,
  ProductReviewResponse,
} from "@/api/reviews";

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
  params?: { page?: number; size?: number; rating?: number },
): Promise<NormalizedPaginatedReviews> {
  // API /reviews/product/{productId} chỉ hỗ trợ page/size.
  // Rating filter cần xử lý ở phía FE để tránh sai lệch dữ liệu.
  const queryParams: Record<string, string | number> = {};
  if (typeof params?.page === "number") {
    queryParams.page = params.page;
  }
  if (typeof params?.size === "number") {
    queryParams.size = params.size;
  }
  const res = await httpService.get<ReviewListResponse>(
    `/reviews/product/${productId}`,
    { params: queryParams },
  );
  return normalize(res);
}

export async function getReviews(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<NormalizedPaginatedReviews> {
  const res = await httpService.get<ReviewListResponse>("/reviews", {
    ...authOpts,
    params,
  });
  return normalize(res);
}

/**
 * Kiểm tra user hiện tại đã đánh giá sản phẩm này chưa.
 * API-098: chỉ gọi theo productId; `userId` dùng để chọn đúng bản ghi trong `content`, không gửi lên URL.
 */
export async function getMyReviewForProduct(
  productId: string,
  userId: string,
): Promise<ProductReviewResponse | null> {
  const { items } = await getReviewsByProduct(productId, {
    page: 1,
    size: 100,
  });
  return items.find((r) => r.userId === userId) ?? null;
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
    "/reviews",
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

export async function markHelpful(
  reviewId: string,
): Promise<ProductReviewResponse> {
  const res = await httpService.post<ReviewSingleResponse>(
    `/reviews/${reviewId}/helpful`,
    {},
    authOpts,
  );
  return res.data.data;
}
