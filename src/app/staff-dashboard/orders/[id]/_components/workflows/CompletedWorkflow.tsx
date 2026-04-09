'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Banknote,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  Package,
  User,
  Phone,
  Calendar,
  ArrowRight,
  CreditCard,
  Wallet,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmt, fmtDate } from '../utils';

interface CompletedWorkflowProps {
  order: DashboardOrder;
  /** Called with settlement note and completes the order for staff flow. */
  onDepositRefund: (refundNote?: string) => void;
  loading?: boolean;
}

type RefundMethod = 'CASH' | 'BANK_TRANSFER';

const REFUND_METHOD_LABEL: Record<RefundMethod, string> = {
  CASH: 'Thanh toán tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

function RefundScenarioBadge({
  scenario,
}: {
  scenario: 'no_damage' | 'partial_refund' | 'excess_charge';
}) {
  if (scenario === 'no_damage') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-success/15 text-success border border-success/30">
        <CheckCircle2 className="size-3.5" /> Không có hư hỏng
      </span>
    );
  }
  if (scenario === 'partial_refund') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 border border-amber-300/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30">
        <TrendingDown className="size-3.5" /> Trừ phí hư hỏng
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-destructive/12 text-destructive border border-destructive/30">
      <TrendingUp className="size-3.5" /> Phí phạt vượt cọc
    </span>
  );
}

