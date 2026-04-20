import { apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  PaginationResponse,
  RentalOrderApiStatus,
  RentalOrderResponse,
  StaffOrder,
  StaffOrderItem,
  RenterInfo,
  OrderStatus,
  PaymentStatus,
  DepositRefundStatus,
} from '@/types/api.types';

// Re-exports
export type { RentalOrderResponse, RentalOrderApiStatus, StaffOrder };

// ─── Request types ────────────────────────────────────────────────────────────

export interface UpdateStatusRequest {
  status: RentalOrderApiStatus;
}

export interface RecordDeliveryRequest {
  deliveredAt?: string;
  deliveredLatitude?: number;
  deliveredLongitude?: number;
}

export interface RecordPickupRequest {
  pickedAt?: string;
  pickedUpLatitude?: number;
  pickedUpLongitude?: number;
}

export interface SetPenaltyRequest {
  penaltyTotal?: number;
  damagePenaltyAmount?: number;
  overduePenaltyAmount?: number;
  note?: string;
}

export type StaffTransitionTargetStatus = Extract<
  OrderStatus,
  'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'PICKING_UP' | 'PICKED_UP' | 'COMPLETED'
>;

// ─── Status mapper ────────────────────────────────────────────────────────────

/**
 * Map backend status to UI OrderStatus.
 *
 * Backend flow:
 *   PENDING_PAYMENT → PAID → PREPARING → DELIVERING → DELIVERED
 *     → IN_USE / PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED
 *   or: PENDING_PAYMENT → CANCELLED
 *
 * OVERDUE is derived client-side: IN_USE + past expectedRentalEndDate.
 * Backend has NO OVERDUE status.
 */
export function mapApiStatusToUi(apiStatus: RentalOrderApiStatus): OrderStatus {
  switch (apiStatus) {
    case 'PENDING_PAYMENT': return 'PENDING_PAYMENT';
    case 'PAID': return 'PAID';
    case 'PREPARING': return 'PREPARING';
    case 'DELIVERING': return 'DELIVERING';
    case 'DELIVERED': return 'DELIVERED';
    case 'IN_USE': return 'IN_USE';
    case 'PENDING_PICKUP': return 'PENDING_PICKUP';
    case 'PICKING_UP': return 'PICKING_UP';
    case 'PICKED_UP': return 'PICKED_UP';
    case 'COMPLETED': return 'COMPLETED';
    case 'CANCELLED': return 'CANCELLED';
    default: return 'CANCELLED';
  }
}

// ─── Derivation helpers ────────────────────────────────────────────────────────

function derivePaymentStatus(o: RentalOrderResponse): PaymentStatus {
  if (o.status === 'PENDING_PAYMENT') return 'PENDING';
  if (o.totalPaidAmount >= o.totalPayableAmount) return 'PAID';
  if (o.totalPaidAmount > 0) return 'PARTIAL';
  return 'PENDING';
}

function deriveDepositRefundStatus(o: RentalOrderResponse): DepositRefundStatus {
  if (o.status !== 'COMPLETED') return 'NOT_REFUNDED';

  const refund = o.depositRefundAmount ?? 0;
  if (refund <= 0) return 'NOT_REFUNDED';
  if (refund >= o.depositHoldAmount) return 'REFUNDED';
  return 'PARTIAL_REFUNDED';
}

function buildDeliveryAddress(o: RentalOrderResponse): string {
  // Ưu tiên userAddress (nơi BE lưu địa chỉ đầy đủ)
  if (o.userAddress) {
    return [o.userAddress.addressLine, o.userAddress.ward, o.userAddress.district, o.userAddress.city]
      .filter(Boolean)
      .join(', ');
  }
  // Fallback về delivery snapshot fields
  return [o.deliveryAddressLine, o.deliveryWard, o.deliveryDistrict, o.deliveryCity]
    .filter(Boolean)
    .join(', ');
}

