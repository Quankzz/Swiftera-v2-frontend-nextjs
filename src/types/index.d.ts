
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// --- Base Entity ---
export interface BaseEntity {
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  deleted_at?: Date;
}

// --- Users & Roles ---
export interface User extends BaseEntity {
  user_id: string;
  email: string;
  password?: string;
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

// --- Products & Categories ---
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
  image_url: string;
  sort_order?: number;
  is_primary: boolean;
}

export interface ProductItem extends BaseEntity {
  product_item_id: string;
  product_id: string;
  hub_id: string;
  current_daily_price: number;
  serial_number: string;
  status: 'RENTED' | 'AVAILABLE' | string; // Enum
}

// --- Hubs ---
export interface Hub extends BaseEntity {
  hub_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
}

// --- Rental Orders ---
export interface RentalOrder extends BaseEntity {
  rental_order_id: string;
  user_id: string;
  hub_id: string;
  voucher_id?: string;
  staff_checkin_id?: string;
  staff_checkout_id?: string;
  start_date: Date;
  end_date: Date;
  total_rental_fee: number;
  total_deposit: number;
  status: string; // Enum
  total_items: number;
}

export interface RentalOrderItem extends BaseEntity {
  rental_order_item_id: string;
  rental_order_id: string;
  product_item_id: string;
  daily_price: number;
  deposit_amount: number;
  checkin_photo_url?: string;
  checkout_photo_url?: string;
  item_penalty_amount?: number;
  staff_note?: string;
}

// --- Transactions & Contracts ---
export interface Transaction extends BaseEntity {
  transaction_id: string;
  rental_order_id: string;
  transaction_type: string; // Enum
  amount: number;
  payment_method: string;
  status: string; // Enum
  vnp_txn_ref?: string;
  vnp_transaction_no?: string;
  vnp_bank_code?: string;
  vnp_bank_tran_no?: string;
  vnp_response_code?: string;
  description?: string;
}

export interface Contract extends BaseEntity {
  contract_id: string;
  rental_order_id: string;
  otp_code: string;
  signed_at: Date;
  contract_document_url: string;
}

// --- Reviews ---
export interface Review extends BaseEntity {
  review_id: string;
  rental_order_id: string;
  user_id: string;
  product_id: string;
  product_rating: number;
  comment?: string;
}

// --- Vouchers ---
export interface Voucher extends BaseEntity {
  voucher_id: string;
  code: string;
  discount_percent: number;
  max_discount_amount: number;
  min_rental_days: number;
  expires_at: Date;
  usage_limit: number;
}
