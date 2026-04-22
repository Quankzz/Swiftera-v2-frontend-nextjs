import type { AxiosResponse } from "axios";
import { httpService } from "@/api/http";

const authOpts = { requireToken: true as const };

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DailyCompletedPoint {
  date: string;
  count: number;
}

export interface OrderKpi {
  completedToday: number;
  completedYesterday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  /** Luôn đủ 7 điểm, ngày không có dữ liệu trả count = 0 */
  dailyCompletedLast7Days: DailyCompletedPoint[];
}

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
  /** = paid + pendingPickup + overdueOrders.count */
  urgentTotal: number;
}

export interface OverdueOrderItem {
  rentalOrderId: string;
  orderCode: string;
  status: string;
  expectedRentalEndDate: string;
  renterFullName: string;
  renterPhone: string;
  itemCount: number;
  /** Chỉ có trong staff dashboard */
  daysOverdue?: number;
}

export interface InventoryStats {
  totalItems: number;
  available: number;
  rented: number;
  reserved: number;
  maintenance: number;
  damaged: number;
  retired: number;
}

export interface RevenueStats {
  rentalFeeToday: number;
  rentalFeeThisMonth: number;
  depositHeldActive: number;
  penaltyThisMonth: number;
}

export interface TicketStats {
  inProgress: number;
  resolved: number;
  closed: number;
  activeTotal: number;
}

export interface VoucherStats {
  totalActive: number;
  expired: number;
  usedThisMonth: number;
}

export interface HubSummary {
  hubId: string;
  hubCode: string;
  hubName: string;
  totalStaff?: number;
  activeStaff?: number;
}

/** Response của API-113: GET /dashboards/admin */
export interface AdminDashboardData {
  orderKpi: OrderKpi;
  orderStatusCounts: OrderStatusCounts;
  overdueOrders: {
    count: number;
    topItems: OverdueOrderItem[];
  };
  inventoryStats: InventoryStats;
  revenueStats: RevenueStats;
  ticketStats: TicketStats;
  voucherStats: VoucherStats;
  /** null khi không truyền hubId */
  hubSummary: HubSummary | null;
}

export interface AdminDashboardResponse {
  success: boolean;
  message?: string;
  data: AdminDashboardData;
  meta?: { timestamp: string; instance: string };
}

export interface TodayTasks {
  deliveriesDueToday: number;
  pickupsDueToday: number;
  total: number;
}

export interface AssignedTickets {
  inProgressAssignedToMe: number;
  resolvedAssignedToMe: number;
  totalActiveAssignedToMe: number;
}

/** Response của API-114: GET /dashboards/staff */
export interface StaffDashboardData {
  hubInfo: Pick<HubSummary, "hubId" | "hubCode" | "hubName">;
  todayTasks: TodayTasks;
  urgentOverdue: {
    count: number;
    items: OverdueOrderItem[];
  };
  hubInventoryStats: InventoryStats;
  assignedTickets: AssignedTickets;
}

export interface StaffDashboardResponse {
  success: boolean;
  message?: string;
  data: StaffDashboardData;
  meta?: { timestamp: string; instance: string };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * API-113: Dashboard tổng quan cho ADMIN [AUTH]
   *
   * @param hubId - (tùy chọn) lọc theo hub; không truyền → toàn hệ thống
   *
   * Lỗi: HUB_NOT_FOUND
   */
  getAdminDashboard(
    hubId?: string,
  ): Promise<AxiosResponse<AdminDashboardResponse>> {
    return httpService.get<AdminDashboardResponse>("/dashboards/admin", {
      ...authOpts,
      params: hubId ? { hubId } : undefined,
    });
  },

  /**
   * API-114: Dashboard tác nghiệp cho STAFF [AUTH]
   *
   * @param hubId - (tùy chọn) mặc định dùng hub đang gán cho staff hiện tại
   *
   * Lỗi: USER_NOT_STAFF_ROLE, UNAUTHORIZED_ACCESS (hubId khác hub của staff)
   */
  getStaffDashboard(
    hubId?: string,
  ): Promise<AxiosResponse<StaffDashboardResponse>> {
    return httpService.get<StaffDashboardResponse>("/dashboards/staff", {
      ...authOpts,
      params: hubId ? { hubId } : undefined,
    });
  },
};
