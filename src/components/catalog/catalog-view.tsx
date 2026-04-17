'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCatalogProductsQuery } from '@/features/products/hooks/use-catalog-products';
import {
  useCategoryTreeQuery,
  flattenTree,
} from '@/features/categories/hooks/use-category-tree';
import { ProductCard } from '@/components/home/product-card';
import {
  CatalogFilter,
  EMPTY_FILTER,
  type FilterState,
} from './catalog-filter';
import { CatalogHeader, type SortOption } from './catalog-header';
import { SubcategoryBar } from './subcategory-bar';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const VALID_SORTS: SortOption[] = [
  'relevance',
  'price-asc',
  'price-desc',
  'newest',
];

/** Map UI SortOption → BE sort string */
const SORT_MAP: Record<SortOption, string | undefined> = {
  // `relevance` intentionally maps to `undefined` so FE won't send a
  // `sort` param to the backend and the backend can apply its default
  // relevance ordering. Other options map to explicit sort strings.
  relevance: undefined,
  'price-asc': 'dailyPrice,asc',
  'price-desc': 'dailyPrice,desc',
  newest: 'createdAt,desc',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CatalogViewProps {
  /** Initial values from server-side searchParams — used to seed state */
  initialCategoryId?: string;
  initialSubcategoryId?: string;
  initialSort?: SortOption;
  initialPage?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CatalogView({
  initialCategoryId,
  initialSubcategoryId,
  initialSort = 'relevance',
  initialPage = 1,
}: CatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read from URL (URL is source of truth) ───────────────────────────────
  // Support both ?categoryId= (internal navigation) and ?category= (from Home)
  const categoryId =
    searchParams.get('categoryId') ??
    searchParams.get('category') ??
    initialCategoryId;
  const subcategoryId =
    searchParams.get('subcategoryId') ?? initialSubcategoryId;
  const searchQuery = searchParams.get('q') ?? undefined;
  const sortParam = (searchParams.get('sort') ?? initialSort) as SortOption;
  const sort: SortOption = VALID_SORTS.includes(sortParam)
    ? sortParam
    : 'relevance';
  const page =
    parseInt(searchParams.get('page') ?? String(initialPage), 10) || 1;

  // ── Normalize URL: replace legacy ?category= with ?categoryId= ───────────
  useEffect(() => {
    const legacyCategory = searchParams.get('category');
    if (legacyCategory && !searchParams.get('categoryId')) {
      const next = new URLSearchParams(searchParams.toString());
      next.set('categoryId', legacyCategory);
      next.delete('category');
      router.replace(`?${next.toString()}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local filter state (brands + price — NOT in URL for now) ─────────────
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Category tree (for subcategory bar) ──────────────────────────────────
  const { data: tree = [] } = useCategoryTreeQuery();
  const flatCategories = useMemo(() => flattenTree(tree), [tree]);

  const activeRootNode = useMemo(
    () =>
      categoryId ? tree.find((n) => n.categoryId === categoryId) : undefined,
    [tree, categoryId],
  );

  const subcategories = useMemo(
    () => activeRootNode?.children ?? [],
    [activeRootNode],
  );

  // ── Products query ────────────────────────────────────────────────────────
  const apiSort = SORT_MAP[sort];

  const { data, isLoading, isFetching } = useCatalogProductsQuery({
    categoryId: categoryId ?? undefined,
    subcategoryId: subcategoryId ?? undefined,
    searchQuery,
    brands: filterState.brands.length > 0 ? filterState.brands : undefined,
    minPrice: filterState.priceMin || undefined,
    maxPrice: filterState.priceMax || undefined,
      ...(apiSort ? { sort: apiSort } : {}),
    onlyWithStock: true,
    page,
    size: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ── Brand options: extracted from API response ────────────────────────────
  const brandOptions = useMemo(
    () => (data?.brands ?? []).map((b) => ({ id: b, label: b })),
    [data?.brands],
  );

  // ── Derived display values ────────────────────────────────────────────────
  const activeCategoryName = useMemo(() => {
    if (searchQuery) return `Kết quả tìm kiếm: "${searchQuery}"`;
    if (!categoryId) return 'Tất cả sản phẩm';
    // If subcategory is selected, use subcategory name
    if (subcategoryId) {
      const sub = flatCategories.find((n) => n.categoryId === subcategoryId);
      if (sub) return sub.name;
    }
    return activeRootNode?.name ?? 'Sản phẩm';
  }, [searchQuery, categoryId, subcategoryId, flatCategories, activeRootNode]);

  const breadcrumbs = useMemo(() => {
    if (!activeRootNode) return [];
    const items: { label: string; href?: string }[] = [
      {
        label: activeRootNode.name,
        href: `/catalog?categoryId=${activeRootNode.categoryId}`,
      },
    ];
    if (subcategoryId) {
      const sub = flatCategories.find((n) => n.categoryId === subcategoryId);
      if (sub) items.push({ label: sub.name }); // last crumb — no href
    }
    return items;
  }, [activeRootNode, subcategoryId, flatCategories]);

  const categoryOptions = useMemo(
    () => tree.map((n) => ({ id: n.categoryId, label: n.name })),
    [tree],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const pushParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      router.push(`?${next.toString()}`);
    },
    [router, searchParams],
  );

  const handleSortChange = (s: SortOption) => {
    const next = new URLSearchParams(searchParams.toString());
      // `relevance` = backend default ordering → remove `sort` param.
      if (s === 'relevance') {
        next.delete('sort');
      } else {
        next.set('sort', s);
      }
    next.delete('page');
    router.push(`?${next.toString()}`);
  };

  const handleFilterChange = (next: FilterState) => {
    setFilterState(next);
    // Reset page when filters change
    pushParam('page', null);
  };

  const handlePageChange = (p: number) => {
    pushParam('page', String(p));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDataLoading = isLoading || isFetching;

  return (
    <div>
      {/* Catalog Header */}
      <CatalogHeader
        variant={searchQuery ? 'search' : categoryId ? 'category' : 'search'}
        title={activeCategoryName}
        breadcrumbs={breadcrumbs}
        count={total}
        sort={sort}
        onSortChange={handleSortChange}
        onToggleFilter={() => setFilterOpen((v) => !v)}
      />

      {/* Subcategory bar — only when root category has children */}
      {subcategories.length > 0 && (
        <div className='mt-5'>
          <SubcategoryBar
            subcategories={subcategories}
            activeSub={subcategoryId ?? undefined}
          />
        </div>
      )}

      {/* Mobile filter overlay */}
      {filterOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 lg:hidden'
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* Main content: filter sidebar + product grid */}
      <div className='relative mt-6 flex items-start gap-6'>
        {/* Filter sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white dark:bg-surface-base p-5 shadow-xl transition-transform duration-300',
            'lg:static lg:z-auto lg:w-auto lg:bg-transparent lg:dark:bg-transparent lg:p-0 lg:shadow-none',
            'lg:sticky lg:top-1.5 lg:self-start',
            'lg:min-w-55 lg:max-w-65 lg:flex-none lg:translate-x-0',
            filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <CatalogFilter
            filterState={filterState}
            onChange={handleFilterChange}
            brandOptions={brandOptions}
            categoryOptions={categoryOptions}
            activeCategoryId={categoryId ?? undefined}
            onCategoryChange={(id) => {
              const next = new URLSearchParams(searchParams.toString());
              next.set('categoryId', id);
              next.delete('category'); // clean up legacy ?category= param from Home
              next.delete('subcategoryId');
              next.delete('page');
              router.push(`?${next.toString()}`);
            }}
            onClose={() => setFilterOpen(false)}
          />
        </div>

        {/* Product grid */}
        <div className='min-h-96 min-w-0 flex-1'>
          {isDataLoading ? (
            <div className='flex min-h-96 items-center justify-center'>
              <Loader2 className='size-10 animate-spin text-theme-primary-start' />
            </div>
          ) : products.length === 0 ? (
            <div className='flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-24 text-center'>
              <SearchX
                className='size-20 text-theme-primary-start'
                strokeWidth={1.5}
              />
              <p className='mt-4 text-lg font-semibold text-text-main'>
                Không tìm thấy sản phẩm
              </p>
              <p className='mt-1 text-sm text-text-sub'>
                Thử thay đổi bộ lọc hoặc chọn danh mục khác
              </p>
              {(filterState.brands.length > 0 ||
                filterState.priceMin !== '' ||
                filterState.priceMax !== '') && (
                <button
                  type='button'
                  onClick={() => setFilterState(EMPTY_FILTER)}
                  className='mt-4 rounded-lg border border-gray-200 dark:border-white/15 px-4 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5'
                >
                  Xoá tất cả bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-10 flex flex-col items-center gap-4'>
              {/* Progress bar */}
              <div className='w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-white/10'>
                <div
                  role='progressbar'
                  aria-valuenow={Math.round((page / totalPages) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className='h-1.5 rounded-full bg-theme-primary-start transition-[width] duration-500'
                  style={{ width: `${Math.round((page / totalPages) * 100)}%` }}
                />
              </div>

              {/* Page label */}
              <p className='text-sm text-text-sub'>
                Trang{' '}
                <span className='font-semibold text-text-main'>{page}</span>{' '}
                trong{' '}
                <span className='font-semibold text-text-main'>
                  {totalPages}
                </span>{' '}
                — {total.toLocaleString('vi-VN')} sản phẩm
              </p>

              {/* Pagination buttons */}
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className='rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-text-main shadow-sm transition hover:bg-gray-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ← Trước
                </button>

                {/* Page number chips */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push('ellipsis');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === 'ellipsis' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className='px-1 text-text-sub'
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type='button'
                        onClick={() => handlePageChange(item)}
                        className={cn(
                          'size-9 rounded-lg border text-sm font-medium transition',
                          item === page
                            ? 'border-theme-primary-start bg-theme-primary-start text-white'
                            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-main hover:bg-gray-50 dark:hover:bg-white/10',
                        )}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  type='button'
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className='rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-text-main shadow-sm transition hover:bg-gray-50 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
