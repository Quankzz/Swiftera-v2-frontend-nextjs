import { useQuery } from "@tanstack/react-query";
import {
  getHubsList,
  getHubById,
  getHubStaff,
} from "@/features/hubs/api/hub.service";
import type { HubResponse, HubStaffResponse } from "@/features/hubs/types";

export interface HubListQueryParams {
  isActive?: boolean;
  page?: number;
  size?: number;
  filter?: string;
}

export interface HubStaff extends HubStaffResponse {
  role: "delivery" | "pickup" | "both";
}

const queryKeys = {
  list: (params?: HubListQueryParams) => ["hubs", "list", params],
  detail: (id: string) => ["hubs", "detail", id],
  staff: (hubId: string) => ["hubs", "staff", hubId],
};

export function useHubsQuery(params?: HubListQueryParams) {
  const filter =
    params?.isActive !== undefined
      ? `isActive:${params.isActive}`
      : params?.filter;

  return useQuery<{ data: HubResponse[]; total: number }>({
    queryKey: queryKeys.list(params),
    queryFn: async () => {
      const result = await getHubsList({
        page: params?.page,
        size: params?.size,
        filter,
      });
      return {
        data: result?.content ?? [],
        total: result?.meta?.totalElements ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHubQuery(id: string | undefined) {
  return useQuery<HubResponse>({
    enabled: !!id,
    queryKey: id ? queryKeys.detail(id) : ["hubs", "detail", "empty"],
    queryFn: () => getHubById(id as string),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHubStaffQuery(hubId: string | undefined) {
  return useQuery<HubStaff[]>({
    enabled: !!hubId,
    queryKey: hubId ? queryKeys.staff(hubId) : ["hubs", "staff", "empty"],
    queryFn: async () => {
      const staff = await getHubStaff(hubId as string);
      return staff.map((s) => ({ ...s, role: "both" as const }));
    },
    staleTime: 2 * 60 * 1000,
  });
}
