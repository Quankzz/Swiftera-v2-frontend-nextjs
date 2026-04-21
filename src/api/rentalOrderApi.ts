/**
 * Rental Orders API - Module 12: RENTAL ORDERS (API-074 → API-086A)
 *
 * Base URL: /api/v1
 * Tất cả endpoints đều yêu cầu xác thực [AUTH]
 *
 * Sử dụng httpService (axios) giống cart/index.ts
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

// ─── Trạng thái đơn thuê ────────────────────────────────────────────────────

export type RentalOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'IN_USE'
  | 'PENDING_PICKUP'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'COMPLETED'
  | 'CANCELLED';

export const RENTAL_ORDER_STATUS_LABELS: Record<RentalOrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PREPARING: 'Đang chuẩn bị',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  IN_USE: 'Đang sử dụng',
  PENDING_PICKUP: 'Chờ thu hồi',
  PICKING_UP: 'Đang thu hồi',
  PICKED_UP: 'Đã thu hồi',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const RENTAL_ORDER_STATUS_COLORS: Record<RentalOrderStatus, string> = {
  PENDING_PAYMENT:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-200 dark:border-amber-800',
  PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
  PREPARING:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-200 dark:border-purple-800',
  DELIVERING:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800',
  DELIVERED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-200 dark:border-teal-800',
  IN_USE:
    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-800',
  PENDING_PICKUP:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200 dark:border-orange-800',
  PICKING_UP:
    'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200 border border-slate-200 dark:border-slate-800',
  PICKED_UP:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border border-violet-200 dark:border-violet-800',
  COMPLETED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
};

// ─── Response Types ─────────────────────────────────────────────────────────

export interface RentalOrderLineResponse {
  rentalOrderLineId: string;
  productId: string;
  productColorId: string | null;
  colorNameSnapshot: string | null;
  colorCodeSnapshot: string | null;
  productNameSnapshot: string;
  inventoryItemId: string;
  inventorySerialNumber: string;
  dailyPriceSnapshot: number;
  depositAmountSnapshot: number;
  rentalDurationDays: number;
  /** Voucher được áp dụng cho line này (nếu có) */
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  checkoutConditionNote: string | null;
  checkinConditionNote: string | null;
  itemPenaltyAmount: number;
  photos: string[];
}

// ─── Staff embedded in RentalOrderResponse ───────────────────────────────

