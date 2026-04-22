/**
 * Category service - all API calls for the categories module.
 * HTTP layer: httpService (axios) - dùng http.ts.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 7: CATEGORIES (API-045 → API-050)
 */

import { httpService } from "@/api/http";
import type { ApiResponse } from "@/types/api.types";
import type {
  CategoryListParams,
  CategoryResponse,
  CategoryTreeNode,
  CreateCategoryInput,
  PaginatedCategoriesResponse,
  UpdateCategoryInput,
} from "../types";

const authOpts = { requireToken: true as const };

// ─── API-047: GET /api/v1/categories ─────────────────────────────────────────
// Flat paginated list. Use for admin table, filters, pagination.

export async function getCategoriesList(
  params: CategoryListParams = {},
): Promise<PaginatedCategoriesResponse> {
  const { page = 0, size = 100, sort, filter } = params;
  const res = await httpService.get<ApiResponse<PaginatedCategoriesResponse>>(
    "/categories",
    { params: { page, size, sort, filter } },
  );
  return res.data.data!;
}

// ─── API-048: GET /api/v1/categories/tree ────────────────────────────────────
// Full nested tree. Use for hierarchical display and product form selects.

export async function getCategoriesTree(): Promise<CategoryTreeNode[]> {
  const res =
    await httpService.get<ApiResponse<CategoryTreeNode[]>>("/categories/tree");
  return res.data.data!;
}

// ─── API-046: GET /api/v1/categories/{categoryId} ────────────────────────────

export async function getCategoryById(
  categoryId: string,
): Promise<CategoryResponse> {
  const res = await httpService.get<ApiResponse<CategoryResponse>>(
    `/categories/${categoryId}`,
  );
  return res.data.data!;
}

// ─── API-045: POST /api/v1/categories ────────────────────────────────────────
// name required. parentId + sortOrder optional.
// sortOrder >= 1; auto-assigned if omitted.

export async function createCategory(
  payload: CreateCategoryInput,
): Promise<CategoryResponse> {
  const res = await httpService.post<ApiResponse<CategoryResponse>>(
    "/categories",
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─── API-049: PATCH /api/v1/categories/{categoryId} ──────────────────────────
// All fields optional.
// parentId: null  → move to root
// parentId: omit  → keep current parent

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryInput,
): Promise<CategoryResponse> {
  const res = await httpService.patch<ApiResponse<CategoryResponse>>(
    `/categories/${categoryId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

// ─── API-050: DELETE /api/v1/categories/{categoryId} ─────────────────────────
// Children are auto-promoted to the deleted category's parent level (not cascade).
// Fails with CATEGORY_HAS_PRODUCTS if the category has linked products.

export async function deleteCategory(
  categoryId: string,
): Promise<{ success: boolean; data: null }> {
  const res = await httpService.delete<{ success: boolean; data: null }>(
    `/categories/${categoryId}`,
    authOpts,
  );
  return res.data;
}
