'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ArrowUpDown,
  Filter,
  ChevronDown,
  ShoppingBag,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  ArrowRight,
  User,
  Calendar,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS, MOCK_CURRENT_STAFF } from '@/data/mockDashboard';
import type { DashboardOrder, OrderStatus } from '@/types/dashboard.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
    dot: 'bg-muted-foreground',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-theme-primary-start',
    bg: 'bg-theme-primary-start/10',
    border: 'border-theme-primary-start/25',
    dot: 'bg-theme-primary-start',
    icon: CheckCircle2,
  },
  DELIVERING: {
    label: 'Đang giao',
    color: 'text-info',
    bg: 'bg-info-muted',
    border: 'border-info-border',
    dot: 'bg-info animate-pulse',
    icon: Truck,
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
    icon: ShoppingBag,
  },
  RETURNING: {
    label: 'Đang trả',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/25',
    dot: 'bg-destructive animate-pulse',
    icon: RotateCcw,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive',
    icon: XCircle,
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive animate-pulse',
    icon: AlertCircle,
  },
};

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'DELIVERING',
  'ACTIVE',
  'RETURNING',
  'OVERDUE',
  'COMPLETED',
  'CANCELLED',
];

type FilterKey = 'ALL' | 'urgent' | 'in_progress' | 'done' | OrderStatus;
const GROUP_STATUSES: Partial<Record<FilterKey, OrderStatus[]>> = {
  urgent: ['PENDING', 'OVERDUE', 'RETURNING'],
  in_progress: ['CONFIRMED', 'DELIVERING', 'ACTIVE'],
  done: ['COMPLETED', 'CANCELLED'],
};

