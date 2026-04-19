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
  Circle,
  Info,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StaffOrder, StaffOrderItem } from '@/types/api.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { CameraCapture } from '../CameraCapture';
import { QrScanner } from '../QrScanner';
import { WorkflowFooter } from '../WorkflowFooter';

interface DeliveringWorkflowProps {
  order: StaffOrder;
  onConfirmDelivery: () => void;
  loading?: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}

function ItemDeliveryCard({
  item,
  photos,
  onAdd,
  onRemove,
}: {
  item: StaffOrderItem;
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
}) {
  const hasPhoto = photos.length > 0;
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        hasPhoto
          ? 'border-success/40 bg-success/5 dark:bg-success/8'
          : 'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/50',
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700">
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
          <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug">
            {item.product_name}
          </p>
          <span className="text-[11px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block px-2 py-0.5 rounded-md mt-1.5 truncate max-w-full">
            {item.serial_number || 'SN: Chưa cập nhật'}
          </span>
        </div>
        <div
          className={cn(
            'size-8 rounded-full flex items-center justify-center shrink-0 transition-all',
            hasPhoto
              ? 'bg-success text-white shadow-sm'
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
  const allReady = qrVerified && allPhotographed;

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
    <>
      <div className="space-y-6 pb-20">
        <WorkflowBanner
          icon={Truck}
          title="Đang trên đường giao hàng"
          desc="Xác minh đơn hàng bằng mã QR, chụp ảnh bàn giao từng thiết bị, sau đó xác nhận hoàn tất giao hàng."
          variant="primary"
        />

        {/* Customer info */}
        <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
            <User className="size-4 text-foreground" />
            <h3 className="text-[13px] font-bold text-foreground">
              Thông tin khách hàng & giao hàng
            </h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                <User className="size-4 text-theme-primary-start dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Người nhận
                </p>
                <p className="text-[14px] font-bold text-foreground truncate">
                  {order.renter.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                <Phone className="size-4 text-theme-primary-start dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Điện thoại
                </p>
                <p className="text-[14px] font-bold text-foreground font-mono">
                  {order.renter.phone_number}
                </p>
              </div>
            </div>
            {order.renter.email && (
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                  <Mail className="size-4 text-theme-primary-start dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-[14px] font-medium text-foreground truncate">
                    {order.renter.email}
                  </p>
                </div>
              </div>
            )}
            <div className="sm:col-span-3 flex items-start gap-3 pt-3 border-t border-border/60 dark:border-slate-800">
              <div className="size-10 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                <MapPin className="size-4 text-theme-primary-start dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Địa chỉ giao hàng
                </p>
                <p className="text-[14px] font-medium text-foreground leading-relaxed">
                  {order.delivery_address || order.renter.address || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Verification */}
        <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
          <div
            className={cn(
              'px-5 py-4 border-b border-border/80 dark:border-slate-800 flex items-center justify-between',
              qrVerified ? 'bg-success/8' : 'bg-muted/30 dark:bg-slate-900/50',
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                  qrVerified
                    ? 'bg-success text-white'
                    : 'bg-sky-500 text-white',
                )}
              >
                {qrVerified ? <CheckCircle2 className="size-4" /> : '1'}
              </div>
              <h3 className="text-[15px] font-bold text-foreground">
                Xác minh mã QR đơn hàng
              </h3>
            </div>
            {qrVerified && (
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Đã xác minh
              </span>
            )}
          </div>
          <div className="p-6">
            {qrVerified ? (
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-success">
                    Đơn hàng đã được xác minh
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">
                    Mã đơn:{' '}
                    <span className="font-mono font-semibold text-foreground">
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
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="size-16 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                  <QrCode className="size-8 text-sky-500" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-foreground">
                    Quét mã QR để xác minh đơn hàng
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Sử dụng camera để quét mã QR trên phiếu đơn hàng.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowQrScanner(true)}
                  className="h-11 gap-2 rounded-xl px-5 font-semibold"
                >
                  <QrCode className="size-4" /> Mở camera quét QR
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Photos step */}
        <div
          className={cn(
            'rounded-2xl border dark:border-slate-800 bg-card shadow-sm overflow-hidden',
            allPhotographed ? 'border-success/40' : 'border-border/80',
          )}
        >
          <div
            className={cn(
              'px-5 py-4 border-b dark:border-slate-800 flex items-center justify-between',
              allPhotographed
                ? 'border-success/40 bg-success/8'
                : qrVerified
                  ? 'border-border/80 bg-muted/30 dark:bg-slate-900/50'
                  : 'border-border/80 bg-muted/20 dark:bg-slate-900/30',
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'size-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                  allPhotographed
                    ? 'bg-success text-white'
                    : qrVerified
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-muted-foreground',
                )}
              >
                {allPhotographed ? <CheckCircle2 className="size-4" /> : '2'}
              </div>
              <h3 className="text-[15px] font-bold text-foreground">
                Chụp ảnh bàn giao thiết bị
              </h3>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {itemsDone}/{order.items.length}
            </span>
          </div>

          {!qrVerified ? (
            <div className="p-6 flex items-center gap-3 text-[14px] text-muted-foreground">
              <Circle className="size-5 shrink-0" /> Hoàn tất xác minh QR để mở
              bước này.
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
                <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0" /> Chụp ảnh từng thiết bị
                  trước khi bàn giao cho khách.
                </p>
              )}
              <div className="space-y-3">
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
      </div>

      <WorkflowFooter>
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[14px] text-muted-foreground flex-1 min-w-0">
            {allReady ? (
              <span className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle2 className="size-5" /> Sẵn sàng xác nhận giao hàng
                thành công.
              </span>
            ) : !qrVerified ? (
              <span className="flex items-center gap-2">
                <QrCode className="size-5 shrink-0" /> Bước 1: Quét mã QR xác
                minh đơn hàng.
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Camera className="size-5 shrink-0" />
                {`Bước 2: Còn ${order.items.length - itemsDone} thiết bị chưa chụp ảnh.`}
              </span>
            )}
          </div>
          <Button
            onClick={onConfirmDelivery}
            disabled={!allReady || loading}
            className={cn(
              'h-16 gap-2 rounded-xl px-7 text-xl font-bold shrink-0 sm:min-w-52',
              allReady
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 dark:bg-teal-600 dark:hover:bg-teal-700'
                : '',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <Truck className="size-5" /> Xác nhận giao hàng thành công
              </>
            )}
          </Button>
        </div>
      </WorkflowFooter>
    </>
  );
}
