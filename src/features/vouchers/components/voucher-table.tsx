'use client';

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/dashboard/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Tag, Clock, Search } from 'lucide-react';
import type {
  VoucherResponse,
  DiscountType,
  VoucherType,
} from '@/features/vouchers/types';
import { useVouchersQuery } from '@/features/vouchers/hooks/use-voucher-management';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDiscountValue(
  discountType: DiscountType,
  discountValue: number,
  maxDiscountAmount: number | null,
): string {
  if (discountType === 'PERCENTAGE') {
    const base = `${discountValue}%`;
    if (maxDiscountAmount != null) {
      return `${base} (tối đa ${formatCurrency(maxDiscountAmount)})`;
    }
    return base;
  }
  return formatCurrency(discountValue);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseBEDate(dateStr: string): Date | null {
  // Thử parse trực tiếp (ISO 8601 hoặc format BE trả về local time)
  // BE trả "2026-12-31 11:59:59 PM" — local Vietnam time, không phải UTC
  const ampmMatch = dateStr.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (ampmMatch) {
    const [, datePart, rawHour, min, sec, ampm] = ampmMatch;
    let hour = parseInt(rawHour, 10);
    if (hour < 12 && ampm.toUpperCase() === 'PM') hour += 12;
    if (hour === 12 && ampm.toUpperCase() === 'AM') hour = 0;
    // Parse như local time (không thêm Z)
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
    // Luôn hiển thị cả ngày lẫn giờ — giờ hết hạn quan trọng
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

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  try {
    const d = parseBEDate(expiresAt);
    return d ? d < new Date() : false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function VoucherTypeBadge({ type }: { type: VoucherType }) {
  return type === 'PRODUCT_DISCOUNT' ? (
    <Badge
      variant='outline'
      className='border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
    >
      🏷 Sản phẩm
    </Badge>
  ) : (
    <Badge
      variant='outline'
      className='border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300'
    >
      🎫 Đơn hàng
    </Badge>
  );
}

function DiscountTypeBadge({ type }: { type: DiscountType }) {
  return (
    <Badge
      variant='outline'
      className={
        type === 'PERCENTAGE'
          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
          : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300'
      }
    >
      {type === 'PERCENTAGE' ? '%' : '₫'}
      &nbsp;{type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
    </Badge>
  );
}

function StatusBadge({ voucher }: { voucher: VoucherResponse }) {
  const expired = isExpired(voucher.expiresAt);
  const limitReached =
    voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit;

  if (!voucher.isActive) {
    return (
      <Badge
        variant='outline'
        className='border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400'
      >
        Tắt
      </Badge>
    );
  }
  if (expired) {
    return (
      <Badge
        variant='outline'
        className='border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400'
      >
        Hết hạn
      </Badge>
    );
  }
  if (limitReached) {
    return (
      <Badge
        variant='outline'
        className='border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
      >
        Hết lượt
      </Badge>
    );
  }
  return (
    <Badge
      variant='outline'
      className='border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300'
    >
      Đang dùng
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter / Sort helpers
// ─────────────────────────────────────────────────────────────────────────────

type ActiveFilter = 'all' | 'active' | 'inactive';
type SortOption =
  | 'createdAt,desc'
  | 'createdAt,asc'
  | 'expiresAt,asc'
  | 'expiresAt,desc';

interface FilterBarProps {
  activeFilter: ActiveFilter;
  onActiveFilterChange: (v: ActiveFilter) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
}

function FilterBar({
  activeFilter,
  onActiveFilterChange,
  sort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className='flex items-center gap-2 flex-wrap'>
      {/* Trạng thái */}
      <select
        value={activeFilter}
        onChange={(e) => onActiveFilterChange(e.target.value as ActiveFilter)}
        className='h-9 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition cursor-pointer'
      >
        <option value='all'>Tất cả trạng thái</option>
        <option value='active'>Đang hoạt động</option>
        <option value='inactive'>Đã tắt</option>
      </select>

      {/* Sắp xếp */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className='h-9 rounded-md border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-3 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition cursor-pointer'
      >
        <option value='createdAt,desc'>Mới tạo nhất</option>
        <option value='createdAt,asc'>Cũ nhất</option>
        <option value='expiresAt,asc'>Hết hạn sớm nhất</option>
        <option value='expiresAt,desc'>Hết hạn muộn nhất</option>
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export interface VoucherTableMeta {
  totalElements: number;
  activeCount: number;
  expiredCount: number;
  disabledCount: number;
}

interface VoucherTableProps {
  onEdit?: (voucher: VoucherResponse) => void;
  onDelete?: (voucher: VoucherResponse) => void;
  onMetaChange?: (meta: VoucherTableMeta) => void;
}

export function VoucherTable({
  onEdit,
  onDelete,
  onMetaChange,
}: VoucherTableProps) {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [sort, setSort] = useState<SortOption>('createdAt,desc');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Build SpringFilter DSL param
  const filterParam = useMemo(() => {
    const parts: string[] = [];
    if (activeFilter === 'active') parts.push('isActive:true');
    if (activeFilter === 'inactive') parts.push('isActive:false');
    if (debouncedSearch.trim()) {
      parts.push(`code~~'*${debouncedSearch.trim()}*'`);
    }
    return parts.length ? parts.join(' and ') : undefined;
  }, [activeFilter, debouncedSearch]);

  const { data, isLoading, isError } = useVouchersQuery({
    page: page + 1,
    size,
    sort,
    filter: filterParam,
  });

  const vouchers = data?.content ?? [];
  const total = data?.meta?.totalElements ?? 0;
  const totalPages =
    data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / size));

  // Notify parent of stats whenever data changes
  const meta = useMemo<VoucherTableMeta>(() => {
    const items = data?.content ?? [];
    const now = new Date();
    return {
      totalElements: data?.meta?.totalElements ?? items.length,
      activeCount: items.filter(
        (v) => v.isActive && (!v.expiresAt || new Date(v.expiresAt) >= now),
      ).length,
      expiredCount: items.filter(
        (v) => v.isActive && v.expiresAt != null && new Date(v.expiresAt) < now,
      ).length,
      disabledCount: items.filter((v) => !v.isActive).length,
    };
  }, [data]);

  useEffect(() => {
    onMetaChange?.(meta);
  }, [meta, onMetaChange]);

  // Reset về trang 0 khi thay đổi filter/sort
  function handleActiveFilterChange(v: ActiveFilter) {
    setActiveFilter(v);
    setPage(0);
  }
  function handleSortChange(v: SortOption) {
    setSort(v);
    setPage(0);
  }

  const columns = useMemo<ColumnDef<VoucherResponse>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Mã voucher',
        cell: ({ getValue }) => (
          <div className='flex items-center gap-2'>
            <Tag size={14} className='text-theme-primary-start shrink-0' />
            <span className='font-mono font-semibold text-text-main text-sm'>
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Loại voucher',
        cell: ({ getValue }) => (
          <VoucherTypeBadge type={getValue() as VoucherType} />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'discountType',
        header: 'Kiểu giảm',
        cell: ({ getValue }) => (
          <DiscountTypeBadge type={getValue() as DiscountType} />
        ),
        enableSorting: false,
      },
      {
        id: 'discountDisplay',
        header: 'Giá trị giảm',
        accessorFn: (row) =>
          formatDiscountValue(
            row.discountType,
            row.discountValue,
            row.maxDiscountAmount,
          ),
        cell: ({ getValue }) => (
          <span className='text-sm text-text-main font-medium'>
            {getValue() as string}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'minRentalDays',
        header: 'Ngày thuê tối thiểu',
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return val != null ? (
            <span className='text-sm text-text-sub'>{val} ngày</span>
          ) : (
            <span className='text-sm italic text-text-sub opacity-40'>
              Không giới hạn
            </span>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'expiresAt',
        header: 'Hết hạn',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          const expired = isExpired(val);
          return (
            <div
              className={`flex items-center gap-1.5 text-sm ${expired ? 'text-red-500' : 'text-text-sub'}`}
            >
              <Clock size={13} className='shrink-0' />
              {formatDateString(val)}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'status',
        header: 'Trạng thái',
        accessorFn: (row) => row,
        cell: ({ getValue }) => (
          <StatusBadge voucher={getValue() as VoucherResponse} />
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className='flex items-center justify-end gap-1'>
            {onEdit && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onEdit(row.original)}
                className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400'
                title='Chỉnh sửa'
              >
                <Pencil size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onDelete(row.original)}
                className='h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400'
                title='Xóa'
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={vouchers}
      isLoading={isLoading}
      isError={isError}
      errorMessage='Không thể tải danh sách voucher. Vui lòng thử lại sau.'
      emptyMessage='Chưa có voucher nào'
      totalLabel='voucher'
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
            placeholder='Tìm mã voucher...'
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
      manualPagination
      pageIndex={page}
      pageCount={totalPages}
      onPageChange={setPage}
      pageSize={size}
      totalRows={total}
    />
  );
}
