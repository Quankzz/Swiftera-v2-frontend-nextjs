import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAddressKeys } from "@/hooks/api/user-address.keys";
import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  updateUserAddress,
} from "@/api/userAddressApi";
import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
  UserAddressResponse,
} from "@/api/userAddressApi";

async function fetchUserAddresses(): Promise<UserAddressResponse[]> {
  const res = await getUserAddresses();
  return res.data.data ?? [];
}

export function useUserAddressesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userAddressKeys.list(),
    queryFn: fetchUserAddresses,
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateUserAddress(options?: {
  onSuccess?: (addr: UserAddressResponse) => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserAddressInput) => {
      const res = await createUserAddress(input);
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: userAddressKeys.list() });
      if (data) options?.onSuccess?.(data);
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function useUpdateUserAddress(options?: {
  onSuccess?: (addr: UserAddressResponse) => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userAddressId,
      input,
    }: {
      userAddressId: string;
      input: UpdateUserAddressInput;
    }) => {
      const res = await updateUserAddress(userAddressId, input);
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: userAddressKeys.list() });
      if (data) options?.onSuccess?.(data);
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}

export function useDeleteUserAddress(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userAddressId: string) => {
      await deleteUserAddress(userAddressId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userAddressKeys.list() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => options?.onError?.(error),
  });
}
