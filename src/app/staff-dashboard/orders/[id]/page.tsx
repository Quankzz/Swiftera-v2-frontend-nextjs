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
  Loader2,
  X,
} from 'lucide-react';
import axios from 'axios';
import '@goongmaps/goong-js/dist/goong-js.css';
import { cn } from '@/lib/utils';
import { apiKey } from '@/configs/goongmapKeys';
import type { StaffOrder, OrderStatus } from '@/types/api.types';
import {
  getStaffOrderById,
  updateOrderStatus,
  recordDelivery,
  recordPickup,
  setPenalty,
  type StaffTransitionTargetStatus,
} from '@/api/staff-orders';
import { getHubById } from '@/api/hubs';
import type { HubResponse } from '@/api/hubs';
import { useAuthStore } from '@/stores/auth-store';
import { useStaffOrderCounts } from '@/stores/staff-order-counts-store';
import { Button } from '@/components/ui/button';

import { STATUS_CFG, fmtDate, fmtDatetime, fmt } from './_components/utils';
import { Section } from './_components/Section';
import { WorkflowStepper } from './_components/WorkflowStepper';
import { InfoRow } from './_components/InfoRow';
import { DeliveryMiniMap } from './_components/DeliveryMiniMap';
import { PendingWorkflow } from './_components/workflows/PendingWorkflow';
import { ConfirmedWorkflow } from './_components/workflows/ConfirmedWorkflow';
import { DeliveringWorkflow } from './_components/workflows/DeliveringWorkflow';
import { DeliveredWorkflow } from './_components/workflows/DeliveredWorkflow';
import { ActiveWorkflow } from './_components/workflows/ActiveWorkflow';
import { ReturningWorkflow } from './_components/workflows/ReturningWorkflow';
import { CompletedWorkflow } from './_components/workflows/CompletedWorkflow';
import { PickedUpWorkflow } from './_components/workflows/PickedUpWorkflow';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const updateCount = useStaffOrderCounts((s) => s.updateCount);
  const [order, setOrder] = useState<StaffOrder | null>(null);
  const [hubInfo, setHubInfo] = useState<HubResponse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.userId) {
      setPageLoading(false);
      setPageError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    let cancelled = false;
    setPageLoading(true);
    setPageError(null);
    getStaffOrderById(id)
      .then((o) => {
        if (!cancelled) {
          setOrder(o);
          // Fetch hub info when order is loaded
          if (o?.hub_id) {
            getHubById(o.hub_id)
              .then((hub) => {
                if (!cancelled) setHubInfo(hub);
              })
              .catch(() => {});
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setPageError(err?.message ?? 'Không thể tải đơn hàng');
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.userId]);
  // Geocoded destination coords - used when API returns null lat/lng
  const [geocodedDestLat, setGeocodedDestLat] = useState<number | undefined>();
  const [geocodedDestLng, setGeocodedDestLng] = useState<number | undefined>();
  useEffect(() => {
    if (!order) return;
    if (order.delivery_latitude != null) return; // already have coords
    if (!order.delivery_address) return;
    const status = order.status;
    if (status !== 'DELIVERING' && status !== 'PICKING_UP') return;
    let cancelled = false;
    axios
      .get(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(order.delivery_address)}&api_key=${apiKey}`,
      )
      .then((res) => {
        if (cancelled) return;
        const loc = res.data?.results?.[0]?.geometry?.location;
        if (loc) {
          setGeocodedDestLat(loc.lat);
          setGeocodedDestLng(loc.lng);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [order]);

  // GPS state - local to this page; initialized from order delivery coordinates
  const [localLat, setLocalLat] = useState<number | undefined>(
    order?.delivery_latitude,
  );
  const [localLng, setLocalLng] = useState<number | undefined>(
    order?.delivery_longitude,
  );
  const [localLocAt, setLocalLocAt] = useState<string | undefined>(undefined);
  // Auto-watch GPS whenever staff is on the move (DELIVERING or PICKING_UP)
  const gpsWatchRef = useRef<number | null>(null);
  useEffect(() => {
    const needsGps =
      order?.status === 'PREPARING' ||
      order?.status === 'DELIVERING' ||
      order?.status === 'PICKING_UP';
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
    async (
      newStatus: StaffTransitionTargetStatus,
      options?: {
        penaltyTotal?: number;
        note?: string;
      },
    ): Promise<StaffOrder | null> => {
      if (!order) return null;
      setStatusLoading(true);
      setActionError(null);
      try {
        let updated: StaffOrder | null = null;

        // Call penalty endpoint first if needed
        if (
          (options?.penaltyTotal !== undefined && options.penaltyTotal > 0) ||
          (options?.note?.trim().length ?? 0) > 0
        ) {
          updated = await setPenalty(order.rental_order_id, {
            penaltyTotal: options?.penaltyTotal ?? 0,
            note: options?.note,
          });
        }

        // Route to the correct status-update endpoint
        switch (newStatus) {
          case 'DELIVERED':
            updated = await recordDelivery(order.rental_order_id, {
              deliveredLatitude: localLat,
              deliveredLongitude: localLng,
            });
            break;
          case 'PICKED_UP':
            updated = await recordPickup(order.rental_order_id, {
              pickedUpLatitude: localLat,
              pickedUpLongitude: localLng,
            });
            break;
          case 'COMPLETED':
          case 'PREPARING':
          case 'DELIVERING':
          case 'PICKING_UP':
            updated = await updateOrderStatus(order.rental_order_id, newStatus);
            break;
        }

        if (!updated) {
          throw new Error('API không trả về dữ liệu cập nhật trạng thái đơn hàng');
        }

        updateCount(order.status, newStatus);
        setOrder(updated);
        return updated;
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Không thể cập nhật trạng thái',
        );
        return null;
      } finally {
        setStatusLoading(false);
      }
    },
    [order, localLat, localLng, updateCount],
  );

  const handleSettlementUpdate = useCallback(
    async (refundNote?: string) => {
      if (!order) return;
      await handleStatusChange('COMPLETED', {
        penaltyTotal: order.total_penalty_amount,
        note: refundNote,
      });
    },
    [order, handleStatusChange],
  );

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <span>Đang tải đơn hàng…</span>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center p-6">
        <AlertCircle className="size-12 text-destructive/40" />
        <p className="text-destructive font-semibold">{pageError}</p>
        <Link href="/staff-dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

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

  // Effective destination coords: prefer API-provided, fall back to geocoded
  const effectiveDestLat = order.delivery_latitude ?? geocodedDestLat;
  const effectiveDestLng = order.delivery_longitude ?? geocodedDestLng;

  // Map shown only while staff is physically moving: delivering or collecting returns
  const hasMapPanel =
    order.status === 'DELIVERING' || order.status === 'PICKING_UP';

  const mapConfig = (() => {
    if (!hasMapPanel) return null;
    return {
      title:
        order.status === 'DELIVERING' ? 'Bản đồ giao hàng' : 'Đến lấy hàng trả',
      destLat: effectiveDestLat,
      destLng: effectiveDestLng,
      destAddress: order.delivery_address ?? '',
      destPinColor: 'red' as const,
      destLabel: order.status === 'DELIVERING' ? 'Điểm giao' : 'Lấy hàng trả',
    };
  })();

  // Detect which workflow role the current staff has for this order
  const staffRole: 'delivery' | 'pickup' | 'both' = user?.userId
    ? order.staff_checkin_id === user.userId &&
      order.staff_checkout_id === user.userId
      ? 'both'
      : order.staff_checkin_id === user.userId
        ? 'delivery'
        : 'pickup'
    : 'pickup';

  // Helper to check if status is in the delivery or pickup half
  const DELIVERY_STATUSES: OrderStatus[] = [
    'PAID',
    'PREPARING',
    'DELIVERING',
    'DELIVERED',
  ];
  const isDeliveryStatus = DELIVERY_STATUSES.includes(order.status);

  return (
    <>
      <div className="p-3 sm:p-5 lg:p-6 min-h-screen">
        <div className={cn('mx-auto', 'max-w-5xl')}>
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
                    className={cn(
                      'size-2 rounded-full shrink-0',
                      statusCfg.dot,
                    )}
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

          {/* Workflow stepper - only show the flow matching current status */}
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
              // 1. Set sticky, top offset (chừa chỗ cho thanh menu trên cùng), và giới hạn chiều cao tối đa của toàn bộ cột
              // Giả sử Header web của bạn cao khoảng 4rem (h-16), ta set top-20 (5rem) để cách 1 đoạn, và h-[calc(100vh-6rem)] để cách đáy 1 đoạn
              <div className="order-first lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] flex flex-col z-10 transition-all">
                {/* 2. Thêm h-full để Card chiếm trọn chiều cao cột, và flex-col để chia layout bên trong */}
                <div className="rounded-2xl border border-border bg-card shadow-md flex flex-col h-full overflow-hidden">
                  {/* Header của Map (Thêm shrink-0 để không bị bóp méo khi màn hình nhỏ) */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
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

                  {/* Body của Map: flex-1 min-h-0 giúp nó tự động chiếm toàn bộ không gian còn lại giữa Header và Footer của Card */}
                  <div className="p-2.5 flex-1 min-h-0">
                    <DeliveryMiniMap
                      destLat={mapConfig.destLat}
                      destLng={mapConfig.destLng}
                      destAddress={mapConfig.destAddress}
                      staffLat={localLat}
                      staffLng={localLng}
                      destPinColor={mapConfig.destPinColor}
                      destLabel={mapConfig.destLabel}
                      // Trên mobile: vẫn giữ chiều cao cố định (vh). Trên Desktop: chiếm 100% thẻ cha (h-full)
                      mapHeightClass="h-[55vh] sm:h-[65vh] lg:h-full lg:min-h-0"
                    />
                  </div>

                  {/* GPS live status footer (Thêm shrink-0) */}
                  <div className="px-4 py-3 border-t border-border flex items-center gap-3 bg-card shrink-0">
                    <div
                      className={cn(
                        'size-2.5 rounded-full shrink-0 transition-colors',
                        localLocAt
                          ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                          : 'bg-muted-foreground/40',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {localLocAt
                          ? 'GPS đang theo dõi'
                          : 'Đang lấy vị trí...'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
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
              {actionError && (
                <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive font-medium">
                  {actionError}
                </div>
              )}
              {/* Status-specific workflow panel */}
              {/* ── Delivery staff workflows ─── */}
              {(staffRole === 'delivery' ||
                staffRole === 'both' ||
                isDeliveryStatus) &&
                order.status === 'PAID' && (
                  <PendingWorkflow
                    order={order}
                    onConfirm={() =>
                      handleStatusChange('PREPARING')
                    }
                    loading={statusLoading}
                  />
                )}

              {order.status === 'PREPARING' && (
                <ConfirmedWorkflow
                  order={order}
                  hubInfo={hubInfo}
                  onStartDelivery={() => handleStatusChange('DELIVERING')}
                  loading={statusLoading}
                  staffLat={localLat}
                  staffLng={localLng}
                  staffLocAt={localLocAt}
                />
              )}

              {order.status === 'DELIVERING' && (
                <DeliveringWorkflow
                  order={order}
                  onConfirmDelivery={() => handleStatusChange('DELIVERED')}
                  loading={statusLoading}
                  staffLat={localLat}
                  staffLng={localLng}
                  staffLocAt={localLocAt}
                />
              )}

              {order.status === 'DELIVERED' && (
                <DeliveredWorkflow order={order} loading={statusLoading} />
              )}

              {/* ── Pickup staff workflows ─── */}
              {(order.status === 'IN_USE' || order.status === 'OVERDUE') && (
                <ActiveWorkflow
                  order={order}
                  onStartPickup={() => handleStatusChange('PICKING_UP')}
                  loading={statusLoading}
                />
              )}

              {order.status === 'PENDING_PICKUP' && (
                <ActiveWorkflow
                  order={order}
                  onStartPickup={() => handleStatusChange('PICKING_UP')}
                  loading={statusLoading}
                  isPendingPickup
                />
              )}

              {order.status === 'PICKING_UP' && (
                <ReturningWorkflow
                  order={order}
                  onCompleteReturn={async (
                    damagePenalty?: number,
                    overduePenalty?: number,
                  ) => {
                    const penaltyTotal =
                      (damagePenalty ?? 0) + (overduePenalty ?? 0);
                    try {
                      const updated = await handleStatusChange('PICKED_UP', {
                        penaltyTotal,
                      });
                      if (updated) {
                        setOrder({
                          ...updated,
                          staff_checkout_id: user?.userId,
                        });
                      }
                    } catch (err) {
                      setActionError(
                        err instanceof Error
                          ? err.message
                          : 'Lỗi khi lưu dữ liệu hoàn trả',
                      );
                    }
                  }}
                  loading={statusLoading}
                  staffLat={localLat}
                  staffLng={localLng}
                  staffLocAt={localLocAt}
                />
              )}

              {order.status === 'PICKED_UP' && (
                <PickedUpWorkflow
                  order={order}
                  onCompleteReturn={async (damagePenalty, overduePenalty) => {
                    if ((damagePenalty ?? 0) > 0 || (overduePenalty ?? 0) > 0) {
                      const updated = await setPenalty(order.rental_order_id, {
                        damagePenaltyAmount: damagePenalty,
                        overduePenaltyAmount: overduePenalty,
                      });
                      setOrder(updated);
                    }
                    const final = await updateOrderStatus(
                      order.rental_order_id,
                      'COMPLETED',
                    );
                    updateCount(order.status, 'COMPLETED');
                    setOrder(final);
                  }}
                  loading={statusLoading}
                />
              )}

              {order.status === 'COMPLETED' && (
                <CompletedWorkflow
                  order={order}
                  onDepositRefund={handleSettlementUpdate}
                  loading={statusLoading}
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

              {/* Collapsible full details - hidden for COMPLETED (merged into CompletedWorkflow) */}
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
      <div
        id="workflow-footer-portal"
        className="sticky border-t border-border bg-card px-28 bottom-0 z-40 w-full"
      />
    </>
  );
}
