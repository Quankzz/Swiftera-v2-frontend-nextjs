/**
 * Policy management hooks - TanStack Query
 * Module 17: POLICIES (API-106, API-109, API-110)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { policyKeys } from '../api/policy.keys';
import {
  getPoliciesList,
  getPolicyById,
  createPolicy,
  deactivatePolicy,
  updatePolicy,
} from '../api/policy.service';
import type {
  PolicyListParams,
  CreatePolicyInput,
  UpdatePolicyInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * usePoliciesQuery - phân trang danh sách chính sách (API-109)
 */
export function usePoliciesQuery(params?: PolicyListParams) {
  return useQuery({
    queryKey: policyKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => getPoliciesList(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * usePolicyQuery - chi tiết 1 chính sách (API-107)
 */
export function usePolicyQuery(policyDocumentId?: string) {
  return useQuery({
    queryKey: policyKeys.detail(policyDocumentId ?? ''),
    queryFn: () => getPolicyById(policyDocumentId!),
    enabled: !!policyDocumentId,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useCreatePolicyMutation - tạo chính sách mới (API-106)
 */
export function useCreatePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePolicyInput) => createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
    },
  });
}

/**
 * useDeactivatePolicyMutation - vô hiệu hóa chính sách (API-110)
 */
export function useDeactivatePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyDocumentId: string) =>
      deactivatePolicy(policyDocumentId),
    onSuccess: (_data, policyDocumentId) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: policyKeys.detail(policyDocumentId),
      });
    },
  });
}

/**
 * useUpdatePolicyMutation - cập nhật chính sách (API-109A)
 */
export function useUpdatePolicyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      policyDocumentId,
      payload,
    }: {
      policyDocumentId: string;
      payload: UpdatePolicyInput;
    }) => updatePolicy(policyDocumentId, payload),
    onSuccess: (_data, { policyDocumentId }) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: policyKeys.detail(policyDocumentId),
      });
    },
  });
}
