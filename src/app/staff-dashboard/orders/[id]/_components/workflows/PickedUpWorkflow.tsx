'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Banknote,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Loader2,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building2,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StaffOrder } from '@/types/api.types';
import { fmt, fmtDate } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { WorkflowFooter } from '../WorkflowFooter';

interface PickedUpWorkflowProps {
  order: StaffOrder;
  onCompleteReturn: (damagePenalty?: number, overduePenalty?: number) => void;
  loading?: boolean;
}

type RefundScenario = 'no_damage' | 'partial_refund' | 'excess_charge';

function RefundScenarioBadge({ scenario }: { scenario: RefundScenario }) {
  if (scenario === 'no_damage') {
    return (
      <span className='inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-success/15 text-success border border-success/30'>
        <CheckCircle2 className='size-3.5' /> Không có hư hỏng
      </span>
    );
  }
  if (scenario === 'partial_refund') {
    return (
      <span className='inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-300/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/30'>
        <TrendingDown className='size-3.5' /> Trừ phí hư hỏng
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-destructive/12 text-destructive border border-destructive/30'>
      <TrendingUp className='size-3.5' /> Phí phạt vượt cọc
    </span>
  );
}

export function PickedUpWorkflow({
  order,
  onCompleteReturn,
  loading,
}: PickedUpWorkflowProps) {
  const isCompleted = order.status === 'COMPLETED';
  const penalty = order.total_penalty_amount ?? 0;
  const damagePenalty = order.items.reduce(
    (sum, item) => sum + (item.item_penalty_amount ?? 0),
    0,
  );
  const overduePenalty = order.overdue_penalty_amount ?? 0;

  const depositAfterPenalty =
    penalty <= order.total_deposit
      ? order.total_deposit - penalty
      : 0;
  const excessCharge = penalty > order.total_deposit ? penalty - order.total_deposit : 0;

  const scenario: RefundScenario =
    penalty === 0 ? 'no_damage' : excessCharge > 0 ? 'excess_charge' : 'partial_refund';

  return (
    <div className='w-full max-w-7xl mx-auto space-y-6'>
      {/* Banner */}
      <WorkflowBanner
        icon={CheckCircle2}
        title='Đơn hàng đã thu hồi thành công'
        desc={
          isCompleted
            ? 'Đơn hàng đã hoàn tất. Tiền cọc đã được hoàn cho khách hàng.'
            : 'Thiết bị đã được thu hồi. Xác nhận hoàn tất để tiến hành hoàn tiền cọc cho khách hàng.'
        }
        variant={isCompleted ? 'success' : 'primary'}
      />

      {/* Deposit refund result */}
      <div className='rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5'>
          <Banknote className='size-5 text-foreground' />
          <h3 className='text-[15px] font-bold text-foreground'>
            Kết quả hoàn tiền cọc
          </h3>
          {!isCompleted && (
            <RefundScenarioBadge scenario={scenario} />
          )}
        </div>

        <div className='p-6 space-y-5'>
          {/* Deposit breakdown */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'>
                Tiền cọc
              </p>
              <p className='text-[15px] font-bold text-foreground'>
                {fmt(order.total_deposit)}
              </p>
            </div>
            <div
              className={cn(
                'rounded-xl px-4 py-3 border',
                penalty > 0
                  ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-800/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-border/60 dark:border-slate-700',
              )}
            >
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'>
                Tổng phí phạt
              </p>
              <p
                className={cn(
                  'text-[15px] font-bold',
                  penalty > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-foreground',
                )}
              >
                {penalty === 0 ? 'Không' : fmt(penalty)}
              </p>
            </div>
            <div
              className={cn(
                'rounded-xl px-4 py-3 border',
                scenario === 'no_damage'
                  ? 'bg-success/8 border-success/30 dark:bg-success/10 dark:border-success/30'
                  : scenario === 'excess_charge'
                    ? 'bg-destructive/8 border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30'
                    : 'bg-success/8 border-success/30 dark:bg-success/10 dark:border-success/30',
              )}
            >
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'>
                {scenario === 'excess_charge' ? 'Khách trả thêm' : 'Hoàn khách'}
              </p>
              <p
                className={cn(
                  'text-[15px] font-bold',
                  scenario === 'no_damage' || scenario === 'partial_refund'
                    ? 'text-success'
                    : 'text-destructive',
                )}
              >
                {scenario === 'excess_charge'
                  ? fmt(excessCharge)
                  : fmt(depositAfterPenalty)}
              </p>
            </div>
          </div>

          {/* Penalty breakdown */}
          {penalty > 0 && (
            <div className='space-y-2.5'>
              <div className='border-t border-border/60 dark:border-slate-700 pt-4'>
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3'>
                  Chi tiết phí phạt
                </p>
              </div>
              {order.items.map((item) =>
                (item.item_penalty_amount ?? 0) > 0 ? (
                  <div
                    key={item.rental_order_item_id}
                    className='flex items-center gap-3 p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-800/20'
                  >
                    <div className='relative size-10 shrink-0 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-border/60 dark:border-slate-700'>
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='size-full flex items-center justify-center'>
                          <Package className='size-4 text-muted-foreground/40' />
                        </div>
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-bold text-foreground truncate'>
                        {item.product_name}
                      </p>
                      <p className='text-xs text-muted-foreground font-mono'>
                        {item.serial_number || '—'}
                      </p>
                    </div>
                    <div className='shrink-0'>
                      <span className='text-sm font-bold text-orange-600 dark:text-orange-400'>
                        −{fmt(item.item_penalty_amount ?? 0)}
                      </span>
                    </div>
                  </div>
                ) : null,
              )}
              {overduePenalty > 0 && (
                <div className='flex items-center gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-800/20'>
                  <div className='size-10 shrink-0 rounded-lg bg-amber-100 dark:bg-amber-950/50 border border-amber-200/40 dark:border-amber-800/20 flex items-center justify-center'>
                    <Clock className='size-4 text-amber-600 dark:text-amber-400' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-foreground'>
                      Phí quá hạn
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Tiền phạt phát sinh do trả muộn
                    </p>
                  </div>
                  <div className='shrink-0'>
                    <span className='text-sm font-bold text-amber-600 dark:text-amber-400'>
                      −{fmt(overduePenalty)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer & Refund method */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
        {/* Customer info */}
        <div className='lg:col-span-7 rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5'>
            <User className='size-5 text-foreground' />
            <h3 className='text-[15px] font-bold text-foreground'>
              Thông tin khách hàng
            </h3>
          </div>
          <div className='p-6 space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20'>
                <User className='size-5 text-theme-primary-start dark:text-blue-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                  Người thuê
                </p>
                <p className='text-[15px] font-bold text-foreground'>
                  {order.renter.full_name}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20'>
                <Phone className='size-5 text-theme-primary-start dark:text-blue-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                  Điện thoại
                </p>
                <p className='text-[15px] font-bold text-foreground font-mono'>
                  {order.renter.phone_number}
                </p>
              </div>
            </div>
            {order.renter.email && (
              <div className='flex items-center gap-4'>
                <div className='size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20'>
                  <Mail className='size-5 text-theme-primary-start dark:text-blue-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                    Email
                  </p>
                  <p className='text-[15px] font-medium text-foreground truncate'>
                    {order.renter.email}
                  </p>
                </div>
              </div>
            )}
            <div className='flex items-start gap-4 pt-3 border-t border-border/60 dark:border-slate-800'>
              <div className='size-11 rounded-xl bg-theme-primary-start/10 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-theme-primary-start/20 dark:border-blue-500/20'>
                <MapPin className='size-5 text-theme-primary-start dark:text-blue-400' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                  Địa chỉ thu hồi
                </p>
                <p className='text-[15px] font-medium text-foreground leading-relaxed'>
                  {order.delivery_address || order.renter.address || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund method */}
        <div className='lg:col-span-5 rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5'>
            <Building2 className='size-5 text-foreground' />
            <h3 className='text-[15px] font-bold text-foreground'>
              Phương thức hoàn tiền
            </h3>
          </div>
          <div className='p-6 space-y-5'>
            {isCompleted ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 rounded-xl bg-success/8 border border-success/30 dark:bg-success/10 dark:border-success/30'>
                  <CheckCircle2 className='size-5 text-success shrink-0' />
                  <div>
                    <p className='text-sm font-bold text-success'>Đã hoàn tiền</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Tiền cọc đã được chuyển khoản cho khách hàng
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700'>
                  <Wallet className='size-5 text-muted-foreground shrink-0' />
                  <div>
                    <p className='text-sm font-semibold text-foreground'>
                      Chuyển khoản ngân hàng
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Tự động qua hệ thống
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30'>
                  <Building2 className='size-5 text-blue-600 dark:text-blue-400 shrink-0' />
                  <div>
                    <p className='text-sm font-bold text-foreground'>
                      Chuyển khoản ngân hàng
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Tiền cọc sẽ được tự động chuyển khoản về tài khoản của khách hàng sau khi xác nhận hoàn tất
                    </p>
                  </div>
                </div>
                {scenario === 'excess_charge' && (
                  <div className='flex items-center gap-3 p-3 rounded-xl bg-destructive/8 border border-destructive/20 dark:bg-destructive/10 dark:border-destructive/30'>
                    <ShieldAlert className='size-5 text-destructive shrink-0' />
                    <div>
                      <p className='text-sm font-bold text-destructive'>
                        Khách cần thanh toán thêm
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Hệ thống sẽ gửi yêu cầu thanh toán phí phạt cho khách hàng trước khi hoàn tiền cọc
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rental summary */}
      <div className='rounded-2xl border border-border/80 dark:border-slate-800 bg-card shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/50 flex items-center gap-2.5'>
          <Package className='size-5 text-foreground' />
          <h3 className='text-[15px] font-bold text-foreground'>
            Tóm tắt đơn thuê
          </h3>
        </div>
        <div className='p-6 space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'>
                Ngày bắt đầu
              </p>
              <p className='text-[15px] font-bold text-foreground'>
                {fmtDate(order.start_date)}
              </p>
            </div>
            <div className='rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5'>
                Ngày kết thúc thực tế
              </p>
              <p className='text-[15px] font-bold text-foreground'>
                {order.actual_end_date ? fmtDate(order.actual_end_date) : '—'}
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between pt-3 border-t border-dashed border-border/60 dark:border-slate-700'>
            <span className='text-[14px] font-medium text-muted-foreground flex items-center gap-2'>
              <Package className='size-4' /> Số thiết bị
            </span>
            <span className='text-[15px] font-bold text-foreground'>
              {order.items.length} thiết bị
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      {!isCompleted && (
        <WorkflowFooter>
          <div className='p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
            <div className='flex items-center gap-2.5 text-[14px] text-muted-foreground flex-1 min-w-0'>
              <CheckCircle2 className='size-5 shrink-0 text-success' />
              <span>
                Nhấn xác nhận để hoàn tất đơn thuê. Tiền cọc sẽ được tự động hoàn cho khách qua chuyển khoản ngân hàng.
              </span>
            </div>
            <Button
              onClick={() => onCompleteReturn()}
              disabled={loading}
              className='h-14 gap-2 rounded-xl px-6 text-lg font-bold shrink-0 sm:min-w-48 bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20'
            >
              {loading ? (
                <>
                  <Loader2 className='size-5 animate-spin' /> Đang xử lý…
                </>
              ) : (
                <>
                  <CheckCircle2 className='size-5' /> Xác nhận hoàn tất
                </>
              )}
            </Button>
          </div>
        </WorkflowFooter>
      )}
    </div>
  );
}
