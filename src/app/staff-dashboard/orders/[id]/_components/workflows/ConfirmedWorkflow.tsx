'use client';

/**
 * ConfirmedWorkflow — Trạng thái PREPARING
 *
 * DELIVERY WORKFLOW - STEP 2/4
 *
 * Staff đã xác nhận nhận đơn từ trạng thái PAID.
 * Bây giờ staff đến hub/kho để:
 * 1. Lấy đúng thiết bị theo danh sách (kiểm tra serial numbers)
 * 2. Chụp ảnh CHECKOUT của từng thiết bị (bằng chứng nó ở tình trạng tốt trước khi giao)
 * 3. Chuẩn bị bao bì/vận chuyển
 *
 * Sau khi xác nhận, staff bấm "Bắt đầu giao hàng" → DELIVERING
 * API: updateOrderStatus(orderId, 'DELIVERING')
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Warehouse,
  MapPin,
  Phone,
  Package,
  Truck,
  Loader2,
  Camera,
  CheckCircle2,
  Hash,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { CameraCapture } from '../CameraCapture';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import type { HubResponse } from '@/api/hubs';
import { fmt } from '../utils';

export function ConfirmedWorkflow({
  order,
  hubInfo,
  onStartDelivery,
  loading,
}: {
  order: DashboardOrder;
  hubInfo: HubResponse | null;
  onStartDelivery: () => void;
  loading: boolean;
}) {
  // Per-item photos: record<itemId, string[]>
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>({});
  const [checkedOut, setCheckedOut] = useState(false);

  const hubAddress = hubInfo
    ? [hubInfo.addressLine, hubInfo.ward, hubInfo.district, hubInfo.city]
        .filter(Boolean)
        .join(', ')
    : null;

  const addPhoto = (itemId: string, url: string) =>
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), url],
    }));

  const removePhoto = (itemId: string, idx: number) =>
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((_, j) => j !== idx),
    }));

  const photographedCount = order.items.filter(
    (i) => (itemPhotos[i.rental_order_item_id]?.length ?? 0) > 0,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Warehouse}
        title="Đến hub lấy hàng để giao"
        desc="Lấy đúng thiết bị theo danh sách bên dưới, chụp ảnh tình trạng từng thiết bị trước khi rời hub."
        variant="primary"
      />

      {/* ── Hub Info ── */}
      {hubInfo ? (
        <Section title={`Hub: ${hubInfo.name}`} icon={Warehouse} defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3">
            <InfoRow icon={Warehouse} label="Tên hub" value={hubInfo.name} />
            {hubAddress && (
              <InfoRow icon={MapPin} label="Địa chỉ" value={hubAddress} />
            )}
            {hubInfo.phone && (
              <InfoRow
                icon={Phone}
                label="Điện thoại hub"
                value={hubInfo.phone}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {hubInfo.phone && (
              <a
                href={`tel:${hubInfo.phone}`}
                className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-sm font-semibold text-success hover:bg-success/10 transition-colors"
              >
                <Phone className="size-4" /> Gọi Hub
              </a>
            )}
            {hubInfo.latitude != null && hubInfo.longitude != null && (
              <a
                href={`https://maps.google.com/?q=${hubInfo.latitude},${hubInfo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Navigation className="size-4" /> Điều hướng đến Hub
              </a>
            )}
          </div>
        </Section>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 text-muted-foreground">
          <Warehouse className="size-5 shrink-0" />
          <p className="text-sm">Đang tải thông tin hub…</p>
        </div>
      )}

      {/* ── Items + Photo capture ── */}
      <Section
        title={`Lấy hàng tại Hub (${order.items.length} thiết bị)`}
        icon={Package}
        defaultOpen
        badge={
          photographedCount > 0 ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
              <CheckCircle2 className="size-3" />
              {photographedCount}/{order.items.length} đã chụp
            </span>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-5 pt-3">
          {order.items.map((item) => {
            const photos = itemPhotos[item.rental_order_item_id] ?? [];
            const isPhotographed = photos.length > 0;

            return (
              <div
                key={item.rental_order_item_id}
                className={cn(
                  'rounded-2xl border p-4 flex flex-col gap-3 transition-colors',
                  isPhotographed
                    ? 'border-success/30 bg-success/3 dark:bg-success/5'
                    : 'border-border bg-muted/20',
                )}
              >
                {/* Item header */}
                <div className="flex items-center gap-3">
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
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {item.product_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Hash className="size-3 text-muted-foreground shrink-0" />
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.serial_number || '—'}
                      </p>
                    </div>
                    <p className="text-xs text-theme-primary-start font-semibold mt-0.5">
                      {fmt(item.daily_price)}/ngày · Cọc:{' '}
                      {fmt(item.deposit_amount)}
                    </p>
                  </div>
                  {isPhotographed && (
                    <CheckCircle2 className="size-5 text-success shrink-0 animate-in zoom-in-50 duration-200" />
                  )}
                </div>

                {/* Camera */}
                <CameraCapture
                  photos={photos}
                  onAdd={(url) => addPhoto(item.rental_order_item_id, url)}
                  onRemove={(idx) =>
                    removePhoto(item.rental_order_item_id, idx)
                  }
                  label="Chụp ảnh thiết bị tại hub (CHECKOUT)"
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Checklist ── */}
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
        <input
          type="checkbox"
          checked={checkedOut}
          onChange={(e) => setCheckedOut(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded accent-theme-primary-start"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Tôi đã lấy đủ{' '}
          <strong className="text-foreground">
            {order.items.length} thiết bị
          </strong>{' '}
          khỏi hub, kiểm tra tình trạng và sẵn sàng bắt đầu giao hàng cho khách.
        </span>
      </label>

      {/* ── CTA ── */}
      <Button
        onClick={onStartDelivery}
        disabled={loading || !checkedOut}
        size="lg"
        className="w-full h-14 text-base font-bold gap-2 rounded-2xl disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Truck className="size-5" />
        )}
        Bắt đầu giao hàng →
      </Button>
    </div>
  );
}
