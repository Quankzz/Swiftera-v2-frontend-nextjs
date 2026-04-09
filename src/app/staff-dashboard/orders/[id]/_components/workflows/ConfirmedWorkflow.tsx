'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Warehouse,
  Package,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Building2,
  Info,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder, OrderItem } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { CameraCapture } from '../CameraCapture';
import type { HubResponse } from '@/api/hubs';

interface ConfirmedWorkflowProps {
  order: DashboardOrder;
  hubInfo?: HubResponse | null;
  onStartDelivery: () => void;
  loading?: boolean;
}

function ItemPickupCard({
  item,
  photos,
  onAdd,
  onRemove,
}: {
  item: OrderItem;
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
}) {
  const hasPhoto = photos.length > 0;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        hasPhoto
          ? 'border-success/40 bg-success/5 dark:bg-success/5'
          : 'border-border bg-card',
      )}
    >
      {/* Item header */}
      <div className="flex items-center gap-3 mb-4">
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
        <div
          className={cn(
            'size-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
            hasPhoto
              ? 'bg-success text-white'
              : 'border-2 border-dashed border-border',
          )}
        >
          {hasPhoto ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Camera className="size-3.5 text-muted-foreground/50" />
          )}
        </div>
      </div>

      {/* Camera capture */}
      <CameraCapture
        photos={photos}
        onAdd={onAdd}
        onRemove={onRemove}
        label="Chụp ảnh kiểm tra tại kho"
      />
    </div>
  );
}

export function ConfirmedWorkflow({
  order,
  hubInfo,
  onStartDelivery,
  loading,
}: ConfirmedWorkflowProps) {
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(order.items.map((i) => [i.rental_order_item_id, []])),
  );

  const itemsDone = order.items.filter(
    (i) => (itemPhotos[i.rental_order_item_id]?.length ?? 0) > 0,
  ).length;
  const allPhotographed = itemsDone === order.items.length;

  const handleAdd = useCallback((itemId: string, url: string) => {
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), url],
    }));
  }, []);

  const handleRemove = useCallback((itemId: string, idx: number) => {
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((_, j) => j !== idx),
    }));
  }, []);

  const hubAddress = hubInfo
    ? [hubInfo.addressLine, hubInfo.ward, hubInfo.district, hubInfo.city]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <WorkflowBanner
        icon={Warehouse}
        title="Chuẩn bị hàng tại kho hub"
        desc="Đến hub lấy thiết bị và chụp ảnh kiểm tra từng sản phẩm. Tất cả thiết bị phải được chụp ảnh trước khi xuất kho."
        variant="primary"
      />

      {/* Hub info */}
      {hubInfo && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Building2 className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Thông tin kho hub
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                <Building2 className="size-4 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  Tên hub
                </p>
                <p className="text-sm font-bold text-foreground">
                  {hubInfo.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {hubInfo.code}
                </p>
              </div>
            </div>
            {hubAddress && (
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-theme-primary-start" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Địa chỉ
                  </p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {hubAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-theme-primary-start" />
            <span className="text-sm font-bold text-foreground">
              Tiến độ chụp ảnh kiểm kho
            </span>
          </div>
          <span
            className={cn(
              'text-sm font-black tabular-nums',
              allPhotographed ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {itemsDone}/{order.items.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              allPhotographed ? 'bg-success' : 'bg-theme-primary-start',
            )}
            style={{
              width: `${order.items.length > 0 ? (itemsDone / order.items.length) * 100 : 0}%`,
            }}
          />
        </div>
        {!allPhotographed && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0" />
            Chụp ảnh tất cả {order.items.length} thiết bị để kích hoạt nút xuất
            kho.
          </p>
        )}
      </div>

      {/* Items grid */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Kiểm tra thiết bị trước xuất kho
            </h3>
          </div>
          <span className="text-xs font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
            {order.items.length} thiết bị
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {order.items.map((item) => (
            <ItemPickupCard
              key={item.rental_order_item_id}
              item={item}
              photos={itemPhotos[item.rental_order_item_id] ?? []}
              onAdd={(url) => handleAdd(item.rental_order_item_id, url)}
              onRemove={(idx) => handleRemove(item.rental_order_item_id, idx)}
            />
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {allPhotographed ? (
            <span className="flex items-center gap-2 text-success font-semibold">
              <CheckCircle2 className="size-4" />
              Đã hoàn tất kiểm kho — sẵn sàng xuất hàng.
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Camera className="size-4 shrink-0 text-muted-foreground" />
              Còn {order.items.length - itemsDone} thiết bị chưa được chụp ảnh.
            </span>
          )}
        </div>
        <Button
          onClick={onStartDelivery}
          disabled={!allPhotographed || loading}
          className={cn(
            'h-12 gap-2 rounded-xl px-7 text-[15px] font-bold shrink-0 min-w-52',
            allPhotographed
              ? 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
              : '',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <Truck className="size-4" />
              Xuất kho & Bắt đầu giao
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
