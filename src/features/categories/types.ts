/**
 * Category feature types — source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 * Module 7: CATEGORIES (API-045 → API-050)
 */

// ── Shared pagination (same shape across all paginated responses) ────────────

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  content: T[];
}

// ── CategoryResponse (API-045, API-046, API-049) ─────────────────────────────
// Returned by create / get-by-id / update.
// `children` is present (empty array) in these responses.

export interface CategoryResponse {
  categoryId: string;
  parentId: string | null;
  name: string;
  sortOrder: number;
  isActive: boolean;
  children: CategoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export type PaginatedCategoriesResponse = PaginatedResponse<CategoryResponse>;

// ── CategoryTreeNode (API-048 GET /categories/tree) ─────────────────────────
// Tree nodes do NOT have parentId — it is implied by nesting.

export interface CategoryTreeNode {
  categoryId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  children: CategoryTreeNode[];
}

// ── Create input (API-045 POST /api/v1/categories) ──────────────────────────

export interface CreateCategoryInput {
  /** required */
  name: string;
  /** null = root category; omit to create at root */
  parentId?: string | null;
  /** >= 1; auto-assigned if omitted */
  sortOrder?: number;
}

// ── Update input (API-049 PATCH /api/v1/categories/{categoryId}) ─────────────
// All fields optional.
// parentId: null  → move to root
// parentId: omit  → keep current parent

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

// ── Query params (API-047 GET /api/v1/categories) ───────────────────────────

export interface CategoryListParams {
  page?: number;
  size?: number;
  sort?: string;
  /** RSQL filter, e.g. "isActive:true" */
  filter?: string;
}
