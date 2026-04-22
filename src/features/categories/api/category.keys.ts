import type { CategoryListParams } from "../types";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: CategoryListParams) =>
    [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (categoryId: string) =>
    [...categoryKeys.details(), categoryId] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
};
