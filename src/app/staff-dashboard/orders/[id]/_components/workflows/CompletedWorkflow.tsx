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
import { WorkflowFooter } from '../WorkflowFooter';

interface CompletedWorkflowProps {
  order: DashboardOrder;
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
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-success/15 text-success border border-success/30">
        <CheckCircle2 className="size-3.5" /> Không có hư hỏng
      </span>
    );
  }
  if (scenario === 'partial_refund') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-300/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30">
        <TrendingDown className="size-3.5" /> Trừ phí hư hỏng
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-destructive/12 text-destructive border border-destructive/30">
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

  const scenario: 'no_damage' | 'partial_refund' | 'excess_charge' =
    penalty === 0
      ? 'no_damage'
      : penalty <= deposit
        ? 'partial_refund'
        : 'excess_charge';

  const refundAmount = penalty <= deposit ? deposit - penalty : 0;
  const extraCharge = penalty > deposit ? penalty - deposit : 0;

  // COMPLETED state
  if (isCompleted) {
    return (
      <>
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Success banner */}
          <div className="rounded-2xl border border-success/30 bg-success/5 dark:bg-success/8 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="size-16 rounded-2xl bg-success/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-success mb-1 leading-tight">
                Đơn hàng hoàn tất
              </h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                Đơn hàng{' '}
                <span className="font-mono font-bold text-foreground">
                  {order.order_code}
                </span>{' '}
                đã được xử lý thành công và kết thúc chu trình thuê.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT: Customer + Financials */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                  <User className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Thông tin khách hàng
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                      <User className="size-5 text-theme-primary-start dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Người thuê
                      </p>
                      <p className="text-[15px] font-bold text-foreground truncate">
                        {order.renter.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                      <Phone className="size-5 text-theme-primary-start dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Điện thoại
                      </p>
                      <p className="text-[15px] font-bold text-foreground font-mono tracking-wide">
                        {order.renter.phone_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-border/60 dark:border-slate-800">
                    <div className="size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
                      <Calendar className="size-5 text-theme-primary-start dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Thời gian thuê
                      </p>
                      <p className="text-[15px] font-semibold text-foreground">
                        {fmtDate(order.start_date)} → {fmtDate(order.end_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                  <Banknote className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Quyết toán tài chính
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                    <span className="text-[14px] font-medium text-muted-foreground">
                      Phí thuê
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(order.total_rental_fee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                    <span className="text-[14px] font-medium text-muted-foreground">
                      Tiền đặt cọc
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {fmt(deposit)}
                    </span>
                  </div>
                  {penalty > 0 && (
                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-border/60 dark:border-slate-700">
                      <span className="text-[14px] font-medium text-orange-600 dark:text-orange-400">
                        Phí hư hỏng
                      </span>
                      <span className="text-[15px] font-bold text-orange-600 dark:text-orange-400">
                        –{fmt(penalty)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 flex items-center justify-between">
                    {scenario === 'excess_charge' ? (
                      <>
                        <span className="text-[15px] font-bold text-destructive uppercase tracking-wide">
                          Thu thêm từ khách
                        </span>
                        <span className="text-2xl font-black text-destructive">
                          {fmt(extraCharge)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[15px] font-bold text-success uppercase tracking-wide">
                          Đã hoàn cọc
                        </span>
                        <span className="text-2xl font-black text-success">
                          {fmt(refundAmount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Items */}
            <div className="lg:col-span-5 flex flex-col h-[28rem] lg:h-auto">
              <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Package className="size-5 text-foreground" />
                    <h3 className="text-[15px] font-bold text-foreground">
                      Thiết bị đã thu hồi
                    </h3>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-bold bg-success/15 text-success border border-success/30 px-2.5 py-1.5 rounded-lg">
                    {order.items.length} thiết bị
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20">
                  {order.items.map((item) => (
                    <div
                      key={item.rental_order_item_id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border',
                        (item.item_penalty_amount ?? 0) > 0
                          ? 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/10'
                          : 'border-success/30 bg-success/5 dark:bg-success/8',
                      )}
                    >
                      <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700">
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
                        <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug">
                          {item.product_name}
                        </p>
                        <span className="text-[11px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block px-2 py-0.5 rounded-md mt-1.5 truncate max-w-full">
                          {item.serial_number || 'SN: Chưa cập nhật'}
                        </span>
                        {(item.item_penalty_amount ?? 0) > 0 && (
                          <p className="text-[13px] font-bold text-orange-600 dark:text-orange-400 mt-1">
                            Phạt {fmt(item.item_penalty_amount!)}
                          </p>
                        )}
                      </div>
                      {(item.item_penalty_amount ?? 0) > 0 ? (
                        <ShieldAlert className="size-5 text-orange-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="size-5 text-success shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <WorkflowFooter>
          <div className="p-3 flex items-center justify-end gap-2.5">
            <Link
              href="/staff-dashboard/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 dark:border-slate-700 bg-card px-5 py-3 text-[14px] font-bold text-foreground hover:bg-accent transition-colors"
            >
              Về danh sách đơn hàng <ArrowRight className="size-4" />
            </Link>
          </div>
        </WorkflowFooter>
      </>
    );
  }

  // PICKED_UP → finalization view
  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header banner */}
        <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20">
              <Banknote className="size-6 text-theme-primary-start dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-bold text-foreground">
                Quyết toán sau thu hồi
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Ghi nhận phí phạt, phương án hoàn cọc và hoàn tất đơn hàng.
              </p>
            </div>
            <RefundScenarioBadge scenario={scenario} />
          </div>

          {/* Financial breakdown */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700 p-5 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Tiền đặt cọc
              </p>
              <p className="text-2xl font-black text-foreground tabular-nums">
                {fmt(deposit)}
              </p>
            </div>
            <div
              className={cn(
                'rounded-xl border p-5 text-center',
                penalty > 0
                  ? 'bg-orange-50 border-orange-200/60 dark:bg-orange-950/20 dark:border-orange-800/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-border/60 dark:border-slate-700',
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <ShieldAlert
                  className={cn(
                    'size-4',
                    penalty > 0 ? 'text-orange-500' : 'text-muted-foreground',
                  )}
                />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Phí hư hỏng
                </p>
              </div>
              <p
                className={cn(
                  'text-2xl font-black tabular-nums',
                  penalty > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-muted-foreground',
                )}
              >
                {penalty > 0 ? fmt(penalty) : 'Không có'}
              </p>
            </div>
            <div
              className={cn(
                'rounded-xl border p-5 text-center',
                scenario === 'excess_charge'
                  ? 'bg-destructive/8 border-destructive/25'
                  : scenario === 'no_damage'
                    ? 'bg-success/8 border-success/25'
                    : 'bg-amber-50 border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/30',
              )}
            >
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {scenario === 'excess_charge' ? (
                  <TrendingUp className="size-4 text-destructive" />
                ) : scenario === 'no_damage' ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Minus className="size-4 text-amber-600" />
                )}
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {scenario === 'excess_charge' ? 'Thu thêm' : 'Hoàn cọc'}
                </p>
              </div>
              <p
                className={cn(
                  'text-2xl font-black tabular-nums',
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
              'mx-6 mb-6 rounded-xl px-4 py-3.5 border text-[14px] font-semibold',
              scenario === 'excess_charge'
                ? 'bg-destructive/5 border-destructive/25 text-destructive'
                : scenario === 'no_damage'
                  ? 'bg-success/8 border-success/25 text-success'
                  : 'bg-amber-50 border-amber-200/60 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400',
            )}
          >
            {scenario === 'no_damage' && (
              <p>
                Thiết bị không có hư hỏng → Hoàn toàn bộ tiền đặt cọc{' '}
                <strong>{fmt(deposit)}</strong> cho khách hàng.
              </p>
            )}
            {scenario === 'partial_refund' && (
              <p>
                Tiền cọc <strong>{fmt(deposit)}</strong> − Phí hư hỏng{' '}
                <strong>{fmt(penalty)}</strong> = Hoàn lại{' '}
                <strong>{fmt(refundAmount)}</strong> cho khách hàng.
              </p>
            )}
            {scenario === 'excess_charge' && (
              <p>
                Phí hư hỏng <strong>{fmt(penalty)}</strong> − Tiền cọc{' '}
                <strong>{fmt(deposit)}</strong> = Thu thêm{' '}
                <strong>{fmt(extraCharge)}</strong> từ khách hàng.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Refund method + Extra charge instruction */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {scenario !== 'excess_charge' && (
              <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5">
                  <CreditCard className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Phương thức hoàn tiền
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-[13px] text-muted-foreground mb-4">
                    Chọn phương thức để hoàn{' '}
                    <span className="font-bold text-foreground">
                      {fmt(refundAmount)}
                    </span>{' '}
                    cho khách hàng.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setRefundMethod('CASH')}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                        refundMethod === 'CASH'
                          ? 'border-theme-primary-start bg-theme-primary-start/8'
                          : 'border-border/60 hover:border-muted-foreground/40 bg-card',
                      )}
                    >
                      <div
                        className={cn(
                          'size-11 rounded-xl flex items-center justify-center shrink-0',
                          refundMethod === 'CASH'
                            ? 'bg-theme-primary-start/15 text-theme-primary-start'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Wallet className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'text-[14px] font-bold',
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
                        <CheckCircle2 className="size-5 text-theme-primary-start shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setRefundMethod('BANK_TRANSFER')}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                        refundMethod === 'BANK_TRANSFER'
                          ? 'border-theme-primary-start bg-theme-primary-start/8'
                          : 'border-border/60 hover:border-muted-foreground/40 bg-card',
                      )}
                    >
                      <div
                        className={cn(
                          'size-11 rounded-xl flex items-center justify-center shrink-0',
                          refundMethod === 'BANK_TRANSFER'
                            ? 'bg-theme-primary-start/15 text-theme-primary-start'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Building2 className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'text-[14px] font-bold',
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
                        <CheckCircle2 className="size-5 text-theme-primary-start shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {scenario === 'excess_charge' && (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 dark:bg-destructive/8 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-destructive/20 bg-destructive/8 flex items-center gap-2.5">
                  <TrendingUp className="size-5 text-destructive" />
                  <h3 className="text-[15px] font-bold text-destructive">
                    Yêu cầu thu thêm từ khách
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    Thu{' '}
                    <span className="font-bold text-destructive text-[15px]">
                      {fmt(extraCharge)}
                    </span>{' '}
                    từ khách hàng trước khi hoàn tất đơn. Ghi nhận phương án
                    thanh toán và xác nhận.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Items review */}
          <div className="lg:col-span-7 flex flex-col h-[28rem] lg:h-auto">
            <div className="rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Package className="size-5 text-foreground" />
                  <h3 className="text-[15px] font-bold text-foreground">
                    Tóm tắt thiết bị
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold bg-background dark:bg-slate-800 border border-border/80 dark:border-slate-700 text-foreground px-2.5 py-1.5 rounded-lg shadow-sm">
                  {order.items.length} thiết bị
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20">
                {order.items.map((item) => (
                  <div
                    key={item.rental_order_item_id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border',
                      (item.item_penalty_amount ?? 0) > 0
                        ? 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/10'
                        : 'border-border/80 dark:border-slate-700 bg-card dark:bg-slate-800/50',
                    )}
                  >
                    <div className="relative size-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700">
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
                      <p className="text-[14px] font-bold text-foreground line-clamp-2 leading-snug">
                        {item.product_name}
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block px-2 py-0.5 rounded-md mt-1.5 truncate max-w-full">
                        {item.serial_number || 'SN: Chưa cập nhật'}
                      </span>
                      <p className="text-[13px] font-semibold text-muted-foreground mt-1">
                        Cọc {fmt(item.deposit_amount)}
                      </p>
                    </div>
                    {(item.item_penalty_amount ?? 0) > 0 ? (
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-orange-600 dark:text-orange-400">
                          Phạt
                        </p>
                        <p className="text-[14px] font-black text-orange-600 dark:text-orange-400">
                          {fmt(item.item_penalty_amount!)}
                        </p>
                      </div>
                    ) : (
                      <CheckCircle2 className="size-5 text-success shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <WorkflowFooter>
        <div className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[14px] text-muted-foreground flex-1 min-w-0">
            {scenario === 'excess_charge' ? (
              <span className="flex items-center gap-2 text-destructive font-semibold">
                <TrendingUp className="size-5" />
                Thu thêm {fmt(extraCharge)} từ khách và hoàn tất đơn hàng.
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="size-5 shrink-0" />
                Hoàn cọc bằng{' '}
                <strong>{REFUND_METHOD_LABEL[refundMethod]}</strong> —{' '}
                {fmt(refundAmount)} và hoàn tất.
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
            className="h-16 gap-2 rounded-xl px-7 text-xl font-bold shrink-0 sm:min-w-52 bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20 dark:bg-success dark:hover:bg-success/90"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" /> Hoàn tất đơn hàng
              </>
            )}
          </Button>
        </div>
      </WorkflowFooter>
    </>
  );
}
