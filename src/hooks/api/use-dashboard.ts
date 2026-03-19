import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { rolesApi } from '@/api/roles';
import { permissionsApi } from '@/api/permissions';

export function useUsers(page: number, limit: number) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersApi.getUsers(page, limit),
  });
}

export function useRoles(page: number, limit: number) {
  return useQuery({
    queryKey: ['roles', page, limit],
    queryFn: () => rolesApi.getRoles(page, limit),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getPermissions(),
  });
}
