/**
 * Hub module types - source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 * Module 6: HUBS (API-040 → API-044)
 *
 * Tất cả field dùng camelCase theo JSON từ BE spec.
 * Không đoán field - chỉ dùng field có trong spec.
 */

import type { PaginationResponse } from '@/types/api.types';

// ─────────────────────────────────────────────────────────────────────────────
// Response Types (API-040 response example)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HubResponse - trả về cho mọi endpoint hub.
 * Field map đúng từ BE spec (API-040 response example).
 *
 * NOTE:
 *  - `addressLine`, `ward`, `district`, `city` có thể null (optional field)
 *  - `latitude`, `longitude` có thể null
 *  - `phone` có thể null
 *  - `createdAt` / `updatedAt` là string format BE ("YYYY-MM-DD HH:MM:SS AM/PM")
 */
export interface HubResponse {
  hubId: string;
  code: string;
  name: string;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Response (API-042)
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedHubsResponse = PaginationResponse<HubResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// Query Params (API-042)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HubListParams - params cho GET /hubs
 * BE hỗ trợ: page (1-based), size, filter (SpringFilter DSL)
 *
 * NOTE: page ở đây là 0-based từ UI.
 * Service sẽ convert page + 1 trước khi gửi lên BE.
 */
export interface HubListParams {
  page?: number; // 0-based ở FE, service sẽ +1
  size?: number;
  filter?: string; // SpringFilter DSL: "isActive:true", "city:'Hồ Chí Minh'"
  sort?: string; // e.g. "name,asc" | "createdAt,desc"
}

// ─────────────────────────────────────────────────────────────────────────────
// Request / Input Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CreateHubInput - payload cho API-040 POST /hubs
 *
 * Required: code, name
 * Optional: addressLine, ward, district, city, latitude, longitude, phone
 */
export interface CreateHubInput {
  code: string;
  name: string;
  addressLine?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff Response (API-043: GET /hubs/{hubId}/staff)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HubStaffResponse - một nhân viên thuộc hub.
 * Trả về từ GET /api/v1/hubs/{hubId}/staff?activeOnly=false
 *
 * Response là plain array (không paginated).
 */
export interface HubStaffResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  hubId: string;
  hubCode: string;
  hubName: string;
}

/**
 * UpdateHubInput - payload cho API-043 PATCH /hubs/{hubId}
 * Tất cả field đều optional (partial update).
 * Có thêm `isActive` để toggle trạng thái.
 *
 * NOTE: `code` không có trong PATCH body theo spec.
 */
export interface UpdateHubInput {
  name?: string;
  addressLine?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  isActive?: boolean;
}
