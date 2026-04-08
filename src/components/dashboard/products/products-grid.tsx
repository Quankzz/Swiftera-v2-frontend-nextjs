'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ProductResponse } from '@/features/products/types';
import { useProductsQuery } from '@/features/products/hooks/use-product-management';
import { useCategoriesQuery } from '@/features/categories/hooks/use-category-management';
import { ProductCardDashboard } from './product-card-dashboard';
import { ProductsToolbar, type SortOption } from './products-toolbar';

const PAGE_SIZE = 12;

// Map FE sort option → BE sort param
function toBESort(sort: SortOption): string {
  switch (sort) {
    case 'name-asc':
      return 'name,asc';
    case 'name-desc':
      return 'name,desc';
    case 'price-asc':
      return 'dailyPrice,asc';
    case 'price-desc':
      return 'dailyPrice,desc';
    case 'sale-desc':
      return 'oldDailyPrice,desc';
  }
}

// Build RSQL filter string
function toFilter(search: string, categoryId: string): string | undefined {
  const parts: string[] = [];
  if (search.trim()) parts.push(`name=="${search.trim()}*"`);
  if (categoryId) parts.push(`categoryId=="${categoryId}"`);
  return parts.length > 0 ? parts.join(';') : undefined;
}

interface ProductsGridProps {
  onView?: (product: ProductResponse) => void;
  onEdit?: (product: ProductResponse) => void;
  onDelete?: (product: ProductResponse) => void;
  onDeleteMany?: (ids: string[]) => void;
}

export function ProductsGrid({
  onView,
  onEdit,
  onDelete,
  onDeleteMany,
}: ProductsGridProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState<SortOption>('name-asc');
  // BE uses 0-based page index
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Fetch categories for filter dropdown ──
  const { data: categoriesData } = useCategoriesQuery({
    page: 1,
    size: 100,
  });
  const categoryOptions = (categoriesData?.content ?? []).map((c) => ({
    id: c.categoryId,
    name: c.name,
  }));

  // ── Fetch products from BE ──
  const { data, isLoading, isError } = useProductsQuery({
    page,
    size: PAGE_SIZE,
    sort: toBESort(sort),
    filter: toFilter(search, categoryFilter),
  });

  const products = useMemo(() => data?.content ?? [], [data?.content]);
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalElements = meta?.totalElements ?? 0;

  // ── Toolbar handlers (reset page + selection on filter change) ──
  const safeSetSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(0);
    setSelectedIds(new Set());
  }, []);
  const safeSetCategory = useCallback((v: string) => {
    setCategoryFilter(v);
    setPage(0);
    setSelectedIds(new Set());
  }, []);
  const safeSetSort = useCallback((v: SortOption) => {
    setSort(v);
    setPage(0);
  }, []);

  // ── Selection helpers ──
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.productId));

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      products.forEach((p) => next.add(p.productId));
      return next;
    });
  }, [products]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    onDeleteMany?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, onDeleteMany]);

  // ── Toolbar uses 1-based page display ──
  const displayPage = page + 1;
  const handlePageChange = useCallback((p: number) => setPage(p - 1), []);

  return (
    <div className='flex flex-col gap-6'>
      {/* Toolbar */}
      <ProductsToolbar
        search={search}
        onSearchChange={safeSetSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={safeSetCategory}
        categoryOptions={categoryOptions}
        sort={sort}
        onSortChange={safeSetSort}
        selectedCount={selectedIds.size}
        totalCount={totalElements}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        page={displayPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Results count */}
      <p className='text-sm text-text-sub'>
        Hiển thị{' '}
        <span className='font-semibold text-text-main'>{products.length}</span>{' '}
        / <span className='font-semibold text-text-main'>{totalElements}</span>{' '}
        sản phẩm
      </p>

      {/* Loading skeleton */}
      {isLoading && (
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className='h-96 rounded-2xl border border-gray-100 dark:border-white/8 bg-gray-100 dark:bg-white/5 animate-pulse'
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10 py-24 text-center'>
          <p className='text-base font-medium text-red-600 dark:text-red-400'>
            Không thể tải danh sách sản phẩm
          </p>
          <p className='mt-1 text-sm text-text-sub'>
            Vui lòng kiểm tra kết nối và thử lại
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && (
        <>
          {products.length > 0 ? (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {products.map((product) => (
                <ProductCardDashboard
                  key={product.productId}
                  product={product}
                  selected={selectedIds.has(product.productId)}
                  onSelect={toggleSelect}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card py-24 text-center'>
              <p className='text-base font-medium text-text-main'>
                Không tìm thấy sản phẩm
              </p>
              <p className='mt-1 text-sm text-text-sub'>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
