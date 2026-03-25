'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────
export interface FilterState {
  categories: string[]; // categoryId[]
  brands: string[]; // brand name[]
  priceMin: string; // '' = không giới hạn
  priceMax: string;
}

export const EMPTY_FILTER: FilterState = {
  categories: [],
  brands: [],
  priceMin: '',
  priceMax: '',
};

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface CatalogFilterProps {
  filterState: FilterState;
  onChange: (next: FilterState) => void;
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  /** Callback đóng panel (mobile) */
  onClose?: () => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function formatVND(val: string) {
  const n = parseInt(val.replace(/\D/g, ''), 10);
  return isNaN(n) ? '' : n.toLocaleString('vi-VN');
}

function parseVND(val: string) {
  return val.replace(/\D/g, '');
}

// ─── Section wrapper ─────────────────────────────────────────────
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='border-b border-gray-100 dark:border-white/8 py-4 last:border-0'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='flex w-full items-center justify-between text-base font-semibold text-text-main'
      >
        {title}
        <ChevronDown
          className={cn(
            'size-5 text-text-sub transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && <div className='mt-4'>{children}</div>}
    </div>
  );
}

// ─── Checkbox list ────────────────────────────────────────────────
function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: FilterOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 6);

  return (
    <div className='flex flex-col gap-3'>
      {visible.map((opt) => (
        <label key={opt.id} className='flex cursor-pointer items-center gap-3'>
          <input
            type='checkbox'
            checked={selected.includes(opt.id)}
            onChange={() => onToggle(opt.id)}
            className='size-5 rounded-sm border-gray-300 dark:border-white/20 accent-theme-primary-start'
          />
          <span className='flex-1 text-sm text-text-main'>{opt.label}</span>
          {opt.count !== undefined && (
            <span className='text-xs text-text-sub'>{opt.count}</span>
          )}
        </label>
      ))}
      {options.length > 6 && (
        <button
          type='button'
          onClick={() => setShowAll((v) => !v)}
          className='mt-1 text-left text-sm font-medium text-theme-primary-start hover:underline'
        >
          {showAll ? 'Thu gọn' : `+${options.length - 6} thêm`}
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export function CatalogFilter({
  filterState,
  onChange,
  categoryOptions,
  brandOptions,
  onClose,
  className,
}: CatalogFilterProps) {
  const hasActive =
    filterState.categories.length > 0 ||
    filterState.brands.length > 0 ||
    filterState.priceMin !== '' ||
    filterState.priceMax !== '';

  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filterState, ...patch });

  return (
    <aside className={cn('flex flex-col', className)}>
      {/* Header */}
      {/* <div className='mb-3 flex items-center justify-between'>
        <span className='text-base font-bold text-text-main'>Bộ lọc</span>
        <div className='flex items-center gap-2'>
          {hasActive && (
            <button
              type='button'
              onClick={() => onChange(EMPTY_FILTER)}
              className='text-sm font-medium text-theme-primary-start hover:underline'
            >
              Xoá tất cả
            </button>
          )}
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='rounded-sm p-1 text-text-sub transition hover:bg-gray-100 lg:hidden'
            >
              <X className='size-5' />
            </button>
          )}
        </div>
      </div> */}

      {/* Active filter chips */}
      {/* {hasActive && (
        <div className='mb-4 flex flex-wrap gap-2'>
          {filterState.categories.map((id) => {
            const opt = categoryOptions.find((c) => c.id === id);
            return (
              <span
                key={id}
                className='flex items-center gap-1.5 rounded-full bg-theme-primary-start/10 px-3 py-1.5 text-sm font-medium text-theme-primary-start'
              >
                {opt?.label ?? id}
                <button
                  onClick={() =>
                    set({ categories: toggle(filterState.categories, id) })
                  }
                >
                  <X className='size-3.5' />
                </button>
              </span>
            );
          })}
          {filterState.brands.map((b) => (
            <span
              key={b}
              className='flex items-center gap-1.5 rounded-full bg-theme-primary-start/10 px-3 py-1.5 text-sm font-medium text-theme-primary-start'
            >
              {b}
              <button
                onClick={() => set({ brands: toggle(filterState.brands, b) })}
              >
                <X className='size-3.5' />
              </button>
            </span>
          ))}
        </div>
      )} */}

      {/* Filter body */}
      <div className='rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-[#1a1a1f] px-4'>
        {/* Danh mục */}
        <FilterSection title='Danh mục'>
          <CheckList
            options={categoryOptions}
            selected={filterState.categories}
            onToggle={(id) =>
              set({ categories: toggle(filterState.categories, id) })
            }
          />
        </FilterSection>

        {/* Thương hiệu */}
        <FilterSection title='Thương hiệu'>
          <CheckList
            options={brandOptions}
            selected={filterState.brands}
            onToggle={(b) => set({ brands: toggle(filterState.brands, b) })}
          />
        </FilterSection>

        {/* Giá */}
        <FilterSection title='Giá thuê / ngày'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <input
                  type='text'
                  value={formatVND(filterState.priceMin)}
                  onChange={(e) => set({ priceMin: parseVND(e.target.value) })}
                  placeholder='Từ'
                  className='h-11 w-full rounded-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-3 pr-8 text-sm text-text-main placeholder:text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
                />
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-main'>
                  ₫
                </span>
              </div>
              <span className='shrink-0 text-sm text-text-sub'>—</span>
              <div className='relative flex-1'>
                <input
                  type='text'
                  value={formatVND(filterState.priceMax)}
                  onChange={(e) => set({ priceMax: parseVND(e.target.value) })}
                  placeholder='Đến'
                  className='h-11 w-full rounded-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-3 pr-8 text-sm text-text-main placeholder:text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
                />
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-main'>
                  ₫
                </span>
              </div>
            </div>

            {/* Quick price presets */}
            <div className='grid grid-cols-2 gap-2'>
              {[
                { label: 'Dưới 100K', min: '', max: '100000' },
                { label: '100K–300K', min: '100000', max: '300000' },
                { label: '300K–500K', min: '300000', max: '500000' },
                { label: 'Trên 500K', min: '500000', max: '' },
              ].map((p) => {
                const active =
                  filterState.priceMin === p.min &&
                  filterState.priceMax === p.max;
                return (
                  <button
                    key={p.label}
                    type='button'
                    onClick={() =>
                      set(
                        active
                          ? { priceMin: '', priceMax: '' }
                          : { priceMin: p.min, priceMax: p.max },
                      )
                    }
                    className={cn(
                      'rounded-sm border px-2 py-2 text-sm font-medium transition',
                      active
                        ? 'border-theme-primary-start bg-theme-primary-start/10 text-theme-primary-start'
                        : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-text-sub dark:text-text-main hover:border-gray-300 dark:hover:bg-white/10',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
