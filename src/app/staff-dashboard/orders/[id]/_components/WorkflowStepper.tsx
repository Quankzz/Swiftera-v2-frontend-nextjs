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

// ── Delivery workflow steps: PAID → PREPARING → DELIVERING → DELIVERED ──────
export const DELIVERY_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'PAID', label: 'Xác nhận', icon: ClipboardList },
  { key: 'PREPARING', label: 'Lấy hàng', icon: Warehouse },
  { key: 'DELIVERING', label: 'Giao hàng', icon: Truck },
  { key: 'DELIVERED', label: 'Đã giao', icon: CheckCircle2 },
];

// ── Pickup workflow steps: PENDING_PICKUP → PICKING_UP → PICKED_UP → INSPECTING → COMPLETED ─
export const PICKUP_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'PENDING_PICKUP', label: 'Chờ thu hồi', icon: ClipboardList },
  { key: 'PICKING_UP', label: 'Đang thu hồi', icon: RotateCcw },
  { key: 'PICKED_UP', label: 'Đã lấy', icon: Package },
  { key: 'INSPECTING', label: 'Kiểm định', icon: Warehouse },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
];

// Statuses belonging to the delivery role
const DELIVERY_STATUSES: OrderStatus[] = [
  'PAID',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
];

// Statuses belonging to the pickup role (OVERDUE is IN_USE-derived, show pickup stepper)
const PICKUP_STATUSES: OrderStatus[] = [
  'IN_USE',
  'OVERDUE',
  'PENDING_PICKUP',
  'PICKING_UP',
  'PICKED_UP',
  'INSPECTING',
  'COMPLETED',
];

export function getDeliveryStepIndex(status: OrderStatus): number {
  const idx = DELIVERY_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function getPickupStepIndex(status: OrderStatus): number {
  // IN_USE and OVERDUE map to step 0 (before PENDING_PICKUP) — show as "upcoming"
  if (status === 'IN_USE' || status === 'OVERDUE') return -1;
  const idx = PICKUP_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function StepperRow({
  steps,
  currentIdx,
  isOverdue,
}: {
  steps: { key: OrderStatus; label: string; icon: React.ElementType }[];
  currentIdx: number;
  isOverdue: boolean;
}) {
  return (
    <div className="flex items-start mx-auto w-max min-w-full justify-center">
      {steps.map((step, idx) => {
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
              <p
                className={cn(
                  'text-center text-xs font-semibold leading-tight max-w-20',
                  isCircleCompleted && 'text-success',
                  isCircleCurrent &&
                    !isOverdue &&
                    'text-theme-primary-start font-bold',
                  isCircleCurrent && isOverdue && 'text-destructive font-bold',
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
  );
}

export function WorkflowStepper({
  status,
  staffRole,
}: {
  status: OrderStatus;
  /** Which workflow role to display. Defaults to auto-detecting from status. */
  staffRole?: 'delivery' | 'pickup' | 'both';
}) {
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

  const isOverdue = status === 'OVERDUE';

  // Determine which stepper(s) to show
  const showDelivery =
    staffRole === 'delivery' ||
    staffRole === 'both' ||
    (!staffRole && DELIVERY_STATUSES.includes(status));
  const showPickup =
    staffRole === 'pickup' ||
    staffRole === 'both' ||
    (!staffRole && PICKUP_STATUSES.includes(status));

  const deliveryIdx = DELIVERY_STATUSES.includes(status)
    ? getDeliveryStepIndex(status)
    : DELIVERY_STEPS.length; // all completed

  const pickupIdx = getPickupStepIndex(status);

  return (
    <div className="max-w-full mx-auto rounded-2xl border border-border bg-card px-5 pt-4 pb-5 overflow-x-auto space-y-4">
      {isOverdue && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/25 px-3 py-2">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-bold text-destructive">
            Đơn quá hạn — cần khởi động thu hồi ngay
          </p>
        </div>
      )}

      {showDelivery && (
        <div>
          {showPickup && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Quy trình giao hàng
            </p>
          )}
          <StepperRow
            steps={DELIVERY_STEPS}
            currentIdx={deliveryIdx}
            isOverdue={false}
          />
        </div>
      )}

      {showPickup && (
        <div>
          {showDelivery && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-2">
              Quy trình thu hồi
            </p>
          )}
          <StepperRow
            steps={PICKUP_STEPS}
            currentIdx={pickupIdx}
            isOverdue={isOverdue}
          />
        </div>
      )}
    </div>
  );
}