export interface RentalOrderStaffSummary {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string;
  hubId: string | null;
  hubName: string | null;
  deliveryRecipientName: string;
  deliveryPhone: string;
  deliveryAddressLine: string;
  deliveryWard: string;
  deliveryDistrict: string;
  deliveryCity: string;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  /** Nested address object from backend (available when backend is deployed with new mapping) */
  userAddress?: {
    recipientName: string | null;
    phoneNumber: string | null;
    addressLine: string | null;
    ward: string | null;
    district: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  expectedDeliveryDate: string;
  expectedRentalEndDate: string;
  plannedDeliveryAt: string | null;
  actualDeliveryAt: string | null;
  actualRentalStartAt: string | null;
  deliveredLatitude: number | null;
  deliveredLongitude: number | null;
  plannedPickupAt: string | null;
  actualRentalEndAt: string | null;
  pickedUpAt: string | null;
  pickedUpLatitude: number | null;
  pickedUpLongitude: number | null;
  status: RentalOrderStatus;
  rentalSubtotalAmount: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  rentalFeeAmount: number;
  depositHoldAmount: number;
  totalPayableAmount: number;
  penaltyChargeAmount: number | null;
  depositRefundAmount: number | null;
  totalPaidAmount: number;
  /** URL ảnh QR (PNG) - backend tự sinh khi đơn vừa PAID và chưa có QR */
  qrCode?: string | null;
  /** Phạt hỏng / mất thiết bị (đã chốt hoặc đang lưu) */
  damagePenaltyAmount?: number | null;
  /** Phạt quá hạn đã chốt cuối cùng */
  overduePenaltyAmount?: number | null;
  /**
   * Phạt quá hạn tạm tính (chưa gộp vào penaltyChargeAmount cho đến khi staff chốt).
   * Backend có thể cập nhật theo ngày khi đơn IN_USE / PENDING_PICKUP và đang quá hạn.
   */
  provisionalOverduePenaltyAmount?: number | null;
  placedAt: string;
  createdBy: string | null;
  deliveryStaff: RentalOrderStaffSummary | null;
  pickupStaff: RentalOrderStaffSummary | null;
  rentalOrderLines: RentalOrderLineResponse[];
  /** Cancellation request tracking (customer cancellation for PAID orders) */
  cancellationRequested?: boolean | null;
  cancellationReason?: string | null;
  cancellationRequestedAt?: string | null;
  refundConfirmedByAdmin?: boolean | null;
  refundConfirmedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOrderSingleResponse {
  success: boolean;
  message?: string;
  data: RentalOrderResponse;
  meta?: { timestamp: string; instance: string };
}

export interface RentalOrderVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedRentalOrdersData {
  content: RentalOrderResponse[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginatedRentalOrdersResponse {
  success: boolean;
  message?: string;
  data: PaginatedRentalOrdersData;
  meta?: { timestamp: string; instance: string };
}

// ─── Request Payloads ───────────────────────────────────────────────────────

export interface CreateOrderLineInput {
  productId: string;
  /** Bắt buộc nếu product có >1 màu */
  productColorId?: string;
  quantity: number;
  rentalDurationDays: number;
  /** Voucher áp dụng riêng cho line này (ưu tiên dùng thay vì top-level voucherCode) */
  voucherCode?: string;
}

/** API-074 POST - địa chỉ lấy từ sổ user (`userAddressId`) */
export interface CreateRentalOrderInput {
  userAddressId: string;
  expectedDeliveryDate: string; // YYYY-MM-DD
  orderLines: CreateOrderLineInput[];
  /** @deprecated Dùng orderLines[].voucherCode; chỉ tương thích đơn 1 line */
  voucherCode?: string;
}

export interface UpdateOrderStatusInput {
  status: RentalOrderStatus;
}

export interface ExtendOrderInput {
  additionalRentalDays: number;
}

export interface AssignStaffInput {
  /** UUID staff có role STAFF_ROLE */
  deliveryStaffId?: string;
  /** UUID staff có role STAFF_ROLE */
  pickupStaffId?: string;
}

export interface RecordDeliveryInput {
  /** ISO 8601 UTC; nếu không gửi backend dùng now() */
  deliveredAt?: string;
  deliveredLatitude?: number;
  deliveredLongitude?: number;
}

export interface RecordPickupInput {
  /** ISO 8601 UTC; nếu không gửi backend dùng now() */
  pickedUpAt?: string;
  pickedUpLatitude?: number;
  pickedUpLongitude?: number;
}

export interface SetPenaltyInput {
  /** Tương thích ngược: nếu chỉ gửi field này, backend map vào damage, overdue = 0 */
  penaltyTotal?: number;
  damagePenaltyAmount?: number;
  overduePenaltyAmount?: number;
  note?: string;
}

export interface CancellationRequestInput {
  reason: string;
}

export interface ConfirmCancellationRefundInput {
  reason: string;
}


// ─── Overdue Penalty Suggestion ─────────────────────────────────────────────

export interface OverduePenaltySuggestionData {
  rentalOrderId: string;
  status: RentalOrderStatus;
  overdue: boolean;
  expectedRentalEndDate: string;
  actualRentalEndAt: string | null;
  overdueDays: number;
  dailyOverdueRateAmount: number;
  provisionalOverduePenaltyAmount: number;
  finalOverduePenaltyAmount: number;
  damagePenaltyAmount: number;
  suggestedTotalPenaltyAmount: number;
  suggestedDepositRefundAmount: number;
}


export interface OverduePenaltySuggestionResponse {
  code: number;
  message: string;
  data: OverduePenaltySuggestionData;
}

// ─── Staff Detail ────────────────────────────────────────────────────────────

export interface StaffSummary {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  hubId: string;
  hubCode: string;
  hubName: string;
}

export interface RentalOrderStaffDetailResponse {
  success: boolean;
  message?: string;
  data: {
    rentalOrderId: string;
    status: RentalOrderStatus;
    hubId: string | null;
    hubName: string | null;
    deliveryStaff: StaffSummary | null;
    pickupStaff: StaffSummary | null;
  };
  meta?: { timestamp: string; instance: string };
}

// ─── API Functions ──────────────────────────────────────────────────────────

const authOpts = { requireToken: true as const };

/**
 * API-074: Tạo đơn thuê [AUTH]
 *
 * @param input - userAddressId + expectedDeliveryDate + orderLines
 *
 * Lỗi: INVENTORY_INSUFFICIENT_STOCK, RENTAL_ORDER_MIN_DAYS_NOT_MET,
 *       VOUCHER_EXPIRED, VOUCHER_MIN_RENTAL_DAYS_NOT_MET
 */
export function createRentalOrder(
  input: CreateRentalOrderInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.post<RentalOrderSingleResponse>(
    '/rental-orders',
    input,
    authOpts,
  );
}

/**
 * API-075: Lấy đơn thuê theo ID [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 */
export function getRentalOrderById(
  rentalOrderId: string,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.get<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}`,
    authOpts,
  );
}

/**
 * API-076: Lấy danh sách đơn thuê (admin/staff) [AUTH]
 *
 * @param params - page, size, sort, filter (SpringFilter DSL)
 *
 * Ví dụ filter: status:'PENDING_PAYMENT'
 */
export function getRentalOrders(params?: {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string;
}): Promise<AxiosResponse<PaginatedRentalOrdersResponse>> {
  return httpService.get<PaginatedRentalOrdersResponse>('/rental-orders', {
    ...authOpts,
    params,
  });
}

/**
 * API-077: Lấy danh sách đơn thuê của tôi [AUTH]
 *
 * @param params - page, size, sort (của user hiện tại)
 */
export function getMyRentalOrders(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<AxiosResponse<PaginatedRentalOrdersResponse>> {
  return httpService.get<PaginatedRentalOrdersResponse>(
    '/rental-orders/my-orders',
    { ...authOpts, params },
  );
}

/**
 * API-078: Cập nhật trạng thái đơn thuê [AUTH]
 *
 * Phân quyền runtime:
 * - CUSTOMER: chỉ đơn của mình + hủy / start / end flow
 * - STAFF: chỉ bước vận hành
 * - ADMIN: toàn bộ (theo state machine)
 *
 * @param rentalOrderId - UUID của đơn thuê
 * @param input - status mới
 *
 * Guard: phải thỏa state machine và các guard nghiệp vụ
 */
export function updateRentalOrderStatus(
  rentalOrderId: string,
  input: UpdateOrderStatusInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/status`,
    input,
    authOpts,
  );
}

/**
 * API-079: Hủy đơn thuê [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 *
 * Rule: chỉ hủy khi status = PENDING_PAYMENT
 * Side effects: giảm voucher usedCount nếu có voucher
 */
export function cancelRentalOrder(
  rentalOrderId: string,
): Promise<AxiosResponse<RentalOrderVoidResponse>> {
  return httpService.post<RentalOrderVoidResponse>(
    `/rental-orders/${rentalOrderId}/cancel`,
    undefined,
    authOpts,
  );
}

/**
 * API-080: Gia hạn đơn thuê [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 * @param input - additionalRentalDays (>= 1)
 *
 * Valid khi: PENDING_PAYMENT, PAID, PREPARING, DELIVERING, DELIVERED,
 *            IN_USE, PENDING_PICKUP
 *
 * Lỗi: RENTAL_ORDER_EXTENSION_CONFLICT, RENTAL_ORDER_INVALID_STATUS_TRANSITION
 */
export function extendRentalOrder(
  rentalOrderId: string,
  input: ExtendOrderInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/extend`,
    input,
    authOpts,
  );
}

/**
 * API-081: Xem chi tiết nhân sự xử lý đơn thuê [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 *
 * Trả hub, deliveryStaff, pickupStaff của đơn
 */
export function getRentalOrderStaffDetail(
  rentalOrderId: string,
): Promise<AxiosResponse<RentalOrderStaffDetailResponse>> {
  return httpService.get<RentalOrderStaffDetailResponse>(
    `/rental-orders/${rentalOrderId}/staff-detail`,
    authOpts,
  );
}

/**
 * API-082: Gán nhân viên cho đơn thuê [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 * @param input - deliveryStaffId và/hoặc pickupStaffId (ít nhất 1 field)
 *
 * Validation:
 * - User được gán phải có role STAFF_ROLE
 * - Nếu đơn và staff khác hub → lỗi INVALID_REQUEST_DATA
 */
export function assignRentalOrderStaff(
  rentalOrderId: string,
  input: AssignStaffInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/assign-staff`,
    input,
    authOpts,
  );
}

/**
 * API-083: Ghi nhận giao hàng [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê (phải đang ở trạng thái DELIVERING)
 * @param input - thời gian và toạ độ giao hàng (nếu không gửi backend dùng now())
 *
 * Side effects:
 * - Set actualDeliveryAt, actualRentalStartAt
 * - Cập nhật expectedRentalEndDate = actualRentalStartAt + max(rentalDurationDays)
 * - Inventory: AVAILABLE → RENTED
 * - Status đơn → DELIVERED
 */
export function recordDelivery(
  rentalOrderId: string,
  input?: RecordDeliveryInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/record-delivery`,
    input ?? {},
    authOpts,
  );
}

/**
 * API-084: Ghi nhận thu hồi [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê (phải đang ở trạng thái PICKING_UP)
 * @param input - thời gian và toạ độ thu hồi (nếu không gửi backend dùng now())
 *
 * Side effects:
 * - Set actualRentalEndAt, pickedUpAt
 * - Inventory: RENTED/RESERVED → AVAILABLE
 * - Status đơn → PICKED_UP
 */
export function recordPickup(
  rentalOrderId: string,
  input?: RecordPickupInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/record-pickup`,
    input ?? {},
    authOpts,
  );
}

