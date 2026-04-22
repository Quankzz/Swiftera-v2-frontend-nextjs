'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Warehouse,
  Truck,
  Package,
  Camera,
  CheckCircle2,
  Loader2,
  Info,
  Navigation2,
} from 'lucide-react';
import axios from 'axios';
import '@goongmaps/goong-js/dist/goong-js.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  RentalOrderResponse,
  RentalOrderLineResponse,
} from '@/types/api.types';
import { apiKey } from '@/configs/goongmapKeys';
import { WorkflowBanner } from '../WorkflowBanner';
import { MiniMapPanel } from '../MiniMapPanel';
import {
  CustomerInfo,
  OrderMetaCard,
  OrderItemsList,
  RentalSummary,
  RentalDateTimeline,
} from '../OrderInfo';
import { CameraCapture } from '../CameraCapture';
import { DeliveryMiniMap } from '../DeliveryMiniMap';

function ItemPickupCard({
  line,
  photos,
  onAdd,
  onRemove,
}: {
  line: RentalOrderLineResponse;
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
}) {
  const hasPhoto = photos.length > 0;
  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        hasPhoto
          ? 'border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-950/10 dark:border-emerald-800/30'
          : 'border-border bg-card',
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'size-10 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm',
            hasPhoto
              ? 'bg-emerald-500 text-white'
              : 'bg-muted border border-border',
          )}
        >
          {hasPhoto ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Camera className="size-4 text-muted-foreground/50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground line-clamp-2 leading-snug">
            {line.productNameSnapshot}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5 bg-muted px-1.5 py-0.5 rounded inline-block">
            {line.inventorySerialNumber || '—'}
          </p>
        </div>
        {hasPhoto && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded shrink-0">
            ✓ Đã chụp
          </span>
        )}
      </div>
      <CameraCapture
        photos={photos}
        onAdd={onAdd}
        onRemove={onRemove}
        label="Chụp ảnh kiểm tra"
      />
    </div>
  );
}

interface RepairingWorkflowProps {
  order: RentalOrderResponse;
  onStartDelivery: () => void;
  loading?: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}

