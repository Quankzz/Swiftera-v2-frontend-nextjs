/**
 * Category service — all API calls for the categories module.
 * HTTP layer: apiService.ts (KHÔNG dùng client.ts).
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 7: CATEGORIES (API-045 → API-050)
 */

import { apiDelete, apiGet, apiPatch, apiPost } from '@/api/apiService';
import type {
  CategoryListParams,
  CategoryResponse,
  CategoryTreeNode,
  CreateCategoryInput,
  PaginatedCategoriesResponse,
  UpdateCategoryInput,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQuery(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      q.set(key, String(val));
    }
  }
  // Replace `+` (form-encoded space) with `%20` so Spring's filter DSL
  // receives proper spaces in RSQL expressions.
  const str = q.toString().replace(/\+/g, '%20');
  return str ? `?${str}` : '';
}

// ─── API-047: GET /api/v1/categories ─────────────────────────────────────────
// Flat paginated list. Use for admin table, filters, pagination.

export function getCategoriesList(
  params: CategoryListParams = {},
): Promise<PaginatedCategoriesResponse> {
  const { page = 0, size = 100, sort, filter } = params;
  const query = buildQuery({ page, size, sort, filter });
  return apiGet<PaginatedCategoriesResponse>(`/categories${query}`);
}

// ─── API-048: GET /api/v1/categories/tree ────────────────────────────────────
// Full nested tree. Use for hierarchical display and product form selects.

export function getCategoriesTree(): Promise<CategoryTreeNode[]> {
  return apiGet<CategoryTreeNode[]>('/categories/tree');
}

// ─── API-046: GET /api/v1/categories/{categoryId} ────────────────────────────

export function getCategoryById(categoryId: string): Promise<CategoryResponse> {
  return apiGet<CategoryResponse>(`/categories/${categoryId}`);
}

// ─── API-045: POST /api/v1/categories ────────────────────────────────────────
// name required. parentId + sortOrder optional.
// sortOrder >= 1; auto-assigned if omitted.

export function createCategory(
  payload: CreateCategoryInput,
): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>('/categories', payload);
}

// ─── API-049: PATCH /api/v1/categories/{categoryId} ──────────────────────────
// All fields optional.
// parentId: null  → move to root
// parentId: omit  → keep current parent

export function updateCategory(
  categoryId: string,
  payload: UpdateCategoryInput,
): Promise<CategoryResponse> {
  return apiPatch<CategoryResponse>(`/categories/${categoryId}`, payload);
}

// ─── API-050: DELETE /api/v1/categories/{categoryId} ─────────────────────────
// Children are auto-promoted to the deleted category's parent level (not cascade).
// Fails with CATEGORY_HAS_PRODUCTS if the category has linked products.

export function deleteCategory(
  categoryId: string,
): Promise<{ success: boolean; data: null }> {
  return apiDelete<{ success: boolean; data: null }>(
    `/categories/${categoryId}`,
  );
}
