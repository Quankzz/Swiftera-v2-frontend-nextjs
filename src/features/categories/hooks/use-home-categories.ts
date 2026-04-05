/**
 * useHomeCategoriesQuery — API-048 GET /api/v1/categories/tree
 *
 * Maps CategoryTreeNode[] (BE) → Category[] (local @/types/catalog)
 * so that CategoryCarousel / CategoryCard can stay untouched.
 *
 * Only root-level nodes (top of the tree) are returned; children
 * are intentionally excluded from the home carousel.
 *
 * Field mapping:
 *   CategoryTreeNode.categoryId → Category.categoryId
 *   CategoryTreeNode.name       → Category.name
 *   CategoryTreeNode.sortOrder  → Category.sortOrder
 *   parentId                    → null (root = no parent)
 *   slug                        → categoryId (fallback; no slug in BE)
 *   image                       → undefined (BE has no image field)
 */

import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from '../api/category.keys';
import { getCategoriesTree } from '../api/category.service';
import type { CategoryTreeNode } from '../types';
import type { Category } from '@/types/catalog';

/** Map a single root-level CategoryTreeNode to the local Category shape. */
function treeNodeToCategory(node: CategoryTreeNode): Category {
  return {
    categoryId: node.categoryId,
    parentId: null, // root-level node → no parent
    name: node.name,
    sortOrder: node.sortOrder,
    slug: node.categoryId, // BE has no slug; use categoryId as fallback
    imageUrl: node.imageUrl,
  };
}

/**
 * Returns the root-level categories (top of the tree) mapped to
 * the local `Category` type, sorted by sortOrder ascending.
 *
 * staleTime: 5 min (tree is rarely updated).
 */
export function useHomeCategoriesQuery() {
  return useQuery<CategoryTreeNode[], Error, Category[]>({
    queryKey: categoryKeys.tree(),
    queryFn: getCategoriesTree,
    staleTime: 5 * 60 * 1000, // 5 min — tree changes are infrequent
    select: (data) =>
      (data ?? [])
        .filter((node) => node.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(treeNodeToCategory),
  });
}
