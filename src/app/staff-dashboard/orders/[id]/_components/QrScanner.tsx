'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import jsQR from 'jsqr';
import {
  AlertCircle,
  X,
  BadgeCheck,
  RotateCcw,
  User,
  Calendar,
  Package,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Banknote,
  Hash,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RentalOrderResponse } from '@/types/api.types';
import { fmt, fmtDate, fmtPhone } from './utils';

const CONDITION_COLOR: Record<string, string> = {
  EXCELLENT:
    'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  GOOD: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  FAIR: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  POOR: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
};

export function QrScanner({
  expectedCode,
  onSuccess,
  onCancel,
  order,
  simulate,
}: {
  expectedCode: string;
  onSuccess: () => void;
  onCancel: () => void;
  order?: RentalOrderResponse;
  /** Pass 'confirmed' or 'failed' to bypass camera and jump to that state (dev/mock). */
  simulate?: 'confirmed' | 'failed';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const intendedToBeOpenRef = useRef(false);

  const [error, setError] = useState('');
  const [cameraFailed, setCameraFailed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState('');
  const [scanConfirmed, setScanConfirmed] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      intendedToBeOpenRef.current = false;
    };
  }, []);

  const stopAll = useCallback(() => {
    intendedToBeOpenRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(
    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code) {
        const detected = code.data.trim().toUpperCase();
        setLastDetected(detected);
        if (detected === expectedCode.trim().toUpperCase()) {
          stopAll();
          setScanning(false);
          setScanConfirmed(true);
          return;
        } else {
          setError(
            `QR không khớp (${code.data}) - yêu cầu khách mở đúng mã đơn.`,
          );
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [expectedCode, stopAll],
  );

  const startScanner = useCallback(async () => {
    intendedToBeOpenRef.current = true;
    setError('');
    setLastDetected('');
    setCameraFailed(false);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (!isMountedRef.current || !intendedToBeOpenRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      if (isMountedRef.current && intendedToBeOpenRef.current) {
        setCameraFailed(true);
      }
    }
  }, [scanFrame]);

  useEffect(() => {
    if (simulate === 'confirmed') {
      setScanConfirmed(true);
      return;
    }
    if (simulate === 'failed') {
      setError(
        'Giả lập thất bại: QR không khớp - mã QR không thuộc đơn hàng này.',
      );
      setLastDetected('WRONG-QR-MOCK');
      return;
    }
    startScanner();
    return () => stopAll();
  }, [simulate, startScanner, stopAll]);

  /* ── SUCCESS panel ──────────────────────────────────────────────────────── */
  if (scanConfirmed) {
    // Build display address from userAddress or fall back to flat fields
    const deliveryAddress = order?.userAddress
      ? [
          order.userAddress.addressLine,
          order.userAddress.ward,
          order.userAddress.district,
          order.userAddress.city,
        ]
            .filter(Boolean)
            .join(', ')
      : order?.hubAddressLine ?? '';

    return (
      <div className="flex flex-col gap-4">
        {/* Success badge */}
        <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success-muted px-4 py-4">
          <div className="size-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <BadgeCheck className="size-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-bold text-success">
              Xác minh QR thành công!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mã khớp:{' '}
              <span className="font-mono font-bold">
                {expectedCode.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        {order && (
          <>
            {/* Customer info */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
                <User className="size-3.5 text-theme-primary-start" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Thông tin khách hàng
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Họ tên
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {order.userAddress?.recipientName ?? order.hubName ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Điện thoại
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {fmtPhone(order.userAddress?.phoneNumber)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p className="text-xs font-medium text-foreground break-all">
                      {order.hubName ?? '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      CCCD
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      —
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Địa chỉ giao hàng
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {deliveryAddress || '—'}
                    </p>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-start gap-2">
                  <Calendar className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">
                      Thời gian thuê
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {fmtDate(order.expectedDeliveryDate ?? '')}{' '}
                      <span className="text-muted-foreground">→</span>{' '}
                      {fmtDate(order.expectedRentalEndDate ?? '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items list */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-3.5 text-theme-primary-start" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                    Sản phẩm trong đơn
                  </p>
                </div>
                <span className="text-xs font-bold bg-theme-primary-start/10 text-theme-primary-start border border-theme-primary-start/20 px-2 py-0.5 rounded-lg">
                  {order.rentalOrderLines.length} sản phẩm
                </span>
              </div>

              <div className="divide-y divide-border">
                {order.rentalOrderLines.map((line, idx) => {
                  const photos = line.photos ?? [];
                  const photoUrl = photos[0]?.photoUrl ?? '';
                  return (
                    <div
                      key={line.rentalOrderLineId}
                      className="p-4 flex gap-3"
                    >
                      {/* Thumbnail */}
                      <div className="relative size-17 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={line.productNameSnapshot}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Package className="size-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-black/65 flex items-center justify-center text-[9px] font-bold text-white">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-bold text-foreground leading-snug">
                            {line.productNameSnapshot}
                          </p>
                        </div>

                        {/* Serial + price + deposit */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <div className="col-span-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Hash className="size-2.5 shrink-0" />
                            <span className="font-mono truncate">
                              {line.inventorySerialNumber || '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Banknote className="size-2.5 shrink-0" />
                            <span>{fmt(line.dailyPriceSnapshot)}/ngày</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="text-[10px] shrink-0">Cọc:</span>
                            <span className="font-semibold text-foreground">
                              {fmt(line.depositAmountSnapshot)}
                            </span>
                          </div>
                        </div>

                        {/* Condition note */}
                        {line.checkoutConditionNote && (
                          <p className="mt-2 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-2 py-1">
                            📝 {line.checkoutConditionNote}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial totals */}
              <div className="border-t border-border px-4 py-3 flex flex-col gap-1.5 bg-muted/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tổng phí thuê</span>
                  <span className="font-bold text-foreground">
                    {fmt(order.rentalFeeAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tiền cọc giữ</span>
                  <span className="font-bold text-foreground">
                    {fmt(order.depositHoldAmount)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <Button
          size="lg"
          onClick={onSuccess}
          className="gap-2 bg-success hover:bg-success/90 text-white"
        >
          <CheckCircle2 className="size-5" /> Xác nhận bàn giao & tiếp tục
        </Button>
      </div>
    );
  }

  /* ── CAMERA FAILED ──────────────────────────────────────────────────────── */
  if (cameraFailed) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-destructive">
              Không thể mở camera
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vui lòng cấp quyền truy cập camera trong trình duyệt rồi thử lại.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setCameraFailed(false);
            setError('');
            startScanner();
          }}
          className="gap-2 h-11 text-sm"
        >
          <RotateCcw className="size-4" /> Thử lại
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="gap-2 h-11 text-sm"
        >
          <X className="size-4" /> Đóng máy quét
        </Button>
      </div>
    );
  }

  /* ── SCANNING VIEW ──────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-4/3 sm:aspect-video rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64">
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br-lg" />
              <div className="absolute top-0 left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-[scan-line_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
          {scanning ? '🔍 Đang quét mã QR...' : '⏳ Đang khởi động camera...'}
        </div>
      </div>

      {/* QR mismatch error + retry */}
      {error && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-destructive">{error}</p>
              {lastDetected && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Phát hiện:{' '}
                  <span className="font-mono font-bold">{lastDetected}</span> ·
                  Cần:{' '}
                  <span className="font-mono font-bold">
                    {expectedCode.toUpperCase()}
                  </span>
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              stopAll();
              setError('');
              setLastDetected('');
              setScanning(false);
              startScanner();
            }}
            className="gap-2 self-start text-xs h-9"
          >
            <RotateCcw className="size-3.5" /> Thử lại
          </Button>
        </div>
      )}

      {/* Mock / dev simulation buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stopAll();
            setScanning(false);
            setError('');
            setScanConfirmed(true);
          }}
          className="flex-1 gap-1.5 text-xs h-9 border-success/50 text-success hover:bg-success/5"
        >
          <CheckCircle2 className="size-3.5" /> Giả lập thành công
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            stopAll();
            setScanning(false);
            setError(
              'Giả lập thất bại: QR không khớp - mã không thuộc đơn hàng này.',
            );
            setLastDetected('WRONG-QR-MOCK');
          }}
          className="flex-1 gap-1.5 text-xs h-9 border-destructive/50 text-destructive hover:bg-destructive/5"
        >
          <XCircle className="size-3.5" /> Giả lập thất bại
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={onCancel}
        className="gap-2 h-11 text-sm"
      >
        <X className="size-4" /> Đóng máy quét
      </Button>
      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        Hướng camera vào mã QR trên điện thoại của khách. Hệ thống sẽ tự động
        xác nhận khi nhận diện đúng.
      </p>
    </div>
  );
}
