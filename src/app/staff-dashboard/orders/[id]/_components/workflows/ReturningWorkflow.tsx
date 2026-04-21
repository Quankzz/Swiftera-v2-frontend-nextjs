'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  RotateCcw,
  Camera,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  RentalOrderResponse,
  RentalOrderLineResponse,
} from '@/types/api.types';
import { fmt } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { CustomerInfo, OrderMetaCard } from '../OrderInfo';
import { CameraCapture } from '../CameraCapture';
import {
  getOverduePenaltySuggestion,
  type OverduePenaltySuggestionData,
} from '@/api/rentalOrderApi';

interface ReturningWorkflowProps {
  order: RentalOrderResponse;
  onCompleteReturn: (damagePenalty?: number, overduePenalty?: number) => void;
  loading?: boolean;
  staffLat?: number;
  staffLocAt?: string;
}

function ItemReturnCard({
  line,
  photos,
  penalty,
  onAdd,
  onRemove,
  onPenaltyChange,
}: {
  line: RentalOrderLineResponse;
  photos: string[];
  penalty: string;
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  onPenaltyChange: (val: string) => void;
}) {
  const [locked, setLocked] = useState(false);
  const hasPhoto = photos.length > 0;
  const penaltyNum = Number(penalty) || 0;
  const depositSnapshot = line.depositAmountSnapshot ?? 0;
  const excessive = penaltyNum > depositSnapshot * 3;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-3 transition-colors',
        hasPhoto
          ? penaltyNum > 0
            ? 'border-orange-300/60 bg-orange-50/50 dark:bg-orange-950/10'
            : 'border-emerald-300/50 bg-emerald-50/30 dark:bg-emerald-950/5'
          : 'border-border bg-card',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-foreground line-clamp-1">
            {line.productNameSnapshot}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {line.inventorySerialNumber || '—'}
          </p>
          <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
            Cọc: {fmt(depositSnapshot)}
          </p>
        </div>
        <div
          className={cn(
            'size-8 shrink-0 rounded-full flex items-center justify-center transition-colors shadow-sm',
            hasPhoto
              ? penaltyNum > 0
                ? 'bg-orange-500 text-white'
                : 'bg-emerald-500 text-white'
              : 'border-2 border-dashed border-border',
          )}
        >
          {hasPhoto ? (
            penaltyNum > 0 ? (
              <ShieldAlert className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )
          ) : (
            <Camera className="size-3.5 text-muted-foreground/50" />
          )}
        </div>
      </div>

      <CameraCapture
        photos={photos}
        onAdd={onAdd}
        onRemove={onRemove}
        label="Chụp ảnh kiểm tra tình trạng"
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-3.5 text-orange-500 shrink-0" />
          <label className="text-[12px] font-bold text-foreground">
            Phí hư hỏng (nếu có)
          </label>
        </div>

        {locked ? (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex-1 rounded-xl px-3 py-2 border',
                penaltyNum > 0
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/40 dark:border-emerald-800/30',
              )}
            >
              <p
                className={cn(
                  'text-[13px] font-bold',
                  penaltyNum > 0
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-emerald-700 dark:text-emerald-300',
                )}
              >
                {penaltyNum > 0 ? fmt(penaltyNum) : 'Không có hư hỏng'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocked(false)}
              className="h-9 px-3 rounded-xl border border-border bg-card text-[13px] font-semibold text-muted-foreground hover:bg-accent transition-colors shrink-0"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                value={penalty}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  onPenaltyChange(raw);
                }}
                placeholder="0"
                className={cn(
                  'pr-10 rounded-xl text-[13px] font-semibold h-9',
                  excessive
                    ? 'border-red-400 focus-visible:ring-red-400'
                    : penaltyNum > 0
                      ? 'border-orange-400 focus-visible:ring-orange-400'
                      : '',
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
                đ
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLocked(true)}
              disabled={penalty === ''}
              className={cn(
                'h-9 px-4 rounded-xl font-bold text-[13px] shrink-0 transition-colors',
                penalty !== ''
                  ? penaltyNum > 0
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
              )}
            >
              <CheckCircle2 className="size-4 inline mr-1" />
              OK
            </button>
          </div>
        )}

        {excessive && (
          <p className="text-[11px] text-red-500 flex items-center gap-1">
            <Info className="size-3 shrink-0" />
            Phí vượt quá 3× cọc. Kiểm tra lại.
          </p>
        )}
        {penaltyNum > 0 && !excessive && (
          <p className="text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <AlertTriangle className="size-3 shrink-0" />
            Trừ vào tiền cọc khi hoàn tất.
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
  staffLocAt,
}: ReturningWorkflowProps) {
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      order.rentalOrderLines.map((line) => [line.rentalOrderLineId, []]),
    ),
  );
  const [itemPenalties, setItemPenalties] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        order.rentalOrderLines.map((line) => [
          line.rentalOrderLineId,
          line.itemPenaltyAmount ? String(line.itemPenaltyAmount) : '',
        ]),
      ),
  );

  const [overdueSuggestion, setOverdueSuggestion] =
    useState<OverduePenaltySuggestionData | null>(null);
  const [overdueLoading, setOverdueLoading] = useState(true);
  const [overdueInput, setOverdueInput] = useState('');
  const [overdueLocked, setOverdueLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOverduePenaltySuggestion(order.rentalOrderId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data.data;
        setOverdueSuggestion(data);
        if (data.overdue) {
          setOverdueInput(String(data.provisionalOverduePenaltyAmount ?? 0));
        } else {
          setOverdueLocked(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOverdueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [order.rentalOrderId]);

  const overduePenalty = Number(overdueInput) || 0;

  const itemsDone = order.rentalOrderLines.filter(
    (line) => (itemPhotos[line.rentalOrderLineId]?.length ?? 0) > 0,
  ).length;
  const total = order.rentalOrderLines.length;
  const allPhotographed = itemsDone === total;

  const totalDamagePenalty = order.rentalOrderLines.reduce((sum, line) => {
    const v = Number(itemPenalties[line.rentalOrderLineId]) || 0;
    return sum + (v > 0 ? v : 0);
  }, 0);

  const handleAddPhoto = useCallback((lineId: string, url: string) => {
    setItemPhotos((prev) => ({
      ...prev,
      [lineId]: [...(prev[lineId] ?? []), url],
    }));
  }, []);

  const handleRemovePhoto = useCallback((lineId: string, idx: number) => {
    setItemPhotos((prev) => ({
      ...prev,
      [lineId]: (prev[lineId] ?? []).filter((_, j) => j !== idx),
    }));
  }, []);

  const handlePenaltyChange = useCallback((lineId: string, val: string) => {
    setItemPenalties((prev) => ({ ...prev, [lineId]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    onCompleteReturn(
      totalDamagePenalty > 0 ? totalDamagePenalty : undefined,
      overduePenalty > 0 ? overduePenalty : undefined,
    );
  }, [onCompleteReturn, totalDamagePenalty, overduePenalty]);

  const deposit = order.depositHoldAmount ?? 0;
  const depositAfter = Math.max(
    0,
    deposit - totalDamagePenalty - overduePenalty,
  );
  const excessCharge =
    totalDamagePenalty + overduePenalty > deposit
      ? totalDamagePenalty + overduePenalty - deposit
      : 0;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <WorkflowBanner
        icon={RotateCcw}
        title="Thu hồi thiết bị từ khách hàng"
        desc="Chụp ảnh kiểm tra tình trạng từng thiết bị và ghi nhận phí hư hỏng nếu có. Tất cả thiết bị phải được chụp ảnh trước khi xác nhận."
        variant="warning"
      />

      {/* GPS status */}
      <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
        <div
          className={cn(
            'size-2.5 rounded-full shrink-0',
            staffLat != null
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-muted-foreground/40',
          )}
        />
        <p className="text-[12px] font-semibold text-foreground flex-1">
          {staffLat != null ? 'GPS đang theo dõi vị trí' : 'Đang lấy vị trí…'}
          {staffLocAt && (
            <span className="text-muted-foreground font-normal ml-2">
              · {new Date(staffLocAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </p>
      </div>

      {/* ── 2-column grid: left=info cards, right=items+penalties ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          <OrderMetaCard order={order} />

          <CustomerInfo order={order} mode="pickup" />
        </div>

        {/* Right: Items + Penalties */}
        <div className="flex flex-col gap-4">
          {/* Progress */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Camera className="size-4 text-purple-500" />
              <span className="text-[13px] font-bold text-foreground">
                Tiến độ kiểm tra
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
                    allPhotographed ? 'bg-emerald-500' : 'bg-purple-500',
                  )}
                  style={{
                    width: `${total > 0 ? (itemsDone / total) * 100 : 0}%`,
                  }}
                />
              </div>
              {!allPhotographed && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0" />
                  Chụp ảnh tất cả {total} thiết bị thu hồi để tiếp tục.
                </p>
              )}
              {allPhotographed && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Hoàn tất kiểm tra — sẵn sàng xác nhận thu hồi.
                </p>
              )}
            </div>
          </div>

          {/* Item cards */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-orange-500" />
                <h3 className="text-[13px] font-bold text-foreground">
                  Kiểm tra từng thiết bị
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-muted text-muted-foreground px-2 py-1 rounded-lg">
                {total} thiết bị
              </span>
            </div>
            <div className="p-3 space-y-3">
              {order.rentalOrderLines.map((line) => (
                <ItemReturnCard
                  key={line.rentalOrderLineId}
                  line={line}
                  photos={itemPhotos[line.rentalOrderLineId] ?? []}
                  penalty={itemPenalties[line.rentalOrderLineId] ?? ''}
                  onAdd={(url) => handleAddPhoto(line.rentalOrderLineId, url)}
                  onRemove={(idx) =>
                    handleRemovePhoto(line.rentalOrderLineId, idx)
                  }
                  onPenaltyChange={(val) =>
                    handlePenaltyChange(line.rentalOrderLineId, val)
                  }
                />
              ))}
            </div>
          </div>

          {/* Penalty summary */}
          {(totalDamagePenalty > 0 || overduePenalty > 0) && (
            <div className="rounded-2xl border border-orange-300/50 bg-orange-50/60 dark:bg-orange-950/15 dark:border-orange-800/30 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-orange-200/40 dark:border-orange-800/30 flex items-center gap-2">
                <ShieldAlert className="size-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-[13px] font-bold text-foreground">
                  Tóm tắt phí phạt
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {totalDamagePenalty > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <span className="text-[13px] text-muted-foreground">
                      Phí hư hỏng
                    </span>
                    <span className="text-[14px] font-bold text-orange-600 dark:text-orange-400">
                      {fmt(totalDamagePenalty)}
                    </span>
                  </div>
                )}
                {overduePenalty > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg">
                    <span className="text-[13px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="size-3.5" /> Phí quá hạn
                    </span>
                    <span className="text-[14px] font-bold text-amber-600 dark:text-amber-400">
                      {fmt(overduePenalty)}
                    </span>
                  </div>
                )}
                <div className="border-t border-orange-200/50 dark:border-orange-800/30 pt-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-orange-700 dark:text-orange-300">
                    {excessCharge > 0
                      ? 'Thu thêm từ khách'
                      : 'Hoàn cọc cho khách'}
                  </span>
                  <span
                    className={cn(
                      'text-[16px] font-black',
                      excessCharge > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {excessCharge > 0 ? fmt(excessCharge) : fmt(depositAfter)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Overdue penalty card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Clock className="size-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-[13px] font-bold text-foreground flex-1">
                Phí phạt quá hạn
              </h3>
              {overdueLoading && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="p-4 space-y-3">
              {overdueSuggestion?.overdue && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 p-3">
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2">
                    Đề xuất hệ thống
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/50 p-2">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Quá hạn
                      </p>
                      <p className="text-[14px] font-black text-amber-600 dark:text-amber-400">
                        {overdueSuggestion.overdueDays} ngày
                      </p>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-900 border border-border/50 p-2">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Đề xuất
                      </p>
                      <p className="text-[14px] font-black text-amber-600 dark:text-amber-400">
                        {fmt(
                          overdueSuggestion.provisionalOverduePenaltyAmount ??
                            0,
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setOverdueInput(
                        String(
                          overdueSuggestion.provisionalOverduePenaltyAmount ??
                            0,
                        ),
                      )
                    }
                    className="text-[11px] text-blue-600 underline underline-offset-2 mt-2"
                  >
                    Dùng đề xuất
                  </button>
                </div>
              )}

              {!overdueLoading &&
                overdueSuggestion &&
                !overdueSuggestion.overdue && (
                  <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    <Info className="size-3.5 shrink-0" />
                    Không phát hiện quá hạn. Nhập thủ công nếu cần.
                  </p>
                )}

              {overdueLocked ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-xl px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
                    <p className="text-[13px] font-bold text-amber-700 dark:text-amber-300">
                      {overduePenalty > 0
                        ? fmt(overduePenalty)
                        : 'Không có phí quá hạn'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOverdueLocked(false)}
                    className="h-9 px-3 rounded-xl border border-border bg-card text-[13px] font-semibold text-muted-foreground hover:bg-accent shrink-0"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={overdueInput}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          setOverdueInput(raw);
                        }}
                        placeholder="0"
                        className={cn(
                          'pr-10 rounded-xl text-[13px] font-semibold h-9',
                          overduePenalty > 0
                            ? 'border-amber-400 focus-visible:ring-amber-400'
                            : '',
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
                        đ
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOverdueLocked(true)}
                      disabled={overdueInput === ''}
                      className={cn(
                        'h-9 px-4 rounded-xl font-bold text-[13px] shrink-0 transition-colors',
                        overdueInput !== ''
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
                      )}
                    >
                      <CheckCircle2 className="size-4 inline mr-1" />
                      OK
                    </button>
                  </div>
                  {overduePenalty > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      Sẽ trừ vào tiền cọc khi hoàn tất.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <p className="text-[12px] text-muted-foreground">
            {allPhotographed ? (
              totalDamagePenalty + overduePenalty > 0 ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  Hoàn tất — Phí phạt:{' '}
                  <strong>{fmt(totalDamagePenalty + overduePenalty)}</strong>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Hoàn tất kiểm tra — Không có hư hỏng.
                </span>
              )
            ) : (
              <>
                Còn{' '}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {total - itemsDone}
                </span>{' '}
                thiết bị chưa được chụp ảnh.
              </>
            )}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!allPhotographed || loading}
            className={cn(
              'h-10 rounded-lg px-5 text-[13px] font-medium shrink-0',
              allPhotographed
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <RotateCcw className="size-4" /> Xác nhận thu hồi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
