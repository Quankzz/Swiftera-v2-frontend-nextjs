/**
 * Role & Permission service — tất cả API calls.
 * Dùng apiService.ts làm HTTP layer, KHÔNG dùng client.ts.
 *
 * Module 3: ROLES  (API-020 → API-025)
 * Module 4: PERMISSIONS (API-026 → API-033)
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/apiService';

import type {
  RoleResponse,
  PaginatedRolesResponse,
  CreateRoleInput,
  UpdateRoleInput,
  RemoveRolePermissionsInput,
  RoleListParams,
  PermissionResponse,
  PaginatedPermissionsResponse,
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionListParams,
  CreateModuleInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Module 3: ROLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-020: Tạo vai trò mới
 * POST /roles
 */
export function createRole(payload: CreateRoleInput): Promise<RoleResponse> {
  return apiPost<RoleResponse>('/roles', payload);
}

/**
 * API-021: Lấy thông tin vai trò theo ID
 * GET /roles/{roleId}
 */
export function getRoleById(roleId: string): Promise<RoleResponse> {
  return apiGet<RoleResponse>(`/roles/${roleId}`);
}

/**
 * API-022: Lấy danh sách vai trò
 * GET /roles?page=0&size=10
 */
export function getRoles(
  params?: RoleListParams,
): Promise<PaginatedRolesResponse> {
  return apiGet<PaginatedRolesResponse>('/roles', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * API-023: Cập nhật vai trò
 * PATCH /roles/{roleId}
 */
export function updateRole(
  roleId: string,
  payload: UpdateRoleInput,
): Promise<RoleResponse> {
  return apiPatch<RoleResponse>(`/roles/${roleId}`, payload);
}

/**
 * API-024: Xóa permission khỏi vai trò
 * DELETE /roles/{roleId}/permissions
 */
export function removeRolePermissions(
  roleId: string,
  payload: RemoveRolePermissionsInput,
): Promise<null> {
  return apiDelete<null>(`/roles/${roleId}/permissions`, payload);
}

/**
 * API-025: Xóa vai trò
 * DELETE /roles/{roleId}
 */
export function deleteRole(roleId: string): Promise<null> {
  return apiDelete<null>(`/roles/${roleId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 4: PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-026: Tạo module cho nhóm permission
 * POST /permissions/module
 */
export function createPermissionModule(
  payload: CreateModuleInput,
): Promise<PermissionResponse[]> {
  return apiPost<PermissionResponse[]>('/permissions/module', payload);
}

/**
 * API-027: Xóa module theo tên
 * DELETE /permissions/module/{name}
 */
export function deletePermissionModule(name: string): Promise<null> {
  return apiDelete<null>(`/permissions/module/${name}`);
}

/**
 * API-028: Lấy danh sách tên module
 * GET /permissions/modules
 */
export function getModules(): Promise<string[]> {
  return apiGet<string[]>('/permissions/modules');
}

/**
 * API-029: Tạo permission mới
 * POST /permissions
 */
export function createPermission(
  payload: CreatePermissionInput,
): Promise<PermissionResponse> {
  return apiPost<PermissionResponse>('/permissions', payload);
}

/**
 * API-030: Cập nhật permission
 * PATCH /permissions/{permissionId}
 */
export function updatePermission(
  permissionId: string,
  payload: UpdatePermissionInput,
): Promise<PermissionResponse> {
  return apiPatch<PermissionResponse>(`/permissions/${permissionId}`, payload);
}

/**
 * API-031: Lấy permission theo ID
 * GET /permissions/{permissionId}
 */
export function getPermissionById(
  permissionId: string,
): Promise<PermissionResponse> {
  return apiGet<PermissionResponse>(`/permissions/${permissionId}`);
}

/**
 * API-032: Lấy danh sách permission
 * GET /permissions?page=0&size=20&filter=module:'CART'
 */
export function getPermissions(
  params?: PermissionListParams,
): Promise<PaginatedPermissionsResponse> {
  return apiGet<PaginatedPermissionsResponse>('/permissions', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * API-033: Xóa permission
 * DELETE /permissions/{permissionId}
 */
export function deletePermission(permissionId: string): Promise<null> {
  return apiDelete<null>(`/permissions/${permissionId}`);
}
