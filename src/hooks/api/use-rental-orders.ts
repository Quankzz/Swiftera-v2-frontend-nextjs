/**
 * Rental Orders hooks - TanStack Query
 * Module 12: RENTAL ORDERS (API-074 → API-086A)
 *
 * Lưu ý: initiatePayment đã chuyển sang Module 13 (useInitiatePayment trong use-payments.ts)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
  type NormalizedPaginatedOrders,
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
import { useAuth } from '@/hooks/useAuth';
import { buildLoginHref, getCurrentPathWithSearch } from '@/lib/auth-redirect';

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

function requireAuthForMutation(params: {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  router: { push: (href: string) => void };
  errorMessage: string;
  fallbackPath: string;
}): void {
  if (params.isAuthenticated) return;

  if (!params.isAuthLoading) {
    params.router.push(
      buildLoginHref(getCurrentPathWithSearch(params.fallbackPath)),
    );
  }

  throw new Error(
    params.isAuthLoading
      ? 'Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.'
      : params.errorMessage,
  );
}

function patchMyOrdersCaches(
  qc: QueryClient,
  rentalOrderId: string,
  updater: (order: RentalOrderResponse) => RentalOrderResponse,
): Array<[QueryKey, NormalizedPaginatedOrders | undefined]> {
  const snapshots = qc.getQueriesData<NormalizedPaginatedOrders>({
    queryKey: [...rentalOrderKeys.all, 'my'],
  });

  snapshots.forEach(([key, data]) => {
    if (!data) return;

    let changed = false;
    const items = data.items.map((order) => {
      if (order.rentalOrderId !== rentalOrderId) return order;
      changed = true;
      return updater(order);
    });

    if (changed) {
      qc.setQueryData<NormalizedPaginatedOrders>(key, {
        ...data,
        items,
      });
    }
  });

  return snapshots;
}

function restoreMyOrdersCaches(
  qc: QueryClient,
  snapshots: Array<[QueryKey, NormalizedPaginatedOrders | undefined]>,
) {
  snapshots.forEach(([key, data]) => {
    qc.setQueryData(key, data);
  });
}

function mergeOrderIntoMyOrdersCaches(
  qc: QueryClient,
  nextOrder: RentalOrderResponse,
) {
  qc.setQueriesData<NormalizedPaginatedOrders>(
    { queryKey: [...rentalOrderKeys.all, 'my'] },
    (data) => {
      if (!data) return data;

      let changed = false;
      const items = data.items.map((order) => {
        if (order.rentalOrderId !== nextOrder.rentalOrderId) return order;
        changed = true;
        return nextOrder;
      });

      if (!changed) return data;
      return { ...data, items };
    },
  );
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;

  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString();
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
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rentalOrderKeys.myList(params),
    queryFn: () => getMyRentalOrders(params),
    enabled: options?.enabled ?? true,
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateRentalOrderInput) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/cart',
        errorMessage: 'Vui lòng đăng nhập để tạo đơn thuê.',
      });

      return createRentalOrder(input);
    },

    onSuccess: (data) => {
      qc.setQueryData(rentalOrderKeys.detail(data.rentalOrderId), data);
      void qc.invalidateQueries({ queryKey: [...rentalOrderKeys.all, 'my'] });
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async ({
      rentalOrderId,
      input,
    }: {
      rentalOrderId: string;
      input: UpdateOrderStatusInput;
    }) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/rental-orders',
        errorMessage: 'Vui lòng đăng nhập để cập nhật trạng thái đơn thuê.',
      });

      return updateRentalOrderStatus(rentalOrderId, input);
    },

    onMutate: async (variables) => {
      await qc.cancelQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });

      const previousDetail = qc.getQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(variables.rentalOrderId),
      );
      const previousMyLists = patchMyOrdersCaches(
        qc,
        variables.rentalOrderId,
        (order) => ({ ...order, status: variables.input.status }),
      );

      qc.setQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(variables.rentalOrderId),
        (old) => {
          if (!old) return old;
          return { ...old, status: variables.input.status };
        },
      );

      return {
        previousDetail,
        previousMyLists,
      };
    },

    onSuccess: (data, variables) => {
      qc.setQueryData(rentalOrderKeys.detail(variables.rentalOrderId), data);
      mergeOrderIntoMyOrdersCaches(qc, data);

      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousDetail !== undefined) {
        qc.setQueryData(
          rentalOrderKeys.detail(variables.rentalOrderId),
          context.previousDetail,
        );
      }

      if (context?.previousMyLists) {
        restoreMyOrdersCaches(qc, context.previousMyLists);
      }

      options?.onError?.(error);
    },

    onSettled: (_data, _error, variables) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.overdueSuggestion(variables.rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: [...rentalOrderKeys.all, 'my'] });
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async (rentalOrderId: string) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/rental-orders',
        errorMessage: 'Vui lòng đăng nhập để hủy đơn thuê.',
      });

      await cancelRentalOrder(rentalOrderId);
    },

    onMutate: async (rentalOrderId) => {
      await qc.cancelQueries({ queryKey: rentalOrderKeys.detail(rentalOrderId) });

      const previousDetail = qc.getQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(rentalOrderId),
      );
      const previousMyLists = patchMyOrdersCaches(qc, rentalOrderId, (order) => ({
        ...order,
        status: 'CANCELLED',
      }));

      qc.setQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(rentalOrderId),
        (old) => {
          if (!old) return old;
          return { ...old, status: 'CANCELLED' };
        },
      );

      return {
        previousDetail,
        previousMyLists,
      };
    },

    onSuccess: () => {
      options?.onSuccess?.();
    },

    onError: (error: Error, rentalOrderId, context) => {
      if (context?.previousDetail !== undefined) {
        qc.setQueryData(
          rentalOrderKeys.detail(rentalOrderId),
          context.previousDetail,
        );
      }

      if (context?.previousMyLists) {
        restoreMyOrdersCaches(qc, context.previousMyLists);
      }

      options?.onError?.(error);
    },

    onSettled: (_data, _error, rentalOrderId) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: [...rentalOrderKeys.all, 'my'] });
    },
  });
}

/**
 * Gán nhân viên + hub cho đơn thuê [AUTH] - dùng cho dashboard staff
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
      void qc.invalidateQueries({ queryKey: [...rentalOrderKeys.all, 'my'] });
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
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useMutation({
    mutationFn: async ({
      rentalOrderId,
      input,
    }: {
      rentalOrderId: string;
      input: ExtendOrderInput;
    }) => {
      requireAuthForMutation({
        isAuthenticated,
        isAuthLoading,
        router,
        fallbackPath: '/rental-orders',
        errorMessage: 'Vui lòng đăng nhập để gia hạn đơn thuê.',
      });

      return extendRentalOrder(rentalOrderId, input);
    },

    onMutate: async (variables) => {
      await qc.cancelQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });

      const previousDetail = qc.getQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(variables.rentalOrderId),
      );
      const previousMyLists = patchMyOrdersCaches(
        qc,
        variables.rentalOrderId,
        (order) => ({
          ...order,
          expectedRentalEndDate: addDaysToIsoDate(
            order.expectedRentalEndDate,
            variables.input.additionalRentalDays,
          ),
        }),
      );

      qc.setQueryData<RentalOrderResponse>(
        rentalOrderKeys.detail(variables.rentalOrderId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            expectedRentalEndDate: addDaysToIsoDate(
              old.expectedRentalEndDate,
              variables.input.additionalRentalDays,
            ),
          };
        },
      );

      return {
        previousDetail,
        previousMyLists,
      };
    },

    onSuccess: (data, variables) => {
      qc.setQueryData(rentalOrderKeys.detail(variables.rentalOrderId), data);
      mergeOrderIntoMyOrdersCaches(qc, data);

      options?.onSuccess?.();
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousDetail !== undefined) {
        qc.setQueryData(
          rentalOrderKeys.detail(variables.rentalOrderId),
          context.previousDetail,
        );
      }

      if (context?.previousMyLists) {
        restoreMyOrdersCaches(qc, context.previousMyLists);
      }

      options?.onError?.(error);
    },

    onSettled: (_data, _error, variables) => {
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      void qc.invalidateQueries({
        queryKey: rentalOrderKeys.overdueSuggestion(variables.rentalOrderId),
      });
      void qc.invalidateQueries({ queryKey: [...rentalOrderKeys.all, 'my'] });
    },
  });
}
