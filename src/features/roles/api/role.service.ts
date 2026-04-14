/**
 * Role & Permission service — tất cả API calls.
 * HTTP layer: httpService (axios) — dùng http.ts.
 *
 * Module 3: ROLES  (API-020 → API-025)
 * Module 4: PERMISSIONS (API-026 → API-033)
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';

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

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// Module 3: ROLES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-020: Tạo vai trò mới
 * POST /roles
 */
export async function createRole(
  payload: CreateRoleInput,
): Promise<RoleResponse> {
  const res = await httpService.post<ApiResponse<RoleResponse>>(
    '/roles',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-021: Lấy thông tin vai trò theo ID
 * GET /roles/{roleId}
 */
export async function getRoleById(roleId: string): Promise<RoleResponse> {
  const res = await httpService.get<ApiResponse<RoleResponse>>(
    `/roles/${roleId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-022: Lấy danh sách vai trò
 * GET /roles?page=0&size=10
 */
export async function getRoles(
  params?: RoleListParams,
): Promise<PaginatedRolesResponse> {
  const res = await httpService.get<ApiResponse<PaginatedRolesResponse>>(
    '/roles',
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-023: Cập nhật vai trò
 * PATCH /roles/{roleId}
 */
export async function updateRole(
  roleId: string,
  payload: UpdateRoleInput,
): Promise<RoleResponse> {
  const res = await httpService.patch<ApiResponse<RoleResponse>>(
    `/roles/${roleId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-024: Xóa permission khỏi vai trò
 * DELETE /roles/{roleId}/permissions
 */
export async function removeRolePermissions(
  roleId: string,
  payload: RemoveRolePermissionsInput,
): Promise<null> {
  await httpService.delete(`/roles/${roleId}/permissions`, {
    ...authOpts,
    data: payload,
  });
  return null;
}

/**
 * API-025: Xóa vai trò
 * DELETE /roles/{roleId}
 */
export async function deleteRole(roleId: string): Promise<null> {
  await httpService.delete(`/roles/${roleId}`, authOpts);
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module 4: PERMISSIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-026: Tạo module cho nhóm permission
 * POST /permissions/module
 */
export async function createPermissionModule(
  payload: CreateModuleInput,
): Promise<PermissionResponse[]> {
  const res = await httpService.post<ApiResponse<PermissionResponse[]>>(
    '/permissions/module',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-027: Xóa module theo tên
 * DELETE /permissions/module/{name}
 */
export async function deletePermissionModule(name: string): Promise<null> {
  await httpService.delete(`/permissions/module/${name}`, authOpts);
  return null;
}

/**
 * API-028: Lấy danh sách tên module
 * GET /permissions/modules
 */
export async function getModules(): Promise<string[]> {
  const res = await httpService.get<ApiResponse<string[]>>(
    '/permissions/modules',
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-029: Tạo permission mới
 * POST /permissions
 */
export async function createPermission(
  payload: CreatePermissionInput,
): Promise<PermissionResponse> {
  const res = await httpService.post<ApiResponse<PermissionResponse>>(
    '/permissions',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-030: Cập nhật permission
 * PATCH /permissions/{permissionId}
 */
export async function updatePermission(
  permissionId: string,
  payload: UpdatePermissionInput,
): Promise<PermissionResponse> {
  const res = await httpService.patch<ApiResponse<PermissionResponse>>(
    `/permissions/${permissionId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-031: Lấy permission theo ID
 * GET /permissions/{permissionId}
 */
export async function getPermissionById(
  permissionId: string,
): Promise<PermissionResponse> {
  const res = await httpService.get<ApiResponse<PermissionResponse>>(
    `/permissions/${permissionId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-032: Lấy danh sách permission
 * GET /permissions?page=0&size=20&filter=module:'CART'
 */
export async function getPermissions(
  params?: PermissionListParams,
): Promise<PaginatedPermissionsResponse> {
  const res = await httpService.get<ApiResponse<PaginatedPermissionsResponse>>(
    '/permissions',
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-033: Xóa permission
 * DELETE /permissions/{permissionId}
 */
export async function deletePermission(permissionId: string): Promise<null> {
  await httpService.delete(`/permissions/${permissionId}`, authOpts);
  return null;
}
