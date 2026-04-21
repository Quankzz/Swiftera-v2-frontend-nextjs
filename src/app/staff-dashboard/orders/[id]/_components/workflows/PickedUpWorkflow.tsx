'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RentalOrderResponse } from '@/types/api.types';
import { fmt } from '../utils';
import { WorkflowBanner } from '../WorkflowBanner';
import {
  CustomerInfo,
  RentalSummary,
  OrderItemsList,
  FinancialSettlement,
  OrderMetaCard,
} from '../OrderInfo';

interface PickedUpWorkflowProps {
  order: RentalOrderResponse;
}

export function PickedUpWorkflow({ order }: PickedUpWorkflowProps) {
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="space-y-4">
      {/* Banner */}
      <WorkflowBanner
        icon={CheckCircle2}
        title={
          isCompleted ? 'Đơn hàng hoàn tất' : 'Đơn hàng đã thu hồi thành công'
        }
        desc={
          isCompleted
            ? `Đơn thuê đã được xử lý hoàn tất. ${(order.penaltyChargeAmount ?? 0) > 0 ? `Phí phạt: ${fmt(order.penaltyChargeAmount ?? 0)}.` : 'Không có phí phạt.'}`
            : 'Thiết bị đã được thu hồi. Đơn đang chờ ADMIN quyết toán trước khi hoàn tất.'
        }
        variant="success"
      />

      {/* ── 2-column grid: left=info cards, right=items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          <OrderMetaCard order={order} />
          <CustomerInfo order={order} mode="pickup" />
        </div>

        {/* Right: Items */}
        <div className="flex flex-col gap-4">
          <OrderItemsList
            order={order}
            mode={isCompleted ? 'returned' : 'pickup'}
          />
          {isCompleted ? (
            <FinancialSettlement order={order} />
          ) : (
            <RentalSummary order={order} showPickupDate />
          )}
        </div>
      </div>
    </div>
  );
}
