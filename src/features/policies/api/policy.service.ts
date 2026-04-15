/**
 * Policy API service — Module 17: POLICIES
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *
 * HTTP layer: httpService (axios) — dùng http.ts.
 */

import { httpService } from '@/api/http';
import type { ApiResponse } from '@/types/api.types';
import type {
  PolicyDocumentResponse,
  PaginatedPoliciesResponse,
  CreatePolicyInput,
  UpdatePolicyInput,
  PolicyListParams,
} from '../types';

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-109: GET /policies?page=1&size=10&filter=...
 * BE dùng 1-based pagination. Caller truyền đúng page 1-based.
 */
export async function getPoliciesList(
  params?: PolicyListParams,
): Promise<PaginatedPoliciesResponse> {
  const res = await httpService.get<ApiResponse<PaginatedPoliciesResponse>>(
    '/policies',
    { params },
  );
  return res.data.data!;
}

/**
 * API-107: GET /policies/{policyId}
 */
export async function getPolicyById(
  policyDocumentId: string,
): Promise<PolicyDocumentResponse> {
  const res = await httpService.get<ApiResponse<PolicyDocumentResponse>>(
    `/policies/${policyDocumentId}`,
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-106: POST /policies
 * Tạo tài liệu chính sách mới
 */
export async function createPolicy(
  payload: CreatePolicyInput,
): Promise<PolicyDocumentResponse> {
  const res = await httpService.post<ApiResponse<PolicyDocumentResponse>>(
    '/policies',
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-110: PATCH /policies/{policyId}/deactivate
 * Vô hiệu hóa chính sách (isActive → false)
 */
export async function deactivatePolicy(
  policyDocumentId: string,
): Promise<PolicyDocumentResponse> {
  const res = await httpService.patch<ApiResponse<PolicyDocumentResponse>>(
    `/policies/${policyDocumentId}/deactivate`,
    {},
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-109A: PATCH /policies/{policyId}
 * Cập nhật tài liệu chính sách (title, pdfUrl, effectiveFrom).
 * code và policyVersion là immutable — không hỗ trợ update qua endpoint này.
 */
export async function updatePolicy(
  policyDocumentId: string,
  payload: UpdatePolicyInput,
): Promise<PolicyDocumentResponse> {
  const res = await httpService.patch<ApiResponse<PolicyDocumentResponse>>(
    `/policies/${policyDocumentId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}
