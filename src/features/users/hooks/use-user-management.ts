/**
 * Hooks cho admin / user management:
 *  - useUsersQuery
 *  - useUserQuery
 *  - useUpdateUserMutation
 *  - useDeleteUserMutation
 *  - useRemoveUserRolesMutation
 *
 * Dùng TanStack Query + user.service.ts + user.keys.ts.
 * Error từ apiService/AppError đi xuyên suốt.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '../api/user.keys';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  removeUserRoles,
} from '../api/user.service';
import type {
  UserResponse,
  PaginatedUsersResponse,
  UserListParams,
  UpdateUserInput,
  RemoveUserRolesInput,
} from '../types';

/**
 * Lấy danh sách users (API-015: GET /users)
 */
export function useUsersQuery(params?: UserListParams) {
  return useQuery<PaginatedUsersResponse>({
    queryKey: userKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => getUsers(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Lấy thông tin user theo ID (API-014: GET /users/{userId})
 */
export function useUserQuery(userId: string | undefined) {
  return useQuery<UserResponse>({
    enabled: !!userId,
    queryKey: userId ? userKeys.detail(userId) : userKeys.details(),
    queryFn: () => getUserById(userId as string),
    staleTime: 60 * 1000,
  });
}

/**
 * Cập nhật user (admin) (API-016: PATCH /users/{userId})
 */
export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation<
    UserResponse,
    Error,
    { userId: string; payload: UpdateUserInput }
  >({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
    },
  });
}

/**
 * Xóa user (API-017: DELETE /users/{userId})
 */
export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation<null, Error, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Xóa vai trò khỏi user (API-018: DELETE /users/{userId}/roles)
 */
export function useRemoveUserRolesMutation() {
  const qc = useQueryClient();
  return useMutation<
    null,
    Error,
    { userId: string; payload: RemoveUserRolesInput }
  >({
    mutationFn: ({ userId, payload }) => removeUserRoles(userId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
    },
  });
}
