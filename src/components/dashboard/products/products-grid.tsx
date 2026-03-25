'use client';

import { useMemo, useState, useCallback } from 'react';
import { categories } from '@/data/categories';
import { products as allProducts } from '@/data/products';
import type { Product } from '@/types/catalog';
import { ProductCardDashboard } from './product-card-dashboard';
import { ProductsToolbar, type SortOption } from './products-toolbar';

const PAGE_SIZE = 12;

// Top-level categories only (parentId === null) for filter options
const categoryOptions = categories
  .filter((c) => c.parentId === null)
  .map((c) => ({ id: c.categoryId, name: c.name }));

function getSalePercent(daily: number, oldDaily: number) {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

function applySort(list: Product[], sort: SortOption): Product[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'vi');
      case 'name-desc':
        return b.name.localeCompare(a.name, 'vi');
      case 'price-asc':
        return a.dailyPrice - b.dailyPrice;
      case 'price-desc':
        return b.dailyPrice - a.dailyPrice;
      case 'sale-desc': {
        const aSale = a.oldDailyPrice
          ? getSalePercent(a.dailyPrice, a.oldDailyPrice)
          : 0;
        const bSale = b.oldDailyPrice
          ? getSalePercent(b.dailyPrice, b.oldDailyPrice)
          : 0;
        return bSale - aSale;
      }
    }
  });
}

interface ProductsGridProps {
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
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
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Derived: filtered + sorted list
  const filtered = useMemo(() => {
    let list = allProducts;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (categoryFilter) {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    return applySort(list, sort);
  }, [search, categoryFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset page when filter changes
  const safeSetSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
    setSelectedIds(new Set());
  }, []);
  const safeSetCategory = useCallback((v: string) => {
    setCategoryFilter(v);
    setPage(1);
    setSelectedIds(new Set());
  }, []);
  const safeSetSort = useCallback((v: SortOption) => {
    setSort(v);
    setPage(1);
  }, []);

  // Current page slice
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected =
    paginated.length > 0 &&
    paginated.every((p) => selectedIds.has(p.productId));

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginated.forEach((p) => next.add(p.productId));
      return next;
    });
  }, [paginated]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    onDeleteMany?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, onDeleteMany]);

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
        totalCount={filtered.length}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Results count */}
      <p className='text-sm text-text-sub'>
        Hiển thị{' '}
        <span className='font-semibold text-text-main'>{paginated.length}</span>{' '}
        /{' '}
        <span className='font-semibold text-text-main'>{filtered.length}</span>{' '}
        sản phẩm
      </p>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {paginated.map((product) => (
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
    </div>
  );
}
