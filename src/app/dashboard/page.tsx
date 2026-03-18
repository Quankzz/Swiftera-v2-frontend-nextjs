'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  QrCode,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Boxes,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_STATS,
  MOCK_ORDERS,
  MOCK_ACTIVITY,
  MOCK_CURRENT_STAFF,
} from '@/data/mockDashboard';
import type { OrderStatus } from '@/types/dashboard.types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount,
  );

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    icon: Clock,
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: AlertCircle,
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: AlertCircle,
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  colorClass: string;
  bgClass: string;
  href?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  colorClass,
  bgClass,
  href,
}: StatCardProps) {
  const card = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/20 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border/40',
        href && 'cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn('mt-1 text-3xl font-bold tracking-tight', colorClass)}
          >
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            bgClass,
          )}
        >
          <Icon className={cn('size-5', colorClass)} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}

export default function DashboardPage() {
  //   const pendingOrders = MOCK_ORDERS.filter((o) => o.status === 'PENDING');
  const overdueOrders = MOCK_ORDERS.filter((o) => o.status === 'OVERDUE');
  const recentOrders = [...MOCK_ORDERS]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 pb-20 lg:pb-6 space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border border-teal-500/20 bg-linear-to-r from-teal-500/10 via-teal-500/5 to-transparent p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Xin chào, {MOCK_CURRENT_STAFF.full_name.split(' ').pop()}! 👋
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Hôm nay có{' '}
              <span className="font-medium text-teal-500">
                {MOCK_STATS.pending_orders} đơn hàng
              </span>{' '}
              đang chờ xử lý
              {MOCK_STATS.overdue_orders > 0 && (
                <span className="ml-1 text-red-500 font-medium">
                  và {MOCK_STATS.overdue_orders} đơn quá hạn cần xử lý ngay.
                </span>
              )}
            </p>
          </div>
          <Link
            href="/dashboard/scanner"
            className="hidden sm:flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-600 transition-colors"
          >
            <QrCode className="size-4" />
            Quét QR ngay
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Đơn hàng hôm nay"
          value={MOCK_STATS.total_orders_today}
          icon={ShoppingBag}
          trend="Từ đầu ngày"
          colorClass="text-teal-500"
          bgClass="bg-teal-500/10"
          href="/dashboard/orders"
        />
        <StatCard
          label="Chờ xử lý"
          value={MOCK_STATS.pending_orders}
          icon={Clock}
          trend="Cần xác nhận"
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
          href="/dashboard/orders"
        />
        <StatCard
          label="Đang cho thuê"
          value={MOCK_STATS.active_rentals}
          icon={Boxes}
          trend="Sản phẩm đang ra ngoài"
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <StatCard
          label="Doanh thu hôm nay"
          value={formatCurrency(MOCK_STATS.total_revenue_today)}
          icon={TrendingUp}
          trend="Tổng phí thuê & đặt cọc"
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sản phẩm sẵn sàng"
          value={MOCK_STATS.available_products}
          icon={Package}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-500/10"
          href="/dashboard/products"
        />
        <StatCard
          label="Tổng sản phẩm"
          value={MOCK_STATS.total_products}
          icon={Package}
          colorClass="text-slate-500"
          bgClass="bg-slate-500/10"
          href="/dashboard/products"
        />
        <StatCard
          label="Hợp đồng hôm nay"
          value={MOCK_STATS.contracts_today}
          icon={FileText}
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10"
          href="/dashboard/contracts"
        />
        <StatCard
          label="Đơn quá hạn"
          value={MOCK_STATS.overdue_orders}
          icon={AlertCircle}
          colorClass="text-red-500"
          bgClass="bg-red-500/10"
          href="/dashboard/orders"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-border/20 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/15 px-5 py-3.5">
            <h3 className="text-base font-semibold text-foreground">
              Đơn hàng gần đây
            </h3>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs text-teal-500 hover:text-teal-400 transition-colors font-medium"
            >
              Xem tất cả <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {recentOrders.map((order) => {
              const cfg = ORDER_STATUS_CONFIG[order.status];
              const StatusIcon = cfg.icon;
              return (
                <Link
                  key={order.order_id}
                  href={`/dashboard/orders`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {order.renter.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {order.renter.full_name}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0',
                          cfg.bg,
                          cfg.color,
                        )}
                      >
                        <StatusIcon className="size-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.order_code} · {order.items.length} sản phẩm
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">
                      {formatCurrency(order.total_rental_fee)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTime(order.created_at)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity + Quick Actions */}
        <div className="space-y-4">
          {/* Overdue Alert */}
          {overdueOrders.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-500">
                    Cảnh báo quá hạn
                  </p>
                  {overdueOrders.map((o) => (
                    <p
                      key={o.order_id}
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      {o.order_code} – {o.renter.full_name}
                    </p>
                  ))}
                  <Link
                    href="/dashboard/orders"
                    className="mt-2 inline-flex text-xs text-red-500 font-medium hover:underline"
                  >
                    Xử lý ngay →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-border/20 bg-card p-4">
            <p className="mb-3 text-base font-semibold text-foreground">
              Thao tác nhanh
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: QrCode,
                  label: 'Quét QR',
                  href: '/dashboard/scanner',
                  color: 'text-teal-500 bg-teal-500/10',
                },
                {
                  icon: ShoppingBag,
                  label: 'Đơn hàng',
                  href: '/dashboard/orders',
                  color: 'text-amber-500 bg-amber-500/10',
                },
                {
                  icon: Package,
                  label: 'Sản phẩm',
                  href: '/dashboard/products',
                  color: 'text-blue-500 bg-blue-500/10',
                },
                {
                  icon: FileText,
                  label: 'Hợp đồng',
                  href: '/dashboard/contracts',
                  color: 'text-purple-500 bg-purple-500/10',
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border/10 p-3 text-center hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg',
                      action.color.split(' ')[1],
                    )}
                  >
                    <action.icon
                      className={cn('size-4', action.color.split(' ')[0])}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-border/20 bg-card overflow-hidden">
            <div className="border-b border-border/15 px-4 py-3">
              <h3 className="text-base font-semibold text-foreground">
                Hoạt động gần đây
              </h3>
            </div>
            <div className="divide-y divide-border/10">
              {MOCK_ACTIVITY.slice(0, 4).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-teal-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatTime(activity.timestamp)} · {activity.staff_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
