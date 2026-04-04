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
 * Map backend statuses to UI OrderStatus. Now 1:1 since UI uses actual backend statuses.
 *
 * Backend flow:
 *   PENDING_PAYMENT → PAID → PREPARING → DELIVERING → DELIVERED
 *     → IN_USE / PENDING_PICKUP → PICKING_UP → PICKED_UP → INSPECTING → COMPLETED
 *
 * OVERDUE is derived client-side: IN_USE + past expectedRentalEndDate.
 */
export function mapApiStatusToUi(apiStatus: RentalOrderApiStatus): OrderStatus {
  switch (apiStatus) {
    case 'PENDING_PAYMENT':
      return 'PENDING_PAYMENT'; // shouldn't appear in staff view
    case 'PAID':
      return 'PAID';
    case 'PREPARING':
      return 'PREPARING';
    case 'DELIVERING':
      return 'DELIVERING';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'IN_USE':
      return 'IN_USE';
    case 'PENDING_PICKUP':
      return 'PENDING_PICKUP';
    case 'PICKING_UP':
      return 'PICKING_UP';
    case 'PICKED_UP':
      return 'PICKED_UP';
    case 'INSPECTING':
      return 'INSPECTING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'CANCELLED';
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
  const refund = o.depositRefundAmount ?? 0;
  if (refund <= 0) return 'NOT_REFUNDED';
  if (refund >= o.depositHoldAmount) return 'REFUNDED';
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
  let uiStatus = mapApiStatusToUi(o.status);

  // Derive OVERDUE: backend has no OVERDUE status. If the order is IN_USE
  // and the expected rental end date has already passed, surface it as OVERDUE
  // so staff can act on it immediately.
  if (uiStatus === 'IN_USE' && o.expectedRentalEndDate) {
    if (new Date(o.expectedRentalEndDate).getTime() < Date.now()) {
      uiStatus = 'OVERDUE';
    }
  }

  const items: OrderItem[] = (o.rentalOrderLines ?? []).map((line) => ({
    rental_order_item_id: line.rentalOrderLineId,
    product_item_id: line.inventoryItemId ?? '',
    product_name: line.productNameSnapshot,
    serial_number: line.inventorySerialNumber ?? '',
    category: '',
    daily_price: line.dailyPriceSnapshot,
    deposit_amount: line.depositAmountSnapshot,
    image_url: '',
    item_penalty_amount: line.itemPenaltyAmount,
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
    total_penalty_amount: o.penaltyChargeAmount ?? 0,
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
  qs.set('size', String(params.size ?? 200));

  // SpringFilter on this endpoint does NOT support filtering by relationship
  // fields (deliveryStaffId / deliveryStaff.userId both return 500).
  // Workaround: fetch all orders in the staff-relevant statuses, then filter
  // client-side by deliveryStaffId / pickupStaffId from the response payload.
  // Parentheses required by SpringFilter DSL when combining multiple OR terms.
  const staffStatuses: RentalOrderApiStatus[] = params.status
    ? [params.status]
    : [
        'PAID',
        'PREPARING',
        'DELIVERING',
        'DELIVERED',
        'IN_USE',
        'PENDING_PICKUP',
        'PICKING_UP',
        'PICKED_UP',
        'INSPECTING',
        'COMPLETED',
      ];

  // Per doc-09 filter format: filter=status:'PAID' — wrap OR list in parens
  const statusFilter = staffStatuses.map((s) => `status:'${s}'`).join(' or ');
  qs.set('filter', `(${statusFilter})`);
  qs.set('sort', 'placedAt,desc');

  const res = await apiGet<
    ApiResponse<PaginationResponse<RentalOrderResponse>>
  >(`/rental-orders?${qs.toString()}`);

  const all = (res.data?.content ?? []).map(adaptOrder);

  // Client-side staff filter: only show orders assigned to the logged-in staff.
  return all.filter(
    (o) =>
      o.staff_checkin_id === staffUserId || o.staff_checkout_id === staffUserId,
  );
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
 *   PAID → PREPARING  (staff confirms and starts preparing)
 *   PREPARING → DELIVERING  (staff picks up from hub, starts delivery)
 *   IN_USE / PENDING_PICKUP → PICKING_UP  (staff starts pickup)
 *   PICKED_UP → INSPECTING  (staff starts inspection at hub)
 *   INSPECTING → COMPLETED  (inspection done, order finalized)
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
    return found ? { ...found, status: 'DELIVERED' } : null;
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
 * Transitions order: PICKING_UP → PICKED_UP
 * Inventory: RENTED → AVAILABLE
 */
export async function recordPickup(
  orderId: string,
  data: RecordPickupRequest = {},
): Promise<DashboardOrder | null> {
  if (USE_MOCK) {
    const found = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    return found ? { ...found, status: 'PICKED_UP' } : null;
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
