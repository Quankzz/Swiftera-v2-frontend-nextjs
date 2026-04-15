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

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type {
  ContactTicketResponse,
  ContactTicketStatus,
  CreateTicketRequest,
  PaginatedTicketsResponse,
  ReplyTicketRequest,
  TicketListParams,
} from '../types';

const authOpts = { requireToken: true as const };

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
export async function getTickets(
  params?: TicketListParams,
): Promise<PaginatedTicketsResponse> {
  const res = await httpService.get<ApiResponse<PaginatedTicketsResponse>>(
    '/contact-tickets',
    { ...authOpts, params: buildParams(params) },
  );
  return res.data.data!;
}

/**
 * API-101: Lấy chi tiết một ticket
 * GET /contact-tickets/{id} [AUTH]
 */
export async function getTicketById(
  id: string,
): Promise<ContactTicketResponse> {
  const res = await httpService.get<ApiResponse<ContactTicketResponse>>(
    `/contact-tickets/${id}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-103: Lấy danh sách ticket của current user
 * GET /contact-tickets/my-tickets [AUTH]
 */
export async function getMyTickets(
  params?: TicketListParams,
): Promise<PaginatedTicketsResponse> {
  const res = await httpService.get<ApiResponse<PaginatedTicketsResponse>>(
    '/contact-tickets/my-tickets',
    { ...authOpts, params: buildParams(params) },
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-100: Tạo ticket mới
 * POST /contact-tickets [PUBLIC]
 */
export async function createTicket(
  body: CreateTicketRequest,
): Promise<ContactTicketResponse> {
  const res = await httpService.post<ApiResponse<ContactTicketResponse>>(
    '/contact-tickets',
    body,
  );
  return res.data.data!;
}

/**
 * API-104: Admin phản hồi ticket
 * PATCH /contact-tickets/{id}/reply [AUTH]
 */
export async function replyTicket(
  id: string,
  body: ReplyTicketRequest,
): Promise<ContactTicketResponse> {
  const res = await httpService.patch<ApiResponse<ContactTicketResponse>>(
    `/contact-tickets/${id}/reply`,
    body,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-105: Đóng ticket
 * PATCH /contact-tickets/{id}/close [AUTH]
 */
export async function closeTicket(id: string): Promise<ContactTicketResponse> {
  const res = await httpService.patch<ApiResponse<ContactTicketResponse>>(
    `/contact-tickets/${id}/close`,
    {},
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-106: Cập nhật trạng thái ticket (admin)
 * PATCH /contact-tickets/{id}/status [AUTH]
 */
export interface UpdateTicketStatusRequest {
  status: ContactTicketStatus;
}

export async function updateTicketStatus(
  id: string,
  body: UpdateTicketStatusRequest,
): Promise<ContactTicketResponse> {
  const res = await httpService.patch<ApiResponse<ContactTicketResponse>>(
    `/contact-tickets/${id}/status`,
    body,
    authOpts,
  );
  return res.data.data!;
}
