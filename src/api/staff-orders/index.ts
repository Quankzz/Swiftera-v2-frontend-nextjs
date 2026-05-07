import { apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  PaginationResponse,
  RentalOrderApiStatus,
  RentalOrderResponse,
  OrderStatus,
} from '@/types/api.types';

// Re-exports
export type { RentalOrderResponse, RentalOrderApiStatus };

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
  pickedUpAt?: string;
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
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'COMPLETED'
>;

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
): Promise<RentalOrderResponse[]> {
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

  return merged;
}

/** All active orders assigned to staff. */
export function getStaffOrders(
  staffUserId: string,
): Promise<RentalOrderResponse[]> {
  return fetchOrdersByStaffId(staffUserId);
}

/** Fetch a single order by ID. */
export async function getStaffOrderById(
  orderId: string,
): Promise<RentalOrderResponse | null> {
  const res = await apiGet<RentalOrderResponse>(`/rental-orders/${orderId}`);
  return res ?? null;
}

/** PATCH /rental-orders/{id}/status */
export async function updateOrderStatus(
  orderId: string,
  status: RentalOrderApiStatus,
): Promise<RentalOrderResponse | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/status`,
    { status } satisfies UpdateStatusRequest,
  );
  return res ?? null;
}

/** PATCH /rental-orders/{id}/record-delivery - transitions DELIVERING → DELIVERED */
export async function recordDelivery(
  orderId: string,
  data: RecordDeliveryRequest = {},
): Promise<RentalOrderResponse | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-delivery`,
    data,
  );
  return res ?? null;
}

/** PATCH /rental-orders/{id}/record-pickup - transitions PICKING_UP → PICKED_UP */
export async function recordPickup(
  orderId: string,
  data: RecordPickupRequest = {},
): Promise<RentalOrderResponse | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/record-pickup`,
    data,
  );
  return res ?? null;
}

/** PATCH /rental-orders/{id}/set-penalty */
export async function setPenalty(
  orderId: string,
  data: SetPenaltyRequest,
): Promise<RentalOrderResponse | null> {
  const res = await apiPatch<RentalOrderResponse>(
    `/rental-orders/${orderId}/set-penalty`,
    data,
  );
  return res ?? null;
}
