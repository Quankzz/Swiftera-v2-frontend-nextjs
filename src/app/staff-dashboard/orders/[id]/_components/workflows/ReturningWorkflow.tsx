'use client';

/**
 * ReturningWorkflow — Trạng thái PICKING_UP
 *
 * RETURN WORKFLOW - STEP 2/4
 *
 * Sau khi khách yêu cầu trả hàng, staff đã xác nhận trong PENDING_PICKUP.
 * Bây giờ staff đang trên đường đến khách để lấy thiết bị trả về.
 *
 * Quy trình:
 * 1. Gọi điện cho khách liên hệ
 * 2. Điều hướng tới địa chỉ khách (Google Maps)
 * 3. Theo dõi GPS real-time (tương tự Grab)
 * 4. Tại điểm lấy hàng:
 *    - Quét QR code hoặc xác nhận danh tính khách
 *    - Kiểm tra nhận đầy đủ thiết bị
 *    - Xác nhận nhận hàng trả
 * 5. Bấm "Đã lấy được hàng" → recordPickup(lat/lng) → PICKED_UP
 *
 * API: recordPickup(orderId, {pickedUpLatitude, pickedUpLongitude})
 * Lưu ý: pickedUpLatitude/pickedUpLongitude lấy từ GPS hiện tại của staff
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  User,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Loader2,
  Camera,
  Navigation,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDatetime } from '../utils';

export function ReturningWorkflow({
  order,
  onCompleteReturn,
  loading,
  staffLat,
  staffLng,
  staffLocAt,
}: {
  order: DashboardOrder;
  onCompleteReturn: () => void;
  loading: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={RotateCcw}
        title="Đang đến lấy hàng từ khách"
        desc="Di chuyển đến địa chỉ của khách, liên hệ nếu cần, và xác nhận khi đã nhận đủ thiết bị."
        variant="warning"
      />

      {/* ── GPS Status Bar ── */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border px-4 py-3',
          staffLocAt
            ? 'border-success/30 bg-success/5'
            : 'border-border bg-muted/20',
        )}
      >
        <div
          className={cn(
            'size-2.5 rounded-full shrink-0',
            staffLocAt
              ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]'
              : 'bg-muted-foreground/40',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">
            {staffLocAt
              ? 'GPS đang theo dõi vị trí của bạn'
              : 'Đang khởi tạo GPS...'}
          </p>
          {staffLocAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Cập nhật lần cuối: {fmtDatetime(staffLocAt)}
            </p>
          )}
          {staffLat && staffLng && (
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {staffLat.toFixed(5)}, {staffLng.toFixed(5)}
            </p>
          )}
        </div>
        {!staffLocAt && (
          <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
        )}
      </div>

      {/* ── Customer Contact ── */}
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
        </div>

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
      </Section>

      {/* ── Items to Collect ── */}
      <Section
        title={`Thiết bị cần lấy về (${order.items.length})`}
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
                  Cọc: {fmt(item.deposit_amount)}
                </p>
              </div>
              <RotateCcw className="size-4 text-orange-500 shrink-0 animate-spin" />
            </div>
          ))}
        </div>

        {/* Reminder */}
        <div className="mt-4 rounded-xl border border-yellow-200/60 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-3">
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 leading-relaxed">
            💡 Kiểm tra số serial của từng thiết bị khớp với danh sách trên
            trước khi rời khỏi khách.
          </p>
        </div>
      </Section>

      {/* ── Confirm ── */}
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded accent-orange-500"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Tôi đã nhận đủ{' '}
          <strong className="text-foreground">
            {order.items.length} thiết bị
          </strong>{' '}
          từ khách hàng và kiểm tra số serial khớp với danh sách.
        </span>
      </label>

      {/* ── CTA ── */}
      <Button
        onClick={onCompleteReturn}
        disabled={loading || !confirmed}
        size="lg"
        className="w-full h-14 text-base font-bold gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-5" />
        )}
        Xác nhận đã lấy được hàng từ khách →
      </Button>
    </div>
  );
}
