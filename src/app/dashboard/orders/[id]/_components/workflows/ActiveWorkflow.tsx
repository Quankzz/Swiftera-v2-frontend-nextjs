import React from 'react';
import Image from 'next/image';
import { AlertCircle, Package, Calendar, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmtDate } from '../utils';

export function ActiveWorkflow({
  order,
  onRequestReturnEarly,
  loading,
}: {
  order: DashboardOrder;
  onRequestReturnEarly?: () => void;
  loading?: boolean;
}) {
  const now = new Date();
  const endDate = new Date(order.end_date);
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  const isOverdue = order.status === 'OVERDUE';
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={isOverdue ? AlertCircle : Package}
        variant={isOverdue ? 'danger' : 'success'}
        title={isOverdue ? 'Đơn hàng quá hạn!' : 'Khách đang sử dụng thiết bị'}
        desc={
          isOverdue
            ? 'Khách chưa trả hàng dù đã qua ngày kết thúc. Liên hệ ngay và chuẩn bị thu hồi sản phẩm.'
            : 'Không cần hành động lúc này. Hệ thống sẽ thông báo khi khách yêu cầu trả hoặc đến ngày hết hạn.'
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Thời hạn thuê</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bắt đầu', value: fmtDate(order.start_date), cls: '' },
            { label: 'Kết thúc', value: fmtDate(order.end_date), cls: '' },
            {
              label: isOverdue ? 'Quá hạn' : 'Còn lại',
              value: isOverdue
                ? `${Math.abs(diffDays)}d`
                : diffDays <= 0
                  ? 'Hôm nay'
                  : `${diffDays}d`,
              cls: isOverdue
                ? 'border-destructive/30 bg-destructive/5'
                : diffDays <= 1
                  ? 'border-yellow-300/50 bg-yellow-50 dark:bg-yellow-950/20'
                  : '',
            },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                'rounded-xl border border-border bg-muted/30 p-3 text-center',
                c.cls,
              )}
            >
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p
                className={cn(
                  'text-sm font-bold',
                  isOverdue && c.label !== 'Bắt đầu' && c.label !== 'Kết thúc'
                    ? 'text-destructive'
                    : 'text-foreground',
                )}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Sản phẩm đang thuê
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-border">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
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

      {isOverdue && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-destructive mb-0.5">
              Liên hệ khách ngay
            </p>
            <p className="text-sm text-foreground font-semibold">
              {order.renter.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.renter.phone_number}
            </p>
          </div>
          <a
            href={`tel:${order.renter.phone_number}`}
            className="inline-flex items-center gap-2 shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors"
          >
            <Phone className="size-4" /> Gọi ngay
          </a>
        </div>
      )}

      {/* Mock return early button */}
      {!isOverdue && onRequestReturnEarly && (
        <div className="rounded-2xl border border-theme-primary-start/20 bg-theme-primary-start/5 p-5 mt-2">
          <p className="text-sm font-bold text-foreground mb-1">
            Khách yêu cầu trả sớm?
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Tính năng mô phỏng: Bấm vào đây nếu khách hàng thông báo muốn chấm dứt hợp đồng sớm và yêu cầu bạn đến lấy thiết bị.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={onRequestReturnEarly}
            disabled={loading}
            className="w-full gap-2 border-theme-primary-start text-theme-primary-start hover:bg-theme-primary-start hover:text-white transition-colors"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <AlertCircle className="size-5" />
            )}
            (Mô phỏng) Khách trả hàng sớm
          </Button>
        </div>
      )}
    </div>
  );
}
