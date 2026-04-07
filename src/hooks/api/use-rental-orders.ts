/**
 * Rental Orders hooks — TanStack Query
 * Module 12: RENTAL ORDERS (API-074 → API-085, API-089)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalOrderKeys } from './rental-order.keys';
import {
  getMyRentalOrders,
  getRentalOrderById,
  createRentalOrder,
  updateRentalOrderStatus,
  cancelRentalOrder,
  extendRentalOrder,
  initiatePayment,
} from './rental-order.service';
import type {
  CreateRentalOrderInput,
  UpdateOrderStatusInput,
  ExtendOrderInput,
} from '@/api/rentalOrderApi';

// ─── Query ──────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách đơn thuê của tôi [AUTH]
 * Dùng cho trang /rental-orders
 */
export function useMyOrdersQuery(params?: {
  page?: number;
  size?: number;
  filter?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: rentalOrderKeys.myList(params),
    queryFn: () => getMyRentalOrders(params),
    staleTime: 15_000,
    retry: false,
  });
}

/**
 * Lấy chi tiết đơn thuê [AUTH]
 * Dùng cho trang /rental-orders/[id]
 */
export function useRentalOrderQuery(rentalOrderId: string) {
  return useQuery({
    queryKey: rentalOrderKeys.detail(rentalOrderId),
    queryFn: () => getRentalOrderById(rentalOrderId),
    enabled: !!rentalOrderId,
    staleTime: 15_000,
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Tạo đơn thuê [AUTH]
 * Dùng cho checkout flow
 */
export function useCreateRentalOrder(options?: {
  onSuccess?: (data: { rentalOrderId: string }) => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRentalOrderInput) => {
      return createRentalOrder(input);
    },

    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: rentalOrderKeys.myList() });
      options?.onSuccess?.({ rentalOrderId: data.rentalOrderId });
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Cập nhật trạng thái đơn thuê [AUTH]
 */
export function useUpdateOrderStatus(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentalOrderId,
      input,
    }: {
      rentalOrderId: string;
      input: UpdateOrderStatusInput;
    }) => {
      return updateRentalOrderStatus(rentalOrderId, input);
    },

    onSuccess: (_, variables) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: rentalOrderKeys.myList() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hủy đơn thuê [AUTH]
 */
export function useCancelOrder(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rentalOrderId: string) => {
      await cancelRentalOrder(rentalOrderId);
    },

    onSuccess: (_, rentalOrderId) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: rentalOrderKeys.myList() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Gia hạn đơn thuê [AUTH]
 */
export function useExtendOrder(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rentalOrderId,
      input,
    }: {
      rentalOrderId: string;
      input: ExtendOrderInput;
    }) => {
      return extendRentalOrder(rentalOrderId, input);
    },

    onSuccess: (_, variables) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: rentalOrderKeys.myList() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Tạo link thanh toán VNPay [AUTH] — API-089
 */
export function useInitiatePayment(options?: {
  onSuccess?: (paymentUrl: string) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async (rentalOrderId: string) => {
      return initiatePayment(rentalOrderId);
    },

    onSuccess: (paymentUrl) => {
      options?.onSuccess?.(paymentUrl);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
