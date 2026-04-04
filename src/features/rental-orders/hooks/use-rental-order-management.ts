/**
 * Hooks chính cho rental orders dashboard:
 *  - useRentalOrdersQuery
 *  - useRentalOrderQuery
 *  - useUpdateOrderStatusMutation
 *  - useCancelOrderMutation
 *
 * Dùng TanStack Query + rental-order.service.ts + rental-order.keys.ts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalOrderKeys } from '../api/rental-order.keys';
import {
  getRentalOrders,
  getRentalOrderById,
  updateRentalOrderStatus,
  cancelRentalOrder,
} from '../api/rental-order.service';
import { toast } from 'sonner';
import type {
  RentalOrderResponse,
  PaginatedRentalOrdersResponse,
  RentalOrderListParams,
  UpdateOrderStatusInput,
} from '../types';

/**
 * Lấy danh sách đơn thuê (API-075)
 * Hỗ trợ SpringFilter DSL qua params.filter
 */
export function useRentalOrdersQuery(params?: RentalOrderListParams) {
  return useQuery<PaginatedRentalOrdersResponse>({
    queryKey: rentalOrderKeys.list(params),
    queryFn: () => getRentalOrders(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Lấy chi tiết đơn thuê theo ID (API-074)
 */
export function useRentalOrderQuery(rentalOrderId: string | undefined) {
  return useQuery<RentalOrderResponse>({
    enabled: !!rentalOrderId,
    queryKey: rentalOrderId
      ? rentalOrderKeys.detail(rentalOrderId)
      : rentalOrderKeys.details(),
    queryFn: () => getRentalOrderById(rentalOrderId as string),
    staleTime: 30 * 1000,
  });
}

/**
 * Cập nhật trạng thái đơn thuê (API-077)
 */
export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  return useMutation<
    RentalOrderResponse,
    Error,
    { rentalOrderId: string; payload: UpdateOrderStatusInput }
  >({
    mutationFn: ({ rentalOrderId, payload }) =>
      updateRentalOrderStatus(rentalOrderId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      toast.success('Cập nhật trạng thái đơn thuê thành công');
    },
    onError: (error) => {
      toast.error(error.message || 'Cập nhật trạng thái thất bại');
    },
  });
}

/**
 * Hủy đơn thuê (API-078)
 */
export function useCancelOrderMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: cancelRentalOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      toast.success('Đã hủy đơn thuê');
    },
    onError: (error) => {
      toast.error(error.message || 'Hủy đơn thuê thất bại');
    },
  });
}
