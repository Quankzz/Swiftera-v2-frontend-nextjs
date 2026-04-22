'use client';

import { useState, useCallback, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import '@goongmaps/goong-js/dist/goong-js.css';
import { cn } from '@/lib/utils';
import { apiKey } from '@/configs/goongmapKeys';
import type { RentalOrderResponse, OrderStatus } from '@/types/api.types';
import {
  getStaffOrderById,
  updateOrderStatus,
  recordDelivery,
  recordPickup,
  setPenalty,
  type StaffTransitionTargetStatus,
} from '@/api/staff-orders';
import { useAuthStore } from '@/stores/auth-store';
import { useStaffOrderCounts } from '@/stores/staff-order-counts-store';
import { Button } from '@/components/ui/button';

import { STATUS_CFG } from './_components/utils';
import { WorkflowStepper } from './_components/WorkflowStepper';
import { ConfirmDeliveryWorkflow } from './_components/workflows/ConfirmDeliveryWorkflow';
import { RepairingWorkflow } from './_components/workflows/RepairingWorkflow';
import { DeliveringWorkflow } from './_components/workflows/DeliveringWorkflow';
import { DeliveredWorkflow } from './_components/workflows/DeliveredWorkflow';
import { ReturningWorkflow } from './_components/workflows/ReturningWorkflow';
import { PickedUpWorkflow } from './_components/workflows/PickedUpWorkflow';
import { ConfirmReturnWorkflow } from './_components/workflows/ConfirmReturnWorkflow';
import { CancelledWorkflow } from './_components/workflows/CancelledWorkflow';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const updateCount = useStaffOrderCounts((s) => s.updateCount);
  const [order, setOrder] = useState<RentalOrderResponse | null>(null);
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
    if (order.deliveredLatitude != null) return; // already have coords
    const addressToGeocode = order.userAddress
      ? [
          order.userAddress.addressLine,
          order.userAddress.district,
          order.userAddress.city,
        ]
          .filter(Boolean)
          .join(', ')
      : (order.hubAddressLine ?? '');
    if (!addressToGeocode) return;
    const status = order.status;
    if (status !== 'DELIVERING' && status !== 'PICKING_UP') return;
    let cancelled = false;
    axios
      .get(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(addressToGeocode)}&api_key=${apiKey}`,
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
    order?.deliveredLatitude ?? undefined,
  );
  const [localLng, setLocalLng] = useState<number | undefined>(
    order?.deliveredLongitude ?? undefined,
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
        damagePenaltyAmount?: number;
        overduePenaltyAmount?: number;
        note?: string;
      },
    ): Promise<RentalOrderResponse | null> => {
      if (!order) return null;
      setStatusLoading(true);
      setActionError(null);
      try {
        let updated: RentalOrderResponse | null = null;

        // Always persist split penalties before pickup/completion transitions.
        const shouldSetPenalty =
          options?.damagePenaltyAmount !== undefined ||
          options?.overduePenaltyAmount !== undefined ||
          (options?.note?.trim().length ?? 0) > 0;

        if (shouldSetPenalty) {
          const damagePenaltyAmount =
            options?.damagePenaltyAmount !== undefined
              ? Math.max(0, options.damagePenaltyAmount)
              : undefined;
          const overduePenaltyAmount =
            options?.overduePenaltyAmount !== undefined
              ? Math.max(0, options.overduePenaltyAmount)
              : undefined;
          const note = options?.note?.trim();

          updated = await setPenalty(order.rentalOrderId, {
            damagePenaltyAmount,
            overduePenaltyAmount,
            note: note || undefined,
          });
        }

        // Route to the correct status-update endpoint
        switch (newStatus) {
          case 'DELIVERED':
            updated = await recordDelivery(order.rentalOrderId, {
              deliveredLatitude: localLat,
              deliveredLongitude: localLng,
            });
            break;
          case 'PICKED_UP':
            updated = await recordPickup(order.rentalOrderId, {
              pickedUpLatitude: localLat,
              pickedUpLongitude: localLng,
            });
            break;
          case 'PREPARING':
          case 'DELIVERING':
          case 'PICKING_UP':
            updated = await updateOrderStatus(order.rentalOrderId, newStatus);
            break;
        }

        if (!updated) {
          throw new Error(
            'API không trả về dữ liệu cập nhật trạng thái đơn hàng',
          );
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
  const orderCode = order.rentalOrderId;
  const now = new Date().getTime();
  const today = new Date(now).setHours(0, 0, 0, 0);

  // ── Delivery overdue: PAID only — expectedDeliveryDate passed today ─────────
  const deliveryOverdueDays =
    !order.overdue &&
    order.status === 'PAID' &&
    order.expectedDeliveryDate &&
    new Date(order.expectedDeliveryDate).setHours(0, 0, 0, 0) < today
      ? Math.floor(
          (today - new Date(order.expectedDeliveryDate).setHours(0, 0, 0, 0)) /
            86_400_000,
        )
      : 0;

  // ── Pickup overdue: PENDING_PICKUP only — expectedRentalEndDate passed today ──
  const pickupOverdueDays =
    !order.overdue &&
    order.status === 'PENDING_PICKUP' &&
    order.expectedRentalEndDate &&
    new Date(order.expectedRentalEndDate).setHours(0, 0, 0, 0) < today
      ? Math.floor(
          (today - new Date(order.expectedRentalEndDate).setHours(0, 0, 0, 0)) /
            86_400_000,
        )
      : 0;

  // Detect which workflow role the current staff has for this order
  const staffRole: 'delivery' | 'pickup' | 'both' = user?.userId
    ? order.deliveryStaffId === user.userId &&
      order.pickupStaffId === user.userId
      ? 'both'
      : order.deliveryStaffId === user.userId
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
      <div className="px-3 sm:px-5 lg:px-6 min-h-screen">
        <div className="mx-auto max-w-7xl">
          {/* ── Slim header ── */}
          <div className="flex items-center gap-3 mb-5">
            <Link href="/staff-dashboard/orders">
              <Button variant="ghost" size="icon" className="size-10 shrink-0">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg font-bold text-foreground truncate">
                  Chi tiết đơn hàng
                </h1>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-sm font-bold shrink-0',
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
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {orderCode}
              </p>
            </div>
          </div>

          {/* Workflow stepper + overdue alert */}
          <WorkflowStepper
            status={order.status}
            isDeliveryOverdue={deliveryOverdueDays > 0}
            isPickupOverdue={pickupOverdueDays > 0}
          />

          {/* Main content grid */}
          <div className="mt-5 flex flex-col gap-5">
            {/* LEFT column: Workflow + full details */}
            <div className="flex flex-col gap-4">
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
                  <ConfirmDeliveryWorkflow
                    order={order}
                    onConfirm={() => handleStatusChange('PREPARING')}
                    loading={statusLoading}
                  />
                )}

              {order.status === 'PREPARING' && (
                <RepairingWorkflow
                  order={order}
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

              {order.status === 'PENDING_PICKUP' && (
                <ConfirmReturnWorkflow
                  order={order}
                  onConfirmPickup={() => handleStatusChange('PICKING_UP')}
                  loading={statusLoading}
                />
              )}

              {order.status === 'PICKING_UP' && (
                <ReturningWorkflow
                  order={order}
                  onCompleteReturn={async (
                    damagePenalty?: number,
                    overduePenalty?: number,
                  ) => {
                    await handleStatusChange('PICKED_UP', {
                      damagePenaltyAmount: Math.max(0, damagePenalty ?? 0),
                      overduePenaltyAmount: Math.max(0, overduePenalty ?? 0),
                    });
                  }}
                  loading={statusLoading}
                  staffLat={localLat}
                  staffLng={localLng}
                  staffLocAt={localLocAt}
                />
              )}

              {(order.status === 'PICKED_UP' ||
                order.status === 'COMPLETED') && (
                <PickedUpWorkflow order={order} />
              )}

              {order.status === 'CANCELLED' && (
                <CancelledWorkflow order={order} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
