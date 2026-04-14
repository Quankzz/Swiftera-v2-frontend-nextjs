/**
 * Hooks cho assign flow — gán hub và gán nhân viên cho đơn thuê.
 *
 *  - useHubsForAssignQuery      → lấy danh sách hub active (GET /hubs)
 *  - useHubStaffForAssignQuery  → lấy nhân viên theo hub (GET /hubs/{hubId}/staff)
 *  - useAssignHubMutation       → API-080: PATCH /rental-orders/{id}/assign-hub
 *  - useAssignStaffMutation     → API-081: PATCH /rental-orders/{id}/assign-staff
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rentalOrderKeys } from '../api/rental-order.keys';
import {
  assignHubToOrder,
  assignStaffToOrder,
  assignStaffToHub,
} from '../api/rental-order.service';
import { httpService } from '@/api/http';
import type { ApiResponse, PaginationResponse } from '@/types/api.types';
import { getHubStaff } from '@/features/hubs/api/hub.service';
import { hubKeys } from '@/features/hubs/api/hub.keys';
import { toast } from 'sonner';
import type {
  RentalOrderResponse,
  AssignHubInput,
  AssignStaffInput,
  AssignStaffToHubInput,
  HubOption,
} from '../types';
import type { HubStaffResponse } from '@/features/hubs/types';

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
  return useQuery<PaginationResponse<HubOption>>({
    queryKey: ['hubs', 'assign', params ?? {}],
    queryFn: async () => {
      const res = await httpService.get<
        ApiResponse<PaginationResponse<HubOption>>
      >('/hubs', { params });
      return res.data.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff query for assignment dialog (by hub)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách nhân viên thuộc hub được chọn.
 * Dùng GET /hubs/{hubId}/staff?activeOnly=false (API-043 staff endpoint).
 *
 * Response là plain array (không paginated).
 * Chỉ enabled khi có hubId.
 */
export function useHubStaffForAssignQuery(hubId: string | undefined) {
  return useQuery<HubStaffResponse[]>({
    queryKey: hubKeys.staff(hubId ?? ''),
    queryFn: () => getHubStaff(hubId!, false),
    enabled: !!hubId,
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

// ─────────────────────────────────────────────────────────────────────────────
// Assign Staff to Hub Mutation (API-120)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gán nhiều staff vào hub.
 * PATCH /hubs/{hubId}/assign-staff
 */
export function useAssignStaffToHubMutation() {
  const qc = useQueryClient();
  return useMutation<
    HubStaffResponse[],
    Error,
    { hubId: string; payload: AssignStaffToHubInput }
  >({
    mutationFn: ({ hubId, payload }) => assignStaffToHub(hubId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: hubKeys.staff(variables.hubId) });
      qc.invalidateQueries({ queryKey: hubKeys.lists() });
      toast.success('Gán nhân viên vào hub thành công');
    },
    onError: (error) => {
      toast.error(error.message || 'Gán nhân viên vào hub thất bại');
    },
  });
}
