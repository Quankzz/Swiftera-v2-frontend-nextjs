import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AssignOrderInput,
  PaginatedResponse,
  RentalOrder,
  RentalOrderListParams,
} from '@/types/dashboard';
import { rentalOrdersRepository } from '@/api/rental-orders';

const queryKeys = {
  list: (params?: RentalOrderListParams) => ['rental-orders', 'list', params],
  detail: (id: string) => ['rental-orders', 'detail', id],
};

export function useRentalOrdersQuery(params?: RentalOrderListParams) {
  return useQuery<PaginatedResponse<RentalOrder>>({
    queryKey: queryKeys.list(params),
    queryFn: () => rentalOrdersRepository.list(params),
    staleTime: 30 * 1000,
  });
}

export function useRentalOrderQuery(id: string | undefined) {
  return useQuery<RentalOrder>({
    enabled: !!id,
    queryKey: id ? queryKeys.detail(id) : ['rental-orders', 'detail', 'empty'],
    queryFn: () => rentalOrdersRepository.get(id as string),
    staleTime: 30 * 1000,
  });
}

export function useAssignOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AssignOrderInput }) =>
      rentalOrdersRepository.assign(id, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['rental-orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
    },
  });
}
