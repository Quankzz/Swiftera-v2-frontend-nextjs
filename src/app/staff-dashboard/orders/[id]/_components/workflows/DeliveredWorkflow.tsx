'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Calendar,
  Package,
  Banknote,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';

interface DeliveredWorkflowProps {
  order: DashboardOrder;
  /** kept for compat but unused — customer-side confirmation is not required */
  onConfirmHandover?: () => void;
  loading?: boolean;
}

export function DeliveredWorkflow({ order }: DeliveredWorkflowProps) {
  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="rounded-2xl border border-success/30 bg-success/8 dark:bg-success/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="size-16 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-success mb-1 leading-tight">
            Giao hàng thành công
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đơn hàng{' '}
            <span className="font-mono font-bold text-foreground">
              {order.order_code}
            </span>{' '}
            đã được giao đến khách hàng. Hệ thống sẽ tự động cập nhật trạng thái
            thuê khi khách xác nhận.
          </p>
        </div>
      </div>

      {/* Delivery summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <User className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin giao hàng
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <User className="size-4 text-theme-primary-start" />
              </div>
              <div>
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
                  Địa chỉ đã giao
                </p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {order.delivery_address || order.renter.address || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order financials */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Banknote className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin thanh toán
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  <Calendar className="size-3 inline mr-1" />
                  Bắt đầu
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtDate(order.start_date)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  <Calendar className="size-3 inline mr-1" />
                  Kết thúc dự kiến
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtDate(order.end_date)}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phí thuê</span>
                <span className="font-bold text-foreground">
                  {fmt(order.total_rental_fee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Tiền đặt cọc (đang giữ)
                </span>
                <span className="font-bold text-foreground">
                  {fmt(order.total_deposit)}
                </span>
              </div>
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Tổng đã thanh toán
                </span>
                <span className="text-base font-black text-theme-primary-start">
                  {fmt(order.total_rental_fee + order.total_deposit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivered items grid */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thiết bị đã bàn giao
            </h3>
          </div>
          <span className="text-xs font-bold bg-success/15 text-success px-2.5 py-1 rounded-lg">
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
              </div>
              <CheckCircle2 className="size-4 text-success shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Info footer */}
      <div className="rounded-2xl border border-border bg-muted/20 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          <span>
            Đơn hàng đang trong giai đoạn thuê. Hệ thống sẽ tự động chuyển khi
            khách hàng xác nhận nhận hàng.
          </span>
        </div>
        <Link
          href="/staff-dashboard/orders"
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-accent transition-colors shrink-0',
          )}
        >
          Về danh sách <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
