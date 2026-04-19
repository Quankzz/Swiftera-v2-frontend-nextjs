'use client';

import { useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { products } from '@/data/products';
import { categories } from '@/data/categories';
import { ProductCard } from '@/components/home/product-card';
import {
  CatalogFilter,
  EMPTY_FILTER,
  type FilterState,
} from './catalog-filter';
import { CatalogHeader, type SortOption } from './catalog-header';

/**
 * @deprecated Use CatalogView instead. This component uses static mock data.
 * Kept for reference only - not rendered by any live page.
 */

// ─── Config ──────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const topLevelCategories = categories.filter((c) => c.parentId === null);

const allBrands = Array.from(
  new Set(topLevelCategories.flatMap((c) => c.brands ?? [])),
).sort();

const brandOptions = allBrands.map((b) => ({ id: b, label: b }));

// ─── Filter + sort logic ─────────────────────────────────────────
function applyFilters(
  allProducts: typeof products,
  filters: FilterState,
  sort: SortOption,
  query: string,
) {
  let result = [...allProducts];

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }

  if (filters.brands.length > 0) {
    result = result.filter((p) =>
      filters.brands.some((b) =>
        p.name.toLowerCase().includes(b.toLowerCase()),
      ),
    );
  }

  if (filters.priceMin !== '') {
    const min = parseInt(filters.priceMin, 10);
    if (!isNaN(min)) result = result.filter((p) => p.dailyPrice >= min);
  }
  if (filters.priceMax !== '') {
    const max = parseInt(filters.priceMax, 10);
    if (!isNaN(max)) result = result.filter((p) => p.dailyPrice <= max);
  }

  switch (sort) {
    case 'price-asc':
      result.sort((a, b) => a.dailyPrice - b.dailyPrice);
      break;
    case 'price-desc':
      result.sort((a, b) => b.dailyPrice - a.dailyPrice);
      break;
    case 'newest':
      result.reverse();
      break;
    default:
      break;
  }

  return result;
}

// ─── Props ───────────────────────────────────────────────────────
interface CatalogGridProps {
  initialQuery?: string;
  initialCategoryId?: string;
  initialSort?: SortOption;
}

export function CatalogGrid({
  initialQuery = '',
  initialSort = 'relevance',
}: CatalogGridProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(products, filters, sort, initialQuery),
    [filters, sort, initialQuery],
  );

  const visible = filtered.slice(0, visibleCount);
  const total = filtered.length;
  const progress =
    total === 0 ? 100 : Math.min((visibleCount / total) * 100, 100);
  const hasMore = visibleCount < total;

  return (
    <div>
      <CatalogHeader
        variant={initialQuery ? 'search' : 'category'}
        title={initialQuery || 'Tất cả sản phẩm'}
        count={total}
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setVisibleCount(PAGE_SIZE);
        }}
        onToggleFilter={() => setFilterOpen((v) => !v)}
      />

      {filterOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 lg:hidden'
          onClick={() => setFilterOpen(false)}
        />
      )}

      <div className='relative mt-6 flex gap-6'>
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white dark:bg-surface-base p-5 shadow-xl transition-transform duration-300',
            'lg:static lg:z-auto lg:w-auto lg:overflow-visible lg:bg-transparent lg:dark:bg-transparent lg:p-0 lg:shadow-none',
            'lg:min-w-55 lg:max-w-65 lg:flex-none lg:translate-x-0',
            filterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <CatalogFilter
            filterState={filters}
            onChange={(next) => {
              setFilters(next);
              setVisibleCount(PAGE_SIZE);
            }}
            brandOptions={brandOptions}
            onClose={() => setFilterOpen(false)}
          />
        </div>

        <div className='min-h-96 min-w-0 flex-1'>
          {visible.length === 0 ? (
            <div className='flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-24 text-center'>
              <SearchX
                className='size-20 text-theme-primary-start'
                strokeWidth={1.5}
              />
              <p className='mt-4 text-lg font-semibold text-text-main'>
                Không tìm thấy sản phẩm
              </p>
              <p className='mt-1 text-sm text-text-sub'>
                Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
              {visible.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          )}

          {total > 0 && (
            <div className='mt-10 flex flex-col items-center gap-4'>
              <div className='w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-white/10'>
                <div
                  role='progressbar'
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className='h-1.5 rounded-full bg-theme-primary-start transition-[width] duration-500'
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className='text-sm text-text-sub'>
                Hiển thị{' '}
                <span className='font-semibold text-text-main'>
                  {Math.min(visibleCount, total)}
                </span>{' '}
                trong{' '}
                <span className='font-semibold text-text-main'>{total}</span>{' '}
                sản phẩm
              </p>
              {hasMore && (
                <button
                  type='button'
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className='rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2.5 text-sm font-medium text-text-main shadow-sm transition hover:border-gray-300 dark:hover:bg-white/10 hover:shadow-md'
                >
                  Xem thêm sản phẩm
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
