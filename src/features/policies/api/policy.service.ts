/**
 * Policy API service — Module 17: POLICIES
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *
 * Dùng apiService.ts — KHÔNG dùng client.ts.
 */

import { apiGet, apiPost, apiPatch } from '@/api/apiService';
import type {
  PolicyDocumentResponse,
  PaginatedPoliciesResponse,
  CreatePolicyInput,
  UpdatePolicyInput,
  PolicyListParams,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-109: GET /policies?page=1&size=10&filter=...
 * BE dùng 1-based pagination. Caller truyền đúng page 1-based.
 */
export function getPoliciesList(
  params?: PolicyListParams,
): Promise<PaginatedPoliciesResponse> {
  return apiGet<PaginatedPoliciesResponse>('/policies', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });
}

/**
 * API-107: GET /policies/{policyId}
 */
export function getPolicyById(
  policyDocumentId: string,
): Promise<PolicyDocumentResponse> {
  return apiGet<PolicyDocumentResponse>(`/policies/${policyDocumentId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-106: POST /policies
 * Tạo tài liệu chính sách mới
 */
export function createPolicy(
  payload: CreatePolicyInput,
): Promise<PolicyDocumentResponse> {
  return apiPost<PolicyDocumentResponse>('/policies', payload);
}

/**
 * API-110: PATCH /policies/{policyId}/deactivate
 * Vô hiệu hóa chính sách (isActive → false)
 */
export function deactivatePolicy(
  policyDocumentId: string,
): Promise<PolicyDocumentResponse> {
  return apiPatch<PolicyDocumentResponse>(
    `/policies/${policyDocumentId}/deactivate`,
    {},
  );
}

/**
 * API-109A: PATCH /policies/{policyId}
 * Cập nhật tài liệu chính sách (title, pdfUrl, effectiveFrom).
 * code và policyVersion là immutable — không hỗ trợ update qua endpoint này.
 */
export function updatePolicy(
  policyDocumentId: string,
  payload: UpdatePolicyInput,
): Promise<PolicyDocumentResponse> {
  return apiPatch<PolicyDocumentResponse>(
    `/policies/${policyDocumentId}`,
    payload,
  );
}
