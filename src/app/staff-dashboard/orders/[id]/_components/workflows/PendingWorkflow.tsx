import React from 'react';
import Image from 'next/image';
import {
  User,
  Phone,
  MapPin,
  ClipboardList,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { InfoRow } from '../InfoRow';
import { fmt, fmtDate } from '../utils';

export function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: {
  order: DashboardOrder;
  onConfirm: () => void;
  loading: boolean;
}) {
  const isPaid = order.payment_status === 'PAID';

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={ClipboardList}
        variant="primary"
        title="Đơn hàng mới — cần xác nhận"
        desc="Khách đã thanh toán và xác nhận thuê. Kiểm tra thông tin rồi xác nhận để bắt đầu chuẩn bị giao hàng."
      />

      {!isPaid && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-semibold text-destructive">
            Khách chưa thanh toán đầy đủ — không thể xác nhận đơn
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Khách thuê</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <InfoRow
            icon={User}
            label="Họ và tên"
            value={order.renter.full_name}
            strong
          />
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
            value={order.renter.phone_number}
          />
          <InfoRow
            icon={ClipboardList}
            label="CCCD"
            value={order.renter.cccd_number}
            mono
          />
          <InfoRow
            icon={MapPin}
            label="Địa chỉ giao hàng"
            value={order.delivery_address ?? order.renter.address}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Sản phẩm thuê ({order.items.length})
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="relative size-11 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.serial_number}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground">
                  {fmt(item.daily_price)}/ngày
                </p>
                <p className="text-xs text-muted-foreground">
                  Cọc: {fmt(item.deposit_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ngày bắt đầu', value: fmtDate(order.start_date) },
          { label: 'Ngày kết thúc', value: fmtDate(order.end_date) },
          { label: 'Phí thuê', value: fmt(order.total_rental_fee) },
          { label: 'Tiền cọc', value: fmt(order.total_deposit) },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-xl border border-border bg-card p-3.5"
          >
            <p className="text-xs text-muted-foreground mb-1">{cell.label}</p>
            <p className="text-sm font-bold text-foreground">{cell.value}</p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-bold text-muted-foreground mb-1">
            Ghi chú của khách
          </p>
          <p className="text-sm text-foreground">{order.notes}</p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={loading || !isPaid}
          className="w-full gap-2 text-base"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          Xác nhận đơn hàng
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Đơn hàng này đã được phân công cho bạn. Nhấn sau khi kiểm tra đủ thông
          tin.
        </p>
      </div>
    </div>
  );
}
