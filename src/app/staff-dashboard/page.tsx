'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  ChevronRight,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmtDateShort as fmtDate } from '@/lib/formatters';
import { useAuthStore } from '@/stores/auth-store';
import { getStaffOrders } from '@/api/staff-orders';
import { getHubById } from '@/api/hubs';
import type { HubResponse } from '@/api/hubs';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// ─── Weekly chart data (7 days, deterministic — 2 series) ──────────────────
const WEEK_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const wd = d.getDay();
  const base = wd === 0 || wd === 6 ? 3 : 7;
  const noise1 = ((i * 17 + 11) % 7) - 3;
  const noise2 = ((i * 13 + 7) % 6) - 2;
  const dayLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
  const completed = Math.max(1, base + noise1);
  return {
    label: i === 6 ? 'Hôm nay' : dayLabel,
    completed,
    newOrders: Math.max(0, completed - 1 + noise2),
    isToday: i === 6,
  };
});

// ─── Urgent status config ─────────────────────────────────────────────────────
const URGENT_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PAID: {
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

// ─── Chart tooltip components ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedEntry = payload.find((p: any) => p.dataKey === 'completed');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newEntry = payload.find((p: any) => p.dataKey === 'newOrders');
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3.5 py-3 shadow-xl backdrop-blur-sm min-w-37">
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2.5">
        {label}
      </p>
      {completedEntry && (
        <div className="flex items-center justify-between gap-4 text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: '#fe1451' }}
            />
            <span className="text-muted-foreground">Hoàn thành</span>
          </div>
          <span className="font-black tabular-nums text-foreground">
            {completedEntry.value}
          </span>
        </div>
      )}
      {newEntry && (
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: '#0284c7' }}
            />
            <span className="text-muted-foreground">Đơn mới</span>
          </div>
          <span className="font-black tabular-nums text-foreground">
            {newEntry.value}
          </span>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 shadow-xl backdrop-blur-sm">
      <p
        className="text-[11px] font-bold mb-1"
        style={{ color: payload[0].payload.fill }}
      >
        {payload[0].payload.name}
      </p>
      <p className="text-sm font-black text-foreground">
        {payload[0].value}{' '}
        <span className="font-medium text-muted-foreground">đơn</span>
      </p>
    </div>
  );
}

