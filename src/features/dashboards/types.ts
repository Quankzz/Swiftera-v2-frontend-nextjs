/**
 * Dashboard feature types
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   API-113: GET /api/v1/dashboards/admin
 *   API-114: GET /api/v1/dashboards/staff
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared wrapper
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiMeta {
  timestamp: string;
  instance: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// API-113: Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────

/** Một điểm dữ liệu trong 7 ngày gần nhất */
export interface DailyCompletedPoint {
  date: string; // "YYYY-MM-DD"
  count: number;
}

/** KPI đơn hàng hoàn thành */
export interface OrderKpi {
  completedToday: number;
  completedYesterday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  dailyCompletedLast7Days: DailyCompletedPoint[];
}

/** Đếm số đơn theo từng trạng thái */
export interface OrderStatusCounts {
  pendingPayment: number;
  paid: number;
  preparing: number;
  delivering: number;
  delivered: number;
  inUse: number;
  pendingPickup: number;
  pickingUp: number;
  pickedUp: number;
  completed: number;
  cancelled: number;
  urgentTotal: number;
}

/** Một đơn quá hạn trong top list */
export interface OverdueOrderItem {
  rentalOrderId: string;
  orderCode: string;
  status: string;
  expectedRentalEndDate: string; // "YYYY-MM-DD"
  renterFullName: string;
  renterPhone: string;
  itemCount: number;
}

/** Thống kê đơn quá hạn */
export interface OverdueOrders {
  count: number;
  topItems: OverdueOrderItem[];
}

/** Thống kê tồn kho */
export interface InventoryStats {
  totalItems: number;
  available: number;
  rented: number;
  reserved: number;
  maintenance: number;
  damaged: number;
  retired: number;
}

/** Thống kê doanh thu */
export interface RevenueStats {
  rentalFeeToday: number;
  rentalFeeThisMonth: number;
  depositHeldActive: number;
  penaltyThisMonth: number;
}

/** Thống kê ticket hỗ trợ */
export interface TicketStats {
  open: number;
  inProgress: number;
  replied: number;
  unresolved: number;
}

/** Thống kê voucher */
export interface VoucherStats {
  totalActive: number;
  expired: number;
  usedThisMonth: number;
}

/** Thông tin hub (chỉ có khi gọi với hubId) */
export interface HubSummary {
  hubId: string;
  hubCode: string;
  hubName: string;
  totalStaff: number;
  activeStaff: number;
}

/** Data block của API-113 */
export interface AdminDashboardData {
  orderKpi: OrderKpi;
  orderStatusCounts: OrderStatusCounts;
  overdueOrders: OverdueOrders;
  inventoryStats: InventoryStats;
  revenueStats: RevenueStats;
  ticketStats: TicketStats;
  voucherStats: VoucherStats;
  hubSummary: HubSummary | null;
}

/** Full response của API-113 */
export type AdminDashboardResponse = ApiResponse<AdminDashboardData>;

// ─────────────────────────────────────────────────────────────────────────────
// Params
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminDashboardParams {
  /** Không truyền = toàn hệ thống; có giá trị = scope theo hub */
  hubId?: string;
}
