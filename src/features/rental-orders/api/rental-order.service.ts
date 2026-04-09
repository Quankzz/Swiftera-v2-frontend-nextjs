/**
 * Rental Order service — tất cả API calls cho rental orders module.
 * Dùng apiService.ts làm HTTP layer, KHÔNG dùng client.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 12: RENTAL ORDERS)
 *
 * Sections:
 *  1. Queries
 *  2. Status Mutations
 *  3. Assignment
 *  4. Records & Penalty
 */

import { apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  RentalOrderResponse,
  PaginatedRentalOrdersResponse,
  RentalOrderListParams,
  UpdateOrderStatusInput,
  AssignHubInput,
  AssignStaffInput,
  RecordDeliveryInput,
  RecordPickupInput,
  SetPenaltyInput,
  ExtendOrderInput,
  StaffOption,
} from '../types';
import type { PaginatedData } from '@/api/apiService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-075: Lấy danh sách đơn thuê (admin/staff)
 * GET /rental-orders?page=0&size=10&sort=placedAt,desc&filter=status:'PENDING_PAYMENT' [AUTH]
 */
export function getRentalOrders(
  params?: RentalOrderListParams,
): Promise<PaginatedRentalOrdersResponse> {
  return apiGet<PaginatedRentalOrdersResponse>('/rental-orders', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * API-077: Lấy danh sách đơn thuê của user hiện tại
 * GET /rental-orders/my-orders?page=0&size=10 [AUTH]
 */
export function getMyRentalOrders(
  params?: RentalOrderListParams,
): Promise<PaginatedRentalOrdersResponse> {
  return apiGet<PaginatedRentalOrdersResponse>('/rental-orders/my-orders', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * API-074: Lấy đơn thuê theo ID
 * GET /rental-orders/{rentalOrderId} [AUTH]
 */
export function getRentalOrderById(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  return apiGet<RentalOrderResponse>(`/rental-orders/${rentalOrderId}`);
}

/**
 * Lấy danh sách staff (dùng trong assign-staff-dialog).
 * GET /users?filter=... [AUTH]
 *
 * Không có endpoint riêng "staff by hub" trong BE spec.
 * → Lấy tất cả users có STAFF_ROLE qua GET /users với filter.
 * Sau đó filter local nếu cần.
 */
export function getStaffUsers(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<PaginatedData<StaffOption>> {
  return apiGet<PaginatedData<StaffOption>>('/users', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Status Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-077: Cập nhật trạng thái đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/status [AUTH]
 */
export function updateRentalOrderStatus(
  rentalOrderId: string,
  payload: UpdateOrderStatusInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/status`,
    payload,
  );
}

/**
 * API-078: Hủy đơn thuê
 * POST /rental-orders/{rentalOrderId}/cancel [AUTH]
 * Body: không có
 */
export function cancelRentalOrder(rentalOrderId: string): Promise<null> {
  return apiPost<null>(`/rental-orders/${rentalOrderId}/cancel`);
}

/**
 * API-079: Gia hạn đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/extend [AUTH]
 */
export function extendRentalOrder(
  rentalOrderId: string,
  payload: ExtendOrderInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/extend`,
    payload,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Assignment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-080: Gán hub cho đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/assign-hub [AUTH]
 */
export function assignHubToOrder(
  rentalOrderId: string,
  payload: AssignHubInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/assign-hub`,
    payload,
  );
}

/**
 * API-081: Gán nhân viên cho đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/assign-staff [AUTH]
 * Tất cả field là tùy chọn.
 */
export function assignStaffToOrder(
  rentalOrderId: string,
  payload: AssignStaffInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/assign-staff`,
    payload,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Records & Penalty
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-082: Ghi nhận giao hàng
 * PATCH /rental-orders/{rentalOrderId}/record-delivery [AUTH]
 */
export function recordDelivery(
  rentalOrderId: string,
  payload: RecordDeliveryInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/record-delivery`,
    payload,
  );
}

/**
 * API-083: Ghi nhận thu hồi
 * PATCH /rental-orders/{rentalOrderId}/record-pickup [AUTH]
 */
export function recordPickup(
  rentalOrderId: string,
  payload: RecordPickupInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/record-pickup`,
    payload,
  );
}

/**
 * API-084: Cập nhật phí phạt
 * PATCH /rental-orders/{rentalOrderId}/set-penalty [AUTH]
 */
export function setPenalty(
  rentalOrderId: string,
  payload: SetPenaltyInput,
): Promise<RentalOrderResponse> {
  return apiPatch<RentalOrderResponse>(
    `/rental-orders/${rentalOrderId}/set-penalty`,
    payload,
  );
}
