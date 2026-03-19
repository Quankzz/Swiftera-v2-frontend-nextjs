import { useUsersQuery } from './use-users';
import { useRolesQuery } from './use-roles';
import { usePermissionsQuery } from './use-permissions';

export const useUsers = (page: number, limit: number) =>
  useUsersQuery({ page, limit });

export const useRoles = (page: number, limit: number) =>
  useRolesQuery({ page, limit });

// Legacy alias for permissions hook
export const usePermissions = () =>
  usePermissionsQuery({ page: 1, limit: 1000 });
