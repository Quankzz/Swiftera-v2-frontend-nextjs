import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { ItemInspectionCard } from '../ItemInspectionCard';
import { CameraCapture } from '../CameraCapture';

export function ReturningWorkflow({
  order,
  onCompleteReturn,
  loading,
}: {
  order: DashboardOrder;
  onCompleteReturn: () => void;
  loading: boolean;
}) {
  const [sealPhotos, setSealPhotos] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={RotateCcw}
        variant="warning"
        title="Thu hồi sản phẩm từ khách"
        desc="Đến địa chỉ khách, kiểm tra từng sản phẩm, ghi nhận hư hỏng, đóng gói niêm phong và chụp ảnh minh chứng đầy đủ."
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-destructive" />
            <p className="text-sm font-bold text-foreground">
              Kiểm tra & chụp ảnh từng sản phẩm
            </p>
          </div>
          <span className="text-xs font-bold bg-destructive/10 text-destructive border border-destructive/25 px-2 py-1 rounded-lg">
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
              key={`out-${item.rental_order_item_id}`}
              item={item}
              phase="checkout"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ShieldCheck className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Ảnh đóng gói & niêm phong
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Chụp ảnh kiện hàng đã đóng gói và dán niêm phong. Bằng chứng hàng
            trả về đầy đủ.
          </p>
          <CameraCapture
            photos={sealPhotos}
            onAdd={(url) => setSealPhotos((p) => [...p, url])}
            onRemove={(i) => setSealPhotos((p) => p.filter((_, j) => j !== i))}
            label="Chụp ảnh kiện hàng đã niêm phong"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <Button
          size="default"
          onClick={() => onCompleteReturn()}
          disabled={loading}
          className="w-full h-11 gap-2 text-sm font-semibold"
        >
          {loading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4.5" />
          )}
          Hoàn thành thu hồi
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Kiểm tra kỹ tất cả thông tin trước khi xác nhận hoàn thành
        </p>
      </div>
    </div>
  );
}
