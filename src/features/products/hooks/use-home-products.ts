/**
 * useHomeFeaturedProductsQuery / useHomeBudgetProductsQuery
 * API-053 GET /api/v1/products
 *
 * Maps ProductResponse (BE) → Product (@/types/catalog) so that
 * ProductCard can stay untouched.
 *
 * Field mapping:
 *   ProductResponse.images[]          → Product.productImages[]
 *   ProductResponse.color (string)    → Product.colors[]  (mapped to {name, value})
 *   ProductResponse.brand             → (ignored by ProductCard — no field used)
 *   All other fields are 1-to-1.
 *
 * Note on `color`:
 *   BE sends a single color string (e.g. "Black"). ProductCard renders
 *   swatch dots using colors[].value (CSS color). Since BE only sends a
 *   name (not a hex value) we can't render swatch dots reliably, so we
 *   map it to an empty array. ProductCard already handles the empty-colors
 *   case with a reserved placeholder space.
 */

import { useQuery } from '@tanstack/react-query';
import { productKeys } from '../api/product.keys';
import { getProducts } from '../api/product.service';
import type { PaginatedProductsResponse, ProductResponse } from '../types';
import type { Product } from '@/types/catalog';

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Map a BE ProductResponse to the local Product type that ProductCard expects.
 *
 * `productImages` ← `images`  (field rename)
 * `colors`        ← []        (BE has only a single color name, no hex — skipped)
 */
function toLocalProduct(p: ProductResponse): Product {
  return {
    productId: p.productId,
    categoryId: p.categoryId,
    name: p.name,
    dailyPrice: p.dailyPrice,
    oldDailyPrice: p.oldDailyPrice ?? undefined,
    depositAmount: p.depositAmount ?? undefined,
    description: p.description ?? '',
    shortDescription: p.shortDescription ?? '',
    minRentalDays: p.minRentalDays,
    // BE field is `images`, local type expects `productImages`
    productImages: (p.images ?? []).map((img) => ({
      productImageId: img.productImageId,
      productId: p.productId,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })),
    // BE sends a single color string (no hex) → we can't render swatches
    colors: [],
  };
}

/** Select only active products and map to local Product type. */
function selectProducts(data: PaginatedProductsResponse): Product[] {
  return (data?.content ?? []).filter((p) => p.isActive).map(toLocalProduct);
}

// ─── Featured products: sorted by dailyPrice desc ─────────────────────────────

const FEATURED_PARAMS = {
  page: 0,
  size: 8,
  sort: 'dailyPrice,desc',
  filter: 'isActive:true',
} as const;

/**
 * "Sản phẩm nổi bật" — products sorted by dailyPrice descending.
 * staleTime 60 s (home page content, refreshed on each visit).
 */
export function useHomeFeaturedProductsQuery() {
  return useQuery<PaginatedProductsResponse, Error, Product[]>({
    queryKey: productKeys.list(FEATURED_PARAMS),
    queryFn: () => getProducts(FEATURED_PARAMS),
    staleTime: 60 * 1000,
    select: selectProducts,
  });
}

// ─── Budget products: sorted by dailyPrice asc ────────────────────────────────

const BUDGET_PARAMS = {
  page: 0,
  size: 8,
  sort: 'dailyPrice,asc',
  filter: 'isActive:true',
} as const;

/**
 * "Có thể bạn thích" — products sorted by dailyPrice ascending.
 * staleTime 60 s.
 */
export function useHomeBudgetProductsQuery() {
  return useQuery<PaginatedProductsResponse, Error, Product[]>({
    queryKey: productKeys.list(BUDGET_PARAMS),
    queryFn: () => getProducts(BUDGET_PARAMS),
    staleTime: 60 * 1000,
    select: selectProducts,
  });
}
