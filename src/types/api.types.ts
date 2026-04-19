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

/** Derived UI-only status - never comes from backend */
export type OverdueStatus = 'OVERDUE';

/** Full UI order status (includes derived OVERDUE) */
export type OrderStatus = RentalOrderApiStatus | OverdueStatus;

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED';

export type DepositRefundStatus =
  | 'NOT_REFUNDED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

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
  /** Evidence photos - CHECKOUT: taken at hub before delivery; CHECKIN: taken when pickup */
  photos: RentalOrderLinePhotoResponse[];
  /** Color info from inventory item */
  productColorId: string | null;
  colorNameSnapshot: string | null;
  colorCodeSnapshot: string | null;
  /** Voucher info at line level */
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
}

/**
 * Backend RentalOrderResponse (API-074 / API-075 / API-076).
 * Source: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md - Module 11: RENTAL ORDERS
 */
export interface RentalOrderResponse {
  rentalOrderId: string;
  userId: string | null;
  // Staff assignment - API-076 (list) returns flat IDs;
  // API-082 (assign-staff) returns nested HubStaffResponse objects.
  deliveryStaffId: string | null;
  pickupStaffId: string | null;
  deliveryStaff?: HubStaffResponse | null;
  pickupStaff?: HubStaffResponse | null;
  hubId: string | null;
  hubName: string | null;
  // Delivery snapshot
  deliveryRecipientName: string;
  deliveryPhone: string;
  /** Optional user address object returned by some backend endpoints */
  userAddress?: {
    recipientName?: string | null;
    phoneNumber?: string | null;
    addressLine?: string | null;
    ward?: string | null;
    district?: string | null;
    city?: string | null;
  } | null;
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
  /** Backend field name: 'penaltyChargeAmount' (nullable) */
  penaltyChargeAmount: number | null;
  damagePenaltyAmount: number | null;
  overduePenaltyAmount: number | null;
  provisionalOverduePenaltyAmount: number | null;
  depositRefundAmount: number | null;
  /** Backend key is 'rentalOrderLines', not 'orderLines' */
  rentalOrderLines: RentalOrderLineResponse[];
  /** QR code as base64 PNG data URI - bind directly to <img src>. Backend generates on PAID. */
  qrCode: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  userEmail?: string | null;
  userFullName?: string | null;
}

// ─── Staff Dashboard UI Types ────────────────────────────────────────────────

/**
 * Renter / customer information embedded in a staff dashboard order.
 *
 * NOTE on CCCD: Backend does NOT return CCCD/ID card data in RentalOrderResponse.
 * The fields below reflect what IS available from the API. Fields marked (n/a BE)
 * are populated from delivery snapshot fields, not from a user profile lookup.
 */
export interface RenterInfo {
  user_id: string;
  /** From deliveryRecipientName snapshot - not the user's legal name */
  full_name: string;
  /** From RentalOrderResponse.userEmail - BE enriched field */
  email: string;
  /** From deliveryPhone snapshot */
  phone_number: string;
  /** (n/a BE) Always empty string; BE does not expose CCCD in order API */
  cccd_number: string;
  /** (n/a BE) Always empty string */
  cccd_front_url?: string;
  /** (n/a BE) Always empty string */
  cccd_back_url?: string;
  /** Computed: addressLine + ward + district + city from delivery snapshot */
  address: string;
  /** (n/a BE) Always empty string */
  avatar_url?: string;
}

/**
 * An individual rental item within a staff dashboard order.
 * Derived from RentalOrderLineResponse + embedded inventory item data.
 */
export interface StaffOrderItem {
  rental_order_item_id: string;
  product_item_id: string;
  product_name: string;
  serial_number: string;
  /** (n/a BE) Category is not exposed in order line - always empty string */
  category: string;
  daily_price: number;
  deposit_amount: number;
  /** Primary image: first CHECKOUT photo or first CHECKIN photo */
  image_url: string;
  /** First CHECKIN phase photo URL (when recovering goods) */
  checkin_photo_url?: string;
  /** First CHECKOUT phase photo URL (taken at hub before delivery) */
  checkout_photo_url?: string;
  /** All CHECKOUT phase photo URLs */
  checkout_photos: string[];
  /** All CHECKIN phase photo URLs */
  checkin_photos: string[];
  /** Staff note at checkout (hub, before delivery) */
  checkout_condition_note?: string;
  /** Staff note at checkin (return from customer) */
  checkin_condition_note?: string;
  /** Combined note from both phases */
  staff_note?: string;
  /** Item-level penalty charged for damage */
  item_penalty_amount: number;
}

/**
 * Full staff-facing order object used throughout the staff dashboard.
 * Built from RentalOrderResponse via adaptStaffOrder() in staff-orders/index.ts.
 *
 * Field naming follows DashboardOrder conventions for UI compatibility,
 * while values are populated directly from the authoritative backend response.
 */
export interface StaffOrder {
  rental_order_id: string;
  /** Human-readable code: SW-YYYYMMDD-XXXXXX (derived from placedAt + rentalOrderId) */
  order_code: string;
  renter: RenterInfo;
  hub_id: string;
  items: StaffOrderItem[];
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  total_rental_fee: number;
  total_deposit: number;
  total_penalty_amount: number;
  status: OrderStatus;
  created_at: string;
  /** Staff who handled handover to customer (deliveryStaff.userId) */
  staff_checkin_id?: string;
  /** Staff who handled pickup from customer (pickupStaff.userId) */
  staff_checkout_id?: string;
  payment_status: PaymentStatus;
  deposit_refund_status?: DepositRefundStatus;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_address?: string;
  notes?: string;
  /** QR code: base64 PNG data URI from RentalOrderResponse.qrCode */
  qr_code?: string | null;
  /** Short code customer shows to staff on delivery - from qrCode token (BE generates internally) */
  confirmation_code?: string;
}

// ─── Admin Dashboard Types ──────────────────────────────────────────────────

export type ProductCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

/** Inventory item overview for admin dashboard (not the full order-line item) */
export interface DashboardProduct {
  product_item_id: string;
  product_id: string;
  product_name: string;
  serial_number: string;
  category: string;
  current_daily_price: number;
  deposit_amount: number;
  status: ProductStatus;
  image_url: string;
  last_rented_at?: string;
  condition: ProductCondition;
  hub_id: string;
  current_order_id?: string;
}

/** Aggregated stats for admin dashboard page */
export interface DashboardStats {
  total_orders: number;
  pending_orders: number;
  active_orders: number;
  overdue_orders: number;
  delivering_orders: number;
  returning_orders: number;
  completed_today: number;
  total_products: number;
  available_products: number;
  rented_products: number;
  maintenance_products: number;
  total_revenue_today: number;
  total_deposit_held: number;
}

/** Staff activity log entry */
export interface ActivityLog {
  id: string;
  type:
    | 'ORDER_CREATED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_DELIVERING'
    | 'ORDER_ACTIVE'
    | 'ORDER_RETURNING'
    | 'ORDER_COMPLETED'
    | 'ORDER_OVERDUE'
    | 'PHOTO_UPLOADED'
    | 'LOCATION_UPDATED'
    | 'DEPOSIT_REFUNDED'
    | 'PENALTY_APPLIED';
  order_code?: string;
  order_id?: string;
  message: string;
  created_at: string;
  staff_name?: string;
}