function buildRenter(o: RentalOrderResponse): RenterInfo {
  // Lấy thông tin từ userAddress (nơi BE lưu thông tin khách hàng)
  const ua = o.userAddress;
  return {
    user_id: o.userId ?? '',
    // Ưu tiên: recipientName từ userAddress > deliveryRecipientName
    full_name: ua?.recipientName ?? o.deliveryRecipientName ?? '',
    email: o.userEmail ?? '',
    // Ưu tiên: phoneNumber từ userAddress > deliveryPhone
    phone_number: ua?.phoneNumber ?? o.deliveryPhone ?? '',
    cccd_number: '',
    address: buildDeliveryAddress(o),
  };
}

function buildStaffOrderItems(_o: RentalOrderResponse): StaffOrderItem[] {
  return (_o.rentalOrderLines ?? []).map((line) => {
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
      image_url: checkoutPhotos[0] ?? checkinPhotos[0] ?? '',
      checkin_photo_url: checkinPhotos[0],
      checkout_photo_url: checkoutPhotos[0],
      checkout_photos: checkoutPhotos,
      checkin_photos: checkinPhotos,
      checkout_condition_note: line.checkoutConditionNote ?? undefined,
      checkin_condition_note: line.checkinConditionNote ?? undefined,
      staff_note: line.checkoutConditionNote ?? line.checkinConditionNote ?? undefined,
      item_penalty_amount: line.itemPenaltyAmount,
    };
  });
}

// ─── Adapter ─────────────────────────────────────────────────────────────────

/**
 * Adapt a backend RentalOrderResponse to StaffOrder (staff dashboard UI shape).
 * Source: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md - API-074 / API-075 / API-076
 *
 * Fields not available from BE (always empty / undefined):
 *   - cccd_number, cccd_front_url, cccd_back_url (BE does not expose CCCD in order API)
 *   - avatar_url (BE not exposed)
 *   - category (BE not exposed in order line)
 */
