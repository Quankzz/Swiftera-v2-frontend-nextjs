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

// ── Pickup workflow steps: PENDING_PICKUP → PICKING_UP → PICKED_UP → COMPLETED ─
export const PICKUP_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'PENDING_PICKUP', label: 'Chờ thu hồi', icon: ClipboardList },
  { key: 'PICKING_UP', label: 'Đang thu hồi', icon: RotateCcw },
  { key: 'PICKED_UP', label: 'Kiểm định', icon: Package },
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
  'COMPLETED',
];

export function getDeliveryStepIndex(status: OrderStatus): number {
  const idx = DELIVERY_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export function getPickupStepIndex(status: OrderStatus): number {
  // IN_USE and OVERDUE map to step -1 (before PENDING_PICKUP) — show as "upcoming"
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
    // Đổi items-start thành items-center để đường nối tự động căn giữa hình tròn.
    // Thêm pb-8 để chừa không gian trống cho chữ hiển thị phía dưới (do dùng absolute).
    <div className="flex items-center mx-auto w-full min-w-max justify-between pb-8 pt-2 px-2 sm:px-4">
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
                  'h-0.75 transition-all duration-300 ease-in-out flex-1 min-w-4 sm:min-w-8', // Đã bỏ mt-5 và rounded-full để 2 đầu đường vuông vức, chạm sát hoàn toàn viền tròn.
                  idx <= currentIdx ? 'bg-success' : 'bg-border',
                )}
              />
            )}

            {/* Wrapper giờ chỉ còn bọc sát vòng tròn, không bọc chữ */}
            <div className="relative shrink-0 flex items-center justify-center z-10">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-card', // Thêm bg-card làm base để đường line (nếu có) bị đè lên không bị lộ
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

              {/* Chữ được đưa ra khỏi luồng dàn trang bằng absolute, giúp đường nối không bị cách xa */}
              <p
                className={cn(
                  'absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-20 sm:w-24 text-center text-[11px] sm:text-xs font-semibold leading-tight',
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

  // UI rule: one order detail page should only show the workflow that matches
  // the CURRENT status of the order. Even if the same staff is assigned for
  // both delivery and pickup, showing both flows at once is confusing.
  const showDelivery = DELIVERY_STATUSES.includes(status);
  const showPickup = PICKUP_STATUSES.includes(status);

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
