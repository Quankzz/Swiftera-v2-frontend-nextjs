'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ClipboardList,
  Package,
  CheckCircle2,
  Loader2,
  Camera,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { CameraCapture } from '../CameraCapture';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt } from '../utils';

export function PickedUpWorkflow({
  order,
  onSaveInspection,
  loading,
}: {
  order: DashboardOrder;
  onSaveInspection: () => void;
  loading: boolean;
}) {
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [itemPhotos, setItemPhotos] = useState<Record<string, string[]>>({});
  const [checkedReady, setCheckedReady] = useState(false);

  const addPhoto = (id: string, url: string) =>
    setItemPhotos((p) => ({ ...p, [id]: [...(p[id] ?? []), url] }));
  const removePhoto = (id: string, idx: number) =>
    setItemPhotos((p) => ({
      ...p,
      [id]: (p[id] ?? []).filter((_, j) => j !== idx),
    }));

  const photographedCount = order.items.filter(
    (i) => (itemPhotos[i.rental_order_item_id]?.length ?? 0) > 0,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={ClipboardList}
        title="Đã lấy hàng — Kiểm tra tình trạng"
        desc="Chụp ảnh và ghi nhận tình trạng từng thiết bị trả về trước khi bắt đầu kiểm định chính thức."
        variant="primary"
      />

      {/* ── Items Inspection ── */}
      <Section
        title={`Kiểm tra từng thiết bị (${order.items.length})`}
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
            const id = item.rental_order_item_id;
            const photos = itemPhotos[id] ?? [];
            const note = itemNotes[id] ?? '';
            const isPoor = false;

            return (
              <div
                key={id}
                className={cn(
                  'rounded-2xl border p-4 flex flex-col gap-4 transition-colors',
                  isPoor
                    ? 'border-destructive/25 bg-destructive/3'
                    : 'border-border bg-muted/15',
                )}
              >
                {/* Item Header */}
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
                    <div className="flex items-center gap-1 mt-0.5">
                      <Hash className="size-3 text-muted-foreground" />
                      <p className="text-xs font-mono text-muted-foreground">
                        {item.serial_number}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cọc: {fmt(item.deposit_amount)}
                    </p>
                  </div>
                </div>

                {/* Camera Capture */}
                <CameraCapture
                  photos={photos}
                  onAdd={(url) => addPhoto(id, url)}
                  onRemove={(idx) => removePhoto(id, idx)}
                  label={
                    isPoor
                      ? 'Chụp ảnh hư hỏng (CHECKIN)'
                      : 'Chụp ảnh tình trạng (CHECKIN)'
                  }
                />

                {/* Note */}
                <Textarea
                  placeholder={
                    isPoor
                      ? 'Mô tả chi tiết hư hỏng: vết trầy, vỡ, thiếu phụ kiện... (căn cứ tính phạt)'
                      : 'Ghi chú tình trạng tổng thể (không bắt buộc)'
                  }
                  value={note}
                  onChange={(e) =>
                    setItemNotes((prev) => ({ ...prev, [id]: e.target.value }))
                  }
                  className={cn(
                    'text-sm min-h-16 resize-none',
                    isPoor && 'border-destructive/40',
                  )}
                />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Confirm ── */}
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
        <input
          type="checkbox"
          checked={checkedReady}
          onChange={(e) => setCheckedReady(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded accent-indigo-600"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Tôi đã chụp ảnh và ghi chú tình trạng thiết bị. Sẵn sàng xác nhận hoàn
          thành kiểm tra và xác định phí phạt (nếu có).
        </span>
      </label>

      {/* ── CTA ── */}
      <Button
        onClick={onSaveInspection}
        disabled={loading || !checkedReady}
        size="lg"
        className="w-full h-14 text-base font-bold gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ClipboardList className="size-5" />
        )}
        Lưu dữ liệu kiểm chứng và chuyển bước thanh toán/phạt →
      </Button>
    </div>
  );
}
