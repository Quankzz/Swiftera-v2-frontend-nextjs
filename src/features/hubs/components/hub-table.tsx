'use client';

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MapPin, Phone, Eye, Search } from 'lucide-react';
import type { HubResponse } from '@/features/hubs/types';
import { useHubsQuery } from '@/features/hubs/hooks/use-hub-management';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse BE date string "YYYY-MM-DD HH:MM:SS AM/PM" hoặc ISO → Date | null */
function parseBEDate(dateStr: string): Date | null {
  const ampmMatch = dateStr.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (ampmMatch) {
    const [, datePart, rawHour, min, sec, ampm] = ampmMatch;
    let hour = parseInt(rawHour, 10);
    if (hour < 12 && ampm.toUpperCase() === 'PM') hour += 12;
    if (hour === 12 && ampm.toUpperCase() === 'AM') hour = 0;
    const d = new Date(
      `${datePart}T${String(hour).padStart(2, '0')}:${min}:${sec}`,
    );
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateString(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = parseBEDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

/** Tổng hợp địa chỉ từ các field riêng lẻ */
function formatAddress(hub: HubResponse): string {
  const parts = [hub.addressLine, hub.ward, hub.district, hub.city].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(', ') : '—';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant='outline'
      className={
        isActive
          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300'
          : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400'
      }
    >
      {isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterBar
// ─────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  activeFilter: 'all' | 'active' | 'inactive';
  onActiveFilterChange: (v: 'all' | 'active' | 'inactive') => void;
  sort: string;
  onSortChange: (v: string) => void;
}

function FilterBar({
  activeFilter,
  onActiveFilterChange,
  sort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <select
        value={activeFilter}
        onChange={(e) =>
          onActiveFilterChange(e.target.value as 'all' | 'active' | 'inactive')
        }
        className='h-9 rounded-md border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30'
      >
        <option value='all'>Tất cả trạng thái</option>
        <option value='active'>Đang hoạt động</option>
        <option value='inactive'>Ngừng hoạt động</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className='h-9 rounded-md border border-gray-200 dark:border-white/12 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/30'
      >
        <option value=''>Mặc định</option>
        <option value='name,asc'>Tên A → Z</option>
        <option value='name,desc'>Tên Z → A</option>
        <option value='code,asc'>Mã A → Z</option>
        <option value='createdAt,desc'>Mới nhất</option>
        <option value='createdAt,asc'>Cũ nhất</option>
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta type (dùng để truyền stats lên parent)
// ─────────────────────────────────────────────────────────────────────────────

export interface HubTableMeta {
  totalElements: number;
  activeCount: number;
  inactiveCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface HubTableProps {
  onEdit: (hub: HubResponse) => void;
  onDelete: (hub: HubResponse) => void;
  onView?: (hub: HubResponse) => void;
  onMetaChange?: (meta: HubTableMeta) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HubTable({
  onEdit,
  onDelete,
  onView,
  onMetaChange,
}: HubTableProps) {
  const [page, setPage] = useState(0); // 0-based for DataTable UI; send page+1 to API
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const pageSize = 10;

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Build filter param theo SpringFilter DSL
  const filterParam = useMemo(() => {
    const parts: string[] = [];
    if (activeFilter === 'active') parts.push('isActive:true');
    if (activeFilter === 'inactive') parts.push('isActive:false');
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim();
      parts.push(`(name~~'*${term}*' or code~~'*${term}*')`);
    }
    return parts.length ? parts.join(' and ') : undefined;
  }, [activeFilter, debouncedSearch]);

  // Build sort param
  const sortParam = sort || undefined;

  const { data, isLoading, isError, error } = useHubsQuery({
    page: page + 1, // DataTable is 0-based; BE expects 1-based
    size: pageSize,
    filter: filterParam,
    sort: sortParam,
  });

  const hubs = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalElements = data?.meta?.totalElements ?? 0;

  // Tính stats từ dữ liệu trang hiện tại → thông báo lên parent
  useEffect(() => {
    if (!data) return;
    const activeCount = hubs.filter((h) => h.isActive).length;
    const inactiveCount = hubs.filter((h) => !h.isActive).length;
    onMetaChange?.({ totalElements, activeCount, inactiveCount });
  }, [data, hubs, totalElements, onMetaChange]);

  // Reset về trang 0 khi filter hoặc sort thay đổi
  function handleActiveFilterChange(v: 'all' | 'active' | 'inactive') {
    setActiveFilter(v);
    setPage(0);
  }

  function handleSortChange(v: string) {
    setSort(v);
    setPage(0);
  }

  // ─── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<HubResponse>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Mã hub',
        cell: ({ row }) => (
          <span className='font-mono text-xs font-semibold text-theme-primary-start bg-theme-primary-start/8 px-2 py-0.5 rounded'>
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Tên hub',
        cell: ({ row }) => (
          <span className='font-medium text-text-main'>
            {row.original.name}
          </span>
        ),
      },
      {
        id: 'address',
        header: 'Địa chỉ',
        cell: ({ row }) => {
          const addr = formatAddress(row.original);
          return (
            <div className='flex items-start gap-1.5 max-w-xs'>
              {addr !== '—' && (
                <MapPin className='mt-0.5 size-3.5 shrink-0 text-text-sub' />
              )}
              <span className='text-sm text-text-sub truncate' title={addr}>
                {addr}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'city',
        header: 'Thành phố',
        cell: ({ row }) => (
          <span className='text-sm text-text-main'>
            {row.original.city ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Số điện thoại',
        cell: ({ row }) => (
          <div className='flex items-center gap-1.5'>
            {row.original.phone && <Phone className='size-3.5 text-text-sub' />}
            <span className='text-sm text-text-main'>
              {row.original.phone ?? '—'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => (
          <span className='text-xs text-text-sub'>
            {formatDateString(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className='flex items-center justify-end gap-1'>
            {onView && (
              <Button
                variant='ghost'
                size='icon'
                className='size-8 text-text-sub hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                onClick={() => onView(row.original)}
                title='Xem chi tiết'
              >
                <Eye size={14} />
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-text-sub hover:text-theme-primary-start hover:bg-theme-primary-start/8'
              onClick={() => onEdit(row.original)}
              title='Chỉnh sửa'
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-text-sub hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
              onClick={() => onDelete(row.original)}
              title='Xóa'
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onView],
  );

  const errorMessage =
    isError && error instanceof Error ? error.message : undefined;

  return (
    <DataTable
      columns={columns}
      data={hubs}
      totalLabel='hub'
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      emptyMessage='Không có hub nào'
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={setPage}
      pageSize={pageSize}
      totalRows={totalElements}
      toolbarLeft={
        <div className='relative'>
          <Search
            size={14}
            className='absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none'
          />
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Tìm tên, mã hub...'
            className='h-9 w-48 rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card pl-8 pr-3 text-sm text-text-main placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 focus:border-theme-primary-start transition'
          />
        </div>
      }
      toolbarRight={
        <FilterBar
          activeFilter={activeFilter}
          onActiveFilterChange={handleActiveFilterChange}
          sort={sort}
          onSortChange={handleSortChange}
        />
      }
    />
  );
}
