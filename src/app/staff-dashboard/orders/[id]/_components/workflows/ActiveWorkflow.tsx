'use client';

import React from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Banknote,
  AlertTriangle,
  Loader2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';

interface ActiveWorkflowProps {
  order: DashboardOrder;
  onStartPickup: () => void;
  loading?: boolean;
  /** true when status is PENDING_PICKUP (vs IN_USE / OVERDUE) */
  isPendingPickup?: boolean;
}

export function ActiveWorkflow({
  order,
  onStartPickup,
  loading,
  isPendingPickup,
}: ActiveWorkflowProps) {
  const isOverdue = order.status === 'OVERDUE';
  const now = new Date().getTime();
  const daysOverdue = isOverdue
    ? Math.floor((now - new Date(order.end_date).getTime()) / 86400000)
    : 0;

  const bannerVariant = isOverdue
    ? 'danger'
    : isPendingPickup
      ? 'warning'
      : 'primary';

  const bannerDesc = isOverdue
    ? `Đơn hàng quá hạn ${daysOverdue} ngày. Cần được thu hồi ngay lập tức.`
    : isPendingPickup
      ? 'Khách hàng đã yêu cầu trả hàng. Xác nhận để bắt đầu quy trình thu hồi.'
      : 'Đơn hàng đang trong thời gian thuê. Bắt đầu thu hồi khi đến hạn trả.';

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <WorkflowBanner
        icon={isOverdue ? AlertTriangle : RotateCcw}
        title={
          isOverdue
            ? 'Đơn hàng quá hạn — Thu hồi khẩn cấp'
            : isPendingPickup
              ? 'Yêu cầu thu hồi đang chờ xử lý'
              : 'Đơn hàng đang được thuê'
        }
        desc={bannerDesc}
        variant={bannerVariant}
      />

      {/* Overdue alert */}
      {isOverdue && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/8 px-5 py-4 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-bold text-destructive">
              Quá hạn {daysOverdue} ngày
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ngày kết thúc dự kiến:{' '}
              <span className="font-semibold">{fmtDate(order.end_date)}</span>
            </p>
          </div>
          <div className="ml-auto px-3 py-1.5 rounded-xl bg-destructive/15 border border-destructive/25">
            <span className="text-sm font-black text-destructive">
              +{daysOverdue}d
            </span>
          </div>
        </div>
      )}

      {/* Main info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <User className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin khách hàng
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <User className="size-4 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Người thuê
                </p>
                <p className="text-sm font-bold text-foreground">
                  {order.renter.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <Phone className="size-4 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Điện thoại
                </p>
                <p className="text-sm font-semibold text-foreground font-mono">
                  {order.renter.phone_number}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <MapPin className="size-4 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Địa chỉ thu hồi
                </p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {order.delivery_address || order.renter.address || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rental period */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Calendar className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin đơn thuê
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  'rounded-xl px-4 py-3',
                  isOverdue ? 'bg-destructive/10' : 'bg-muted/50',
                )}
              >
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ngày bắt đầu
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtDate(order.start_date)}
                </p>
              </div>
              <div
                className={cn(
                  'rounded-xl px-4 py-3',
                  isOverdue ? 'bg-destructive/10' : 'bg-muted/50',
                )}
              >
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ngày kết thúc
                </p>
                <p
                  className={cn(
                    'text-sm font-bold',
                    isOverdue ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  {fmtDate(order.end_date)}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Package className="size-3.5" /> Số thiết bị
                </span>
                <span className="font-bold text-foreground">
                  {order.items.length} thiết bị
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Banknote className="size-3.5" /> Tiền đặt cọc
                </span>
                <span className="font-bold text-foreground">
                  {fmt(order.total_deposit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items to recover */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thiết bị cần thu hồi
            </h3>
          </div>
          <span className="text-xs font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
            {order.items.length} thiết bị
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20"
            >
              <div className="relative size-12 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Package className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {item.serial_number || '—'}
                </p>
                <p className="text-xs font-semibold text-theme-primary-start mt-1">
                  Cọc {fmt(item.deposit_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div
        className={cn(
          'rounded-2xl border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3',
          isOverdue ? 'border-destructive/30' : 'border-border',
        )}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          <span>
            {isPendingPickup
              ? 'Xác nhận để bắt đầu hành trình đến lấy hàng tại địa chỉ khách.'
              : 'Bắt đầu thu hồi khi đến địa điểm của khách hàng.'}
          </span>
        </div>
        <Button
          onClick={onStartPickup}
          disabled={loading || !isPendingPickup}
          className={cn(
            'h-12 gap-2 rounded-xl px-7 text-[15px] font-bold shrink-0 min-w-50',
            isPendingPickup && isOverdue
              ? 'bg-destructive hover:bg-destructive/90 text-white'
              : isPendingPickup
                ? 'bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <RotateCcw className="size-4" />
              {isPendingPickup ? 'Bắt đầu thu hồi' : 'Chờ yêu cầu thu hồi'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
