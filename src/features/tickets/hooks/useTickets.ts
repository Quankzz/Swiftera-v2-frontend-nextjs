/**
 * Contact Tickets — TanStack Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketKeys } from '../api/ticket.keys';
import {
  closeTicket,
  createTicket,
  getMyTickets,
  getTicketById,
  getTickets,
  replyTicket,
  updateTicketStatus,
} from '../api/ticket.service';
import type {
  ContactTicketResponse,
  ContactTicketStatus,
  CreateTicketRequest,
  ReplyTicketRequest,
  TicketListParams,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/** API-102: Admin — danh sách tất cả tickets */
export function useTickets(params?: TicketListParams) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => getTickets(params),
  });
}

/** API-103: User — danh sách ticket của chính mình */
export function useMyTickets(params?: TicketListParams) {
  return useQuery({
    queryKey: ticketKeys.myList(params),
    queryFn: () => getMyTickets(params),
  });
}

/** API-101: Chi tiết một ticket */
export function useTicketDetail(id: string | null) {
  return useQuery({
    queryKey: ticketKeys.detail(id ?? ''),
    queryFn: () => getTicketById(id!),
    enabled: !!id,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/** API-100: Tạo ticket mới (PUBLIC — form feedback) */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation<ContactTicketResponse, Error, CreateTicketRequest>({
    mutationFn: (body) => createTicket(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.myLists() });
    },
  });
}

/** API-104: Admin phản hồi ticket */
export function useReplyTicket() {
  const queryClient = useQueryClient();
  return useMutation<
    ContactTicketResponse,
    Error,
    { id: string; body: ReplyTicketRequest }
  >({
    mutationFn: ({ id, body }) => replyTicket(id, body),
    onSuccess: (data) => {
      // Cập nhật cache của ticket cụ thể
      queryClient.setQueryData(ticketKeys.detail(data.contactTicketId), data);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

/** API-105: Đóng ticket */
export function useCloseTicket() {
  const queryClient = useQueryClient();
  return useMutation<ContactTicketResponse, Error, string>({
    mutationFn: (id) => closeTicket(id),
    onSuccess: (data) => {
      queryClient.setQueryData(ticketKeys.detail(data.contactTicketId), data);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

/** API-106: Cập nhật trạng thái ticket (admin) */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation<
    ContactTicketResponse,
    Error,
    { id: string; status: ContactTicketStatus }
  >({
    mutationFn: ({ id, status }) => updateTicketStatus(id, { status }),
    onSuccess: (data) => {
      queryClient.setQueryData(ticketKeys.detail(data.contactTicketId), data);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}
