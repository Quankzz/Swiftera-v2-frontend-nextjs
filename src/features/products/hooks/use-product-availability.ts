/**
 * useProductAvailabilityQuery
 * API-055-B: GET /api/v1/products/{productId}/availability
 *
 * Lấy tình trạng khả dụng của sản phẩm theo ngày giao và thời hạn thuê cụ thể.
 * Dùng khi user đang chọn ngày giao / số ngày thuê / màu sắc trên product detail.
 * KHÔNG CACHE - luôn fetch fresh để đảm bảo stock chính xác nhất có thể.
 */

import { useQuery } from '@tanstack/react-query';
import { productKeys } from '../api/product.keys';
import { getProductAvailability } from '../api/product.service';
import type {
  ProductAvailabilityParams,
  ProductAvailabilityResponse,
} from '../types';

export function useProductAvailabilityQuery(
  productId: string | undefined,
  params: ProductAvailabilityParams,
) {
  return useQuery<ProductAvailabilityResponse, Error>({
    queryKey: productKeys.availability(productId, params),
    queryFn: () => getProductAvailability(productId as string, params),
    enabled: !!productId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
