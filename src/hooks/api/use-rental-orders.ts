/**
 * Rental Orders hooks — TanStack Query
 * Module 12: RENTAL ORDERS (API-074 → API-086A)
 *
 * Lưu ý: initiatePayment đã chuyển sang Module 13 (useInitiatePayment trong use-payments.ts)
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
  assignRentalOrder,
  getRentalOrders,
  getOverduePenaltySuggestion,
} from './rental-order.service';
import type {
  CreateRentalOrderInput,
  UpdateOrderStatusInput,
  ExtendOrderInput,
} from '@/api/rentalOrderApi';
import type {
  AssignOrderInput,
  RentalOrder,
  RentalOrderStatus,
} from '@/types/dashboard';
import type {
  RentalOrderResponse,
  RentalOrderStatus as ApiRentalOrderStatus,
} from '@/api/rentalOrderApi';

// ─── Status mapping helpers ───────────────────────────────────────────────

function mapApiStatusToDashboard(
  status: ApiRentalOrderStatus,
): RentalOrderStatus {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'PENDING';
    case 'PAID':
    case 'PREPARING':
      return 'CONFIRMED';
    case 'DELIVERING':
    case 'DELIVERED':
      return 'DELIVERING';
    case 'IN_USE':
      return 'ACTIVE';
    case 'PENDING_PICKUP':
    case 'PICKING_UP':
    case 'PICKED_UP':
      return 'RETURNING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
  }
}

function mapApiOrderToDashboard(o: RentalOrderResponse): RentalOrder {
  return {
    rentalOrderId: o.rentalOrderId,
    userId: o.userId,
    deliveryStaffId: o.deliveryStaff?.userId ?? null,
    pickupStaffId: o.pickupStaff?.userId ?? null,
    voucherId: null,
    deliveryRecipientName: o.deliveryRecipientName,
    deliveryPhone: o.deliveryPhone,
    deliveryAddressLine: o.deliveryAddressLine,
    deliveryWard: o.deliveryWard,
    deliveryDistrict: o.deliveryDistrict,
    deliveryCity: o.deliveryCity,
    deliveryNote: null,
    startDate: o.expectedDeliveryDate,
    endDate: o.expectedRentalEndDate,
    plannedDeliveryAt: o.plannedDeliveryAt,
    deliveredAt: o.actualDeliveryAt,
    plannedPickupAt: o.plannedPickupAt,
    pickedUpAt: o.pickedUpAt,
    placedAt: o.placedAt,
    status: mapApiStatusToDashboard(o.status),
    subtotalRentalFee: o.rentalSubtotalAmount,
    voucherCodeSnapshot: o.voucherCodeSnapshot,
    voucherDiscountAmount: o.voucherDiscountAmount,
    totalRentalFee: o.rentalFeeAmount,
    totalDeposit: o.depositHoldAmount,
    penaltyTotal: o.penaltyChargeAmount ?? 0,
    depositRefundedAmount: o.depositRefundAmount ?? 0,
    grandTotalPaid: o.totalPaidAmount,
    hubId: o.hubId,
    hubName: o.hubName,
    deliveryStaffName: o.deliveryStaff
      ? `${o.deliveryStaff.firstName} ${o.deliveryStaff.lastName}`.trim()
      : null,
    pickupStaffName: o.pickupStaff
      ? `${o.pickupStaff.firstName} ${o.pickupStaff.lastName}`.trim()
      : null,
    items: [],
  };
}

// ─── Query ──────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách đơn thuê (admin/staff) [AUTH]
 * Dùng cho dashboard quản trị
 */
export function useRentalOrdersQuery(params?: {
  page?: number;
  limit?: number;
  status?: RentalOrderStatus;
  search?: string;
}) {
  const apiParams = {
    page: params?.page,
    size: params?.limit,
    filter: params?.status ? `status:'${params.status}'` : undefined,
  };

  return useQuery({
    queryKey: rentalOrderKeys.list(params),
    queryFn: async () => {
      const result = await getRentalOrders(apiParams);
      return {
        data: result.items.map(mapApiOrderToDashboard),
        total: result.totalItems,
        page: result.page,
        totalPages: result.totalPages,
      };
    },
    staleTime: 15_000,
    retry: false,
  });
}

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

/**
 * API-086A: Đề xuất phí phạt quá hạn tạm tính (khi đơn đang thuê / thu hồi / sau thu hồi)
 */
export function useOverduePenaltySuggestionQuery(
  rentalOrderId: string,
  options?: { enabled?: boolean },
) {
  const enabled = !!rentalOrderId && (options?.enabled ?? true);

  return useQuery({
    queryKey: rentalOrderKeys.overdueSuggestion(rentalOrderId),
    queryFn: () => getOverduePenaltySuggestion(rentalOrderId),
    enabled,
    staleTime: 60_000,
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
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.overdueSuggestion(variables.rentalOrderId),
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
 * Gán nhân viên + hub cho đơn thuê [AUTH] — dùng cho dashboard staff
 */
export function useAssignOrderMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: AssignOrderInput;
    }) => {
      return assignRentalOrder(id, input);
    },

    onSuccess: (_, variables) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.id),
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
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.overdueSuggestion(variables.rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: rentalOrderKeys.myList() });
      options?.onSuccess?.();
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
