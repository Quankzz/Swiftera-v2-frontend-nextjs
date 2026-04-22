'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RentalOrderResponse } from '@/types/api.types';
import { fmt } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import { OrderItemsList, CustomerInfo, OrderMetaCard } from '../OrderInfo';

interface CancelledWorkflowProps {
  order: RentalOrderResponse;
}

export function CancelledWorkflow({ order }: CancelledWorkflowProps) {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <WorkflowBanner
        icon={XCircle}
        title="Đơn hàng đã bị hủy"
        desc="Đơn hàng này đã được hủy. Vui lòng kiểm tra lại thông tin và liên hệ quản lý nếu có sai sót."
        variant="danger"
      />

      {/* ── 2-column grid: left=info cards, right=items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          <OrderMetaCard order={order} />

          <CustomerInfo order={order} mode="delivery" />

          {/* Cancelled order financial summary */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <XCircle className="size-4 text-red-500" />
              <h3 className="text-[13px] font-bold text-foreground">
                Thông tin tài chính
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Phí thuê */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      ₫
                    </span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    Phí thuê
                  </span>
                </div>
                <span className="text-[14px] font-bold text-foreground">
                  {fmt(order.rentalFeeAmount)}
                </span>
              </div>

              {/* Tiền đặt cọc */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500">
                      ₫
                    </span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    Tiền đặt cọc
                  </span>
                </div>
                <span className="text-[14px] font-bold text-blue-600 dark:text-blue-400">
                  {fmt(order.depositHoldAmount ?? 0)}
                </span>
              </div>

              {/* Đã thanh toán */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-500">
                      ✓
                    </span>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    Đã thanh toán
                  </span>
                </div>
                <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                  {fmt(order.totalPaidAmount ?? 0)}
                </span>
              </div>

              {/* Phí phạt (nếu có) */}
              {(order.penaltyChargeAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-800/20">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-orange-500">
                        !
                      </span>
                    </div>
                    <span className="text-[13px] text-orange-600 dark:text-orange-400 font-semibold">
                      Phí phạt
                    </span>
                  </div>
                  <span className="text-[14px] font-bold text-orange-600 dark:text-orange-400">
                    +{fmt(order.penaltyChargeAmount ?? 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Items */}
        <div className="flex flex-col gap-4">
          <OrderItemsList order={order} mode="confirm" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-border/50 pt-4">
        <div className="flex items-center justify-end">
          <Link href="/staff-dashboard/orders">
            <Button
              variant="outline"
              className="gap-2 h-10 rounded-lg px-4 text-[13px] font-medium border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Về danh sách đơn hàng</span>
              <span className="sm:hidden">Danh sách</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
