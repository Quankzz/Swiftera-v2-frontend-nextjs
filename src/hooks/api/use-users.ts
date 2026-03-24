import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateUserInput,
  PaginatedResponse,
  UpdateUserInput,
  User,
  UserListParams,
} from '@/types/dashboard';
import { usersRepository } from '@/api/users';

const queryKeys = {
  list: (params?: UserListParams) => ['users', 'list', params],
  detail: (userId: string) => ['users', 'detail', userId],
};

export function useUsersQuery(params?: UserListParams) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: queryKeys.list(params),
    queryFn: () => usersRepository.list(params),
    staleTime: 60 * 1000,
  });
}

export function useUserQuery(userId: string | undefined) {
  return useQuery<User>({
    enabled: !!userId,
    queryKey: userId ? queryKeys.detail(userId) : ['users', 'detail', 'empty'],
    queryFn: () => usersRepository.get(userId as string),
    staleTime: 60 * 1000,
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserInput) => usersRepository.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserInput;
    }) => usersRepository.update(userId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users', 'detail', variables.userId] });
    },
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersRepository.remove(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignUserRolesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      usersRepository.assignRoles(userId, roleIds),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({
        queryKey: ['users', 'detail', variables.userId],
      });
    },
  });
}
