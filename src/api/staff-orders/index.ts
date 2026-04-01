/**
 * Staff Orders API
 *
 * Handles all rental-order operations needed by the staff dashboard:
 *  - Listing orders assigned to the current staff member
 *  - Fetching a single order by ID
 *  - Transition actions: confirm, start delivery, record delivery, record pickup, set penalty
 *
 * Includes an adapter that maps backend RentalOrderResponse → DashboardOrder
 * so the existing UI components remain unchanged.
 */

import { apiGet, apiPatch, apiPost, USE_MOCK } from '@/api/client';
import type {
  ApiResponse,
  PaginationResponse,
  RentalOrderApiStatus,
  RentalOrderResponse,
} from '@/types/api.types';
import type {
  DashboardOrder,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  DepositRefundStatus,
} from '@/types/dashboard.types';

// Re-export for convenience
export type { RentalOrderResponse, RentalOrderApiStatus };

// ─── Request types ────────────────────────────────────────────────────────────

export interface UpdateStatusRequest {
  status: RentalOrderApiStatus;
}

export interface RecordDeliveryRequest {
  deliveredAt?: string; // ISO-8601, optional — backend uses now() if omitted
  deliveredLatitude?: number;
  deliveredLongitude?: number;
}

export interface RecordPickupRequest {
  pickedUpAt?: string;
  pickedUpLatitude?: number;
  pickedUpLongitude?: number;
}

export interface SetPenaltyRequest {
  penaltyTotal: number;
  note?: string;
}

// ─── Status mapper ────────────────────────────────────────────────────────────

/**
 * Map backend statuses to the simplified UI status set used by DashboardOrder.
 *
 * Backend flow:
 *   PENDING_PAYMENT → PAID → CONFIRMED → DELIVERING → ACTIVE → RETURNING → COMPLETED
 *
 * Staff-relevant transitions only (skipping customer-facing payment steps):
 *   PAID           → staff confirms → CONFIRMED
 *   CONFIRMED      → staff picks up from hub, starts delivery → DELIVERING
 *   DELIVERING     → staff delivers, records → ACTIVE
 *   ACTIVE         → customer requests pickup → RETURNING
 *   RETURNING      → staff picks up, inspects → COMPLETED
 */
