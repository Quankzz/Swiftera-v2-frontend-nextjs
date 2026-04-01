/**
 * Hubs API — GET /api/v1/hubs
 *
 * Public endpoint: no auth required for reading the hub list.
 * Falls back to mock data when USE_MOCK=true.
 */

import { apiGet } from '@/api/client';
import type {
  ApiResponse,
  HubResponse,
  PaginationResponse,
} from '@/types/api.types';

export type { HubResponse };

export interface HubQueryParams {
  page?: number;
  size?: number;
  filter?: string;
}

export async function getHubs(): Promise<HubResponse[]> {
  const res =
    await apiGet<ApiResponse<PaginationResponse<HubResponse>>>(`/hubs`);
  return res.data?.content ?? [];
}

export async function getHubById(hubId: string): Promise<HubResponse | null> {
  const res = await apiGet<ApiResponse<HubResponse>>(`/hubs/${hubId}`);
  return res.data;
}

export async function getActiveHubs(): Promise<HubResponse[]> {
  return getHubs();
}
