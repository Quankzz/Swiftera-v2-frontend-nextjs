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
  completeRentalOrder,
  reportIssueRecall,
  getContractByOrder,
} from '../api/rental-order.service';
import { toast } from 'sonner';
import type {
  RentalOrderResponse,
  PaginatedRentalOrdersResponse,
  RentalOrderListParams,
  UpdateOrderStatusInput,
  ReportIssueInput,
  RentalContractResponse,
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

/**
 * Hoàn tất đơn thuê - PICKED_UP → COMPLETED (API-079)
 */
export function useCompleteOrderMutation() {
  const qc = useQueryClient();
  return useMutation<RentalOrderResponse, Error, string>({
    mutationFn: completeRentalOrder,
    onSuccess: (_, rentalOrderId) => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(rentalOrderId),
      });
      toast.success('Đơn thuê đã hoàn tất');
    },
    onError: (error) => {
      toast.error(error.message || 'Hoàn tất đơn thuê thất bại');
    },
  });
}

/**
 * Thu hồi sớm do sự cố - DELIVERED/IN_USE → PENDING_PICKUP (API-079, ADMIN only)
 */
export function useReportIssueMutation() {
  const qc = useQueryClient();
  return useMutation<
    RentalOrderResponse,
    Error,
    { rentalOrderId: string; payload: ReportIssueInput }
  >({
    mutationFn: ({ rentalOrderId, payload }) =>
      reportIssueRecall(rentalOrderId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      toast.success('Đã ghi nhận sự cố và yêu cầu thu hồi');
    },
    onError: (error) => {
      toast.error(error.message || 'Ghi nhận sự cố thất bại');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Contracts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-094: Lấy hợp đồng thuê theo đơn hàng
 * Chỉ fetch khi rentalOrderId có giá trị.
 */
export function useRentalOrderContractQuery(rentalOrderId: string | undefined) {
  return useQuery<RentalContractResponse>({
    enabled: !!rentalOrderId,
    queryKey: rentalOrderId
      ? rentalOrderKeys.contract(rentalOrderId)
      : rentalOrderKeys.contracts(),
    queryFn: () => getContractByOrder(rentalOrderId as string),
    staleTime: 60 * 1000,
    retry: false, // contract có thể chưa tồn tại
  });
}
