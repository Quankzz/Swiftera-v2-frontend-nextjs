/**
 * Reviews hooks — TanStack Query
 * Module 15: REVIEWS (API-095 → API-099)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewKeys } from './review.keys';
import {
  getReviewsByProduct,
  getReviews,
  getReviewById,
  createReview,
  deleteReview,
} from './review.service';
import type { CreateReviewInput } from '@/api/reviews';

// ─── Query ──────────────────────────────────────────────────────────────────

/**
 * Lấy đánh giá theo sản phẩm [AUTH]
 * Dùng cho trang chi tiết sản phẩm
 */
export function useProductReviewsQuery(
  productId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId, params),
    queryFn: () => getReviewsByProduct(productId, params),
    enabled: !!productId,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Lấy danh sách đánh giá [AUTH]
 */
export function useReviewsQuery(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => getReviews(params),
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Lấy đánh giá theo ID [AUTH]
 */
export function useReviewQuery(reviewId: string) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => getReviewById(reviewId),
    enabled: !!reviewId,
    staleTime: 30_000,
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Tạo đánh giá sản phẩm [AUTH]
 *
 * Lỗi: REVIEW_ALREADY_EXISTS, REVIEW_ORDER_NOT_COMPLETED
 */
export function useCreateReview(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      return createReview(input);
    },

    onSuccess: (_, variables) => {
      void qc.invalidateQueries({
        queryKey: reviewKeys.byProduct(variables.productId),
      });
      void qc.invalidateQueries({ queryKey: reviewKeys.list() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Xóa đánh giá [AUTH]
 */
export function useDeleteReview(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      await deleteReview(reviewId);
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: reviewKeys.all });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
