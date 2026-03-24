import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Camera,
  ShieldCheck,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { ItemInspectionCard } from '../ItemInspectionCard';
import { CameraCapture } from '../CameraCapture';
import { fmt } from '../utils';

export function ReturningWorkflow({
  order,
  onCompleteReturn,
  loading,
}: {
  order: DashboardOrder;
  onCompleteReturn: (penalty: number) => void;
  loading: boolean;
}) {
  const [sealPhotos, setSealPhotos] = useState<string[]>([]);
  const [penaltyInput, setPenaltyInput] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyError, setPenaltyError] = useState('');
  const [penalties, setPenalties] = useState<
    { amount: number; reason: string }[]
  >([]);
  const totalPenalty = penalties.reduce((s, p) => s + p.amount, 0);

  const handlePenaltyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setPenaltyInput(raw);
    setPenaltyError('');
  };

  const addPenalty = () => {
    const amount = Number(penaltyInput);
    if (amount <= 0) {
      setPenaltyError('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!penaltyReason.trim()) {
      setPenaltyError('Vui lòng nhập lý do phạt');
      return;
    }
    setPenalties((prev) => [...prev, { amount, reason: penaltyReason.trim() }]);
    setPenaltyInput('');
    setPenaltyReason('');
    setPenaltyError('');
  };

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

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <AlertCircle className="size-4 text-destructive" />
          <p className="text-sm font-bold text-foreground">
            Ghi nhận phí phạt (nếu có)
          </p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {penalties.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-xl border border-destructive/25 bg-destructive/5 p-3">
              {penalties.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{p.reason}</span>
                  <span className="font-bold text-destructive">
                    {fmt(p.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-destructive/20 pt-2 flex justify-between text-sm font-bold">
                <span className="text-foreground">Tổng phạt</span>
                <span className="text-destructive">{fmt(totalPenalty)}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Số tiền phạt (VD: 500000)"
              value={penaltyInput}
              onChange={handlePenaltyInputChange}
              className="flex-1 text-sm h-10 font-mono"
            />
            <Input
              placeholder="Lý do (VD: vỡ màn hình...)"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              className="flex-1 text-sm h-10"
            />
            <Button
              variant="destructive"
              onClick={addPenalty}
              className="gap-1.5 shrink-0 h-10 text-sm"
            >
              + Thêm
            </Button>
          </div>
          {penaltyError && (
            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              {penaltyError}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <Button
          size="lg"
          onClick={() => onCompleteReturn(totalPenalty)}
          disabled={loading}
          className="w-full gap-2 text-base"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
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
