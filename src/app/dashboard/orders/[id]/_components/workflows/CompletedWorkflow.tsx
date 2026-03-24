import React from 'react';
import { BadgeCheck, Receipt, BanknoteIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmt } from '../utils';

export function CompletedWorkflow({
  order,
  onDepositRefund,
}: {
  order: DashboardOrder;
  onDepositRefund: () => void;
}) {
  const depositToReturn = Math.max(
    0,
    order.total_deposit - (order.total_penalty_amount ?? 0),
  );
  const isRefunded = order.deposit_refund_status === 'REFUNDED';

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={BadgeCheck}
        variant="success"
        title="Đơn hàng đã hoàn thành!"
        desc="Tất cả sản phẩm đã được thu hồi thành công. Xử lý hoàn cọc cho khách nếu chưa thực hiện."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Tóm tắt tài chính</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí thuê</span>
            <span className="font-bold">{fmt(order.total_rental_fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tiền cọc đã giữ</span>
            <span className="font-bold">{fmt(order.total_deposit)}</span>
          </div>
          {(order.total_penalty_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-destructive font-semibold">Phí phạt</span>
              <span className="font-bold text-destructive">
                +{fmt(order.total_penalty_amount!)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2.5 flex justify-between">
            <span className="text-sm font-bold text-foreground">
              Hoàn cọc cho khách
            </span>
            <span className="text-lg font-bold text-theme-primary-start">
              {fmt(depositToReturn)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BanknoteIcon className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Hoàn tiền cọc</p>
        </div>
        {isRefunded ? (
          <div className="flex items-center gap-2 rounded-xl border border-success-border bg-success-muted px-4 py-3">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-sm font-bold text-success">
              Đã hoàn cọc thành công
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Hoàn{' '}
              <span className="font-bold text-foreground">
                {fmt(depositToReturn)}
              </span>{' '}
              cho{' '}
              <span className="font-bold text-foreground">
                {order.renter.full_name}
              </span>
              .
            </p>
            <Button size="lg" onClick={onDepositRefund} className="gap-2">
              <BanknoteIcon className="size-5" /> Xác nhận đã hoàn cọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
