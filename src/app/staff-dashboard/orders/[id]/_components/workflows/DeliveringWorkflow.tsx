'use client';

/**
 * DeliveringWorkflow — Trạng thái DELIVERING
 *
 * DELIVERY WORKFLOW - STEP 3/4
 *
 * Staff đang trên đường giao hàng tới khách. Quy trình:
 * 1. Liên hệ khách (nút gọi điện)
 * 2. Điều hướng tới địa chỉ giao (Google Maps)
 * 3. Theo dõi GPS real-time (tương tự Grab)
 * 4. Tại điểm giao:
 *    - Quét QR code hoặc nhập mã đơn từ phía khách
 *    - Chụp ảnh sản phẩm trước khi bàn giao (để có bằng chứng tình trạng)
 *    - Khách xác nhận nhận hàng
 * 5. Bấm "Đã giao" → recordDelivery(lat/lng) → DELIVERED
 *
 * API: recordDelivery(orderId, {deliveredLatitude, deliveredLongitude})
 * Lưu ý: deliveredLatitude/deliveredLongitude lấy từ GPS hiện tại của staff
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Truck,
  User,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Loader2,
  Camera,
  Navigation,
  Hash,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkflowBanner } from '../WorkflowBanner';
import { Section } from '../Section';
import { InfoRow } from '../InfoRow';
import { QrScanner } from '../QrScanner';
import { cn } from '@/lib/utils';
import type { DashboardOrder } from '@/types/dashboard.types';
import { fmtDatetime } from '../utils';

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
  const [confirmed, setConfirmed] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const hasDeliveryCoords =
    order.delivery_latitude != null && order.delivery_longitude != null;

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={Truck}
        title="Đang trên đường giao hàng"
        desc="Liên hệ khách nếu cần thiết, theo dõi lộ trình và xác nhận khi đã bàn giao thiết bị thành công."
        variant="primary"
      />

      {/* ── GPS Status Bar ── */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border px-4 py-3',
          staffLocAt
            ? 'border-success/30 bg-success/5'
            : 'border-border bg-muted/20',
        )}
      >
        <div
          className={cn(
            'size-2.5 rounded-full shrink-0',
            staffLocAt
              ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]'
              : 'bg-muted-foreground/40',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">
            {staffLocAt
              ? 'GPS đang theo dõi vị trí của bạn'
              : 'Đang khởi tạo GPS...'}
          </p>
          {staffLocAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Cập nhật lần cuối: {fmtDatetime(staffLocAt)}
            </p>
          )}
          {staffLat && staffLng && (
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              {staffLat.toFixed(5)}, {staffLng.toFixed(5)}
            </p>
          )}
        </div>
        {!staffLocAt && (
          <Loader2 className="size-4 text-muted-foreground animate-spin shrink-0" />
        )}
      </div>

      {/* ── Customer Contact ── */}
      <Section title="Thông tin khách nhận hàng" icon={User} defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3">
          <InfoRow
            icon={User}
            label="Người nhận"
            value={order.renter.full_name}
          />
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
            value={order.renter.phone_number}
          />
          <div className="sm:col-span-2">
            <InfoRow
              icon={MapPin}
              label="Địa chỉ giao hàng"
              value={order.delivery_address ?? order.renter.address ?? '—'}
            />
          </div>
        </div>

        {/* Quick-action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={`tel:${order.renter.phone_number}`}
            className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-sm font-semibold text-success hover:bg-success/10 transition-colors"
          >
            <Phone className="size-4" /> Gọi khách hàng
          </a>
          {hasDeliveryCoords && (
            <a
              href={`https://maps.google.com/?q=${order.delivery_latitude},${order.delivery_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Navigation className="size-4" /> Điều hướng
            </a>
          )}
        </div>
      </Section>

      {/* ── Verify customer/order by QR or code ── */}
      <Section title="Đối chiếu khách nhận" icon={QrCode} defaultOpen>
        {!verified ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tại điểm giao, quét QR của khách hoặc nhập mã đơn để xác nhận giao
              đúng người nhận.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner((v) => !v)}
              >
                <QrCode className="size-4 mr-2" />
                {showScanner ? 'Ẩn QR Scanner' : 'Mở QR Scanner'}
              </Button>
            </div>

            {showScanner && (
              <div className="rounded-2xl border border-border bg-card p-3">
                <QrScanner
                  expectedCode={order.order_code}
                  order={order}
                  onSuccess={() => {
                    setVerified(true);
                    setVerifyError(null);
                    setShowScanner(false);
                  }}
                  onCancel={() => setShowScanner(false)}
                />
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Hoặc nhập mã đơn khách cung cấp"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const ok =
                    manualCode.trim().toUpperCase() ===
                    order.order_code.trim().toUpperCase();
                  if (!ok) {
                    setVerifyError('Mã đơn không khớp với đơn đang xử lý.');
                    return;
                  }
                  setVerified(true);
                  setVerifyError(null);
                }}
              >
                Xác minh mã
              </Button>
            </div>

            {verifyError && (
              <p className="text-sm text-destructive font-medium">
                {verifyError}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            Đã xác minh đúng khách nhận qua QR/mã đơn.
          </div>
        )}
      </Section>

      {/* ── Items Being Delivered ── */}
      <Section
        title={`Thiết bị đang giao (${order.items.length})`}
        icon={Package}
        defaultOpen={false}
      >
        <div className="flex flex-col divide-y divide-border/40 pt-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Camera className="size-3.5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {item.product_name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Hash className="size-3 text-muted-foreground" />
                  <p className="text-xs font-mono text-muted-foreground">
                    {item.serial_number}
                  </p>
                </div>
              </div>
              <Truck className="size-4 text-info shrink-0 animate-pulse" />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Confirm Checklist ── */}
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-accent/40 transition-colors select-none">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded accent-teal-600"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          Tôi đã giao đầy đủ thiết bị cho khách hàng và được khách xác nhận bằng
          miệng / đã ký nhận.
        </span>
      </label>

      {/* ── CTA ── */}
      <Button
        onClick={onConfirmDelivery}
        disabled={loading || !confirmed || !verified}
        size="lg"
        className="w-full h-14 text-base font-bold gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-5" />
        )}
        Xác nhận đã giao hàng thành công →
      </Button>
    </div>
  );
}
