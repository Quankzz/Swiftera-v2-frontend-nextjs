import { useQuery } from '@tanstack/react-query';
import { Hub, HubListParams, PaginatedResponse } from '@/types/dashboard';
import { hubsRepository, HubStaff } from '@/api/hubs';

const queryKeys = {
  list: (params?: HubListParams) => ['hubs', 'list', params],
  detail: (id: string) => ['hubs', 'detail', id],
  staff: (hubId: string) => ['hubs', 'staff', hubId],
};

export function useHubsQuery(params?: HubListParams) {
  return useQuery<PaginatedResponse<Hub>>({
    queryKey: queryKeys.list(params),
    queryFn: () => hubsRepository.list(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHubQuery(id: string | undefined) {
  return useQuery<Hub>({
    enabled: !!id,
    queryKey: id ? queryKeys.detail(id) : ['hubs', 'detail', 'empty'],
    queryFn: () => hubsRepository.get(id as string),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHubStaffQuery(hubId: string | undefined) {
  return useQuery<HubStaff[]>({
    enabled: !!hubId,
    queryKey: hubId ? queryKeys.staff(hubId) : ['hubs', 'staff', 'empty'],
    queryFn: () => hubsRepository.getStaff(hubId as string),
    staleTime: 2 * 60 * 1000,
  });
}
