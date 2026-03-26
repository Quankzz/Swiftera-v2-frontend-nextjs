import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  User,
  Phone,
  LocateFixed,
  BadgeCheck,
  Locate,
  ArrowLeft,
  PackageCheck,
  QrCode,
  Hash,
  ScanLine,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { WorkflowBanner } from '../WorkflowBanner';
import { fmtDatetime } from '../utils';
import { haversineKm } from '../DeliveryMiniMap';
import { QrScanner } from '../QrScanner';
import { CameraCapture } from '../CameraCapture';

export function DeliveringWorkflow({
  order,
  onConfirmDelivery,
  loading,
  staffLat,
  staffLng,
  staffLocAt,
}: {
  order: DashboardOrder;
  onConfirmDelivery: () => void;
  loading: boolean;
  staffLat?: number;
  staffLng?: number;
  staffLocAt?: string;
}) {
  const [phase, setPhase] = useState<'transit' | 'arrived'>('transit');
  const [qrVerified, setQrVerified] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrSimulate, setQrSimulate] = useState<
    'confirmed' | 'failed' | undefined
  >(undefined);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);

  const expectedCode = order.confirmation_code ?? order.order_code;

  const isNearDestination =
    staffLat != null &&
    staffLng != null &&
    order.delivery_latitude != null &&
    order.delivery_longitude != null &&
    haversineKm(
      staffLat,
      staffLng,
      order.delivery_latitude,
      order.delivery_longitude,
    ) < 0.35;

  const handleManualVerify = () => {
    if (manualCode.trim().toUpperCase() === expectedCode.toUpperCase()) {
      setQrVerified(true);
      setManualError('');
      setShowManualFallback(false);
    } else {
      setManualError('Mã không khớp — kiểm tra lại.');
    }
  };

  const canConfirm = qrVerified && deliveryPhotos.length > 0;

  /* ── Phase: In transit ─────────────────────────────────────────────────── */
  if (phase === 'transit') {
    return (
      <div className="flex flex-col gap-3 sm:gap-4">
        <WorkflowBanner
          icon={Truck}
          variant="primary"
          title="Đang trên đường giao hàng"
          desc="Theo dõi tuyến đường trên bản đồ bên cạnh. Khi tới nơi, nhấn nút bên dưới để bắt đầu bàn giao."
        />

        {/* ── Destination card ── */}
        {order.delivery_address && (
          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="size-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <MapPin className="size-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Địa chỉ giao
              </p>
              <p className="text-sm font-bold text-foreground leading-snug">
                {order.delivery_address}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <User className="size-3 shrink-0" />
                {order.renter.full_name}
                <span>·</span>
                <Phone className="size-3 shrink-0" />
                {order.renter.phone_number}
              </p>
              {staffLocAt && (
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <LocateFixed className="size-2.5 shrink-0 text-blue-400" />
                  GPS cập nhật: {fmtDatetime(staffLocAt)}
                </p>
              )}
            </div>
            <a
              href={`tel:${order.renter.phone_number}`}
              className="flex items-center gap-1.5 text-xs font-bold text-theme-primary-start border border-theme-primary-start/30 rounded-lg px-2.5 py-2 hover:bg-theme-primary-start/5 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <Phone className="size-3.5" /> Gọi
            </a>
          </div>
        )}

        {/* ── Arrived CTA ── */}
        <div className="rounded-2xl border border-border bg-card p-4">
          {isNearDestination && (
            <div className="flex items-center gap-2.5 rounded-xl border border-success-border bg-success-muted px-4 py-3 mb-3">
              <BadgeCheck className="size-4 text-success shrink-0" />
              <p className="text-sm font-bold text-success">
                GPS xác nhận bạn đang ở gần điểm giao!
              </p>
            </div>
          )}
          <Button
            size="default"
            onClick={() => setPhase('arrived')}
            className={cn(
              'w-full gap-2 h-11 text-sm font-semibold',
              isNearDestination
                ? 'bg-success hover:bg-success/90'
                : 'bg-theme-primary-start hover:bg-theme-primary-start/90',
            )}
          >
            <Locate className="size-4.5" />
            Tôi đã đến nơi — Bắt đầu bàn giao
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Nhấn khi bạn đang đứng trước địa chỉ của khách
          </p>
        </div>
      </div>
    );
  }

  /* ── Phase: Arrived — QR + Photo verification ──────────────────────────── */
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <WorkflowBanner
        icon={PackageCheck}
        variant="success"
        title="Đã đến nơi — Xác nhận bàn giao"
        desc="Quét mã QR trên điện thoại của khách để xác nhận đúng người & địa điểm, sau đó chụp ảnh minh chứng."
      />

      <button
        type="button"
        onClick={() => setPhase('transit')}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground self-start transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Quay lại bản đồ
      </button>

      {/* ── Step 1: QR Scan ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <span className="size-7 rounded-full bg-theme-primary-start flex items-center justify-center text-xs font-bold text-white shrink-0">
            1
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">
              Quét mã QR của khách
            </p>
            <p className="text-xs text-muted-foreground">
              Yêu cầu khách mở màn hình mã QR đơn hàng trên ứng dụng
            </p>
          </div>
        </div>
        <div className="p-4">
          {qrVerified ? (
            <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success-muted px-4 py-4">
              <div className="size-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <BadgeCheck className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-bold text-success">
                  Xác minh thành công!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đã xác nhận đúng khách hàng · {expectedCode.toUpperCase()}
                </p>
              </div>
            </div>
          ) : showQrScanner ? (
            <QrScanner
              expectedCode={expectedCode}
              order={order}
              simulate={qrSimulate}
              onSuccess={() => {
                setQrVerified(true);
                setShowQrScanner(false);
              }}
              onCancel={() => setShowQrScanner(false)}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Real QR scan */}
              <Button
                size="default"
                onClick={() => {
                  setQrSimulate(undefined);
                  setShowQrScanner(true);
                }}
                className="w-full gap-2 h-11 text-sm font-semibold bg-theme-primary-start hover:bg-theme-primary-start/90 text-white"
              >
                <QrCode className="size-4.5" />
                Mở máy quét QR
              </Button>
              {/* Dev simulation buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQrSimulate('confirmed');
                    setShowQrScanner(true);
                  }}
                  className="flex-1 gap-1.5 text-xs h-9 border-success/50 text-success hover:bg-success/5"
                >
                  <CheckCircle2 className="size-3.5" /> Mock: Thành công
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQrSimulate('failed');
                    setShowQrScanner(true);
                  }}
                  className="flex-1 gap-1.5 text-xs h-9 border-destructive/50 text-destructive hover:bg-destructive/5"
                >
                  <XCircle className="size-3.5" /> Mock: Thất bại
                </Button>
              </div>

              {/* Manual fallback */}
              {!showManualFallback ? (
                <button
                  type="button"
                  onClick={() => setShowManualFallback(true)}
                  className="text-xs text-muted-foreground hover:text-foreground text-center underline underline-offset-2 transition-colors"
                >
                  Không quét được? Nhập mã thủ công
                </button>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs font-bold text-foreground">
                    Nhập mã xác nhận thủ công
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Nhập mã..."
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value);
                          setManualError('');
                        }}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleManualVerify()
                        }
                        className="pl-9 h-10 text-sm font-mono tracking-widest"
                        autoCapitalize="characters"
                      />
                    </div>
                    <Button
                      onClick={handleManualVerify}
                      disabled={!manualCode.trim()}
                      className="h-10 shrink-0"
                    >
                      Xác nhận
                    </Button>
                  </div>
                  {manualError && (
                    <p className="text-xs text-destructive font-semibold flex items-center gap-1.5">
                      <AlertCircle className="size-3.5 shrink-0" />{' '}
                      {manualError}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
                    <ScanLine className="size-3 shrink-0" />
                    Mã đơn:{' '}
                    <span className="font-mono font-bold text-foreground">
                      {expectedCode}
                    </span>
                    <span className="opacity-60">(chỉ nhân viên thấy)</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2: Delivery photo ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <span
            className={cn(
              'size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              qrVerified
                ? 'bg-theme-primary-start text-white'
                : 'bg-muted text-muted-foreground',
            )}
          >
            2
          </span>
          <div>
            <p
              className={cn(
                'text-sm font-bold',
                qrVerified ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Chụp ảnh minh chứng bàn giao
            </p>
            <p className="text-xs text-muted-foreground">
              {qrVerified
                ? 'Chụp ảnh sản phẩm và khách đang cầm hàng tại địa chỉ'
                : 'Hoàn thành bước 1 trước'}
            </p>
          </div>
        </div>
        <div
          className={cn('p-4', !qrVerified && 'opacity-50 pointer-events-none')}
        >
          <CameraCapture
            photos={deliveryPhotos}
            onAdd={(url) => setDeliveryPhotos((p) => [...p, url])}
            onRemove={(i) =>
              setDeliveryPhotos((p) => p.filter((_, j) => j !== i))
            }
            label="Chụp ảnh bàn giao tại địa chỉ khách"
          />
        </div>
      </div>

      {/* ── Confirm CTA ── */}
      <div className="rounded-2xl border border-border bg-card p-4">
        {!canConfirm && (
          <div className="flex flex-col gap-1 mb-3">
            {!qrVerified && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="size-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                Cần quét QR xác nhận khách hàng
              </p>
            )}
            {deliveryPhotos.length === 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="size-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                Cần chụp ít nhất 1 ảnh minh chứng
              </p>
            )}
          </div>
        )}
        <Button
          size="default"
          onClick={onConfirmDelivery}
          disabled={!canConfirm || loading}
          className="w-full gap-2 h-11 text-sm font-semibold"
        >
          {loading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <PackageCheck className="size-4.5" />
          )}
          Xác nhận đã bàn giao thành công
        </Button>
      </div>
    </div>
  );
}
