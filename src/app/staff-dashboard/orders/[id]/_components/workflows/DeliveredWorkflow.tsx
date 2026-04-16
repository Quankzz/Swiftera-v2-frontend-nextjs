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
  Mail,
} from 'lucide-react';
import type { StaffOrder } from '@/types/api.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowFooter } from '../WorkflowFooter';

interface DeliveredWorkflowProps {
  order: StaffOrder;
  onConfirmHandover?: () => void;
  loading?: boolean;
}

export function DeliveredWorkflow({ order }: DeliveredWorkflowProps) {
  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Success banner */}
        <div className="rounded-2xl border border-success/30 bg-success/5 dark:bg-success/8 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="size-16 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-success mb-1 leading-tight">
              Giao hàng thành công
            </h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Đơn hàng{' '}
              <span className="font-mono font-bold text-foreground">
                {order.order_code}
              </span>{' '}
              đã được giao đến khách hàng. Hệ thống sẽ tự động cập nhật khi
              khách xác nhận.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: Customer + Financials */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Customer info */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <User className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Thông tin giao hàng
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <User className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Người nhận
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
                      Địa chỉ đã giao
                    </p>
                    <p className="text-[15px] font-medium text-foreground leading-relaxed whitespace-normal">
                      {order.delivery_address || order.renter.address || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order financials */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <Banknote className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Thông tin thanh toán
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700 p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      <Calendar className="size-4 inline mr-1.5" /> Bắt đầu
                    </p>
                    <p className="text-[15px] font-bold text-foreground">
                      {fmtDate(order.start_date)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700 p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      <Calendar className="size-4 inline mr-1.5" /> Kết thúc
                    </p>
                    <p className="text-[15px] font-bold text-foreground">
                      {fmtDate(order.end_date)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-3">
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                    <span className="text-[14px] font-medium text-muted-foreground">
                      Phí thuê
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(order.total_rental_fee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                    <span className="text-[14px] font-medium text-muted-foreground">
                      Tiền đặt cọc (đang giữ)
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(order.total_deposit)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[15px] font-bold text-foreground uppercase tracking-wide">
                    Tổng đã thanh toán
                  </span>
                  <span className="text-2xl font-black text-theme-primary-start dark:text-blue-400">
                    {fmt(order.total_rental_fee + order.total_deposit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Delivered items */}
          <div className="lg:col-span-5 flex flex-col h-[28rem] lg:h-auto">
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Package className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Thiết bị đã bàn giao
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold bg-success/15 text-success border border-success/30 px-2.5 py-1.5 rounded-lg">
                  {order.items.length} thiết bị
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20">
                {order.items.map((item) => (
                  <div
                    key={item.rental_order_item_id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-success/30 dark:border-success/20 bg-success/5 dark:bg-success/8"
                  >
                    <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700">
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
                    </div>
                    <CheckCircle2 className="size-5 text-success shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WorkflowFooter>
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2.5 text-[14px] text-muted-foreground flex-1 min-w-0">
            <Clock className="size-5 shrink-0" />
            <span className="truncate">
              Đơn hàng đang trong giai đoạn thuê. Hệ thống sẽ tự động chuyển khi
              khách hàng xác nhận nhận hàng.
            </span>
          </div>
          <Link
            href="/staff-dashboard/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 dark:border-slate-700 bg-card px-5 py-3 text-[14px] font-bold text-foreground hover:bg-accent transition-colors shrink-0"
          >
            Về danh sách <ArrowRight className="size-4" />
          </Link>
        </div>
      </WorkflowFooter>
    </>
  );
}
