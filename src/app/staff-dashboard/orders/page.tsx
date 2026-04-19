'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  User,
  Calendar,
  Package,
  X,
  MapPin,
  Phone,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_CFG } from '@/lib/order-status';
import { fmt, fmtDateShort } from '@/lib/formatters';
import { getStaffOrders } from '@/api/staff-orders';
import { useAuthStore } from '@/stores/auth-store';
import { useStaffOrderCounts } from '@/stores/staff-order-counts-store';
import type { StaffOrder, OrderStatus } from '@/types/api.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const PAGE_SIZE = 5;

// Default landing view for "Đơn hàng": show the two queues that require staff
// confirmation right now.
const DEFAULT_QUEUE_STATUSES: OrderStatus[] = ['PAID', 'PENDING_PICKUP'];

// Full staff workflow statuses must remain available so the shipper can re-open
// an in-progress order after leaving the page by mistake.
const ALL_STATUSES: OrderStatus[] = [
  'PAID',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'PENDING_PICKUP',
  'PICKING_UP',
  'PICKED_UP',
  'COMPLETED',
];

type SortKey = 'created_at' | 'start_date' | 'end_date' | 'total_rental_fee';
type SortDir = 'asc' | 'desc';

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OrdersPageInner />
    </Suspense>
  );
}

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [now] = useState(() => Date.now());
  const [search, setSearch] = useState('');

  // ─── API data ────────────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState<StaffOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const staffId = user?.userId ?? null;
  const setCounts = useStaffOrderCounts((s) => s.setCounts);

  useEffect(() => {
    // Auth bootstrap not finished yet - keep showing spinner
    if (!isAuthenticated && user === null) return;

    // Bootstrap done but no user → not logged in
    if (!staffId) {
      setIsLoading(false);
      setLoadError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const orders = await getStaffOrders(staffId);
        if (cancelled) return;
        console.log('[OrdersPage] orders loaded:', orders.length);
        setAllOrders(orders);
        // Populate sidebar counts
        const counts: Partial<Record<OrderStatus, number>> = {};
        for (const o of orders) {
          counts[o.status] = (counts[o.status] ?? 0) + 1;
        }
        setCounts(counts);
      } catch (err) {
        if (cancelled) return;
        console.error('[OrdersPage] load error:', err);
        setLoadError(
          err instanceof Error ? err.message : 'Không thể tải dữ liệu',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [staffId, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Multi-select filter across the full workflow. If the route has no status,
  // fall back to the default confirmation queues (PAID + PENDING_PICKUP).
  const activeStatuses = useMemo<OrderStatus[]>(() => {
    const s = searchParams.get('status');
    if (!s) return DEFAULT_QUEUE_STATUSES;

    const parsed = s
      .split(',')
      .filter((val) =>
        ALL_STATUSES.includes(val as OrderStatus),
      ) as OrderStatus[];

    return parsed.length > 0 ? parsed : DEFAULT_QUEUE_STATUSES;
  }, [searchParams]);

  const toggleStatusFilter = useCallback(
    (status: OrderStatus | 'ALL') => {
      if (status === 'ALL') {
        router.replace(
          `/staff-dashboard/orders?status=${DEFAULT_QUEUE_STATUSES.join(',')}`,
          { scroll: false },
        );
        return;
      }

      let newStatuses = [...activeStatuses];
      if (newStatuses.includes(status)) {
        newStatuses = newStatuses.filter((s) => s !== status);
      } else {
        newStatuses.push(status);
      }

      if (newStatuses.length === 0) {
        router.replace(
          `/staff-dashboard/orders?status=${DEFAULT_QUEUE_STATUSES.join(',')}`,
          { scroll: false },
        );
      } else {
        router.replace(
          `/staff-dashboard/orders?status=${newStatuses.join(',')}`,
          { scroll: false },
        );
      }
    },
    [activeStatuses, router],
  );

  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // allOrders already filtered by staff ID at API level
  const myOrders = allOrders;

  const filtered = useMemo(() => {
    let list = [...myOrders];
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (o) =>
          o.order_code.toLowerCase().includes(q) ||
          o.renter.full_name.toLowerCase().includes(q) ||
          o.renter.phone_number.includes(q) ||
          o.delivery_address?.toLowerCase().includes(q) ||
          o.items.some((i) => i.product_name.toLowerCase().includes(q)),
      );
    }

    if (activeStatuses.length > 0) {
      list = list.filter((o) => activeStatuses.includes(o.status));
    }

    list.sort((a, b) => {
      const av =
        sortKey === 'total_rental_fee'
          ? a[sortKey]
          : new Date(a[sortKey] ?? 0).getTime();
      const bv =
        sortKey === 'total_rental_fee'
          ? b[sortKey]
          : new Date(b[sortKey] ?? 0).getTime();
      return sortDir === 'desc' ? bv - av : av - bv;
    });
    return list;
  }, [search, activeStatuses, sortKey, sortDir, myOrders]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  // Reset trang về 1 khi filter/search/sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeStatuses, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const urgentCount = myOrders.filter((o) =>
    ['PAID', 'PENDING_PICKUP'].includes(o.status),
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <span>Đang tải danh sách đơn hàng…</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center p-6">
        <p className="text-destructive font-semibold">Không thể tải dữ liệu</p>
        <p className="text-sm text-muted-foreground">{loadError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* ===== Header ===== */}
        <div className="mb-6 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">
            Đơn hàng của tôi
          </h1>
          <div className="h-0.5 w-14 rounded-full bg-linear-to-r from-theme-primary-start to-theme-primary-end" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>
              Hiển thị{' '}
              <strong className="text-foreground font-semibold">
                {filtered.length === 0
                  ? 0
                  : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)}`}
              </strong>{' '}
              / {filtered.length} đơn
            </span>
            {urgentCount > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse-gentle" />
                  {urgentCount} cần xử lý
                </span>
              </>
            )}
          </div>
        </div>

        {/* ===== Search & Filters Bar ===== */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <Input
              placeholder="Tìm mã đơn, tên khách, số điện thoại, sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 h-12 w-full bg-card border-border/60 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary-start/25 transition-all text-[15px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'gap-2 h-10 rounded-lg border-border/60 shadow-sm transition-all',
                !showFilters && 'bg-card hover:bg-accent',
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
              {activeStatuses.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold ml-1">
                  {activeStatuses.length}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform opacity-70',
                  showFilters && 'rotate-180',
                )}
              />
            </Button>

            {search && (
              <Button
                variant="ghost"
                onClick={() => setSearch('')}
                className="gap-2 h-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg"
              >
                <X className="w-4 h-4" />
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilters && (
          <div className="bg-card border border-border/60 rounded-xl p-5 mb-6 space-y-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Statuses Filter (Multi-select) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wide">
                  Lọc theo Trạng thái
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleStatusFilter('ALL')}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all border shadow-sm',
                    activeStatuses.length === DEFAULT_QUEUE_STATUSES.length &&
                      DEFAULT_QUEUE_STATUSES.every((status) =>
                        activeStatuses.includes(status),
                      )
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border/60 hover:border-border hover:bg-accent hover:text-foreground',
                  )}
                >
                  Tất cả
                </button>
                {ALL_STATUSES.map((s) => {
                  const isActive = activeStatuses.includes(s);
                  const sCfg = STATUS_CFG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatusFilter(s)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border shadow-sm inline-flex items-center gap-1.5',
                        isActive
                          ? cn(
                              sCfg.bg,
                              sCfg.color,
                              sCfg.border,
                              'ring-1 ring-current/20',
                            )
                          : 'bg-background text-muted-foreground border-border/60 hover:border-border hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          isActive ? sCfg.dot : 'bg-muted-foreground/30',
                        )}
                      />
                      {sCfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Options */}
            <div className="border-t border-border/40 pt-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-foreground uppercase tracking-wide">
                Sắp xếp theo
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { k: 'created_at', l: 'Mới nhất' },
                    { k: 'start_date', l: 'Bắt đầu sớm' },
                    { k: 'end_date', l: 'Kết thúc gần' },
                    { k: 'total_rental_fee', l: 'Giá trị' },
                  ] as { k: SortKey; l: string }[]
                ).map(({ k, l }) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border shadow-sm flex items-center gap-1.5',
                      sortKey === k
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border/60 hover:border-border hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {l}
                    {sortKey === k && (
                      <span className="text-xs opacity-70">
                        {sortDir === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== Orders List ===== */}
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-dashed border-border/60 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-xl font-bold text-foreground">
              Chưa có đơn hàng nào
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Bạn chưa được phân công đơn hàng nào. Hãy liên hệ quản lý để nhận
              lịch giao hàng.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-xl border border-dashed border-border/60 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-xl font-bold text-foreground">
              Không tìm thấy đơn hàng
            </p>
            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
              Không có đơn hàng nào khớp với tìm kiếm và bộ lọc hiện tại của
              bạn.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors shadow-sm"
              onClick={() => {
                setSearch('');
                toggleStatusFilter('ALL');
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.rental_order_id}
                  order={order}
                  now={now}
                />
              ))}
            </div>

            {/* ===== Pagination ===== */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className={cn(
                          currentPage === 1 && 'pointer-events-none opacity-50',
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const isActive = page === safePage;
                        const isHidden =
                          page !== 1 &&
                          page !== totalPages &&
                          Math.abs(page - safePage) > 1;

                        if (isHidden) {
                          if (
                            (page === safePage - 2 && safePage > 3) ||
                            (page === safePage + 2 && safePage < totalPages - 2)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }

                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={isActive}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      },
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className={cn(
                          currentPage === totalPages &&
                            'pointer-events-none opacity-50',
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, now }: { order: StaffOrder; now: number }) {
  const cfg = STATUS_CFG[order.status];
  const Icon = cfg.icon;
  const daysOverdue =
    order.status === 'OVERDUE'
      ? Math.floor((now - new Date(order.end_date).getTime()) / 86400000)
      : 0;

  return (
    <Link
      href={`/staff-dashboard/orders/${order.rental_order_id}`}
      className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <div
        className={cn(
          'relative bg-card border rounded-xl transition-all duration-300 overflow-hidden',
          'hover:shadow-lg hover:-translate-y-0.5',
          'border-border/60 hover:border-theme-primary-start/30',
        )}
      >
        {/* ===== Left Indicator ===== */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 transition-colors',
            cfg.dot,
          )}
        />

        <div className="pl-1">
          {/* ===== Header Section ===== */}
          <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-4 bg-muted/10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm border border-black/5 dark:border-white/5',
                  cfg.bg,
                )}
              >
                <Icon className={cn('w-5 h-5', cfg.color)} />
              </div>
              <div className="min-w-0 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground tracking-tight font-mono whitespace-nowrap">
                    {order.order_code}
                  </h3>
                  {daysOverdue > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-destructive bg-destructive/10 uppercase tracking-wider border border-destructive/20 whitespace-nowrap">
                      Quá {daysOverdue} ngày
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wide font-bold shadow-sm whitespace-nowrap',
                  cfg.color,
                  cfg.bg,
                  cfg.border || 'border border-transparent',
                )}
              >
                <span
                  className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)}
                />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* ===== Main Content Grid ===== */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.5fr_1fr_0.8fr] gap-5 lg:gap-6">
            {/* 1. Customer Info */}
            <div className="space-y-1.5 min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <User className="w-3.5 h-3.5 shrink-0" />
                Khách hàng
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {order.renter.full_name}
              </p>
              <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-mono font-medium whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {order.renter.phone_number}
              </div>
              {order.renter.email && (
                <p className="text-[12px] text-muted-foreground truncate">
                  {order.renter.email}
                </p>
              )}
            </div>

            {/* 2. Products */}
            <div className="space-y-1.5 min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <Package className="w-3.5 h-3.5 shrink-0" />
                Sản phẩm
              </p>
              <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                {order.items.map((i) => i.product_name).join(', ')}
              </p>
            </div>

            {/* 3. Dates */}
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                Lịch trình
              </p>
              <p className="text-sm text-foreground font-semibold whitespace-nowrap">
                {fmtDateShort(order.start_date)} →{' '}
                {fmtDateShort(order.end_date)}
              </p>
            </div>

            {/* 4. Price Summary */}
            <div className="space-y-1.5 lg:text-right">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Thành tiền
              </p>
              <p className="text-lg font-black text-success tabular-nums tracking-tight leading-none pt-0.5">
                {fmt(order.total_rental_fee)}
              </p>
              {order.total_penalty_amount ? (
                <p className="text-[11px] font-bold text-destructive bg-destructive/10 inline-block px-1.5 py-0.5 rounded border border-destructive/20 whitespace-nowrap">
                  +{fmt(order.total_penalty_amount)} phạt
                </p>
              ) : null}
            </div>
          </div>

          {/* ===== Footer: Address & Action ===== */}
          <div className="px-5 py-3.5 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0 text-[13px]">
              <MapPin className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground line-clamp-1">
                Giao đến:{' '}
                <strong className="text-foreground font-semibold ml-1">
                  {order.delivery_address || 'Nhận tại cửa hàng'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[13px] font-bold text-theme-primary-start group-hover:text-theme-primary-end transition-colors shrink-0">
              <span>Xem chi tiết</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
