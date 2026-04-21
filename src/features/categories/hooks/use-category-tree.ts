/**
 * useCategoryTreeQuery - API-048 GET /api/v1/categories/tree
 *
 * Returns the full nested category tree.
 * Used by:
 *   - Dashboard categories page (tree display + DnD)
 *   - Product create/edit form (hierarchical category selector)
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   API-048: GET /api/v1/categories/tree
 */

import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from '../api/category.keys';
import { getCategoriesTree } from '../api/category.service';
import type { CategoryTreeNode } from '../types';

/** Flat traversal helper: collect all nodes from a tree into a flat array. */
export function flattenTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  function traverse(list: CategoryTreeNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children.length > 0) traverse(node.children);
    }
  }
  traverse(nodes);
  return result;
}

/**
 * API-048: GET /api/v1/categories/tree
 * Long staleTime (5 min) - tree changes are infrequent and we invalidate
 * on every create/update/delete via categoryKeys.tree().
 */
export function useCategoryTreeQuery() {
  return useQuery<CategoryTreeNode[]>({
    queryKey: categoryKeys.tree(),
    queryFn: getCategoriesTree,
    staleTime: 5 * 60 * 1000, // 5 min
    select: (data) => data ?? [],
  });
}
