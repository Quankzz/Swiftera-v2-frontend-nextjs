import { mockOr, apiPatch, apiPost, USE_MOCK } from './apiService';
import {
  MOCK_ORDERS,
  MOCK_STATS,
  MOCK_CURRENT_STAFF,
  MOCK_ACTIVITY,
} from '@/data/mockDashboard';
import type {
  DashboardOrder,
  DashboardStats,
  OrderStatus,
  StaffLocationUpdate,
  ActivityLog,
} from '@/types/dashboard.types';

// ─── Fetch all orders (staff hub) ─────────────────────────────────────────────
export async function getOrders(): Promise<DashboardOrder[]> {
  return mockOr('/orders', MOCK_ORDERS);
}

// ─── Fetch single order ───────────────────────────────────────────────────────
export async function getOrderById(id: string): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === id);
    if (!order) throw new Error(`Order ${id} not found`);
    return Promise.resolve(order);
  }
  return import('./apiService').then(({ apiGet }) =>
    apiGet<DashboardOrder>(`/orders/${id}`),
  );
}

// ─── Update order status ──────────────────────────────────────────────────────
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === id);
    if (!order) throw new Error(`Order ${id} not found`);
    order.status = status;
    return Promise.resolve({ ...order });
  }
  return apiPatch<DashboardOrder>(`/orders/${id}/status`, { status });
}

// ─── Staff confirm check-in (before handover to customer) ────────────────────
export async function confirmCheckin(
  orderId: string,
  staffId: string,
): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.staff_checkin_id = staffId;
    order.status = 'DELIVERING';
    return Promise.resolve({ ...order });
  }
  return apiPost<DashboardOrder>(`/orders/${orderId}/checkin`, {
    staff_id: staffId,
  });
}

// ─── Staff confirm check-out (after return from customer) ────────────────────
export async function confirmCheckout(
  orderId: string,
  staffId: string,
): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.staff_checkout_id = staffId;
    order.status = 'COMPLETED';
    return Promise.resolve({ ...order });
  }
  return apiPost<DashboardOrder>(`/orders/${orderId}/checkout`, {
    staff_id: staffId,
  });
}

// ─── Upload item photo (checkin or checkout) ──────────────────────────────────
export async function uploadItemPhoto(payload: {
  order_id: string;
  item_id: string;
  photo_type: 'checkin' | 'checkout';
  photo_url: string;
  condition?: string;
  staff_note?: string;
  penalty_amount?: number;
}): Promise<void> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find(
      (o) => o.rental_order_id === payload.order_id,
    );
    if (order) {
      const item = order.items.find(
        (i) => i.rental_order_item_id === payload.item_id,
      );
      if (item) {
        if (payload.photo_type === 'checkin') {
          item.checkin_photo_url = payload.photo_url;
          if (payload.condition)
            item.checkin_condition = payload.condition as never;
        } else {
          item.checkout_photo_url = payload.photo_url;
          if (payload.condition)
            item.checkout_condition = payload.condition as never;
          if (payload.penalty_amount)
            item.item_penalty_amount = payload.penalty_amount;
        }
        if (payload.staff_note) item.staff_note = payload.staff_note;
      }
    }
    return Promise.resolve();
  }
  return apiPost<void>(
    `/orders/${payload.order_id}/items/${payload.item_id}/photo`,
    payload,
  );
}

// ─── Update staff delivery location ──────────────────────────────────────────
export async function updateStaffLocation(
  payload: StaffLocationUpdate,
): Promise<void> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find(
      (o) => o.rental_order_id === payload.order_id,
    );
    if (order) {
      order.staff_current_latitude = payload.latitude;
      order.staff_current_longitude = payload.longitude;
      order.staff_location_updated_at = payload.updated_at;
    }
    return Promise.resolve();
  }
  return apiPost<void>(`/orders/${payload.order_id}/staff-location`, payload);
}

// ─── Confirm deposit refunded ─────────────────────────────────────────────────
export async function confirmDepositRefund(
  orderId: string,
): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.deposit_refund_status = 'REFUNDED';
    return Promise.resolve({ ...order });
  }
  return apiPost<DashboardOrder>(`/orders/${orderId}/refund-deposit`, {});
}

// ─── Apply penalty fee ────────────────────────────────────────────────────────
export async function applyPenalty(
  orderId: string,
  amount: number,
  reason: string,
): Promise<DashboardOrder> {
  if (USE_MOCK) {
    const order = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.total_penalty_amount = (order.total_penalty_amount ?? 0) + amount;
    return Promise.resolve({ ...order });
  }
  return apiPost<DashboardOrder>(`/orders/${orderId}/penalty`, {
    amount,
    reason,
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  return mockOr('/dashboard/stats', MOCK_STATS);
}

// ─── Activity log ─────────────────────────────────────────────────────────────
export async function getActivityLog(): Promise<ActivityLog[]> {
  return mockOr('/dashboard/activity', MOCK_ACTIVITY);
}

// ─── Current staff ────────────────────────────────────────────────────────────
export async function getCurrentStaff() {
  return mockOr('/staff/me', MOCK_CURRENT_STAFF);
}
