'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Clock,
  ArrowRight,
  Truck,
  RotateCcw,
  Activity,
  Phone,
  CalendarClock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS, MOCK_CURRENT_STAFF } from '@/data/mockDashboard';
import type { DashboardOrder } from '@/types/dashboard.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng 🌅';
  if (h < 18) return 'Chào buổi chiều ☀️';
  return 'Chào buổi tối 🌙';
};

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

// ─── Chart data: 30 days (deterministic) ────────────────────────────────────
const CHART_DATA = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const weekday = d.getDay();
  const base = weekday === 0 || weekday === 6 ? 3 : 7;
  const noise = ((i * 17 + 11) % 7) - 3;
  return {
    label:
      i === 29
        ? 'Hôm nay'
        : i === 28
          ? 'Hôm qua'
          : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    count: Math.max(1, base + noise),
    isToday: i === 29,
  };
});

const URGENT_STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    dot: 'bg-amber-400',
  },
  RETURNING: {
    label: 'Cần thu hồi',
    color: 'text-destructive',
    bg: 'bg-destructive/5',
    border: 'border-destructive/25',
    dot: 'bg-destructive animate-pulse',
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    dot: 'bg-destructive animate-pulse',
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const staffName = MOCK_CURRENT_STAFF.full_name.split(' ').pop() ?? '';

  const pendingOrders = MOCK_ORDERS.filter((o) => o.status === 'PENDING');
  const deliveringOrders = MOCK_ORDERS.filter((o) => o.status === 'DELIVERING');
  const activeOrders = MOCK_ORDERS.filter((o) => o.status === 'ACTIVE');
  const returningOrders = MOCK_ORDERS.filter((o) =>
    ['RETURNING', 'OVERDUE'].includes(o.status),
  );

  const urgentOrders = [
    ...MOCK_ORDERS.filter((o) => o.status === 'OVERDUE'),
    ...MOCK_ORDERS.filter((o) => o.status === 'RETURNING'),
    ...pendingOrders,
  ].slice(0, 8);

  const totalMonth = CHART_DATA.reduce((s, d) => s + d.count, 0);
  const todayCount = CHART_DATA[CHART_DATA.length - 1].count;
  const avgCount = Math.round(totalMonth / CHART_DATA.length);
  const maxCount = Math.max(...CHART_DATA.map((x) => x.count));

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 max-w-5xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {staffName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <AlertCircle className="size-4 shrink-0" />
            {urgentOrders.length} đơn cần xử lý ngay
            <ArrowRight className="size-3.5 ml-0.5" />
          </Link>
        )}
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Chờ xác nhận"
          value={pendingOrders.length}
          icon={Clock}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
          href="/dashboard/orders?status=PENDING"
          urgent={pendingOrders.length > 0}
          hint="Cần xác nhận ngay"
        />
        <StatCard
          label="Đang giao"
          value={deliveringOrders.length}
          icon={Truck}
          colorClass="text-info"
          bgClass="bg-info-muted"
          href="/dashboard/orders?status=DELIVERING"
        />
        <StatCard
          label="Đang thuê"
          value={activeOrders.length}
          icon={Activity}
          colorClass="text-success"
          bgClass="bg-success-muted"
          href="/dashboard/orders?status=ACTIVE"
        />
        <StatCard
          label="Cần thu hồi"
          value={returningOrders.length}
          icon={RotateCcw}
          colorClass="text-destructive"
          bgClass="bg-destructive/10"
          href="/dashboard/orders?status=RETURNING"
          urgent={returningOrders.length > 0}
          hint="Cần đến lấy hàng"
        />
      </div>

      {/* ── Urgent action list ── */}
      {urgentOrders.length > 0 && (
        <section className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-destructive" />
              <h2 className="text-sm font-bold text-foreground">
                Đơn cần xử lý ngay
              </h2>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Tất cả <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {urgentOrders.map((order) => (
              <UrgentOrderRow key={order.rental_order_id} order={order} />
            ))}
          </div>
        </section>
      )}

      {/* ── Monthly Chart ── */}
      <section className="rounded-2xl border border-border/50 bg-card shadow-sm p-5">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Hoạt động 30 ngày qua
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tổng số đơn hàng theo ngày
            </p>
          </div>
          <div className="flex gap-5 sm:gap-8">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Hôm nay</p>
              <p className="text-xl font-bold text-foreground">{todayCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">30 ngày</p>
              <p className="text-xl font-bold text-foreground">{totalMonth}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">TB/ngày</p>
              <p className="text-xl font-bold text-theme-primary-start">
                {avgCount}
              </p>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-px h-24 w-full">
          {CHART_DATA.map((d, i) => {
            const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
            return (
              <div
                key={i}
                title={`${d.label}: ${d.count} đơn`}
                className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-default"
              >
                <div
                  style={{ height: `${pct}%` }}
                  className={cn(
                    'w-full rounded-t-sm min-h-0.5 transition-colors duration-150',
                    d.isToday
                      ? 'bg-theme-primary-start'
                      : 'bg-muted-foreground/20 group-hover:bg-theme-primary-start/50',
                  )}
                />
                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center pointer-events-none z-10">
                  <div className="rounded-lg bg-foreground/90 px-2 py-1 text-[10px] font-semibold text-background whitespace-nowrap shadow-lg">
                    {d.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-0.5">
          <span>{CHART_DATA[0].label}</span>
          <span>{CHART_DATA[14].label}</span>
          <span className="font-semibold text-theme-primary-start">
            Hôm nay
          </span>
        </div>

        {/* Trend note */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/20 pt-3">
          <TrendingUp className="size-3.5 text-success shrink-0" />
          Hôm nay{' '}
          <span
            className={cn(
              'font-semibold',
              todayCount >= avgCount ? 'text-success' : 'text-destructive',
            )}
          >
            {todayCount >= avgCount ? '+' : ''}
            {todayCount - avgCount} đơn so với trung bình
          </span>
        </div>
      </section>
    </div>
  );
}

function UrgentOrderRow({ order }: { order: DashboardOrder }) {
  const cfg = URGENT_STATUS_CFG[order.status] ?? URGENT_STATUS_CFG['PENDING'];
  const endDate = new Date(order.end_date);
  const now = new Date().getTime();
  const daysLeft = Math.ceil((endDate.getTime() - now) / (1000 * 60 * 60 * 24));

  return (
    <Link
      href={`/dashboard/orders/${order.rental_order_id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/60 transition-colors"
    >
      <span className={cn('size-2.5 shrink-0 rounded-full', cfg.dot)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">
            {order.order_code}
          </span>
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
              cfg.color,
              cfg.bg,
              cfg.border,
            )}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Phone className="size-2.5" /> {order.renter.full_name}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <CalendarClock className="size-2.5" />
            Hết hạn {fmtDate(order.end_date)}
            {daysLeft <= 0 && (
              <span className="text-destructive font-bold"> (quá hạn!)</span>
            )}
            {daysLeft > 0 && daysLeft <= 2 && (
              <span className="text-warning font-bold">
                {' '}
                (còn {daysLeft} ngày)
              </span>
            )}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:block">
          {order.items.length} sp · {fmt(order.total_rental_fee)}
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
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
  hint,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  href?: string;
  urgent?: boolean;
  hint?: string;
}) {
  const inner = (
    <div
      className={cn(
        'group relative rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition-all',
        href && 'hover:shadow-md hover:border-border/70 cursor-pointer',
        urgent && value > 0
          ? 'border-destructive/30 ring-1 ring-destructive/15'
          : 'border-border/40',
      )}
    >
      {urgent && value > 0 && (
        <span className="absolute top-3 right-3 size-2 rounded-full bg-destructive animate-pulse" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-2 leading-none">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {value}
          </p>
          {hint && value > 0 && (
            <p className={cn('text-[11px] font-semibold mt-1.5', colorClass)}>
              {hint}
            </p>
          )}
        </div>
        <div
          className={cn(
            'size-10 shrink-0 flex items-center justify-center rounded-xl',
            bgClass,
          )}
        >
          <Icon className={cn('size-5', colorClass)} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
