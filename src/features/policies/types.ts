/**
 * Policies module types
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md — Module 17: POLICIES
 */

import type { PaginationResponse } from '@/types/api.types';

// ─────────────────────────────────────────────────────────────────────────────
// Policy Document Response (API-106 → API-110)
// ─────────────────────────────────────────────────────────────────────────────

export interface PolicyDocumentResponse {
  policyDocumentId: string;
  code: string;
  policyVersion: number;
  title: string;
  pdfUrl: string | null;
  pdfHash: string | null;
  effectiveFrom: string; // ISO datetime từ BE
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Response
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedPoliciesResponse =
  PaginationResponse<PolicyDocumentResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// List Params (API-109)
// ─────────────────────────────────────────────────────────────────────────────

export interface PolicyListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string; // SpringFilter DSL
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Inputs
// ─────────────────────────────────────────────────────────────────────────────

/** API-106: POST /policies */
export interface CreatePolicyInput {
  code: string;
  policyVersion: number;
  title: string;
  pdfUrl?: string | null;
  pdfHash?: string | null;
  effectiveFrom: string; // ISO 8601 e.g. "2026-04-01T00:00:00Z"
}

/** API-109A: PATCH /policies/{policyId} — tất cả field tùy chọn */
export interface UpdatePolicyInput {
  title?: string;
  pdfUrl?: string | null;
  effectiveFrom?: string; // ISO 8601
}
