/**
 * Hooks for the categories module (dashboard CRUD).
 *
 *  - useCategoriesQuery        — flat paginated list (API-047)
 *  - useCategoryQuery          — single category by ID (API-046)
 *  - useCreateCategoryMutation — create (API-045)
 *  - useUpdateCategoryMutation — update (API-049)
 *  - useDeleteCategoryMutation — delete (API-050)
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   Module 7: CATEGORIES (API-045 → API-050)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '../api/category.keys';
import {
  createCategory,
  deleteCategory,
  getCategoriesList,
  getCategoryById,
  updateCategory,
} from '../api/category.service';
import type {
  CategoryListParams,
  CategoryResponse,
  CreateCategoryInput,
  PaginatedCategoriesResponse,
  UpdateCategoryInput,
} from '../types';

// ── API-047: flat paginated list ─────────────────────────────────────────────

export function useCategoriesQuery(params?: CategoryListParams) {
  return useQuery<PaginatedCategoriesResponse>({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategoriesList(params),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ── API-046: single category by ID ──────────────────────────────────────────

export function useCategoryQuery(categoryId: string | undefined) {
  return useQuery<CategoryResponse>({
    enabled: !!categoryId,
    queryKey: categoryId
      ? categoryKeys.detail(categoryId)
      : categoryKeys.details(),
    queryFn: () => getCategoryById(categoryId as string),
    staleTime: 30 * 1000,
  });
}

// ── API-045: create ──────────────────────────────────────────────────────────

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<CategoryResponse, Error, CreateCategoryInput>({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      qc.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
}

// ── API-049: update ──────────────────────────────────────────────────────────

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<
    CategoryResponse,
    Error,
    { categoryId: string; payload: UpdateCategoryInput }
  >({
    mutationFn: ({ categoryId, payload }) =>
      updateCategory(categoryId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      qc.invalidateQueries({ queryKey: categoryKeys.tree() });
      qc.invalidateQueries({
        queryKey: categoryKeys.detail(variables.categoryId),
      });
    },
  });
}

// ── API-050: delete ──────────────────────────────────────────────────────────
// BE auto-promotes children to parent level (not cascade).
// Fails if category has products: error code CATEGORY_HAS_PRODUCTS.

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean; data: null }, Error, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      qc.invalidateQueries({ queryKey: categoryKeys.tree() });
    },
  });
}
