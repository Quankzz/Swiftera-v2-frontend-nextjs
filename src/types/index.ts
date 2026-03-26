/**
 * Core domain types derived from the ERD
 * These mirror the backend database schema exactly.
 */

// ─── Base ─────────────────────────────────────────────────────────────────────
export interface BaseEntity {
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Users & Auth ─────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  user_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  cccd_number?: string;
  cccd_front_url?: string;
  cccd_back_url?: string;
  is_verified: boolean;
}

export interface Role extends BaseEntity {
  role_id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Permission extends BaseEntity {
  permission_id: string;
  name: string;
  api_path: string;
  method: string;
  module: string;
}

export interface RoleUser {
  role_id: string;
  user_id: string;
}

export interface RolePermission {
  permission_id: string;
  role_id: string;
}

// ─── Categories & Products ────────────────────────────────────────────────────
export interface Category extends BaseEntity {
  category_id: string;
  parent_id?: string;
  name: string;
  slug: string;
  sort_order?: number;
}

export interface Product extends BaseEntity {
  product_id: string;
  category_id: string;
  name: string;
  daily_price: number;
  old_daily_price?: number;
  deposit_amount: number;
  description?: string;
}

export interface ProductImage extends BaseEntity {
  product_image_id: string;
  product_id: string;
  image_url: string;
  sort_order?: number;
  is_primary: boolean;
}

export type ProductItemStatus = 'RENTED' | 'AVAILABLE' | 'MAINTENANCE';

export interface ProductItem extends BaseEntity {
  product_item_id: string;
  product_id: string;
  hub_id: string;
  current_daily_price: number;
  deposit_amount: number;
  serial_number: string;
  status: ProductItemStatus;
}

// ─── Hubs ─────────────────────────────────────────────────────────────────────
export interface Hub extends BaseEntity {
  hub_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
}

// ─── Rental Orders ────────────────────────────────────────────────────────────
export type RentalOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'ACTIVE'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED';
export type DepositRefundStatus =
  | 'NOT_REFUNDED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

export interface RentalOrder extends BaseEntity {
  rental_order_id: string;
  user_id: string;
  hub_id: string;
  voucher_id?: string;
  staff_checkin_id?: string;
  staff_checkout_id?: string;
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  total_rental_fee: number;
  total_deposit: number;
  total_penalty_amount?: number;
  status: RentalOrderStatus;
  payment_status: PaymentStatus;
  deposit_refund_status?: DepositRefundStatus;
  total_items: number;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_address?: string;
  notes?: string;
}

export type ProductCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface RentalOrderItem extends BaseEntity {
  rental_order_item_id: string;
  rental_order_id: string;
  product_item_id: string;
  daily_price: number;
  deposit_amount: number;
  /** Condition assessed at check-in (before handover) */
  checkin_condition?: ProductCondition;
  /** Photo taken at check-in (before handover) */
  checkin_photo_url?: string;
  /** Condition assessed at check-out (return) */
  checkout_condition?: ProductCondition;
  /** Photo taken at check-out (return) */
  checkout_photo_url?: string;
  item_penalty_amount?: number;
  staff_note?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export type TransactionType =
  | 'RENTAL_PAYMENT'
  | 'DEPOSIT'
  | 'REFUND'
  | 'PENALTY'
  | 'EXTRA_CHARGE';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Transaction extends BaseEntity {
  transaction_id: string;
  rental_order_id: string;
  transaction_type: TransactionType;
  amount: number;
  payment_method: string;
  status: TransactionStatus;
  vnp_txn_ref?: string;
  vnp_transaction_no?: string;
  vnp_bank_code?: string;
  vnp_bank_tran_no?: string;
  vnp_response_code?: string;
  description?: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface Review extends BaseEntity {
  review_id: string;
  rental_order_id: string;
  user_id: string;
  product_id: string;
  product_rating: number;
  comment?: string;
}

// ─── Vouchers ─────────────────────────────────────────────────────────────────
export interface Voucher extends BaseEntity {
  voucher_id: string;
  code: string;
  discount_percent: number;
  max_discount_amount: number;
  min_rental_days: number;
  expires_at: string;
  usage_limit: number;
}
