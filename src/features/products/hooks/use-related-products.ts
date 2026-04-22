/**
 * useRelatedProductsQuery
 * API-054: GET /api/v1/products
 * - Ưu tiên lấy theo cùng category để tăng độ liên quan
 * - Loại bỏ sản phẩm đang xem ở client
 */

import { useQuery } from "@tanstack/react-query";
import { productKeys } from "../api/product.keys";
import { getProducts } from "../api/product.service";
import type { ProductResponse } from "../types";

const DISPLAY_COUNT = 5;
/** Lấy dư để sau khi loại trừ productId vẫn đủ slide */
const FETCH_SIZE = 12;

function pickPrimaryImageUrl(p: ProductResponse): string | null {
  const imgs = p.images ?? [];
  if (!imgs.length) return null;
  const primary = imgs.find((i) => i.isPrimary);
  if (primary) return primary.imageUrl;
  const sorted = [...imgs].sort((a, b) => b.sortOrder - a.sortOrder);
  return sorted[0]?.imageUrl ?? null;
}

function discountPercent(
  dailyPrice: number,
  oldDailyPrice: number | null | undefined,
): number | undefined {
  if (oldDailyPrice == null || oldDailyPrice <= dailyPrice) return undefined;
  return Math.round(((oldDailyPrice - dailyPrice) / oldDailyPrice) * 100);
}

export interface RelatedProductCardModel {
  productId: string;
  name: string;
  imageUrl: string | null;
  dailyPrice: number;
  oldDailyPrice: number | null;
  discountPercent: number | undefined;
  rating: number;
}

function toCardModels(
  items: ProductResponse[],
  excludeProductId: string,
): RelatedProductCardModel[] {
  return items
    .filter((p) => p.productId !== excludeProductId && p.isActive)
    .slice(0, DISPLAY_COUNT)
    .map((p) => ({
      productId: p.productId,
      name: p.name,
      imageUrl: pickPrimaryImageUrl(p),
      dailyPrice: p.dailyPrice,
      oldDailyPrice: p.oldDailyPrice,
      discountPercent: discountPercent(p.dailyPrice, p.oldDailyPrice),
      rating: p.averageRating ?? 0,
    }));
}

export function useRelatedProductsQuery(
  excludeProductId: string | undefined,
  categoryId?: string | null,
) {
  return useQuery({
    queryKey: productKeys.related(excludeProductId ?? "", categoryId),
    queryFn: async () => {
      const filters = ["isActive:true"];
      if (categoryId) {
        filters.push(`categoryId:'${categoryId}'`);
      }

      const data = await getProducts({
        page: 1,
        size: FETCH_SIZE,
        sort: "createdAt,desc",
        filter: filters.join(" and "),
        onlyWithStock: true,
      });
      return toCardModels(data.content ?? [], excludeProductId!);
    },
    enabled: !!excludeProductId,
    staleTime: 60 * 1000,
  });
}
