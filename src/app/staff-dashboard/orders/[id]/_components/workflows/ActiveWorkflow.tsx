import React, { useState } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Package,
  Calendar,
  Phone,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmtDate } from '../utils';

export function ActiveWorkflow({
  order,
  onStartPickup,
  loading,
  isPendingPickup,
}: {
  order: DashboardOrder;
  onStartPickup?: () => void;
  loading?: boolean;
  /** True when order.status === 'PENDING_PICKUP' — shows a stronger CTA */
  isPendingPickup?: boolean;
}) {
  const [now] = useState(() => new Date());
  const endDate = new Date(order.end_date);
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  const isOverdue = order.status === 'OVERDUE';
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={isOverdue ? AlertCircle : Package}
        variant={isOverdue ? 'danger' : isPendingPickup ? 'warning' : 'success'}
        title={
          isPendingPickup
            ? 'Chờ bắt đầu thu hồi'
            : isOverdue
              ? 'Đơn hàng quá hạn!'
              : 'Khách đang sử dụng thiết bị'
        }
        desc={
          isPendingPickup
            ? 'Khách đã yêu cầu trả hàng. Bấm bắt đầu thu hồi khi bạn sẵn sàng khởi hành.'
            : isOverdue
              ? 'Khách chưa trả hàng dù đã qua ngày kết thúc. Liên hệ ngay và chuẩn bị thu hồi sản phẩm.'
              : 'Không cần hành động lúc này. Hệ thống sẽ thông báo khi khách yêu cầu trả hoặc đến ngày hết hạn.'
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Calendar className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">Thời hạn thuê</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bắt đầu', value: fmtDate(order.start_date), cls: '' },
            { label: 'Kết thúc', value: fmtDate(order.end_date), cls: '' },
            {
              label: isOverdue ? 'Quá hạn' : 'Còn lại',
              value: isOverdue
                ? `${Math.abs(diffDays)} ngày`
                : diffDays <= 0
                  ? 'Hôm nay'
                  : `${diffDays} ngày`,
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
                'rounded-xl border border-border bg-muted/30 p-3.5 text-center',
                c.cls,
              )}
            >
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">
                {c.label}
              </p>
              <p
                className={cn(
                  'text-sm font-bold whitespace-nowrap',
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
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Package className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">
            Sản phẩm đang thuê
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
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

      {(isOverdue || isPendingPickup) && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-destructive mb-0.5">
              Liên hệ khách ngay
            </p>
            <p className="text-sm text-foreground font-semibold whitespace-nowrap">
              {order.renter.full_name}
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {order.renter.phone_number}
            </p>
          </div>
          <a
            href={`tel:${order.renter.phone_number}`}
            className="inline-flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold bg-destructive text-white hover:bg-destructive/90 transition-colors shadow-md shadow-destructive/20"
          >
            <Phone className="size-4" /> Gọi ngay
          </a>
        </div>
      )}

      {(isOverdue || isPendingPickup) && onStartPickup && (
        <Button
          size="lg"
          variant="destructive"
          onClick={onStartPickup}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <RotateCcw className="size-5" />
          )}
          {isPendingPickup ? 'Bắt đầu thu hồi' : 'Bắt đầu thu hồi đơn quá hạn'}
        </Button>
      )}
    </div>
  );
}
