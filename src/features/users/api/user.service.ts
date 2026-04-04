/**
 * User service — tất cả API calls cho users module.
 * Dùng apiService.ts làm HTTP layer, KHÔNG dùng client.ts.
 *
 * Chia thành 3 section:
 *  1. Profile / self-service
 *  2. Admin / user management
 *  3. Staff request
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 2: USERS)
 */

import { apiGet, apiPatch, apiPut, apiPost, apiDelete } from '@/api/apiService';

import type {
  UserSecureResponse,
  UserResponse,
  PaginatedUsersResponse,
  UpdateProfileInput,
  UpdatePasswordInput,
  RequestChangeEmailInput,
  VerifyChangeEmailInput,
  UserListParams,
  UpdateUserInput,
  RemoveUserRolesInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Profile / Self-service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-006: Lấy thông tin tài khoản hiện tại
 * GET /auth/account [AUTH]
 */
export function getMyProfile(): Promise<UserSecureResponse> {
  return apiGet<UserSecureResponse>('/auth/account');
}

/**
 * API-010: Cập nhật hồ sơ cá nhân
 * PATCH /users/update-profile [AUTH]
 */
export function updateProfile(
  payload: UpdateProfileInput,
): Promise<UserSecureResponse> {
  return apiPatch<UserSecureResponse>('/users/update-profile', payload);
}

/**
 * API-011: Đổi mật khẩu
 * PUT /users/update-password [AUTH]
 */
export function updatePassword(
  payload: UpdatePasswordInput,
): Promise<UserSecureResponse> {
  return apiPut<UserSecureResponse>('/users/update-password', payload);
}

/**
 * API-012: Yêu cầu đổi email
 * PUT /users/update-email [AUTH]
 */
export function requestChangeEmail(
  payload: RequestChangeEmailInput,
): Promise<null> {
  return apiPut<null>('/users/update-email', payload);
}

/**
 * API-013: Xác thực token đổi email
 * POST /users/verify-change-email [AUTH]
 */
export function verifyChangeEmail(
  payload: VerifyChangeEmailInput,
): Promise<UserSecureResponse> {
  return apiPost<UserSecureResponse>('/users/verify-change-email', payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin / User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-014: Lấy thông tin user theo ID
 * GET /users/{userId} [AUTH]
 */
export function getUserById(userId: string): Promise<UserResponse> {
  return apiGet<UserResponse>(`/users/${userId}`);
}

/**
 * API-015: Lấy danh sách user
 * GET /users?page=0&size=10&sort=createdAt,desc&filter=... [AUTH]
 */
export function getUsers(
  params?: UserListParams,
): Promise<PaginatedUsersResponse> {
  return apiGet<PaginatedUsersResponse>('/users', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * API-016: Cập nhật user (admin)
 * PATCH /users/{userId} [AUTH]
 */
export function updateUser(
  userId: string,
  payload: UpdateUserInput,
): Promise<UserResponse> {
  return apiPatch<UserResponse>(`/users/${userId}`, payload);
}

/**
 * API-017: Xóa tài khoản user
 * DELETE /users/{userId} [AUTH]
 */
export function deleteUser(userId: string): Promise<null> {
  return apiDelete<null>(`/users/${userId}`);
}

/**
 * API-018: Xóa vai trò khỏi user
 * DELETE /users/{userId}/roles [AUTH]
 * NOTE: API cần body trong DELETE request
 */
export function removeUserRoles(
  userId: string,
  payload: RemoveUserRolesInput,
): Promise<null> {
  return apiDelete<null>(`/users/${userId}/roles`, payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Staff Request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-019: Yêu cầu nâng cấp lên STAFF
 * POST /users/staff-requests [AUTH]
 * Không có request body
 */
export function requestStaffUpgrade(): Promise<UserSecureResponse> {
  return apiPost<UserSecureResponse>('/users/staff-requests');
}
