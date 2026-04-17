'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  RotateCcw,
  Package,
  Camera,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Info,
  Wifi,
  Navigation2,
  ShieldAlert,
  Clock,
  Pencil,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { StaffOrder, StaffOrderItem } from '@/types/api.types';
import { fmt } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { CameraCapture } from '../CameraCapture';
import { WorkflowFooter } from '../WorkflowFooter';
import {
  getOverduePenaltySuggestion,
  type OverduePenaltySuggestionData,
} from '@/api/rentalOrderApi';

interface ReturningWorkflowProps {
  order: StaffOrder;
  onCompleteReturn: (damagePenalty?: number, overduePenalty?: number) => void;
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
  item: StaffOrderItem;
  photos: string[];
  penalty: string;
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  onPenaltyChange: (val: string) => void;
}) {
  const [penaltyLocked, setPenaltyLocked] = useState(false);
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
          <p className="text-sm text-muted-foreground font-mono mt-0.5">
            {item.serial_number || '—'}
          </p>
          <p className="text-sm font-semibold text-theme-primary-start mt-1">
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
          <label className="text-sm font-bold text-foreground">
            Phí xử lý hư hỏng (nếu có)
          </label>
        </div>

        {penaltyLocked ? (
          /* Locked row */
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex-1 flex items-center gap-2.5 rounded-xl px-4 py-2 border',
                penaltyNum > 0
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/30'
                  : 'bg-success/8 border-success/30',
              )}
            >
              {penaltyNum > 0 ? (
                <ShieldAlert className="size-4 text-orange-500 shrink-0" />
              ) : (
                <CheckCircle2 className="size-4 text-success shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm font-bold flex-1',
                  penaltyNum > 0
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-success',
                )}
              >
                {penaltyNum > 0 ? fmt(penaltyNum) : 'Không có hư hỏng'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPenaltyLocked(false)}
              className="inline-flex items-center gap-1.5 h-10 px-8 rounded-xl border border-border bg-card text-lg font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            >
              <Pencil className="size-4" /> Chỉnh sửa
            </button>
          </div>
        ) : (
          /* Editing row */
          <>
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

              <button
                type="button"
                onClick={() => setPenaltyLocked(true)}
                disabled={penalty === ''}
                className={cn(
                  'inline-flex items-center gap-1.5 h-10 px-8 rounded-xl text-lg font-bold shrink-0 transition-colors',
                  penalty !== ''
                    ? penaltyNum > 0
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-success hover:bg-success/90 text-white'
                    : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                )}
              >
                <CheckCircle2 className="size-4" /> Xác nhận
              </button>
            </div>
            {penaltyNum > 0 && (
              <span className="pl-3 text-sm font-bold text-orange-600 dark:text-orange-400 shrink-0 tabular-nums">
                {fmt(penaltyNum)}
              </span>
            )}
            {penaltyExcessive && (
              <p className="text-sm text-destructive mt-1.5 flex items-center gap-1">
                <Info className="size-3 shrink-0" />
                Phí phạt vượt quá 3× tiền cọc. Vui lòng kiểm tra lại.
              </p>
            )}
            {penaltyNum > 0 && !penaltyExcessive && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="size-3 shrink-0" />
                Sẽ trừ vào tiền cọc khi hoàn tất.
              </p>
            )}
          </>
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
  const [overdueSuggestion, setOverdueSuggestion] =
    useState<OverduePenaltySuggestionData | null>(null);
  const [overdueSuggestionLoading, setOverdueSuggestionLoading] =
    useState(true);
  const [overduePenaltyInput, setOverduePenaltyInput] = useState<string>('');
  const [overdueLocked, setOverdueLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOverduePenaltySuggestion(order.rental_order_id)
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setOverdueSuggestion(data);
        if (data.overdue) {
          setOverduePenaltyInput(String(data.provisionalOverduePenaltyAmount));
        } else {
          // No overdue detected — auto-confirm at 0
          setOverdueLocked(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOverdueSuggestionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [order.rental_order_id]);

  const overduePenalty = Number(overduePenaltyInput) || 0; // allow positive or negative adjustment

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
    onCompleteReturn(
      totalPenalty > 0 ? totalPenalty : undefined,
      overduePenalty !== 0 && Number.isFinite(overduePenalty)
        ? overduePenalty
        : undefined,
    );
  }, [onCompleteReturn, totalPenalty, overduePenalty]);

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
                Người thuê
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
                Địa chỉ thu hồi
              </p>
              <p className="text-[14px] font-medium text-foreground leading-relaxed">
                {order.delivery_address || order.renter.address || '—'}
              </p>
            </div>
          </div>
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
        <span className="text-sm font-semibold text-foreground flex-1">
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
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
            <Info className="size-3.5 shrink-0" />
            Chụp ảnh tất cả {order.items.length} thiết bị thu hồi để tiếp tục.
          </p>
        )}
        {allPhotographed && !hasGps && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
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
          <span className="text-sm font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
            {order.items.length} thiết bị
          </span>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3">
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

      {/* Overdue penalty */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2.5">
          <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-foreground flex-1">
            Phí phạt quá hạn tạm tính
          </h3>
          {overdueSuggestionLoading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="p-5 space-y-4">
          {overdueSuggestion?.overdue && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 p-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Ngày quá hạn
                  </p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {overdueSuggestion.overdueDays}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 p-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Đơn giá / ngày
                  </p>
                  <p className="text-sm font-black text-foreground tabular-nums">
                    {fmt(overdueSuggestion.dailyOverdueRateAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 p-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Đề xuất hệ thống
                  </p>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {fmt(overdueSuggestion.provisionalOverduePenaltyAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700 p-3">
                  <p className="text-sm font-semibold text-muted-foreground mb-1.5">
                    Hạn trả dự kiến
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {overdueSuggestion.expectedRentalEndDate}
                  </p>
                </div>
              </div>
            </div>
          )}
          {!overdueSuggestionLoading &&
            overdueSuggestion &&
            !overdueSuggestion.overdue && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 shrink-0" />
                Hệ thống không phát hiện quá hạn. Nhập thủ công nếu cần.
              </p>
            )}
          <div>
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
              <label className="text-sm font-bold text-foreground">
                Phí phát sinh
              </label>
            </div>

            {overdueLocked ? (
              /* Locked row */
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 px-4 py-2">
                  <CheckCircle2 className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300 flex-1">
                    Đã xác nhận phí quá hạn
                  </span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-300 tabular-nums">
                    {overduePenalty < 0
                      ? `−${fmt(Math.abs(overduePenalty))}`
                      : fmt(overduePenalty)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOverdueLocked(false)}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
                >
                  <Pencil className="size-4" /> Chỉnh sửa
                </button>
              </div>
            ) : (
              /* Editing row */
              <>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      step={10000}
                      value={overduePenaltyInput}
                      onChange={(e) => setOverduePenaltyInput(e.target.value)}
                      placeholder="0"
                      className={cn(
                        'pr-14 rounded-xl text-sm font-semibold',
                        overduePenalty < 0
                          ? 'border-success focus-visible:ring-success'
                          : overduePenalty > 0
                            ? 'border-amber-400 focus-visible:ring-amber-400'
                            : '',
                      )}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                      VNĐ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOverdueLocked(true)}
                    disabled={overduePenaltyInput === ''}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-10 px-8 rounded-xl text-lg font-bold shrink-0 transition-colors',
                      overduePenaltyInput !== ''
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                    )}
                  >
                    <CheckCircle2 className="size-4" /> Xác nhận
                  </button>
                </div>
                <span
                  className={cn(
                    'pl-3 text-sm font-bold shrink-0 tabular-nums w-24 text-right',
                    overduePenalty < 0
                      ? 'text-success'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  {overduePenalty < 0
                    ? `−${fmt(Math.abs(overduePenalty))}`
                    : fmt(overduePenalty)}
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="size-3 shrink-0" />
                    Nhập số dương để cộng thêm phí, số âm để giảm bớt so với đề
                    xuất hệ thống.
                  </p>
                  {overdueSuggestion?.overdue &&
                    overduePenalty !==
                      overdueSuggestion.provisionalOverduePenaltyAmount && (
                      <button
                        type="button"
                        onClick={() =>
                          setOverduePenaltyInput(
                            String(
                              overdueSuggestion.provisionalOverduePenaltyAmount,
                            ),
                          )
                        }
                        className="text-xs text-theme-primary-start underline underline-offset-2 shrink-0 ml-3"
                      >
                        Dùng đề xuất
                      </button>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action footer */}
      <WorkflowFooter>
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[14px] text-muted-foreground flex-1 min-w-0">
            {allPhotographed ? (
              <span className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle2 className="size-5" />
                {hasPenalty
                  ? `Hoàn tất kiểm tra — Phí phạt: ${fmt(totalPenalty)}`
                  : 'Hoàn tất kiểm tra — Không có hư hỏng.'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Camera className="size-5 shrink-0" /> Còn{' '}
                {order.items.length - itemsDone} thiết bị chưa được chụp ảnh.
              </span>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!allPhotographed || loading}
            className={cn(
              'h-16 gap-2 rounded-xl px-7 text-xl font-bold shrink-0 sm:min-w-52',
              allPhotographed
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 dark:bg-purple-600 dark:hover:bg-purple-700'
                : '',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <RotateCcw className="size-5" /> Xác nhận thu hồi hàng
              </>
            )}
          </Button>
        </div>
      </WorkflowFooter>
    </div>
  );
}
