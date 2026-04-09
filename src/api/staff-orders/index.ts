import { apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
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

export type StaffTransitionTargetStatus = Extract<
  OrderStatus,
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'COMPLETED'
>;

export interface ApplyStaffOrderTransitionRequest {
  orderId: string;
  targetStatus: StaffTransitionTargetStatus;
  latitude?: number;
  longitude?: number;
  penaltyTotal?: number;
  note?: string;
}

// ─── Status mapper ────────────────────────────────────────────────────────────

/**
 * Map backend statuses to UI OrderStatus. Now 1:1 since UI uses actual backend statuses.
 *
 * Backend flow (doc 09 Appendix C, authoritative):
 *   PENDING_PAYMENT → PAID → PREPARING → DELIVERING → DELIVERED
 *     → IN_USE / PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED
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

  const items: OrderItem[] = (o.rentalOrderLines ?? []).map((line) => {
    const photos = line.photos ?? [];
    const checkoutPhotos = photos
      .filter((p) => p.photoPhase === 'CHECKOUT')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((p) => p.photoUrl);
    const checkinPhotos = photos
      .filter((p) => p.photoPhase === 'CHECKIN')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((p) => p.photoUrl);

    return {
      rental_order_item_id: line.rentalOrderLineId,
      product_item_id: line.inventoryItemId ?? '',
      product_name: line.productNameSnapshot,
      serial_number: line.inventorySerialNumber ?? '',
      category: '',
      daily_price: line.dailyPriceSnapshot,
      deposit_amount: line.depositAmountSnapshot,
      image_url: '',
      item_penalty_amount: line.itemPenaltyAmount,
      checkout_photos: checkoutPhotos,
      checkin_photos: checkinPhotos,
      checkout_photo_url: checkoutPhotos[0],
      checkin_photo_url: checkinPhotos[0],
      checkout_condition_note: line.checkoutConditionNote ?? undefined,
      checkin_condition_note: line.checkinConditionNote ?? undefined,
      staff_note:
        line.checkoutConditionNote ?? line.checkinConditionNote ?? undefined,
    };
  });

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
    // Backend may return the staff ID as a flat field (deliveryStaffId) OR as a
    // nested object (deliveryStaff.userId). Read both to be robust.
    staff_checkin_id: o.deliveryStaffId ?? o.deliveryStaff?.userId ?? undefined,
    staff_checkout_id: o.pickupStaffId ?? o.pickupStaff?.userId ?? undefined,
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

// All active workflow statuses for staff dashboard
const ACTIVE_STAFF_STATUSES: RentalOrderApiStatus[] = [
  'PAID',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'PENDING_PICKUP',
  'PICKING_UP',
  'PICKED_UP',
  'COMPLETED',
];

/**
 * Build and execute two parallel SpringFilter queries by staff user ID.
 *
 * NOTE: `deliveryStaffId` / `pickupStaffId` are DTO projection fields — they
 * are NOT JPA entity fields and SpringFilter cannot filter by them (→ 500).
 * The correct JPA dot-notation for the ManyToOne relationship is:
 *   deliveryStaff.userId  /  pickupStaff.userId
 *
 * Two separate calls are required because SpringFilter does not support
 * nested (A or B) AND C expressions reliably.
 *
 * Delivery workflow:  PAID → PREPARING → DELIVERING → DELIVERED
 * Recovery workflow:  PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED
 *
 * @param staffUserId  UUID of the staff member
 * @param onlyStatuses Optional subset of statuses to fetch (e.g. ['PAID','PENDING_PICKUP'])
 *                     Defaults to all 8 active workflow statuses.
 */
async function fetchOrdersByStaffId(
  staffUserId: string,
  onlyStatuses: RentalOrderApiStatus[] = ACTIVE_STAFF_STATUSES,
): Promise<DashboardOrder[]> {
  const makeUrl = (
    staffField: 'deliveryStaff.userId' | 'pickupStaff.userId',
    statuses: RentalOrderApiStatus[],
  ) => {
    const statusPart = statuses.map((s) => `status:'${s}'`).join(' or ');
    const filter = `${staffField}:'${staffUserId}' and (${statusPart})`;
    return `/rental-orders?page=1&size=200&filter=${encodeURIComponent(filter)}&sort=placedAt,desc`;
  };

  // Delivery statuses only for deliveryStaff query, pickup statuses for pickupStaff
  const deliveryStatuses = onlyStatuses.filter((s) =>
    ['PAID', 'PREPARING', 'DELIVERING', 'DELIVERED'].includes(s),
  );
  const pickupStatuses = onlyStatuses.filter((s) =>
    ['PENDING_PICKUP', 'PICKING_UP', 'PICKED_UP', 'COMPLETED'].includes(s),
  );

  console.log('[getStaffOrders] staffUserId:', staffUserId);

  const requests: Promise<PaginationResponse<RentalOrderResponse> | null>[] =
    [];

  if (deliveryStatuses.length > 0) {
    const url = makeUrl('deliveryStaff.userId', deliveryStatuses);
    console.log('[getStaffOrders] GET (delivery)', url);
    requests.push(
      apiGet<PaginationResponse<RentalOrderResponse>>(url).catch((err) => {
        console.error(
          '[getStaffOrders] delivery query error:',
          err?.message ?? err,
        );
        return null;
      }),
    );
  } else {
    requests.push(Promise.resolve(null));
  }

  if (pickupStatuses.length > 0) {
    const url = makeUrl('pickupStaff.userId', pickupStatuses);
    console.log('[getStaffOrders] GET (pickup)', url);
    requests.push(
      apiGet<PaginationResponse<RentalOrderResponse>>(url).catch((err) => {
        console.error(
          '[getStaffOrders] pickup query error:',
          err?.message ?? err,
        );
        return null;
      }),
    );
  } else {
    requests.push(Promise.resolve(null));
  }

  const [deliveryRes, pickupRes] = await Promise.all(requests);

  const deliveryRaw = deliveryRes?.content ?? [];
  const pickupRaw = pickupRes?.content ?? [];
  console.log(
    '[getStaffOrders] from BE — delivery:',
    deliveryRaw.length,
    '| pickup:',
    pickupRaw.length,
  );

  // Merge + dedup (an order could appear in both if same staff covers both roles)
  const seen = new Set<string>();
  const merged: RentalOrderResponse[] = [];
  for (const o of [...deliveryRaw, ...pickupRaw]) {
    if (!seen.has(o.rentalOrderId)) {
      seen.add(o.rentalOrderId);
      merged.push(o);
    }
  }

  const result = merged.map(adaptOrder);
  console.log(
    `[getStaffOrders] assigned to ${staffUserId}:`,
    result.length,
    'orders',
  );
  return result;
}

/** All orders assigned to staff (all active statuses — used by dashboard). */
export function getStaffOrders(staffUserId: string): Promise<DashboardOrder[]> {
  return fetchOrdersByStaffId(staffUserId);
}

/**
 * Only PAID + PENDING_PICKUP orders — "action needed" list for the orders page.
 * Staff must confirm PAID orders and perform PENDING_PICKUP pickups.
 */
export function getStaffActionOrders(
  staffUserId: string,
): Promise<DashboardOrder[]> {
  return fetchOrdersByStaffId(staffUserId, ['PAID', 'PENDING_PICKUP']);
}

/**
 * Fetch a single order by ID.
 * GET /rental-orders/{rentalOrderId}
 */
export async function getStaffOrderById(
  orderId: string,
): Promise<DashboardOrder | null> {
  const res = await apiGet<RentalOrderResponse>(`/rental-orders/${orderId}`);
  return res ? adaptOrder(res) : null;
}

/**
 * PATCH /rental-orders/{id}/status
 * Transition the order to the next status in the state machine.
 *
 * Staff transitions (doc 09 API-078):
 *   PAID → PREPARING  (staff confirms and starts preparing)
 *   PREPARING → DELIVERING  (staff picks up from hub, starts delivery)
 *   PENDING_PICKUP → PICKING_UP  (staff starts pickup)
 *   PICKED_UP → COMPLETED  (inspection done at hub, order finalized)
 */
export async function updateOrderStatus(
  orderId: string,
  status: RentalOrderApiStatus,
): Promise<DashboardOrder | null> {
  console.log('[staff-orders] PATCH status', { orderId, status });
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/status`,
    { status } satisfies UpdateStatusRequest,
  );
  return res ? adaptOrder(res) : null;
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
  console.log('[staff-orders] PATCH record-delivery', { orderId, data });
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-delivery`,
    data,
  );
  return res ? adaptOrder(res) : null;
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
  console.log('[staff-orders] PATCH record-pickup', { orderId, data });
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-pickup`,
    data,
  );
  return res ? adaptOrder(res) : null;
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
  console.log('[staff-orders] PATCH set-penalty', { orderId, data });
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/set-penalty`,
    data,
  );
  return res ? adaptOrder(res) : null;
}

