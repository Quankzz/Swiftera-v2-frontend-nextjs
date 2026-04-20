/**
 * Hub management hooks - TanStack Query
 * Module 6: HUBS (API-040 → API-044)
 *
 * Gom toàn bộ hooks CRUD hub vào 1 file.
 * Error từ apiService/AppError đi xuyên suốt để UI hiển thị toast.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { hubKeys } from '../api/hub.keys';
import {
  getHubsList,
  getHubById,
  createHub,
  updateHub,
  deleteHub,
  getHubStaff,
  getHubProducts,
  getHubInventoryItems,
  assignProductsToHub,
  unassignProductsFromHub,
} from '../api/hub.service';
import type {
  HubListParams,
  CreateHubInput,
  UpdateHubInput,
  AssignProductsToHubInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useHubsQuery - phân trang danh sách hub (API-042)
 * staleTime 30s - danh sách hub thay đổi khi admin CRUD
 * placeholderData: keepPreviousData - giữ dữ liệu trang cũ khi chuyển trang
 * (tránh bug trang 1/2 trông giống nhau khi đang fetch)
 */
export function useHubsQuery(params?: HubListParams) {
  return useQuery({
    queryKey: hubKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => getHubsList(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * useHubQuery - chi tiết 1 hub (API-041)
 * Chỉ enabled khi có hubId
 */
export function useHubQuery(hubId?: string) {
  return useQuery({
    queryKey: hubKeys.detail(hubId ?? ''),
    queryFn: () => getHubById(hubId!),
    enabled: !!hubId,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useCreateHubMutation - tạo hub mới (API-040)
 * Invalidate toàn bộ list sau khi tạo.
 */
export function useCreateHubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHubInput) => createHub(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
    },
  });
}

/**
 * useUpdateHubMutation - cập nhật hub (API-043)
 * Invalidate list + detail của hub đó.
 */
export function useUpdateHubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hubId,
      payload,
    }: {
      hubId: string;
      payload: UpdateHubInput;
    }) => updateHub(hubId, payload),
    onSuccess: (_data, { hubId }) => {
      queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hubKeys.detail(hubId) });
    },
  });
}

/**
 * useDeleteHubMutation - xóa hub (API-044)
 * Invalidate toàn bộ list sau khi xóa.
 */
export function useDeleteHubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hubId: string) => deleteHub(hubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hubKeys.lists() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useHubStaffQuery - danh sách nhân viên theo hub (API-043 staff)
 * GET /hubs/{hubId}/staff?activeOnly=false
 *
 * Trả về plain array (không paginated).
 * Chỉ enabled khi có hubId.
 */
export function useHubStaffQuery(hubId?: string) {
  return useQuery({
    queryKey: hubKeys.staff(hubId ?? ''),
    queryFn: () => getHubStaff(hubId!, false),
    enabled: !!hubId,
    staleTime: 2 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Products & Inventory Items by Hub
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useHubProductsQuery - danh sách sản phẩm theo hub (API-043 products)
 * GET /hubs/{hubId}/products?page=1&size=20&filter=...
 *
 * Chỉ enabled khi có hubId.
 */
export function useHubProductsQuery(
  hubId?: string,
  params?: { page?: number; size?: number; filter?: string; sort?: string },
) {
  return useQuery({
    queryKey: hubKeys.products(hubId ?? '', params as Record<string, unknown> | undefined),
    queryFn: () => getHubProducts(hubId!, params),
    enabled: !!hubId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * useHubInventoryItemsQuery - danh sách inventory items theo hub (API-043 inventory)
 * GET /hubs/{hubId}/inventory-items?page=1&size=20&filter=...
 *
 * Chỉ enabled khi có hubId.
 */
export function useHubInventoryItemsQuery(
  hubId?: string,
  params?: { page?: number; size?: number; filter?: string; sort?: string },
) {
  return useQuery({
    queryKey: hubKeys.inventory(hubId ?? '', params as Record<string, unknown> | undefined),
    queryFn: () => getHubInventoryItems(hubId!, params),
    enabled: !!hubId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useAssignProductsToHubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hubId,
      payload,
    }: {
      hubId: string;
      payload: AssignProductsToHubInput;
    }) => assignProductsToHub(hubId, payload),
    onSuccess: (_data, { hubId }) => {
      queryClient.invalidateQueries({ queryKey: hubKeys.products(hubId) });
      queryClient.invalidateQueries({ queryKey: hubKeys.inventory(hubId) });
    },
  });
}

export function useUnassignProductsFromHubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hubId,
      payload,
    }: {
      hubId: string;
      payload: AssignProductsToHubInput;
    }) => unassignProductsFromHub(hubId, payload),
    onSuccess: (_data, { hubId }) => {
      queryClient.invalidateQueries({ queryKey: hubKeys.products(hubId) });
      queryClient.invalidateQueries({ queryKey: hubKeys.inventory(hubId) });
    },
  });
}
