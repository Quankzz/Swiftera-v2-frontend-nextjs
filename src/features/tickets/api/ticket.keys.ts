/**
 * Contact Tickets - Query Key Factory
 * Dùng với TanStack Query để cache invalidation.
 */

import type { TicketListParams } from '../types';

export const ticketKeys = {
  all: ['tickets'] as const,

  lists: () => [...ticketKeys.all, 'list'] as const,

  /** Admin list - GET /contact-tickets */
  list: (params?: TicketListParams) =>
    [...ticketKeys.lists(), params ?? {}] as const,

  myLists: () => [...ticketKeys.all, 'my-list'] as const,

  /** My tickets - GET /contact-tickets/my-tickets */
  myList: (params?: TicketListParams) =>
    [...ticketKeys.myLists(), params ?? {}] as const,

  details: () => [...ticketKeys.all, 'detail'] as const,

  /** Single ticket - GET /contact-tickets/{id} */
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};
