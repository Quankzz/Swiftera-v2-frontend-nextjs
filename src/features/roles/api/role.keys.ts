/**
 * Query keys cho roles & permissions module.
 * Dùng factory pattern cho tổ chức rõ ràng.
 */

import type { RoleListParams, PermissionListParams } from "../types";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params?: RoleListParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (roleId: string) => [...roleKeys.details(), roleId] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (params?: PermissionListParams) =>
    [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (permissionId: string) =>
    [...permissionKeys.details(), permissionId] as const,
  modules: () => [...permissionKeys.all, "modules"] as const,
};