export function mapApiStatusToUi(apiStatus: RentalOrderApiStatus): OrderStatus {
  switch (apiStatus) {
    case 'PENDING_PAYMENT':
      return 'PENDING';
    case 'PAID':
      // Paid-but-unconfirmed orders show in staff list as PENDING (needs confirmation)
      return 'PENDING';
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'DELIVERING':
      return 'DELIVERING';
    case 'ACTIVE':
      return 'ACTIVE';
    case 'RETURNING':
      return 'RETURNING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
}

function derivePaymentStatus(o: RentalOrderResponse): PaymentStatus {
  if (o.status === 'PENDING_PAYMENT') return 'PENDING';
  if (o.totalPaidAmount >= o.totalPayableAmount) return 'PAID';
  if (o.totalPaidAmount > 0) return 'PARTIAL';
  return 'PENDING';
}

function deriveDepositRefundStatus(
  o: RentalOrderResponse,
): DepositRefundStatus {
  if (o.depositRefundAmount <= 0) return 'NOT_REFUNDED';
  if (o.depositRefundAmount >= o.depositHoldAmount) return 'REFUNDED';
  return 'PARTIAL_REFUNDED';
}

function buildDeliveryAddress(o: RentalOrderResponse): string {
  return [
    o.deliveryAddressLine,
    o.deliveryWard,
    o.deliveryDistrict,
    o.deliveryCity,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * Adapt a backend RentalOrderResponse to the DashboardOrder shape expected by
 * staff dashboard UI components.  Fields not available from the order endpoint
 * (e.g. renter CCCD, product images) are left as empty/null — they can be
 * enriched with a subsequent user/product lookup if needed.
 */
export function adaptOrder(o: RentalOrderResponse): DashboardOrder {
  const uiStatus = mapApiStatusToUi(o.status);

  const items: OrderItem[] = (o.orderLines ?? []).map((line) => ({
    rental_order_item_id: line.rentalOrderLineId,
    product_item_id: line.inventoryItemId ?? '',
    product_name: line.productName,
    serial_number: line.serialNumber ?? '',
    category: '',
    daily_price: line.dailyPriceSnapshot,
    deposit_amount: line.depositAmountSnapshot,
    image_url: line.productImageUrl ?? '',
  }));

  return {
    rental_order_id: o.rentalOrderId,
    // Use a short display code derived from the UUID prefix + placed date
    order_code: `SW-${o.placedAt?.slice(0, 10).replace(/-/g, '')}-${o.rentalOrderId.slice(0, 6).toUpperCase()}`,
    hub_id: o.hubId ?? '',
    renter: {
      user_id: o.userId ?? '',
      full_name: o.deliveryRecipientName,
      email: o.userEmail ?? '',
      phone_number: o.deliveryPhone,
      cccd_number: '',
      address: buildDeliveryAddress(o),
    },
    items,
    start_date: o.expectedDeliveryDate ?? o.placedAt?.slice(0, 10) ?? '',
    end_date: o.expectedRentalEndDate ?? '',
    actual_return_date: o.actualRentalEndAt ?? undefined,
    total_rental_fee: o.rentalFeeAmount,
    total_deposit: o.depositHoldAmount,
    total_penalty_amount: o.penaltyTotal,
    status: uiStatus,
    created_at: o.placedAt,
    payment_status: derivePaymentStatus(o),
    deposit_refund_status: deriveDepositRefundStatus(o),
    delivery_latitude: o.deliveryLatitude ?? undefined,
    delivery_longitude: o.deliveryLongitude ?? undefined,
    delivery_address: buildDeliveryAddress(o),
    notes: o.deliveryNote ?? undefined,
    staff_checkin_id: o.deliveryStaffId ?? undefined,
    staff_checkout_id: o.pickupStaffId ?? undefined,
  };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

import { MOCK_ORDERS, MOCK_CURRENT_STAFF } from '@/data/mockDashboard';

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch all rental orders assigned to a specific staff member.
 *
 * Backend: GET /rental-orders?filter=deliveryStaffId:'id' or pickupStaffId:'id'
 *
 * The staff userId is required so the dashboard shows only orders the logged-in
 * staff member is responsible for.
 */
export async function getStaffOrders(
  staffUserId: string,
  params: { page?: number; size?: number; status?: RentalOrderApiStatus } = {},
): Promise<DashboardOrder[]> {
  if (USE_MOCK) {
    return MOCK_ORDERS.filter(
      (o) =>
        o.staff_checkin_id === MOCK_CURRENT_STAFF.staff_id ||
        o.staff_checkout_id === MOCK_CURRENT_STAFF.staff_id,
    );
  }

  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 50));

  // SpringFilter DSL: filter orders where this staff is delivery OR pickup staff
  const filterParts = [
    `deliveryStaffId:'${staffUserId}'`,
    `pickupStaffId:'${staffUserId}'`,
  ];
  let filter = `(${filterParts.join(' or ')})`;
  if (params.status) filter += ` and status:'${params.status}'`;
  qs.set('filter', filter);
  qs.set('sort', 'placedAt,desc');

  const res = await apiGet<
    ApiResponse<PaginationResponse<RentalOrderResponse>>
  >(`/rental-orders?${qs.toString()}`);
  return (res.data?.content ?? []).map(adaptOrder);
}

/**
 * Fetch a single order by ID.
 * GET /rental-orders/{rentalOrderId}
 */
export async function getStaffOrderById(
  orderId: string,
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    return MOCK_ORDERS.find((o) => o.rental_order_id === orderId) ?? null;
  }
  const res = await apiGet<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${orderId}`,
  );
  return res.data ? adaptOrder(res.data) : null;
}

/**
 * PATCH /rental-orders/{id}/status
 * Transition the order to the next status in the state machine.
 *
 * Staff transitions:
 *   PAID → CONFIRMED  (admin/staff confirms after payment)
 *   CONFIRMED → DELIVERING  (staff starts delivery)
 *   DELIVERING → ACTIVE  (recorded via record-delivery, but status can also be set directly)
 *   ACTIVE → RETURNING  (customer initiates return)
 *   RETURNING → COMPLETED  (after record-pickup + inspection)
 */
export async function updateOrderStatus(
  orderId: string,
  status: RentalOrderApiStatus,
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    const uiStatus = mapApiStatusToUi(status);
    const found = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    if (!found) return null;
    return { ...found, status: uiStatus };
  }
  const res = await apiPatch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${orderId}/status`,
    { status } satisfies UpdateStatusRequest,
  );
  return res.data ? adaptOrder(res.data) : null;
}

/**
 * PATCH /rental-orders/{id}/record-delivery
 * Records the physical delivery of goods to the customer.
 * Transitions order: DELIVERING → ACTIVE
 * Inventory: AVAILABLE → RENTED
 */
export async function recordDelivery(
  orderId: string,
  data: RecordDeliveryRequest = {},
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    const found = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    return found ? { ...found, status: 'ACTIVE' } : null;
  }
  const res = await apiPatch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${orderId}/record-delivery`,
    data,
  );
  return res.data ? adaptOrder(res.data) : null;
}

/**
 * PATCH /rental-orders/{id}/record-pickup
 * Records the physical pickup (return) of goods from the customer.
 * Transitions order: RETURNING → COMPLETED (after inspection)
 * Inventory: RENTED → AVAILABLE
 */
export async function recordPickup(
  orderId: string,
  data: RecordPickupRequest = {},
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    const found = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    return found ? { ...found, status: 'COMPLETED' } : null;
  }
  const res = await apiPatch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${orderId}/record-pickup`,
    data,
  );
  return res.data ? adaptOrder(res.data) : null;
}

/**
 * PATCH /rental-orders/{id}/set-penalty
 * Sets the damage penalty amount and computes the deposit refund.
 * depositRefundAmount = depositHoldAmount - penaltyTotal
 */
export async function setPenalty(
  orderId: string,
  data: SetPenaltyRequest,
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    const found = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    return found ? { ...found, total_penalty_amount: data.penaltyTotal } : null;
  }
  const res = await apiPatch<ApiResponse<RentalOrderResponse>>(
    `/rental-orders/${orderId}/set-penalty`,
    data,
  );
  return res.data ? adaptOrder(res.data) : null;
}

/**
 * POST /rental-orders/{id}/cancel
 * Cancels an order. Only allowed when status is PENDING_PAYMENT.
 */
export async function cancelOrder(orderId: string): Promise<void> {
  if (USE_MOCK) return;
  await apiPost(`/rental-orders/${orderId}/cancel`);
}
