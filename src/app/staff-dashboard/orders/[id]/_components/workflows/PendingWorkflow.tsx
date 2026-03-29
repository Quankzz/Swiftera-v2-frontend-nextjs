import React from 'react';
import Image from 'next/image';
import {
  User,
  Phone,
  MapPin,
  ClipboardList,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { InfoRow } from '../InfoRow';
import { fmt, fmtDate } from '../utils';
import { cn } from '@/lib/utils';

export function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: {
  order: DashboardOrder;
  onConfirm: () => void;
  loading: boolean;
}) {
  const isPaid = order.payment_status === 'PAID';

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <WorkflowBanner
        icon={ClipboardList}
        variant="primary"
        title="Đơn hàng mới — Cần xác nhận"
        desc="Kiểm tra kỹ thông tin khách thuê và danh sách sản phẩm trước khi xác nhận để bắt đầu chuẩn bị giao hàng."
      />

      {/* Cảnh báo thanh toán */}
      {!isPaid && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">
              Khách chưa thanh toán đầy đủ
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Không thể xác nhận đơn hàng. Vui lòng đợi khách thanh toán hoặc
              liên hệ hỗ trợ.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== CỘT TRÁI (7) ==================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Thông tin khách thuê */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-theme-primary-start/10 rounded-2xl">
                <User className="size-5 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Khách thuê
                </p>
                <p className="text-xs text-muted-foreground">
                  Thông tin người đặt hàng
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoRow
                icon={User}
                label="Họ và tên"
                value={order.renter.full_name}
                strong
              />
              <InfoRow
                icon={Phone}
                label="Số điện thoại"
                value={order.renter.phone_number}
              />
              <InfoRow
                icon={ClipboardList}
                label="CCCD"
                value={order.renter.cccd_number}
                mono
              />
              <InfoRow
                icon={MapPin}
                label="Địa chỉ giao hàng"
                value={order.delivery_address ?? order.renter.address}
              />
            </div>
          </div>

          {/* Chi tiết lịch trình & Tài chính */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 rounded-2xl">
                <Receipt className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Chi tiết thuê & Thanh toán
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* ── 1. Khối Thời Gian (Timeline) ── */}
              <div className="relative flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
                {/* Ngày nhận */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Nhận hàng
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {fmtDate(order.start_date)}
                  </p>
                </div>

                {/* Mũi tên điều hướng ở giữa */}
                <div className="flex flex-col items-center justify-center px-4">
                  <ArrowRight className="size-8 text-muted-foreground/50 z-10" />
                </div>

                {/* Ngày trả */}
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Trả hàng
                    </span>
                    <CalendarDays className="size-4" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {fmtDate(order.end_date)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phí thuê */}
                <div className="rounded-2xl border border-blue-200/50 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3.5">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <CreditCard className="size-4" />
                    <span className="text-xs font-semibold">Phí thuê</span>
                  </div>
                  <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300 tabular-nums leading-none mt-1.5">
                    {fmt(order.total_rental_fee)}
                  </p>
                </div>

                {/* Tiền cọc */}
                <div className="rounded-2xl border border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <ShieldCheck className="size-4" />
                    <span className="text-xs font-semibold">Tiền cọc</span>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums leading-none mt-1.5">
                    {fmt(order.total_deposit)}
                  </p>
                </div>
              </div>

              {/* ── 3. Ghi chú khách hàng ── */}
              {order.notes && (
                <div className="mt-1 rounded-2xl border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="size-4 text-amber-600 dark:text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
                      Ghi chú từ khách hàng
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed italic">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== CỘT PHẢI (5) ==================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Danh sách sản phẩm */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 dark:bg-orange-950 rounded-2xl">
                  <Package className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Sản phẩm thuê
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} món hàng
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {order.items.map((item) => (
                <div
                  key={item.rental_order_item_id}
                  className="flex gap-4 rounded-2xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-all"
                >
                  <div className="relative size-20 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        SN: {item.serial_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-theme-primary-start">
                        {fmt(item.daily_price)}
                        <span className="text-xs font-normal text-muted-foreground">
                          /ngày
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cọc: {fmt(item.deposit_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút Xác nhận */}
          <div>
            <Button
              size="default"
              onClick={onConfirm}
              disabled={loading || !isPaid}
              className={cn(
                'w-full h-16 gap-3 text-xl font-semibold shadow-md transition-all',
                isPaid
                  ? 'bg-linear-to-r from-theme-primary-start to-theme-primary-end hover:brightness-105 text-white'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
              {isPaid ? 'Xác nhận đơn hàng' : 'Chưa thể xác nhận đơn'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
