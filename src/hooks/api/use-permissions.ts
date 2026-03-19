import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreatePermissionInput,
  PaginatedResponse,
  Permission,
  PermissionListParams,
  UpdatePermissionInput,
} from '@/types/dashboard';
import { permissionsRepository } from '@/api/permissions';

const queryKeys = {
  list: (params?: PermissionListParams) => ['permissions', 'list', params],
  detail: (permissionId: string) => ['permissions', 'detail', permissionId],
  modules: ['permissions', 'modules'] as const,
};

export function usePermissionsQuery(params?: PermissionListParams) {
  return useQuery<PaginatedResponse<Permission>>({
    queryKey: queryKeys.list(params),
    queryFn: () => permissionsRepository.list(params),
    staleTime: 60 * 1000,
  });
}

export function usePermissionQuery(permissionId: string | undefined) {
  return useQuery<Permission>({
    enabled: !!permissionId,
    queryKey: permissionId
      ? queryKeys.detail(permissionId)
      : ['permissions', 'detail', 'empty'],
    queryFn: () => permissionsRepository.get(permissionId as string),
    staleTime: 60 * 1000,
  });
}

export function useModulesQuery() {
  return useQuery<string[]>({
    queryKey: queryKeys.modules,
    queryFn: () => permissionsRepository.listModules(),
    staleTime: 60 * 1000,
  });
}

export function useCreatePermissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionInput) =>
      permissionsRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] });
      qc.invalidateQueries({ queryKey: queryKeys.modules });
    },
  });
}

export function useUpdatePermissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      permissionId,
      payload,
    }: {
      permissionId: string;
      payload: UpdatePermissionInput;
    }) => permissionsRepository.update(permissionId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['permissions'] });
      qc.invalidateQueries({ queryKey: queryKeys.modules });
      qc.invalidateQueries({
        queryKey: queryKeys.detail(variables.permissionId),
      });
    },
  });
}

export function useDeletePermissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) =>
      permissionsRepository.remove(permissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissions'] });
      qc.invalidateQueries({ queryKey: queryKeys.modules });
    },
  });
}

export function useUpdatePermissionModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      permissionId,
      module,
    }: {
      permissionId: string;
      module: string;
    }) => permissionsRepository.updateModule(permissionId, module),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions'] }),
  });
}

export function useCreateModuleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => permissionsRepository.createModule(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.modules }),
  });
}
