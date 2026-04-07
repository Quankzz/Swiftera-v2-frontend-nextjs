'use client';

import { useState, useDeferredValue, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMyOrdersQuery } from '@/hooks/api/use-rental-orders';
import {
  RENTAL_ORDER_STATUS_LABELS,
  RENTAL_ORDER_STATUS_COLORS,
} from '@/api/rentalOrderApi';
import type { RentalOrderStatus } from '@/api/rentalOrderApi';

const PAGE_SIZE = 20;
const MAX_VISIBLE_PAGES = 5;

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'placedAt,desc' },
  { label: 'Cũ nhất', value: 'placedAt,asc' },
  { label: 'Giá cao → thấp', value: 'totalPayableAmount,desc' },
  { label: 'Giá thấp → cao', value: 'totalPayableAmount,asc' },
];

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ thanh toán', value: 'PENDING_PAYMENT' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Đang chuẩn bị', value: 'PREPARING' },
  { label: 'Đang giao', value: 'DELIVERING' },
  { label: 'Đã giao', value: 'DELIVERED' },
  { label: 'Đang thuê', value: 'IN_USE' },
  { label: 'Chờ thu hồi', value: 'PENDING_PICKUP' },
  { label: 'Đang thu hồi', value: 'PICKING_UP' },
  { label: 'Đã thu hồi', value: 'PICKED_UP' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const fmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function OrderRowSkeleton() {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5'>
      <div className='flex min-w-0 items-start gap-3'>
        <Skeleton className='size-11 shrink-0 rounded-xl' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-36' />
          <Skeleton className='h-3 w-48' />
          <Skeleton className='h-3 w-24' />
        </div>
      </div>
      <Skeleton className='h-5 w-24' />
    </div>
  );
}

function StatusFilterBar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (v: string) => void;
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.value || 'all'}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            activeFilter === f.value
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  let visiblePages: (number | '...')[] = [];
  if (totalPages <= MAX_VISIBLE_PAGES) {
    visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    const start = Math.max(
      2,
      Math.min(page - half, totalPages - MAX_VISIBLE_PAGES + 1),
    );
    const end = Math.min(totalPages - 1, page + half);
    visiblePages = [1];
    if (start > 2) visiblePages.push('...');
    for (let i = start; i <= end; i++) visiblePages.push(i);
    if (end < totalPages - 1) visiblePages.push('...');
    visiblePages.push(totalPages);
  }

  return (
    <div className='mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
      <p className='text-sm text-muted-foreground'>
        Hiển thị {(page - 1) * PAGE_SIZE + 1}–
        {Math.min(page * PAGE_SIZE, totalItems)} trong{' '}
        <span className='font-medium text-foreground'>{totalItems}</span> đơn
        thuê
      </p>
      <div className='flex items-center gap-1'>
        <Button
          variant='outline'
          size='sm'
          className='h-9 w-9 p-0'
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className='size-4' />
        </Button>

        {visiblePages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className='flex h-9 w-9 items-center justify-center text-muted-foreground'
              >
                …
              </span>
            );
          }
          const isActive = p === page;
          return (
            <Button
              key={p}
              variant={isActive ? 'default' : 'outline'}
              size='sm'
              className={cn(
                'h-9 w-9 p-0',
                isActive ? 'bg-rose-600 hover:bg-rose-700 text-white' : '',
              )}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          );
        })}

        <Button
          variant='outline'
          size='sm'
          className='h-9 w-9 p-0'
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}

