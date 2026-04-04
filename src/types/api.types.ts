/**
 * Backend API response types.
 * Mirror the actual REST contract from https://swiftera.azurewebsites.net/api/v1
 * These types are intentionally separate from UI domain types so that
 * whoever owns the auth domain can freely merge their work without collision.
 */

// ─── Common wrappers ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
  meta?: {
    timestamp: string;
    instance: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  errors: { code: number; message: string }[];
  meta?: { timestamp: string; instance: string };
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationResponse<T> {
  meta: PaginationMeta;
  content: T[];
}

// ─── IAM ──────────────────────────────────────────────────────────────────────

export interface RoleSecuredResponse {
  roleId: string;
  name: string;
  description: string | null;
  active: boolean;
}

/**
 * Returned by login, verify-active-account, refresh, and GET /auth/account.
 */
export interface UserSecuredResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  biography: string | null;
  avatarUrl: string | null;
  city: string | null;
  nationality: string | null;
  rolesSecured: RoleSecuredResponse[];
  hubId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Returned by POST /auth/login, POST /auth/verify-active-account, GET /auth/refresh.
 * refresh_token is set as an HttpOnly cookie; FE only handles accessToken.
 */
export interface AuthenticationResponse {
  accessToken: string;
  userSecured: UserSecuredResponse;
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export interface HubResponse {
  hubId: string;
  code: string;
  name: string;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Rental Orders ────────────────────────────────────────────────────────────

/**
 * Actual backend status enum.
 * The UI layer maps these to the simpler OrderStatus used in DashboardOrder.
 */
export type RentalOrderApiStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'ACTIVE'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RentalOrderLineResponse {
  rentalOrderLineId: string;
  productId: string;
  /** Backend returns 'productNameSnapshot', not 'productName' */
  productNameSnapshot: string;
  inventoryItemId: string | null;
  /** Backend returns 'inventorySerialNumber', not 'serialNumber' */
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
  // Delivery snapshot
  deliveryRecipientName: string;
  deliveryPhone: string;
  deliveryAddressLine: string | null;
  deliveryWard: string | null;
  deliveryDistrict: string | null;
  deliveryCity: string | null;
  deliveryNote: string | null;
  // Coordinates
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  deliveredLatitude: number | null;
  deliveredLongitude: number | null;
  pickedUpLatitude: number | null;
  pickedUpLongitude: number | null;
  // Dates
  expectedDeliveryDate: string | null;
  expectedRentalEndDate: string | null;
  plannedDeliveryAt: string | null;
  actualDeliveryAt: string | null;
  actualRentalStartAt: string | null;
  actualRentalEndAt: string | null;
  plannedPickupAt: string | null;
  pickedUpAt: string | null;
  placedAt: string;
  // Status & financials
  status: RentalOrderApiStatus;
  rentalSubtotalAmount: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  rentalFeeAmount: number;
  depositHoldAmount: number;
  totalPayableAmount: number;
  totalPaidAmount: number;
  /** Backend returns 'penaltyChargeAmount' (nullable), not 'penaltyTotal' */
  penaltyChargeAmount: number | null;
  depositRefundAmount: number | null;
  // Lines — backend key is 'rentalOrderLines', not 'orderLines'
  rentalOrderLines: RentalOrderLineResponse[];
  // Enriched by backend (if included)
  userEmail?: string | null;
  userFullName?: string | null;
}
