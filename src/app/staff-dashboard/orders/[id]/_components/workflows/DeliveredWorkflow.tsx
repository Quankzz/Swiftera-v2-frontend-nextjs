import React from 'react';
import { CheckCircle2, Calendar, Package } from 'lucide-react';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmtDate } from '../utils';

export function DeliveredWorkflow({ order }: { order: DashboardOrder }) {
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={CheckCircle2}
        variant="success"
        title="Giao hàng thành công!"
        desc="Sản phẩm đã được bàn giao cho khách. Nhiệm vụ giao hàng của bạn đã hoàn tất. Nhân viên thu hồi sẽ xử lý đơn này khi đến thời điểm."
      />

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-7 rounded-lg bg-success/10 flex items-center justify-center">
            <Calendar className="size-3.5 text-success" />
          </div>
          <p className="text-sm font-bold text-foreground">Thông tin thuê</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">
              Bắt đầu
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmtDate(order.start_date)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-center">
            <p className="text-[11px] text-muted-foreground mb-1 font-medium">
              Kết thúc
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmtDate(order.end_date)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Package className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">Sản phẩm đã giao</p>
        </div>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-3"
            >
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.serial_number}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
