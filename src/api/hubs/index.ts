/**
 * Hubs API — GET /api/v1/hubs
 *
 * Public endpoint: no auth required for reading the hub list.
 * Falls back to mock data when USE_MOCK=true.
 */

import { apiGet } from '@/api/apiService';
import type { HubResponse, PaginationResponse } from '@/types/api.types';

export type { HubResponse };

export interface HubQueryParams {
  page?: number;
  size?: number;
  filter?: string;
}

export async function getHubs(): Promise<HubResponse[]> {
  const res = await apiGet<PaginationResponse<HubResponse>>(`/hubs`);
  return res?.content ?? [];
}

export async function getHubById(hubId: string): Promise<HubResponse | null> {
  const res = await apiGet<HubResponse>(`/hubs/${hubId}`);
  return res ?? null;
}

export async function getActiveHubs(): Promise<HubResponse[]> {
  return getHubs();
}
