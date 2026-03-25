import React, { useState } from 'react';
import {
  BadgeCheck,
  Receipt,
  BanknoteIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Landmark,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmt } from '../utils';

export function CompletedWorkflow({
  order,
  onDepositRefund,
}: {
  order: DashboardOrder;
  onDepositRefund: (method: 'cash' | 'bank') => void;
}) {
  const [refundMethod, setRefundMethod] = useState<'cash' | 'bank'>('cash');

  const damageAmount = order.total_penalty_amount ?? 0;
  const depositAmount = order.total_deposit;
  const isRefunded = order.deposit_refund_status === 'REFUNDED';

  // Calculate scenario
  const hasDamage = damageAmount > 0;
  const extraCharge =
    damageAmount > depositAmount ? damageAmount - depositAmount : 0;
  const refundRemaining =
    damageAmount < depositAmount ? depositAmount - damageAmount : 0;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={BadgeCheck}
        variant="success"
        title="Đơn hàng đã hoàn thành!"
        desc="Tất cả sản phẩm đã được thu hồi thành công. Xử lý thanh toán bên dưới."
      />

      {/* ── Financial summary ── */}
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
            <span className="font-bold">{fmt(depositAmount)}</span>
          </div>
          {hasDamage && (
            <div className="flex justify-between text-sm">
              <span className="text-destructive font-semibold">
                Tiền hư hại thực tế
              </span>
              <span className="font-bold text-destructive">
                {fmt(damageAmount)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2.5">
            {!hasDamage && (
              <div className="flex justify-between">
                <span className="text-sm font-bold text-foreground">
                  Hoàn cọc cho khách
                </span>
                <span className="text-lg font-bold text-success">
                  {fmt(depositAmount)}
                </span>
              </div>
            )}
            {hasDamage && damageAmount > depositAmount && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Hư hại – Cọc ({fmt(damageAmount)} − {fmt(depositAmount)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-destructive">
                    Phụ thu khách hàng
                  </span>
                  <span className="text-lg font-bold text-destructive">
                    +{fmt(extraCharge)}
                  </span>
                </div>
              </div>
            )}
            {hasDamage && damageAmount < depositAmount && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Cọc – Hư hại ({fmt(depositAmount)} − {fmt(damageAmount)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-foreground">
                    Hoàn lại cho khách
                  </span>
                  <span className="text-lg font-bold text-theme-primary-start">
                    {fmt(refundRemaining)}
                  </span>
                </div>
              </div>
            )}
            {hasDamage && damageAmount === depositAmount && (
              <div className="flex justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Hư hại = Cọc — không hoàn / không phụ thu
                </span>
                <span className="text-lg font-bold text-muted-foreground">
                  {fmt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Refund / charge action ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BanknoteIcon className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            {damageAmount > depositAmount
              ? 'Thu phụ thu từ khách'
              : 'Hoàn tiền cọc'}
          </p>
        </div>

        {isRefunded ? (
          <div className="flex items-center gap-2 rounded-xl border border-success-border bg-success-muted px-4 py-3">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-sm font-bold text-success">
              {damageAmount > depositAmount
                ? 'Đã thu phụ thu thành công'
                : 'Đã hoàn cọc thành công'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Scenario description */}
            {!hasDamage && (
              <p className="text-sm text-muted-foreground">
                Hoàn toàn bộ cọc{' '}
                <span className="font-bold text-foreground">
                  {fmt(depositAmount)}
                </span>{' '}
                cho{' '}
                <span className="font-bold text-foreground">
                  {order.renter.full_name}
                </span>
                .
              </p>
            )}
            {hasDamage && damageAmount > depositAmount && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
                <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  Hư hại vượt cọc. Thu thêm{' '}
                  <span className="font-bold">{fmt(extraCharge)}</span> từ khách{' '}
                  <span className="font-bold">{order.renter.full_name}</span>.
                </p>
              </div>
            )}
            {hasDamage && damageAmount < depositAmount && (
              <p className="text-sm text-muted-foreground">
                Hoàn lại{' '}
                <span className="font-bold text-foreground">
                  {fmt(refundRemaining)}
                </span>{' '}
                (sau khi trừ hư hại) cho{' '}
                <span className="font-bold text-foreground">
                  {order.renter.full_name}
                </span>
                .
              </p>
            )}

            {/* Refund method dropdown — only if there's money to return */}
            {damageAmount <= depositAmount && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-foreground">
                  Phương thức hoàn tiền
                </p>
                <div className="relative">
                  <select
                    value={refundMethod}
                    onChange={(e) =>
                      setRefundMethod(e.target.value as 'cash' | 'bank')
                    }
                    className="w-full h-10 pl-9 pr-8 text-sm rounded-xl border border-border bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme-primary-start/40"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="bank">Chuyển khoản ngân hàng</option>
                  </select>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    {refundMethod === 'cash' ? (
                      <Wallet className="size-4 text-muted-foreground" />
                    ) : (
                      <Landmark className="size-4 text-muted-foreground" />
                    )}
                  </span>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Submit button */}
            {damageAmount > depositAmount ? (
              <Button
                size="lg"
                variant="destructive"
                onClick={() => onDepositRefund('cash')}
                className="gap-2"
              >
                <BanknoteIcon className="size-5" /> Xác nhận đã thu phụ thu
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => onDepositRefund(refundMethod)}
                className="gap-2"
              >
                {refundMethod === 'bank' ? (
                  <Landmark className="size-5" />
                ) : (
                  <Wallet className="size-5" />
                )}
                {refundMethod === 'bank'
                  ? 'Xác nhận đã chuyển khoản'
                  : 'Xác nhận đã hoàn tiền mặt'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Sau khi xác nhận, hệ thống sẽ tự động lưu giao dịch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
