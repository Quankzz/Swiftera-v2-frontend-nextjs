'use client';

/**
 * HubPickerDialog - modal chọn hub với search / filter / sort.
 *
 * Props:
 *   selectedHubId  - hub đang chọn (để highlight)
 *   onSelect       - callback({ hubId, hubName }) khi người dùng chọn
 *   onClose        - đóng dialog
 *   open           - hiển thị/ẩn
 */

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  Warehouse,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHubsQuery } from '@/features/hubs/hooks/use-hub-management';
import type { HubResponse } from '@/features/hubs/types';

interface HubPickerDialogProps {
  open: boolean;
  onClose: () => void;
  selectedHubId?: string;
  onSelect: (hub: { hubId: string; hubName: string }) => void;
}

type SortOption = 'name_asc' | 'name_desc' | 'city_asc' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Tên A → Z',
  name_desc: 'Tên Z → A',
  city_asc: 'Thành phố A → Z',
  newest: 'Mới nhất',
};

function HubCard({
  hub,
  selected,
  onSelect,
}: {
  hub: HubResponse;
  selected: boolean;
  onSelect: () => void;
}) {
  const address = [hub.addressLine, hub.ward, hub.district, hub.city]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'group w-full rounded-xl border-2 p-4 text-left transition-all duration-150',
        selected
          ? 'border-theme-primary-start bg-theme-primary-start/5 dark:bg-theme-primary-start/10'
          : hub.isActive
            ? 'border-gray-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-theme-primary-start/60 hover:bg-gray-50 dark:hover:bg-white/5'
            : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/2 opacity-60 cursor-not-allowed',
      )}
      disabled={!hub.isActive}
      title={!hub.isActive ? 'Hub này đang tạm ngưng hoạt động' : undefined}
    >
      <div className='flex items-start gap-3'>
        {/* Icon */}
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition',
            selected
              ? 'bg-theme-primary-start/15 text-theme-primary-start'
              : 'bg-gray-100 dark:bg-white/8 text-text-sub group-hover:bg-theme-primary-start/10 group-hover:text-theme-primary-start',
          )}
        >
          <Warehouse size={16} />
        </div>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-sm font-semibold text-text-main truncate'>
              {hub.name}
            </span>
            <span className='shrink-0 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-[10px] font-mono font-medium text-text-sub'>
              {hub.code}
            </span>
            {!hub.isActive && (
              <span className='shrink-0 rounded-full bg-gray-200 dark:bg-white/8 px-2 py-0.5 text-[10px] text-gray-500'>
                Tạm ngưng
              </span>
            )}
          </div>

          {address && (
            <p className='mt-1 flex items-start gap-1 text-xs text-text-sub'>
              <MapPin size={10} className='mt-0.5 shrink-0' />
              <span className='truncate'>{address}</span>
            </p>
          )}

          {hub.phone && (
            <p className='mt-0.5 flex items-center gap-1 text-xs text-text-sub'>
              <Phone size={10} className='shrink-0' />
              {hub.phone}
            </p>
          )}
        </div>

        {/* Selected indicator */}
        {selected && (
          <CheckCircle2
            size={18}
            className='shrink-0 text-theme-primary-start'
          />
        )}
      </div>
    </button>
  );
}