export default function RentalOrdersPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const deferredSearch = useDeferredValue(search);

  // Reset page when filter/sort/search changes
  useEffect(() => {
    setPage(1);
  }, [sort, statusFilter, deferredSearch]);

  const filterQuery = statusFilter ? `status:'${statusFilter}'` : undefined;

  const { data, isLoading, isError } = useMyOrdersQuery({
    page,
    size: PAGE_SIZE,
    sort,
    filter: filterQuery,
  });

  const orders = data?.items ?? [];

  // Client-side search filter (ID contains)
  const filteredOrders = deferredSearch
    ? orders.filter((o) =>
        o.rentalOrderId.toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : orders;

  const hasActiveFilters = statusFilter !== '' || deferredSearch !== '';

  return (
    <div className='min-h-screen bg-white dark:bg-surface-base px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>
          Đơn thuê của tôi
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Theo dõi tất cả đơn thuê thiết bị của bạn.
        </p>

        {/* ── Controls bar ── */}
        <div className='mt-6 space-y-3'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              placeholder='Tìm theo mã đơn thuê...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='flex h-10 w-full rounded-xl border border-border/60 bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:bg-card/80'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='size-4' />
              </button>
            )}
          </div>

          {/* Filter + Sort row */}
          <div className='flex flex-wrap items-center justify-between gap-2'>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                showFilters || hasActiveFilters
                  ? 'bg-rose-600 text-white'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <SlidersHorizontal className='size-4' />
              Lọc
              {hasActiveFilters && (
                <span className='ml-1 flex size-5 items-center justify-center rounded-full bg-white/20 text-xs'>
                  {statusFilter ? 1 : 0}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className='flex items-center gap-2'>
              <ArrowUpDown className='size-4 text-muted-foreground' />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-200 dark:bg-card/80'
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status filter chips */}
          {showFilters && (
            <StatusFilterBar
              activeFilter={statusFilter}
              onFilterChange={(v) => setStatusFilter(v)}
            />
          )}

          {/* Active filter tags */}
          {hasActiveFilters && !showFilters && (
            <div className='flex flex-wrap items-center gap-2'>
              {statusFilter && (
                <span className='inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'>
                  {
                    RENTAL_ORDER_STATUS_LABELS[
                      statusFilter as RentalOrderStatus
                    ]
                  }
                  <button
                    onClick={() => setStatusFilter('')}
                    className='ml-1 hover:text-rose-900'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              )}
              {deferredSearch && (
                <span className='inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground'>
                  &quot;{deferredSearch}&quot;
                  <button
                    onClick={() => setSearch('')}
                    className='ml-1 text-muted-foreground hover:text-foreground'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
                className='text-xs text-muted-foreground underline hover:text-foreground'
              >
                Xóa lọc
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className='mt-8 space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <SpotlightCard
                key={i}
                className='rounded-2xl border border-border/60 bg-card/85 dark:bg-card/70'
                spotlightColor='rgba(254, 20, 81, 0.08)'
              >
                <OrderRowSkeleton />
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <SpotlightCard
            className='mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center'
            spotlightColor='rgba(254, 20, 81, 0.1)'
          >
            <p className='font-semibold text-foreground'>
              Không tải được đơn thuê
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Vui lòng đăng nhập hoặc thử lại sau.
            </p>
            <Button
              className='mt-6 rounded-xl bg-rose-600 text-white hover:bg-rose-700'
              render={<Link href='/login?redirect=/rental-orders' />}
            >
              Đăng nhập
            </Button>
          </SpotlightCard>
        )}

        {/* Empty */}
        {!isLoading && !isError && filteredOrders.length === 0 && (
          <SpotlightCard
            className='mt-8 rounded-2xl border border-dashed border-border/70 bg-card/80 p-10 text-center'
            spotlightColor='rgba(254, 20, 81, 0.12)'
          >
            <Package className='mx-auto size-12 text-muted-foreground/60' />
            <p className='mt-4 font-semibold text-foreground'>
              {hasActiveFilters
                ? 'Không tìm thấy đơn phù hợp'
                : 'Chưa có đơn thuê nào'}
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {hasActiveFilters
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Thêm sản phẩm vào giỏ hàng để bắt đầu thuê.'}
            </p>
            {hasActiveFilters ? (
              <Button
                className='mt-6 rounded-xl bg-rose-600 text-white hover:bg-rose-700'
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                }}
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button
                className='mt-6 rounded-xl bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600'
                render={<Link href='/cart' />}
              >
                Đi tới giỏ hàng
              </Button>
            )}
          </SpotlightCard>
        )}

        {/* Orders list */}
        {!isLoading && !isError && filteredOrders.length > 0 && (
          <ul className='mt-6 space-y-3'>
            {filteredOrders.map((order) => {
              const status = order.status as RentalOrderStatus;
              return (
                <li key={order.rentalOrderId}>
                  <SpotlightCard
                    className='rounded-2xl border border-border/60 bg-card/85 shadow-sm transition-shadow hover:shadow-md dark:bg-card/70'
                    spotlightColor='rgba(254, 20, 81, 0.08)'
                  >
                    <Link
                      href={`/rental-orders/${order.rentalOrderId}`}
                      className='flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5'
                    >
                      <div className='flex min-w-0 items-start gap-3'>
                        <div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400'>
                          <FileText className='size-5' />
                        </div>
                        <div className='min-w-0'>
                          <p className='font-mono text-sm font-bold text-rose-700 dark:text-rose-300'>
                            {order.rentalOrderId.slice(0, 8).toUpperCase()}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {formatDate(order.placedAt)}
                          </p>
                          <div className='mt-2 flex flex-wrap items-center gap-2'>
                            <Badge
                              className={cn(
                                'rounded-full text-xs font-medium',
                                RENTAL_ORDER_STATUS_COLORS[status],
                              )}
                            >
                              {RENTAL_ORDER_STATUS_LABELS[status]}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {order.rentalOrderLines.length} sản phẩm
                            </span>
                          </div>
                          <p className='mt-1 text-sm text-foreground'>
                            <span className='font-semibold tabular-nums'>
                              {fmt.format(order.totalPayableAmount)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className='inline-flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400'>
                        Chi tiết
                        <ChevronRight className='size-4' />
                      </span>
                    </Link>
                  </SpotlightCard>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination */}
        {!isLoading && !isError && data && data.totalPages > 0 && (
          <PaginationControls
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
