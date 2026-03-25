import React, { useState } from 'react';
import Image from 'next/image';
import { CameraCapture } from './CameraCapture';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OrderItem } from '@/types/dashboard.types';
import { fmt } from './utils';

export function ItemInspectionCard({
  item,
  phase,
}: {
  item: OrderItem;
  phase: 'checkin' | 'checkout';
}) {
  const [photos, setPhotos] = useState<string[]>(() => {
    const url =
      phase === 'checkin' ? item.checkin_photo_url : item.checkout_photo_url;
    return url ? [url] : [];
  });
  const [note, setNote] = useState(item.staff_note ?? '');
  const [penalty, setPenalty] = useState(
    item.item_penalty_amount ? String(item.item_penalty_amount) : '',
  );
  const [penaltyError, setPenaltyError] = useState('');
  const isCheckin = phase === 'checkin';

  const handlePenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPenalty(raw);
    setPenaltyError('');
  };

  const handlePenaltyBlur = () => {
    if (!penalty) return;
    const num = Number(penalty);
    if (num <= 0) {
      setPenaltyError('Số tiền phạt phải lớn hơn 0');
    } else if (num > item.deposit_amount) {
      setPenaltyError(`Vượt quá tiền cọ (${fmt(item.deposit_amount)})`);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
          <Image
            src={item.image_url}
            alt={item.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-tight">
            {item.product_name}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {item.serial_number}
          </p>
          <p className="text-xs font-semibold text-theme-primary-start mt-1">
            Cọc: {fmt(item.deposit_amount)}
          </p>
        </div>
      </div>

      {/* Photos */}
      <CameraCapture
        photos={photos}
        onAdd={(url) => setPhotos((p) => [...p, url])}
        onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))}
        label={isCheckin ? 'Chụp ảnh sản phẩm' : 'Chụp ảnh kiểm tra'}
      />

      {/* Note */}
      <Textarea
        placeholder={
          isCheckin
            ? 'Ghi chú tình trạng: màu sắc, vết trầy, phụ kiện...'
            : 'Chi tiết hư hỏng, thiếu phụ kiện — căn cứ tính phạt.'
        }
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-sm min-h-16 resize-none"
      />

      {/* Penalty (checkout only) */}
      {!isCheckin && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 flex flex-col gap-2">
          <p className="text-xs font-bold text-destructive">
            Phí phạt sản phẩm này (nếu có)
          </p>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tiền (VD: 500000)"
              value={penalty}
              onChange={handlePenaltyChange}
              onBlur={handlePenaltyBlur}
              className="pr-8 text-sm h-9 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              ₫
            </span>
          </div>
          {penaltyError && (
            <p className="text-xs font-semibold text-destructive">
              {penaltyError}
            </p>
          )}
          {!penaltyError && Number(penalty) > 0 ? (
            <p className="text-xs font-bold text-destructive">
              → {fmt(Number(penalty))} khấu trừ cọc
            </p>
          ) : (
            !penaltyError && (
              <p className="text-xs text-muted-foreground">
                Bỏ trống nếu không có hư hỏng
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
