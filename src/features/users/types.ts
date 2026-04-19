/**
 * Users module types - source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *
 * Tất cả field dùng camelCase theo JSON từ BE spec.
 * Không đoán field - chỉ dùng field có trong spec.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared / Nested Types
// ─────────────────────────────────────────────────────────────────────────────

/** Role object trả về trong user responses */
export interface RoleSecured {
  roleId: string;
  name: string;
  description: string | null;
  active: boolean;
}

/**
 * Role tóm tắt trả về trong danh sách users (API-015 GET /users).
 * KHÔNG có roleId - chỉ có name, description, active.
 */
export interface RoleSummary {
  name: string;
  description: string | null;
  active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UserSecureResponse - trả về cho self-service endpoints:
 *  - API-006: GET /auth/account
 *  - API-010: PATCH /users/update-profile
 *  - API-011: PUT /users/update-password
 *  - API-013: POST /users/verify-change-email
 *  - API-019: POST /users/staff-requests
 */
export interface UserSecureResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  biography: string | null;
  avatarUrl: string | null;
  city: string | null;
  nationality: string | null;
  rolesSecured: RoleSecured[];
  createdAt: string;
  updatedAt: string;
}

/**
 * UserResponse - trả về cho admin endpoints:
 *  - API-014: GET /users/{userId}
 *  - API-015: GET /users (list, trong content[])
 *  - API-016: PATCH /users/{userId}
 *
 * Giống UserSecureResponse nhưng thêm isVerified và roles kèm permissions.
 * NOTE:
 *  - API-015 (list) trả `roles[]` (RoleSummary - không có roleId)
 *  - API-014 (detail) trả `rolesSecured[]` (RoleSecured - có roleId)
 */
export interface UserResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  biography: string | null;
  avatarUrl: string | null;
  city: string | null;
  nationality: string | null;
  isVerified?: boolean;
  /** Có trong list response (API-015) - không có roleId */
  roles?: RoleSummary[];
  /** Có trong detail response (API-014) - có roleId */
  rolesSecured?: RoleSecured[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated users response - API-015: GET /users
 */
export interface PaginatedUsersResponse {
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  content: UserResponse[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Input Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-010: PATCH /users/update-profile
 * Tất cả field tùy chọn
 */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  avatarUrl?: string | null;
  biography?: string;
  city?: string;
  nationality?: string;
}

/**
 * API-011: PUT /users/update-password
 */
export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * API-012: PUT /users/update-email
 */
export interface RequestChangeEmailInput {
  newEmail: string;
}

/**
 * API-013: POST /users/verify-change-email
 */
export interface VerifyChangeEmailInput {
  token: string;
}

/**
 * API-015: GET /users - query params
 * Dùng Spring pagination conventions: page (0-based), size, sort, filter
 */
export interface UserListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}

/**
 * API-016: PATCH /users/{userId} - admin update user
 * Tất cả field tùy chọn
 */
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nickname?: string;
  isVerified?: boolean;
  roleIds?: string[];
  /** URL avatar mới (sau khi upload qua Files API) */
  avatarUrl?: string | null;
}

/**
 * API-018: DELETE /users/{userId}/roles - remove roles from user
 */
export interface RemoveUserRolesInput {
  roleIds: string[];
}
