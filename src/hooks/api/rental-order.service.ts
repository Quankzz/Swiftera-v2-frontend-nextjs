/**
 * Rental Order API service - dùng cho TanStack Query hooks
 * Module 12: RENTAL ORDERS (API-074 → API-085)
 */

import { httpService } from '@/api/http';
import type {
  CreateRentalOrderInput,
  UpdateOrderStatusInput,
  ExtendOrderInput,
  RentalOrderSingleResponse,
  RentalOrderVoidResponse,
  PaginatedRentalOrdersResponse,
  RentalOrderStaffDetailResponse,
  RentalOrderResponse,
  OverduePenaltySuggestionData,
  OverduePenaltySuggestionResponse,
} from '@/api/rentalOrderApi';
import type { AssignOrderInput } from '@/types/dashboard';

const authOpts = { requireToken: true as const };

export interface NormalizedPaginatedOrders {
  items: RentalOrderResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export async function getMyRentalOrders(params?: {
  page?: number;
  size?: number;
  filter?: string;
  sort?: string;
}): Promise<NormalizedPaginatedOrders> {
  const res = await httpService.get<PaginatedRentalOrdersResponse>(
    '/rental-orders/my-orders',
    { ...authOpts, params },
  );

  const raw = res.data.data;
  return {
    items: raw.content ?? [],
    page: raw.meta?.currentPage ?? 1,
    size: raw.meta?.pageSize ?? 20,
    totalItems: raw.meta?.totalElements ?? 0,
    totalPages: raw.meta?.totalPages ?? 1,
  };
}

export async function getRentalOrderById(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  const res = await httpService.get<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}`,
    authOpts,
  );
  return res.data.data;
}

export async function createRentalOrder(
  input: CreateRentalOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.post<RentalOrderSingleResponse>(
    '/rental-orders',
    input,
    authOpts,
  );
  return res.data.data;
}

export async function updateRentalOrderStatus(
  rentalOrderId: string,
  input: UpdateOrderStatusInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/status`,
    input,
    authOpts,
  );
  return res.data.data;
}

export async function cancelRentalOrder(rentalOrderId: string): Promise<void> {
  await httpService.post<RentalOrderVoidResponse>(
    `/rental-orders/${rentalOrderId}/cancel`,
    undefined,
    authOpts,
  );
}

export async function extendRentalOrder(
  rentalOrderId: string,
  input: ExtendOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/extend`,
    input,
    authOpts,
  );
  return res.data.data;
}

export async function getRentalOrders(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<NormalizedPaginatedOrders> {
  const res = await httpService.get<PaginatedRentalOrdersResponse>(
    '/rental-orders',
    { ...authOpts, params },
  );
  const raw = res.data.data;
  return {
    items: raw.content ?? [],
    page: raw.meta?.currentPage ?? 1,
    size: raw.meta?.pageSize ?? 20,
    totalItems: raw.meta?.totalElements ?? 0,
    totalPages: raw.meta?.totalPages ?? 1,
  };
}

export async function getRentalOrderStaffDetail(
  rentalOrderId: string,
): Promise<RentalOrderStaffDetailResponse['data']> {
  const res = await httpService.get<RentalOrderStaffDetailResponse>(
    `/rental-orders/${rentalOrderId}/staff-detail`,
    authOpts,
  );
  return res.data.data;
}

export async function assignRentalOrder(
  rentalOrderId: string,
  input: AssignOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/assign-staff`,
    input,
    authOpts,
  );
  return res.data.data;
}

/** API-086A */
export async function getOverduePenaltySuggestion(
  rentalOrderId: string,
): Promise<OverduePenaltySuggestionData> {
  const res = await httpService.get<OverduePenaltySuggestionResponse>(
    `/rental-orders/${rentalOrderId}/overdue-penalty-suggestion`,
    authOpts,
  );
  return res.data.data;
}
