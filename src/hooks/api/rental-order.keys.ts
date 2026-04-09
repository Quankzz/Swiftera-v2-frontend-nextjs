/**
 * Rental Order query keys — dùng chung cho TanStack Query
 */

export const rentalOrderKeys = {
  all: ['rental-orders'] as const,

  list: (params?: object) =>
    [...rentalOrderKeys.all, 'list', params ?? {}] as const,

  myList: (params?: {
    page?: number;
    size?: number;
    filter?: string;
    sort?: string;
    search?: string;
  }) => [...rentalOrderKeys.all, 'my', params ?? {}] as const,

  detail: (rentalOrderId: string) =>
    [...rentalOrderKeys.all, 'detail', rentalOrderId] as const,
};
