'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  User,
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowLeft,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_ORDERS,
  MOCK_HUB_INFO,
  MOCK_CURRENT_STAFF,
} from '@/data/mockDashboard';
import type {
  ContractPhoto,
  OrderItem,
  ProductCondition,
} from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const CONDITION_OPTIONS: Array<{
  value: ProductCondition;
  label: string;
  color: string;
}> = [
  {
    value: 'EXCELLENT',
    label: 'Xuất sắc',
    color:
      'text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    value: 'GOOD',
    label: 'Tốt',
    color: 'text-teal-600 border-teal-500 bg-teal-50 dark:bg-teal-500/10',
  },
  {
    value: 'FAIR',
    label: 'Khá',
    color: 'text-amber-600 border-amber-500 bg-amber-50 dark:bg-amber-500/10',
  },
  {
    value: 'POOR',
    label: 'Kém',
    color: 'text-red-600 border-red-500 bg-red-50 dark:bg-red-500/10',
  },
];

export function CameraModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState('');
  const [captured, setCaptured] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    'environment',
  );

  const startCamera = useCallback(async () => {
    try {
      // Gọi trực tiếp camera mà không reset state đồng bộ ở đây nữa
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch {
      setTimeout(() => {
        setCameraError(
          'Không thể truy cập camera. Vui lòng kiểm tra quyền trình duyệt.',
        );
      }, 0);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup function đảm bảo camera luôn tắt khi component unmount
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        setCaptured(dataUrl);
        // Do NOT call onCapture here — wait for explicit confirm
      }
    }
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (captured) {
      onCapture(captured); // only called once, after user confirms
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0a0c10] border border-slate-800 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-semibold text-white">Chụp ảnh sản phẩm</p>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Camera/preview */}
        <div className="relative aspect-video bg-black">
          {cameraError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="size-8 text-red-400" />
              <p className="text-sm text-slate-300">{cameraError}</p>
              <Button
                size="sm"
                onClick={startCamera}
                className="gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
              >
                <RotateCcw className="size-3.5" />
                Thử lại
              </Button>
            </div>
          ) : captured ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={captured}
              className="h-full w-full object-contain"
              alt="Captured"
            />
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-[#0a0c10] px-4 py-3 border-t border-slate-800">
          {!captured ? (
            <>
              <button
                onClick={() => {
                  // Just update facingMode — the useEffect dependency on startCamera
                  // (which depends on facingMode) will stop the old stream and
                  // restart with the new facing mode automatically.
                  setFacingMode((m) =>
                    m === 'environment' ? 'user' : 'environment',
                  );
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="size-3.5" />
                Đổi camera
              </button>
              <button
                onClick={handleCapture}
                disabled={!!cameraError}
                className="flex size-14 items-center justify-center rounded-full bg-white text-black ring-4 ring-white/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30"
              >
                <Camera className="size-6" />
              </button>
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="size-3.5" />
                Chụp lại
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="gap-1.5 bg-teal-500 hover:bg-teal-600 text-white border-0"
              >
                <CheckCircle2 className="size-3.5" />
                Xác nhận
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Photo lightbox
// ──────────────────────────────────────────────────────────────────────────────
function PhotoLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="size-4" />
      </button>
      {/* Use regular img since src may be a dataURL from camera capture */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
        alt="Product photo"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Product item section
// ──────────────────────────────────────────────────────────────────────────────
interface ItemPhotos {
  [itemId: string]: ContractPhoto[];
}

interface ItemConditions {
  [itemId: string]: ProductCondition;
}

interface ItemNotes {
  [itemId: string]: string;
}

function ProductSection({
  item,
  photos,
  condition,
  note,
  onAddPhoto,
  onRemovePhoto,
  onConditionChange,
  onNoteChange,
}: {
  item: OrderItem;
  photos: ContractPhoto[];
  condition: ProductCondition;
  note: string;
  onAddPhoto: (itemId: string) => void;
  onRemovePhoto: (itemId: string, photoId: string) => void;
  onConditionChange: (itemId: string, condition: ProductCondition) => void;
  onNoteChange: (itemId: string, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border/20 bg-card">
      {/* Item header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/20"
      >
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
          <Image
            fill
            src={item.image_url}
            alt={item.product_name}
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {item.product_name}
          </p>
          <p className="text-xs text-muted-foreground">
            SN: {item.serial_number} · {item.category}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {photos.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
              <Camera className="size-2.5" />
              {photos.length}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/10 p-4 space-y-4">
          {/* Condition selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tình trạng sản phẩm khi bàn giao
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onConditionChange(item.item_id, opt.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                    condition === opt.value
                      ? opt.color
                      : 'border-border/20 bg-transparent text-muted-foreground hover:border-border/40 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ảnh minh chứng ({photos.length})
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full rounded-lg object-cover cursor-pointer ring-1 ring-border/20 transition-all hover:ring-teal-500/40"
                    onClick={() => setLightboxSrc(photo.url)}
                  />
                  <button
                    onClick={() => onRemovePhoto(item.item_id, photo.id)}
                    className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md group-hover:flex"
                  >
                    <X className="size-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 hidden rounded-b-lg bg-black/50 px-1.5 py-1 group-hover:block">
                    <p className="truncate text-[9px] text-white">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add photo button */}
              <button
                onClick={() => onAddPhoto(item.item_id)}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border/30 bg-muted/20 text-muted-foreground transition-all hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-teal-500"
              >
                <Camera className="size-4" />
                <span className="text-[10px] font-medium">Chụp ảnh</span>
              </button>
            </div>
          </div>

          {/* Staff note */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ghi chú nhân viên
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(item.item_id, e.target.value)}
              placeholder="Ghi chú về tình trạng, phụ kiện đi kèm..."
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors"
            />
          </div>
        </div>
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main DashboardContract form
// ──────────────────────────────────────────────────────────────────────────────
function ContractForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const order = MOCK_ORDERS.find((o) => o.rental_order_id === orderId);

  const [itemPhotos, setItemPhotos] = useState<ItemPhotos>({});
  const [itemConditions, setItemConditions] = useState<ItemConditions>(
    () =>
      Object.fromEntries(
        order?.items.map((i) => [i.item_id, i.condition ?? 'EXCELLENT']) ?? [],
      ) as ItemConditions,
  );
  const [itemNotes, setItemNotes] = useState<ItemNotes>(() =>
    Object.fromEntries(order?.items.map((i) => [i.item_id, '']) ?? []),
  );
  const [contractNotes, setContractNotes] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeCameraItemId, setActiveCameraItemId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const totalPhotos = Object.values(itemPhotos).flat().length;

  const openCamera = (itemId: string) => {
    setActiveCameraItemId(itemId);
    setCameraOpen(true);
  };

  const handleCapture = (dataUrl: string) => {
    if (!activeCameraItemId) return;
    const photo: ContractPhoto = {
      id: `photo-${Date.now()}`,
      url: dataUrl,
      caption: `Ảnh chụp ${new Date().toLocaleTimeString('vi-VN')}`,
      taken_at: new Date().toISOString(),
    };
    setItemPhotos((prev) => ({
      ...prev,
      [activeCameraItemId]: [...(prev[activeCameraItemId] ?? []), photo],
    }));
  };

  const handleRemovePhoto = (itemId: string, photoId: string) => {
    setItemPhotos((prev) => ({
      ...prev,
      [itemId]: prev[itemId]?.filter((p) => p.id !== photoId) ?? [],
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    const code = `CTR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, '0')}`;
    setGeneratedCode(code);
    setSubmitting(false);
    setSubmitted(true);
  };

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4 p-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="size-8 text-red-500" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-foreground">
            Không tìm thấy đơn hàng
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã đơn hàng không hợp lệ hoặc đã bị xóa.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/scanner')}
          className="gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
        >
          ← Quét lại
        </Button>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Hợp đồng đã được tạo!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hợp đồng bàn giao sản phẩm đã được lưu thành công.
          </p>
          <p className="mt-3 inline-block rounded-lg bg-muted px-4 py-2 font-mono text-sm font-bold text-foreground">
            {generatedCode}
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button
            onClick={() => router.push(`/dashboard/contracts`)}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white border-0"
          >
            Xem danh sách hợp đồng
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Về trang tổng quan
          </Button>
        </div>
      </div>
    );
  }

  const totalDays = Math.ceil(
    (new Date(order.end_date).getTime() -
      new Date(order.start_date).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại
        </button>

        {/* DashboardContract header */}
        <div className="rounded-xl border border-teal-500/20 bg-linear-to-r from-teal-500/5 to-transparent p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Tạo hợp đồng bàn giao
              </p>
              <h1 className="mt-1 text-xl font-bold text-foreground">
                {order.order_code}
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span>{totalPhotos} ảnh đã chụp</span>
                <span>·</span>
                <span>{order.items.length} sản phẩm</span>
                <span>·</span>
                <span>{totalDays} ngày thuê</span>
              </div>
            </div>
            <FileText className="size-8 text-teal-500/50" />
          </div>
        </div>

        {/* ── Section 1: Bên cho thuê ────────────────────────────────────────── */}
        <section className="rounded-xl border border-border/20 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/15 bg-muted/30 px-5 py-3.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-blue-500/10">
              <Building2 className="size-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Bên cho thuê (Bên A)
              </p>
              <p className="text-[10px] text-muted-foreground">
                Thông tin hub / đơn vị cho thuê
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoField label="Tên hub" value={MOCK_HUB_INFO.name} />
            <InfoField label="Địa chỉ" value={MOCK_HUB_INFO.address} />
            <InfoField label="Điện thoại" value={MOCK_HUB_INFO.phone_number} />
            <InfoField label="Mã số thuế" value={MOCK_HUB_INFO.tax_code} />
            <InfoField label="Giờ hoạt động" value={MOCK_HUB_INFO.open_hours} />
            <InfoField
              label="Người đại diện"
              value={MOCK_HUB_INFO.representative}
            />
          </div>
        </section>

        {/* ── Section 2: Bên thuê ────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border/20 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/15 bg-muted/30 px-5 py-3.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/10">
              <User className="size-3.5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Bên thuê (Bên B)
              </p>
              <p className="text-[10px] text-muted-foreground">
                Thông tin khách hàng thuê sản phẩm
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoField label="Họ tên" value={order.renter.full_name} />
            <InfoField label="Email" value={order.renter.email} />
            <InfoField label="Số điện thoại" value={order.renter.phone_number} />
            <InfoField label="Số CCCD/CMND" value={order.renter.cccd_number} />
            <InfoField
              label="Địa chỉ"
              value={order.renter.address}
              className="sm:col-span-2"
            />
          </div>
        </section>

        {/* ── Section 3: Nhân viên phụ trách ─────────────────────────────────── */}
        <section className="rounded-xl border border-border/20 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/15 bg-muted/30 px-5 py-3.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/10">
              <User className="size-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Nhân viên phụ trách bàn giao
              </p>
              <p className="text-[10px] text-muted-foreground">
                Staff xác nhận và ký kết hợp đồng
              </p>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              {MOCK_CURRENT_STAFF.avatar_url ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-teal-500/30">
                  <Image
                    fill
                    src={MOCK_CURRENT_STAFF.avatar_url}
                    alt={MOCK_CURRENT_STAFF.full_name}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 font-bold">
                  {MOCK_CURRENT_STAFF.full_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {MOCK_CURRENT_STAFF.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {MOCK_CURRENT_STAFF.role === 'MANAGER'
                    ? 'Quản lý'
                    : 'Nhân viên'}{' '}
                  · {MOCK_CURRENT_STAFF.email}
                </p>
              </div>
            </div>
            <InfoField label="SĐT nhân viên" value={MOCK_CURRENT_STAFF.phone_number} />
            <InfoField
              label="Ngày tạo hợp đồng"
              value={formatDate(new Date().toISOString())}
            />
          </div>
        </section>

        {/* ── Section 4: Thung tin cho thuê ──────────────────────────────────── */}
        <section className="rounded-xl border border-border/20 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/15 bg-muted/30 px-5 py-3.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-teal-500/10">
              <FileText className="size-3.5 text-teal-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Điều khoản thuê
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <InfoField
              label="Ngày bắt đầu"
              value={formatDate(order.start_date)}
            />
            <InfoField
              label="Ngày kết thúc"
              value={formatDate(order.end_date)}
            />
            <InfoField label="Tổng số ngày" value={`${totalDays} ngày`} />
            <InfoField
              label="Tổng phí thuê"
              value={formatCurrency(order.total_rental_fee)}
            />
            <InfoField
              label="Đặt cọc"
              value={formatCurrency(order.total_deposit)}
            />
            <InfoField
              label="Thanh toán"
              value={
                order.payment_status === 'PAID'
                  ? 'Đã thanh toán'
                  : order.payment_status === 'PARTIAL'
                    ? 'Thanh toán một phần'
                    : 'Chờ thanh toán'
              }
              valueClass={
                order.payment_status === 'PAID'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }
            />
          </div>
        </section>

        {/* ── Section 5: Sản phẩm bàn giao ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Sản phẩm bàn giao ({order.items.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Chụp ảnh từng sản phẩm trước khi bàn giao
            </p>
          </div>

          {order.items.map((item) => (
            <ProductSection
              key={item.item_id}
              item={item}
              photos={itemPhotos[item.item_id] ?? []}
              condition={itemConditions[item.item_id] ?? 'EXCELLENT'}
              note={itemNotes[item.item_id] ?? ''}
              onAddPhoto={openCamera}
              onRemovePhoto={handleRemovePhoto}
              onConditionChange={(id, cond) =>
                setItemConditions((prev) => ({ ...prev, [id]: cond }))
              }
              onNoteChange={(id, note) =>
                setItemNotes((prev) => ({ ...prev, [id]: note }))
              }
            />
          ))}
        </div>

        {/* ── General notes ──────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-border/20 bg-card p-5">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Ghi chú hợp đồng
          </label>
          <textarea
            value={contractNotes}
            onChange={(e) => setContractNotes(e.target.value)}
            placeholder="Điều khoản đặc biệt, ghi chú thêm về hợp đồng..."
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 transition-colors"
          />
        </section>

        {/* ── Submit ─────────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border/20 bg-card p-5">
          <div className="mb-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {totalPhotos > 0 ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="size-3.5 text-amber-500" />
              )}
              <span>
                {totalPhotos > 0
                  ? `${totalPhotos} ảnh minh chứng đã được thêm`
                  : 'Chưa có ảnh minh chứng (khuyến nghị chụp ảnh)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Thông tin bên A và bên B đã đầy đủ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>Nhân viên phụ trách đã được xác nhận</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
            <Button
              className="flex-1 gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Tạo hợp đồng
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <CameraModal
        open={cameraOpen}
        onClose={() => {
          setCameraOpen(false);
          setActiveCameraItemId(null);
        }}
        onCapture={handleCapture}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// InfoField helper
// ──────────────────────────────────────────────────────────────────────────────
function InfoField({
  label,
  value,
  className,
  valueClass,
}: {
  label: string;
  value: string;
  className?: string;
  valueClass?: string;
}) {
  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn('text-sm font-medium text-foreground', valueClass)}>
        {value}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Page export (wrapped in Suspense for useSearchParams)
// ──────────────────────────────────────────────────────────────────────────────
export default function ContractNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      }
    >
      <ContractForm />
    </Suspense>
  );
}
