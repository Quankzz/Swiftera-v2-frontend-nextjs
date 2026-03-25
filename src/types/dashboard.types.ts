// ─── Enums ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'ACTIVE'
  | 'RETURNING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type ProductCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED';
export type DepositRefundStatus =
  | 'NOT_REFUNDED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

// ─── Staff & Hub ──────────────────────────────────────────────────────────────
export interface StaffMember {
  staff_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  avatar_url?: string;
  role: 'STAFF' | 'MANAGER';
  hub_id: string;
}

export interface HubInfo {
  hub_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone_number: string;
  manager_name: string;
  open_hours: string;
  tax_code: string;
  representative: string;
}

// ─── Renter ───────────────────────────────────────────────────────────────────
export interface RenterInfo {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  cccd_number: string;
  cccd_front_url?: string;
  cccd_back_url?: string;
  address: string;
  avatar_url?: string;
}

// ─── Order Items ──────────────────────────────────────────────────────────────
export interface OrderItem {
  rental_order_item_id: string;
  product_item_id: string;
  product_name: string;
  serial_number: string;
  category: string;
  daily_price: number;
  deposit_amount: number;
  image_url: string;
  /** Condition before handover (checkin) */
  checkin_condition?: ProductCondition;
  /** Condition after return (checkout) */
  checkout_condition?: ProductCondition;
  /** Photo captured by staff before handover */
  checkin_photo_url?: string;
  /** Photo captured by staff after return */
  checkout_photo_url?: string;
  /** Additional penalty charged for damage */
  item_penalty_amount?: number;
  /** Staff note for this item */
  staff_note?: string;
}

// ─── Staff Location Update ────────────────────────────────────────────────────
export interface StaffLocationUpdate {
  staff_id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

// ─── Dashboard Order (full object for staff portal) ──────────────────────────
export interface DashboardOrder {
  rental_order_id: string;
  order_code: string;
  renter: RenterInfo;
  hub_id: string;
  items: OrderItem[];
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  total_rental_fee: number;
  total_deposit: number;
  total_penalty_amount?: number;
  status: OrderStatus;
  created_at: string;
  /** Staff who handled check-in (handover to customer) */
  staff_checkin_id?: string;
  /** Staff who handled check-out (return from customer) */
  staff_checkout_id?: string;
  payment_status: PaymentStatus;
  deposit_refund_status?: DepositRefundStatus;
  /** Customer coordinates when delivering */
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_address?: string;
  notes?: string;
  /** Current staff location (when delivering) */
  staff_current_latitude?: number;
  staff_current_longitude?: number;
  staff_location_updated_at?: string;
  /** Short code customer shows to staff on delivery to confirm receipt */
  confirmation_code?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
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

// ─── Stats ────────────────────────────────────────────────────────────────────
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

// ─── Activity Log ─────────────────────────────────────────────────────────────
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
