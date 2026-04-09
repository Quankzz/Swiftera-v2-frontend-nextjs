'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Truck,
  RotateCcw,
  PhoneCall,
  CalendarDays,
  Building2,
  Loader2,
  Package,
  Wrench,
  Archive,
  ChevronRight,
  Clock,
  TicketCheck,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Box,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/formatters';
import { useAuthStore } from '@/stores/auth-store';
import { getStaffDashboard } from '@/api/dashboards/staffDashboard';
import type {
  StaffDashboardData,
  OverdueOrderItem,
} from '@/api/dashboards/staffDashboard';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// ─── Inventory colour config ──────────────────────────────────────────────────
const INVENTORY_CFG = [
  {
    key: 'available' as const,
    label: 'Sẵn sàng',
    fill: '#059669',
    icon: Package,
  },
  { key: 'rented' as const, label: 'Đang thuê', fill: '#0284c7', icon: Truck },
  {
    key: 'reserved' as const,
    label: 'Đặt trước',
    fill: '#d97706',
    icon: Clock,
  },
  {
    key: 'maintenance' as const,
    label: 'Bảo trì',
    fill: '#ea580c',
    icon: Wrench,
  },
  {
    key: 'damaged' as const,
    label: 'Hỏng hóc',
    fill: '#ef4444',
    icon: ShieldAlert,
  },
  {
    key: 'retired' as const,
    label: 'Ngừng dùng',
    fill: '#6b7280',
    icon: Archive,
  },
] as const;

// ─── Overdue badge ────────────────────────────────────────────────────────────
function OverdueBadge({ days }: { days: number }) {
  const cls =
    days >= 6
      ? 'bg-destructive/15 text-destructive border-destructive/30'
      : days >= 3
        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-400/30'
        : 'bg-amber-400/15 text-amber-700 dark:text-amber-400 border-amber-400/30';
  return (
    <span
      className={cn(
        'text-[10px] font-black px-1.5 py-0.5 rounded-lg border whitespace-nowrap',
        cls,
      )}
    >
      +{days}d
    </span>
  );
}

