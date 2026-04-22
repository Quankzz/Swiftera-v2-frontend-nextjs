/**
 * User service - tất cả API calls cho users module.
 * HTTP layer: httpService (axios) - dùng http.ts.
 *
 * Chia thành 3 section:
 *  1. Profile / self-service
 *  2. Admin / user management
 *  3. Staff request
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 2: USERS)
 */

import { httpService } from "@/api/http";
import type { ApiResponse } from "@/types/api.types";

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
} from "../types";

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Profile / Self-service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-006: Lấy thông tin tài khoản hiện tại
 * GET /auth/account [AUTH]
 */
export async function getMyProfile(): Promise<UserSecureResponse> {
  const res = await httpService.get<ApiResponse<UserSecureResponse>>(
    "/auth/account",
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-010: Cập nhật hồ sơ cá nhân
 * PATCH /users/update-profile [AUTH]
 */
export async function updateProfile(
  payload: UpdateProfileInput,
): Promise<UserSecureResponse> {
  const res = await httpService.patch<ApiResponse<UserSecureResponse>>(
    "/users/update-profile",
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-011: Đổi mật khẩu
 * PUT /users/update-password [AUTH]
 */
export async function updatePassword(
  payload: UpdatePasswordInput,
): Promise<UserSecureResponse> {
  const res = await httpService.put<ApiResponse<UserSecureResponse>>(
    "/users/update-password",
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-012: Yêu cầu đổi email
 * PUT /users/update-email [AUTH]
 */
export async function requestChangeEmail(
  payload: RequestChangeEmailInput,
): Promise<null> {
  await httpService.put("/users/update-email", payload, authOpts);
  return null;
}

/**
 * API-013: Xác thực token đổi email
 * POST /users/verify-change-email [AUTH]
 */
export async function verifyChangeEmail(
  payload: VerifyChangeEmailInput,
): Promise<UserSecureResponse> {
  const res = await httpService.post<ApiResponse<UserSecureResponse>>(
    "/users/verify-change-email",
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin / User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-014: Lấy thông tin user theo ID
 * GET /users/{userId} [AUTH]
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  const res = await httpService.get<ApiResponse<UserResponse>>(
    `/users/${userId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-015: Lấy danh sách user
 * GET /users?page=0&size=10&sort=createdAt,desc&filter=... [AUTH]
 */
export async function getUsers(
  params?: UserListParams,
): Promise<PaginatedUsersResponse> {
  const res = await httpService.get<ApiResponse<PaginatedUsersResponse>>(
    "/users",
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-016: Cập nhật user (admin)
 * PATCH /users/{userId} [AUTH]
 */
export async function updateUser(
  userId: string,
  payload: UpdateUserInput,
): Promise<UserResponse> {
  const res = await httpService.patch<ApiResponse<UserResponse>>(
    `/users/${userId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-017: Xóa tài khoản user
 * DELETE /users/{userId} [AUTH]
 */
export async function deleteUser(userId: string): Promise<null> {
  await httpService.delete(`/users/${userId}`, authOpts);
  return null;
}

/**
 * API-018: Xóa vai trò khỏi user
 * DELETE /users/{userId}/roles [AUTH]
 * NOTE: API cần body trong DELETE request
 */
export async function removeUserRoles(
  userId: string,
  payload: RemoveUserRolesInput,
): Promise<null> {
  await httpService.delete(`/users/${userId}/roles`, {
    ...authOpts,
    data: payload,
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Staff Request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-019: Yêu cầu nâng cấp lên STAFF
 * POST /users/staff-requests [AUTH]
 * Không có request body
 */
export async function requestStaffUpgrade(): Promise<UserSecureResponse> {
  const res = await httpService.post<ApiResponse<UserSecureResponse>>(
    "/users/staff-requests",
    {},
    authOpts,
  );
  return res.data.data!;
}
