'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ShoppingBag,
  ArrowRight,
  User,
  Package,
  X,
  MapPin,
  Phone,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  CalendarClock,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_CFG } from '@/lib/order-status';
import { fmt, fmtDate, fmtPhone } from '@/lib/formatters';
import { getStaffOrders } from '@/api/staff-orders';
import { useAuthStore } from '@/stores/auth-store';
import { useStaffOrderCounts } from '@/stores/staff-order-counts-store';
import type { RentalOrderResponse, OrderStatus } from '@/types/api.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

// All staff workflow statuses
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

type QuickFilter = 'all' | 'overdue-pickup' | 'overdue-delivery' | 'today';

const QUICK_FILTERS: {
  id: QuickFilter;
  label: string;
  icon: typeof AlertTriangle;
}[] = [
    { id: 'overdue-pickup', label: 'Quá hạn thu hồi', icon: RotateCcw },
    { id: 'overdue-delivery', label: 'Trễ giao', icon: AlertTriangle },
    { id: 'today', label: 'Giao hôm nay', icon: CalendarClock },
  ];

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
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  // ─── API data ────────────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState<RentalOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthStore();
  const staffId = user?.userId ?? null;
  const setCounts = useStaffOrderCounts((s) => s.setCounts);

  useEffect(() => {
    if (!isAuthenticated && user === null) return;
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
        setAllOrders(orders);
        const counts: Partial<Record<OrderStatus, number>> = {};
        for (const o of orders) {
          counts[o.status] = (counts[o.status] ?? 0) + 1;
        }
        setCounts(counts);
      } catch (err) {
        if (cancelled) return;
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

  // ─── Filter: active statuses from URL ──────────────────────────
  // Default to EMPTY array when no status param - empty means "no status filter = show all".
  // The status filter is only applied when activeStatuses.length > 0.
  const activeStatuses = useMemo<OrderStatus[]>(() => {
    const s = searchParams.get('status');
    if (!s) return [];
    const parsed = s
      .split(',')
      .filter((v) => ALL_STATUSES.includes(v as OrderStatus)) as OrderStatus[];
    return parsed;
  }, [searchParams]);

  const isAllSelected = useMemo(
    () => activeStatuses.length === ALL_STATUSES.length,
    [activeStatuses],
  );

  const hasStatusFilter = activeStatuses.length > 0;

  const toggleStatus = useCallback(
    (status: OrderStatus) => {
      const next = activeStatuses.includes(status)
        ? activeStatuses.filter((s) => s !== status)
        : [...activeStatuses, status];
      if (next.length === 0) {
        // No status selected → no filter → clear URL param
        router.replace(`/staff-dashboard/orders`, { scroll: false });
      } else if (next.length === ALL_STATUSES.length) {
        // All selected → clear URL param (same as empty = show all)
        router.replace(`/staff-dashboard/orders`, { scroll: false });
      } else {
        router.replace(`/staff-dashboard/orders?status=${next.join(',')}`, {
          scroll: false,
        });
      }
    },
    [activeStatuses, router],
  );

  const toggleAll = useCallback(() => {
    // Toggle all → always go to empty (no filter = show all)
    router.replace(`/staff-dashboard/orders`, { scroll: false });
  }, [router]);

  // ─── Sort (always uses 'priority' sort, descending - implicit default) ────
  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Derived: overdue info per order ───────────────────────────
  const enrichedOrders = useMemo(() => {
    const today = new Date(now).setHours(0, 0, 0, 0);
    const tomorrow = today + 86400000;
    return allOrders.map((order) => {
      const expDelivery = order.expectedDeliveryDate
        ? new Date(order.expectedDeliveryDate).setHours(0, 0, 0, 0)
        : null;
      const expEnd = order.expectedRentalEndDate
        ? new Date(order.expectedRentalEndDate).setHours(0, 0, 0, 0)
        : null;

      const isDeliveryOverdue =
        expDelivery !== null &&
        expDelivery < today &&
        order.status === 'PAID';

      const isPickupOverdue =
        expEnd !== null &&
        expEnd < today &&
        order.status === 'PENDING_PICKUP';

      const isTodayDelivery =
        expDelivery !== null &&
        expDelivery >= today &&
        expDelivery < tomorrow &&
        order.status === 'PAID';

      const daysDeliveryOverdue =
        isDeliveryOverdue && expDelivery !== null
          ? Math.floor((today - expDelivery) / 86400000)
          : 0;

      const daysPickupOverdue =
        isPickupOverdue && expEnd !== null
          ? Math.floor((today - expEnd) / 86400000)
          : 0;

      // Priority score: lower = more urgent
      let priorityScore = 999;
      if (isDeliveryOverdue) priorityScore = 1 + daysDeliveryOverdue * 0.001;
      else if (isPickupOverdue) priorityScore = 2 + daysPickupOverdue * 0.001;
      else priorityScore = 3;

      return {
        order,
        isDeliveryOverdue,
        isPickupOverdue,
        isTodayDelivery,
        daysDeliveryOverdue,
        daysPickupOverdue,
        priorityScore,
      };
    });
  }, [allOrders, now]);

  // ─── Filter + Sort ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = enrichedOrders.filter(
      ({ order, isDeliveryOverdue, isPickupOverdue, isTodayDelivery }) => {
        // Status filter: only apply when hasStatusFilter (activeStatuses > 0)
        if (hasStatusFilter && !activeStatuses.includes(order.status))
          return false;

        // Quick filter
        if (quickFilter === 'overdue-pickup' && !isPickupOverdue) return false;
        if (quickFilter === 'overdue-delivery' && !isDeliveryOverdue)
          return false;
        if (quickFilter === 'today' && !isTodayDelivery) return false;

        // Text search
        if (q) {
          return (
            order.rentalOrderId.toLowerCase().includes(q) ||
            (order.userAddress?.recipientName ?? '')
              .toLowerCase()
              .includes(q) ||
            (order.userAddress?.phoneNumber ?? '').includes(q) ||
            (order.hubAddressLine ?? '').toLowerCase().includes(q) ||
            order.rentalOrderLines.some((i) =>
              i.productNameSnapshot.toLowerCase().includes(q),
            )
          );
        }
        return true;
      },
    );

    // Always sort by priority: overdue delivery → overdue pickup → future dates closest to today
    list.sort((a, b) => a.priorityScore - b.priorityScore);

    return list;
  }, [enrichedOrders, search, activeStatuses, hasStatusFilter, quickFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeStatuses, quickFilter]);

  const urgentDelivery = enrichedOrders.filter(
    ({ isDeliveryOverdue }) => isDeliveryOverdue,
  ).length;
  const urgentPickup = enrichedOrders.filter(
    ({ isPickupOverdue }) => isPickupOverdue,
  ).length;
  const todayCount = enrichedOrders.filter(
    ({ isTodayDelivery }) => isTodayDelivery,
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
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* ===== Header ===== */}
        <div className="mb-6 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">
            Đơn hàng của tôi
          </h1>
          <div className="h-0.5 w-14 rounded-full bg-linear-to-r from-theme-primary-start to-theme-primary-end" />
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>
              Hiển thị{' '}
              <strong className="text-foreground font-semibold">
                {filtered.length === 0
                  ? 0
                  : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)}`}
              </strong>{' '}
              / {filtered.length} đơn
            </span>
            {urgentDelivery > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-md border border-destructive/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <AlertTriangle className="size-3" />
                  {urgentDelivery} trễ giao
                </span>
              </>
            )}
            {urgentPickup > 0 && (
              <>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <RotateCcw className="size-3" />
                  {urgentPickup} trễ thu hồi
                </span>
              </>
            )}
          </div>
        </div>

        {/* ===== Search & Filter Bar ===== */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Row 1: Search + Status Filter (horizontal) */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                placeholder="Tìm mã đơn, tên khách, số điện thoại, sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10 h-12 w-full bg-card border-border/60 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary-start/25 transition-all text-[15px]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  className={cn(
                    'gap-2 h-12 rounded-xl border-border/60 shadow-sm transition-all justify-start sm:w-48 shrink-0',
                    'hover:bg-accent text-[14px] font-medium',
                    hasStatusFilter &&
                    'border-theme-primary-start/40 bg-theme-primary-start/5',
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span>Lọc trạng thái</span>
                  {hasStatusFilter && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-theme-primary-start text-white text-xs font-bold ml-1">
                      {activeStatuses.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 ml-auto opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 max-h-96 overflow-y-auto p-2"
                sideOffset={6}
              >
                {/* Select All */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAll();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent focus:bg-accent select-none"
                >
                  <div
                    className={cn(
                      'size-5 rounded border-2 flex items-center justify-center transition-all shrink-0',
                      isAllSelected
                        ? 'bg-primary border-primary'
                        : 'border-border/60 bg-card',
                    )}
                  >
                    {isAllSelected && <Check className="size-3 text-white" />}
                  </div>
                  <span className="font-semibold text-[14px] flex-1">
                    Tất cả trạng thái
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {ALL_STATUSES.length}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 -mx-2" />

                {/* Status checkboxes */}
                {ALL_STATUSES.map((s) => {
                  const cfg = STATUS_CFG[s];
                  const Icon = cfg.icon;
                  const isActive = activeStatuses.includes(s);
                  return (
                    <DropdownMenuItem
                      key={s}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleStatus(s);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent focus:bg-accent select-none"
                    >
                      <div
                        className={cn(
                          'size-5 rounded border-2 flex items-center justify-center transition-all shrink-0',
                          isActive
                            ? 'bg-primary border-primary'
                            : 'border-border/60 bg-card',
                        )}
                      >
                        {isActive && <Check className="size-3 text-white" />}
                      </div>
                      <span
                        className={cn('size-2 rounded-full shrink-0', cfg.dot)}
                      />
                      <Icon className={cn('size-4 shrink-0', cfg.color)} />
                      <span className="flex-1 text-[14px]">{cfg.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Quick filter chips + active status chips */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Quick filter buttons */}
            {QUICK_FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive = quickFilter === f.id;
              const count =
                f.id === 'overdue-pickup'
                  ? urgentPickup
                  : f.id === 'overdue-delivery'
                    ? urgentDelivery
                    : todayCount;
              return (
                <button
                  key={f.id}
                  onClick={() => setQuickFilter(isActive ? 'all' : f.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all',
                    isActive
                      ? f.id === 'overdue-pickup'
                        ? 'bg-amber-50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600'
                        : f.id === 'overdue-delivery'
                          ? 'bg-destructive/10 text-destructive border-destructive/40'
                          : 'bg-info/10 text-info border-info/40'
                      : 'bg-muted/60 text-muted-foreground border-border/60 hover:border-muted hover:bg-muted',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-3.5',
                      isActive &&
                      (f.id === 'overdue-pickup'
                        ? 'text-amber-500'
                        : f.id === 'overdue-delivery'
                          ? 'text-destructive'
                          : 'text-info'),
                    )}
                  />
                  {f.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black',
                        isActive
                          ? f.id === 'overdue-pickup'
                            ? 'bg-amber-500 text-white'
                            : f.id === 'overdue-delivery'
                              ? 'bg-destructive text-white'
                              : 'bg-info text-white'
                          : 'bg-muted-foreground/30 text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Clear quick filter when active */}
            {quickFilter !== 'all' && (
              <button
                onClick={() => setQuickFilter('all')}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3" />
                Bỏ lọc nhanh
              </button>
            )}

            {/* Active status chips */}
            {hasStatusFilter && (
              <div className="flex flex-wrap gap-1.5 items-center ml-auto">
                {activeStatuses.map((s) => {
                  const cfg = STATUS_CFG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatus(s)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                        cfg.bg,
                        cfg.color,
                        cfg.border,
                      )}
                    >
                      {cfg.label}
                      <X className="size-2.5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== Orders List ===== */}
        {allOrders.length === 0 ? (
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
              Không có đơn hàng nào khớp với tìm kiếm và bộ lọc hiện tại.
            </p>
            <button
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-colors shadow-sm"
              onClick={() => {
                setSearch('');
                setQuickFilter('all');
                toggleAll();
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {paginatedOrders.map(
                ({
                  order,
                  isDeliveryOverdue,
                  isPickupOverdue,
                  daysDeliveryOverdue,
                  daysPickupOverdue,
                }) => (
                  <OrderCard
                    key={order.rentalOrderId}
                    order={order}
                    isDeliveryOverdue={Boolean(isDeliveryOverdue)}
                    isPickupOverdue={Boolean(isPickupOverdue)}
                    daysDeliveryOverdue={daysDeliveryOverdue}
                    daysPickupOverdue={daysPickupOverdue}
                  />
                ),
              )}
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

function OrderCard({
  order,
  isDeliveryOverdue,
  isPickupOverdue,
  daysDeliveryOverdue,
  daysPickupOverdue,
}: {
  order: RentalOrderResponse;
  isDeliveryOverdue: boolean;
  isPickupOverdue: boolean;
  daysDeliveryOverdue: number;
  daysPickupOverdue: number;
}) {
  const cfg = STATUS_CFG[order.status];
  const Icon = cfg.icon;

  const deliveryAddress = order.userAddress
    ? [
      order.userAddress.addressLine,
      order.userAddress.district,
      order.userAddress.city,
    ]
      .filter(Boolean)
      .join(', ')
    : (order.hubAddressLine ?? '');

  return (
    <div
      className={cn(
        'bg-card border border-border/60 rounded-xl overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:shadow-theme-primary-start/5 hover:-translate-y-0.5',
        'hover:border-theme-primary-start/40',
        isDeliveryOverdue &&
        'border-destructive/40 hover:border-destructive/70',
        isPickupOverdue &&
        !isDeliveryOverdue &&
        'border-amber-400/40 hover:border-amber-500/70',
      )}
    >
      <Link
        href={`/staff-dashboard/orders/${order.rentalOrderId}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* VẠCH MÀU VIỀN TRÁI */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1.5 z-20 transition-colors',
            isDeliveryOverdue
              ? 'bg-destructive animate-pulse'
              : isPickupOverdue
                ? 'bg-amber-500 animate-pulse'
                : cfg.dot,
          )}
        />

        {/* Banner cảnh báo siêu mỏng */}
        {isDeliveryOverdue && (
          <div className="pl-6 pr-5 py-2 bg-destructive/10 flex items-center justify-between border-b border-destructive/20 relative z-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-destructive" />
              <span className="text-[12px] font-bold text-destructive uppercase tracking-wide">
                Trễ giao hàng
              </span>
            </div>
            {daysDeliveryOverdue > 0 && (
              <span className="text-[11px] font-black text-white bg-destructive px-1.5 py-0.5 rounded shadow-sm">
                +{daysDeliveryOverdue} ngày
              </span>
            )}
          </div>
        )}
        {isPickupOverdue && !isDeliveryOverdue && (
          <div className="pl-6 pr-5 py-2 bg-amber-500/10 flex items-center justify-between border-b border-amber-500/20 relative z-10">
            <div className="flex items-center gap-2">
              <RotateCcw className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Trễ thu hồi
              </span>
            </div>
            {daysPickupOverdue > 0 && (
              <span className="text-[11px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded shadow-sm">
                +{daysPickupOverdue} ngày
              </span>
            )}
          </div>
        )}

        {/* HEADER: Chỉnh pl-6 để tạo khoảng trống nhường cho vạch màu */}
        <div className="pl-6 pr-5 py-3.5 bg-muted/20 border-b border-border/50 flex items-center justify-between gap-3 relative z-10">
          {/* Thêm min-w-0 vào khối cha bên trái */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'p-1.5 rounded-lg border bg-background shadow-sm shrink-0', // Thêm shrink-0 cho icon
                cfg.border,
                cfg.color,
              )}
            >
              <Icon className="size-4" />
            </div>

            {/* Thêm min-w-0 vào khối text để truncate hoạt động */}
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-foreground font-mono leading-none truncate">
                {order.rentalOrderId}
              </h3>
              {order.hubName && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-none truncate">
                  {order.hubName}
                </p>
              )}
            </div>
          </div>

          {/* Thêm shrink-0 và whitespace-nowrap để bảo vệ khối Label */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shrink-0 whitespace-nowrap',
              cfg.color,
              cfg.bg,
              cfg.border || 'border border-transparent',
            )}
          >
            <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </div>
        </div>

        {/* BODY: Sử dụng kỹ thuật Divide để phân tách rõ ràng */}
        <div className="relative flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/50 z-10">
          {/* KHỐI 1: KHÁCH HÀNG & ĐỊA CHỈ (Được tăng pl-6) */}
          <div className="flex-6 pl-6 pr-5 py-5 space-y-4 min-w-0">
            {/* Tên & SĐT trên cùng 1 hàng */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <User className="size-3" /> Khách hàng
                </p>
                <p className="text-[13px] sm:text-sm font-semibold text-foreground truncate">
                  {order.userAddress?.recipientName ?? order.hubName ?? '-'}
                </p>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Phone className="size-3" /> Điện thoại
                </p>
                <p className="text-[13px] sm:text-sm font-medium text-foreground truncate">
                  {fmtPhone(order.userAddress?.phoneNumber)}
                </p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                <MapPin className="size-3" /> Giao đến
              </p>
              <p className="text-[12px] sm:text-[13px] text-foreground font-medium leading-snug line-clamp-2">
                {deliveryAddress || 'Nhận tại cửa hàng'}
              </p>
            </div>
          </div>

          {/* KHỐI 2: LỊCH TRÌNH TIMELINE */}
          <div className="flex-[3.5] p-5 flex flex-col justify-center min-w-0">
            {/* Wrapper tự động Responsive: 
                Mobile: Lưới 2 cột (grid grid-cols-2)
                Desktop: Xếp dọc (lg:flex lg:flex-col) 
            */}
            <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-6">
              {/* Cột mốc 1: Nhận hàng */}
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Điểm nhấn màu xanh */}
                <div className="w-1.5 h-full min-h-[36px] rounded-full bg-blue-500/20 flex flex-col shrink-0">
                  <div className="w-1.5 h-3.5 bg-blue-500 rounded-full" />
                </div>
                <div className="min-w-0 mt-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
                    Nhận hàng
                  </p>
                  <p className="text-[13px] sm:text-sm font-bold text-blue-600 dark:text-blue-400 truncate">
                    {fmtDate(order.expectedDeliveryDate)}
                  </p>
                </div>
              </div>

              {/* Cột mốc 2: Trả hàng */}
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Điểm nhấn màu cam */}
                <div className="w-1.5 h-full min-h-[36px] rounded-full bg-amber-500/20 flex flex-col shrink-0">
                  <div className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
                </div>
                <div className="min-w-0 mt-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
                    Trả hàng
                  </p>
                  <p className="text-[13px] sm:text-sm font-bold text-amber-600 dark:text-amber-400 truncate">
                    {fmtDate(order.expectedRentalEndDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 3: TÀI CHÍNH */}
          <div className="flex-3 p-5 flex flex-col items-start justify-between bg-zinc-50/50 dark:bg-zinc-900/10 min-w-0 gap-4">
            <div className="w-full space-y-1.5">
              {/* Phí thuê gốc (trước voucher) */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Phí thuê gốc
                </span>
                <span className="text-[12px] font-semibold text-foreground">
                  {fmt(order.rentalSubtotalAmount ?? order.rentalFeeAmount)}
                </span>
              </div>

              {/* Giảm giá voucher */}
              {(order.voucherDiscountAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <Tag className="size-3" />
                    Giảm voucher
                  </span>
                  <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                    −{fmt(order.voucherDiscountAmount ?? 0)}
                  </span>
                </div>
              )}

              {/* Phí thuê (sau voucher) */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Phí thuê
                </span>
                <span className="text-[13px] font-semibold text-foreground">
                  {fmt(order.totalPayableAmount ?? order.rentalFeeAmount)}
                </span>
              </div>

              {/* Tiền cọc */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Tiền cọc
                </span>
                <span className="text-[13px] font-semibold text-blue-600 dark:text-blue-400">
                  {fmt(order.depositHoldAmount)}
                </span>
              </div>

              {/* Phí phạt (nếu có) */}
              {(order.penaltyChargeAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Phí phạt
                  </span>
                  <span className="text-[13px] font-bold text-orange-600 dark:text-orange-400">
                    +{fmt(order.penaltyChargeAmount ?? 0)}
                  </span>
                </div>
              )}

              {/* Gạch phân cách */}
              <div className="border-t border-border/60 my-1.5" />

              {/* Tổng cộng = phí thuê (sau voucher) + cọc */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-foreground uppercase tracking-wide">
                  Tổng cộng
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {fmt(
                    (order.totalPayableAmount ?? order.rentalFeeAmount) +
                    order.depositHoldAmount +
                    (order.penaltyChargeAmount ?? 0),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* FOOTER: Nút xem chi tiết - nằm ngoài Link */}
      <div className="px-5 py-3 border-t border-border/50 flex items-center justify-end bg-muted/20">
        <Link
          href={`/staff-dashboard/orders/${order.rentalOrderId}`}
          className={cn(
            'flex items-center gap-2 text-[13px] font-bold',
            'text-theme-primary-start hover:text-theme-primary-end',
            'transition-colors group',
          )}
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
