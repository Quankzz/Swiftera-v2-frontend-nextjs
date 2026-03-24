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
    <div className="rounded-2xl border border-border bg-card px-5 pt-4 pb-5 overflow-x-auto">
      {isOverdue && (
        <div className="flex items-center gap-2 mb-4 rounded-xl bg-destructive/10 border border-destructive/25 px-3 py-2">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-bold text-destructive">
            Đơn quá hạn — cần khởi động thu hồi ngay
          </p>
        </div>
      )}
      <div className="flex items-start min-w-max">
        {WORKFLOW_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          const isLast = idx === WORKFLOW_STEPS.length - 1;
          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5 w-[76px]">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-success bg-success/10',
                    isCurrent &&
                      !isOverdue &&
                      'border-theme-primary-start bg-theme-primary-start shadow-md',
                    isCurrent &&
                      isOverdue &&
                      'border-destructive bg-destructive',
                    isUpcoming && 'border-border bg-muted',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <StepIcon
                      className={cn(
                        'size-4',
                        isCurrent && 'text-white',
                        isUpcoming && 'text-muted-foreground',
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    'text-center text-[11px] font-semibold leading-tight px-1',
                    isCompleted && 'text-success',
                    isCurrent && !isOverdue && 'text-theme-primary-start',
                    isCurrent && isOverdue && 'text-destructive',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 w-5 mt-[18px] mx-0.5 rounded-full transition-all',
                    idx < currentIdx ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
