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
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StaffOrder } from '@/types/api.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { WorkflowFooter } from '../WorkflowFooter';

interface ActiveWorkflowProps {
  order: StaffOrder;
  onStartPickup: () => void;
  loading?: boolean;
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
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Banner */}
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
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-5 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-destructive">
                Quá hạn {daysOverdue} ngày
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ngày kết thúc dự kiến:{' '}
                <span className="font-semibold text-foreground">
                  {fmtDate(order.end_date)}
                </span>
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-destructive/15 border border-destructive/25 shrink-0">
              <span className="text-lg font-black text-destructive">
                +{daysOverdue}d
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Customer + Rental info */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Customer info */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <User className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Thông tin khách hàng
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <User className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Người thuê
                    </p>
                    <p className="text-[15px] font-bold text-foreground truncate">
                      {order.renter.full_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <Phone className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Điện thoại
                    </p>
                    <p className="text-[15px] font-bold text-foreground font-mono tracking-wide">
                      {order.renter.phone_number}
                    </p>
                  </div>
                </div>
                {order.renter.email && (
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                      <Mail className="size-5 text-theme-primary-start dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-[15px] font-medium text-foreground truncate">
                        {order.renter.email}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4 pt-3 border-t border-border/60 dark:border-slate-800">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <MapPin className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Địa chỉ thu hồi
                    </p>
                    <p className="text-[15px] font-medium text-foreground leading-relaxed whitespace-normal">
                      {order.delivery_address || order.renter.address || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental period */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <Calendar className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Thông tin đơn thuê
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      'rounded-xl px-4 py-3 border',
                      isOverdue
                        ? 'bg-destructive/8 border-destructive/20 dark:bg-destructive/10'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-border/60 dark:border-slate-700',
                    )}
                  >
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Ngày bắt đầu
                    </p>
                    <p className="text-[15px] font-bold text-foreground">
                      {fmtDate(order.start_date)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'rounded-xl px-4 py-3 border',
                      isOverdue
                        ? 'bg-destructive/8 border-destructive/20 dark:bg-destructive/10'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-border/60 dark:border-slate-700',
                    )}
                  >
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Ngày kết thúc
                    </p>
                    <p
                      className={cn(
                        'text-[15px] font-bold',
                        isOverdue ? 'text-destructive' : 'text-foreground',
                      )}
                    >
                      {fmtDate(order.end_date)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-3">
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                    <span className="text-[14px] font-medium text-muted-foreground flex items-center gap-2">
                      <Package className="size-4" /> Số thiết bị
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {order.items.length} thiết bị
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-muted-foreground flex items-center gap-2">
                      <Banknote className="size-4" /> Tiền đặt cọc
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(order.total_deposit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Items to recover */}
          <div className="lg:col-span-5 flex flex-col h-[28rem] lg:h-auto">
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Package className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Thiết bị cần thu hồi
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold bg-background dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground px-2.5 py-1.5 rounded-lg shadow-sm">
                  {order.items.length} thiết bị
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20">
                {order.items.map((item) => (
                  <div
                    key={item.rental_order_item_id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/50 hover:border-theme-primary-start/50 hover:shadow-md transition-all group"
                  >
                    <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
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
                      <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug">
                        {item.product_name}
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block px-2 py-0.5 rounded-md mt-1.5 truncate max-w-full">
                        {item.serial_number || 'SN: Chưa cập nhật'}
                      </span>
                      <p className="text-[13px] font-bold text-theme-primary-start dark:text-blue-400 mt-1.5">
                        Cọc: {fmt(item.deposit_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WorkflowFooter>
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[14px] text-muted-foreground flex-1 min-w-0">
            <Clock className="size-5 shrink-0" />
            <span className="truncate">
              {isPendingPickup
                ? 'Xác nhận để bắt đầu hành trình đến lấy hàng tại địa chỉ khách.'
                : 'Bắt đầu thu hồi khi đến địa điểm của khách hàng.'}
            </span>
          </div>
          <Button
            onClick={onStartPickup}
            disabled={loading || !isPendingPickup}
            className={cn(
              'h-16 gap-2 rounded-xl px-7 text-xl font-bold shrink-0 sm:min-w-52',
              isPendingPickup && isOverdue
                ? 'bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20'
                : isPendingPickup
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 dark:bg-orange-500 dark:hover:bg-orange-600'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <RotateCcw className="size-5" />{' '}
                {isPendingPickup ? 'Bắt đầu thu hồi' : 'Chờ yêu cầu thu hồi'}
              </>
            )}
          </Button>
        </div>
      </WorkflowFooter>
    </>
  );
}
