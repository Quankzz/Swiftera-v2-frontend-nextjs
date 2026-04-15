/**
 * Dashboard service — API calls for the dashboards module.
 * HTTP layer: httpService (axios) — dùng http.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   API-113: GET /api/v1/dashboards/admin
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type { AdminDashboardData, AdminDashboardParams } from '../types';

const authOpts = { requireToken: true as const };

// ─── API-113: GET /api/v1/dashboards/admin ────────────────────────────────────
// Không truyền hubId → toàn hệ thống.
// Có hubId → scope theo hub, kèm hubSummary.

export async function getAdminDashboard(
  params: AdminDashboardParams = {},
): Promise<AdminDashboardData> {
  const res = await httpService.get<ApiResponse<AdminDashboardData>>(
    '/dashboards/admin',
    { ...authOpts, params: { hubId: params.hubId } },
  );
  return res.data.data!;
}
