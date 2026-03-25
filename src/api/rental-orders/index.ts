import {
  AssignOrderInput,
  PaginatedResponse,
  RentalOrder,
  RentalOrderListParams,
  RentalOrderStatus,
} from '@/types/dashboard';
import { fetchApi } from '../apiService';

type DataMode = 'mock' | 'api';
const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE as DataMode) || 'mock';
const USE_MOCK = DATA_MODE === 'mock';

export const RENTAL_ORDER_STATUSES: {
  value: RentalOrderStatus;
  label: string;
}[] = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'DELIVERING', label: 'Đang giao hàng' },
  { value: 'ACTIVE', label: 'Đang thuê' },
  { value: 'RETURNING', label: 'Đang thu hồi' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

// ─── Mock store ────────────────────────────────────────────────────
// eslint-disable-next-line prefer-const
let mockOrders: RentalOrder[] = [
  {
    rentalOrderId: 'DH-2026-001',
    userId: 'u2',
    deliveryStaffId: null,
    pickupStaffId: null,
    voucherId: null,
    deliveryRecipientName: 'Nguyễn Văn An',
    deliveryPhone: '0901 234 567',
    deliveryAddressLine: '55 Nguyễn Huệ',
    deliveryWard: 'Bến Nghé',
    deliveryDistrict: 'Quận 1',
    deliveryCity: 'TP. Hồ Chí Minh',
    deliveryNote: 'Giao trước 12h trưa',
    startDate: '2026-03-28',
    endDate: '2026-04-04',
    plannedDeliveryAt: null,
    deliveredAt: null,
    plannedPickupAt: null,
    pickedUpAt: null,
    placedAt: '2026-03-25T07:30:00.000Z',
    status: 'PENDING',
    subtotalRentalFee: 2450000,
    voucherCodeSnapshot: null,
    voucherDiscountAmount: 0,
    totalRentalFee: 2450000,
    totalDeposit: 3000000,
    penaltyTotal: 0,
    depositRefundedAmount: 0,
    grandTotalPaid: 5450000,
    userFullName: 'Nguyễn Văn An',
    userEmail: 'an.nguyen@example.com',
    userPhone: '0901 234 567',
    hubId: null,
    hubName: null,
    deliveryStaffName: null,
    pickupStaffName: null,
    items: [
      {
        rentalOrderItemId: 'item-001-1',
        rentalOrderId: 'DH-2026-001',
        inventoryItemId: 'inv-002',
        productId: 'prod-iphone-15-pro',
        productName: 'iPhone 15 Pro Max',
        serialNumber: 'SN-IP15PM-002',
        dailyPriceSnapshot: 350000,
        depositSnapshot: 3000000,
        rentalDays: 7,
        subtotalFee: 2450000,
      },
    ],
  },
  {
    rentalOrderId: 'DH-2026-002',
    userId: 'u3',
    deliveryStaffId: 'staff-002',
    pickupStaffId: null,
    voucherId: null,
    deliveryRecipientName: 'Trần Thị Bình',
    deliveryPhone: '0912 345 678',
    deliveryAddressLine: '21 Đinh Tiên Hoàng',
    deliveryWard: 'Đa Kao',
    deliveryDistrict: 'Quận 1',
    deliveryCity: 'TP. Hồ Chí Minh',
    deliveryNote: null,
    startDate: '2026-03-22',
    endDate: '2026-03-29',
    plannedDeliveryAt: '2026-03-22T09:00:00.000Z',
    deliveredAt: '2026-03-22T10:15:00.000Z',
    plannedPickupAt: '2026-03-29T14:00:00.000Z',
    pickedUpAt: null,
    placedAt: '2026-03-20T11:00:00.000Z',
    status: 'ACTIVE',
    subtotalRentalFee: 2240000,
    voucherCodeSnapshot: 'SWIFTERA10',
    voucherDiscountAmount: 224000,
    totalRentalFee: 2016000,
    totalDeposit: 2800000,
    penaltyTotal: 0,
    depositRefundedAmount: 0,
    grandTotalPaid: 4816000,
    userFullName: 'Trần Thị Bình',
    userEmail: 'binh.tran@example.com',
    userPhone: '0912 345 678',
    hubId: 'hub-003',
    hubName: 'Hub TP.HCM – Quận 1',
    deliveryStaffName: 'Trần Thị Thu',
    pickupStaffName: null,
    items: [
      {
        rentalOrderItemId: 'item-002-1',
        rentalOrderId: 'DH-2026-002',
        inventoryItemId: 'inv-s24-001',
        productId: 'prod-samsung-s24-ultra',
        productName: 'Samsung Galaxy S24 Ultra',
        serialNumber: 'SN-S24U-001',
        dailyPriceSnapshot: 320000,
        depositSnapshot: 2800000,
        rentalDays: 7,
        subtotalFee: 2240000,
      },
    ],
  },
  {
    rentalOrderId: 'DH-2026-003',
    userId: 'u5',
    deliveryStaffId: 'staff-006',
    pickupStaffId: 'staff-008',
    voucherId: null,
    deliveryRecipientName: 'Lê Minh Khoa',
    deliveryPhone: '0933 456 789',
    deliveryAddressLine: '77 Nguyễn Thị Minh Khai',
    deliveryWard: 'Phường 6',
    deliveryDistrict: 'Quận 3',
    deliveryCity: 'TP. Hồ Chí Minh',
    deliveryNote: 'Gọi trước 15 phút',
    startDate: '2026-03-15',
    endDate: '2026-03-20',
    plannedDeliveryAt: '2026-03-15T08:00:00.000Z',
    deliveredAt: '2026-03-15T09:30:00.000Z',
    plannedPickupAt: '2026-03-20T14:00:00.000Z',
    pickedUpAt: '2026-03-20T14:45:00.000Z',
    placedAt: '2026-03-14T16:00:00.000Z',
    status: 'COMPLETED',
    subtotalRentalFee: 1000000,
    voucherCodeSnapshot: null,
    voucherDiscountAmount: 0,
    totalRentalFee: 1000000,
    totalDeposit: 1500000,
    penaltyTotal: 0,
    depositRefundedAmount: 1500000,
    grandTotalPaid: 2500000,
    userFullName: 'Lê Minh Khoa',
    userEmail: 'khoa.le@example.com',
    userPhone: '0933 456 789',
    hubId: 'hub-003',
    hubName: 'Hub TP.HCM – Quận 1',
    deliveryStaffName: 'Đặng Văn Nam',
    pickupStaffName: 'Vũ Quốc Hùng',
    items: [
      {
        rentalOrderItemId: 'item-003-1',
        rentalOrderId: 'DH-2026-003',
        inventoryItemId: 'inv-001',
        productId: 'prod-iphone-15-pro',
        productName: 'iPhone 15 Pro Max',
        serialNumber: 'SN-IP15PM-001',
        dailyPriceSnapshot: 200000,
        depositSnapshot: 1500000,
        rentalDays: 5,
        subtotalFee: 1000000,
      },
    ],
  },
  {
    rentalOrderId: 'DH-2026-004',
    userId: null,
    deliveryStaffId: null,
    pickupStaffId: null,
    voucherId: null,
    deliveryRecipientName: 'Phạm Thị Dung',
    deliveryPhone: '0944 567 890',
    deliveryAddressLine: '15 Phan Chu Trinh',
    deliveryWard: 'Hàng Bài',
    deliveryDistrict: 'Hoàn Kiếm',
    deliveryCity: 'Hà Nội',
    deliveryNote: null,
    startDate: '2026-03-30',
    endDate: '2026-04-06',
    plannedDeliveryAt: null,
    deliveredAt: null,
    plannedPickupAt: null,
    pickedUpAt: null,
    placedAt: '2026-03-25T08:00:00.000Z',
    status: 'CONFIRMED',
    subtotalRentalFee: 3200000,
    voucherCodeSnapshot: null,
    voucherDiscountAmount: 0,
    totalRentalFee: 3200000,
    totalDeposit: 5000000,
    penaltyTotal: 0,
    depositRefundedAmount: 0,
    grandTotalPaid: 8200000,
    userFullName: 'Phạm Thị Dung',
    userEmail: 'dung.pham@example.com',
    userPhone: '0944 567 890',
    hubId: null,
    hubName: null,
    deliveryStaffName: null,
    pickupStaffName: null,
    items: [
      {
        rentalOrderItemId: 'item-004-1',
        rentalOrderId: 'DH-2026-004',
        inventoryItemId: 'inv-003',
        productId: 'prod-macbook-pro',
        productName: 'MacBook Pro 14" M3 Pro',
        serialNumber: 'SN-MBP14-001',
        dailyPriceSnapshot: 500000,
        depositSnapshot: 5000000,
        rentalDays: 7,
        subtotalFee: 3500000,
      },
    ],
  },
  {
    rentalOrderId: 'DH-2026-005',
    userId: 'u4',
    deliveryStaffId: null,
    pickupStaffId: null,
    voucherId: null,
    deliveryRecipientName: 'Hoàng Văn Cường',
    deliveryPhone: '0955 678 901',
    deliveryAddressLine: '102 Nguyễn Chí Thanh',
    deliveryWard: 'Láng Thượng',
    deliveryDistrict: 'Đống Đa',
    deliveryCity: 'Hà Nội',
    deliveryNote: 'Để ở bảo vệ nếu vắng',
    startDate: '2026-04-01',
    endDate: '2026-04-08',
    plannedDeliveryAt: null,
    deliveredAt: null,
    plannedPickupAt: null,
    pickedUpAt: null,
    placedAt: '2026-03-25T09:15:00.000Z',
    status: 'PENDING',
    subtotalRentalFee: 2800000,
    voucherCodeSnapshot: null,
    voucherDiscountAmount: 0,
    totalRentalFee: 2800000,
    totalDeposit: 4500000,
    penaltyTotal: 0,
    depositRefundedAmount: 0,
    grandTotalPaid: 7300000,
    userFullName: 'Hoàng Văn Cường',
    userEmail: 'cuong.hoang@example.com',
    userPhone: '0955 678 901',
    hubId: null,
    hubName: null,
    deliveryStaffName: null,
    pickupStaffName: null,
    items: [
      {
        rentalOrderItemId: 'item-005-1',
        rentalOrderId: 'DH-2026-005',
        inventoryItemId: 'inv-s24-002',
        productId: 'prod-dell-xps-15',
        productName: 'Dell XPS 15 OLED',
        serialNumber: 'SN-DELL-001',
        dailyPriceSnapshot: 430000,
        depositSnapshot: 4500000,
        rentalDays: 7,
        subtotalFee: 3010000,
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────
function applyFilters(
  orders: RentalOrder[],
  params?: RentalOrderListParams,
): RentalOrder[] {
  let result = [...orders];
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.rentalOrderId.toLowerCase().includes(q) ||
        o.deliveryRecipientName.toLowerCase().includes(q) ||
        o.deliveryPhone.includes(q) ||
        o.userEmail?.toLowerCase().includes(q),
    );
  }
  if (params?.status) result = result.filter((o) => o.status === params.status);
  if (params?.hubId) result = result.filter((o) => o.hubId === params.hubId);
  return result;
}

// ─── Repository ────────────────────────────────────────────────────
export const rentalOrdersRepository = {
  async list(
    params?: RentalOrderListParams,
  ): Promise<PaginatedResponse<RentalOrder>> {
    if (USE_MOCK) {
      const filtered = applyFilters(mockOrders, params);
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const start = (page - 1) * limit;
      // Sort: newest placed_at first
      const sorted = [...filtered].sort(
        (a, b) =>
          new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
      );
      return {
        data: sorted.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.hubId) qs.set('hubId', params.hubId);
    return fetchApi<PaginatedResponse<RentalOrder>>(`/rental-orders?${qs}`);
  },

  async get(id: string): Promise<RentalOrder> {
    if (USE_MOCK) {
      const order = mockOrders.find((o) => o.rentalOrderId === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
    return fetchApi<RentalOrder>(`/rental-orders/${id}`);
  },

  async assign(id: string, input: AssignOrderInput): Promise<RentalOrder> {
    if (USE_MOCK) {
      const idx = mockOrders.findIndex((o) => o.rentalOrderId === id);
      if (idx === -1) throw new Error('Order not found');
      // Import hub staff names lazily to avoid circular dep
      const { hubsRepository } = await import('../hubs');
      const hub = await hubsRepository.get(input.hubId);
      const staffList = await hubsRepository.getStaff(input.hubId);
      const deliveryStaff = staffList.find(
        (s) => s.userId === input.deliveryStaffId,
      );
      const pickupStaff = input.pickupStaffId
        ? staffList.find((s) => s.userId === input.pickupStaffId)
        : null;
      const updated: RentalOrder = {
        ...mockOrders[idx],
        hubId: input.hubId,
        hubName: hub.name,
        deliveryStaffId: input.deliveryStaffId,
        deliveryStaffName: deliveryStaff?.fullName ?? null,
        pickupStaffId: input.pickupStaffId ?? null,
        pickupStaffName: pickupStaff?.fullName ?? null,
        plannedDeliveryAt:
          input.plannedDeliveryAt ?? mockOrders[idx].plannedDeliveryAt,
        plannedPickupAt:
          input.plannedPickupAt ?? mockOrders[idx].plannedPickupAt,
        status:
          mockOrders[idx].status === 'PENDING'
            ? 'CONFIRMED'
            : mockOrders[idx].status,
      };
      mockOrders[idx] = updated;
      return updated;
    }
    return fetchApi<RentalOrder>(`/rental-orders/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};
