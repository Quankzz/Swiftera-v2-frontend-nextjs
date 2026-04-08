'use client';

/**
 * CompletedWorkflow — Trạng thái COMPLETED
 *
 * RETURN WORKFLOW - STEP 4/4 (END OF RETURN STAFF WORKFLOW)
 *
 * Đơn hàng hoàn thành toàn bộ quy trình thu hồi và kiểm tra.
 * Hiển thị tóm tắt tài chính:
 * - Phí thuê (đã thu từ khách)
 * - Tiền cọc (đang giữ)
 * - Phí phạt hư hỏng (nếu có)
 * - Tiền hoàn cọc cho khách (= cọc - phạt)
 *
 * Quy trình hoàn tất (FINAL STEP):
 * 1. Staff xác nhận hình thức hoàn cọc: Chuyển khoản hoặc Tiền mặt
 * 2. Bấm "Xác nhận đã hoàn cọc" → gọi handleDepositRefund()
 *    - Gọi setPenalty() để ghi nhận phí phạt cuối cùng
 *    - Cập nhật trạng thái deposit_refund_status → REFUNDED
 * 3. Đơn hàng được đánh dấu hoàn toàn
 *
 * Lưu ý: Hệ thống tự động tính toán hoàn tiền = Tiền cọc - Phí phạt
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Banknote,
  CreditCard,
  Camera,
  AlertTriangle,
  Hash,
  Award,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';

type PaymentMethod = 'TRANSFER' | 'CASH';

export function CompletedWorkflow({
  order,
  onDepositRefund,
}: {
  order: DashboardOrder;
  onDepositRefund: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TRANSFER');
  const [refundLoading, setRefundLoading] = useState(false);

  const isRefunded = order.deposit_refund_status === 'REFUNDED';
  const isFinalizingFromPickedUp = order.status === 'PICKED_UP';
  const penaltyTotal = order.total_penalty_amount ?? 0;
  const netRefund = Math.max(0, order.total_deposit - penaltyTotal);
  const hasPenalty = penaltyTotal > 0;

  const handleRefund = async () => {
    setRefundLoading(true);
    try {
      await onDepositRefund();
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={isRefunded ? Award : CheckCircle2}
        title={
          isFinalizingFromPickedUp
            ? 'Xác nhận hoàn tất thu hồi đơn hàng'
            : isRefunded
              ? 'Đơn hàng đã tất toán hoàn toàn'
              : 'Đơn hàng hoàn thành — Xác nhận hoàn cọc'
        }
        desc={
          isFinalizingFromPickedUp
            ? 'Hệ thống đã có dữ liệu phạt/hoàn tiền. Chọn hình thức thanh toán và xác nhận để chuyển đơn sang COMPLETED.'
            : isRefunded
              ? 'Tất cả thủ tục đã hoàn tất. Cảm ơn bạn đã xử lý đơn hàng này!'
              : 'Kiểm tra thông tin tài chính bên dưới, chọn hình thức hoàn cọc và xác nhận.'
        }
        variant={isRefunded ? 'success' : 'primary'}
      />

      {/* ── Financial Summary ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Tổng kết tài chính
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Phí thuê (đã thu)
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {fmt(order.total_rental_fee)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Tiền cọc đang giữ
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {fmt(order.total_deposit)}
            </span>
          </div>

          {hasPenalty && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  Phí phạt hư hỏng
                </span>
              </div>
              <span className="text-sm font-bold text-destructive tabular-nums">
                -{fmt(penaltyTotal)}
              </span>
            </div>
          )}

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">
              Hoàn cọc cho khách
            </span>
            <span
              className={cn(
                'text-xl font-black tabular-nums',
                netRefund > 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {fmt(netRefund)}
            </span>
          </div>

          {isRefunded && (
            <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/25 px-3 py-2">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <p className="text-sm font-semibold text-success">
                Đã hoàn tiền cọc
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Payment Method + Refund Action (only if not yet refunded) ── */}
      {!isRefunded && (netRefund > 0 || isFinalizingFromPickedUp) && (
        <>
          {/* Payment method selector */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Hình thức hoàn cọc
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all',
                  paymentMethod === 'TRANSFER'
                    ? 'border-theme-primary-start/40 bg-theme-primary-start/8 shadow-sm'
                    : 'border-border hover:bg-accent/50',
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center',
                    paymentMethod === 'TRANSFER'
                      ? 'bg-theme-primary-start/15'
                      : 'bg-muted',
                  )}
                >
                  <CreditCard
                    className={cn(
                      'size-5',
                      paymentMethod === 'TRANSFER'
                        ? 'text-theme-primary-start'
                        : 'text-muted-foreground',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-sm font-bold',
                    paymentMethod === 'TRANSFER'
                      ? 'text-theme-primary-start'
                      : 'text-muted-foreground',
                  )}
                >
                  Chuyển khoản
                </p>
                {paymentMethod === 'TRANSFER' && (
                  <CheckCircle2 className="size-4 text-theme-primary-start" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all',
                  paymentMethod === 'CASH'
                    ? 'border-success/40 bg-success/8 shadow-sm'
                    : 'border-border hover:bg-accent/50',
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center',
                    paymentMethod === 'CASH' ? 'bg-success/15' : 'bg-muted',
                  )}
                >
                  <Banknote
                    className={cn(
                      'size-5',
                      paymentMethod === 'CASH'
                        ? 'text-success'
                        : 'text-muted-foreground',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-sm font-bold',
                    paymentMethod === 'CASH'
                      ? 'text-success'
                      : 'text-muted-foreground',
                  )}
                >
                  Tiền mặt
                </p>
                {paymentMethod === 'CASH' && (
                  <CheckCircle2 className="size-4 text-success" />
                )}
              </button>
            </div>

            {paymentMethod === 'TRANSFER' && (
              <div className="mt-3 rounded-xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💳 Yêu cầu khách hàng cung cấp thông tin tài khoản ngân hàng
                  để xử lý thanh toán số tiền{' '}
                  <strong className="text-success font-bold tabular-nums">
                    {fmt(netRefund)}
                  </strong>
                </p>
              </div>
            )}
            {paymentMethod === 'CASH' && (
              <div className="mt-3 rounded-xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💵 Thanh toán trực tiếp{' '}
                  <strong className="text-success font-bold tabular-nums">
                    {fmt(netRefund)}
                  </strong>{' '}
                  tiền mặt cho khách hàng
                </p>
              </div>
            )}
          </div>

          {/* Refund CTA */}
          <Button
            onClick={handleRefund}
            disabled={refundLoading}
            size="lg"
            className="w-full h-14 text-base font-bold gap-2 rounded-2xl bg-success hover:bg-success/90 text-white disabled:opacity-50"
          >
            {refundLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
            {isFinalizingFromPickedUp
              ? `Xác nhận hoàn tất quy trình (${paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'})`
              : `Xác nhận đã hoàn cọc ${fmt(netRefund)} (${paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'})`}
          </Button>
        </>
      )}

      {/* ── Items Returned ── */}
      <Section
        title={`Thiết bị đã thu hồi (${order.items.length})`}
        icon={Package}
        defaultOpen={false}
      >
        <div className="flex flex-col divide-y divide-border/40 pt-2">
          {order.items.map((item) => {
            const itemPenalty = item.item_penalty_amount ?? 0;
            return (
              <div
                key={item.rental_order_item_id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Camera className="size-3.5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.product_name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Hash className="size-3 text-muted-foreground" />
                    <p className="text-xs font-mono text-muted-foreground">
                      {item.serial_number}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {itemPenalty > 0 ? (
                    <>
                      <p className="text-xs font-bold text-destructive tabular-nums">
                        Phạt: {fmt(itemPenalty)}
                      </p>
                    </>
                  ) : (
                    <CheckCircle2 className="size-4 text-success" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Order dates ── */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          {[
            { label: 'Bắt đầu thuê', value: fmtDate(order.start_date) },
            { label: 'Ngày kết thúc', value: fmtDate(order.end_date) },
            {
              label: 'Ngày trả thực tế',
              value: order.actual_return_date
                ? fmtDate(order.actual_return_date)
                : '—',
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-bold text-foreground tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
