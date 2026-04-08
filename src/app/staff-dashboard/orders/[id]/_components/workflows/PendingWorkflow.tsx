'use client';

/**
 * PendingWorkflow — Trạng thái PAID
 *
 * DELIVERY WORKFLOW - STEP 1/4
 *
 * Đơn hàng đã được thanh toán và được phân công cho shipper (staff).
 * Staff xem kỹ thông tin đơn hàng:
 * - Thông tin khách hàng
 * - Danh sách sản phẩm cần chuẩn bị
 * - Thời hạn thuê
 * - Yêu cầu đặc biệt từ khách
 *
 * Sau khi xác nhận, staff bấm "Nhận đơn & Chuẩn bị hàng" → PREPARING
 * API: updateOrderStatus(orderId, 'PREPARING')
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ClipboardList,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Loader2,
  Banknote,
  Camera,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';

export function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: {
  order: DashboardOrder;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={ClipboardList}
        title="Đơn hàng chờ bạn xác nhận"
        desc="Kiểm tra kỹ thông tin đơn hàng và danh sách sản phẩm trước khi nhận đơn và bắt đầu chuẩn bị hàng tại hub."
        variant="warning"
      />

      {/* ── Customer Info ── */}
      <Section title="Thông tin khách hàng" icon={User} defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3">
          <InfoRow
            icon={User}
            label="Người nhận hàng"
            value={order.renter.full_name}
          />
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
            value={order.renter.phone_number}
          />
          <div className="sm:col-span-2">
            <InfoRow
              icon={MapPin}
              label="Địa chỉ giao hàng"
              value={order.delivery_address ?? order.renter.address ?? '—'}
            />
          </div>
          <InfoRow
            icon={Calendar}
            label="Ngày bắt đầu thuê"
            value={fmtDate(order.start_date)}
          />
          <InfoRow
            icon={Calendar}
            label="Ngày kết thúc thuê"
            value={fmtDate(order.end_date)}
          />
          <InfoRow
            icon={Banknote}
            label="Phí thuê"
            value={fmt(order.total_rental_fee)}
          />
          <InfoRow
            icon={Banknote}
            label="Tiền đặt cọc"
            value={fmt(order.total_deposit)}
          />
        </div>
        {order.notes && (
          <div className="mt-3 rounded-xl border border-yellow-200/60 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-3">
            <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 mb-1 uppercase tracking-widest">
              Ghi chú của khách
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {order.notes}
            </p>
          </div>
        )}
      </Section>

      {/* ── Items List ── */}
      <Section
        title={`Sản phẩm cần chuẩn bị (${order.items.length} thiết bị)`}
        icon={Package}
        defaultOpen
      >
        <div className="flex flex-col divide-y divide-border/40 pt-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {/* Thumbnail */}
              <div className="relative size-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Camera className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-snug truncate">
                  {item.product_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash className="size-3 text-muted-foreground shrink-0" />
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    {item.serial_number || 'Chưa có serial'}
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-theme-primary-start tabular-nums">
                  {fmt(item.daily_price)}/ng
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  Cọc: {fmt(item.deposit_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Financial Summary ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Tổng quan tài chính
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            {
              label: 'Phí thuê',
              value: fmt(order.total_rental_fee),
              color: 'text-foreground',
            },
            {
              label: 'Tiền cọc',
              value: fmt(order.total_deposit),
              color: 'text-info',
            },
            {
              label: 'Tổng cộng',
              value: fmt(order.total_rental_fee + order.total_deposit),
              color: 'text-theme-primary-start',
            },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-xl bg-muted/40 px-2 py-3 flex flex-col items-center"
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                {row.label}
              </p>
              <p
                className={cn(
                  'text-base font-black tabular-nums leading-none',
                  row.color,
                )}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Confirm Checklist ── */}
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded accent-amber-500"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Tôi đã kiểm tra thông tin đơn hàng, xác nhận danh sách sản phẩm và sẽ
          chuẩn bị giao đơn này.
        </span>
      </label>

      {/* ── CTA ── */}
      <Button
        onClick={onConfirm}
        disabled={loading || !checked}
        size="lg"
        className="w-full h-14 text-base font-bold gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-5" />
        )}
        Xác nhận nhận đơn → Bắt đầu chuẩn bị hàng
      </Button>
    </div>
  );
}
