"use client";

/**
 * OverdueTable - Hàng thứ ba (phải 50%):
 * Bảng đơn hàng quá hạn từ overdueOrders.topItems.
 */

import { AlertTriangle } from "lucide-react";
import type {
  OverdueOrders,
  OverdueOrderItem,
} from "@/features/dashboards/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysOverdue(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  IN_USE: {
    label: "Đang dùng",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  PENDING_PICKUP: {
    label: "Chờ thu hồi",
    cls: "bg-orange-100  text-orange-700  dark:bg-orange-900/30  dark:text-orange-400",
  },
  PICKING_UP: {
    label: "Đang thu",
    cls: "bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABEL[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-4 bg-gray-100 dark:bg-white/8 rounded w-24" />
          <div className="h-4 bg-gray-100 dark:bg-white/8 rounded flex-1" />
          <div className="h-4 bg-gray-100 dark:bg-white/8 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function Row({ item }: { item: OverdueOrderItem }) {
  const overdue = daysOverdue(item.expectedRentalEndDate);

  return (
    <tr className="border-b border-gray-100 dark:border-white/6 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
      {/* Mã đơn */}
      <td className="py-2.5 px-3 text-xs">
        <span className="font-mono bg-gray-100 dark:bg-white/8 text-text-main rounded px-1.5 py-0.5">
          {item.orderCode}
        </span>
      </td>

      {/* Khách hàng */}
      <td className="py-2.5 px-3">
        <p className="text-xs font-medium text-text-main leading-tight">
          {item.renterFullName}
        </p>
        <p className="text-[10px] text-text-sub">{item.renterPhone}</p>
      </td>

      {/* Trạng thái */}
      <td className="py-2.5 px-3">
        <StatusBadge status={item.status} />
      </td>

      {/* Hạn trả */}
      <td className="py-2.5 px-3 text-right">
        <p className="text-xs text-text-main">
          {fmtDate(item.expectedRentalEndDate)}
        </p>
        {overdue > 0 && (
          <p className="text-[10px] font-semibold text-red-500">
            +{overdue} ngày
          </p>
        )}
      </td>

      {/* SL */}
      <td className="py-2.5 px-3 text-right text-xs font-semibold text-text-main">
        {item.itemCount}
      </td>
    </tr>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface OverdueTableProps {
  overdueOrders: OverdueOrders;
  isLoading: boolean;
}

export function OverdueTable({ overdueOrders, isLoading }: OverdueTableProps) {
  const sorted = [...(overdueOrders.topItems ?? [])].sort(
    (a, b) =>
      new Date(a.expectedRentalEndDate).getTime() -
      new Date(b.expectedRentalEndDate).getTime(),
  );

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-main">Đơn quá hạn</p>
            <p className="text-xs text-text-sub">
              {isLoading ? "…" : `${overdueOrders.count} đơn`}
            </p>
          </div>
        </div>
        {!isLoading && overdueOrders.count > 0 && (
          <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-2.5 py-0.5">
            {overdueOrders.count} tổng
          </span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <p className="text-2xl">🎉</p>
          <p className="text-sm font-medium text-text-main">
            Không có đơn quá hạn
          </p>
          <p className="text-xs text-text-sub">
            Tuyệt vời! Mọi đơn đang đúng hạn.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="pb-2 px-3 text-[10px] uppercase tracking-wider text-text-sub font-semibold">
                  Mã đơn
                </th>
                <th className="pb-2 px-3 text-[10px] uppercase tracking-wider text-text-sub font-semibold">
                  Khách hàng
                </th>
                <th className="pb-2 px-3 text-[10px] uppercase tracking-wider text-text-sub font-semibold">
                  Trạng thái
                </th>
                <th className="pb-2 px-3 text-right text-[10px] uppercase tracking-wider text-text-sub font-semibold">
                  Hạn trả
                </th>
                <th className="pb-2 px-3 text-right text-[10px] uppercase tracking-wider text-text-sub font-semibold">
                  SL
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <Row key={item.rentalOrderId} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
