import { apiGet } from "@/api/apiService";

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface StaffHubInfo {
  hubId: string;
  hubCode: string;
  hubName: string;
}

export interface TodayTasks {
  deliveriesDueToday: number;
  pickupsDueToday: number;
  total: number;
}

export interface OverdueOrderItem {
  rentalOrderId: string;
  orderCode: string;
  /** e.g. "IN_USE" | "PENDING_PICKUP" */
  status: string;
  /** ISO date string */
  expectedRentalEndDate: string;
  renterFullName: string;
  renterPhone: string;
  itemCount: number;
  daysOverdue: number;
}

export interface UrgentOverdue {
  count: number;
  items: OverdueOrderItem[];
}

export interface HubInventoryStats {
  totalItems: number;
  available: number;
  rented: number;
  reserved: number;
  maintenance: number;
  damaged: number;
  retired: number;
}

export interface AssignedTickets {
  openAssignedToMe: number;
  inProgressAssignedToMe: number;
  totalActiveAssignedToMe: number;
}

export interface StaffDashboardData {
  hubInfo: StaffHubInfo;
  todayTasks: TodayTasks;
  urgentOverdue: UrgentOverdue;
  hubInventoryStats: HubInventoryStats;
  assignedTickets: AssignedTickets;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Fetch the authenticated staff's operational dashboard.
 *
 * Fallback strategy: if a hubId is passed and the server returns 403
 * (UNAUTHORIZED_ACCESS), the function automatically retries without hubId
 * so the UI always shows valid data.
 */
export async function getStaffDashboard(
  hubId?: string,
): Promise<StaffDashboardData> {
  try {
    return await apiGet<StaffDashboardData>("/dashboards/staff", {
      params: hubId ? { hubId } : undefined,
    });
  } catch (err) {
    // If the hubId is out of scope for this staff, fall back to assigned hub
    const status = (err as { status?: number }).status;
    if (hubId && (status === 403 || status === 401)) {
      return apiGet<StaffDashboardData>("/dashboards/staff");
    }
    throw err;
  }
}
