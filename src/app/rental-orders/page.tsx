'use client';

import { useState, useDeferredValue, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Package,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  X,
  ArrowUpDown,
  CreditCard,
  Loader2,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMyOrdersQuery } from '@/hooks/api/use-rental-orders';
import { useInitiatePayment } from '@/hooks/api/use-payments';
import { useRentalContractByOrderQuery } from '@/hooks/api/use-contract';
import {
  RENTAL_ORDER_STATUS_LABELS,
  RENTAL_ORDER_STATUS_COLORS,
} from '@/api/rentalOrderApi';
import type { RentalOrderStatus } from '@/api/rentalOrderApi';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { buildLoginHref } from '@/lib/auth-redirect';

const PolicyConsentDialog = dynamic(
  () =>
    import('@/components/checkout/policy-consent-dialog').then(
      (m) => m.PolicyConsentDialog,
    ),
  { ssr: false },
);

const PAGE_SIZE = 5;
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

function OrderContractAction({
  rentalOrderId,
  enabled,
}: {
  rentalOrderId: string;
  enabled: boolean;
}) {
  const { data: contract, isLoading, isError } = useRentalContractByOrderQuery(
    rentalOrderId,
    { enabled },
  );

  if (!enabled) {
    return (
      <span
        className='inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground/50'
        title='Hợp đồng sẽ có sau khi thanh toán thành công.'
      >
        <FileText className='size-4' />
      </span>
    );
  }

  if (isLoading) {
    return (
      <span
        className='inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground'
        title='Đang tải hợp đồng...'
      >
        <Loader2 className='size-4 animate-spin' />
      </span>
    );
  }

  if (isError) {
    return (
      <span
        className='inline-flex size-8 items-center justify-center rounded-lg border border-amber-300/60 bg-amber-50/40 text-amber-600 dark:border-amber-700/60 dark:bg-amber-950/20 dark:text-amber-400'
        title='Không tải được hợp đồng cho đơn này.'
      >
        <AlertCircle className='size-4' />
      </span>
    );
  }

  const contractPdfUrl = contract?.contractPdfUrl;
  if (!contractPdfUrl) {
    return (
      <span
        className='inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground/50'
        title='Đơn này chưa có hợp đồng thuê.'
      >
        <FileText className='size-4' />
      </span>
    );
  }

  return (
    <a
      href={contractPdfUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex size-8 items-center justify-center rounded-lg border border-rose-300/60 bg-rose-50/50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40'
      title='Xem hợp đồng thuê (PDF)'
      aria-label='Xem hợp đồng thuê (PDF)'
      onClick={(e) => e.stopPropagation()}
    >
      <FileText className='size-4' />
    </a>
  );
}

function OrderRowSkeleton() {
  return (
    <div className='flex items-center gap-4 px-5 py-4'>
      <Skeleton className='size-10 shrink-0 rounded-xl' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-3 w-48' />
      </div>
      <div className='space-y-2 text-right'>
        <Skeleton className='ml-auto h-4 w-24' />
        <Skeleton className='ml-auto h-5 w-20' />
      </div>
    </div>
  );
}

function StatusTabBar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (v: string) => void;
}) {
  return (
    <div className='overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex min-w-max border-b border-border/60 px-2'>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors',
              activeFilter === f.value
                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
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
    <div className='flex flex-col items-center gap-3 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-between'>
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
          className='h-8 w-8 p-0'
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
                className='flex h-8 w-8 items-center justify-center text-sm text-muted-foreground'
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
                'h-8 w-8 p-0 text-sm',
                isActive &&
                  'bg-rose-600 hover:bg-rose-700 text-white border-rose-600',
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
          className='h-8 w-8 p-0'
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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [pendingPayOrderId, setPendingPayOrderId] = useState<string | null>(
    null,
  );

  const deferredSearch = useDeferredValue(search);

  const initiatePayment = useInitiatePayment();

  async function handlePay(e: React.MouseEvent, rentalOrderId: string) {
    e.preventDefault(); // ngăn Link navigate
    e.stopPropagation();

    if (!isAuthenticated) {
      if (authLoading) {
        toast.error('Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.');
        return;
      }

      toast.error('Vui lòng đăng nhập để thanh toán đơn thuê.');
      router.push(buildLoginHref('/rental-orders'));
      return;
    }

    if (payingId) return;
    setPendingPayOrderId(rentalOrderId);
    setPolicyOpen(true);
  }

  async function handlePayAfterConsent() {
    if (!isAuthenticated) {
      if (authLoading) {
        toast.error('Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.');
        return;
      }

      toast.error('Vui lòng đăng nhập để thanh toán đơn thuê.');
      router.push(buildLoginHref('/rental-orders'));
      return;
    }

    if (!pendingPayOrderId || payingId) return;
    setPolicyOpen(false);
    setPayingId(pendingPayOrderId);
    try {
      const url = await initiatePayment.mutateAsync(pendingPayOrderId);
      window.location.href = url;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Không thể tạo link thanh toán.';
      toast.error(msg);
      setPayingId(null);
      setPendingPayOrderId(null);
    }
  }

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

  const filteredOrders = deferredSearch
    ? orders.filter((o) =>
        o.rentalOrderId.toLowerCase().includes(deferredSearch.toLowerCase()),
      )
    : orders;

  const hasActiveFilters = statusFilter !== '' || deferredSearch !== '';

  return (
    <div className='min-h-screen bg-muted/30 px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-4 md:px-6 md:pt-8 dark:bg-background'>
      <div className='mx-auto max-w-5xl'>
        {/* Page header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
            Đơn thuê của tôi
          </h1>
          <p className='mt-2 text-base text-muted-foreground'>
            Theo dõi tất cả đơn thuê thiết bị của bạn.
          </p>
        </div>

        {/* Main card container */}
        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
          {/* Status tab bar */}
          <StatusTabBar
            activeFilter={statusFilter}
            onFilterChange={(v) => setStatusFilter(v)}
          />

          {/* Controls row */}
          <div className='flex items-center gap-3 border-b border-border/60 px-5 py-3.5 sm:px-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                placeholder='Tìm theo mã đơn thuê...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200/60 dark:bg-card'
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='size-3.5' />
                </button>
              )}
            </div>
            <div className='flex shrink-0 items-center gap-2 text-sm text-muted-foreground'>
              <ArrowUpDown className='size-4' />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className='rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-200/60 dark:bg-card'
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className='flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-2'>
              {statusFilter && (
                <span className='inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'>
                  {
                    RENTAL_ORDER_STATUS_LABELS[
                      statusFilter as RentalOrderStatus
                    ]
                  }
                  <button
                    onClick={() => setStatusFilter('')}
                    className='ml-0.5 hover:text-rose-900'
                  >
                    <X className='size-3' />
                  </button>
                </span>
              )}
              {deferredSearch && (
                <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground'>
                  &quot;{deferredSearch}&quot;
                  <button
                    onClick={() => setSearch('')}
                    className='ml-0.5 text-muted-foreground hover:text-foreground'
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

          {/* Loading */}
          {isLoading && (
            <div className='divide-y divide-border/60'>
              {Array.from({ length: 3 }).map((_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className='px-5 py-16 text-center'>
              <Package className='mx-auto size-10 text-muted-foreground/40' />
              <p className='mt-4 font-semibold text-foreground'>
                Không tải được đơn thuê
              </p>
              <p className='mt-1 text-sm text-muted-foreground'>
                Vui lòng đăng nhập hoặc thử lại sau.
              </p>
              <Button
                className='mt-5 h-9 rounded-xl bg-rose-600 text-sm text-white hover:bg-rose-700'
                render={<Link href={buildLoginHref('/rental-orders')} />}
              >
                Đăng nhập
              </Button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && filteredOrders.length === 0 && (
            <div className='px-5 py-16 text-center'>
              <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted/60'>
                <Package className='size-8 text-muted-foreground/50' />
              </div>
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
                  className='mt-5 h-9 rounded-xl bg-rose-600 text-sm text-white hover:bg-rose-700'
                  onClick={() => {
                    setStatusFilter('');
                    setSearch('');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button
                  className='mt-5 h-9 rounded-xl bg-rose-600 text-sm text-white hover:bg-rose-700'
                  render={<Link href='/cart' />}
                >
                  Đi tới giỏ hàng
                </Button>
              )}
            </div>
          )}

          {/* Orders list */}
          {!isLoading && !isError && filteredOrders.length > 0 && (
            <ul className='divide-y divide-border/60'>
              {filteredOrders.map((order) => {
                const status = order.status as RentalOrderStatus;
                const isPending = status === 'PENDING_PAYMENT';
                const isPaying = payingId === order.rentalOrderId;

                return (
                  <li
                    key={order.rentalOrderId}
                    className={cn(
                      'relative transition-colors',
                      isPending && 'bg-amber-50/60 dark:bg-amber-950/15',
                    )}
                  >
                    {/* Pending payment accent strip */}
                    {isPending && (
                      <span className='absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-amber-400 dark:bg-amber-500' />
                    )}

                    <div className='group flex items-center gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5'>
                      {/* Icon */}
                      <Link
                        href={`/rental-orders/${order.rentalOrderId}`}
                        className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-opacity hover:opacity-80 dark:bg-rose-950/50 dark:text-rose-400'
                        tabIndex={-1}
                      >
                        <Package className='size-5' />
                      </Link>

                      {/* Info - chiếm phần lớn width, click → detail */}
                      <Link
                        href={`/rental-orders/${order.rentalOrderId}`}
                        className='min-w-0 flex-1'
                      >
                        <div className='flex flex-wrap items-center gap-2'>
                          <span className='font-mono text-sm font-bold text-foreground'>
                            #{order.rentalOrderId.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                              RENTAL_ORDER_STATUS_COLORS[status],
                            )}
                          >
                            {RENTAL_ORDER_STATUS_LABELS[status]}
                          </Badge>
                          {order.qrCode && (
                            <span
                              className='inline-flex items-center text-muted-foreground'
                              title='Có mã QR đơn hàng'
                              aria-label='Có mã QR đơn hàng'
                            >
                              <QrCode className='size-3.5' />
                            </span>
                          )}
                        </div>
                        <p className='mt-0.5 text-xs text-muted-foreground'>
                          {formatDate(order.placedAt)} &middot;{' '}
                          {order.rentalOrderLines.length} sản phẩm
                        </p>
                        {order.provisionalOverduePenaltyAmount != null &&
                          order.provisionalOverduePenaltyAmount > 0 && (
                            <p
                              className='mt-1 text-[11px] font-medium tabular-nums text-amber-700 dark:text-amber-400'
                              title='Phí phạt quá hạn tạm tính trên đơn (chưa chốt)'
                            >
                              Phạt quá hạn tạm tính:{' '}
                              {fmt.format(
                                order.provisionalOverduePenaltyAmount,
                              )}
                            </p>
                          )}

                        {/* Amount - hiển thị trong info khi có nút Pay để tránh crowding */}
                        {isPending && (
                          <p className='mt-1 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400'>
                            {fmt.format(order.totalPayableAmount)}
                          </p>
                        )}
                      </Link>

                      {/* Right side */}
                      {isPending ? (
                        /* ── Nút thanh toán cho PENDING_PAYMENT ── */
                        <div className='grid shrink-0 grid-cols-[2.25rem_auto] items-center gap-1.5'>
                          <div className='flex justify-center'>
                            <OrderContractAction
                              rentalOrderId={order.rentalOrderId}
                              enabled={false}
                            />
                          </div>
                          <div className='flex justify-end'>
                            <button
                              type='button'
                              disabled={!!payingId}
                              onClick={(e) =>
                                void handlePay(e, order.rentalOrderId)
                              }
                              className={cn(
                                'flex min-w-28 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                                isPaying
                                  ? 'cursor-wait bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                  : payingId
                                    ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-50'
                                    : 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 hover:bg-amber-600 active:scale-95 dark:bg-amber-500 dark:hover:bg-amber-600',
                              )}
                            >
                              {isPaying ? (
                                <>
                                  <Loader2 className='size-3.5 animate-spin' />
                                  <span className='hidden sm:inline'>
                                    Đang xử lý…
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className='size-3.5' />
                                  <span className='hidden sm:inline'>
                                    Thanh toán
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Amount + chevron cho status khác ── */
                        <div className='grid shrink-0 grid-cols-[2.25rem_auto] items-center gap-1.5'>
                          <div className='flex justify-center'>
                            <OrderContractAction
                              rentalOrderId={order.rentalOrderId}
                              enabled
                            />
                          </div>
                          <Link
                            href={`/rental-orders/${order.rentalOrderId}`}
                            className='flex min-w-0 items-center justify-end gap-2'
                          >
                            <span className='text-right text-sm font-semibold tabular-nums text-foreground'>
                              {fmt.format(order.totalPayableAmount)}
                            </span>
                            <ChevronRight className='size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5' />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Pending: helper text
                    {isPending && !isPaying && (
                      <div className='flex items-center gap-1.5 border-t border-amber-200/60 bg-amber-50/80 px-5 py-2 dark:border-amber-900/30 dark:bg-amber-950/20'>
                        <AlertCircle className='size-3 shrink-0 text-amber-600 dark:text-amber-400' />
                        <p className='text-[11px] text-amber-700 dark:text-amber-300'>
                          Đơn chờ thanh toán - ấn{' '}
                          <span className='font-semibold'>Thanh toán</span> để
                          tiếp tục qua cổng VNPay.
                        </p>
                      </div>
                    )} */}
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

      <PolicyConsentDialog
        open={policyOpen}
        onOpenChange={(open) => {
          setPolicyOpen(open);
          if (!open && !payingId) setPendingPayOrderId(null);
        }}
        onAllConsented={() => void handlePayAfterConsent()}
      />
    </div>
  );
}
