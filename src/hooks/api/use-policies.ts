/**
 * Policies hooks - TanStack Query
 * Module 17: POLICIES (API-105 → API-111)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpService } from "@/api/http";
import type {
  PolicyDocumentResponse,
  UserConsentResponse,
  ConsentInput,
  PolicyListParams,
  PolicySingleResponse,
  MyConsentsResponse,
  PolicyListResponse,
  ConsentSingleResponse,
} from "@/api/policies";

const authOpts = { requireToken: true as const };

// ─── Query keys ───────────────────────────────────────────────────────────────

export const policyKeys = {
  all: ["policies"] as const,
  lists: () => [...policyKeys.all, "list"] as const,
  list: (params?: PolicyListParams) => [...policyKeys.lists(), params] as const,
  detail: (policyId: string) =>
    [...policyKeys.all, "detail", policyId] as const,
  latestByCode: (code: string) => [...policyKeys.all, "latest", code] as const,
  myConsents: () => [...policyKeys.all, "my-consents"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * API-106: Lấy chi tiết chính sách theo ID [PUBLIC]
 */
export function usePolicyQuery(policyId: string) {
  return useQuery({
    queryKey: policyKeys.detail(policyId),
    queryFn: async (): Promise<PolicyDocumentResponse> => {
      const res = await httpService.get<PolicySingleResponse>(
        `/policies/${policyId}`,
      );
      return res.data.data;
    },
    enabled: !!policyId,
    staleTime: 5 * 60_000,
  });
}

/**
 * API-107: Lấy phiên bản mới nhất của chính sách theo code [PUBLIC]
 *
 * Dùng trước checkout để hiển thị điều khoản và kiểm tra user đã đồng ý chưa.
 */
export function useLatestPolicyByCode(code: string, enabled = true) {
  return useQuery({
    queryKey: policyKeys.latestByCode(code),
    queryFn: async (): Promise<PolicyDocumentResponse> => {
      const res = await httpService.get<PolicySingleResponse>(
        `/policies/code/${encodeURIComponent(code)}/latest`,
      );
      return res.data.data;
    },
    enabled: enabled && !!code,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/**
 * API-108: Lấy danh sách chính sách [PUBLIC]
 *
 * Thường dùng với filter=isActive:true để lấy tất cả chính sách đang có hiệu lực.
 */
export function usePoliciesQuery(params?: PolicyListParams) {
  return useQuery({
    queryKey: policyKeys.list(params),
    queryFn: async (): Promise<PolicyDocumentResponse[]> => {
      const res = await httpService.get<PolicyListResponse>("/policies", {
        params: {
          page: params?.page ?? 1,
          size: params?.size ?? 20,
          ...(params?.filter ? { filter: params.filter } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      });
      return res.data.data.content;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/**
 * API-111: Lấy danh sách đồng ý chính sách của tôi [AUTH]
 *
 * Dùng để kiểm tra user đã đồng ý phiên bản chính sách nào.
 */
export function useMyConsentsQuery(enabled = true) {
  return useQuery({
    queryKey: policyKeys.myConsents(),
    queryFn: async (): Promise<UserConsentResponse[]> => {
      const res = await httpService.get<MyConsentsResponse>(
        "/policies/my-consents",
        authOpts,
      );
      return res.data.data;
    },
    enabled,
    staleTime: 2 * 60_000,
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * API-110: Ghi nhận đồng ý chính sách [AUTH]
 *
 * Idempotent - gọi nhiều lần với cùng params không tạo bản ghi mới.
 * Sau khi gọi thành công sẽ invalidate my-consents query.
 */
export function useRecordConsentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      policyId,
      data,
    }: {
      policyId: string;
      data?: ConsentInput;
    }): Promise<UserConsentResponse> => {
      const res = await httpService.post<ConsentSingleResponse>(
        `/policies/${policyId}/consent`,
        data ?? {},
        authOpts,
      );
      return res.data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: policyKeys.myConsents() });
    },
  });
}
