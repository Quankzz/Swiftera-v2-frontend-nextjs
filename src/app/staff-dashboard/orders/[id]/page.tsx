'use client';

import { useState, useCallback, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Navigation,
  ClipboardList,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import '@goongmaps/goong-js/dist/goong-js.css';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS, MOCK_CURRENT_STAFF } from '@/data/mockDashboard';
import type { DashboardOrder, OrderStatus } from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';

import { STATUS_CFG, fmtDate, fmtDatetime, fmt } from './_components/utils';
import { Section } from './_components/Section';
import { WorkflowStepper } from './_components/WorkflowStepper';
import { InfoRow } from './_components/InfoRow';
import { DeliveryMiniMap } from './_components/DeliveryMiniMap';
import { PendingWorkflow } from './_components/workflows/PendingWorkflow';
import { ConfirmedWorkflow } from './_components/workflows/ConfirmedWorkflow';
import { DeliveringWorkflow } from './_components/workflows/DeliveringWorkflow';
import { ActiveWorkflow } from './_components/workflows/ActiveWorkflow';
import { ReturningWorkflow } from './_components/workflows/ReturningWorkflow';
import { CompletedWorkflow } from './_components/workflows/CompletedWorkflow';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<DashboardOrder | null>(
    () => MOCK_ORDERS.find((o) => o.rental_order_id === id) ?? null,
  );
  const [statusLoading, setStatusLoading] = useState(false);
  // GPS state — lifted so map panel in right column can read and update it
  const [localLat, setLocalLat] = useState<number | undefined>(
    order?.staff_current_latitude,
  );
  const [localLng, setLocalLng] = useState<number | undefined>(
    order?.staff_current_longitude,
  );
  const [localLocAt, setLocalLocAt] = useState<string | undefined>(
    order?.staff_location_updated_at,
  );
  // Auto-watch GPS whenever staff is on the move (DELIVERING or RETURNING)
  const gpsWatchRef = useRef<number | null>(null);
  useEffect(() => {
    const needsGps =
      order?.status === 'DELIVERING' || order?.status === 'RETURNING';
    if (!needsGps || typeof navigator === 'undefined' || !navigator.geolocation)
      return;
    const opts: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 15_000,
    };
    const onPos = (pos: GeolocationPosition) => {
      setLocalLat(pos.coords.latitude);
      setLocalLng(pos.coords.longitude);
      setLocalLocAt(new Date().toISOString());
    };
    // Immediate fix then continuous updates
    navigator.geolocation.getCurrentPosition(onPos, () => {}, opts);
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      onPos,
      () => {},
      opts,
    );
    return () => {
      if (gpsWatchRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
        gpsWatchRef.current = null;
      }
    };
  }, [order?.status]);

  const handleStatusChange = useCallback(
    async (newStatus: OrderStatus, extra?: Partial<DashboardOrder>) => {
      setStatusLoading(true);
      await new Promise((r) => setTimeout(r, 700));
      setOrder((prev) =>
        prev ? { ...prev, status: newStatus, ...extra } : prev,
      );
      setStatusLoading(false);
    },
    [],
  );

  const handleDepositRefund = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setOrder((prev) =>
      prev ? { ...prev, deposit_refund_status: 'REFUNDED' } : prev,
    );
  }, []);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <AlertCircle className="size-14 text-muted-foreground/30" />
        <p className="text-base text-muted-foreground">
          Không tìm thấy đơn hàng
        </p>
        <Link href="/staff-dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CFG[order.status];
  const isOverdue = order.status === 'OVERDUE';
  const now = new Date().getTime();
  const daysOverdue = isOverdue
    ? Math.floor((now - new Date(order.end_date).getTime()) / 86400000)
    : 0;

  // Map shown only while staff is physically moving: delivering or collecting returns
  const hasMapPanel =
    (order.status === 'DELIVERING' || order.status === 'RETURNING') &&
    order.delivery_latitude != null;

  const mapConfig = (() => {
    if (!hasMapPanel || order.delivery_latitude == null) return null;
    return {
      title:
        order.status === 'DELIVERING' ? 'Bản đồ giao hàng' : 'Đến lấy hàng trả',
      destLat: order.delivery_latitude,
      destLng: order.delivery_longitude!,
      destAddress: order.delivery_address ?? '',
      destPinColor: 'red' as const,
      destLabel: order.status === 'DELIVERING' ? 'Điểm giao' : 'Lấy hàng trả',
    };
  })();

  return (
    <div className="p-3 sm:p-5 lg:p-6 min-h-screen">
      <div
        className={cn(
          'mx-auto',
          hasMapPanel && mapConfig ? 'max-w-5xl' : 'max-w-3xl',
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <Link href="/staff-dashboard/orders">
            <Button variant="ghost" size="icon" className="size-10 shrink-0">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">
                {order.order_code}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-sm font-bold',
                  statusCfg.color,
                  statusCfg.bg,
                  statusCfg.border,
                )}
              >
                <span
                  className={cn('size-2 rounded-full shrink-0', statusCfg.dot)}
                />
                {statusCfg.label}
              </span>
              {daysOverdue > 0 && (
                <span className="text-xs font-bold bg-destructive text-white px-2.5 py-1 rounded-xl">
                  Quá hạn {daysOverdue} ngày
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5" />
              <span>{order.renter.full_name}</span>
              <span>·</span>
              <span>{fmtDatetime(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Workflow stepper — full width */}
        <WorkflowStepper status={order.status} />

        {/* Main content grid */}
        <div
          className={cn(
            'mt-5 flex flex-col gap-5',
            hasMapPanel &&
              mapConfig &&
              'lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-5',
          )}
        >
          {/* RIGHT column: Map panel (shown first on mobile) */}
          {hasMapPanel && mapConfig && (
            <div className="order-first lg:order-2 lg:sticky lg:top-4 flex flex-col gap-3">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Navigation className="size-4 text-theme-primary-start" />
                    <p className="text-sm font-bold text-foreground">
                      {mapConfig.title}
                    </p>
                  </div>
                  {localLocAt && (
                    <p className="text-[11px] text-muted-foreground hidden lg:block">
                      GPS: {fmtDatetime(localLocAt)}
                    </p>
                  )}
                </div>
                <div className="p-2.5">
                  <DeliveryMiniMap
                    destLat={mapConfig.destLat}
                    destLng={mapConfig.destLng}
                    destAddress={mapConfig.destAddress}
                    staffLat={localLat}
                    staffLng={localLng}
                    destPinColor={mapConfig.destPinColor}
                    destLabel={mapConfig.destLabel}
                    mapHeightClass="h-52 sm:h-60 lg:h-[52vh] lg:max-h-96"
                  />
                </div>
                {/* GPS live status footer */}
                <div className="px-4 py-3 border-t border-border flex items-center gap-3">
                  <div
                    className={cn(
                      'size-2 rounded-full shrink-0 transition-colors',
                      localLocAt
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-muted-foreground/40',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {localLocAt ? 'GPS đang theo dõi' : 'Đang lấy vị trí...'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {localLocAt
                        ? `Cập nhật: ${fmtDatetime(localLocAt)}`
                        : 'Vui lòng cho phép truy cập vị trí'}
                    </p>
                  </div>
                  {!localLocAt && (
                    <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEFT column: Workflow + full details */}
          <div className="flex flex-col gap-4 lg:order-1">
            {/* Status-specific workflow panel */}
            {order.status === 'PENDING' && (
              <PendingWorkflow
                order={order}
                onConfirm={() =>
                  handleStatusChange('CONFIRMED', {
                    staff_checkin_id: MOCK_CURRENT_STAFF.staff_id,
                  })
                }
                loading={statusLoading}
              />
            )}

            {order.status === 'CONFIRMED' && (
              <ConfirmedWorkflow
                order={order}
                onStartDelivery={() => handleStatusChange('DELIVERING')}
                loading={statusLoading}
              />
            )}

            {order.status === 'DELIVERING' && (
              <DeliveringWorkflow
                order={order}
                onConfirmDelivery={() => handleStatusChange('ACTIVE')}
                loading={statusLoading}
                staffLat={localLat}
                staffLng={localLng}
                staffLocAt={localLocAt}
              />
            )}

            {(order.status === 'ACTIVE' || order.status === 'OVERDUE') && (
              <ActiveWorkflow
                order={order}
                onRequestReturnEarly={() => handleStatusChange('RETURNING')}
                loading={statusLoading}
              />
            )}

            {order.status === 'OVERDUE' && (
              <div className="rounded-2xl border border-destructive/25 bg-card p-5">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => handleStatusChange('RETURNING')}
                  disabled={statusLoading}
                  className="w-full gap-2"
                >
                  {statusLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-5" />
                  )}
                  Bắt đầu quy trình thu hồi đơn quá hạn
                </Button>
              </div>
            )}

            {order.status === 'RETURNING' && (
              <ReturningWorkflow
                order={order}
                onCompleteReturn={() =>
                  handleStatusChange('COMPLETED', {
                    actual_return_date: new Date().toISOString().split('T')[0],
                    staff_checkout_id: MOCK_CURRENT_STAFF.staff_id,
                  })
                }
                loading={statusLoading}
              />
            )}

            {order.status === 'COMPLETED' && (
              <CompletedWorkflow
                order={order}
                onDepositRefund={handleDepositRefund}
              />
            )}

            {order.status === 'CANCELLED' && (
              <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
                <X className="size-12 text-destructive/40" />
                <p className="text-base font-bold text-foreground">
                  Đơn hàng đã bị hủy
                </p>
                <p className="text-sm text-muted-foreground">
                  Đơn hàng này không còn hoạt động.
                </p>
              </div>
            )}

            {/* Collapsible full details — hidden for COMPLETED (merged into CompletedWorkflow) */}
            {order.status !== 'COMPLETED' && (
              <Section
                title="Chi tiết đơn hàng đầy đủ"
                icon={ClipboardList}
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="space-y-3.5">
                    <InfoRow
                      icon={User}
                      label="Khách thuê"
                      value={order.renter.full_name}
                      strong
                    />
                    <InfoRow
                      icon={Phone}
                      label="Điện thoại"
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
                      label="Địa chỉ giao"
                      value={order.delivery_address ?? order.renter.address}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Bắt đầu"
                      value={fmtDate(order.start_date)}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Kết thúc"
                      value={fmtDate(order.end_date)}
                    />
                    {order.actual_return_date && (
                      <InfoRow
                        icon={Calendar}
                        label="Ngày trả thực tế"
                        value={fmtDate(order.actual_return_date)}
                      />
                    )}
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 self-start">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí thuê</span>
                      <span className="font-bold">
                        {fmt(order.total_rental_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tiền cọc giữ
                      </span>
                      <span className="font-bold">
                        {fmt(order.total_deposit)}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2.5 flex justify-between">
                      <span className="text-sm font-bold">Đã thanh toán</span>
                      <span className="text-base font-bold text-theme-primary-start">
                        {fmt(order.total_rental_fee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        Thanh toán
                      </span>
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-lg border',
                          order.payment_status === 'PAID'
                            ? 'text-success bg-success-muted border-success-border'
                            : 'text-muted-foreground bg-muted border-border',
                        )}
                      >
                        {order.payment_status === 'PAID'
                          ? 'Đã thanh toán'
                          : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Hoàn cọc
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {order.deposit_refund_status === 'REFUNDED'
                          ? '✓ Đã hoàn cọc'
                          : order.deposit_refund_status === 'PARTIAL_REFUNDED'
                            ? 'Hoàn một phần'
                            : 'Chưa hoàn cọc'}
                      </span>
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      Ghi chú
                    </p>
                    <p className="text-sm text-foreground">{order.notes}</p>
                  </div>
                )}
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
