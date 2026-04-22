/**
 * Reviews hooks - TanStack Query
 * Module 15: REVIEWS (API-095 → API-100)
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { reviewKeys } from "./review.keys";
import {
  getReviewsByProduct,
  getReviews,
  getMyReviewForProduct,
  getReviewById,
  createReview,
  deleteReview,
  markHelpful,
} from "./review.service";
import type { CreateReviewInput } from "@/api/reviews";

// ─── Query ──────────────────────────────────────────────────────────────────

/**
 * Lấy đánh giá theo sản phẩm [AUTH]
 * Dùng cho trang chi tiết sản phẩm
 */
export function useProductReviewsQuery(
  productId: string,
  params?: { page?: number; size?: number; rating?: number },
) {
  return useQuery({
    queryKey: reviewKeys.byProduct(productId, params),
    queryFn: () => getReviewsByProduct(productId, params),
    enabled: !!productId,
    staleTime: 3 * 60_000,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
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
    staleTime: 3 * 60_000,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
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
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}

/**
 * Kiểm tra user hiện tại đã đánh giá sản phẩm này chưa [AUTH]
 *
 * @param productId - UUID sản phẩm
 * @param userId    - UUID user hiện tại (chỉ để khớp bản ghi sau khi gọi API-098, không đưa vào query)
 *
 * Trả về review nếu đã đánh giá, null nếu chưa.
 * Dùng để quyết định hiện form viết đánh giá hay không.
 */
export function useMyReviewForProductQuery(
  productId: string,
  userId: string | null,
) {
  return useQuery({
    queryKey: ["reviews", "my", productId, userId] as const,
    queryFn: () => getMyReviewForProduct(productId, userId!),
    enabled: !!productId && !!userId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
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
      void qc.invalidateQueries({
        queryKey: ["reviews", "my", variables.productId],
      });
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

/**
 * Đánh dấu đánh giá là hữu ích [AUTH]
 */
export function useMarkHelpfulReview(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      return markHelpful(reviewId);
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
