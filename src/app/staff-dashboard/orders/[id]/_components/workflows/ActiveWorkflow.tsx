'use client';

/**
 * ActiveWorkflow — Trạng thái PENDING_PICKUP, IN_USE, hoặc OVERDUE
 *
 * RETURN WORKFLOW - STEP 1/4
 *
 * Hiển thị 3 tình huống khác nhau:
 *
 * 1. PENDING_PICKUP (Chờ thu hồi)
 *    - Khách đã yêu cầu trả hàng trên ứng dụng
 *    - Staff nhấn "Xác nhận & Bắt đầu thu hồi" → PICKING_UP
 *    - API: updateOrderStatus(orderId, 'PICKING_UP')
 *
 * 2. IN_USE (Đang thuê)
 *    - Khách đang sử dụng sản phẩm
 *    - Staff không cần hành động gì
 *    - Chỉ hiển thị thông tin cho tham khảo
 *    - Sẽ chuyển sang PENDING_PICKUP khi khách bấm "Trả hàng" trên ứng dụng
 *
 * 3. OVERDUE (Quá hạn)
 *    - Khách đã vượt quá ngày hẹn trả
 *    - Staff cần liên hệ ngay khách để sắp xếp thu hồi
 *    - Nhấn "Xác nhận & Bắt đầu thu hồi" → PICKING_UP
 *    - API: updateOrderStatus(orderId, 'PICKING_UP')
 *
 * Lưu ý: IN_USE không lại hiển thị một nút "Bắt đầu thu hồi". Staff sẽ thấy
 * PENDING_PICKUP khi khách yêu cầu trả.
 */
import React, { useState } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  User,
  Phone,
  MapPin,
  Package,
  Loader2,
  Camera,
  Calendar,
  AlertCircle,
  Clock,
  Hash,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';

export function ActiveWorkflow({
  order,
  onStartPickup,
  loading,
  isPendingPickup,
}: {
  order: DashboardOrder;
  onStartPickup: () => void;
  loading: boolean;
  isPendingPickup?: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [now] = useState(() => Date.now());
  const isOverdue = order.status === 'OVERDUE';
  const canAct = isPendingPickup || isOverdue;

  // How many days overdue
  const daysOverdue = isOverdue
    ? Math.max(
        0,
        Math.floor((now - new Date(order.end_date).getTime()) / 86_400_000),
      )
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={isOverdue ? AlertCircle : canAct ? RotateCcw : Clock}
        title={
          isOverdue
            ? `Đơn quá hạn ${daysOverdue > 0 ? `${daysOverdue} ngày` : ''} — Cần thu hồi ngay`
            : isPendingPickup
              ? 'Khách đã trả hàng — Sẵn sàng thu hồi'
              : 'Thiết bị đang được khách hàng sử dụng'
        }
        desc={
          isOverdue
            ? 'Đơn đã vượt quá ngày hẹn trả. Liên hệ ngay với khách hàng để sắp xếp thu hồi thiết bị.'
            : isPendingPickup
              ? 'Khách hàng đã xác nhận trả hàng. Xác nhận rồi đến lấy thiết bị về hub.'
              : 'Đơn đang trong thời gian thuê hợp lệ. Hệ thống sẽ thông báo khi khách trả hàng.'
        }
        variant={isOverdue ? 'danger' : isPendingPickup ? 'warning' : 'primary'}
      />

      {/* ── Customer Info ── */}
      <Section title="Thông tin khách hàng" icon={User} defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3">
          <InfoRow
            icon={User}
            label="Tên khách"
            value={order.renter.full_name}
          />
          <InfoRow
            icon={Phone}
            label="Điện thoại"
            value={order.renter.phone_number}
          />
          <div className="sm:col-span-2">
            <InfoRow
              icon={MapPin}
              label="Địa chỉ lấy hàng"
              value={order.delivery_address ?? order.renter.address ?? '—'}
            />
          </div>
          <InfoRow
            icon={Calendar}
            label="Ngày bắt đầu"
            value={fmtDate(order.start_date)}
          />
          <InfoRow
            icon={Calendar}
            label="Hạn trả"
            value={
              <span className={cn(isOverdue && 'text-destructive font-bold')}>
                {fmtDate(order.end_date)}
                {isOverdue && ` (quá ${daysOverdue} ngày)`}
              </span>
            }
          />
        </div>

        {canAct && (
          <div className="flex flex-wrap gap-2 mt-4">
            <a
              href={`tel:${order.renter.phone_number}`}
              className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-sm font-semibold text-success hover:bg-success/10 transition-colors"
            >
              <Phone className="size-4" /> Gọi khách hàng
            </a>
            {order.delivery_latitude != null &&
              order.delivery_longitude != null && (
                <a
                  href={`https://maps.google.com/?q=${order.delivery_latitude},${order.delivery_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Navigation className="size-4" /> Điều hướng đến khách
                </a>
              )}
          </div>
        )}
      </Section>

      {/* ── Items to Collect ── */}
      <Section
        title={`Thiết bị cần thu hồi (${order.items.length})`}
        icon={Package}
        defaultOpen
      >
        <div className="flex flex-col divide-y divide-border/40 pt-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Camera className="size-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {item.product_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Hash className="size-3 text-muted-foreground" />
                  <p className="text-xs font-mono text-muted-foreground">
                    {item.serial_number}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tiền cọc: {fmt(item.deposit_amount)}
                </p>
              </div>
              <RotateCcw
                className={cn(
                  'size-4 shrink-0',
                  isOverdue
                    ? 'text-destructive animate-spin'
                    : 'text-orange-500',
                )}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Action section (only for PENDING_PICKUP or OVERDUE) ── */}
      {canAct && (
        <>
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded accent-orange-500"
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              Tôi xác nhận sẽ đến{' '}
              <strong className="text-foreground">
                {order.delivery_address ??
                  order.renter.address ??
                  'địa chỉ khách'}
              </strong>{' '}
              để thu hồi{' '}
              <strong className="text-foreground">
                {order.items.length} thiết bị
              </strong>
              .
            </span>
          </label>

          <Button
            onClick={onStartPickup}
            disabled={loading || !confirmed}
            size="lg"
            className={cn(
              'w-full h-14 text-base font-bold gap-2 rounded-2xl text-white disabled:opacity-50',
              isOverdue
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-orange-500 hover:bg-orange-600',
            )}
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <RotateCcw className="size-5" />
            )}
            Xác nhận → Bắt đầu đến lấy hàng
          </Button>
        </>
      )}
    </div>
  );
}