export function RepairingWorkflow({
  order,
  onStartDelivery,
  loading,
  staffLat,
  staffLng,
  staffLocAt,
}: RepairingWorkflowProps) {
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      order.rentalOrderLines.map((line) => [line.rentalOrderLineId, []]),
    ),
  );

  const itemsDone = order.rentalOrderLines.filter(
    (line) => (itemPhotos[line.rentalOrderLineId]?.length ?? 0) > 0,
  ).length;
  const total = order.rentalOrderLines.length;
  const allPhotographed = itemsDone === total;

  const handleAdd = useCallback((lineId: string, url: string) => {
    setItemPhotos((prev) => ({
      ...prev,
      [lineId]: [...(prev[lineId] ?? []), url],
    }));
  }, []);
  const handleRemove = useCallback((lineId: string, idx: number) => {
    setItemPhotos((prev) => ({
      ...prev,
      [lineId]: (prev[lineId] ?? []).filter((_, j) => j !== idx),
    }));
  }, []);

  // Build full hub address from components
  const hubAddressFull = [
    order.hubAddressLine,
    order.hubWard,
    order.hubDistrict,
    order.hubCity,
  ]
    .filter(Boolean)
    .join(', ');

  // Geocode hub address if coordinates not available
  const [geocodedHubLat, setGeocodedHubLat] = useState<number | undefined>(
    order.hubLatitude ?? undefined,
  );
  const [geocodedHubLng, setGeocodedHubLng] = useState<number | undefined>(
    order.hubLongitude ?? undefined,
  );

  useEffect(() => {
    if (order.hubLatitude != null || !hubAddressFull) return;
    let cancelled = false;
    console.log('[RepairingWorkflow] Geocoding hub address:', hubAddressFull);
    axios
      .get(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(hubAddressFull)}&api_key=${apiKey}`,
      )
      .then((res) => {
        if (cancelled) return;
        console.log('[RepairingWorkflow] Geocode response:', res.data);
        const loc = res.data?.results?.[0]?.geometry?.location;
        console.log('[RepairingWorkflow] Geocoded location:', loc);
        if (loc) {
          setGeocodedHubLat(loc.lat);
          setGeocodedHubLng(loc.lng);
          console.log('[RepairingWorkflow] Set hub coords:', loc.lat, loc.lng);
        }
      })
      .catch((err) => {
        console.error('[RepairingWorkflow] Geocode error:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [hubAddressFull, order.hubLatitude]);

  // Effective hub coordinates
  const effectiveHubLat =
    order.hubLatitude != null ? order.hubLatitude : geocodedHubLat;
  const effectiveHubLng =
    order.hubLongitude != null ? order.hubLongitude : geocodedHubLng;

  return (
    <div className="space-y-4">
      <WorkflowBanner
        icon={Warehouse}
        title="Chuẩn bị hàng tại kho hub"
        desc="Đến hub lấy thiết bị và chụp ảnh kiểm tra từng sản phẩm."
        variant="primary"
      />

      {/* Mobile map - shown at top on mobile */}
      {hubAddressFull && (
        <div className="lg:hidden rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2 shrink-0">
            <Navigation2 className="size-4 text-emerald-500" />
            <span className="text-[13px] font-bold text-foreground">
              Đường đến hub
            </span>
          </div>
          <div className="p-2">
            <DeliveryMiniMap
              destLat={effectiveHubLat ?? undefined}
              destLng={effectiveHubLng ?? undefined}
              destAddress={hubAddressFull || undefined}
              destLabel={order.hubName ?? 'Hub'}
              destPinColor="green"
              staffLat={staffLat}
              staffLng={staffLng}
              mapHeightClass="h-48 sm:h-56 rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ── 2-column grid: left=workflow content, right=minimap (desktop only) ── */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_420px] lg:gap-5">
        {/* Left: Workflow content */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {/* Info cards - stacked vertically */}
          <div className="flex flex-col gap-4">
            <OrderMetaCard order={order} />
            <CustomerInfo order={order} mode="delivery" />
            <RentalDateTimeline order={order} mode="delivery" />
          </div>

          {/* Progress */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Camera className="size-4 text-blue-600" />
              <span className="text-[13px] font-bold text-foreground">
                Tiến độ chụp ảnh
              </span>
              <span
                className={cn(
                  'ml-auto text-[12px] font-black tabular-nums',
                  allPhotographed
                    ? 'text-emerald-600'
                    : 'text-muted-foreground',
                )}
              >
                {itemsDone}/{total}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    allPhotographed ? 'bg-emerald-500' : 'bg-blue-600',
                  )}
                  style={{
                    width: `${total > 0 ? (itemsDone / total) * 100 : 0}%`,
                  }}
                />
              </div>
              {!allPhotographed ? (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0" />
                  Chụp ảnh tất cả {total} thiết bị để kích hoạt nút xuất kho.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Hoàn tất kiểm kho — sẵn sàng xuất hàng.
                </p>
              )}
            </div>
          </div>

          {/* Item cards */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-foreground" />
                <h3 className="text-[13px] font-bold text-foreground">
                  Kiểm tra thiết bị
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                {total} thiết bị
              </span>
            </div>
            <div className="p-3 space-y-3">
              {order.rentalOrderLines.map((line) => (
                <ItemPickupCard
                  key={line.rentalOrderLineId}
                  line={line}
                  photos={itemPhotos[line.rentalOrderLineId] ?? []}
                  onAdd={(url) => handleAdd(line.rentalOrderLineId, url)}
                  onRemove={(idx) => handleRemove(line.rentalOrderLineId, idx)}
                />
              ))}
            </div>
          </div>

          <OrderItemsList order={order} mode="confirm" />

          <RentalSummary order={order} showPickupDate={false} />
        </div>

        {/* Right: MiniMap Panel (desktop only) */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] hidden lg:flex lg:flex-col">
          <MiniMapPanel
            title="Đường đến hub"
            destLat={effectiveHubLat}
            destLng={effectiveHubLng}
            destAddress={hubAddressFull || undefined}
            staffLat={staffLat}
            staffLng={staffLng}
            staffLocAt={staffLocAt}
            destPinColor="green"
            destLabel={order.hubName ?? 'Hub'}
          />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <p className="text-[12px] text-muted-foreground">
            {allPhotographed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                Sẵn sàng xuất kho và giao hàng!
              </span>
            ) : (
              <>
                Còn{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {total - itemsDone}
                </span>{' '}
                thiết bị chưa được chụp ảnh.
              </>
            )}
          </p>
          <Button
            onClick={onStartDelivery}
            disabled={!allPhotographed || loading}
            className={cn(
              'h-10 rounded-lg px-5 text-[13px] font-medium w-full sm:w-auto',
              allPhotographed
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <Truck className="size-4" /> Xuất kho & Giao hàng
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