export function CompletedWorkflow({
  order,
  onDepositRefund,
  loading,
}: CompletedWorkflowProps) {
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('CASH');

  const isCompleted = order.status === 'COMPLETED';
  const penalty = order.total_penalty_amount ?? 0;
  const deposit = order.total_deposit;

  // Determine scenario
  const scenario: 'no_damage' | 'partial_refund' | 'excess_charge' =
    penalty === 0
      ? 'no_damage'
      : penalty <= deposit
        ? 'partial_refund'
        : 'excess_charge';

  const refundAmount = penalty <= deposit ? deposit - penalty : 0;
  const extraCharge = penalty > deposit ? penalty - deposit : 0;

  // If already completed → show done screen
  if (isCompleted) {
    return (
      <div className="space-y-4">
        {/* Success banner */}
        <div className="rounded-2xl border border-success/30 bg-success/8 dark:bg-success/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="size-16 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-success mb-1 leading-tight">
              Đơn hàng hoàn tất
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đơn hàng{' '}
              <span className="font-mono font-bold text-foreground">
                {order.order_code}
              </span>{' '}
              đã được xử lý thành công và kết thúc chu trình thuê.
            </p>
          </div>
        </div>

        {/* Final settlement summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
              <User className="size-4 text-theme-primary-start" />
              <h3 className="text-sm font-bold text-foreground">
                Thông tin khách hàng
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                  <User className="size-4 text-theme-primary-start" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Người thuê
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {order.renter.full_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-theme-primary-start" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Điện thoại
                  </p>
                  <p className="text-sm font-semibold text-foreground font-mono">
                    {order.renter.phone_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
                  <Calendar className="size-4 text-theme-primary-start" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    Thời gian thuê
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {fmtDate(order.start_date)} → {fmtDate(order.end_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
              <Banknote className="size-4 text-theme-primary-start" />
              <h3 className="text-sm font-bold text-foreground">
                Quyết toán tài chính
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí thuê</span>
                <span className="font-bold text-foreground">
                  {fmt(order.total_rental_fee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiền đặt cọc</span>
                <span className="font-bold text-foreground">
                  {fmt(deposit)}
                </span>
              </div>
              {penalty > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 dark:text-orange-400">
                    Phí hư hỏng
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    –{fmt(penalty)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-border/50">
                {scenario === 'excess_charge' ? (
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-destructive">
                      Thu thêm từ khách
                    </span>
                    <span className="text-base font-black text-destructive">
                      {fmt(extraCharge)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-success">
                      Đã hoàn cọc
                    </span>
                    <span className="text-base font-black text-success">
                      {fmt(refundAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-theme-primary-start" />
              <h3 className="text-sm font-bold text-foreground">
                Thiết bị đã thu hồi
              </h3>
            </div>
            <span className="text-xs font-bold bg-success/15 text-success px-2.5 py-1 rounded-lg">
              {order.items.length} thiết bị
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.items.map((item) => (
              <div
                key={item.rental_order_item_id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20"
              >
                <div className="relative size-12 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Package className="size-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {item.serial_number || '—'}
                  </p>
                  {(item.item_penalty_amount ?? 0) > 0 && (
                    <p className="text-xs font-semibold text-orange-500 mt-1">
                      Phạt {fmt(item.item_penalty_amount!)}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="size-4 text-success shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/staff-dashboard/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-accent transition-colors"
          >
            Về danh sách đơn hàng <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // PICKED_UP → finalization view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-theme-primary-start/10 flex items-center justify-center shrink-0">
            <Banknote className="size-5 text-theme-primary-start" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Quyết toán sau thu hồi
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nhân viên ghi nhận phí phạt, phương án hoàn cọc và hoàn tất đơn
              hàng ngay tại bước này.
            </p>
          </div>
          <div className="ml-auto">
            <RefundScenarioBadge scenario={scenario} />
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Deposit held */}
          <div className="rounded-xl bg-muted/40 p-4 text-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Tiền đặt cọc
            </p>
            <p className="text-xl font-black text-foreground tabular-nums">
              {fmt(deposit)}
            </p>
          </div>

          {/* Penalty */}
          <div
            className={cn(
              'rounded-xl p-4 text-center',
              penalty > 0
                ? 'bg-orange-50 dark:bg-orange-950/20'
                : 'bg-muted/40',
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <ShieldAlert
                className={cn(
                  'size-3.5',
                  penalty > 0 ? 'text-orange-500' : 'text-muted-foreground',
                )}
              />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Phí hư hỏng
              </p>
            </div>
            <p
              className={cn(
                'text-xl font-black tabular-nums',
                penalty > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-muted-foreground',
              )}
            >
              {penalty > 0 ? fmt(penalty) : 'Không có'}
            </p>
          </div>

          {/* Result */}
          <div
            className={cn(
              'rounded-xl p-4 text-center',
              scenario === 'excess_charge'
                ? 'bg-destructive/10'
                : scenario === 'no_damage'
                  ? 'bg-success/10'
                  : 'bg-amber-50 dark:bg-amber-950/20',
            )}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {scenario === 'excess_charge' ? (
                <TrendingUp className="size-3.5 text-destructive" />
              ) : scenario === 'no_damage' ? (
                <CheckCircle2 className="size-3.5 text-success" />
              ) : (
                <Minus className="size-3.5 text-amber-600" />
              )}
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                {scenario === 'excess_charge' ? 'Thu thêm' : 'Hoàn cọc'}
              </p>
            </div>
            <p
              className={cn(
                'text-xl font-black tabular-nums',
                scenario === 'excess_charge'
                  ? 'text-destructive'
                  : scenario === 'no_damage'
                    ? 'text-success'
                    : 'text-amber-600 dark:text-amber-400',
              )}
            >
              {scenario === 'excess_charge'
                ? fmt(extraCharge)
                : fmt(refundAmount)}
            </p>
          </div>
        </div>

        {/* Calculation explanation */}
        <div
          className={cn(
            'mx-5 mb-5 rounded-xl px-4 py-3 border text-sm',
            scenario === 'excess_charge'
              ? 'bg-destructive/8 border-destructive/25 text-destructive'
              : scenario === 'no_damage'
                ? 'bg-success/8 border-success/25 text-success'
                : 'bg-amber-50 border-amber-200/60 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400',
          )}
        >
          {scenario === 'no_damage' && (
            <p className="font-semibold">
              Thiết bị không có hư hỏng → Hoàn toàn bộ tiền đặt cọc{' '}
              <strong>{fmt(deposit)}</strong> cho khách hàng.
            </p>
          )}
          {scenario === 'partial_refund' && (
            <p className="font-semibold">
              Tiền cọc <strong>{fmt(deposit)}</strong> − Phí hư hỏng{' '}
              <strong>{fmt(penalty)}</strong> = Hoàn lại{' '}
              <strong>{fmt(refundAmount)}</strong> cho khách hàng.
            </p>
          )}
          {scenario === 'excess_charge' && (
            <p className="font-semibold">
              Phí hư hỏng <strong>{fmt(penalty)}</strong> − Tiền cọc{' '}
              <strong>{fmt(deposit)}</strong> = Thu thêm{' '}
              <strong>{fmt(extraCharge)}</strong> từ khách hàng.
            </p>
          )}
        </div>
      </div>

      {/* Refund method selection */}
      {scenario !== 'excess_charge' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <CreditCard className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Phương thức hoàn tiền
            </h3>
          </div>
          <div className="p-5">
            <p className="text-xs text-muted-foreground mb-3">
              Chọn phương thức đề xuất để hoàn{' '}
              <span className="font-bold text-foreground">
                {fmt(refundAmount)}
              </span>{' '}
              cho khách hàng.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundMethod('CASH')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  refundMethod === 'CASH'
                    ? 'border-theme-primary-start bg-theme-primary-start/8'
                    : 'border-border hover:border-muted-foreground/40 bg-card',
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center shrink-0',
                    refundMethod === 'CASH'
                      ? 'bg-theme-primary-start/15 text-theme-primary-start'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      refundMethod === 'CASH'
                        ? 'text-theme-primary-start'
                        : 'text-foreground',
                    )}
                  >
                    Tiền mặt
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trả trực tiếp cho khách
                  </p>
                </div>
                {refundMethod === 'CASH' && (
                  <CheckCircle2 className="size-5 text-theme-primary-start ml-auto shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRefundMethod('BANK_TRANSFER')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  refundMethod === 'BANK_TRANSFER'
                    ? 'border-theme-primary-start bg-theme-primary-start/8'
                    : 'border-border hover:border-muted-foreground/40 bg-card',
                )}
              >
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center shrink-0',
                    refundMethod === 'BANK_TRANSFER'
                      ? 'bg-theme-primary-start/15 text-theme-primary-start'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      refundMethod === 'BANK_TRANSFER'
                        ? 'text-theme-primary-start'
                        : 'text-foreground',
                    )}
                  >
                    Chuyển khoản
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chuyển tiền qua ngân hàng
                  </p>
                </div>
                {refundMethod === 'BANK_TRANSFER' && (
                  <CheckCircle2 className="size-5 text-theme-primary-start ml-auto shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extra charge instruction */}
      {scenario === 'excess_charge' && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-4 flex items-start gap-3">
          <TrendingUp className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">
              Yêu cầu thanh toán thêm từ khách hàng
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thu{' '}
              <span className="font-bold text-destructive">
                {fmt(extraCharge)}
              </span>{' '}
              từ khách hàng trước khi hệ thống hoàn tất đơn. Màn staff chỉ lưu
              thông tin quyết toán.
            </p>
          </div>
        </div>
      )}

      {/* Items review */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-theme-primary-start" />
            <h3 className="text-sm font-bold text-foreground">
              Tóm tắt thiết bị
            </h3>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                (item.item_penalty_amount ?? 0) > 0
                  ? 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/10'
                  : 'border-border bg-muted/20',
              )}
            >
              <div className="relative size-12 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Package className="size-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {item.serial_number || '—'}
                </p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  Cọc {fmt(item.deposit_amount)}
                </p>
              </div>
              {(item.item_penalty_amount ?? 0) > 0 ? (
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-orange-600 dark:text-orange-400">
                    Phạt
                  </p>
                  <p className="text-sm font-black text-orange-600 dark:text-orange-400">
                    {fmt(item.item_penalty_amount!)}
                  </p>
                </div>
              ) : (
                <CheckCircle2 className="size-4 text-success shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {scenario === 'excess_charge' ? (
            <span className="flex items-center gap-2 text-destructive font-semibold">
              <TrendingUp className="size-4" />
              Thu thêm {fmt(extraCharge)} từ khách và hoàn tất đơn hàng.
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="size-4 shrink-0" />
              Lưu phương án hoàn cọc bằng{' '}
              <strong>{REFUND_METHOD_LABEL[refundMethod]}</strong> —{' '}
              {fmt(refundAmount)} và hoàn tất đơn.
            </span>
          )}
        </div>
        <Button
          onClick={() =>
            onDepositRefund(
              scenario !== 'excess_charge'
                ? `Hoàn cọc: ${REFUND_METHOD_LABEL[refundMethod]}`
                : undefined,
            )
          }
          disabled={loading}
          className="gap-2 rounded-xl px-6 font-bold shrink-0 min-w-50 bg-success hover:bg-success/90 text-white dark:bg-success dark:hover:bg-success/90"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý…
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Lưu quyết toán & hoàn tất
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
