/**
 * Rental Order service - tất cả API calls cho rental orders module.
 * HTTP layer: httpService (axios) - dùng http.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (Module 12: RENTAL ORDERS)
 *
 * Sections:
 *  1. Queries
 *  2. Status Mutations
 *  3. Assignment
 *  4. Records & Penalty
 */

import { httpService } from '@/api/http';
import type { ApiResponse, PaginationResponse } from '@/types/api.types';
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
  ReportIssueInput,
  AssignStaffToHubInput,
  RentalContractResponse,
  ConfirmCompletionInput,
  CancelOrderInput,
} from '../types';
import type { HubStaffResponse } from '@/features/hubs/types';

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// 1. Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-075: Lấy danh sách đơn thuê (admin/staff)
 * GET /rental-orders?page=0&size=10&sort=placedAt,desc&filter=status:'PENDING_PAYMENT' [AUTH]
 */
export async function getRentalOrders(
  params?: RentalOrderListParams,
): Promise<PaginatedRentalOrdersResponse> {
  const res = await httpService.get<ApiResponse<PaginatedRentalOrdersResponse>>(
    '/rental-orders',
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-077: Lấy danh sách đơn thuê của user hiện tại
 * GET /rental-orders/my-orders?page=0&size=10 [AUTH]
 */
export async function getMyRentalOrders(
  params?: RentalOrderListParams,
): Promise<PaginatedRentalOrdersResponse> {
  const res = await httpService.get<ApiResponse<PaginatedRentalOrdersResponse>>(
    '/rental-orders/my-orders',
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-074: Lấy đơn thuê theo ID
 * GET /rental-orders/{rentalOrderId} [AUTH]
 */
export async function getRentalOrderById(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  const res = await httpService.get<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * Lấy danh sách staff (dùng trong assign-staff-dialog).
 * GET /users?filter=... [AUTH]
 *
 * Không có endpoint riêng "staff by hub" trong BE spec.
 * → Lấy tất cả users có STAFF_ROLE qua GET /users với filter.
 * Sau đó filter local nếu cần.
 */
export async function getStaffUsers(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<PaginationResponse<StaffOption>> {
  const res = await httpService.get<
    ApiResponse<PaginationResponse<StaffOption>>
  >('/users', { ...authOpts, params });
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Status Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-077: Cập nhật trạng thái đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/status [AUTH]
 */
export async function updateRentalOrderStatus(
  rentalOrderId: string,
  payload: UpdateOrderStatusInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/status`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-078: Hủy đơn thuê
 * POST /rental-orders/{rentalOrderId}/cancel [AUTH]
 * Body: không có
 */
export async function cancelRentalOrder(rentalOrderId: string): Promise<null> {
  await httpService.post(
    `/rental-orders/${rentalOrderId}/cancel`,
    {},
    authOpts,
  );
  return null;
}

/**
 * API-079: Gia hạn đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/extend [AUTH]
 */
export async function extendRentalOrder(
  rentalOrderId: string,
  payload: ExtendOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/extend`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Assignment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-080: Gán hub cho đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/assign-hub [AUTH]
 */
export async function assignHubToOrder(
  rentalOrderId: string,
  payload: AssignHubInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/assign-hub`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-081: Gán nhân viên cho đơn thuê
 * PATCH /rental-orders/{rentalOrderId}/assign-staff [AUTH]
 * Tất cả field là tùy chọn.
 */
export async function assignStaffToOrder(
  rentalOrderId: string,
  payload: AssignStaffInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/assign-staff`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Records & Penalty
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-082: Ghi nhận giao hàng
 * PATCH /rental-orders/{rentalOrderId}/record-delivery [AUTH]
 */
export async function recordDelivery(
  rentalOrderId: string,
  payload: RecordDeliveryInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/record-delivery`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-083: Ghi nhận thu hồi
 * PATCH /rental-orders/{rentalOrderId}/record-pickup [AUTH]
 */
export async function recordPickup(
  rentalOrderId: string,
  payload: RecordPickupInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/record-pickup`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-084: Cập nhật phí phạt
 * PATCH /rental-orders/{rentalOrderId}/set-penalty [AUTH]
 */
export async function setPenalty(
  rentalOrderId: string,
  payload: SetPenaltyInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/set-penalty`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Complete & Report Issue
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hoàn tất đơn thuê - chuyển status PICKED_UP → COMPLETED.
 * Sử dụng API-079: PATCH /rental-orders/{id}/status
 */
export async function completeRentalOrder(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/status`,
    { status: 'COMPLETED' },
    authOpts,
  );
  return res.data.data!;
}

/**
 * Thu hồi sớm do sự cố - ADMIN only.
 * Chuyển DELIVERED / IN_USE → PENDING_PICKUP kèm issueNote.
 * API-079: PATCH /rental-orders/{id}/status
 */
export async function reportIssueRecall(
  rentalOrderId: string,
  payload: ReportIssueInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.patch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/status`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Hub Staff Assignment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-120: Gán nhiều staff vào hub
 * PATCH /hubs/{hubId}/assign-staff
 */
export async function assignStaffToHub(
  hubId: string,
  payload: AssignStaffToHubInput,
): Promise<HubStaffResponse[]> {
  const res = await httpService.patch<ApiResponse<HubStaffResponse[]>>(
    `/hubs/${hubId}/assign-staff`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-082: Xem chi tiết nhân sự xử lý đơn thuê
 * GET /rental-orders/{rentalOrderId}/staff-detail
 */
export async function getRentalOrderStaffDetail(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  const res = await httpService.get<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/staff-detail`,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Contracts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-094: Lấy hợp đồng thuê theo đơn hàng
 * GET /contracts/rental-order/{rentalOrderId}
 */
export async function getContractByOrder(
  rentalOrderId: string,
): Promise<RentalContractResponse> {
  const res = await httpService.get<ApiResponse<RentalContractResponse>>(
    `/contracts/rental-order/${rentalOrderId}`,
    authOpts,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Admin Cancellation / Support Actions
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmCancellationRefund(
  rentalOrderId: string,
  input: CancelOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.post<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/confirm-cancellation-refund`,
    input,
    authOpts,
  );
  return res.data.data!;
}

/**
 * Admin directly cancels a PAID order (support case)
 * POST /rental-orders/{rentalOrderId}/admin-cancel-paid [ADMIN]
 */
export async function adminCancelFromPaid(
  rentalOrderId: string,
  input: CancelOrderInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.post<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/admin-cancel-paid`,
    input,
    authOpts,
  );
  return res.data.data!;
}

/**
 * Admin triggers early pickup for IN_USE orders (support/fraud cases)
 * POST /rental-orders/{rentalOrderId}/admin-early-pickup [ADMIN]
 */
export async function adminEarlyPickupFromInUse(
  rentalOrderId: string,
): Promise<RentalOrderResponse> {
  const res = await httpService.post<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/admin-early-pickup`,
    undefined,
    authOpts,
  );
  return res.data.data!;
}

/**
 * Admin confirms rental order completion (PICKED_UP → COMPLETED).
 * Sets penalty amounts, calculates deposit refund, creates refund transaction.
 * POST /rental-orders/{rentalOrderId}/confirm-completion [ADMIN]
 */
export async function confirmCompletion(
  rentalOrderId: string,
  input: ConfirmCompletionInput,
): Promise<RentalOrderResponse> {
  const res = await httpService.post<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${rentalOrderId}/confirm-completion`,
    input,
    authOpts,
  );
  return res.data.data!;
}
