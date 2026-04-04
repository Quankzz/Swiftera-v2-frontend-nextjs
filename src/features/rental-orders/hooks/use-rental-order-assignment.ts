/**
 * Hooks cho assign flow — gán hub và gán nhân viên cho đơn thuê.
 *
 *  - useHubsForAssignQuery   → lấy danh sách hub active (GET /hubs)
 *  - useStaffForAssignQuery  → lấy danh sách staff (GET /users filter STAFF_ROLE)
 *  - useAssignHubMutation    → API-080: PATCH /rental-orders/{id}/assign-hub
 *  - useAssignStaffMutation  → API-081: PATCH /rental-orders/{id}/assign-staff
 *
 * NOTE về staff: BE spec không có endpoint riêng "staff by hub".
 * → Dùng GET /users với SpringFilter DSL để lấy users có STAFF_ROLE.
 * → Filter local theo search nếu cần.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalOrderKeys } from '../api/rental-order.keys';
import {
  assignHubToOrder,
  assignStaffToOrder,
  getStaffUsers,
} from '../api/rental-order.service';
import { apiGet } from '@/api/apiService';
import { toast } from 'sonner';
import type {
  RentalOrderResponse,
  AssignHubInput,
  AssignStaffInput,
  HubOption,
  StaffOption,
} from '../types';
import type { PaginatedData } from '@/api/apiService';

// ─────────────────────────────────────────────────────────────────────────────
// Hub query for assignment dialog
// ─────────────────────────────────────────────────────────────────────────────

interface HubListParams {
  page?: number;
  size?: number;
  filter?: string;
  sort?: string;
}

/**
 * Lấy danh sách hub (API-042: GET /hubs [PUBLIC])
 * Dùng trong assign-hub-dialog.
 */
export function useHubsForAssignQuery(params?: HubListParams) {
  return useQuery<PaginatedData<HubOption>>({
    queryKey: ['hubs', 'assign', params ?? {}],
    queryFn: () =>
      apiGet<PaginatedData<HubOption>>('/hubs', {
        params: params as Record<string, string | number | boolean | undefined>,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff query for assignment dialog
// ─────────────────────────────────────────────────────────────────────────────

interface StaffQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}

/**
 * Lấy danh sách staff để gán vào đơn.
 * Dùng GET /users với SpringFilter DSL.
 *
 * BE spec không có endpoint "staff by hub" — dùng filter để lấy staff
 * và hiển thị tất cả staff, user tự chọn.
 */
export function useStaffForAssignQuery(params?: StaffQueryParams) {
  return useQuery<PaginatedData<StaffOption>>({
    queryKey: ['users', 'staff-assign', params ?? {}],
    queryFn: () => getStaffUsers(params),
    staleTime: 2 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Assign Hub Mutation (API-080)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gán hub cho đơn thuê.
 * PATCH /rental-orders/{rentalOrderId}/assign-hub
 */
export function useAssignHubMutation() {
  const qc = useQueryClient();
  return useMutation<
    RentalOrderResponse,
    Error,
    { rentalOrderId: string; payload: AssignHubInput }
  >({
    mutationFn: ({ rentalOrderId, payload }) =>
      assignHubToOrder(rentalOrderId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      toast.success('Gán hub thành công');
    },
    onError: (error) => {
      toast.error(error.message || 'Gán hub thất bại');
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Assign Staff Mutation (API-081)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gán nhân viên cho đơn thuê.
 * PATCH /rental-orders/{rentalOrderId}/assign-staff
 */
export function useAssignStaffMutation() {
  const qc = useQueryClient();
  return useMutation<
    RentalOrderResponse,
    Error,
    { rentalOrderId: string; payload: AssignStaffInput }
  >({
    mutationFn: ({ rentalOrderId, payload }) =>
      assignStaffToOrder(rentalOrderId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: rentalOrderKeys.lists() });
      qc.invalidateQueries({
        queryKey: rentalOrderKeys.detail(variables.rentalOrderId),
      });
      toast.success('Gán nhân viên thành công');
    },
    onError: (error) => {
      toast.error(error.message || 'Gán nhân viên thất bại');
    },
  });
}
