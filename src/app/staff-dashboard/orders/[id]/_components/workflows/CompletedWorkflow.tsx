import React, { useState } from 'react';
import {
  BadgeCheck,
  BanknoteIcon,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Landmark,
  Wallet,
  ClipboardList,
  User,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { InfoRow } from '../InfoRow';
import { fmt, fmtDate } from '../utils';

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

      {/* ── Merged order details + financial summary ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ClipboardList className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Chi tiết & tóm tắt tài chính
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left: customer & order info */}
          <div className="space-y-3.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Thông tin đơn
            </p>
            <InfoRow
              icon={User}
              label="Khách thuê"
              value={order.renter.full_name}
              strong
            />
            <InfoRow
              icon={Phone}
              label="Điện thoại"
              value={order.renter.phone_number}
            />
            <InfoRow
              icon={ClipboardList}
              label="CCCD"
              value={order.renter.cccd_number}
              mono
            />
            <InfoRow
              icon={MapPin}
              label="Địa chỉ giao"
              value={order.delivery_address ?? order.renter.address}
            />
            <InfoRow
              icon={Calendar}
              label="Bắt đầu"
              value={fmtDate(order.start_date)}
            />
            <InfoRow
              icon={Calendar}
              label="Kết thúc"
              value={fmtDate(order.end_date)}
            />
            {order.actual_return_date && (
              <InfoRow
                icon={Calendar}
                label="Ngày trả thực tế"
                value={fmtDate(order.actual_return_date)}
              />
            )}
          </div>

          {/* Right: financial breakdown */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Tài chính
            </p>
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
              {/* Rental fee — already paid */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí thuê</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">
                    {fmt(order.total_rental_fee)}
                  </span>
                  <span className="text-[10px] font-semibold text-success bg-success-muted border border-success-border px-1.5 py-0.5 rounded-md">
                    Đã TT
                  </span>
                </div>
              </div>

              {/* Deposit held */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiền cọc giữ</span>
                <span className="font-bold">{fmt(depositAmount)}</span>
              </div>

              {/* Penalty — charged against deposit */}
              {hasDamage && (
                <div className="flex justify-between text-sm">
                  <span className="text-destructive font-semibold">
                    Phí phạt hư hại
                  </span>
                  <span className="font-bold text-destructive">
                    −{fmt(damageAmount)}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-2.5 space-y-1.5">
                {/* Deposit result line */}
                {!hasDamage && (
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-foreground">
                      Hoàn cọc cho khách
                    </span>
                    <span className="text-base font-bold text-success">
                      {fmt(depositAmount)}
                    </span>
                  </div>
                )}
                {hasDamage && damageAmount < depositAmount && (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Cọc – Phạt ({fmt(depositAmount)} − {fmt(damageAmount)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-foreground">
                        Hoàn lại cho khách
                      </span>
                      <span className="text-base font-bold text-theme-primary-start">
                        {fmt(refundRemaining)}
                      </span>
                    </div>
                  </>
                )}
                {hasDamage && damageAmount === depositAmount && (
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-muted-foreground">
                      Phạt = Cọc — không hoàn / không phụ thu
                    </span>
                    <span className="text-base font-bold text-muted-foreground">
                      {fmt(0)}
                    </span>
                  </div>
                )}
                {hasDamage && damageAmount > depositAmount && (
                  <>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Phạt – Cọc ({fmt(damageAmount)} − {fmt(depositAmount)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-destructive">
                        Phụ thu thêm từ khách
                      </span>
                      <span className="text-base font-bold text-destructive">
                        +{fmt(extraCharge)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Status badges */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Thanh toán phí thuê
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-lg border',
                      order.payment_status === 'PAID'
                        ? 'text-success bg-success-muted border-success-border'
                        : 'text-muted-foreground bg-muted border-border',
                    )}
                  >
                    {order.payment_status === 'PAID'
                      ? 'Đã thanh toán'
                      : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Hoàn cọc
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {order.deposit_refund_status === 'REFUNDED'
                      ? '✓ Đã hoàn cọc'
                      : order.deposit_refund_status === 'PARTIAL_REFUNDED'
                        ? 'Hoàn một phần'
                        : 'Chưa hoàn cọc'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mx-5 mb-5 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-bold text-muted-foreground mb-1">
              Ghi chú
            </p>
            <p className="text-sm text-foreground">{order.notes}</p>
          </div>
        )}
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

            {damageAmount !== depositAmount && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-foreground">
                  {damageAmount > depositAmount
                    ? 'Phương thức thu phụ thu'
                    : 'Phương thức hoàn tiền'}
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
            <Button
              size="default"
              variant={damageAmount > depositAmount ? 'destructive' : 'default'}
              onClick={() => onDepositRefund(refundMethod)}
              className="w-full h-11 gap-2 text-sm font-semibold"
            >
              {damageAmount > depositAmount ? (
                <>
                  {refundMethod === 'bank' ? (
                    <Landmark className="size-5" />
                  ) : (
                    <BanknoteIcon className="size-5" />
                  )}
                  {refundMethod === 'bank'
                    ? 'Xác nhận đã nhận chuyển khoản phụ thu'
                    : 'Xác nhận đã thu tiền mặt phụ thu'}
                </>
              ) : (
                <>
                  {refundMethod === 'bank' ? (
                    <Landmark className="size-5" />
                  ) : (
                    <Wallet className="size-5" />
                  )}
                  {refundMethod === 'bank'
                    ? 'Xác nhận đã chuyển khoản'
                    : 'Xác nhận đã hoàn tiền mặt'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
