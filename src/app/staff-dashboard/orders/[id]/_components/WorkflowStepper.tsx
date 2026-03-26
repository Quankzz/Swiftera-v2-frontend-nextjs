import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/dashboard.types';
import {
  CheckCircle2,
  ClipboardList,
  Package,
  RotateCcw,
  Truck,
  Warehouse,
  X,
  AlertCircle,
} from 'lucide-react';

export const WORKFLOW_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'PENDING', label: 'Xác nhận', icon: ClipboardList },
  { key: 'CONFIRMED', label: 'Lấy hàng', icon: Warehouse },
  { key: 'DELIVERING', label: 'Giao hàng', icon: Truck },
  { key: 'ACTIVE', label: 'Đang thuê', icon: Package },
  { key: 'RETURNING', label: 'Thu hồi', icon: RotateCcw },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
];

export function getStepIndex(status: OrderStatus): number {
  if (status === 'OVERDUE') return 3;
  const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function WorkflowStepper({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 flex items-center gap-3">
        <X className="size-5 text-destructive shrink-0" />
        <p className="text-base font-bold text-destructive">
          Đơn hàng đã bị hủy
        </p>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);
  const isOverdue = status === 'OVERDUE';

  return (
    <div className="max-w-full mx-auto rounded-2xl border border-border bg-card px-5 pt-4 pb-5 overflow-x-auto">
      {isOverdue && (
        <div className="flex items-center gap-2 mb-4 rounded-xl bg-destructive/10 border border-destructive/25 px-3 py-2">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-bold text-destructive">
            Đơn quá hạn — cần khởi động thu hồi ngay
          </p>
        </div>
      )}

      {/* Container chính: Sử dụng flex, loại bỏ gap */}
      <div className="flex items-start mx-auto w-max min-w-full justify-center">
        {WORKFLOW_STEPS.map((step, idx) => {
          const StepIcon = step.icon;

          // Logic trạng thái của Circle icon
          const isCircleCompleted = idx < currentIdx;
          const isCircleCurrent = idx === currentIdx;
          const isCircleUpcoming = idx > currentIdx;

          const isFirst = idx === 0;

          return (
            // Fragment z-10 để icon nằm trên đường line
            <React.Fragment key={step.key}>
              {/* 1. Đường line nối phía trước (Leading Line) - Không vẽ cho step đầu tiên */}
              {!isFirst && (
                <div
                  className={cn(
                    'h-0.5 mt-4.5 rounded-full transition-all duration-300 ease-in-out flex-1 min-w-10 -mx-1',
                    // Đường line nối ĐẾN step hiện tại hoặc các step đã qua thì màu xanh
                    idx <= currentIdx ? 'bg-success' : 'bg-border',
                  )}
                />
              )}

              {/* 2. Cụm Icon và Label */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 relative z-10 bg-card px-1">
                {/* Circle Icon */}
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCircleCompleted && 'border-success bg-success/10',
                    isCircleCurrent &&
                      !isOverdue &&
                      'border-theme-primary-start bg-theme-primary-start shadow-md',
                    isCircleCurrent &&
                      isOverdue &&
                      'border-destructive bg-destructive shadow-md',
                    isCircleUpcoming && 'border-border bg-muted',
                  )}
                >
                  {isCircleCompleted ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <StepIcon
                      className={cn(
                        'size-4',
                        isCircleCurrent && 'text-white',
                        isCircleUpcoming && 'text-muted-foreground',
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'text-center text-sm font-semibold leading-tight max-w-20',
                    isCircleCompleted && 'text-success',
                    isCircleCurrent && !isOverdue && 'text-theme-primary-start',
                    isCircleCurrent && isOverdue && 'text-destructive',
                    isCircleUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
