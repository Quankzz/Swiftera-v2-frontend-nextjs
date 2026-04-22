"use client";

/**
 * KpiCards - Hàng đầu tiên dashboard: 4 thẻ KPI.
 *
 * - Đơn hoàn thành hôm nay + so sánh với hôm qua
 * - Doanh thu thuê hôm nay
 * - Doanh thu thuê tháng này
 * - Tổng tiền đặt cọc đang giữ
 */

import {
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Banknote,
  PiggyBank,
  CalendarCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderKpi, RevenueStats } from "@/features/dashboards/types";

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtVnd(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} tr`;
  }
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="w-10 h-10 bg-gray-100 dark:bg-white/8 rounded-xl" />
      </div>
      <div className="h-8 w-24 bg-gray-200 dark:bg-white/10 rounded" />
      <div className="h-3 w-32 bg-gray-100 dark:bg-white/8 rounded" />
    </div>
  );
}

// ─── Single card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: string;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card px-5 py-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-sub font-medium">{label}</p>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            iconBg,
          )}
        >
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <p
        className={cn(
          "text-2xl font-bold tracking-tight text-text-main",
          accent,
        )}
      >
        {value}
      </p>
      {sub && <div className="text-xs text-text-sub">{sub}</div>}
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────────────────────

interface KpiCardsProps {
  orderKpi: OrderKpi;
  revenueStats: RevenueStats;
  isLoading: boolean;
}

export function KpiCards({ orderKpi, revenueStats, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  const delta = orderKpi.completedToday - orderKpi.completedYesterday;
  const deltaPositive = delta >= 0;
  const DeltaIcon = deltaPositive ? TrendingUp : TrendingDown;

  const cards: KpiCardProps[] = [
    {
      label: "Đơn hoàn thành hôm nay",
      value: orderKpi.completedToday.toString(),
      sub: (
        <span
          className={cn(
            "flex items-center gap-1 font-medium",
            deltaPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400",
          )}
        >
          <DeltaIcon size={11} />
          {deltaPositive ? "+" : ""}
          {delta} so với hôm qua ({orderKpi.completedYesterday})
        </span>
      ),
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accent: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Doanh thu thuê hôm nay",
      value: fmtVnd(revenueStats.rentalFeeToday),
      sub: `Phí phạt: ${fmtVnd(revenueStats.penaltyThisMonth)} / tháng`,
      icon: Banknote,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Doanh thu thuê tháng này",
      value: fmtVnd(revenueStats.rentalFeeThisMonth),
      sub: `${orderKpi.completedThisMonth} đơn hoàn thành`,
      icon: CalendarCheck2,
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Tổng tiền cọc đang giữ",
      value: fmtVnd(revenueStats.depositHeldActive),
      sub: undefined,
      icon: PiggyBank,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
