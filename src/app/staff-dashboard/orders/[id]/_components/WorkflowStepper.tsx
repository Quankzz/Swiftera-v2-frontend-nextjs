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

      <div className="flex items-start mx-auto w-max min-w-full justify-center">
        {WORKFLOW_STEPS.map((step, idx) => {
          const StepIcon = step.icon;

          const isCircleCompleted = idx < currentIdx;
          const isCircleCurrent = idx === currentIdx;
          const isCircleUpcoming = idx > currentIdx;

          const isFirst = idx === 0;

          return (
            <React.Fragment key={step.key}>
              {!isFirst && (
                <div
                  className={cn(
                    'h-0.75 mt-5 rounded-full transition-all duration-300 ease-in-out flex-1 min-w-10 -mx-1',
                    idx <= currentIdx ? 'bg-success' : 'bg-border',
                  )}
                />
              )}

              <div className="flex flex-col items-center gap-2 shrink-0 relative z-10 bg-card px-1">
                {/* Circle Icon — larger with glow for active */}
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCircleCompleted && 'border-success bg-success/10',
                    isCircleCurrent &&
                      !isOverdue &&
                      'border-theme-primary-start bg-theme-primary-start workflow-step-glow',
                    isCircleCurrent &&
                      isOverdue &&
                      'border-destructive bg-destructive shadow-md shadow-destructive/30',
                    isCircleUpcoming && 'border-border bg-muted',
                  )}
                >
                  {isCircleCompleted ? (
                    <CheckCircle2 className="size-4.5 text-success" />
                  ) : (
                    <StepIcon
                      className={cn(
                        'size-4.5',
                        isCircleCurrent && 'text-white',
                        isCircleUpcoming && 'text-muted-foreground',
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'text-center text-xs font-semibold leading-tight max-w-20',
                    isCircleCompleted && 'text-success',
                    isCircleCurrent &&
                      !isOverdue &&
                      'text-theme-primary-start font-bold',
                    isCircleCurrent &&
                      isOverdue &&
                      'text-destructive font-bold',
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
