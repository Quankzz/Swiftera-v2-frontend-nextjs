/**
 * Contact Tickets — Types & Interfaces
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 16: CONTACT TICKETS)
 */

import type { PaginatedData } from '@/api/apiService';

// ─────────────────────────────────────────────────────────────────────────────
// Status enum
// ─────────────────────────────────────────────────────────────────────────────

export type ContactTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'REPLIED'
  | 'RESOLVED'
  | 'CLOSED';

export const TICKET_STATUS_LABELS: Record<ContactTicketStatus, string> = {
  OPEN: 'Mở',
  IN_PROGRESS: 'Đang xử lý',
  REPLIED: 'Đã phản hồi',
  RESOLVED: 'Đã giải quyết',
  CLOSED: 'Đã đóng',
};

export const TICKET_STATUS_STYLES: Record<
  ContactTicketStatus,
  { badge: string; dot: string }
> = {
  OPEN: {
    badge:
      'bg-theme-primary-start/10 text-theme-primary-start dark:bg-theme-primary-start/20 dark:text-theme-primary-start',
    dot: 'bg-theme-primary-start',
  },
  IN_PROGRESS: {
    badge:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  REPLIED: {
    badge:
      'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  RESOLVED: {
    badge:
      'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dot: 'bg-green-500',
  },
  CLOSED: {
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// API-100: Create ticket (POST /contact-tickets)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTicketRequest {
  subject: string;
  message: string; // HTML string from Tiptap
  rentalOrderId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  attachmentUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response shape (API-100 to API-105)
// ─────────────────────────────────────────────────────────────────────────────

export interface ContactTicketResponse {
  contactTicketId: string;
  userId: string | null;
  rentalOrderId: string | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string; // HTML
  attachmentUrl: string | null;
  status: ContactTicketStatus;
  handledByUserId: string | null;
  sellerReply: string | null;
  repliedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// List params (API-102: GET /contact-tickets admin list)
// ─────────────────────────────────────────────────────────────────────────────

export interface TicketListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
  status?: ContactTicketStatus; // convenience — converted to SpringFilter DSL in service
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated wrappers
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedTicketsResponse = PaginatedData<ContactTicketResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// API-104: Reply (PATCH /contact-tickets/{id}/reply)
// ─────────────────────────────────────────────────────────────────────────────

export interface ReplyTicketRequest {
  sellerReply: string;
}
