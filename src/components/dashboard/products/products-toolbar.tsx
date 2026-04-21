'use client';

import { Search, Trash2, CheckSquare, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryTreeSelect } from '@/components/dashboard/categories/category-tree-select';

export type SortOption =
  | 'newest'
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
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
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
  sort,
  onSortChange,
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
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
            className='h-9 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-9 pr-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
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

        {/* Category filter - tree dialog */}
        <CategoryTreeSelect
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          placeholder='Tất cả danh mục'
          allowRoot
          rootLabel='Tất cả danh mục'
          className='h-9 min-w-48 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main'
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className='h-9 appearance-none rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: Selection actions */}
      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='button'
          onClick={allSelected ? onClearSelection : onSelectAll}
          className='flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 py-1.5 text-sm text-text-main transition hover:bg-gray-50 dark:hover:bg-white/8'
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
    </div>
  );
}