// Custom dot — highlights today's point on the area chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TodayDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload?.isToday) return <g />;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#fe1451" fillOpacity={0.12} />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#fe1451"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myOrders, setMyOrders] = useState<DashboardOrder[]>([]);
  const [hubInfo, setHubInfo] = useState<HubResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getStaffOrders(user.userId)
      .then((orders) => {
        setMyOrders(orders);
        // Fetch the hub for the first order found (staff's assigned hub)
        const hubId = orders[0]?.hub_id ?? user.hubId;
        if (hubId) {
          return getHubById(hubId).then((hub) => setHubInfo(hub));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.userId]);

  const staffName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Nhân viên';
  const staffAvatarUrl =
    user?.avatarUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(staffName)}&background=fe1451&color=fff`;
  const hubName = hubInfo ? hubInfo.name : (user?.hubId ?? 'Hub');

  const counts = {
    paid: myOrders.filter((o) => o.status === 'PAID').length,
    preparing: myOrders.filter((o) => o.status === 'PREPARING').length,
    delivering: myOrders.filter((o) => o.status === 'DELIVERING').length,
    delivered: myOrders.filter((o) => o.status === 'DELIVERED').length,
    inUse: myOrders.filter((o) => o.status === 'IN_USE').length,
    overdue: myOrders.filter((o) => o.status === 'OVERDUE').length,
    pendingPickup: myOrders.filter((o) => o.status === 'PENDING_PICKUP').length,
    pickingUp: myOrders.filter((o) => o.status === 'PICKING_UP').length,
    pickedUp: myOrders.filter((o) => o.status === 'PICKED_UP').length,
    inspecting: myOrders.filter((o) => o.status === 'INSPECTING').length,
    completed: myOrders.filter((o) => o.status === 'COMPLETED').length,
  };

  const urgentOrders = [
    ...myOrders.filter((o) => o.status === 'OVERDUE'),
    ...myOrders.filter((o) => o.status === 'PENDING_PICKUP'),
    ...myOrders.filter((o) => o.status === 'PAID'),
  ].slice(0, 5);

  const todayCount = WEEK_DATA[6].completed;
  const yesterdayCount = WEEK_DATA[5].completed;
  const weekTotal = WEEK_DATA.reduce((s, d) => s + d.completed, 0);
  const monthTotal = weekTotal * 4 + 3;
  const avgCompleted = Math.round(weekTotal / WEEK_DATA.length);
  const todayDiff = todayCount - yesterdayCount;
  const urgentTotal = counts.paid + counts.pendingPickup + counts.overdue;

  const statusBarData = [
    {
      name: 'Đang giao & thuê',
      value: counts.preparing + counts.delivering + counts.inUse,
      fill: '#0284c7',
    },
    {
      name: 'Cần xử lý',
      value: counts.paid + counts.pendingPickup + counts.overdue,
      fill: '#ef4444',
    },
    { name: 'Hoàn thành', value: counts.completed, fill: '#059669' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderBarLabel = (props: any): React.ReactElement => {
    const { x, y, width: w, height: h, value, index } = props;
    const entry = statusBarData[index as number];
    if (!entry || value === 0) return <></>;
    return (
      <text
        x={Number(x) + Number(w) + 8}
        y={Number(y) + Number(h) / 2}
        fill={entry.fill}
        fontSize={13}
        fontWeight={800}
        dominantBaseline="middle"
        textAnchor="start"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {isLoading && (
        <div className="flex items-center justify-center min-h-[30vh] gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <span>Đang tải dữ liệu…</span>
        </div>
      )}
      {!isLoading && (
        <>
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <div className="size-14 rounded-2xl overflow-hidden ring-2 ring-theme-primary-start/25 ring-offset-2 ring-offset-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={staffAvatarUrl}
                    alt={staffName}
                    className="size-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-success" />
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
                    {hubName}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="size-3 shrink-0" />
                    {new Date().toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {urgentTotal > 0 && (
              <Link
                href="/staff-dashboard/orders"
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/15 transition-all duration-200 shrink-0 shadow-sm shadow-destructive/10 active:scale-95"
              >
                <AlertCircle className="size-4 animate-pulse" />
                {urgentTotal} đơn cần xử lý ngay
                <ArrowRight className="size-3.5 opacity-70" />
              </Link>
            )}
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Hôm nay"
              value={todayCount}
              unit="đơn"
              icon={Target}
              accentFrom="#fe1451"
              accentTo="#ba264d"
              iconBg="bg-theme-primary-start/10"
              iconColor="text-theme-primary-start"
              trend={todayDiff}
              trendLabel="vs hôm qua"
            />
            <KpiCard
              label="Tuần này"
              value={weekTotal}
              unit="đơn"
              icon={Activity}
              accentFrom="#0284c7"
              accentTo="#0ea5e9"
              iconBg="bg-info/10"
              iconColor="text-info"
            />
            <KpiCard
              label="Tháng này"
              value={monthTotal}
              unit="đơn"
              icon={Award}
              accentFrom="#059669"
              accentTo="#10b981"
              iconBg="bg-success/10"
              iconColor="text-success"
            />
            <KpiCard
              label="Hoàn thành"
              value={counts.completed}
              unit="đơn"
              icon={CheckCircle2}
              accentFrom="#7c3aed"
              accentTo="#8b5cf6"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* ── Status Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatusCard
              label="Chờ xác nhận"
              count={counts.paid}
              icon={Clock}
              colorClass="text-amber-600 dark:text-amber-400"
              bgClass="bg-amber-50 dark:bg-amber-950/30"
              borderClass="border-amber-200/80 dark:border-amber-700/30"
              dotClass="bg-amber-400"
              urgent={counts.paid > 0}
              href="/staff-dashboard/orders?status=PAID"
            />
            <StatusCard
              label="Đang giao"
              count={counts.delivering}
              icon={Truck}
              colorClass="text-info"
              bgClass="bg-info/8"
              borderClass="border-info/20"
              dotClass="bg-info"
              href="/staff-dashboard/orders?status=DELIVERING"
            />
            <StatusCard
              label="Đang thuê"
              count={counts.inUse}
              icon={Package}
              colorClass="text-success"
              bgClass="bg-success/8"
              borderClass="border-success/20"
              dotClass="bg-success"
              href="/staff-dashboard/orders?status=IN_USE"
            />
            <StatusCard
              label="Cần thu hồi"
              count={counts.pendingPickup + counts.overdue}
              icon={RotateCcw}
              colorClass="text-destructive"
              bgClass="bg-destructive/8"
              borderClass="border-destructive/25"
              dotClass="bg-destructive"
              urgent={counts.pendingPickup + counts.overdue > 0}
              href="/staff-dashboard/orders?status=PENDING_PICKUP"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
            {/* ─ Area chart: 7-day trend (2 series) ─ */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Xu hướng 7 ngày
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Đơn hoàn thành &amp; đơn mới theo ngày
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Hôm nay
                    </p>
                    <p className="text-2xl font-black text-foreground tabular-nums leading-none mt-0.5">
                      {todayCount}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border/60" />
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Tuần
                    </p>
                    <p
                      className="text-2xl font-black tabular-nums leading-none mt-0.5"
                      style={{ color: '#fe1451' }}
                    >
                      {weekTotal}
                    </p>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={164}>
                <AreaChart
                  data={WEEK_DATA}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gradCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#fe1451"
                        stopOpacity={0.28}
                      />
                      <stop offset="92%" stopColor="#fe1451" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                      <stop offset="92%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    strokeOpacity={0.07}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: 'currentColor',
                      fillOpacity: 0.55,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickCount={4}
                    tick={{
                      fontSize: 10,
                      fill: 'currentColor',
                      fillOpacity: 0.45,
                    }}
                  />
                  <RechartsTooltip content={<AreaTooltip />} />
                  <ReferenceLine
                    y={avgCompleted}
                    stroke="#fe1451"
                    strokeDasharray="4 3"
                    strokeOpacity={0.45}
                    strokeWidth={1.5}
                    label={{
                      value: `TB ${avgCompleted}`,
                      position: 'insideTopRight',
                      offset: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      fill: '#fe1451',
                      fillOpacity: 0.8,
                    }}
                  />
                  {/* newOrders area — behind completed */}
                  <Area
                    type="monotone"
                    dataKey="newOrders"
                    name="Đơn mới"
                    stroke="#0284c7"
                    strokeWidth={1.8}
                    fill="url(#gradNew)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      stroke: 'white',
                      fill: '#0284c7',
                    }}
                  />
                  {/* completed area — on top, with custom today dot */}
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Hoàn thành"
                    stroke="#fe1451"
                    strokeWidth={2.5}
                    fill="url(#gradCompleted)"
                    dot={<TodayDot />}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: 'white',
                      fill: '#fe1451',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Legend + trend footer */}
              <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: '#fe1451' }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Hoàn thành
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: '#0284c7' }}
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      Đơn mới
                    </span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs shrink-0">
                  {todayDiff >= 0 ? (
                    <TrendingUp className="size-3.5 text-success shrink-0" />
                  ) : (
                    <TrendingDown className="size-3.5 text-destructive shrink-0" />
                  )}
                  <span
                    className={cn(
                      'font-bold',
                      todayDiff >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {todayDiff >= 0 ? '+' : ''}
                    {todayDiff}
                  </span>
                  <span className="text-muted-foreground">vs hôm qua</span>
                </div>
              </div>
            </section>

            {/* ─ Horizontal bar chart: status breakdown ─ */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Trạng thái đơn hàng
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {myOrders.length} đơn được phân công
                  </p>
                </div>
                <span className="text-2xl font-black text-foreground tabular-nums">
                  {myOrders.length}
                </span>
              </div>

              <div className="flex-1">
                <ResponsiveContainer width="100%" height={164}>
                  <BarChart
                    data={statusBarData}
                    layout="vertical"
                    margin={{ top: 4, right: 32, left: 4, bottom: 4 }}
                    barCategoryGap="26%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="currentColor"
                      strokeOpacity={0.06}
                    />
                    <XAxis
                      type="number"
                      hide
                      domain={[0, (v: number) => v + 2]}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={98}
                      tick={{
                        fontSize: 11,
                        fontWeight: 600,
                        fill: 'currentColor',
                        fillOpacity: 0.65,
                      }}
                    />
                    <RechartsTooltip
                      content={<HBarTooltip />}
                      cursor={{ fill: 'currentColor', fillOpacity: 0.04 }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                      {statusBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        content={renderBarLabel}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Proportional distribution strip */}
              <div className="mt-auto pt-4 border-t border-border/30">
                <div className="flex h-2.5 overflow-hidden rounded-full gap-px">
                  {statusBarData
                    .filter((d) => d.value > 0)
                    .map((entry) => {
                      const pct =
                        myOrders.length > 0
                          ? (entry.value / myOrders.length) * 100
                          : 0;
                      return (
                        <div
                          key={entry.name}
                          className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: entry.fill,
                          }}
                          title={`${entry.name}: ${entry.value} đơn`}
                        />
                      );
                    })}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {statusBarData
                    .filter((d) => d.value > 0)
                    .map((entry) => {
                      const pct =
                        myOrders.length > 0
                          ? Math.round((entry.value / myOrders.length) * 100)
                          : 0;
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center gap-1"
                        >
                          <span
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.fill }}
                          />
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          </div>

          {/* ── Urgent Action Queue ── */}
          {urgentOrders.length > 0 && (
            <section className="rounded-2xl border border-destructive/20 bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/25 bg-destructive/4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
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
                  <span className="flex min-w-6 h-6 px-1.5 items-center justify-center rounded-full bg-destructive text-[11px] font-black text-white shadow-sm">
                    {urgentOrders.length}
                  </span>
                </div>
                <Link
                  href="/staff-dashboard/orders"
                  className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors hover:gap-1.5"
                >
                  Xem tất cả <ChevronRight className="size-3.5" />
                </Link>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/20">
                {urgentOrders.map((order) => (
                  <UrgentRow key={order.rental_order_id} order={order} />
                ))}
              </div>
            </section>
          )}
        </>
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
  accentFrom,
  accentTo,
  iconBg,
  iconColor,
  trend,
  trendLabel,
}: {
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  accentFrom: string;
  accentTo: string;
  iconBg: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Gradient top accent */}
      <div
        className="absolute inset-x-0 top-0 h-0.75 rounded-t-2xl"
        style={{
          background: `linear-gradient(to right, ${accentFrom}, ${accentTo})`,
        }}
      />
      <div className="flex items-center justify-between mb-3 mt-0.5">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <div
          className={cn(
            'size-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
            iconBg,
          )}
        >
          <Icon className={cn('size-4', iconColor)} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
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
            'flex items-center gap-1 mt-2 text-xs font-semibold',
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

// ─── Status Card ──────────────────────────────────────────────────────────────
function StatusCard({
  label,
  count,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
  dotClass,
  urgent,
  href,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  urgent?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border px-4 py-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
        bgClass,
        borderClass,
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'size-9 rounded-xl flex items-center justify-center',
            bgClass,
          )}
        >
          <Icon className={cn('size-5', colorClass)} />
        </div>
        {urgent && count > 0 && (
          <span
            className={cn(
              'size-2 rounded-full shrink-0 animate-pulse',
              dotClass,
            )}
          />
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
            'text-xs font-semibold mt-1.5 leading-tight opacity-80',
            colorClass,
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
  const cfg = URGENT_CFG[order.status] ?? URGENT_CFG['PAID'];
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
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            {order.order_code}
          </span>
          <span
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-lg border whitespace-nowrap',
              cfg.color,
              cfg.bg,
              cfg.border,
            )}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
          <PhoneCall className="size-3 shrink-0" />
          <span className="font-medium whitespace-nowrap">
            {order.renter.full_name}
          </span>
          <span className="text-border hidden sm:inline">·</span>
          <CalendarDays className="size-3 shrink-0 hidden sm:inline" />
          <span className="whitespace-nowrap hidden sm:inline">
            Hết hạn {fmtDate(order.end_date)}
          </span>
          {daysLeft <= 0 && (
            <span className="text-destructive font-bold whitespace-nowrap">
              (quá hạn!)
            </span>
          )}
          {daysLeft > 0 && daysLeft <= 2 && (
            <span className="text-warning font-bold whitespace-nowrap">
              (còn {daysLeft}d)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground hidden sm:block bg-muted px-2 py-1 rounded-lg">
          {order.items.length} sp
        </span>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-150" />
      </div>
    </Link>
  );
}
