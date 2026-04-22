/**
 * useAdminDashboard - TanStack Query hook cho API-113.
 *
 * Cách dùng:
 *   const { data, isLoading, isError } = useAdminDashboard();           // toàn hệ thống
 *   const { data, isLoading, isError } = useAdminDashboard({ hubId }); // theo hub
 *
 * Tự động refetch khi hubId thay đổi (queryKey phụ thuộc hubId).
 */

import { useQuery } from "@tanstack/react-query";
import { dashboardKeys } from "../api/dashboard.keys";
import { getAdminDashboard } from "../api/dashboard.service";
import type { AdminDashboardData, AdminDashboardParams } from "../types";

export function useAdminDashboard(params: AdminDashboardParams = {}) {
  return useQuery<AdminDashboardData, Error>({
    queryKey: dashboardKeys.adminOverview(params),
    queryFn: () => getAdminDashboard(params),
    // Dashboard data có thể stale sau 60s; refetch khi focus lại tab
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
