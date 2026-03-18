'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS } from '@/data/mockDashboard';
import type { DashboardOrder } from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

type ScanState = 'idle' | 'scanning' | 'found' | 'error' | 'manual';

interface QRPayload {
  type: string;
  orderId: string;
  orderCode: string;
  renterName: string;
  timestamp: string;
}

export default function QRScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const scanFrameRef = useRef<() => void>(() => {});
  const cameraFacingRef = useRef<'environment' | 'user'>('environment');

  const [state, setState] = useState<ScanState>('idle');
  const [error, setError] = useState<string>('');
  const [foundOrder, setFoundOrder] = useState<DashboardOrder | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>(
    'environment',
  );

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const processQRData = useCallback(
    (data: string) => {
      try {
        const payload: QRPayload = JSON.parse(data);
        if (payload.type !== 'SWIFTERA_ORDER') {
          setError(
            'Mã QR không hợp lệ. Vui lòng quét mã QR từ đơn hàng Swiftera.',
          );
          setState('error');
          return;
        }
        const order = MOCK_ORDERS.find((o) => o.order_id === payload.orderId);
        if (!order) {
          setError(
            `Không tìm thấy đơn hàng "${payload.orderCode}". Có thể đơn hàng đã bị xóa.`,
          );
          setState('error');
          return;
        }
        stopCamera();
        setFoundOrder(order);
        setState('found');
      } catch {
        // Try matching by order code directly
        const order = MOCK_ORDERS.find(
          (o) => o.order_code === data.trim() || o.order_id === data.trim(),
        );
        if (order) {
          stopCamera();
          setFoundOrder(order);
          setState('found');
        } else {
          setError('Không thể đọc mã QR. Vui lòng thử lại.');
          setState('error');
        }
      }
    },
    [stopCamera],
  );

  const startCamera = useCallback(async () => {
    setState('scanning');
    setError('');
    setFoundOrder(null);
    setManualError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingRef.current, // always reads latest value from ref
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanFrameRef.current();
      }
    } catch (err) {
      console.error(err);
      setError(
        'Không thể truy cập camera. Vui lòng cấp quyền camera hoặc nhập mã thủ công.',
      );
      setState('error');
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrameRef.current);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      processQRData(code.data);
    } else {
      animFrameRef.current = requestAnimationFrame(scanFrameRef.current);
    }
  }, [processQRData]);

  // Keep ref in sync so startCamera can call the latest version without stale closures
  useEffect(() => {
    scanFrameRef.current = scanFrame;
  }, [scanFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleReset = () => {
    stopCamera();
    setState('idle');
    setFoundOrder(null);
    setError('');
    setManualCode('');
    setManualError('');
  };

  const handleManualSubmit = () => {
    const trimmed = manualCode.trim();
    if (!trimmed) {
      setManualError('Vui lòng nhập mã đơn hàng.');
      return;
    }
    const order = MOCK_ORDERS.find(
      (o) =>
        o.order_code.toLowerCase() === trimmed.toLowerCase() ||
        o.order_id.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!order) {
      setManualError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.');
      return;
    }
    setFoundOrder(order);
    setState('found');
  };

  const handleProceedToContract = () => {
    if (foundOrder) {
      router.push(`/dashboard/contracts/new?orderId=${foundOrder.order_id}`);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v);

  // ── Demo QR codes for testing ──────────────────────────────────────────────
  const DEMO_ORDERS = MOCK_ORDERS.filter((o) => o.status === 'PENDING').slice(
    0,
    3,
  );

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-2xl">
        {/* Page intro */}
        {state === 'idle' && (
          <div className="mb-6 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Quét mã QR từ đơn hàng của khách để tiếp nhận và tạo hợp đồng bàn
              giao sản phẩm.
            </p>
          </div>
        )}

        {/* Scanner viewport */}
        <div className="relative overflow-hidden rounded-2xl border border-border/20 bg-black shadow-2xl">
          {/* Camera feed */}
          <div className="relative aspect-4/3 overflow-hidden">
            <video
              ref={videoRef}
              className={cn(
                'h-full w-full object-cover',
                state !== 'scanning' && 'hidden',
              )}
              muted
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Idle/Error/Found overlay */}
            {state !== 'scanning' && (
              <div className="flex h-full min-h-75 flex-col items-center justify-center bg-[#0a0c10]">
                {state === 'idle' && (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-teal-500/10 ring-2 ring-teal-500/20">
                      <QrCode className="size-10 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">
                        Camera chưa khởi động
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Nhấn bên dưới để bật camera và quét mã QR
                      </p>
                    </div>
                    <Button
                      onClick={startCamera}
                      className="mt-2 gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
                    >
                      <Camera className="size-4" />
                      Bật camera
                    </Button>
                  </div>
                )}

                {state === 'error' && (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
                      <AlertCircle className="size-8 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Lỗi</p>
                      <p className="mt-1 text-xs text-slate-400 max-w-xs">
                        {error}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <RefreshCw className="size-3.5" />
                        Thử lại
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setState('manual')}
                        className="gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
                      >
                        Nhập thủ công
                      </Button>
                    </div>
                  </div>
                )}

                {state === 'found' && foundOrder && (
                  <div className="flex w-full flex-col items-center gap-4 p-6 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/30">
                      <CheckCircle2 className="size-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">
                        Đã tìm thấy đơn hàng!
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        {foundOrder.order_code}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scan overlay (when scanning) */}
            {state === 'scanning' && (
              <>
                {/* Corner decorations */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative size-56">
                    {/* TL */}
                    <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-teal-400 rounded-tl-md" />
                    {/* TR */}
                    <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-teal-400 rounded-tr-md" />
                    {/* BL */}
                    <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-teal-400 rounded-bl-md" />
                    {/* BR */}
                    <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-teal-400 rounded-br-md" />
                    {/* Scan line */}
                    <div className="absolute inset-x-2 h-px bg-teal-400/80 shadow-[0_0_8px_2px_rgba(20,184,166,0.5)] animate-[scan-line_2s_ease-in-out_infinite]" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                  <p className="text-xs text-white/70">Đưa mã QR vào khung</p>
                </div>
                {/* Stop button */}
                <button
                  onClick={handleReset}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                >
                  <XCircle className="size-4" />
                </button>
              </>
            )}
          </div>

          {/* Bottom bar */}
          {state === 'scanning' && (
            <div className="flex items-center justify-between bg-[#0a0c10] px-4 py-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const newFacing =
                    cameraFacing === 'environment' ? 'user' : 'environment';
                  cameraFacingRef.current = newFacing; // update ref immediately before setTimeout fires
                  setCameraFacing(newFacing);
                  stopCamera();
                  setTimeout(startCamera, 100);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <RefreshCw className="size-3.5" />
                Đổi camera
              </button>
              <button
                onClick={() => setState('manual')}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Nhập thủ công
              </button>
            </div>
          )}
        </div>

        {/* Manual entry */}
        {state === 'manual' && (
          <div className="mt-4 rounded-xl border border-border/20 bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Nhập mã đơn hàng thủ công
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="SW-20260318-001 hoặc ord-001"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setManualError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  className="pl-9"
                  aria-invalid={!!manualError}
                />
              </div>
              <Button
                onClick={handleManualSubmit}
                className="gap-2 shrink-0 bg-teal-500 hover:bg-teal-600 text-white border-0"
              >
                Tìm kiếm
              </Button>
            </div>
            {manualError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="size-3.5" />
                {manualError}
              </p>
            )}
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Quay lại camera
            </button>
          </div>
        )}

        {/* Found order card */}
        {state === 'found' && foundOrder && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-card overflow-hidden shadow-lg">
            <div className="border-b border-border/15 bg-emerald-500/5 px-5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-foreground">
                    Đơn hàng đã xác nhận
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Quét lại
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Mã đơn hàng
                  </p>
                  <p className="font-mono text-base font-bold text-foreground">
                    {foundOrder.order_code}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium',
                    foundOrder.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : foundOrder.status === 'ACTIVE'
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {foundOrder.status === 'PENDING'
                    ? 'Chờ xử lý'
                    : foundOrder.status === 'ACTIVE'
                      ? 'Đang thuê'
                      : foundOrder.status}
                </span>
              </div>

              {/* Renter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Khách thuê
                  </p>
                  <div className="flex items-center gap-2">
                    {foundOrder.renter.avatar_url ? (
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full">
                        <Image
                          fill
                          src={foundOrder.renter.avatar_url}
                          className="object-cover"
                          alt=""
                        />
                      </div>
                    ) : (
                      <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                        {foundOrder.renter.full_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {foundOrder.renter.full_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {foundOrder.renter.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                    Sản phẩm
                  </p>
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {foundOrder.items[0].product_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {foundOrder.items.length} sản phẩm ·{' '}
                    {formatCurrency(foundOrder.total_rental_fee)}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="rounded-lg bg-muted/40 px-4 py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="text-muted-foreground">Từ ngày</p>
                  <p className="font-semibold text-foreground">
                    {new Date(foundOrder.start_date).toLocaleDateString(
                      'vi-VN',
                    )}
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-muted-foreground">Đến ngày</p>
                  <p className="font-semibold text-foreground">
                    {new Date(foundOrder.end_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border/15 bg-muted/20 px-5 py-3.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                Quét lại
              </Button>
              <Button
                size="sm"
                onClick={handleProceedToContract}
                className="flex-1 gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
              >
                Tạo hợp đồng
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Demo QR codes section */}
        {(state === 'idle' || state === 'manual') && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Đơn hàng mẫu để test
            </p>
            <div className="space-y-2">
              {DEMO_ORDERS.map((order) => (
                <button
                  key={order.order_id}
                  onClick={() => {
                    setFoundOrder(order);
                    setState('found');
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/20 bg-card px-4 py-3 text-left transition-all hover:border-teal-500/30 hover:bg-teal-500/5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                    <QrCode className="size-4 text-teal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {order.order_code}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {order.renter.full_name} · {order.items.length} sản phẩm
                    </p>
                  </div>
                  <span className="text-[10px] rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 font-medium shrink-0">
                    Chờ xử lý
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              Bấm vào đơn hàng bên trên để mô phỏng quét QR thành công
            </p>
          </div>
        )}
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
      `}</style>
    </div>
  );
}
