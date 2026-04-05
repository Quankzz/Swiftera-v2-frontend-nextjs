/**
 * Rental Orders API — /api/v1/rental-orders
 *
 * Module 12 trong tài liệu API: RENTAL ORDERS (12 endpoints)
 * Base URL: /api/v1
 *
 * NOTE: Tất cả endpoints đều yêu cầu xác thực [AUTH]
 *
 * Sử dụng httpService (axios) giống cấu trúc userProfileApi.ts
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types (from api.types.ts) ─────────────────────────────────────────────────

export type RentalOrderApiStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'IN_USE'
  | 'PENDING_PICKUP'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'INSPECTING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RentalOrderLineResponse {
  rentalOrderLineId: string;
  productId: string;
  productNameSnapshot: string;
  inventoryItemId: string | null;
  inventorySerialNumber: string | null;
  dailyPriceSnapshot: number;
  depositAmountSnapshot: number;
  rentalDurationDays: number;
  itemPenaltyAmount: number;
  checkoutConditionNote: string | null;
  checkinConditionNote: string | null;
}

export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string | null;
  deliveryStaffId: string | null;
  pickupStaffId: string | null;
  hubId: string | null;
  hubName: string | null;
  deliveryRecipientName: string;
  deliveryPhone: string;
  deliveryAddressLine: string | null;
  deliveryWard: string | null;
  deliveryDistrict: string | null;
  deliveryCity: string | null;
  deliveryNote: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  deliveredLatitude: number | null;
  deliveredLongitude: number | null;
  pickedUpLatitude: number | null;
  pickedUpLongitude: number | null;
  expectedDeliveryDate: string | null;
  expectedRentalEndDate: string | null;
  plannedDeliveryAt: string | null;
  actualDeliveryAt: string | null;
  actualRentalStartAt: string | null;
  actualRentalEndAt: string | null;
  plannedPickupAt: string | null;
  pickedUpAt: string | null;
  placedAt: string;
  status: RentalOrderApiStatus;
  rentalSubtotalAmount: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  rentalFeeAmount: number;
  depositHoldAmount: number;
  totalPayableAmount: number;
  totalPaidAmount: number;
  penaltyChargeAmount: number | null;
  depositRefundAmount: number | null;
  rentalOrderLines: RentalOrderLineResponse[];
  userEmail?: string | null;
  userFullName?: string | null;
}

// ─── Response wrappers ─────────────────────────────────────────────────────────

export interface RentalOrderSingleResponse {
  success: boolean;
  message?: string;
  data: RentalOrderResponse;
  meta?: { timestamp: string; instance: string };
}

export interface RentalOrderListResponse {
  success: boolean;
  message?: string;
  data: {
    meta: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    content: RentalOrderResponse[];
  };
  meta?: { timestamp: string; instance: string };
}

export interface RentalOrderVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ──────────────────────────────────────────────────────────

export interface CreateOrderLineInput {
  productId: string;
  quantity: number;
  rentalDurationDays: number;
}

export interface CreateRentalOrderInput {
  deliveryRecipientName: string;
  deliveryPhone: string;
  deliveryAddressLine?: string;
  deliveryWard?: string;
  deliveryDistrict?: string;
  deliveryCity?: string;
  expectedDeliveryDate: string; // YYYY-MM-DD, >= hôm nay
  voucherCode?: string;
  orderLines: CreateOrderLineInput[];
}

export interface AssignHubInput {
  hubId: string;
}

export interface AssignStaffInput {
  deliveryStaffId?: string;
  pickupStaffId?: string;
}

export interface RecordDeliveryInput {
  deliveredAt?: string;
  deliveredLatitude?: number;
  deliveredLongitude?: number;
}

export interface RecordPickupInput {
  pickedUpAt?: string;
  pickedUpLatitude?: number;
  pickedUpLongitude?: number;
}

export interface SetPenaltyInput {
  penaltyTotal: number; // >= 0
  note?: string;
}

// ─── Status type (matching backend) ─────────────────────────────────────────────

export type RentalOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'ACTIVE'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED';

// ─── API ─────────────────────────────────────────────────────────────────────

export const rentalOrderApi = {
  /**
   * API-073: Tạo đơn thuê [AUTH]
   *
   * Validation:
   *   - deliveryRecipientName, deliveryPhone, expectedDeliveryDate, orderLines: bắt buộc
   *   - orderLines[].productId: UUID product đang active
   *   - orderLines[].quantity: >= 1
   *   - orderLines[].rentalDurationDays: >= 1 và >= minRentalDays của product
   *   - voucherCode: mã voucher hợp lệ (tùy chọn)
   *
   * Công thức tính tiền:
   *   rentalSubtotalAmount = sum(dailyPrice × quantity × rentalDurationDays) cho từng line
   *   rentalFeeAmount = rentalSubtotalAmount - voucherDiscountAmount
   *   depositHoldAmount = sum(depositAmount × quantity) cho từng line
   *   totalPayableAmount = rentalFeeAmount + depositHoldAmount
   *
   * Lỗi: INVENTORY_INSUFFICIENT_STOCK, RENTAL_ORDER_MIN_DAYS_NOT_MET,
   *       VOUCHER_EXPIRED, VOUCHER_MIN_RENTAL_DAYS_NOT_MET
   */
  create(
    data: CreateRentalOrderInput,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.post<RentalOrderSingleResponse>(
      '/rental-orders',
      data,
      authOpts,
    );
  },

  /**
   * API-074: Lấy đơn thuê theo ID [AUTH]
   */
  getById(
    rentalOrderId: string,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.get<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}`,
      authOpts,
    );
  },

  /**
   * API-075: Lấy danh sách đơn thuê (admin/staff) [AUTH]
   *
   * @param params.page   - mặc định 0
   * @param params.size  - mặc định 10
   * @param params.sort - mặc định placedAt,desc
   * @param params.filter - SpringFilter DSL, VD: status:'PENDING_PAYMENT'
   */
  list(params?: {
    page?: number;
    size?: number;
    sort?: string;
    filter?: string;
  }): Promise<AxiosResponse<RentalOrderListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const sort = params?.sort ?? 'placedAt,desc';
    const searchParams: Record<string, string> = {
      page: String(page),
      size: String(size),
      sort,
    };
    if (params?.filter) searchParams['filter'] = params.filter;
    return httpService.get<RentalOrderListResponse>(`/rental-orders`, {
      ...authOpts,
      params: searchParams,
    });
  },

  /**
   * API-076: Lấy danh sách đơn thuê của tôi [AUTH]
   *
   * @param params.page - mặc định 0
   * @param params.size - mặc định 10
   */
  getMyOrders(params?: {
    page?: number;
    size?: number;
  }): Promise<AxiosResponse<RentalOrderListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    return httpService.get<RentalOrderListResponse>(
      `/rental-orders/my-orders`,
      { ...authOpts, params: { page: String(page), size: String(size) } },
    );
  },

  /**
   * API-077: Cập nhật trạng thái đơn thuê [AUTH]
   *
   * Chuyển đổi trạng thái cho phép:
   *   PENDING_PAYMENT → PAID → CONFIRMED → DELIVERING → ACTIVE → RETURNING → COMPLETED
   * hoặc hủy: PENDING_PAYMENT → CANCELLED
   *
   * Lỗi: RENTAL_ORDER_INVALID_STATUS_TRANSITION
   */
  updateStatus(
    rentalOrderId: string,
    status: RentalOrderStatus,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/status`,
      { status },
      authOpts,
    );
  },

  /**
   * API-078: Hủy đơn thuê [AUTH]
   *
   * Rule: chỉ hủy khi status là PENDING_PAYMENT.
   * Side effect: Voucher usedCount giảm 1 nếu đơn dùng voucher.
   */
  cancel(
    rentalOrderId: string,
  ): Promise<AxiosResponse<RentalOrderVoidResponse>> {
    return httpService.post<RentalOrderVoidResponse>(
      `/rental-orders/${rentalOrderId}/cancel`,
      undefined,
      authOpts,
    );
  },

  /**
   * API-079: Gia hạn đơn thuê [AUTH]
   *
   * Business logic:
   *   - Tăng rentalDurationDays cho tất cả line trong đơn
   *   - Cập nhật expectedRentalEndDate
   *   - Nếu serial hiện tại bị conflict lịch sau gia hạn → tự tìm serial khác
   *     cùng product không bị xung đột (ưu tiên AVAILABLE → conditionGrade tốt hơn → FIFO)
   *   - Tính lại rentalSubtotalAmount, rentalFeeAmount, totalPayableAmount
   *
   * Lỗi: RENTAL_ORDER_EXTENSION_CONFLICT, RENTAL_ORDER_INVALID_STATUS_TRANSITION
   */
  extend(
    rentalOrderId: string,
    additionalRentalDays: number,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/extend`,
      { additionalRentalDays },
      authOpts,
    );
  },

  /**
   * API-080: Gán hub cho đơn thuê [AUTH]
   */
  assignHub(
    rentalOrderId: string,
    hubId: string,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/assign-hub`,
      { hubId },
      authOpts,
    );
  },

  /**
   * API-081: Gán nhân viên cho đơn thuê [AUTH]
   */
  assignStaff(
    rentalOrderId: string,
    data: AssignStaffInput,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/assign-staff`,
      data,
      authOpts,
    );
  },

  /**
   * API-082: Ghi nhận giao hàng [AUTH]
   *
   * Side effects:
   *   - Set actualDeliveryAt và actualRentalStartAt
   *   - Cập nhật expectedRentalEndDate = actualRentalStartAt + max(rentalDurationDays)
   *   - Inventory: AVAILABLE → RENTED
   *
   * Nếu không gửi deliveredAt, backend dùng Instant.now().
   */
  recordDelivery(
    rentalOrderId: string,
    data?: RecordDeliveryInput,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/record-delivery`,
      data ?? {},
      authOpts,
    );
  },

  /**
   * API-083: Ghi nhận thu hồi [AUTH]
   *
   * Side effects:
   *   - Set actualRentalEndAt và pickedUpAt
   *   - Inventory: RENTED → AVAILABLE
   *
   * Nếu không gửi pickedUpAt, backend dùng Instant.now().
   */
  recordPickup(
    rentalOrderId: string,
    data?: RecordPickupInput,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/record-pickup`,
      data ?? {},
      authOpts,
    );
  },

  /**
   * API-084: Cập nhật phí phạt đơn thuê [AUTH]
   *
   * Business logic: depositRefundAmount = depositHoldAmount - penaltyChargeAmount
   */
  setPenalty(
    rentalOrderId: string,
    data: SetPenaltyInput,
  ): Promise<AxiosResponse<RentalOrderSingleResponse>> {
    return httpService.patch<RentalOrderSingleResponse>(
      `/rental-orders/${rentalOrderId}/set-penalty`,
      data,
      authOpts,
    );
  },
};
