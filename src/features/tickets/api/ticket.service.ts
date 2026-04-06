/**
 * Contact Tickets — API Service
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 16: CONTACT TICKETS)
 *
 * API-100: POST   /contact-tickets             [PUBLIC]  createTicket
 * API-101: GET    /contact-tickets/{id}         [AUTH]    getTicketById
 * API-102: GET    /contact-tickets              [AUTH]    getTickets (admin)
 * API-103: GET    /contact-tickets/my-tickets   [AUTH]    getMyTickets
 * API-104: PATCH  /contact-tickets/{id}/reply  [AUTH]    replyTicket
 * API-105: PATCH  /contact-tickets/{id}/close  [AUTH]    closeTicket
 */

import { apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  ContactTicketResponse,
  ContactTicketStatus,
  CreateTicketRequest,
  PaginatedTicketsResponse,
  ReplyTicketRequest,
  TicketListParams,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert convenience `status` shorthand to SpringFilter DSL */
function buildParams(
  params?: TicketListParams,
): Record<string, string | number | boolean | undefined> {
  if (!params) return {};
  const { status, ...rest } = params;
  return {
    ...rest,
    filter: status ? `status:'${status}'` : rest.filter,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-102: Lấy danh sách ticket (admin)
 * GET /contact-tickets?page=0&size=20&filter=status:'OPEN' [AUTH]
 */
export function getTickets(
  params?: TicketListParams,
): Promise<PaginatedTicketsResponse> {
  return apiGet<PaginatedTicketsResponse>('/contact-tickets', {
    params: buildParams(params),
  });
}

/**
 * API-101: Lấy chi tiết một ticket
 * GET /contact-tickets/{id} [AUTH]
 */
export function getTicketById(id: string): Promise<ContactTicketResponse> {
  return apiGet<ContactTicketResponse>(`/contact-tickets/${id}`);
}

/**
 * API-103: Lấy danh sách ticket của current user
 * GET /contact-tickets/my-tickets [AUTH]
 */
export function getMyTickets(
  params?: TicketListParams,
): Promise<PaginatedTicketsResponse> {
  return apiGet<PaginatedTicketsResponse>('/contact-tickets/my-tickets', {
    params: buildParams(params),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-100: Tạo ticket mới
 * POST /contact-tickets [PUBLIC]
 */
export function createTicket(
  body: CreateTicketRequest,
): Promise<ContactTicketResponse> {
  return apiPost<ContactTicketResponse>('/contact-tickets', body);
}

/**
 * API-104: Admin phản hồi ticket
 * PATCH /contact-tickets/{id}/reply [AUTH]
 */
export function replyTicket(
  id: string,
  body: ReplyTicketRequest,
): Promise<ContactTicketResponse> {
  return apiPatch<ContactTicketResponse>(`/contact-tickets/${id}/reply`, body);
}

/**
 * API-105: Đóng ticket
 * PATCH /contact-tickets/{id}/close [AUTH]
 */
export function closeTicket(id: string): Promise<ContactTicketResponse> {
  return apiPatch<ContactTicketResponse>(`/contact-tickets/${id}/close`);
}

/**
 * API-106: Cập nhật trạng thái ticket (admin)
 * PATCH /contact-tickets/{id}/status [AUTH]
 */
export interface UpdateTicketStatusRequest {
  status: ContactTicketStatus;
}

export function updateTicketStatus(
  id: string,
  body: UpdateTicketStatusRequest,
): Promise<ContactTicketResponse> {
  return apiPatch<ContactTicketResponse>(`/contact-tickets/${id}/status`, body);
}
