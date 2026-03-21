'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  RotateCcw,
  Coins,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_STATS, MOCK_ORDERS, MOCK_ACTIVITY } from '@/data/mockDashboard';
import type { OrderStatus, ActivityLog } from '@/types/dashboard.types';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
};

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
    dot: 'bg-muted-foreground',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-theme-primary-start',
    bg: 'bg-theme-primary-start/10',
    border: 'border-theme-primary-start/25',
    dot: 'bg-theme-primary-start',
  },
  DELIVERING: {
    label: 'Đang giao',
    color: 'text-info',
    bg: 'bg-info-muted',
    border: 'border-info-border',
    dot: 'bg-info animate-pulse',
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
  },
  RETURNING: {
    label: 'Đang trả',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/25',
    dot: 'bg-destructive animate-pulse',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    dot: 'bg-muted-foreground',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive',
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive animate-pulse',
  },
};

const ACTIVITY_TYPE_CONFIG: Record<
  ActivityLog['type'],
  { icon: React.ElementType; color: string }
> = {
  ORDER_CREATED: { icon: ShoppingBag, color: 'text-theme-primary-start' },
  ORDER_CONFIRMED: { icon: CheckCircle2, color: 'text-theme-primary-start' },
  ORDER_DELIVERING: { icon: Truck, color: 'text-info' },
  ORDER_ACTIVE: { icon: Activity, color: 'text-success' },
  ORDER_RETURNING: { icon: RotateCcw, color: 'text-destructive' },
  ORDER_COMPLETED: { icon: CheckCircle2, color: 'text-muted-foreground' },
  ORDER_OVERDUE: { icon: AlertCircle, color: 'text-destructive' },
  PHOTO_UPLOADED: { icon: Package, color: 'text-theme-primary-start' },
  LOCATION_UPDATED: { icon: TrendingUp, color: 'text-muted-foreground' },
  DEPOSIT_REFUNDED: { icon: Coins, color: 'text-success' },
  PENALTY_APPLIED: { icon: AlertCircle, color: 'text-destructive' },
};

export default function DashboardPage() {
  const recentOrders = [...MOCK_ORDERS]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const urgentOrders = MOCK_ORDERS.filter(
    (o) => o.status === 'OVERDUE' || o.status === 'RETURNING',
  );

  return (
    <div className="flex flex-col gap-8 p-5 md:p-8">
      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Chào buổi sáng 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {urgentOrders.length > 0 && (
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{urgentOrders.length} đơn cần chú ý ngay</span>
            <ArrowRight className="size-4 ml-auto" />
          </Link>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Đơn hôm nay"
          value={MOCK_STATS.total_orders}
          icon={ShoppingBag}
          colorClass="text-theme-primary-start"
          bgClass="bg-theme-primary-start/10"
          href="/dashboard/orders"
        />
        <StatCard
          label="Đang giao"
          value={MOCK_STATS.delivering_orders}
          icon={Truck}
          colorClass="text-info"
          bgClass="bg-info-muted"
          href="/dashboard/orders"
        />
        <StatCard
          label="Quá hạn"
          value={MOCK_STATS.overdue_orders}
          icon={AlertCircle}
          colorClass="text-destructive"
          bgClass="bg-destructive/10"
          href="/dashboard/orders"
          urgent={MOCK_STATS.overdue_orders > 0}
        />
        <StatCard
          label="Sản phẩm sẵn"
          value={`${MOCK_STATS.available_products}/${MOCK_STATS.total_products}`}
          icon={Package}
          colorClass="text-success"
          bgClass="bg-success-muted"
          href="/dashboard/products"
        />
      </div>

      {/* ── Revenue strip ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/30 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1.5">
            Doanh thu hôm nay
          </p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(MOCK_STATS.total_revenue_today)}
          </p>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <TrendingUp className="size-4 text-success" />
            <span className="text-success font-semibold">+12%</span>{' '}
            so với hôm qua
          </p>
        </div>
        <div className="rounded-2xl border border-border/30 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1.5">Cọc đang giữ</p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(MOCK_STATS.total_deposit_held)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {MOCK_STATS.rented_products} sản phẩm đang cho thuê
          </p>
        </div>
      </div>

      {/* ── Two columns: Recent Orders + Activity ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
            <h3 className="text-base font-bold text-foreground">
              Đơn hàng gần nhất
            </h3>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1.5 text-sm font-medium text-theme-primary-start hover:underline"
            >
              Xem tất cả <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {recentOrders.map((order) => {
              const cfg = ORDER_STATUS_CONFIG[order.status];
              return (
                <Link
                  key={order.rental_order_id}
                  href={`/dashboard/orders/${order.rental_order_id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/50 transition-colors"
                >
                  <span
                    className={cn('size-2.5 shrink-0 rounded-full', cfg.dot)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.order_code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {order.renter.full_name} · {order.items.length} sản phẩm
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-lg border',
                        cfg.color,
                        cfg.bg,
                        cfg.border,
                      )}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(order.created_at)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity log */}
        <div className="rounded-2xl border border-border/30 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
            <h3 className="text-base font-bold text-foreground">
              Hoạt động gần đây
            </h3>
            <Clock className="size-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border/20">
            {MOCK_ACTIVITY.slice(0, 6).map((act) => {
              const cfg = ACTIVITY_TYPE_CONFIG[act.type] ?? {
                icon: Activity,
                color: 'text-muted-foreground',
              };
              const Icon = cfg.icon;
              return (
                <div key={act.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className={cn(
                      'mt-0.5 size-8 shrink-0 rounded-lg flex items-center justify-center bg-muted',
                      cfg.color,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      {act.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {act.staff_name} · {formatRelativeTime(act.created_at)}
                    </p>
                  </div>
                  {act.order_id && (
                    <Link
                      href={`/dashboard/orders/${act.order_id}`}
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                      Chi tiết
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  href,
  urgent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  href?: string;
  urgent?: boolean;
}) {
  const inner = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/20 bg-card p-5 shadow-sm transition-all',
        href && 'cursor-pointer hover:shadow-md hover:border-border/40',
        urgent && 'border-destructive/30 ring-1 ring-destructive/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1.5">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl',
            bgClass,
          )}
        >
          <Icon className={cn('size-5', colorClass)} />
        </div>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
