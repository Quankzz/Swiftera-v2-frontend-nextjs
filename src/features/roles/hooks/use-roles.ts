/**
 * Hooks cho roles & permissions module.
 * Dùng TanStack Query v5.
 *
 * ── Roles ──
 *  - useRolesListQuery           (API-022: paginated list)
 *  - useRoleDetailQuery          (API-021: detail)
 *  - useCreateRoleMutation       (API-020: create)
 *  - useUpdateRoleMutation       (API-023: update)
 *  - useDeleteRoleMutation       (API-025: delete)
 *  - useRemoveRolePermsMutation  (API-024: remove permissions from role)
 *
 * ── Permissions ──
 *  - usePermissionsListQuery     (API-032: paginated list)
 *  - usePermissionDetailQuery    (API-031: detail)
 *  - useModulesQuery             (API-028: list module names)
 *  - useCreatePermissionMutation (API-029: create)
 *  - useUpdatePermissionMutation (API-030: update)
 *  - useDeletePermissionMutation (API-033: delete)
 *  - useCreateModuleMutation     (API-026: create/assign module)
 *  - useDeleteModuleMutation     (API-027: delete module)
 *
 * Error từ apiService/AppError đi xuyên suốt.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  removeRolePermissions,
  getPermissions,
  getPermissionById,
  getModules,
  createPermission,
  updatePermission,
  deletePermission,
  createPermissionModule,
  deletePermissionModule,
} from '../api/role.service';

import { roleKeys, permissionKeys } from '../api/role.keys';

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

// ═════════════════════════════════════════════════════════════════════════════
// ROLES - Queries
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Danh sách vai trò (paginated) - API-022
 */
export function useRolesListQuery(params?: RoleListParams) {
  return useQuery<PaginatedRolesResponse>({
    queryKey: roleKeys.list(params),
    queryFn: () => getRoles(params),
    staleTime: 60_000,
  });
}

/**
 * Chi tiết vai trò - API-021
 */
export function useRoleDetailQuery(roleId: string | undefined) {
  return useQuery<RoleResponse>({
    enabled: !!roleId,
    queryKey: roleId ? roleKeys.detail(roleId) : roleKeys.detail('__empty__'),
    queryFn: () => getRoleById(roleId!),
    staleTime: 60_000,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// ROLES - Mutations
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Tạo vai trò - API-020
 */
export function useCreateRoleMutation() {
  const qc = useQueryClient();
  return useMutation<RoleResponse, Error, CreateRoleInput>({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

/**
 * Cập nhật vai trò - API-023
 */
export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation<
    RoleResponse,
    Error,
    { roleId: string; payload: UpdateRoleInput }
  >({
    mutationFn: ({ roleId, payload }) => updateRole(roleId, payload),
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      qc.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

/**
 * Xóa vai trò - API-025
 */
export function useDeleteRoleMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
  });
}

/**
 * Xóa permissions khỏi vai trò - API-024
 */
export function useRemoveRolePermsMutation() {
  const qc = useQueryClient();
  return useMutation<
    null,
    Error,
    { roleId: string; payload: RemoveRolePermissionsInput }
  >({
    mutationFn: ({ roleId, payload }) => removeRolePermissions(roleId, payload),
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PERMISSIONS - Queries
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Danh sách permissions (paginated) - API-032
 */
export function usePermissionsListQuery(params?: PermissionListParams) {
  return useQuery<PaginatedPermissionsResponse>({
    queryKey: permissionKeys.list(params),
    queryFn: () => getPermissions(params),
    staleTime: 60_000,
  });
}

/**
 * Chi tiết permission - API-031
 */
export function usePermissionDetailQuery(permissionId: string | undefined) {
  return useQuery<PermissionResponse>({
    enabled: !!permissionId,
    queryKey: permissionId
      ? permissionKeys.detail(permissionId)
      : permissionKeys.detail('__empty__'),
    queryFn: () => getPermissionById(permissionId!),
    staleTime: 60_000,
  });
}

/**
 * Danh sách tên module - API-028
 */
export function useModulesQuery() {
  return useQuery<string[]>({
    queryKey: permissionKeys.modules(),
    queryFn: getModules,
    staleTime: 60_000,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PERMISSIONS - Mutations
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Tạo permission - API-029
 */
export function useCreatePermissionMutation() {
  const qc = useQueryClient();
  return useMutation<PermissionResponse, Error, CreatePermissionInput>({
    mutationFn: createPermission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionKeys.all });
      qc.invalidateQueries({ queryKey: permissionKeys.modules() });
    },
  });
}

/**
 * Cập nhật permission - API-030
 */
export function useUpdatePermissionMutation() {
  const qc = useQueryClient();
  return useMutation<
    PermissionResponse,
    Error,
    { permissionId: string; payload: UpdatePermissionInput }
  >({
    mutationFn: ({ permissionId, payload }) =>
      updatePermission(permissionId, payload),
    onSuccess: (_, { permissionId }) => {
      qc.invalidateQueries({ queryKey: permissionKeys.all });
      qc.invalidateQueries({
        queryKey: permissionKeys.detail(permissionId),
      });
      qc.invalidateQueries({ queryKey: permissionKeys.modules() });
    },
  });
}

/**
 * Xóa permission - API-033
 */
export function useDeletePermissionMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: deletePermission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionKeys.all });
      qc.invalidateQueries({ queryKey: permissionKeys.modules() });
    },
  });
}

/**
 * Tạo/gán module cho permissions - API-026
 */
export function useCreateModuleMutation() {
  const qc = useQueryClient();
  return useMutation<PermissionResponse[], Error, CreateModuleInput>({
    mutationFn: createPermissionModule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionKeys.all });
      qc.invalidateQueries({ queryKey: permissionKeys.modules() });
    },
  });
}

/**
 * Xóa module - API-027
 */
export function useDeleteModuleMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: deletePermissionModule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: permissionKeys.all });
      qc.invalidateQueries({ queryKey: permissionKeys.modules() });
    },
  });
}
