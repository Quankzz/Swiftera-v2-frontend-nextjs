// ─── Common ──────────────────────────────────────────────────────────────────

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

/** Returned by login, verify-active-account, refresh, and GET /auth/account. */
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
  hubId: string | null;
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

/**
 * Staff member returned by GET /hubs/{hubId}/staff (API-043) and embedded
 * in RentalOrderResponse as deliveryStaff / pickupStaff (API-082).
 */
export interface HubStaffResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  hubId: string | null;
  hubCode: string | null;
  hubName: string | null;
}

// ─── Rental Orders ────────────────────────────────────────────────────────────

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
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderStatus = RentalOrderApiStatus;

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED';

export type DepositRefundStatus =
  | 'NOT_REFUNDED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

// ─── Nested / embedded types ─────────────────────────────────────────────────

/** QR code photo taken at a specific rental phase. */
export interface RentalOrderLinePhotoResponse {
  rentalOrderLinePhotoId: string;
  photoPhase: 'CHECKOUT' | 'CHECKIN';
  photoUrl: string;
  sortOrder: number | null;
}

/** Embedded hub info on an inventory item line. */
export interface InventoryItemHubResponse {
  hubId: string;
  code: string;
  name: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  isActive: boolean;
}

/** Snapshot of the user's delivery address captured at order placement. */
export interface UserAddressSnapshot {
  userAddressId: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
}

/** One product line within a rental order (maps to one inventory item). */
export interface RentalOrderLineResponse {
  rentalOrderLineId: string;
  productId: string;
  productNameSnapshot: string;
  inventoryItemId: string | null;
  inventorySerialNumber: string | null;
  inventoryItemHub?: InventoryItemHubResponse | null;
  dailyPriceSnapshot: number;
  depositAmountSnapshot: number;
  rentalDurationDays: number;
  itemPenaltyAmount: number;
  checkoutConditionNote: string | null;
  checkinConditionNote: string | null;
  photos: RentalOrderLinePhotoResponse[];
  productColorId: string | null;
  colorNameSnapshot: string | null;
  colorCodeSnapshot: string | null;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
}

/**
 * Full rental order — response shape for API-074, API-075, API-076 and
 * all write endpoints (API-079/084/085/086).
 * Fields with `overdue` / penalty semantics align with API-086A merged into this response.
 */
export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string | null;
  deliveryStaffId: string | null;
  pickupStaffId: string | null;
  deliveryStaff?: HubStaffResponse | null;
  pickupStaff?: HubStaffResponse | null;
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
  userAddressId: string | null;
  userAddress: UserAddressSnapshot | null;
  // Delivery plan
  expectedDeliveryDate: string | null;
  expectedRentalEndDate: string | null;
  plannedDeliveryAt: string | null;
  actualDeliveryAt: string | null;
  actualRentalStartAt: string | null;
  // Pickup plan
  plannedPickupAt: string | null;
  actualRentalEndAt: string | null;
  pickedUpAt: string | null;
  // GPS
  deliveredLatitude: number | null;
  deliveredLongitude: number | null;
  pickedUpLatitude: number | null;
  pickedUpLongitude: number | null;
  // Status
  status: RentalOrderApiStatus;
  // Financials
  rentalSubtotalAmount: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  rentalFeeAmount: number;
  depositHoldAmount: number;
  totalPayableAmount: number;
  totalPaidAmount: number;
  penaltyChargeAmount: number | null;
  damagePenaltyAmount: number | null;
  overduePenaltyAmount: number | null;
  provisionalOverduePenaltyAmount: number | null;
  depositRefundAmount: number | null;
  // Overdue flags (API-086A merged into this response)
  overdue: boolean;
  overdueDays: number | null;
  dailyOverdueRateAmount: number | null;
  finalOverduePenaltyAmount: number | null;
  suggestedTotalPenaltyAmount: number | null;
  suggestedDepositRefundAmount: number | null;
  // Order lines
  rentalOrderLines: RentalOrderLineResponse[];
  // Issue / early return
  issueReportNote: string | null;
  issueReportedAt: string | null;
  // Metadata
  qrCode: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
}

/** Request body for API-086 (set-penalty). */
export interface SetPenaltyRequest {
  damagePenaltyAmount?: number;
  overduePenaltyAmount?: number;
  penaltyTotal?: number;
  note?: string;
}

/**
 * API-086A response — overdue penalty suggestion.
 * API-086 fields (overdue, overdueDays, dailyOverdueRateAmount, provisionalOverduePenaltyAmount,
 * finalOverduePenaltyAmount, suggestedTotalPenaltyAmount, suggestedDepositRefundAmount) are
 * also merged directly into RentalOrderResponse, so this type is only needed for the dedicated
 * GET /overdue-penalty-suggestion endpoint.
 */
export interface OverduePenaltySuggestionResponse {
  rentalOrderId: string;
  status: RentalOrderApiStatus;
  overdue: boolean;
  expectedRentalEndDate: string | null;
  actualRentalEndAt: string | null;
  overdueDays: number | null;
  dailyOverdueRateAmount: number | null;
  provisionalOverduePenaltyAmount: number | null;
  finalOverduePenaltyAmount: number | null;
  damagePenaltyAmount: number | null;
  suggestedTotalPenaltyAmount: number | null;
  suggestedDepositRefundAmount: number | null;
}

/** API-082 response — staff + hub detail embedded in a rental order. */
export interface RentalOrderStaffDetailResponse {
  rentalOrderId: string;
  status: RentalOrderApiStatus;
  hub: HubResponse;
  deliveryStaff: HubStaffResponse | null;
  pickupStaff: HubStaffResponse | null;
}
