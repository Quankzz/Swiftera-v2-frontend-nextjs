/**
 * Hub API service — Module 6: HUBS
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (API-040 → API-044)
 *
 * Dùng apiService.ts — KHÔNG dùng client.ts.
 * Service chỉ nhận payload đúng format API, không chứa UI logic.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/apiService';
import type {
  HubResponse,
  HubStaffResponse,
  PaginatedHubsResponse,
  CreateHubInput,
  UpdateHubInput,
  HubListParams,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-042: GET /hubs?page=1&size=10&filter=...
 * BE dùng 1-based pagination (currentPage bắt đầu từ 1).
 * Frontend dùng 0-based → cộng thêm 1 trước khi gửi lên.
 *
 * Ghi chú spec:
 *  - API này là PUBLIC (không cần token) nhưng dashboard gọi với auth header cũng không vấn đề
 *  - filter dùng SpringFilter DSL: "isActive:true", "city:'Hồ Chí Minh'"
 */
export function getHubsList(
  params?: HubListParams,
): Promise<PaginatedHubsResponse> {
  const { page, ...rest } = params ?? {};
  return apiGet<PaginatedHubsResponse>('/hubs', {
    params: {
      ...rest,
      // 0-based FE → 1-based BE (BE KHÔNG có page 0)
      ...(page !== undefined ? { page: page + 1 } : {}),
    } as Record<string, string | number | boolean | undefined | null>,
  });
}

/**
 * API-041: GET /hubs/{hubId}
 * Lấy chi tiết hub theo ID
 */
export function getHubById(hubId: string): Promise<HubResponse> {
  return apiGet<HubResponse>(`/hubs/${hubId}`);
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
export function createHub(payload: CreateHubInput): Promise<HubResponse> {
  return apiPost<HubResponse>('/hubs', payload);
}

/**
 * API-043: PATCH /hubs/{hubId}
 * Cập nhật hub (partial)
 * Tất cả field optional, có thể update isActive để toggle
 */
export function updateHub(
  hubId: string,
  payload: UpdateHubInput,
): Promise<HubResponse> {
  return apiPatch<HubResponse>(`/hubs/${hubId}`, payload);
}

/**
 * API-044: DELETE /hubs/{hubId}
 * Xóa hub
 */
export function deleteHub(hubId: string): Promise<null> {
  return apiDelete<null>(`/hubs/${hubId}`);
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
export function getHubStaff(
  hubId: string,
  activeOnly = false,
): Promise<HubStaffResponse[]> {
  return apiGet<HubStaffResponse[]>(`/hubs/${hubId}/staff`, {
    params: { activeOnly } as Record<string, boolean>,
  });
}