type SortKey = 'created_at' | 'start_date' | 'end_date' | 'total_rental_fee';
type SortDir = 'asc' | 'desc';

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const fmtRelative = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}ph`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [now] = useState(() => Date.now());
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>(() => {
    const s = searchParams.get('status') as FilterKey | null;
    if (!s) return 'ALL';
    if (s === 'urgent' || s === 'in_progress' || s === 'done') return s;
    if (ALL_STATUSES.includes(s as OrderStatus)) return s as OrderStatus;
    return 'ALL';
  });
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const s = searchParams.get('status') as FilterKey | null;
    if (s && s !== activeFilter) {
      if (s === 'urgent' || s === 'in_progress' || s === 'done') {
        setActiveFilter(s);
      } else if (ALL_STATUSES.includes(s as OrderStatus)) {
        setActiveFilter(s as OrderStatus);
      } else {
        setActiveFilter('ALL');
      }
    } else if (!s && activeFilter !== 'ALL') {
      setActiveFilter('ALL');
    }
  }, [searchParams]);

  // Only show orders assigned to this staff member (stable ref since MOCK data is constant)
  const myOrders = useMemo(
    () =>
      MOCK_ORDERS.filter(
        (o) =>
          o.staff_checkin_id === MOCK_CURRENT_STAFF.staff_id ||
          o.staff_checkout_id === MOCK_CURRENT_STAFF.staff_id,
      ),
    [],
  );

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
    if (activeFilter !== 'ALL') {
      const groupStatuses = GROUP_STATUSES[activeFilter];
      if (groupStatuses) {
        list = list.filter((o) => groupStatuses.includes(o.status));
      } else {
        list = list.filter((o) => o.status === (activeFilter as OrderStatus));
      }
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
  }, [search, activeFilter, sortKey, sortDir, myOrders]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const urgentCount = myOrders.filter((o) =>
    ['PENDING', 'OVERDUE', 'RETURNING'].includes(o.status),
  ).length;

  return (
    <div className="flex flex-col gap-5 p-5 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Đơn hàng của tôi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filtered.length} / {myOrders.length} đơn được phân công
          {urgentCount > 0 && (
            <span className="ml-2 text-destructive font-semibold">
              · {urgentCount} cần xử lý
            </span>
          )}
        </p>
      </div>

      {/* Quick status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          {
            key: 'ALL' as FilterKey,
            label: 'Tất cả',
            count: myOrders.length,
            urgent: false,
          },
          {
            key: 'urgent' as FilterKey,
            label: 'Cần xử lý',
            count: urgentCount,
            urgent: true,
          },
          {
            key: 'in_progress' as FilterKey,
            label: 'Đang diễn ra',
            count: myOrders.filter((o) =>
              ['CONFIRMED', 'DELIVERING', 'ACTIVE'].includes(o.status),
            ).length,
            urgent: false,
          },
          {
            key: 'done' as FilterKey,
            label: 'Kết thúc',
            count: myOrders.filter((o) =>
              ['COMPLETED', 'CANCELLED'].includes(o.status),
            ).length,
            urgent: false,
          },
        ].map((tab) => {
          const isActive =
            tab.key === 'ALL'
              ? activeFilter === 'ALL'
              : activeFilter === tab.key ||
                (GROUP_STATUSES[tab.key]?.includes(
                  activeFilter as OrderStatus,
                ) ??
                  false);
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'ALL') setActiveFilter('ALL');
                else if (activeFilter === tab.key) setActiveFilter('ALL');
                else setActiveFilter(tab.key);
              }}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all shrink-0',
                isActive
                  ? 'bg-theme-primary-start text-white border-theme-primary-start shadow-sm'
                  : tab.urgent && tab.count > 0
                    ? 'border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10'
                    : 'border-border/40 bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'flex h-5 min-w-5 px-1 items-center justify-center rounded-full text-xs font-bold',
                  isActive
                    ? 'bg-white/20 text-inherit'
                    : tab.urgent && tab.count > 0
                      ? 'bg-destructive text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách, sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-background border-border/40"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-10"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="size-4" />
            Lọc
            <ChevronDown
              className={cn(
                'size-3 transition-transform',
                showFilters && 'rotate-180',
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-10"
            onClick={() => toggleSort('created_at')}
          >
            <ArrowUpDown className="size-4" />
            {sortKey === 'created_at'
              ? sortDir === 'desc'
                ? 'Mới nhất'
                : 'Cũ nhất'
              : 'Sắp xếp'}
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border/30 bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2.5">
                Trạng thái đơn
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all',
                    activeFilter === 'ALL'
                      ? 'bg-theme-primary-start text-white border-theme-primary-start'
                      : 'border-border/40 text-muted-foreground hover:bg-accent',
                  )}
                >
                  Tất cả
                </button>
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setActiveFilter(activeFilter === s ? 'ALL' : s)
                    }
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all',
                      activeFilter === s
                        ? 'bg-theme-primary-start text-white border-theme-primary-start'
                        : 'border-border/40 text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2.5">
                Sắp xếp theo
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { k: 'created_at', l: 'Ngày tạo' },
                    { k: 'start_date', l: 'Bắt đầu' },
                    { k: 'end_date', l: 'Kết thúc' },
                    { k: 'total_rental_fee', l: 'Giá trị' },
                  ] as { k: SortKey; l: string }[]
                ).map(({ k, l }) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all',
                      sortKey === k
                        ? 'bg-theme-primary-start text-white border-theme-primary-start'
                        : 'border-border/40 text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {l} {sortKey === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="size-12 text-muted-foreground/30 mb-4" />
          <p className="text-base text-muted-foreground">
            Không tìm thấy đơn hàng
          </p>
          <button
            className="mt-3 text-sm font-medium text-theme-primary-start hover:underline"
            onClick={() => {
              setSearch('');
              setActiveFilter('ALL');
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard key={order.rental_order_id} order={order} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, now }: { order: DashboardOrder; now: number }) {
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const isUrgent = ['OVERDUE', 'RETURNING'].includes(order.status);
  const daysOverdue =
    order.status === 'OVERDUE'
      ? Math.floor((now - new Date(order.end_date).getTime()) / 86400000)
      : 0;

  return (
    <Link
      href={`/dashboard/orders/${order.rental_order_id}`}
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/50',
        isUrgent
          ? 'border-destructive/30 ring-1 ring-destructive/10'
          : 'border-border/20',
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          cfg.bg,
        )}
      >
        <Icon className={cn('size-5', cfg.color)} />
      </div>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-foreground">
              {order.order_code}
            </p>
            {daysOverdue > 0 && (
              <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
                +{daysOverdue}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{order.renter.full_name}</span>
            <span className="text-border">·</span>
            <span className="shrink-0">{order.renter.phone_number}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:w-40 text-sm text-muted-foreground">
          <Package className="size-3.5 shrink-0" />
          <span className="truncate">
            {order.items.map((i) => i.product_name).join(', ')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:w-40 text-sm text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span>
            {fmtDate(order.start_date)} → {fmtDate(order.end_date)}
          </span>
        </div>

        <div className="sm:w-28 sm:text-right">
          <p className="text-base font-bold text-foreground">
            {fmt(order.total_rental_fee)}
          </p>
          {order.total_penalty_amount ? (
            <p className="text-sm text-destructive font-medium">
              +{fmt(order.total_penalty_amount)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-semibold',
            cfg.color,
            cfg.bg,
            cfg.border,
          )}
        >
          <span className={cn('size-2 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {fmtRelative(order.created_at)}
        </span>
        <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors sm:ml-0 ml-auto" />
      </div>
    </Link>
  );
}
