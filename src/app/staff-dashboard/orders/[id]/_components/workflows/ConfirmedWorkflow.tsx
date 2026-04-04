import React from 'react';
import {
  Warehouse,
  MapPin,
  Phone,
  Clock,
  Camera,
  Truck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HubResponse } from '@/api/hubs';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { InfoRow } from '../InfoRow';
import { ItemInspectionCard } from '../ItemInspectionCard';

export function ConfirmedWorkflow({
  order,
  hubInfo,
  onStartDelivery,
  loading,
}: {
  order: DashboardOrder;
  hubInfo?: HubResponse | null;
  onStartDelivery: () => void;
  loading: boolean;
}) {
  const hubName = hubInfo?.name ?? order.hub_id ?? '—';
  const hubAddress = hubInfo
    ? [hubInfo.addressLine, hubInfo.ward, hubInfo.district, hubInfo.city]
        .filter(Boolean)
        .join(', ')
    : '—';
  const hubPhone = hubInfo?.phone ?? '—';
  const hubHours = '07:00 – 21:00'; // not in API, default value
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Warehouse}
        variant="primary"
        title="Đến hub nhận hàng và chuẩn bị giao"
        desc="Đến hub lấy từng sản phẩm, kiểm tra tình trạng, chụp ảnh minh chứng trước khi khởi hành đến nhà khách."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
            <Warehouse className="size-3.5 text-theme-primary-start" />
          </div>
          <p className="text-sm font-bold text-foreground">Thông tin Hub</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Warehouse} label="Tên hub" value={hubName} strong />
          <InfoRow icon={MapPin} label="Địa chỉ" value={hubAddress} />
          <InfoRow icon={Phone} label="Điện thoại" value={hubPhone} />
          <InfoRow icon={Clock} label="Giờ mở cửa" value={hubHours} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-theme-primary-start/10 flex items-center justify-center">
              <Camera className="size-3.5 text-theme-primary-start" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Chụp ảnh sản phẩm tại hub
            </p>
          </div>
          <span className="text-xs font-bold bg-theme-primary-start/10 text-theme-primary-start border border-theme-primary-start/25 px-2.5 py-1 rounded-lg whitespace-nowrap">
            {order.items.length} sản phẩm
          </span>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {order.items.map((item) => (
            <ItemInspectionCard
              key={item.rental_order_item_id}
              item={item}
              phase="checkin"
            />
          ))}
        </div>

        <div className="relative flex justify-end pb-5 mx-5">
          <Button
            size="default"
            onClick={onStartDelivery}
            disabled={loading}
            className="lg:w-[40%] w-full h-16 gap-2 text-xl font-bold bg-linear-to-r from-theme-primary-start to-theme-primary-end hover:opacity-90 text-white shadow-md shadow-theme-primary-start/20 transition-all"
          >
            {loading ? (
              <Loader2 className="size-4.5 animate-spin" />
            ) : (
              <Truck className="size-4.5" />
            )}
            Đã lấy hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
