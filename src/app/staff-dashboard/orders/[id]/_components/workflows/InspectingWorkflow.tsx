'use client';

/**
 * InspectingWorkflow — Trạng thái INSPECTING
 *
 * Kiểm định chính thức: staff xem ảnh đã chụp, đặt mức phí phạt per item,
 * tổng hợp → gọi API setPenalty → updateOrderStatus('COMPLETED').
 * onComplete(penaltyTotal) được gọi từ page.tsx, sẽ handle cả setPenalty và transition.
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Warehouse,
  Package,
  CheckCircle2,
  Loader2,
  Camera,
  AlertTriangle,
  Hash,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { CameraCapture } from '../CameraCapture';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt } from '../utils';

export function InspectingWorkflow({
  order,
  onComplete,
  loading,
}: {
  order: DashboardOrder;
  onComplete: (penaltyTotal: number) => void;
  loading: boolean;
}) {
  // Per-item: damage photos + penalty input
  const [itemDamagePhotos, setItemDamagePhotos] = useState<
    Record<string, string[]>
  >({});
  const [itemPenalties, setItemPenalties] = useState<Record<string, string>>(
    {},
  );
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [expandedItem, setExpandedItem] = useState<string | null>(
    order.items[0]?.rental_order_item_id ?? null,
  );
  const [confirmedNoPenalty, setConfirmedNoPenalty] = useState(false);

  const addPhoto = (id: string, url: string) =>
    setItemDamagePhotos((p) => ({ ...p, [id]: [...(p[id] ?? []), url] }));
  const removePhoto = (id: string, idx: number) =>
    setItemDamagePhotos((p) => ({
      ...p,
      [id]: (p[id] ?? []).filter((_, j) => j !== idx),
    }));

  // Computed totals
  const itemPenaltyTotals = useMemo(
    () =>
      Object.fromEntries(
        order.items.map((i) => [
          i.rental_order_item_id,
          Number(itemPenalties[i.rental_order_item_id] ?? 0) || 0,
        ]),
      ),
    [itemPenalties, order.items],
  );

  const totalPenalty = useMemo(
    () => Object.values(itemPenaltyTotals).reduce((a, b) => a + b, 0),
    [itemPenaltyTotals],
  );

  const netRefund = Math.max(0, order.total_deposit - totalPenalty);
  const hasPenalty = totalPenalty > 0;

  const canSubmit = hasPenalty ? true : confirmedNoPenalty;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Warehouse}
        title="Kiểm định tình trạng thiết bị"
        desc="Xem xét và ghi nhận hư hỏng, đặt mức phí phạt cho từng thiết bị (nếu có), rồi xác nhận để tất toán đơn hàng."
        variant={hasPenalty ? 'danger' : 'primary'}
      />

      {/* ── Per-item damage assessment ── */}
      <Section
        title={`Kiểm định từng thiết bị (${order.items.length})`}
        icon={Package}
        defaultOpen
      >
        <div className="flex flex-col gap-4 pt-3">
          {order.items.map((item) => {
            const id = item.rental_order_item_id;
            const photos = itemDamagePhotos[id] ?? [];
            const penaltyStr = itemPenalties[id] ?? '';
            const penaltyNum = Number(penaltyStr) || 0;
            const note = itemNotes[id] ?? '';
            const isExpanded = expandedItem === id;
            const hasIssue = penaltyNum > 0 || photos.length > 0;

            return (
              <div
                key={id}
                className={cn(
                  'rounded-2xl border overflow-hidden transition-colors',
                  hasIssue ? 'border-destructive/25' : 'border-border',
                )}
              >
                {/* Item header row — click to toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedItem(isExpanded ? null : id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors text-left"
                >
                  <div className="relative size-11 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="44px"
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
                    <div className="flex items-center gap-1 mt-0.5">
                      <Hash className="size-3 text-muted-foreground" />
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.serial_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {penaltyNum > 0 && (
                      <span className="text-sm font-black text-destructive tabular-nums">
                        -{fmt(penaltyNum)}
                      </span>
                    )}
                    {hasIssue ? (
                      <AlertTriangle className="size-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="size-4 text-success" />
                    )}
                    <ChevronDown
                      className={cn(
                        'size-4 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {/* Expanded content */}
                <div
                  className={cn(
                    'grid transition-all duration-200 ease-in-out',
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border/30 pt-4">
                      {/* Damage photos */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                          Ảnh hư hỏng (nếu có)
                        </p>
                        <CameraCapture
                          photos={photos}
                          onAdd={(url) => addPhoto(id, url)}
                          onRemove={(idx) => removePhoto(id, idx)}
                          label="Chụp ảnh thiệt hại / hư hỏng"
                        />
                      </div>

                      {/* Damage note */}
                      <Textarea
                        placeholder="Mô tả chi tiết hư hỏng, thiếu phụ kiện, vết trầy xước… (căn cứ tính phạt)"
                        value={note}
                        onChange={(e) =>
                          setItemNotes((p) => ({ ...p, [id]: e.target.value }))
                        }
                        className="text-sm min-h-16 resize-none"
                      />

                      {/* Penalty Amount */}
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                        <p className="text-xs font-bold text-destructive mb-2">
                          Phí phạt cho thiết bị này (để trống nếu không có)
                        </p>
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Nhập số tiền phạt (VD: 500000)"
                            value={penaltyStr}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              setItemPenalties((p) => ({ ...p, [id]: raw }));
                            }}
                            className="pr-12 text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                            ₫
                          </span>
                        </div>
                        {penaltyNum > item.deposit_amount && (
                          <p className="text-xs text-destructive font-semibold mt-1.5">
                            ⚠ Vượt quá tiền cọc ({fmt(item.deposit_amount)})
                          </p>
                        )}
                        {penaltyNum > 0 && (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            = {fmt(penaltyNum)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Penalty Summary ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Tổng kết tài chính
        </p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Tiền đặt cọc đang giữ
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {fmt(order.total_deposit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng phí phạt</span>
            <span
              className={cn(
                'text-sm font-bold tabular-nums',
                totalPenalty > 0 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {totalPenalty > 0 ? `-${fmt(totalPenalty)}` : '0 ₫'}
            </span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Hoàn cọc cho khách
            </span>
            <span
              className={cn(
                'text-lg font-black tabular-nums',
                netRefund > 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {fmt(netRefund)}
            </span>
          </div>
        </div>
      </div>

      {/* ── No-penalty confirmation ── */}
      {!hasPenalty && (
        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
          <input
            type="checkbox"
            checked={confirmedNoPenalty}
            onChange={(e) => setConfirmedNoPenalty(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded accent-success"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            Xác nhận tất cả thiết bị trả về đều nguyên vẹn,{' '}
            <strong className="text-foreground">không có phí phạt</strong>. Hoàn
            trả toàn bộ tiền cọc ({fmt(order.total_deposit)}) cho khách hàng.
          </span>
        </label>
      )}

      {/* ── CTA ── */}
      <Button
        onClick={() => onComplete(totalPenalty)}
        disabled={loading || !canSubmit}
        size="lg"
        className={cn(
          'w-full h-14 text-base font-bold gap-2 rounded-2xl text-white disabled:opacity-50',
          hasPenalty
            ? 'bg-destructive hover:bg-destructive/90'
            : 'bg-success hover:bg-success/90',
        )}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-5" />
        )}
        {hasPenalty
          ? `Xác nhận phạt ${fmt(totalPenalty)} → Hoàn thành đơn`
          : 'Xác nhận không có phạt → Hoàn thành đơn'}
      </Button>
    </div>
  );
}
