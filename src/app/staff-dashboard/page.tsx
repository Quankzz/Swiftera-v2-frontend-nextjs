'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  RotateCcw,
  Truck,
  Clock,
  Package,
  PhoneCall,
  CalendarDays,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_ORDERS,
  MOCK_CURRENT_STAFF,
  MOCK_HUB_INFO,
} from '@/data/mockDashboard';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmtDateShort as fmtDate } from '@/lib/formatters';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buổi sáng';
  if (h < 18) return 'Buổi chiều';
  return 'Buổi tối';
};

// ─── Weekly chart (7 days, deterministic) ─────────────────────────────────────
const WEEK_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const wd = d.getDay();
  const base = wd === 0 || wd === 6 ? 3 : 7;
  const noise = ((i * 17 + 11) % 7) - 3;
  const dayLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
  return {
    label: i === 6 ? 'Hôm nay' : dayLabel,
    count: Math.max(1, base + noise),
    isToday: i === 6,
  };
});

// ─── Urgent status config ──────────────────────────────────────────────────────
const URGENT_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-700/40',
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

  const myOrders = MOCK_ORDERS.filter(
    (o) =>
      o.staff_checkin_id === MOCK_CURRENT_STAFF.staff_id ||
      o.staff_checkout_id === MOCK_CURRENT_STAFF.staff_id,
  );

  const counts = {
    pending: myOrders.filter((o) => o.status === 'PENDING').length,
    confirmed: myOrders.filter((o) => o.status === 'CONFIRMED').length,
    delivering: myOrders.filter((o) => o.status === 'DELIVERING').length,
    active: myOrders.filter((o) => o.status === 'ACTIVE').length,
    returning: myOrders.filter((o) => o.status === 'RETURNING').length,
    overdue: myOrders.filter((o) => o.status === 'OVERDUE').length,
    completed: myOrders.filter((o) => o.status === 'COMPLETED').length,
    cancelled: myOrders.filter((o) => o.status === 'CANCELLED').length,
  };

  const urgentOrders = [
    ...myOrders.filter((o) => o.status === 'OVERDUE'),
    ...myOrders.filter((o) => o.status === 'RETURNING'),
    ...myOrders.filter((o) => o.status === 'PENDING'),
  ].slice(0, 5);

  // Chart metrics
  const todayCount = WEEK_DATA[6].count;
  const yesterdayCount = WEEK_DATA[5].count;
  const weekTotal = WEEK_DATA.reduce((s, d) => s + d.count, 0);
  const monthTotal = weekTotal * 4 + 3;
  const maxBar = Math.max(...WEEK_DATA.map((d) => d.count));

  const todayDiff = todayCount - yesterdayCount;
  const urgentTotal = counts.pending + counts.returning + counts.overdue;

  // Status breakdown (active view)
  const statusBreakdown = [
    {
      label: 'Đang hoạt động',
      count: counts.confirmed + counts.delivering + counts.active,
      color: 'bg-info',
      textColor: 'text-info',
    },
    {
      label: 'Cần xử lý',
      count: counts.pending + counts.returning + counts.overdue,
      color: 'bg-destructive',
      textColor: 'text-destructive',
    },
    {
      label: 'Hoàn thành',
      count: counts.completed,
      color: 'bg-success',
      textColor: 'text-success',
    },
    {
      label: 'Đã hủy',
      count: counts.cancelled,
      color: 'bg-muted-foreground',
      textColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {getGreeting()} 👋
          </p>
          <h1 className="text-3xl font-black text-foreground tracking-tight leading-none">
            {staffName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="size-1 rounded-full bg-border" />
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/70">
              {MOCK_HUB_INFO.name}
            </span>
          </div>
        </div>
        {urgentTotal > 0 && (
          <Link
            href="/staff-dashboard/orders"
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/15 transition-all duration-200 shrink-0 shadow-sm shadow-destructive/10 hover:shadow-md hover:shadow-destructive/15 active:scale-95"
          >
            <AlertCircle className="size-4 animate-pulse" />
            {urgentTotal} đơn cần xử lý ngay
            <ArrowRight className="size-3.5 opacity-70" />
          </Link>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <KpiCard
          label="Hôm nay"
          value={todayCount}
          unit="đơn"
          icon={Target}
          color="text-theme-primary-start"
          bg="bg-theme-primary-start/10"
          trend={todayDiff}
          trendLabel="vs hôm qua"
        />
        <KpiCard
          label="Tuần này"
          value={weekTotal}
          unit="đơn"
          icon={Activity}
          color="text-info"
          bg="bg-info-muted"
        />
        <KpiCard
          label="Tháng này"
          value={monthTotal}
          unit="đơn"
          icon={Award}
          color="text-success"
          bg="bg-success-muted"
        />
      </div>

      {/* ── Status Pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusPill
          label="Chờ xác nhận"
          count={counts.pending}
          dotClass="bg-amber-400"
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-950/30"
          borderClass="border-amber-200/80 dark:border-amber-700/30"
          icon={Clock}
          urgent={counts.pending > 0}
          href="/staff-dashboard/orders?status=PENDING"
        />
        <StatusPill
          label="Đang giao"
          count={counts.delivering}
          dotClass="bg-info animate-pulse"
          colorClass="text-info"
          bgClass="bg-info-muted"
          borderClass="border-info-border"
          icon={Truck}
          href="/staff-dashboard/orders?status=DELIVERING"
        />
        <StatusPill
          label="Đang thuê"
          count={counts.active}
          dotClass="bg-success"
          colorClass="text-success"
          bgClass="bg-success-muted"
          borderClass="border-success-border"
          icon={Package}
          href="/staff-dashboard/orders?status=ACTIVE"
        />
        <StatusPill
          label="Cần thu hồi"
          count={counts.returning + counts.overdue}
          dotClass="bg-destructive animate-pulse"
          colorClass="text-destructive"
          bgClass="bg-destructive/8"
          borderClass="border-destructive/25"
          icon={RotateCcw}
          urgent={counts.returning + counts.overdue > 0}
          href="/staff-dashboard/orders?status=RETURNING"
        />
      </div>

      {/* ── Chart + Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 7-day bar chart */}
        <section className="lg:col-span-3 rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Hoạt động 7 ngày
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Số đơn hoàn thành mỗi ngày
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Hôm nay
                </p>
                <p className="text-3xl font-black text-foreground tabular-nums leading-none mt-0.5">
                  {todayCount}
                </p>
              </div>
              <div className="w-px h-8 bg-border/60" />
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Tuần
                </p>
                <p className="text-3xl font-black text-theme-primary-start tabular-nums leading-none mt-0.5">
                  {weekTotal}
                </p>
              </div>
            </div>
          </div>

          {/* Bars */}
          <div className="flex items-end gap-2 h-32">
            {WEEK_DATA.map((d, i) => {
              const pct = maxBar > 0 ? (d.count / maxBar) * 100 : 0;
              return (
                <div
                  key={i}
                  className="group relative flex-1 flex flex-col items-center gap-2 h-full"
                >
                  <div className="flex-1 w-full flex items-end">
                    <div
                      style={{ height: `${pct}%` }}
                      className={cn(
                        'w-full rounded-t-lg min-h-1 transition-all duration-300',
                        d.isToday
                          ? 'bg-theme-primary-start shadow-md shadow-theme-primary-start/30'
                          : 'bg-muted-foreground/15 group-hover:bg-theme-primary-start/40',
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] whitespace-nowrap font-semibold leading-none',
                      d.isToday
                        ? 'text-theme-primary-start font-black'
                        : 'text-muted-foreground/70',
                    )}
                  >
                    {d.label}
                  </span>
                  {/* Hover badge */}
                  <div className="absolute bottom-full -translate-y-1 left-1/2 -translate-x-1/2 hidden group-hover:flex pointer-events-none z-10 animate-in fade-in zoom-in-75 duration-150">
                    <div className="rounded-lg bg-foreground/90 px-2 py-1 text-[11px] font-bold text-background shadow-lg whitespace-nowrap">
                      {d.count} đơn
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trend note */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
            {todayDiff >= 0 ? (
              <TrendingUp className="size-3.5 text-success shrink-0" />
            ) : (
              <TrendingDown className="size-3.5 text-destructive shrink-0" />
            )}
            Hôm nay{' '}
            <span
              className={cn(
                'font-bold',
                todayDiff >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {todayDiff >= 0 ? '+' : ''}
              {todayDiff} đơn
            </span>{' '}
            so với hôm qua
          </div>
        </section>

        {/* Right panel: breakdown */}
        <section className="lg:col-span-2 rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="mb-5">
            <h2 className="text-base font-bold text-foreground">
              Phân bổ đơn hàng
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {myOrders.length} đơn được phân công
            </p>
          </div>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-base font-black tabular-nums',
                      item.textColor,
                    )}
                  >
                    {item.count}
                  </span>
                </div>
                <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      item.color,
                    )}
                    style={{
                      width: `${myOrders.length > 0 ? (item.count / myOrders.length) * 100 : 0}%`,
                      minWidth: item.count > 0 ? '6px' : '0',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Urgent Action Queue ── */}
      {urgentOrders.length > 0 && (
        <section className="rounded-2xl border border-destructive/20 bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/25 bg-destructive/3">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="size-4 text-destructive" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-none">
                  Cần xử lý ngay
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {urgentOrders.length} đơn ưu tiên cao
                </p>
              </div>
              <span className="ml-1 flex h-6 min-w-6 px-1.5 items-center justify-center rounded-full bg-destructive text-[11px] font-black text-white shadow-sm">
                {urgentOrders.length}
              </span>
            </div>
            <Link
              href="/staff-dashboard/orders"
              className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors hover:gap-1.5"
            >
              Tất cả <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {urgentOrders.map((order) => (
              <UrgentRow key={order.rental_order_id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
  bg,
  trend,
  trendLabel,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border/40 bg-card p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top accent bar */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 rounded-t-2xl transition-opacity duration-200 group-hover:opacity-100 opacity-70',
          bg.replace('/10', '').replace('-muted', ''),
        )}
      />
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div
          className={cn(
            'size-9 flex items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110',
            bg,
          )}
        >
          <Icon className={cn('size-4.5', color)} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-foreground tabular-nums leading-none">
          {value}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {unit}
        </span>
      </div>
      {trend !== undefined && trendLabel && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2.5 text-xs font-semibold',
            trend >= 0 ? 'text-success' : 'text-destructive',
          )}
        >
          {trend >= 0 ? (
            <TrendingUp className="size-3 shrink-0" />
          ) : (
            <TrendingDown className="size-3 shrink-0" />
          )}
          {trend >= 0 ? '+' : ''}
          {trend} {trendLabel}
        </div>
      )}
    </div>
  );
}

function StatusPill({
  label,
  count,
  colorClass,
  bgClass,
  borderClass,
  icon: Icon,
  urgent,
  href,
}: {
  label: string;
  count: number;
  dotClass: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ElementType;
  urgent?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-2 rounded-2xl border px-4 py-3.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        bgClass,
        borderClass,
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className={cn('size-4 shrink-0', colorClass)} />
        {urgent && count > 0 && (
          <span className="size-2 rounded-full bg-destructive shrink-0 animate-pulse" />
        )}
      </div>
      <div>
        <p
          className={cn(
            'text-3xl font-black tabular-nums leading-none',
            colorClass,
          )}
        >
          {count}
        </p>
        <p
          className={cn(
            'text-xs font-semibold mt-1 leading-tight',
            colorClass,
            'opacity-80',
          )}
        >
          {label}
        </p>
      </div>
    </Link>
  );
}

// ─── Urgent Row ───────────────────────────────────────────────────────────────
function UrgentRow({ order }: { order: DashboardOrder }) {
  const [now] = useState(() => Date.now());
  const cfg = URGENT_CFG[order.status] ?? URGENT_CFG['PENDING'];
  const daysLeft = Math.ceil(
    (new Date(order.end_date).getTime() - now) / 86_400_000,
  );

  return (
    <Link
      href={`/staff-dashboard/orders/${order.rental_order_id}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-all duration-150 group"
    >
      <span className={cn('size-2.5 shrink-0 rounded-full', cfg.dot)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground">
            {order.order_code}
          </span>
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-lg border',
              cfg.color,
              cfg.bg,
              cfg.border,
            )}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
          <PhoneCall className="size-3 shrink-0" />
          <span className="font-medium">{order.renter.full_name}</span>
          <span className="text-border">·</span>
          <CalendarDays className="size-3 shrink-0" />
          Hết hạn {fmtDate(order.end_date)}
          {daysLeft <= 0 && (
            <span className="text-destructive font-bold">(quá hạn!)</span>
          )}
          {daysLeft > 0 && daysLeft <= 2 && (
            <span className="text-warning font-bold">(còn {daysLeft}d)</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground hidden sm:block bg-muted px-2 py-1 rounded-lg">
          {order.items.length} sp
        </span>
        <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-150" />
      </div>
    </Link>
  );
}
