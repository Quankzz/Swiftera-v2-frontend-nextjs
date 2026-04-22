'use client';

import React, { useState, useCallback } from 'react';
import {
  Truck,
  QrCode,
  Camera,
  CheckCircle2,
  Loader2,
  Circle,
  Info,
  Navigation2,
  XCircle,
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
import { DeliveryMiniMap } from '../DeliveryMiniMap';
import {
  CustomerInfo,
  OrderMetaCard,
  OrderItemsList,
  RentalDateTimeline,
  OverdueAlert,
} from '../OrderInfo';
import { CameraCapture } from '../CameraCapture';
import { QrScanner } from '../QrScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { updateOrderStatus } from '@/api/staff-orders';
function ItemDeliveryCard({
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
            'size-10 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-sm',
            hasPhoto
              ? 'bg-emerald-500 text-white'
              : 'border-2 border-dashed border-border bg-muted',
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
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
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
        label="Chụp ảnh bàn giao"
      />
    </div>
  );
}

interface DeliveringWorkflowProps {
  order: RentalOrderResponse;
  onConfirmDelivery: () => void;
  loading?: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}

export function DeliveringWorkflow({
  order,
  onConfirmDelivery,
  loading,
  staffLat,
  staffLng,
  staffLocAt,
}: DeliveringWorkflowProps) {
  const [qrVerified, setQrVerified] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
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
  const allReady = qrVerified && allPhotographed;

  // Build full customer address
  const customerAddressFull = order.userAddress
    ? [
        order.userAddress.addressLine,
        order.userAddress.district,
        order.userAddress.city,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  // Geocode customer address if coordinates not available
  const [geocodedCustomerLat, setGeocodedCustomerLat] = useState<
    number | undefined
  >(order.deliveredLatitude ?? undefined);
  const [geocodedCustomerLng, setGeocodedCustomerLng] = useState<
    number | undefined
  >(order.deliveredLongitude ?? undefined);

  React.useEffect(() => {
    if (order.deliveredLatitude != null || !customerAddressFull) return;
    let cancelled = false;
    axios
      .get(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(customerAddressFull)}&api_key=${apiKey}`,
      )
      .then((res) => {
        if (cancelled) return;
        const loc = res.data?.results?.[0]?.geometry?.location;
        if (loc) {
          setGeocodedCustomerLat(loc.lat);
          setGeocodedCustomerLng(loc.lng);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [customerAddressFull, order.deliveredLatitude]);

  const effectiveCustomerLat = geocodedCustomerLat;
  const effectiveCustomerLng = geocodedCustomerLng;

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

  const expectedCode = order.rentalOrderId;

  const handleCancel = useCallback(async () => {
    setCancelLoading(true);
    try {
      await updateOrderStatus(order.rentalOrderId, 'CANCELLED');
      window.location.reload();
    } catch {
      setCancelLoading(false);
    }
  }, [order.rentalOrderId]);

  return (
    <div className="space-y-4">
      <WorkflowBanner
        icon={Truck}
        title="Đang trên đường giao hàng"
        desc="Xác minh đơn hàng bằng mã QR, chụp ảnh bàn giao từng thiết bị, sau đó xác nhận hoàn tất."
        variant={order.overdue ? 'danger' : 'primary'}
      />

      {order.overdue && (
        <OverdueAlert
          overdueDays={order.overdueDays ?? 0}
          expectedDate={order.expectedDeliveryDate}
          type="delivery"
        />
      )}

      {/* Mobile map - shown at top on mobile */}
      {customerAddressFull && (
        <div className="lg:hidden rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2 shrink-0">
            <Navigation2 className="size-4 text-red-500" />
            <span className="text-[13px] font-bold text-foreground">
              Bản đồ giao hàng
            </span>
          </div>
          <div className="p-2">
            <DeliveryMiniMap
              destLat={effectiveCustomerLat}
              destLng={effectiveCustomerLng}
              destAddress={customerAddressFull}
              destLabel="Điểm giao"
              destPinColor="red"
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

          {/* QR verification */}
          <div
            className={cn(
              'rounded-2xl border bg-card overflow-hidden transition-colors shadow-sm',
              qrVerified ? 'border-emerald-300/50' : 'border-border',
            )}
          >
            <div
              className={cn(
                'px-4 py-3 border-b flex items-center gap-2.5',
                qrVerified
                  ? 'border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/10'
                  : 'border-border bg-muted/30',
              )}
            >
              <div
                className={cn(
                  'size-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-black',
                  qrVerified
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white',
                )}
              >
                {qrVerified ? <CheckCircle2 className="size-4" /> : '1'}
              </div>
              <h3 className="text-[14px] font-bold text-foreground flex-1">
                Xác minh mã QR đơn hàng
              </h3>
              {qrVerified && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Đã xác minh
                </span>
              )}
            </div>
            <div className="p-4">
              {qrVerified ? (
                <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl p-3 border border-emerald-200/40 dark:border-emerald-800/20">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[14px] font-bold text-emerald-600">
                      Đơn hàng đã được xác minh
                    </p>
                    <p className="text-[12px] text-muted-foreground font-mono">
                      {expectedCode}
                    </p>
                  </div>
                </div>
              ) : showQrScanner ? (
                <QrScanner
                  expectedCode={expectedCode}
                  onSuccess={() => {
                    setQrVerified(true);
                    setShowQrScanner(false);
                  }}
                  onCancel={() => setShowQrScanner(false)}
                  order={order}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center">
                    <QrCode className="size-7 text-blue-500" />
                  </div>
                  <p className="text-[14px] font-bold text-foreground text-center">
                    Quét mã QR để xác minh đơn hàng
                  </p>
                  <p className="text-[12px] text-muted-foreground text-center">
                    Sử dụng camera để quét mã QR trên phiếu đơn hàng.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowQrScanner(true)}
                    className="h-11 gap-2 rounded-xl px-5 text-[13px] font-semibold border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <QrCode className="size-4" /> Mở camera quét QR
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Photo step */}
          <div
            className={cn(
              'rounded-2xl border bg-card overflow-hidden transition-colors shadow-sm',
              allPhotographed ? 'border-emerald-300/50' : 'border-border',
            )}
          >
            <div
              className={cn(
                'px-4 py-3 border-b flex items-center gap-2.5',
                allPhotographed
                  ? 'border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/10'
                  : qrVerified
                    ? 'border-border bg-muted/30'
                    : 'border-border bg-muted/20 opacity-60',
              )}
            >
              <div
                className={cn(
                  'size-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-black',
                  allPhotographed
                    ? 'bg-emerald-500 text-white'
                    : qrVerified
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {allPhotographed ? <CheckCircle2 className="size-4" /> : '2'}
              </div>
              <h3 className="text-[14px] font-bold text-foreground flex-1">
                Chụp ảnh bàn giao
              </h3>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {itemsDone}/{total}
              </span>
            </div>

            {!qrVerified ? (
              <div className="p-4 flex items-center gap-2 text-[13px] text-muted-foreground">
                <Circle className="size-4 shrink-0" />
                Hoàn tất bước 1 (xác minh QR) để mở bước này.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
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
                  <span
                    className={cn(
                      'text-[11px] font-bold shrink-0',
                      allPhotographed ? 'text-emerald-600' : 'text-blue-600',
                    )}
                  >
                    {itemsDone}/{total}
                  </span>
                </div>
                {!allPhotographed && (
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    <Info className="size-3.5 shrink-0" />
                    Chụp ảnh từng thiết bị trước khi bàn giao.
                  </p>
                )}
                <div className="space-y-3">
                  {order.rentalOrderLines.map((line) => (
                    <ItemDeliveryCard
                      key={line.rentalOrderLineId}
                      line={line}
                      photos={itemPhotos[line.rentalOrderLineId] ?? []}
                      onAdd={(url) => handleAdd(line.rentalOrderLineId, url)}
                      onRemove={(idx) =>
                        handleRemove(line.rentalOrderLineId, idx)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <OrderItemsList order={order} mode="confirm" />
        </div>

        {/* Right: MiniMap Panel (desktop only) */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] hidden lg:flex lg:flex-col">
          <MiniMapPanel
            title="Bản đồ giao hàng"
            destLat={effectiveCustomerLat}
            destLng={effectiveCustomerLng}
            destAddress={customerAddressFull ?? undefined}
            staffLat={staffLat}
            staffLng={staffLng}
            staffLocAt={staffLocAt}
            destPinColor="red"
            destLabel="Điểm giao"
          />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <p className="text-[12px] text-muted-foreground flex-1">
              {allReady ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Sẵn sàng xác nhận giao hàng thành công!
                </span>
              ) : !qrVerified ? (
                <span className="flex items-center gap-1.5">
                  <QrCode className="size-3.5" />
                  Bước 1: Quét mã QR xác minh đơn hàng.
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Camera className="size-3.5" />
                  Còn {total - itemsDone} thiết bị chưa chụp ảnh.
                </span>
              )}
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                disabled={loading || cancelLoading}
                className="h-10 rounded-lg px-5 text-[13px] font-medium border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 min-w-[120px]"
              >
                <XCircle className="size-4" />
                Hủy đơn
              </Button>
              <Button
                onClick={onConfirmDelivery}
                disabled={!allReady || loading || cancelLoading}
                className={cn(
                  'h-10 rounded-lg px-5 text-[13px] font-medium min-w-[140px]',
                  allReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang xử lý…
                  </>
                ) : (
                  <>
                    <Truck className="size-4" /> Xác nhận giao
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="size-5 text-red-600 dark:text-red-400" />
              </div>
              Xác nhận hủy đơn hàng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này sẽ cập
              nhật trạng thái đơn hàng sang{' '}
              <span className="font-medium text-foreground">Đã hủy</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[13px] text-muted-foreground">
              Mã đơn:{' '}
              <span className="font-mono font-medium text-foreground">
                {order.rentalOrderId}
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="h-10 rounded-lg"
            >
              Không, giữ đơn
            </Button>
            <Button
              onClick={async () => {
                setShowCancelDialog(false);
                await handleCancel();
              }}
              disabled={cancelLoading}
              className="h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang xử lý…
                </>
              ) : (
                <>Có, hủy đơn</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
