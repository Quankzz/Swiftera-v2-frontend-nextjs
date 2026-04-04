import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { ItemInspectionCard } from '../ItemInspectionCard';
import { CameraCapture } from '../CameraCapture';
import { fmt } from '../utils';

export function InspectingWorkflow({
  order,
  onComplete,
  loading,
}: {
  order: DashboardOrder;
  onComplete: () => void;
  loading: boolean;
}) {
  const [inspectionPhotos, setInspectionPhotos] = useState<string[]>([]);

  const penaltyAmount = order.total_penalty_amount ?? 0;
  const hasPenalty = penaltyAmount > 0;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={ClipboardList}
        variant="warning"
        title="Đang kiểm định sản phẩm"
        desc="Kiểm tra từng sản phẩm, ghi nhận hư hỏng và chụp ảnh minh chứng. Khi hoàn tất, xác nhận để chuyển sang bước hoàn tất đơn hàng."
      />

      {/* Item inspection cards */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Camera className="size-3.5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Kiểm tra & ghi nhận từng sản phẩm
            </p>
          </div>
          <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 px-2.5 py-1 rounded-lg whitespace-nowrap">
            {order.items.length} sản phẩm
          </span>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chụp nhiều góc độ. Ghi rõ hư hỏng nếu có — đây là căn cứ chính thức
            để tính phí phạt.
          </p>
          {order.items.map((item) => (
            <ItemInspectionCard
              key={`inspect-${item.rental_order_item_id}`}
              item={item}
              phase="checkout"
            />
          ))}
        </div>
      </div>

      {/* Additional documentation photos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Camera className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Ảnh kiểm định tổng thể
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Chụp ảnh toàn bộ sản phẩm sau khi kiểm định để lưu hồ sơ.
          </p>
          <CameraCapture
            photos={inspectionPhotos}
            label="Ảnh kiểm định"
            onAdd={(url) => setInspectionPhotos((p) => [...p, url])}
            onRemove={(idx) =>
              setInspectionPhotos((p) => p.filter((_, i) => i !== idx))
            }
          />
        </div>
      </div>

      {/* Penalty summary if applicable */}
      {hasPenalty && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-destructive mb-1">
                Phí phạt hư hại: {fmt(penaltyAmount)}
              </p>
              <p className="text-xs text-destructive/80">
                Số tiền này sẽ được trừ vào tiền cọc của khách khi hoàn tất đơn
                hàng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete inspection CTA */}
      <div className="rounded-2xl border border-success/25 bg-success/5 p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">
              Hoàn tất kiểm định
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái Hoàn thành và
              tiến hành hoàn cọc cho khách.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          Xác nhận hoàn tất kiểm định
        </Button>
      </div>
    </div>
  );
}
