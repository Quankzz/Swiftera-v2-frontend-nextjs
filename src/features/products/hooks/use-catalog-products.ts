/**
 * useCatalogProductsQuery — API-054 GET /api/v1/products
 *
 * Powers the public catalog page with:
 *  - category / subcategory filtering
 *  - brand multi-select
 *  - price range
 *  - sort
 *  - pagination
 *
 * The RSQL `filter` is built here so the caller only deals with
 * typed params, never raw strings.
 *
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 *   API-054: GET /api/v1/products
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product.service';
import type { PaginatedProductsResponse, ProductResponse } from '../types';
import type { Product } from '@/types/catalog';

// ─── Catalog query params ─────────────────────────────────────────────────────

export interface CatalogQueryParams {
  /** Top-level category ID (required to scope the catalog page) */
  categoryId?: string;
  /** Subcategory ID — if present, products are filtered to this child category */
  subcategoryId?: string;
  /** Free-text search query — matched against product name (contains) */
  searchQuery?: string;
  /** Multi-select brand names (BE stores brand as a single string per product) */
  brands?: string[];
  /** Minimum daily price in VND */
  minPrice?: string;
  /** Maximum daily price in VND */
  maxPrice?: string;
  /** Sort string — same format as BE: "field,direction" */
  sort?: string;
  /** 1-based page index (URL-visible) */
  page?: number;
  /** Page size */
  size?: number;
}

// ─── Catalog result ───────────────────────────────────────────────────────────

export interface CatalogResult {
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  /** Unique brand names extracted from this page's products — used by filter sidebar */
  brands: string[];
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

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
    productImages: (p.images ?? []).map((img) => ({
      productImageId: img.productImageId,
      productId: p.productId,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
    })),
    colors: [],
  };
}

function selectCatalogResult(data: PaginatedProductsResponse): CatalogResult {
  const content = data?.content ?? [];
  const brands = Array.from(
    new Set(content.map((p) => p.brand).filter(Boolean) as string[]),
  ).sort();

  return {
    products: content.filter((p) => p.isActive).map(toLocalProduct),
    totalElements: data.meta.totalElements,
    totalPages: data.meta.totalPages,
    currentPage: data.meta.currentPage,
    hasNext: data.meta.hasNext,
    hasPrevious: data.meta.hasPrevious,
    brands,
  };
}

// ─── RSQL filter builder ──────────────────────────────────────────────────────

function buildFilter(params: CatalogQueryParams): string {
  const parts: string[] = ['isActive:true'];

  // Free-text search: name contains query (SpringFilter `~` = like)
  if (params.searchQuery?.trim()) {
    const safe = params.searchQuery.trim().replace(/'/g, "\\'");
    parts.push(`name~'*${safe}*'`);
  }

  // Use subcategoryId when present, otherwise fall back to categoryId
  const activeCategory = params.subcategoryId ?? params.categoryId;
  if (activeCategory) {
    // SpringFilter DSL field path: product entity has a @ManyToOne `category`
    // relation — the filterable path is `category.id`, NOT `categoryId`.
    parts.push(`category.id:'${activeCategory}'`);
  }

  // Brand filter: each brand produces an OR clause
  if (params.brands && params.brands.length > 0) {
    const brandClause = params.brands.map((b) => `brand:'${b}'`).join(' or ');
    parts.push(`(${brandClause})`);
  }

  // Price range
  if (params.minPrice && !isNaN(parseInt(params.minPrice, 10))) {
    parts.push(`dailyPrice>='${params.minPrice}'`);
  }
  if (params.maxPrice && !isNaN(parseInt(params.maxPrice, 10))) {
    parts.push(`dailyPrice<='${params.maxPrice}'`);
  }

  return parts.join(' and ');
}

// ─── Query key ────────────────────────────────────────────────────────────────

export const catalogKeys = {
  all: ['catalog'] as const,
  list: (params: CatalogQueryParams) =>
    [...catalogKeys.all, 'list', params] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated, filtered product list for the public catalog page.
 *
 * Uses `keepPreviousData` so the UI doesn't flash empty while params change.
 */
export function useCatalogProductsQuery(params: CatalogQueryParams = {}) {
  const { sort = 'createdAt,desc', page = 1, size = 12 } = params;

  // BE uses 0-based page index; URL uses 1-based
  const beParams = {
    page: page - 1,
    size,
    sort,
    filter: buildFilter(params),
  };

  return useQuery<PaginatedProductsResponse, Error, CatalogResult>({
    queryKey: catalogKeys.list(params),
    queryFn: () => getProducts(beParams),
    select: selectCatalogResult,
    staleTime: 60 * 1000, // 60 s
    placeholderData: keepPreviousData,
  });
}
