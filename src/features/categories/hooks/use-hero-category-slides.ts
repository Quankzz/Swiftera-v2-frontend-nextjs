/**
 * useHeroCategorySlidesQuery
 *
 * Builds hero slides from the root-level categories returned by
 * API-048 GET /api/v1/categories/tree.
 *
 * Each slide maps to one root category:
 *   title       ← category.name
 *   categoryId  ← category.categoryId  (used for /catalog?categoryId=…)
 *   image       ← category.imageUrl    (shown as orbit image)
 *   orbitImages ← imageUrls of all children that have an imageUrl
 */

import { useQuery } from "@tanstack/react-query";
import { categoryKeys } from "../api/category.keys";
import { getCategoriesTree } from "../api/category.service";
import type { CategoryTreeNode } from "../types";

export interface HeroCategorySlide {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  image: string;
  orbitImages: string[];
}

/** Collect imageUrls from a node and its children (up to 2 levels deep). */
function collectImages(node: CategoryTreeNode): string[] {
  const imgs: string[] = [];
  if (node.imageUrl) imgs.push(node.imageUrl);
  for (const child of node.children ?? []) {
    if (child.imageUrl) imgs.push(child.imageUrl);
    for (const sub of child.children ?? []) {
      if (sub.imageUrl) imgs.push(sub.imageUrl);
    }
  }
  return imgs;
}

function toHeroSlide(node: CategoryTreeNode): HeroCategorySlide {
  const imgs = collectImages(node);
  return {
    title: node.name,
    subtitle: "Chọn Swiftera",
    description:
      "Thuê thiết bị linh hoạt, chi phí hợp lý, giao hàng nhanh và đổi trả dễ dàng.",
    categoryId: node.categoryId,
    image: node.imageUrl ?? imgs[0] ?? "",
    orbitImages: imgs.length > 0 ? imgs : [],
  };
}

/**
 * Returns hero slides derived from active root categories,
 * sorted by sortOrder asc.
 */
export function useHeroCategorySlidesQuery() {
  return useQuery<CategoryTreeNode[], Error, HeroCategorySlide[]>({
    queryKey: categoryKeys.tree(),
    queryFn: getCategoriesTree,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      (data ?? [])
        .filter((n) => n.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toHeroSlide),
  });
}