export function adaptStaffOrder(o: RentalOrderResponse): StaffOrder {
  let uiStatus = mapApiStatusToUi(o.status);

  // Derive OVERDUE client-side: IN_USE + past expectedRentalEndDate
  if (uiStatus === 'IN_USE' && o.expectedRentalEndDate) {
    if (new Date(o.expectedRentalEndDate).getTime() < Date.now()) {
      uiStatus = 'OVERDUE';
    }
  }

  return {
    rental_order_id: o.rentalOrderId,
    order_code: `SW-${(o.placedAt ?? '').slice(0, 10).replace(/-/g, '')}-${o.rentalOrderId.slice(0, 6).toUpperCase()}`,
    hub_id: o.hubId ?? '',
    renter: buildRenter(o),
    items: buildStaffOrderItems(o),
    start_date: o.expectedDeliveryDate ?? o.placedAt?.slice(0, 10) ?? '',
    end_date: o.expectedRentalEndDate ?? '',
    actual_return_date: o.actualRentalEndAt ?? undefined,
    total_rental_fee: o.rentalFeeAmount,
    total_deposit: o.depositHoldAmount,
    total_penalty_amount: o.penaltyChargeAmount ?? 0,
    overdue_penalty_amount: o.overduePenaltyAmount ?? 0,
    status: uiStatus,
    created_at: o.placedAt,
    staff_checkin_id: o.deliveryStaffId ?? o.deliveryStaff?.userId,
    staff_checkout_id: o.pickupStaffId ?? o.pickupStaff?.userId,
    payment_status: derivePaymentStatus(o),
    deposit_refund_status: deriveDepositRefundStatus(o),
    delivery_latitude: o.deliveryLatitude ?? undefined,
    delivery_longitude: o.deliveryLongitude ?? undefined,
    delivery_address: buildDeliveryAddress(o),
    notes: o.deliveryNote ?? undefined,
    qr_code: o.qrCode,
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

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
 * Fetch orders assigned to a staff member.
 * Two parallel SpringFilter queries: deliveryStaff.userId + pickupStaff.userId.
 */
async function fetchOrdersByStaffId(
  staffUserId: string,
  statuses: RentalOrderApiStatus[] = ACTIVE_STAFF_STATUSES,
): Promise<StaffOrder[]> {
  const makeUrl = (
    staffField: 'deliveryStaff.userId' | 'pickupStaff.userId',
    active: RentalOrderApiStatus[],
  ) => {
    const statusPart = active.map((s) => `status:'${s}'`).join(' or ');
    const filter = `${staffField}:'${staffUserId}' and (${statusPart})`;
    return `/rental-orders?page=1&size=200&filter=${encodeURIComponent(filter)}&sort=placedAt,desc`;
  };

  const deliveryStatuses = statuses.filter((s) =>
    ['PAID', 'PREPARING', 'DELIVERING', 'DELIVERED'].includes(s),
  );
  const pickupStatuses = statuses.filter((s) =>
    ['PENDING_PICKUP', 'PICKING_UP', 'PICKED_UP', 'COMPLETED'].includes(s),
  );

  const [deliveryRes, pickupRes] = await Promise.all([
    deliveryStatuses.length > 0
      ? apiGet<PaginationResponse<RentalOrderResponse>>(
          makeUrl('deliveryStaff.userId', deliveryStatuses),
        ).catch(() => null)
      : Promise.resolve(null),
    pickupStatuses.length > 0
      ? apiGet<PaginationResponse<RentalOrderResponse>>(
          makeUrl('pickupStaff.userId', pickupStatuses),
        ).catch(() => null)
      : Promise.resolve(null),
  ]);

  const deliveryRaw = deliveryRes?.content ?? [];
  const pickupRaw = pickupRes?.content ?? [];

  // Merge + dedup
  const seen = new Set<string>();
  const merged: RentalOrderResponse[] = [];
  for (const o of [...deliveryRaw, ...pickupRaw]) {
    if (!seen.has(o.rentalOrderId)) {
      seen.add(o.rentalOrderId);
      merged.push(o);
    }
  }

  return merged.map(adaptStaffOrder);
}

/** All active orders assigned to staff. */
export function getStaffOrders(staffUserId: string): Promise<StaffOrder[]> {
  return fetchOrdersByStaffId(staffUserId);
}

/** Fetch a single order by ID. */
export async function getStaffOrderById(orderId: string): Promise<StaffOrder | null> {
  const res = await apiGet<RentalOrderResponse>(`/rental-orders/${orderId}`);
  return res ? adaptStaffOrder(res) : null;
}

/** PATCH /rental-orders/{id}/status */
export async function updateOrderStatus(
  orderId: string,
  status: RentalOrderApiStatus,
): Promise<StaffOrder | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/status`,
    { status } satisfies UpdateStatusRequest,
  );
  return res ? adaptStaffOrder(res) : null;
}

/** PATCH /rental-orders/{id}/record-delivery - transitions DELIVERING → DELIVERED */
export async function recordDelivery(
  orderId: string,
  data: RecordDeliveryRequest = {},
): Promise<StaffOrder | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-delivery`,
    data,
  );
  return res ? adaptStaffOrder(res) : null;
}

/** PATCH /rental-orders/{id}/record-pickup - transitions PICKING_UP → PICKED_UP */
export async function recordPickup(
  orderId: string,
  data: RecordPickupRequest = {},
): Promise<StaffOrder | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-pickup`,
    data,
  );
  return res ? adaptStaffOrder(res) : null;
}

/** PATCH /rental-orders/{id}/set-penalty */
export async function setPenalty(
  orderId: string,
  data: SetPenaltyRequest,
): Promise<StaffOrder | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/set-penalty`,
    data,
  );
  return res ? adaptStaffOrder(res) : null;
}

/** POST /rental-orders/{id}/cancel */
export async function cancelOrder(orderId: string): Promise<void> {
  await apiPost(`/rental-orders/${orderId}/cancel`);
}
