'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  Package,
  Camera,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Banknote,
  Info,
  Wifi,
  Navigation2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DashboardOrder, OrderItem } from '@/types/dashboard.types';
import { fmt } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { CameraCapture } from '../CameraCapture';

interface ReturningWorkflowProps {
  order: DashboardOrder;
  onCompleteReturn: (penaltyTotal?: number) => void;
  loading?: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}

function ItemReturnCard({
  item,
  photos,
  penalty,
  onAdd,
  onRemove,
  onPenaltyChange,
}: {
  item: OrderItem;
  photos: string[];
  penalty: string;
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  onPenaltyChange: (val: string) => void;
}) {
  const hasPhoto = photos.length > 0;
  const penaltyNum = Number(penalty);
  const penaltyValid =
    penalty === '' || (Number.isFinite(penaltyNum) && penaltyNum >= 0);
  const penaltyExcessive = penaltyNum > item.deposit_amount * 3;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors space-y-4',
        hasPhoto
          ? penaltyNum > 0
            ? 'border-orange-300/60 bg-orange-50/50 dark:bg-orange-950/10'
            : 'border-success/40 bg-success/5 dark:bg-success/5'
          : 'border-border bg-card',
      )}
    >
      {/* Item header */}
      <div className="flex items-center gap-3">
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
          <p className="text-xs font-semibold text-theme-primary-start mt-1">
            Cọc {fmt(item.deposit_amount)}
          </p>
        </div>
        <div
          className={cn(
            'size-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
            hasPhoto
              ? penaltyNum > 0
                ? 'bg-orange-500 text-white'
                : 'bg-success text-white'
              : 'border-2 border-dashed border-border',
          )}
        >
          {hasPhoto ? (
            penaltyNum > 0 ? (
              <ShieldAlert className="size-3.5" />
            ) : (
              <CheckCircle2 className="size-4" />
            )
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
        label="Chụp ảnh kiểm tra tình trạng thiết bị"
      />

      {/* Penalty input */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="size-3.5 text-orange-500 shrink-0" />
          <label className="text-xs font-bold text-foreground">
            Phí xử lý hư hỏng (nếu có)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              min={0}
              step={1000}
              value={penalty}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                onPenaltyChange(raw);
              }}
              placeholder="0"
              className={cn(
                'pr-12 rounded-xl text-sm font-semibold',
                !penaltyValid || penaltyExcessive
                  ? 'border-destructive focus-visible:ring-destructive'
                  : penaltyNum > 0
                    ? 'border-orange-400 focus-visible:ring-orange-400'
                    : '',
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
              VNĐ
            </span>
          </div>
          {penaltyNum > 0 && (
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0">
              {fmt(penaltyNum)}
            </span>
          )}
        </div>
        {penaltyExcessive && (
          <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
            <Info className="size-3 shrink-0" />
            Phí phạt vượt quá 3× tiền cọc. Vui lòng kiểm tra lại.
          </p>
        )}
        {penaltyNum > 0 && !penaltyExcessive && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5 flex items-center gap-1">
            <AlertTriangle className="size-3 shrink-0" />
            Sẽ trừ vào tiền cọc khi hoàn tất.
          </p>
        )}
      </div>
    </div>
  );
}