/**
 * Resolve one staff workflow step to the correct backend endpoint.
 * This keeps UI code from spreading transition-specific API knowledge.
 */
export async function applyStaffOrderTransition({
  orderId,
  targetStatus,
  latitude,
  longitude,
  penaltyTotal,
  note,
}: ApplyStaffOrderTransitionRequest): Promise<DashboardOrder | null> {
  console.log('[staff-orders] apply transition', {
    orderId,
    targetStatus,
    latitude,
    longitude,
    penaltyTotal,
    note,
  });

  switch (targetStatus) {
    case 'DELIVERED':
      return recordDelivery(orderId, {
        deliveredLatitude: latitude,
        deliveredLongitude: longitude,
      });

    case 'PICKED_UP':
      if (penaltyTotal !== undefined || note) {
        await setPenalty(orderId, {
          penaltyTotal: penaltyTotal ?? 0,
          note,
        });
      }
      return recordPickup(orderId, {
        pickedUpLatitude: latitude,
        pickedUpLongitude: longitude,
      });

    case 'COMPLETED':
      if (penaltyTotal !== undefined || note) {
        await setPenalty(orderId, {
          penaltyTotal: penaltyTotal ?? 0,
          note,
        });
      }
      return updateOrderStatus(orderId, 'COMPLETED');

    case 'PREPARING':
    case 'DELIVERING':
    case 'PICKING_UP':
      return updateOrderStatus(orderId, targetStatus);

    default:
      throw new Error(
        `Transition không được hỗ trợ cho staff: ${targetStatus}`,
      );
  }
}

/**
 * POST /rental-orders/{id}/cancel
 * Cancels an order. Only allowed when status is PENDING_PAYMENT.
 */
export async function cancelOrder(orderId: string): Promise<void> {
  await apiPost(`/rental-orders/${orderId}/cancel`);
}