export function HubPickerDialog({
  open,
  onClose,
  selectedHubId,
  onSelect,
}: HubPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [sort, setSort] = useState<SortOption>('name_asc');
  const [showFilters, setShowFilters] = useState(false);

  // Reset state when dialog opens - use a key on the outer component instead.
  // Since parent passes key={open ? 1 : 0} or mounts/unmounts, state resets.
  // Here: reset via separate inner component rendered only when open=true.

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Fetch all hubs (large page - danh sách hub không quá nhiều)
  const { data, isLoading, isError } = useHubsQuery({ page: 1, size: 200 });
  const allHubs = useMemo(() => data?.content ?? [], [data]);

  // Unique cities for filter dropdown
  const cities = useMemo(
    () =>
      Array.from(
        new Set(allHubs.map((h) => h.city).filter(Boolean) as string[]),
      ).sort(),
    [allHubs],
  );

  // Filter + sort
  const filtered = useMemo(() => {
    let list = allHubs;

    if (activeOnly) list = list.filter((h) => h.isActive);
    if (cityFilter) list = list.filter((h) => h.city === cityFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.code.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.addressLine?.toLowerCase().includes(q),
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name, 'vi');
      if (sort === 'name_desc') return b.name.localeCompare(a.name, 'vi');
      if (sort === 'city_asc')
        return (a.city ?? '').localeCompare(b.city ?? '', 'vi');
      // newest: sort by createdAt desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [allHubs, search, cityFilter, activeOnly, sort]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Dialog */}
      <div className='relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-card shadow-2xl dark:shadow-black/60 max-h-[85vh]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-5 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-theme-primary-start/10'>
              <Warehouse size={16} className='text-theme-primary-start' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-text-main'>
                Chọn Hub lưu trữ
              </h3>
              <p className='text-xs text-text-sub'>
                {isLoading
                  ? 'Đang tải...'
                  : `${filtered.length} hub${activeOnly ? ' đang hoạt động' : ''}`}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main transition'
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + Filter bar */}
        <div className='border-b border-gray-100 dark:border-white/8 px-5 py-3 flex flex-col gap-2'>
          {/* Search */}
          <div className='relative'>
            <Search
              size={14}
              className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-sub'
            />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Tìm theo tên, mã hub, thành phố...'
              autoFocus
              className='h-9 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/5 pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20'
            />
          </div>

          {/* Filter toggle */}
          <button
            type='button'
            onClick={() => setShowFilters((v) => !v)}
            className='flex items-center gap-1.5 self-start text-xs text-text-sub hover:text-text-main transition'
          >
            <SlidersHorizontal size={12} />
            Bộ lọc & Sắp xếp
            <ChevronDown
              size={11}
              className={cn(
                'transition-transform',
                showFilters && 'rotate-180',
              )}
            />
          </button>

          {/* Filters */}
          {showFilters && (
            <div className='flex flex-wrap items-center gap-3 pt-1'>
              {/* Active only toggle */}
              <label className='flex cursor-pointer items-center gap-2 text-xs text-text-sub'>
                <input
                  type='checkbox'
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className='h-3.5 w-3.5 rounded border-gray-300 accent-theme-primary-start'
                />
                Chỉ hiện hub đang hoạt động
              </label>

              {/* City filter */}
              {cities.length > 0 && (
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className='h-7 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-2 text-xs text-text-main focus:border-theme-primary-start focus:outline-none'
                >
                  <option value=''>Tất cả thành phố</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className='h-7 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-2 text-xs text-text-main focus:border-theme-primary-start focus:outline-none'
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Hub list */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          {isLoading && (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5'
                />
              ))}
            </div>
          )}

          {isError && (
            <p className='py-8 text-center text-sm text-red-500'>
              Không thể tải danh sách hub. Vui lòng thử lại.
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className='flex flex-col items-center gap-2 py-12 text-text-sub'>
              <Warehouse size={32} className='opacity-20' />
              <p className='text-sm'>Không tìm thấy hub nào phù hợp.</p>
              {(search || cityFilter) && (
                <button
                  type='button'
                  onClick={() => {
                    setSearch('');
                    setCityFilter('');
                  }}
                  className='text-xs text-theme-primary-start hover:underline'
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {filtered.map((hub) => (
                <HubCard
                  key={hub.hubId}
                  hub={hub}
                  selected={hub.hubId === selectedHubId}
                  onSelect={() => {
                    onSelect({ hubId: hub.hubId, hubName: hub.name });
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-gray-100 dark:border-white/8 px-5 py-3'>
          <p className='text-xs text-text-sub'>
            {selectedHubId
              ? `Đang chọn: ${allHubs.find((h) => h.hubId === selectedHubId)?.name ?? selectedHubId}`
              : 'Chưa chọn hub nào'}
          </p>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-gray-200 dark:border-white/8 px-4 py-1.5 text-sm text-text-main transition hover:bg-gray-50 dark:hover:bg-white/8'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
