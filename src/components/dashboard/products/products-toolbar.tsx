'use client';

import {
  Search,
  SlidersHorizontal,
  Trash2,
  CheckSquare,
  Square,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'sale-desc';

interface ProductsToolbarProps {
  // Search
  search: string;
  onSearchChange: (v: string) => void;

  // Filter
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  categoryOptions: { id: string; name: string }[];

  // Sort
  sort: SortOption;
  onSortChange: (v: SortOption) => void;

  // Selection
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;

  // Pagination
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Tên A → Z' },
  { value: 'name-desc', label: 'Tên Z → A' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'sale-desc', label: '% Giảm giá cao nhất' },
];

export function ProductsToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  sort,
  onSortChange,
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  page,
  totalPages,
  onPageChange,
}: ProductsToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className='flex flex-col gap-3'>
      {/* Row 1: Search + Filter + Sort */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Search */}
        <div className='relative min-w-56 flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-sub' />
          <input
            type='text'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Tìm sản phẩm...'
            className='h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
          />
          {search && (
            <button
              type='button'
              onClick={() => onSearchChange('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main'
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className='relative'>
          <SlidersHorizontal className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-sub' />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className='h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
          >
            <option value=''>Tất cả danh mục</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className='h-9 appearance-none rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: Selection actions + count + pagination */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {/* Left: bulk actions */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={allSelected ? onClearSelection : onSelectAll}
            className='flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-text-main transition hover:bg-gray-50'
          >
            {allSelected ? (
              <CheckSquare size={15} className='text-theme-primary-start' />
            ) : (
              <Square size={15} className='text-text-sub' />
            )}
            {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>

          {hasSelection && (
            <>
              <span className='text-sm text-text-sub'>
                Đã chọn{' '}
                <span className='font-semibold text-theme-primary-start'>
                  {selectedCount}
                </span>{' '}
                / {totalCount}
              </span>
              <Button
                size='sm'
                variant='ghost'
                onClick={onClearSelection}
                className='h-8 px-2 text-text-sub hover:text-text-main'
              >
                <X size={14} className='mr-1' />
                Bỏ chọn
              </Button>
              <Button
                size='sm'
                onClick={onDeleteSelected}
                className='h-8 bg-red-500 px-3 text-white hover:bg-red-600'
              >
                <Trash2 size={14} className='mr-1.5' />
                Xóa ({selectedCount})
              </Button>
            </>
          )}
        </div>

        {/* Right: pagination */}
        {totalPages > 1 && (
          <div className='flex items-center gap-1'>
            <button
              type='button'
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className='flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-text-sub transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type='button'
                onClick={() => onPageChange(p)}
                className={`flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  p === page
                    ? 'border-theme-primary-start bg-theme-primary-start text-white'
                    : 'border-gray-200 bg-white text-text-main hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type='button'
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className='flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-text-sub transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
