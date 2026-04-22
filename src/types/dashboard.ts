export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  lastLoginAt: string | null; // ISO datetime string
  roles: Pick<Role, "roleId" | "name">[];
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  roleIds?: string[];
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  roleIds?: string[];
}

export interface Role {
  roleId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Permission {
  permissionId: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  method?: string;
}

export interface CreatePermissionInput {
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface UpdatePermissionInput {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

// ─── Contact Tickets ───────────────────────────────────────────────

export type ContactTicketStatus =
  | "pending"
  | "in_progress"
  | "resolved"
  | "closed";

export interface ContactTicket {
  contactTicketId: string;
  userId: string | null;
  rentalOrderId: string | null;
  handledByUserId: string | null;
  subject: string;
  requestMessage: string;
  status: ContactTicketStatus;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  // Joined / enriched fields (returned by API)
  userFullName?: string | null;
  userEmail?: string | null;
}

export interface ContactTicketListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactTicketStatus | "";
}

export interface UpdateContactTicketStatusInput {
  status: ContactTicketStatus;
  handledByUserId?: string | null;
}

// ─── Rental Orders ────────────────────────────────────────────────

export type RentalOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "ACTIVE"
  | "RETURNING"
  | "COMPLETED"
  | "CANCELLED";

export interface RentalOrderItem {
  rentalOrderItemId: string;
  rentalOrderId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  serialNumber: string;
  dailyPriceSnapshot: number;
  depositSnapshot: number;
  rentalDays: number;
  subtotalFee: number;
}

export interface RentalOrder {
  rentalOrderId: string;
  userId: string;
  deliveryStaffId: string | null;
  pickupStaffId: string | null;
  voucherId: string | null;
  deliveryRecipientName: string;
  deliveryPhone: string;
  deliveryAddressLine: string;
  deliveryWard: string;
  deliveryDistrict: string;
  deliveryCity: string;
  deliveryNote: string | null;
  startDate: string;
  endDate: string;
  plannedDeliveryAt: string | null;
  deliveredAt: string | null;
  plannedPickupAt: string | null;
  pickedUpAt: string | null;
  placedAt: string;
  status: RentalOrderStatus;
  subtotalRentalFee: number;
  voucherCodeSnapshot: string | null;
  voucherDiscountAmount: number;
  totalRentalFee: number;
  totalDeposit: number;
  penaltyTotal: number;
  depositRefundedAmount: number;
  grandTotalPaid: number;
  // Enriched / joined fields
  userFullName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  hubId?: string | null;
  hubName?: string | null;
  deliveryStaffName?: string | null;
  pickupStaffName?: string | null;
  items: RentalOrderItem[];
}

export interface RentalOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: RentalOrderStatus | "";
}

export interface AssignOrderInput {
  hubId?: string | null;
  deliveryStaffId?: string | null;
  pickupStaffId?: string | null;
  plannedDeliveryAt?: string | null;
  plannedPickupAt?: string | null;
}
