/**
 * Dashboard service — API calls for the dashboards module.
 * HTTP layer: apiService.ts (same pattern as other features).
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   API-113: GET /api/v1/dashboards/admin
 */

import { apiGet } from '@/api/apiService';
import type {
  AdminDashboardData,
  AdminDashboardParams,
  AdminDashboardResponse,
} from '../types';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val));
    }
  }
  const str = q.toString();
  return str ? `?${str}` : '';
}

// ─── API-113: GET /api/v1/dashboards/admin ────────────────────────────────────
// Không truyền hubId → toàn hệ thống.
// Có hubId → scope theo hub, kèm hubSummary.

export async function getAdminDashboard(
  params: AdminDashboardParams = {},
): Promise<AdminDashboardData> {
  const query = buildQuery({ hubId: params.hubId });
  const res = await apiGet<AdminDashboardResponse>(`/dashboards/admin${query}`);
  return res.data;
}
