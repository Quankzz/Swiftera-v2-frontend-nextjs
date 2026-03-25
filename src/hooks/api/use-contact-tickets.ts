import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ContactTicket,
  ContactTicketListParams,
  PaginatedResponse,
  UpdateContactTicketStatusInput,
} from '@/types/dashboard';
import { contactTicketsRepository } from '@/api/contact-tickets';

const queryKeys = {
  list: (params?: ContactTicketListParams) => [
    'contact-tickets',
    'list',
    params,
  ],
  detail: (id: string) => ['contact-tickets', 'detail', id],
};

export function useContactTicketsQuery(params?: ContactTicketListParams) {
  return useQuery<PaginatedResponse<ContactTicket>>({
    queryKey: queryKeys.list(params),
    queryFn: () => contactTicketsRepository.list(params),
    staleTime: 60 * 1000,
  });
}

export function useContactTicketQuery(id: string | undefined) {
  return useQuery<ContactTicket>({
    enabled: !!id,
    queryKey: id
      ? queryKeys.detail(id)
      : ['contact-tickets', 'detail', 'empty'],
    queryFn: () => contactTicketsRepository.get(id as string),
    staleTime: 60 * 1000,
  });
}

export function useUpdateTicketStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateContactTicketStatusInput;
    }) => contactTicketsRepository.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['contact-tickets'] });
      qc.invalidateQueries({
        queryKey: queryKeys.detail(variables.id),
      });
    },
  });
}
