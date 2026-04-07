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

// ─── Rental Orders ────────────────────────────────────────────────────────────

/**
 * Staff member info returned by GET /hubs/{hubId}/staff (API-043) and embedded
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

/**
 * Actual backend status enum.
 * The UI layer maps these to the simpler OrderStatus used in DashboardOrder.
 */
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

export interface RentalOrderLinePhotoResponse {
  rentalOrderLinePhotoId: string;
  photoPhase: 'CHECKOUT' | 'CHECKIN';
  photoUrl: string;
  sortOrder: number | null;
}

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
  /** Evidence photos — CHECKOUT phase: taken at hub before delivery; CHECKIN: taken when pickup */
  photos: RentalOrderLinePhotoResponse[];
}

export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string | null;
  // Staff assignment — backend returns either flat IDs or nested objects depending on endpoint.
  // API-076 (list) typically returns flat IDs; API-082 (assign-staff) returns nested objects.
  deliveryStaffId: string | null;
  pickupStaffId: string | null;
  deliveryStaff?: HubStaffResponse | null;
  pickupStaff?: HubStaffResponse | null;
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
