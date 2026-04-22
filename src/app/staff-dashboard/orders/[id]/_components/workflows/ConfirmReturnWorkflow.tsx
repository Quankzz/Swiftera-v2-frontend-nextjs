"use client";

import React from "react";
import { RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RentalOrderResponse } from "@/types/api.types";
import { WorkflowBanner } from "../WorkflowBanner";
import {
  CustomerInfo,
  RentalSummary,
  OrderItemsList,
  OverdueAlert,
  OrderMetaCard,
} from "../OrderInfo";

interface ConfirmReturnWorkflowProps {
  order: RentalOrderResponse;
  onConfirmPickup: () => void;
  loading?: boolean;
}

export function ConfirmReturnWorkflow({
  order,
  onConfirmPickup,
  loading,
}: ConfirmReturnWorkflowProps) {
  const isOverdue = order.overdue;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <WorkflowBanner
        icon={isOverdue ? AlertTriangle : RotateCcw}
        title={
          isOverdue
            ? "Thu hồi khẩn cấp — Đơn quá hạn"
            : "Xác nhận thu hồi đơn hàng"
        }
        desc={
          isOverdue
            ? "Đơn hàng đã quá hạn. Xác nhận để bắt đầu quy trình thu hồi ngay lập tức."
            : "Đơn thuê đã đến hạn trả. Xác nhận để bắt đầu hành trình đến lấy hàng tại địa chỉ khách."
        }
        variant={isOverdue ? "danger" : "warning"}
      />

      {/* Overdue alert */}
      {isOverdue && (
        <OverdueAlert
          overdueDays={order.overdueDays ?? 0}
          expectedDate={order.expectedRentalEndDate}
          type="pickup"
        />
      )}

      {/* ── 2-column grid: left=info cards, right=items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Left: Info cards */}
        <div className="flex flex-col gap-4">
          <OrderMetaCard order={order} />

          <CustomerInfo order={order} mode="pickup" />
        </div>

        {/* Right: Items */}
        <div className="flex flex-col gap-4">
          <OrderItemsList order={order} mode="pickup" />
          <RentalSummary order={order} showPickupDate />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <p className="text-[12px] text-muted-foreground">
            {isOverdue
              ? "Đơn đã quá hạn. Xác nhận để thu hồi ngay."
              : "Xác nhận để bắt đầu thu hồi thiết bị."}
          </p>
          <Button
            onClick={onConfirmPickup}
            disabled={loading}
            className={cn(
              "h-10 rounded-lg px-5 text-[13px] font-medium w-full sm:w-auto",
              isOverdue
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang xử lý…
              </>
            ) : (
              <>
                <RotateCcw className="size-4" /> Xác nhận thu hồi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
