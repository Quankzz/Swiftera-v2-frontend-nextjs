/**
 * Rental Orders module types
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md — Module 12: RENTAL ORDERS
 *
 * Tất cả field dùng camelCase đúng theo JSON trả về từ BE.
 * Không tự suy đoán field — chỉ model field có trong spec.
 */

import type { PaginatedData } from '@/api/apiService';
import type { HubStaffResponse } from '@/features/hubs/types';

// ─────────────────────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Luồng trạng thái đơn thuê theo BE spec (API-078):
 * PENDING_PAYMENT → PAID → PREPARING → DELIVERING → DELIVERED → IN_USE → PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED
 * hoặc hủy: PENDING_PAYMENT / PREPARING → CANCELLED
 */
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

/** Chuyển đổi trạng thái được phép (theo API-078) */
export const ALLOWED_STATUS_TRANSITIONS: Partial<
  Record<RentalOrderStatus, RentalOrderStatus>
> = {
  PENDING_PAYMENT: 'PAID',
  PAID: 'PREPARING',
  PREPARING: 'DELIVERING',
  DELIVERING: 'DELIVERED',
  DELIVERED: 'IN_USE',
  IN_USE: 'PENDING_PICKUP',
  PENDING_PICKUP: 'PICKING_UP',
  PICKING_UP: 'PICKED_UP',
  PICKED_UP: 'COMPLETED',
};

export const STATUS_LABELS: Record<RentalOrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PREPARING: 'Đang chuẩn bị',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  IN_USE: 'Đang thuê',
  PENDING_PICKUP: 'Chờ thu hồi',
  PICKING_UP: 'Đang thu hồi',
  PICKED_UP: 'Đã thu hồi',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const STATUS_ORDER: RentalOrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'IN_USE',
  'PENDING_PICKUP',
  'PICKING_UP',
  'PICKED_UP',
  'COMPLETED',
  'CANCELLED',
];

export const STATUS_STYLES: Record<
  RentalOrderStatus,
  { dot: string; cls: string }
