/**
 * Hub API service — Module 6: HUBS
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (API-040 → API-044)
 *
 * HTTP layer: httpService (axios) — dùng http.ts.
 * Service chỉ nhận payload đúng format API, không chứa UI logic.
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type {
  HubResponse,
  HubStaffResponse,
  PaginatedHubsResponse,
  CreateHubInput,
  UpdateHubInput,
  HubListParams,
} from '../types';

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
