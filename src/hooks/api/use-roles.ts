import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateRoleInput,
  PaginatedResponse,
  Role,
  RoleListParams,
  UpdateRoleInput,
} from "@/types/dashboard";
import { rolesRepository, rolePermissionsRepository } from "@/api/roles";

const queryKeys = {
  list: (params?: RoleListParams) => ["roles", "list", params],
  detail: (roleId: string) => ["roles", "detail", roleId],
};

export function useRolesQuery(params?: RoleListParams) {
  return useQuery<PaginatedResponse<Role>>({
    queryKey: queryKeys.list(params),
    queryFn: () => rolesRepository.list(params),
    staleTime: 60 * 1000,
  });
}

export function useRoleQuery(roleId: string | undefined) {
  return useQuery<Role>({
    enabled: !!roleId,
    queryKey: roleId ? queryKeys.detail(roleId) : ["roles", "detail", "empty"],
    queryFn: () => rolesRepository.get(roleId as string),
    staleTime: 60 * 1000,
  });
}

export function useCreateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoleInput) => rolesRepository.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRoleInput;
    }) => rolesRepository.update(roleId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["roles", "detail", variables.roleId] });
    },
  });
}

export function useDeleteRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesRepository.remove(roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useRolePermissionsQuery(roleId: string | undefined) {
  return useQuery<string[]>({
    enabled: !!roleId,
    queryKey: roleId
      ? ["roles", "permissions", roleId]
      : ["roles", "permissions", "empty"],
    queryFn: () => rolePermissionsRepository.getPermissionIds(roleId as string),
    staleTime: 30 * 1000,
  });
}

export function useAssignRolePermissionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => rolePermissionsRepository.assign(roleId, permissionIds),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["roles", "permissions", variables.roleId],
      });
    },
  });
}
