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
  AlertCircle,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StaffOrder } from '@/types/api.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { WorkflowFooter } from '../WorkflowFooter';

interface PendingWorkflowProps {
  order: StaffOrder;
  onConfirm: () => void;
  loading?: boolean;
}

export function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: PendingWorkflowProps) {
  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <WorkflowBanner
          icon={ClipboardCheck}
          title="Xác nhận tiếp nhận đơn hàng"
          desc="Đơn hàng đã được thanh toán và chờ nhân viên xác nhận. Kiểm tra thông tin khách hàng, địa chỉ giao và danh sách sản phẩm trước khi tiến hành."
          variant="warning"
        />

        {/* Đổi items-start thành items-stretch để 2 cột cao bằng nhau */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CỘT TRÁI (7): Chiều cao quyết định bởi nội dung bên trong */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Thông tin khách hàng (Đã gom thành 1 cột dọc) */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <User className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Thông tin khách hàng & giao hàng
                </h3>
              </div>

              <div className="p-6 space-y-5">
                {/* Hàng 1: Người nhận */}
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

                {/* Hàng 2: Điện thoại */}
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <Phone className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Điện thoại liên hệ
                    </p>
                    <p className="text-[15px] font-bold text-foreground font-mono tracking-wide">
                      {order.renter.phone_number}
                    </p>
                  </div>
                </div>

                {/* Hàng 2b: Email */}
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

                {/* Hàng 3: Địa chỉ */}
                <div className="flex items-start gap-4 pt-3 border-t border-border/60 dark:border-slate-800">
                  <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                    <MapPin className="size-5 text-theme-primary-start dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Địa chỉ giao hàng
                    </p>
                    <p className="text-[15px] font-medium text-foreground leading-relaxed wrap-break-words whitespace-normal">
                      {order.delivery_address || order.renter.address || '—'}
                    </p>
                  </div>
                </div>

                {/* Ghi chú */}
                {order.notes && (
                  <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 p-4 flex gap-3 items-start">
                    <AlertCircle className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1.5 uppercase tracking-wider">
                        Ghi chú từ khách
                      </p>
                      <p className="text-[14px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium wrap-break-words whitespace-normal">
                        {order.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                <Banknote className="size-5 text-foreground" />
                <h3 className="text-[15px] font-bold text-foreground">
                  Tóm tắt đơn hàng
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
                      Tiền đặt cọc
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(order.total_deposit)}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[15px] font-bold text-foreground uppercase tracking-wide">
                    Tổng thanh toán
                  </span>
                  <span className="text-2xl font-black text-theme-primary-start dark:text-blue-400">
                    {fmt(order.total_rental_fee + order.total_deposit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-125 lg:h-auto">
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Package className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Danh sách thiết bị
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold bg-background dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground px-2.5 py-1.5 rounded-lg shadow-sm">
                  {order.items.length} thiết bị
                </span>
              </div>

              {/* Vùng tự động Scroll (flex-1 overflow-y-auto) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20">
                {order.items.map((item) => (
                  <div
                    key={item.rental_order_item_id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/50 hover:border-theme-primary-start/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
                  >
                    <div className="relative size-16 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <Package className="size-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-foreground line-clamp-2 leading-snug">
                        {item.product_name}
                      </p>
                      <div className="mt-1.5">
                        <span className="text-[11px] text-muted-foreground dark:text-slate-400 font-mono tracking-wide bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block px-2 py-0.5 rounded-md truncate max-w-full">
                          {item.serial_number || 'SKU: Chưa cập nhật'}
                        </span>
                      </div>
                      <p className="text-[13px] font-bold text-theme-primary-start dark:text-blue-400 mt-2">
                        Cọc: {fmt(item.deposit_amount)}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground/40 group-hover:text-theme-primary-start dark:group-hover:text-blue-400 transition-colors shrink-0" />
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
              Xác nhận để bắt đầu chuẩn bị hàng tại kho hub.
            </span>
          </div>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="h-16 gap-2 rounded-xl px-7 text-xl font-bold shrink-0 sm:min-w-52 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 dark:shadow-amber-500/10 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <ClipboardCheck className="size-5" /> Xác nhận tiếp nhận
              </>
            )}
          </Button>
        </div>
      </WorkflowFooter>
    </>
  );
}
