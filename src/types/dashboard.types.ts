export type OrderStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';
export type ProductCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type ProductStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
export type ContractStatus =
  | 'DRAFT'
  | 'SIGNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL';

export interface StaffMember {
  staff_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  role: 'STAFF' | 'MANAGER';
  hub_id: string;
}

export interface HubInfo {
  hub_id: string;
  name: string;
  address: string;
  phone: string;
  manager_name: string;
  open_hours: string;
  tax_code: string;
  representative: string;
}

export interface RenterInfo {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  cccd_number: string;
  address: string;
  avatar_url?: string;
}

export interface OrderItem {
  item_id: string;
  product_name: string;
  serial_number: string;
  category: string;
  daily_price: number;
  deposit_amount: number;
  image_url: string;
  condition?: ProductCondition;
  staff_note?: string;
}

export interface DashboardOrder {
  order_id: string;
  order_code: string;
  renter: RenterInfo;
  hub_id: string;
  items: OrderItem[];
  start_date: string;
  end_date: string;
  total_rental_fee: number;
  total_deposit: number;
  status: OrderStatus;
  created_at: string;
  staff_checkin_id?: string;
  staff_checkout_id?: string;
  payment_status: PaymentStatus;
  notes?: string;
}

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

export interface ContractPhoto {
  id: string;
  url: string;
  caption: string;
  taken_at: string;
}

export interface Contract {
  contract_id: string;
  contract_code: string;
  order_id: string;
  renter: RenterInfo;
  hub: HubInfo;
  staff: StaffMember;
  items: (OrderItem & { photos: ContractPhoto[] })[];
  start_date: string;
  end_date: string;
  total_rental_fee: number;
  total_deposit: number;
  status: ContractStatus;
  signed_at?: string;
  notes?: string;
  created_at: string;
  renter_signature?: string;
  staff_signature?: string;
}

export interface DashboardStats {
  total_orders_today: number;
  pending_orders: number;
  active_rentals: number;
  available_products: number;
  total_revenue_today: number;
  overdue_orders: number;
  total_products: number;
  contracts_today: number;
}

export interface ActivityLog {
  id: string;
  type:
    | 'ORDER_CREATED'
    | 'ORDER_CHECKIN'
    | 'ORDER_CHECKOUT'
    | 'CONTRACT_SIGNED'
    | 'PRODUCT_UPDATED';
  description: string;
  timestamp: string;
  order_id?: string;
  staff_name: string;
}
