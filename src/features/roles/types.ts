/**
 * Roles & Permissions module types — source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *
 * Module 3: ROLES (API-020 → API-025)
 * Module 4: PERMISSIONS (API-026 → API-033)
 *
 * Tất cả field dùng camelCase theo JSON từ BE spec.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Permission Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PermissionResponse — trả về trong:
 *  - API-029 POST /permissions (create)
 *  - API-030 PATCH /permissions/{permissionId} (update)
 *  - API-031 GET /permissions/{permissionId}
 *  - API-032 GET /permissions?page=0&size=20 (list, trong content[])
 *  - Nested trong RoleResponse.permissions[]
 */
export interface PermissionResponse {
  permissionId: string;
  name: string;
  apiPath: string;
  httpMethod: string;
  module: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API-029: POST /permissions — tạo permission
 */
export interface CreatePermissionInput {
  name: string;
  apiPath: string;
  httpMethod: string;
  module: string;
}

/**
 * API-030: PATCH /permissions/{permissionId} — cập nhật permission (all optional)
 */
export interface UpdatePermissionInput {
  name?: string;
  apiPath?: string;
  httpMethod?: string;
  module?: string;
}

/**
 * API-032: GET /permissions — query params
 */
export interface PermissionListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}

/**
 * Paginated permissions response — API-032
 */
export interface PaginatedPermissionsResponse {
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  content: PermissionResponse[];
}

/**
 * API-026: POST /permissions/module — gán module cho permissions
 */
export interface CreateModuleInput {
  moduleName: string;
  permissionIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * RoleResponse — trả về trong:
 *  - API-020 POST /roles (create)
 *  - API-021 GET /roles/{roleId}
 *  - API-023 PATCH /roles/{roleId} (update)
 *  - API-022 GET /roles?page=0&size=10 (list, trong content[])
 */
export interface RoleResponse {
  roleId: string;
  name: string;
  description: string | null;
  active: boolean;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * API-022: GET /roles — paginated
 */
export interface PaginatedRolesResponse {
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  content: RoleResponse[];
}

/**
 * API-020: POST /roles — tạo vai trò
 */
export interface CreateRoleInput {
  name: string;
  description?: string | null;
  active: boolean;
  permissionIds?: string[];
}

/**
 * API-023: PATCH /roles/{roleId} — cập nhật vai trò (all optional)
 */
export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  active?: boolean;
  permissionIds?: string[];
}

/**
 * API-024: DELETE /roles/{roleId}/permissions — xóa permissions khỏi role
 */
export interface RemoveRolePermissionsInput {
  permissionIds: string[];
}

/**
 * API-022: GET /roles — query params
 */
export interface RoleListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}
