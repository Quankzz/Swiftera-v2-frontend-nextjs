'use client';

import React from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RentalOrderResponse } from '@/types/api.types';
import { WorkflowBanner } from '../WorkflowBanner';
import {
  CustomerInfo,
  RentalDateTimeline,
  RentalSummary,
  OrderItemsList,
  OrderMetaCard,
} from '../OrderInfo';

interface ConfirmDeliveryWorkflowProps {
  order: RentalOrderResponse;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDeliveryWorkflow({
  order,
  onConfirm,
  loading,
}: ConfirmDeliveryWorkflowProps) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="flex-1 min-h-0 space-y-4 pb-28">
        <WorkflowBanner
          icon={ClipboardCheck}
          title="Xác nhận tiếp nhận đơn hàng"
          desc="Đơn hàng đã thanh toán. Kiểm tra thông tin và danh sách thiết bị trước khi bắt đầu chuẩn bị."
          variant="warning"
        />

        {/* ── 2-column grid: left=info cards, right=items ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <OrderMetaCard order={order} />
            <CustomerInfo order={order} mode="delivery" />
            <RentalDateTimeline order={order} mode="delivery" />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <OrderItemsList order={order} mode="confirm" />
            <RentalSummary order={order} />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <p className="text-[12px] text-muted-foreground">
            Xác nhận để bắt đầu chuẩn bị hàng tại kho hub.
          </p>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 rounded-lg px-5 text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <ClipboardCheck className="size-4" /> Xác nhận tiếp nhận
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