// ─── Donut tooltip ────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-[11px] font-bold mb-0.5" style={{ color: fill }}>
        {name}
      </p>
      <p className="text-sm font-black text-foreground tabular-nums">
        {value}{' '}
        <span className="font-medium text-muted-foreground">thiết bị</span>
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(!!user?.userId);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user?.userId) return;
    let cancelled = false;
    getStaffDashboard(user.hubId ?? undefined)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.userId, user?.hubId, retryKey]);

  const staffName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Nhân viên';
  const staffAvatarUrl =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=fe1451&color=fff`;

  // ── Derived values ──────────────────────────────────────────────────────────
  const hub = data?.hubInfo;
  const tasks = data?.todayTasks;
  const overdue = data?.urgentOverdue;
  const inv = data?.hubInventoryStats;
  const tickets = data?.assignedTickets;

  const inventoryDonut = INVENTORY_CFG.map((cfg) => ({
    name: cfg.label,
    value: inv?.[cfg.key] ?? 0,
    fill: cfg.fill,
  })).filter((d) => d.value > 0);

  const ticketDonut = tickets
    ? [
        { name: 'Đang mở', value: tickets.openAssignedToMe, fill: '#ef4444' },
        {
          name: 'Đang xử lý',
          value: tickets.inProgressAssignedToMe,
          fill: '#0284c7',
        },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm font-medium">Đang tải dữ liệu…</span>
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
          <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {error}
          </p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              setRetryKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="size-4" /> Thử lại
          </button>
        </div>
      )}

      {/* ── Content ── */}
      {!isLoading && !error && data && (
        <>
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="size-14 rounded-2xl overflow-hidden ring-2 ring-[#fe1451]/25 ring-offset-2 ring-offset-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={staffAvatarUrl}
                    alt={staffName}
                    className="size-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {getGreeting()} 👋
                </p>
                <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
                  {staffName}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Building2 className="size-3 shrink-0" />
                    {hub?.hubName ?? 'Hub'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {hub?.hubCode ?? '—'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="size-3 shrink-0" />
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Urgent alert */}
            {(overdue?.count ?? 0) > 0 && (
              <Link
                href="/staff-dashboard/orders"
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/15 transition-all duration-200 shrink-0 shadow-sm shadow-destructive/10 active:scale-95"
              >
                <AlertTriangle className="size-4 animate-pulse" />
                {overdue!.count} đơn quá hạn
                <ArrowRight className="size-3.5 opacity-70" />
              </Link>
            )}
          </div>

          {/* ── Today's Task Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TaskCard
              label="Tổng nhiệm vụ hôm nay"
              value={tasks?.total ?? 0}
              icon={Box}
              accentFrom="#fe1451"
              accentTo="#ba264d"
              iconBg="bg-[#fe1451]/10"
              iconColor="#fe1451"
              href="/staff-dashboard/orders"
              urgent={(tasks?.total ?? 0) > 0}
            />
            <TaskCard
              label="Giao hàng hôm nay"
              value={tasks?.deliveriesDueToday ?? 0}
              icon={Truck}
              accentFrom="#0284c7"
              accentTo="#0ea5e9"
              iconBg="bg-sky-500/10"
              iconColor="#0284c7"
              href="/staff-dashboard/orders?type=delivery"
            />
            <TaskCard
              label="Thu hồi hôm nay"
              value={tasks?.pickupsDueToday ?? 0}
              icon={RotateCcw}
              accentFrom="#7c3aed"
              accentTo="#8b5cf6"
              iconBg="bg-violet-500/10"
              iconColor="#7c3aed"
              href="/staff-dashboard/orders?type=pickup"
            />
          </div>

          {/* ── Charts Row: Inventory Donut + Tickets ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
            {/* ─ Hub Inventory Donut ─ */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Kho thiết bị tại hub
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Phân bổ trạng thái thiết bị
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Tổng
                  </p>
                  <p className="text-2xl font-black text-foreground tabular-nums leading-none mt-0.5">
                    {inv?.totalItems ?? 0}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Donut */}
                <div className="shrink-0">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={
                          inventoryDonut.length > 0
                            ? inventoryDonut
                            : [{ name: 'Trống', value: 1, fill: '#e5e7eb' }]
                        }
                        dataKey="value"
                        innerRadius={52}
                        outerRadius={80}
                        paddingAngle={inventoryDonut.length > 1 ? 2 : 0}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {(inventoryDonut.length > 0
                          ? inventoryDonut
                          : [{ fill: '#e5e7eb' }]
                        ).map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                  {INVENTORY_CFG.map(({ key, label, fill }) => {
                    const val = inv?.[key] ?? 0;
                    const pct = inv?.totalItems
                      ? Math.round((val / inv.totalItems) * 100)
                      : 0;
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: fill }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              {label}
                            </span>
                            <span
                              className="text-xs font-black tabular-nums"
                              style={{ color: fill }}
                            >
                              {val}
                            </span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: fill,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribution strip */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex h-2 overflow-hidden rounded-full gap-px">
                  {inventoryDonut.map((entry) => {
                    const pct = inv?.totalItems
                      ? (entry.value / inv.totalItems) * 100
                      : 0;
                    return (
                      <div
                        key={entry.name}
                        className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: entry.fill,
                        }}
                        title={`${entry.name}: ${entry.value}`}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ─ Assigned Tickets ─ */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Yêu cầu hỗ trợ
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ticket được giao cho tôi
                  </p>
                </div>
                <div className="size-9 rounded-xl bg-[#fe1451]/10 flex items-center justify-center shrink-0">
                  <TicketCheck className="size-5 text-[#fe1451]" />
                </div>
              </div>

              {/* Tickets donut */}
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie
                        data={
                          ticketDonut.length > 0
                            ? ticketDonut
                            : [{ name: 'Trống', value: 1, fill: '#e5e7eb' }]
                        }
                        dataKey="value"
                        innerRadius={28}
                        outerRadius={46}
                        paddingAngle={ticketDonut.length > 1 ? 3 : 0}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {(ticketDonut.length > 0
                          ? ticketDonut
                          : [{ fill: '#e5e7eb' }]
                        ).map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <TicketStat
                    label="Đang mở"
                    value={tickets?.openAssignedToMe ?? 0}
                    color="#ef4444"
                    dot="bg-red-500 animate-pulse"
                  />
                  <TicketStat
                    label="Đang xử lý"
                    value={tickets?.inProgressAssignedToMe ?? 0}
                    color="#0284c7"
                    dot="bg-sky-500"
                  />
                </div>
              </div>

              {/* Total active */}
              <div className="mt-auto pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Tổng đang hoạt động
                  </span>
                  <span className="text-2xl font-black text-foreground tabular-nums">
                    {tickets?.totalActiveAssignedToMe ?? 0}
                  </span>
                </div>
                {(tickets?.totalActiveAssignedToMe ?? 0) > 0 && (
                  <Link
                    href="/staff-dashboard/tickets"
                    className="mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-muted hover:bg-accent text-xs font-bold text-foreground px-3 py-2 transition-colors"
                  >
                    Xem tất cả <ChevronRight className="size-3.5" />
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* ── Urgent Overdue Queue ── */}
          {(overdue?.items?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-destructive/20 bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/25 bg-destructive/4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="size-4 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground leading-none">
                      Đơn quá hạn — cần xử lý
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {overdue!.count} đơn vượt ngày trả hàng
                    </p>
                  </div>
                  <span className="flex min-w-6 h-6 px-1.5 items-center justify-center rounded-full bg-destructive text-[11px] font-black text-white shadow-sm">
                    {overdue!.count}
                  </span>
                </div>
                <Link
                  href="/staff-dashboard/orders?overdue=true"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors hover:gap-1.5"
                >
                  Xem tất cả <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-2.5 bg-muted/30 border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Đơn hàng</span>
                <span>Khách hàng</span>
                <span>Ngày hết hạn</span>
                <span>Trạng thái</span>
                <span>Trễ</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/20">
                {overdue!.items.map((item) => (
                  <OverdueRow key={item.rentalOrderId} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  label,
  value,
  icon: Icon,
  accentFrom,
  accentTo,
  iconBg,
  iconColor,
  href,
  urgent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accentFrom: string;
  accentTo: string;
  iconBg: string;
  iconColor: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative rounded-2xl border border-border/40 bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-4"
    >
      {/* Gradient left accent */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
        style={{
          background: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})`,
        }}
      />
      <div
        className={cn(
          'size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ml-1',
          iconBg,
        )}
      >
        <Icon className="size-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-4xl font-black text-foreground tabular-nums leading-none">
            {value}
          </span>
          <span className="text-sm font-medium text-muted-foreground">đơn</span>
        </div>
      </div>
      {urgent && value > 0 && (
        <span className="absolute top-3 right-3 size-2 rounded-full bg-[#fe1451] animate-pulse" />
      )}
      <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform duration-150" />
    </Link>
  );
}

