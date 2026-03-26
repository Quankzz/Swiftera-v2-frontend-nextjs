import React from 'react';
import {
  Warehouse,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Camera,
  Truck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_HUB_INFO } from '@/data/mockDashboard';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { InfoRow } from '../InfoRow';
import { ItemInspectionCard } from '../ItemInspectionCard';

export function ConfirmedWorkflow({
  order,
  onStartDelivery,
  loading,
}: {
  order: DashboardOrder;
  onStartDelivery: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Warehouse}
        variant="primary"
        title="Đến hub nhận hàng và chuẩn bị giao"
        desc="Đến hub lấy từng sản phẩm, kiểm tra tình trạng, chụp ảnh minh chứng trước khi khởi hành đến nhà khách."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Warehouse className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Thông tin Hub</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={Warehouse}
            label="Tên hub"
            value={MOCK_HUB_INFO.name}
            strong
          />
          <InfoRow
            icon={MapPin}
            label="Địa chỉ"
            value={MOCK_HUB_INFO.address}
          />
          <InfoRow
            icon={Phone}
            label="Điện thoại"
            value={MOCK_HUB_INFO.phone_number}
          />
          <InfoRow
            icon={Clock}
            label="Giờ mở cửa"
            value={MOCK_HUB_INFO.open_hours}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-theme-primary-start" />
            <p className="text-sm font-bold text-foreground">
              Chụp ảnh sản phẩm tại hub
            </p>
          </div>
          <span className="text-xs font-bold bg-theme-primary-start/10 text-theme-primary-start border border-theme-primary-start/25 px-2 py-1 rounded-lg">
            {order.items.length} sản phẩm
          </span>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chụp nhiều góc độ để ghi nhận tình trạng ban đầu. Đây là bằng chứng
            bảo vệ cả nhân viên và khách hàng.
          </p>
          {order.items.map((item) => (
            <ItemInspectionCard
              key={item.rental_order_item_id}
              item={item}
              phase="checkin"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <Button
          size="default"
          onClick={onStartDelivery}
          disabled={loading}
          className="w-full h-11 gap-2 text-sm font-semibold"
        >
          {loading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <Truck className="size-4.5" />
          )}
          Đã lấy hàng — Bắt đầu giao
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Nhấn khi bạn đã có đủ sản phẩm và sẵn sàng khởi hành đến địa chỉ khách
        </p>
      </div>
    </div>
  );
}
