'use client';

import { ChevronRight, Home, SlidersHorizontal } from 'lucide-react';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'price-asc', label: 'Giá: thấp đến cao' },
  { value: 'price-desc', label: 'Giá: cao đến thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

interface CatalogHeaderProps {
  /** 'category' = duyệt theo danh mục | 'search' = kết quả tìm kiếm */
  variant: 'category' | 'search';
  /** Tên danh mục hoặc từ khoá tìm kiếm */
  title: string;
  /** Breadcrumb phụ — ví dụ: ['Phones & Tablets', 'Smartphones'] */
  breadcrumbs?: string[];
  /** Tổng số sản phẩm */
  count: number;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  /** Callback mở/đóng filter panel trên mobile */
  onToggleFilter?: () => void;
}

export function CatalogHeader({
  variant,
  title,
  breadcrumbs = [],
  count,
  sort,
  onSortChange,
  onToggleFilter,
}: CatalogHeaderProps) {
  return (
    <div className='flex flex-col gap-3'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1.5 text-xs text-text-sub'>
        <Home className='size-3.5 shrink-0' />
        <ChevronRight className='size-3 shrink-0' />
        <span>{variant === 'search' ? 'Tìm kiếm' : 'Danh mục'}</span>
        {breadcrumbs.map((crumb) => (
          <span key={crumb} className='flex items-center gap-1.5'>
            <ChevronRight className='size-3 shrink-0' />
            <span>{crumb}</span>
          </span>
        ))}
      </nav>

      {/* Title row */}
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          {variant === 'search' ? (
            <p className='text-sm text-text-sub'>Kết quả tìm kiếm cho</p>
          ) : null}
          <h1 className='text-2xl font-extrabold leading-tight text-text-main lg:text-3xl'>
            {title}
          </h1>
          <p className='mt-1 text-sm text-text-sub'>
            <span className='font-semibold text-theme-primary-start'>
              {count.toLocaleString('vi-VN')}
            </span>{' '}
            sản phẩm
          </p>
        </div>

        {/* Controls row */}
        <div className='flex items-center gap-2'>
          {/* Mobile filter button */}
          <button
            type='button'
            onClick={onToggleFilter}
            className='flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50 lg:hidden'
          >
            <SlidersHorizontal className='size-4' />
            Lọc
          </button>

          {/* Sort */}
          <div className='flex items-center gap-2'>
            <span className='hidden text-sm text-text-sub sm:block'>
              Sắp xếp:
            </span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className='h-9 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className='h-px bg-gray-100' />
    </div>
  );
}