// ─── Ticket Stat Row ──────────────────────────────────────────────────────────
function TicketStat({
  label,
  value,
  color,
  dot,
}: {
  label: string;
  value: number;
  color: string;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn('size-2 rounded-full shrink-0', dot)} />
        <span className="text-xs font-medium text-muted-foreground truncate">
          {label}
        </span>
      </div>
      <span
        className="text-lg font-black tabular-nums shrink-0"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Overdue Row ──────────────────────────────────────────────────────────────
function OverdueRow({ item }: { item: OverdueOrderItem }) {
  const statusLabel =
    item.status === 'IN_USE'
      ? 'Đang dùng'
      : item.status === 'PENDING_PICKUP'
        ? 'Chờ thu hồi'
        : item.status;

  const statusCls =
    item.status === 'PENDING_PICKUP'
      ? 'text-destructive bg-destructive/10 border-destructive/25'
      : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40';

  return (
    <Link
      href={`/staff-dashboard/orders/${item.rentalOrderId}`}
      className="flex sm:grid sm:grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 hover:bg-accent/40 transition-all duration-150 group"
    >
      {/* Order code */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="size-2 rounded-full bg-destructive shrink-0 animate-pulse" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {item.orderCode}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium sm:hidden">
            {item.renterFullName}
          </p>
        </div>
      </div>

      {/* Renter */}
      <div className="hidden sm:flex items-center gap-1.5 min-w-0">
        <PhoneCall className="size-3 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {item.renterFullName}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {item.renterPhone}
          </p>
        </div>
      </div>

      {/* End date */}
      <div className="hidden sm:block">
        <p className="text-xs font-semibold text-foreground">
          {fmtDate(item.expectedRentalEndDate)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <Box className="size-2.5 shrink-0" />
          {item.itemCount} sp
        </p>
      </div>

      {/* Status */}
      <div className="hidden sm:block">
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-lg border whitespace-nowrap',
            statusCls,
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Days overdue + chevron */}
      <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
        <OverdueBadge days={item.daysOverdue} />
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-150" />
      </div>
    </Link>
  );
}
