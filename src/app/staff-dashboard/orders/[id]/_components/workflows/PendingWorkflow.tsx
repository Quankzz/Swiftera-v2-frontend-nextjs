'use client';

import React from 'react';
import Image from 'next/image';
import {
  ClipboardCheck,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Banknote,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';

interface PendingWorkflowProps {
  order: DashboardOrder;
  onConfirm: () => void;
  loading?: boolean;
}

export function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: PendingWorkflowProps) {
  return (
    <div className="space-y-4">
      {/* Status banner */}
      <WorkflowBanner
        icon={ClipboardCheck}
        title="Xác nhận tiếp nhận đơn hàng"
        desc="Đơn hàng đã được thanh toán và chờ nhân viên xác nhận. Kiểm tra thông tin khách hàng, địa chỉ giao và danh sách sản phẩm trước khi tiến hành."
        variant="warning"
      />

      {/* Main info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer & Delivery info */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <User className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin khách hàng & giao hàng
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <User className="size-4 text-theme-primary-start" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Người nhận
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
              <div className="min-w-0 flex-1">
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
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Địa chỉ giao hàng
                </p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {order.delivery_address || order.renter.address || '—'}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Ghi chú giao hàng
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Calendar className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Tóm tắt đơn hàng
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ngày bắt đầu
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtDate(order.start_date)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Ngày kết thúc
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtDate(order.end_date)}
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Package className="size-3.5" /> Số lượng sản phẩm
                </span>
                <span className="text-sm font-bold text-foreground">
                  {order.items.length} thiết bị
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Banknote className="size-3.5" /> Phí thuê
                </span>
                <span className="text-sm font-bold text-foreground">
                  {fmt(order.total_rental_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Banknote className="size-3.5" /> Tiền đặt cọc
                </span>
                <span className="text-sm font-bold text-foreground">
                  {fmt(order.total_deposit)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Tổng thanh toán
                </span>
                <span className="text-base font-black text-theme-primary-start">
                  {fmt(order.total_rental_fee + order.total_deposit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Danh sách thiết bị
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
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
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
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          <span>Xác nhận để bắt đầu chuẩn bị hàng tại kho hub.</span>
        </div>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'h-12 gap-2 rounded-xl px-7 text-[15px] font-bold shrink-0 min-w-50',
            'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <ClipboardCheck className="size-4" />
              Xác nhận tiếp nhận
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
