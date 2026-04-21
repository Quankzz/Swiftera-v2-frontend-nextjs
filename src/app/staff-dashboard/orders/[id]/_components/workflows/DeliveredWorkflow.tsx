'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RentalOrderResponse } from '@/types/api.types';
import { WorkflowBanner } from '../WorkflowBanner';
import {
  CustomerInfo,
  RentalSummary,
  OrderItemsList,
  OrderMetaCard,
} from '../OrderInfo';

interface DeliveredWorkflowProps {
  order: RentalOrderResponse;
  loading?: boolean;
}

export function DeliveredWorkflow({ order }: DeliveredWorkflowProps) {
  return (
    <div className="space-y-4">
      {/* Success banner */}
      <WorkflowBanner
        icon={CheckCircle2}
        title="Giao hàng thành công"
        desc="Đơn hàng đã được giao đến khách hàng. Hệ thống sẽ tự động cập nhật trạng thái khi khách xác nhận."
        variant="success"
      />

      {/* ── 2-column grid: left=info cards, right=items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          <OrderMetaCard order={order} />

          <CustomerInfo order={order} mode="delivery" />
        </div>

        {/* Right: Items */}
        <div className="flex flex-col gap-4">
          <OrderItemsList order={order} mode="delivered" />
          <RentalSummary order={order} />
        </div>
      </div>
    </div>
  );
}