export function ReturningWorkflow({
  order,
  onCompleteReturn,
  loading,
  staffLat,
  staffLng,
  staffLocAt,
}: ReturningWorkflowProps) {
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(order.items.map((i) => [i.rental_order_item_id, []])),
  );
  const [itemPenalties, setItemPenalties] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        order.items.map((i) => [
          i.rental_order_item_id,
          i.item_penalty_amount ? String(i.item_penalty_amount) : '',
        ]),
      ),
  );

  const itemsDone = order.items.filter(
    (i) => (itemPhotos[i.rental_order_item_id]?.length ?? 0) > 0,
  ).length;
  const allPhotographed = itemsDone === order.items.length;
  const hasGps = staffLat != null && staffLng != null;

  const totalPenalty = order.items.reduce((sum, item) => {
    const val = Number(itemPenalties[item.rental_order_item_id]);
    return sum + (Number.isFinite(val) && val > 0 ? val : 0);
  }, 0);

  const handleAddPhoto = useCallback((itemId: string, url: string) => {
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] ?? []), url],
    }));
  }, []);

  const handleRemovePhoto = useCallback((itemId: string, idx: number) => {
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((_, j) => j !== idx),
    }));
  }, []);

  const handlePenaltyChange = useCallback((itemId: string, val: string) => {
    setItemPenalties((prev) => ({ ...prev, [itemId]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    onCompleteReturn(totalPenalty > 0 ? totalPenalty : undefined);
  }, [onCompleteReturn, totalPenalty]);

  const hasPenalty = totalPenalty > 0;
  const depositAfterPenalty =
    totalPenalty <= order.total_deposit
      ? order.total_deposit - totalPenalty
      : 0;
  const excessCharge =
    totalPenalty > order.total_deposit ? totalPenalty - order.total_deposit : 0;

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <WorkflowBanner
        icon={RotateCcw}
        title="Thu hồi thiết bị từ khách hàng"
        desc="Chụp ảnh kiểm tra tình trạng từng thiết bị và ghi nhận phí xử lý hư hỏng nếu có. Tất cả thiết bị phải được chụp ảnh trước khi xác nhận."
        variant="warning"
      />

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
        <span className="text-xs font-semibold text-foreground flex-1">
          {staffLat != null
            ? 'GPS đang theo dõi vị trí'
            : 'Đang lấy vị trí GPS…'}
          {staffLocAt && (
            <span className="text-muted-foreground font-normal ml-2">
              · {new Date(staffLocAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </span>
        <Wifi
          className={cn(
            'size-4 shrink-0',
            staffLat != null ? 'text-success' : 'text-muted-foreground',
          )}
        />
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-theme-primary-start" />
            <span className="text-sm font-bold text-foreground">
              Tiến độ kiểm tra thiết bị
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
              allPhotographed ? 'bg-success' : 'bg-purple-500',
            )}
            style={{
              width: `${order.items.length > 0 ? (itemsDone / order.items.length) * 100 : 0}%`,
            }}
          />
        </div>
        {!allPhotographed && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0" />
            Chụp ảnh tất cả {order.items.length} thiết bị thu hồi để tiếp tục.
          </p>
        )}
        {allPhotographed && !hasGps && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0" />
            GPS chưa sẵn sàng. Hệ thống vẫn có thể ghi nhận thu hồi nhưng sẽ
            không kèm tọa độ hiện tại.
          </p>
        )}
      </div>

      {/* Items grid */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Kiểm tra từng thiết bị
            </h3>
          </div>
          <span className="text-xs font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
            {order.items.length} thiết bị
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {order.items.map((item) => (
            <ItemReturnCard
              key={item.rental_order_item_id}
              item={item}
              photos={itemPhotos[item.rental_order_item_id] ?? []}
              penalty={itemPenalties[item.rental_order_item_id] ?? ''}
              onAdd={(url) => handleAddPhoto(item.rental_order_item_id, url)}
              onRemove={(idx) =>
                handleRemovePhoto(item.rental_order_item_id, idx)
              }
              onPenaltyChange={(val) =>
                handlePenaltyChange(item.rental_order_item_id, val)
              }
            />
          ))}
        </div>
      </div>

      {/* Penalty summary */}
      {hasPenalty && (
        <div className="rounded-2xl border border-orange-300/50 bg-orange-50/60 dark:bg-orange-950/15 dark:border-orange-800/30 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-orange-200/60 dark:border-orange-800/30 flex items-center gap-2">
            <ShieldAlert className="size-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-bold text-foreground">
              Tóm tắt phí phạt
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng phí hư hỏng</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {fmt(totalPenalty)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiền đặt cọc</span>
              <span className="font-bold text-foreground">
                {fmt(order.total_deposit)}
              </span>
            </div>
            <div className="pt-2 border-t border-orange-200/50 dark:border-orange-800/30">
              {excessCharge > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-destructive">
                    Khách cần thanh toán thêm
                  </span>
                  <span className="text-base font-black text-destructive">
                    {fmt(excessCharge)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-success">
                    Hoàn cọc cho khách
                  </span>
                  <span className="text-base font-black text-success">
                    {fmt(depositAfterPenalty)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {allPhotographed ? (
            <span className="flex items-center gap-2 text-success font-semibold">
              <CheckCircle2 className="size-4" />
              {hasPenalty
                ? `Hoàn tất kiểm tra — Phí phạt: ${fmt(totalPenalty)}`
                : 'Hoàn tất kiểm tra — Không có hư hỏng.'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Camera className="size-4 shrink-0" />
              Còn {order.items.length - itemsDone} thiết bị chưa được chụp ảnh.
            </span>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!allPhotographed || loading}
          className={cn(
            'h-12 gap-2 rounded-xl px-7 text-[15px] font-bold shrink-0 min-w-52',
            allPhotographed
              ? 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700'
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
              <RotateCcw className="size-4" />
              Xác nhận thu hồi hàng
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
