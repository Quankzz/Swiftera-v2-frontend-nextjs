/**
 * Hub API service - Module 6: HUBS
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (API-040 → API-044)
 *
 * HTTP layer: httpService (axios) - dùng http.ts.
 * Service chỉ nhận payload đúng format API, không chứa UI logic.
 */

import { httpService } from '@/api/http';
import type { ApiResponse, PaginationResponse } from '@/types/api.types';
import type {
  HubResponse,
  HubStaffResponse,
  PaginatedHubsResponse,
  AssignProductsToHubInput,
  CreateHubInput,
  UpdateHubInput,
  HubListParams,
} from '../types';
import type { ProductResponse } from '@/features/products/types';
import type { InventoryItemResponse } from '@/features/products/types';

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-042: GET /hubs?page=1&size=10&filter=...
 * BE dùng 1-based pagination (currentPage bắt đầu từ 1).
 *
 * Ghi chú spec:
 *  - API này là PUBLIC (không cần token) nhưng dashboard gọi với auth header cũng không vấn đề
 *  - filter dùng SpringFilter DSL: "isActive:true", "city:'Hồ Chí Minh'"
 */
export async function getHubsList(
  params?: HubListParams,
): Promise<PaginatedHubsResponse> {
  const res = await httpService.get<ApiResponse<PaginatedHubsResponse>>(
    '/hubs',
    { params },
  );
  return res.data.data!;
}

/**
 * API-041: GET /hubs/{hubId}
 * Lấy chi tiết hub theo ID
 */
export async function getHubById(hubId: string): Promise<HubResponse> {
  const res = await httpService.get<ApiResponse<HubResponse>>(`/hubs/${hubId}`);
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-040: POST /hubs
 * Tạo hub mới
 *
 * Required: code, name
 * Optional: addressLine, ward, district, city, latitude, longitude, phone
 */
export async function createHub(payload: CreateHubInput): Promise<HubResponse> {
  const res = await httpService.post<ApiResponse<HubResponse>>(
    '/hubs',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-043: PATCH /hubs/{hubId}
 * Cập nhật hub (partial)
 * Tất cả field optional, có thể update isActive để toggle
 */
export async function updateHub(
  hubId: string,
  payload: UpdateHubInput,
): Promise<HubResponse> {
  const res = await httpService.patch<ApiResponse<HubResponse>>(
    `/hubs/${hubId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-044: DELETE /hubs/{hubId}
 * Xóa hub
 */
export async function deleteHub(hubId: string): Promise<null> {
  await httpService.delete(`/hubs/${hubId}`, authOpts);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-043 (staff): GET /hubs/{hubId}/staff?activeOnly=false
 * Lấy danh sách nhân viên thuộc hub.
 *
 * Response: plain array (không paginated).
 * activeOnly=false → trả về tất cả nhân viên kể cả chưa xác thực.
 */
export async function getHubStaff(
  hubId: string,
  activeOnly = false,
): Promise<HubStaffResponse[]> {
  const res = await httpService.get<ApiResponse<HubStaffResponse[]>>(
    `/hubs/${hubId}/staff`,
    { ...authOpts, params: { activeOnly } },
  );
  return res.data.data!;
}

/**
 * API-043 (products): GET /hubs/{hubId}/products?page=1&size=20&filter=...
 * Lấy danh sách sản phẩm thuộc hub (qua inventory items).
 * filter dùng SpringFilter DSL.
 */
export async function getHubProducts(
  hubId: string,
  params?: { page?: number; size?: number; filter?: string; sort?: string },
): Promise<PaginationResponse<ProductResponse>> {
  const res = await httpService.get<ApiResponse<PaginationResponse<ProductResponse>>>(
    `/hubs/${hubId}/products`,
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-043 (inventory): GET /hubs/{hubId}/inventory-items?page=1&size=20&filter=...
 * Lấy danh sách inventory items thuộc hub.
 * filter dùng SpringFilter DSL: "status:'AVAILABLE'", "product.name~~'*laptop*'"
 */
export async function getHubInventoryItems(
  hubId: string,
  params?: { page?: number; size?: number; filter?: string; sort?: string },
): Promise<PaginationResponse<InventoryItemResponse>> {
  const res = await httpService.get<ApiResponse<PaginationResponse<InventoryItemResponse>>>(
    `/hubs/${hubId}/inventory-items`,
    { ...authOpts, params },
  );
  return res.data.data!;
}

export async function assignProductsToHub(
  hubId: string,
  payload: AssignProductsToHubInput,
): Promise<void> {
  await httpService.patch<ApiResponse<null>>(
    `/hubs/${hubId}/assign-products`,
    payload,
    authOpts,
  );
}

export async function unassignProductsFromHub(
  hubId: string,
  payload: AssignProductsToHubInput,
): Promise<void> {
  await httpService.patch<ApiResponse<null>>(
    `/hubs/${hubId}/unassign-products`,
    payload,
    authOpts,
  );
}
