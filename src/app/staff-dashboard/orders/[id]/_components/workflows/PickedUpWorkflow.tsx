import React from 'react';
import { Package, ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';

export function PickedUpWorkflow({
  order,
  onStartInspection,
  loading,
}: {
  order: DashboardOrder;
  onStartInspection: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Package}
        variant="primary"
        title="Đã thu hồi sản phẩm từ khách"
        desc="Sản phẩm đã được lấy từ khách. Vận chuyển về hub và bắt đầu kiểm định tình trạng từng sản phẩm."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Package className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Sản phẩm đã thu hồi
          </p>
          <span className="ml-auto text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
            {order.items.length} sản phẩm
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <Package className="size-4 text-indigo-500 shrink-0" />
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

      <div className="rounded-2xl border border-yellow-200 dark:border-yellow-800/40 bg-yellow-50 dark:bg-yellow-950/20 p-5">
        <div className="flex items-start gap-3 mb-4">
          <ClipboardList className="size-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">
              Bắt đầu kiểm định tại hub
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Kiểm tra kỹ từng sản phẩm, ghi nhận hư hỏng nếu có và chụp ảnh
              minh chứng. Phí phạt sẽ được tính dựa trên kết quả kiểm định.
            </p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={onStartInspection}
          disabled={loading}
          className="w-full gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ClipboardList className="size-5" />
          )}
          Bắt đầu kiểm định
        </Button>
      </div>
    </div>
  );
}
