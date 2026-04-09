'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Truck,
  QrCode,
  Camera,
  CheckCircle2,
  Loader2,
  Package,
  Wifi,
  Circle,
  Info,
  Navigation2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder, OrderItem } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { CameraCapture } from '../CameraCapture';
import { QrScanner } from '../QrScanner';

interface DeliveringWorkflowProps {
  order: DashboardOrder;
  onConfirmDelivery: () => void;
  loading?: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}

type Step = 'qr' | 'photos' | 'confirm';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'qr', label: 'Xác minh đơn', icon: QrCode },
  { key: 'photos', label: 'Chụp bằng chứng', icon: Camera },
  { key: 'confirm', label: 'Xác nhận giao', icon: CheckCircle2 },
];

function ItemDeliveryCard({
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
      <CameraCapture
        photos={photos}
        onAdd={onAdd}
        onRemove={onRemove}
        label="Chụp ảnh bàn giao thiết bị"
      />
    </div>
  );
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
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(order.items.map((i) => [i.rental_order_item_id, []])),
  );

  const itemsDone = order.items.filter(
    (i) => (itemPhotos[i.rental_order_item_id]?.length ?? 0) > 0,
  ).length;
  const allPhotographed = itemsDone === order.items.length;
  const hasGps = staffLat != null && staffLng != null;
  const allReady = qrVerified && allPhotographed;

  const currentStep: Step = !qrVerified
    ? 'qr'
    : !allPhotographed
      ? 'photos'
      : 'confirm';

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

  const expectedCode = order.confirmation_code ?? order.rental_order_id;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <WorkflowBanner
        icon={Truck}
        title="Đang trên đường giao hàng"
        desc="Xác minh đơn hàng bằng mã QR, chụp ảnh bàn giao từng thiết bị, sau đó xác nhận hoàn tất giao hàng."
        variant="primary"
      />

      {/* Progress stepper */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const stepOrder: Step[] = ['qr', 'photos', 'confirm'];
            const stepIdx = stepOrder.indexOf(step.key);
            const currentIdx = stepOrder.indexOf(currentStep);
            const isDone = stepIdx < currentIdx;
            const isCurrent = step.key === currentStep;

            return (
              <React.Fragment key={step.key}>
                {idx > 0 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 rounded-full transition-colors',
                      isDone ? 'bg-success' : 'bg-border',
                    )}
                  />
                )}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center transition-colors',
                      isDone
                        ? 'bg-success text-white'
                        : isCurrent
                          ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <StepIcon className="size-4" />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold text-center',
                      isDone
                        ? 'text-success'
                        : isCurrent
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* GPS status */}
      <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
        <div
          className={cn(
            'size-2.5 rounded-full shrink-0',
            staffLat != null
              ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]'
              : 'bg-muted-foreground/40',
          )}
        />
        <Navigation2 className="size-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground">
            {staffLat != null
              ? 'GPS đang theo dõi vị trí'
              : 'Đang lấy vị trí GPS…'}
          </span>
          {staffLocAt && (
            <span className="text-xs text-muted-foreground ml-2">
              · {new Date(staffLocAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
        <Wifi
          className={cn(
            'size-4 shrink-0',
            staffLat != null ? 'text-success' : 'text-muted-foreground',
          )}
        />
      </div>

      {/* Step 1: QR Scan */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div
          className={cn(
            'px-5 py-3.5 border-b border-border flex items-center justify-between',
            qrVerified ? 'bg-success/8' : 'bg-muted/30',
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'size-6 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                qrVerified ? 'bg-success text-white' : 'bg-sky-500 text-white',
              )}
            >
              {qrVerified ? <CheckCircle2 className="size-3.5" /> : '1'}
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Xác minh mã QR đơn hàng
            </h3>
          </div>
          {qrVerified && (
            <span className="text-xs font-bold text-success flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Đã xác minh
            </span>
          )}
        </div>
        <div className="p-5">
          {qrVerified ? (
            <div className="flex items-center gap-3 py-2">
              <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-success">
                  Đơn hàng đã được xác minh
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mã đơn:{' '}
                  <span className="font-mono font-semibold">
                    {order.order_code}
                  </span>
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
              <div className="size-14 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                <QrCode className="size-7 text-sky-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  Quét mã QR để xác minh đơn hàng
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sử dụng camera để quét mã QR trên phiếu đơn hàng.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowQrScanner(true)}
                className="h-11 gap-2 rounded-xl px-5 text-sm font-semibold"
              >
                <QrCode className="size-4" />
                Mở camera quét QR
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Photos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div
          className={cn(
            'px-5 py-3.5 border-b border-border flex items-center justify-between',
            allPhotographed
              ? 'bg-success/8'
              : qrVerified
                ? 'bg-muted/30'
                : 'bg-muted/20',
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'size-6 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                allPhotographed
                  ? 'bg-success text-white'
                  : qrVerified
                    ? 'bg-sky-500 text-white'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {allPhotographed ? <CheckCircle2 className="size-3.5" /> : '2'}
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Chụp ảnh bàn giao thiết bị
            </h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {itemsDone}/{order.items.length}
          </span>
        </div>

        {!qrVerified && (
          <div className="px-5 py-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Circle className="size-4 shrink-0" />
            Hoàn tất xác minh QR để mở bước này.
          </div>
        )}

        {qrVerified && (
          <div className="p-4 space-y-3">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    allPhotographed ? 'bg-success' : 'bg-sky-500',
                  )}
                  style={{
                    width: `${order.items.length > 0 ? (itemsDone / order.items.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-bold shrink-0',
                  allPhotographed
                    ? 'text-success'
                    : 'text-sky-600 dark:text-sky-400',
                )}
              >
                {itemsDone}/{order.items.length}
              </span>
            </div>
            {!allPhotographed && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 shrink-0" />
                Chụp ảnh từng thiết bị trước khi bàn giao cho khách.
              </p>
            )}
            {allPhotographed && !hasGps && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Info className="size-3.5 shrink-0" />
                GPS chưa sẵn sàng. Hệ thống vẫn có thể ghi nhận giao hàng nhưng
                sẽ không kèm tọa độ hiện tại.
              </p>
            )}
            {/* Items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {order.items.map((item) => (
                <ItemDeliveryCard
                  key={item.rental_order_item_id}
                  item={item}
                  photos={itemPhotos[item.rental_order_item_id] ?? []}
                  onAdd={(url) => handleAdd(item.rental_order_item_id, url)}
                  onRemove={(idx) =>
                    handleRemove(item.rental_order_item_id, idx)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {allReady ? (
            <span className="flex items-center gap-2 text-success font-semibold">
              <CheckCircle2 className="size-4" />
              Sẵn sàng xác nhận giao hàng thành công.
            </span>
          ) : !qrVerified ? (
            <span className="flex items-center gap-2">
              <QrCode className="size-4 shrink-0" />
              Bước 1: Quét mã QR xác minh đơn hàng.
            </span>
          ) : (
            <span
              className={cn(
                'flex items-center gap-2',
                allPhotographed &&
                  !hasGps &&
                  'text-amber-600 dark:text-amber-400 font-semibold',
              )}
            >
              {allPhotographed && !hasGps ? (
                <Navigation2 className="size-4 shrink-0" />
              ) : (
                <Camera className="size-4 shrink-0" />
              )}
              {allPhotographed && !hasGps
                ? 'GPS chưa sẵn sàng, vẫn có thể xác nhận giao hàng.'
                : `Bước 2: Còn ${order.items.length - itemsDone} thiết bị chưa chụp ảnh.`}
            </span>
          )}
        </div>
        <Button
          onClick={onConfirmDelivery}
          disabled={!allReady || loading}
          className={cn(
            'h-12 gap-2 rounded-xl px-7 text-[15px] font-bold shrink-0 min-w-52',
            allReady
              ? 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700'
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
              Xác nhận giao hàng thành công
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