/**
 * API-085: Cập nhật phí phạt đơn thuê [AUTH]
 *
 * @param input - damagePenaltyAmount / overduePenaltyAmount hoặc penaltyTotal (legacy)
 *
 * Business logic:
 * - depositRefundAmount = max(depositHoldAmount - (damage + overdue), 0)
 */
export function setPenalty(
  rentalOrderId: string,
  input: SetPenaltyInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.patch<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/set-penalty`,
    input,
    authOpts,
  );
}

/**
 * Lấy đề xuất phí phạt quá hạn tạm tính [AUTH]
 *
 * @param rentalOrderId - UUID của đơn thuê
 *
 * Business logic:
 * - Khi IN_USE/PENDING_PICKUP và overdue: backend auto-refresh provisionalOverduePenaltyAmount mỗi ngày.
 * - Khi PICKED_UP: backend dùng actualRentalEndAt để khóa số ngày overdue.
 * - FE dùng provisionalOverduePenaltyAmount để prefill overduePenaltyAmount ở set-penalty,
 *   hoặc cho staff nhập tay mức cuối cùng khác.
 */
export function getOverduePenaltySuggestion(
  rentalOrderId: string,
): Promise<AxiosResponse<OverduePenaltySuggestionResponse>> {
  return httpService.get<OverduePenaltySuggestionResponse>(
    `/rental-orders/${rentalOrderId}/overdue-penalty-suggestion`,
    authOpts,
  );
}

/**
 * Customer requests cancellation for PAID orders.
 * Sets cancellationRequested flag for admin processing.
 *
 * @param rentalOrderId - UUID của đơn thuê (phải đang ở trạng thái PAID)
 * @param input - cancellation reason
 */
export function requestCancellation(
  rentalOrderId: string,
  input: CancellationRequestInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.post<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/cancellation-request`,
    input,
    authOpts,
  );
}

/**
 * Admin confirms cancellation with refund.
 * Creates DEPOSIT_REFUND payment transaction and transitions order to CANCELLED.
 *
 * @param rentalOrderId - UUID của đơn thuê (phải có cancellationRequested = true và status = PAID)
 * @param input - refund reason (e.g., "Hoàn tiền do hủy đơn theo yêu cầu khách hàng")
 */
export function confirmCancellationRefund(
  rentalOrderId: string,
  input: ConfirmCancellationRefundInput,
): Promise<AxiosResponse<RentalOrderSingleResponse>> {
  return httpService.post<RentalOrderSingleResponse>(
    `/rental-orders/${rentalOrderId}/confirm-cancellation-refund`,
    input,
    authOpts,
  );
}
