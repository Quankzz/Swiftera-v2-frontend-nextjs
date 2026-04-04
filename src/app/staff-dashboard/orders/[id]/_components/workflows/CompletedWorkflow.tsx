import React, { useState } from 'react';
import {
  BadgeCheck,
  BanknoteIcon,
  CheckCircle2,
  AlertTriangle,
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

  const hasDamage = damageAmount > 0;
  const extraCharge =
    damageAmount > depositAmount ? damageAmount - depositAmount : 0;
  const refundRemaining =
    damageAmount < depositAmount ? depositAmount - damageAmount : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <WorkflowBanner
        icon={BadgeCheck}
        variant="success"
        title="Đơn hàng đã hoàn thành!"
        desc="Tất cả sản phẩm đã được thu hồi thành công. Xử lý hoàn cọc / phụ thu bên dưới."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ==================== CỘT TRÁI: Thông tin khách & đơn hàng ==================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-theme-primary-start/10 rounded-2xl">
                <ClipboardList className="size-5 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Thông tin đơn hàng
                </p>
                <p className="text-xs text-muted-foreground">
                  Khách thuê & thời gian
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <InfoRow
                icon={User}
                label="Khách thuê"
                value={order.renter.full_name}
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
          </div>

          {/* Ghi chú */}
          {order.notes && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                Ghi chú từ khách
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* ==================== CỘT PHẢI: Tài chính & Xử lý hoàn tiền ==================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tóm tắt tài chính */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 rounded-2xl">
                <BanknoteIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Tóm tắt tài chính
              </p>
            </div>

            <div className="space-y-4">
              {/* Phí thuê */}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Phí thuê</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold px-2.5 py-0.5 bg-success-muted text-success border border-success-border rounded-lg">
                    {fmt(order.total_rental_fee)}
                  </span>
                </div>
              </div>

              {/* Tiền cọc */}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Tiền cọc</span>
                <span className="font-semibold">{fmt(depositAmount)}</span>
              </div>

              {/* Phí phạt */}
              {hasDamage && (
                <div className="flex justify-between items-center py-2 border-t border-border pt-4">
                  <span className="text-destructive font-semibold">
                    Phí phạt hư hại
                  </span>
                  <span className="font-semibold text-destructive">
                    −{fmt(damageAmount)}
                  </span>
                </div>
              )}

              {/* Kết quả cuối cùng */}
              <div className="border-t border-border pt-4 mt-2">
                {hasDamage && damageAmount > depositAmount ? (
                  <div className="flex justify-between items-center">
                    <span className="text-destructive font-semibold">
                      Phụ thu thêm
                    </span>
                    <span className="text-xl font-bold text-destructive">
                      +{fmt(extraCharge)}
                    </span>
                  </div>
                ) : hasDamage && damageAmount < depositAmount ? (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Hoàn lại cho khách
                    </span>
                    <span className="text-xl font-bold text-theme-primary-start">
                      {fmt(refundRemaining)}
                    </span>
                  </div>
                ) : !hasDamage ? (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Hoàn cọc đầy đủ
                    </span>
                    <span className="text-xl font-bold text-success">
                      {fmt(depositAmount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">
                      Không hoàn / không thu thêm
                    </span>
                    <span className="text-xl font-bold text-muted-foreground">
                      0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Xử lý hoàn cọc / phụ thu */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-theme-primary-start/10 rounded-2xl">
                <BanknoteIcon className="size-5 text-theme-primary-start" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {damageAmount > depositAmount
                    ? 'Thu phụ thu từ khách'
                    : 'Hoàn tiền cọc'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRefunded
                    ? 'Đã xử lý xong'
                    : 'Chọn phương thức và xác nhận'}
                </p>
              </div>
            </div>

            {isRefunded ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-success-border bg-success-muted px-6 py-5">
                  <CheckCircle2 className="size-6 text-success" />
                  <span className="font-semibold text-success">
                    {damageAmount > depositAmount
                      ? 'Đã thu phụ thu thành công'
                      : 'Đã hoàn cọc thành công'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                {/* Mô tả tình huống */}
                <div>
                  {!hasDamage && (
                    <p className="text-sm text-muted-foreground">
                      Hoàn toàn bộ tiền cọc{' '}
                      <span className="font-bold text-foreground">
                        {fmt(depositAmount)}
                      </span>{' '}
                      cho khách.
                    </p>
                  )}
                  {hasDamage && damageAmount > depositAmount && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex gap-3">
                      <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">
                        Hư hại vượt quá tiền cọc. Cần thu thêm{' '}
                        <span className="font-bold">{fmt(extraCharge)}</span> từ
                        khách.
                      </p>
                    </div>
                  )}
                  {hasDamage && damageAmount < depositAmount && (
                    <p className="text-sm text-muted-foreground">
                      Hoàn lại{' '}
                      <span className="font-bold text-foreground">
                        {fmt(refundRemaining)}
                      </span>{' '}
                      sau khi trừ phí hư hại.
                    </p>
                  )}
                </div>

                {/* Chọn phương thức */}
                {damageAmount !== depositAmount && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Phương thức{' '}
                      {damageAmount > depositAmount ? 'thu tiền' : 'hoàn tiền'}
                    </p>
                    <div className="relative">
                      <select
                        value={refundMethod}
                        onChange={(e) =>
                          setRefundMethod(e.target.value as 'cash' | 'bank')
                        }
                        className="w-full h-12 px-11 rounded-lg border border-border bg-background focus:ring-2 focus:ring-theme-primary-start/30 text-sm"
                      >
                        <option value="cash">Tiền mặt</option>
                        <option value="bank">Chuyển khoản ngân hàng</option>
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {refundMethod === 'cash' ? (
                          <Wallet className="size-5 text-muted-foreground" />
                        ) : (
                          <Landmark className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nút xác nhận */}
                <Button
                  size="default"
                  variant={
                    damageAmount > depositAmount ? 'destructive' : 'default'
                  }
                  onClick={() => onDepositRefund(refundMethod)}
                  className={cn(
                    'w-full h-12 gap-3 text-base font-semibold p-2',
                    damageAmount <= depositAmount &&
                      'bg-linear-to-r from-theme-primary-start to-theme-primary-end hover:brightness-105 text-white shadow-md',
                  )}
                >
                  {damageAmount > depositAmount ? (
                    <>
                      {refundMethod === 'bank' ? (
                        <Landmark className="size-5" />
                      ) : (
                        <BanknoteIcon className="size-5" />
                      )}
                      Xác nhận thu phụ thu{' '}
                      {refundMethod === 'bank' ? 'chuyển khoản' : 'tiền mặt'}
                    </>
                  ) : (
                    <>
                      {refundMethod === 'bank' ? (
                        <Landmark className="size-5" />
                      ) : (
                        <Wallet className="size-5" />
                      )}
                      Xác nhận hoàn tiền{' '}
                      {refundMethod === 'bank' ? 'chuyển khoản' : 'tiền mặt'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