> = {
  PENDING_PAYMENT: {
    dot: 'bg-amber-400',
    cls: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/30',
  },
  PAID: {
    dot: 'bg-cyan-400',
    cls: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-900/20 dark:border-cyan-500/30',
  },
  PREPARING: {
    dot: 'bg-blue-400',
    cls: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-500/30',
  },
  DELIVERING: {
    dot: 'bg-indigo-400',
    cls: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-500/30',
  },
  DELIVERED: {
    dot: 'bg-violet-400',
    cls: 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-900/20 dark:border-violet-500/30',
  },
  IN_USE: {
    dot: 'bg-green-400',
    cls: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-500/30',
  },
  PENDING_PICKUP: {
    dot: 'bg-yellow-400',
    cls: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500/30',
  },
  PICKING_UP: {
    dot: 'bg-orange-400',
    cls: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-500/30',
  },
  PICKED_UP: {
    dot: 'bg-teal-400',
    cls: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-500/30',
  },
  COMPLETED: {
    dot: 'bg-gray-400',
    cls: 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-white/5 dark:border-white/10',
  },
  CANCELLED: {
    dot: 'bg-red-400',
    cls: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-500/30',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// User Address (nested in RentalOrderResponse)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserAddress {
  userAddressId: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Rental Order Line (per product)
// ─────────────────────────────────────────────────────────────────────────────

export interface RentalOrderLine {
  rentalOrderLineId: string;
  productId: string;
  productColorId: string | null;
  colorNameSnapshot: string | null;
  colorCodeSnapshot: string | null;
  productNameSnapshot: string;
  inventoryItemId: string | null;
  inventorySerialNumber: string | null;
  dailyPriceSnapshot: number;
  depositAmountSnapshot: number;
  rentalDurationDays: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  checkoutConditionNote: string | null;
  checkinConditionNote: string | null;
  itemPenaltyAmount: number;
  photos: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Rental Order Response (full — API-073 / API-074 / API-075)
// ─────────────────────────────────────────────────────────────────────────────

export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string | null;

  // Hub assignment (expanded details from BE)
  hubId: string | null;
  hubCode: string | null;
  hubName: string | null;
  hubAddressLine: string | null;
  hubWard: string | null;
  hubDistrict: string | null;
  hubCity: string | null;
  hubLatitude: number | null;
  hubLongitude: number | null;
  hubPhone: string | null;

  // Staff assignment (nested objects — trả về từ API sau khi gán)
  deliveryStaff: HubStaffResponse | null;
  pickupStaff: HubStaffResponse | null;

  // User address (nested from BE — thay thế delivery* fields cũ)
  userAddressId: string | null;
  userAddress: UserAddress | null;

  // Dates
  expectedDeliveryDate: string | null; // YYYY-MM-DD
  expectedRentalEndDate: string | null; // YYYY-MM-DD
  plannedDeliveryAt: string | null; // ISO datetime
  actualDeliveryAt: string | null;
  actualRentalStartAt: string | null;
  deliveredLatitude: number | null;
  deliveredLongitude: number | null;

  // Issue tracking
  issueReportedAt: string | null;
  issueReportNote: string | null;

  // Pickup
  plannedPickupAt: string | null;
  actualRentalEndAt: string | null;
  pickedUpAt: string | null;
  pickedUpLatitude: number | null;
  pickedUpLongitude: number | null;

  // Status
  status: RentalOrderStatus;

  // Financials
  rentalSubtotalAmount: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  rentalFeeAmount: number;
  depositHoldAmount: number;
  totalPayableAmount: number;
  damagePenaltyAmount: number | null;
  overduePenaltyAmount: number | null;
  provisionalOverduePenaltyAmount: number | null;
  penaltyChargeAmount: number | null;
  depositRefundAmount: number | null;
  totalPaidAmount: number;

  // QR Code (sinh sau khi PAID)
  qrCode: string | null;

  // Timestamps
  placedAt: string; // ISO datetime
  createdAt: string;
  updatedAt: string;

  // Order lines
  rentalOrderLines: RentalOrderLine[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Response
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedRentalOrdersResponse = PaginatedData<RentalOrderResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// List Params (API-075)
// SpringFilter DSL: filter=status:'PENDING_PAYMENT'
// ─────────────────────────────────────────────────────────────────────────────

export interface RentalOrderListParams {
  page?: number;
  size?: number;
  sort?: string; // e.g. "placedAt,desc"
  filter?: string; // SpringFilter DSL
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Inputs
// ─────────────────────────────────────────────────────────────────────────────

/** API-077: Cập nhật trạng thái đơn thuê */
export interface UpdateOrderStatusInput {
  status: RentalOrderStatus;
}

/** API-078: Hủy đơn thuê — POST /rental-orders/{id}/cancel (no body) */

/** API-079: Gia hạn đơn thuê */
export interface ExtendOrderInput {
  additionalRentalDays: number;
}

/** API-080: Gán hub cho đơn thuê */
export interface AssignHubInput {
  hubId: string;
}

/** API-081: Gán nhân viên cho đơn thuê (tất cả tùy chọn) */
export interface AssignStaffInput {
  deliveryStaffId?: string | null;
  pickupStaffId?: string | null;
}

/** API-082: Ghi nhận giao hàng */
export interface RecordDeliveryInput {
  deliveredAt?: string | null;
  deliveredLatitude?: number | null;
  deliveredLongitude?: number | null;
}

/** API-083: Ghi nhận thu hồi */
export interface RecordPickupInput {
  pickedUpAt?: string | null;
  pickedUpLatitude?: number | null;
  pickedUpLongitude?: number | null;
}

/** API-084: Cập nhật phí phạt (split penalty) */
export interface SetPenaltyInput {
  damagePenaltyAmount?: number;
  overduePenaltyAmount?: number;
  penaltyTotal?: number;
  note?: string | null;
}

/** API-079: Report issue / Thu hồi sớm do sự cố (ADMIN only) */
export interface ReportIssueInput {
  status: 'PENDING_PICKUP';
  issueNote: string;
}

/** API-120: Gán nhiều staff vào hub */
export interface AssignStaffToHubInput {
  staffIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff types (dùng trong assign-staff-dialog — lấy từ GET /users)
// ─────────────────────────────────────────────────────────────────────────────

/** Staff option hiển thị trong dialog chọn nhân viên */
export interface StaffOption {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  rolesSecured?: Array<{ roleId: string; name: string; active: boolean }>;
}

/** Hub option hiển thị trong dialog chọn hub */
export interface HubOption {
  hubId: string;
  code: string;
  name: string;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  phone: string | null;
  isActive: boolean;
}
