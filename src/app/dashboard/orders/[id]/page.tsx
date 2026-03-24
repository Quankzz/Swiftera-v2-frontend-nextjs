'use client';

import { useState, useCallback, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Camera,
  CheckCircle2,
  AlertCircle,
  Truck,
  Navigation,
  ClipboardList,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  BanknoteIcon,
  X,
  QrCode,
  Hash,
  Warehouse,
  PackageCheck,
  ShieldCheck,
  Package,
  Clock,
  BadgeCheck,
  Receipt,
  ScanLine,
  Locate,
  LocateFixed,
} from 'lucide-react';
import jsQR from 'jsqr';
import type {
  Map as GoongMapInstance,
  Marker as GoongMarker,
} from '@goongmaps/goong-js';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import '@goongmaps/goong-js/dist/goong-js.css';
import { maptilesKey, apiKey } from '@/configs/goongmapKeys';
import { cn } from '@/lib/utils';
import {
  MOCK_ORDERS,
  MOCK_CURRENT_STAFF,
  MOCK_HUB_INFO,
} from '@/data/mockDashboard';
import type {
  DashboardOrder,
  OrderStatus,
  OrderItem,
  ProductCondition,
} from '@/types/dashboard.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    v,
  );

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const fmtDatetime = (s: string) =>
  new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'text-foreground',
    bg: 'bg-secondary',
    border: 'border-border',
    dot: 'bg-muted-foreground',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'text-theme-primary-start',
    bg: 'bg-theme-primary-start/10',
    border: 'border-theme-primary-start/25',
    dot: 'bg-theme-primary-start',
  },
  DELIVERING: {
    label: 'Đang giao',
    color: 'text-info',
    bg: 'bg-info-muted',
    border: 'border-info-border',
    dot: 'bg-info animate-pulse',
  },
  ACTIVE: {
    label: 'Đang thuê',
    color: 'text-success',
    bg: 'bg-success-muted',
    border: 'border-success-border',
    dot: 'bg-success',
  },
  RETURNING: {
    label: 'Đang trả',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/25',
    dot: 'bg-destructive animate-pulse',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    dot: 'bg-muted-foreground',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    dot: 'bg-destructive',
  },
  OVERDUE: {
    label: 'Quá hạn',
    color: 'text-destructive',
    bg: 'bg-destructive/20',
    border: 'border-destructive',
    dot: 'bg-destructive animate-pulse',
  },
};

// ─── Workflow steps ────────────────────────────────────────────────────────────
const WORKFLOW_STEPS: {
  key: OrderStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'PENDING', label: 'Xác nhận', icon: ClipboardList },
  { key: 'CONFIRMED', label: 'Lấy hàng', icon: Warehouse },
  { key: 'DELIVERING', label: 'Giao hàng', icon: Truck },
  { key: 'ACTIVE', label: 'Đang thuê', icon: Package },
  { key: 'RETURNING', label: 'Thu hồi', icon: RotateCcw },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'OVERDUE') return 3;
  const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

function WorkflowStepper({ status }: { status: OrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 flex items-center gap-3">
        <X className="size-5 text-destructive shrink-0" />
        <p className="text-base font-bold text-destructive">
          Đơn hàng đã bị hủy
        </p>
      </div>
    );
  }
  const currentIdx = getStepIndex(status);
  const isOverdue = status === 'OVERDUE';
  return (
    <div className="rounded-2xl border border-border bg-card px-5 pt-4 pb-5 overflow-x-auto">
      {isOverdue && (
        <div className="flex items-center gap-2 mb-4 rounded-xl bg-destructive/10 border border-destructive/25 px-3 py-2">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-bold text-destructive">
            Đơn quá hạn — cần khởi động thu hồi ngay
          </p>
        </div>
      )}
      <div className="flex items-start min-w-max">
        {WORKFLOW_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;
          const isLast = idx === WORKFLOW_STEPS.length - 1;
          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center gap-1.5 w-[76px]">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-success bg-success/10',
                    isCurrent &&
                      !isOverdue &&
                      'border-theme-primary-start bg-theme-primary-start shadow-md',
                    isCurrent &&
                      isOverdue &&
                      'border-destructive bg-destructive',
                    isUpcoming && 'border-border bg-muted',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <StepIcon
                      className={cn(
                        'size-4',
                        isCurrent && 'text-white',
                        isUpcoming && 'text-muted-foreground',
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    'text-center text-[11px] font-semibold leading-tight px-1',
                    isCompleted && 'text-success',
                    isCurrent && !isOverdue && 'text-theme-primary-start',
                    isCurrent && isOverdue && 'text-destructive',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'h-0.5 w-5 mt-[18px] mx-0.5 rounded-full transition-all',
                    idx < currentIdx ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkflowBanner({
  icon: Icon,
  title,
  desc,
  variant = 'primary',
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const wrapCls = {
    primary: 'border-theme-primary-start/20 bg-theme-primary-start/5',
    success: 'border-success-border bg-success-muted',
    warning: 'border-yellow-300/50 bg-yellow-50 dark:bg-yellow-950/20',
    danger: 'border-destructive/25 bg-destructive/5',
  };
  const iconCls = {
    primary: 'bg-theme-primary-start/10 text-theme-primary-start',
    success: 'bg-success/10 text-success',
    warning:
      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
    danger: 'bg-destructive/10 text-destructive',
  };
  const titleCls = {
    primary: 'text-foreground',
    success: 'text-success',
    warning: 'text-yellow-700 dark:text-yellow-300',
    danger: 'text-destructive',
  };
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 flex items-start gap-4',
        wrapCls[variant],
      )}
    >
      <div
        className={cn(
          'size-11 rounded-xl flex items-center justify-center shrink-0',
          iconCls[variant],
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className={cn('text-base font-bold mb-1', titleCls[variant])}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setDone((v) => !v)}
      className="flex items-center gap-3 w-full text-left py-2.5 group"
    >
      <div
        className={cn(
          'size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          done
            ? 'bg-success border-success'
            : 'border-border group-hover:border-theme-primary-start/60',
        )}
      >
        {done && <CheckCircle2 className="size-3 text-white" />}
      </div>
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          done ? 'text-muted-foreground line-through' : 'text-foreground',
        )}
      >
        {text}
      </span>
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-5 py-4 hover:bg-accent/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Icon className="size-4 text-theme-primary-start" />
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function CameraCapture({
  photos,
  onAdd,
  onRemove,
  label,
}: {
  photos: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  label: string;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errorLine, setErrorLine] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    try {
      setErrorLine('');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
      } catch (e) {
        // Fallback for devices without an environment camera (like most desktop webcams)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Camera error:', err);
      setErrorLine(
        'Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.',
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        onAdd(url);
        stopCamera();
      },
      'image/jpeg',
      0.8,
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Captured photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {photos.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group"
            >
              <Image
                src={url}
                alt={`Ảnh góc ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 size-7 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xoá ảnh này"
              >
                <X className="size-4 text-card" />
              </button>
              <span className="absolute bottom-2 left-2 text-xs font-bold text-card [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {errorLine && (
        <p className="text-sm font-semibold text-destructive">{errorLine}</p>
      )}

      {isCameraOpen ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={stopCamera}
            >
              Đóng Camera
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2 bg-theme-primary-start hover:bg-theme-primary-start/90 text-white"
              onClick={capturePhoto}
            >
              <Camera className="size-4" /> Chụp ảnh
            </Button>
          </div>
        </div>
      ) : (
        /* Camera shutter trigger start */
        <button
          type="button"
          onClick={startCamera}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 cursor-pointer transition-all select-none',
            'border-border bg-muted/20 hover:bg-muted/50 hover:border-theme-primary-start/50',
          )}
        >
          <Camera className="size-8 text-theme-primary-start" />
          <span className="text-base font-bold text-foreground">
            {photos.length === 0 ? label : 'Chụp thêm góc độ'}
          </span>
          <span className="text-sm text-muted-foreground px-4 text-center">
            {photos.length > 0
              ? `${photos.length} ảnh đã chụp`
              : 'Yêu cầu sử dụng camera thiết bị để làm minh chứng — không cho phép tải ảnh'}
          </span>
        </button>
      )}
    </div>
  );
}

// ─── Per-item product inspection card ────────────────────────────────────────
// ─── Condition options ────────────────────────────────────────────────────────
const CONDITION_OPTS: {
  value: ProductCondition;
  label: string;
  cls: string;
}[] = [
  {
    value: 'EXCELLENT',
    label: 'Xuất sắc',
    cls: 'text-success border-success/60 bg-success/10',
  },
  { value: 'GOOD', label: 'Tốt', cls: 'text-info border-info/60 bg-info/10' },
  {
    value: 'FAIR',
    label: 'Trung bình',
    cls: 'text-foreground border-border bg-secondary',
  },
  {
    value: 'POOR',
    label: 'Kém',
    cls: 'text-destructive border-destructive/50 bg-destructive/10',
  },
];

function ItemInspectionCard({
  item,
  phase,
}: {
  item: OrderItem;
  phase: 'checkin' | 'checkout';
}) {
  const [photos, setPhotos] = useState<string[]>(() => {
    const url =
      phase === 'checkin' ? item.checkin_photo_url : item.checkout_photo_url;
    return url ? [url] : [];
  });
  const [note, setNote] = useState(item.staff_note ?? '');
  const [condition, setCondition] = useState<ProductCondition>(
    (phase === 'checkin' ? item.checkin_condition : item.checkout_condition) ??
      'GOOD',
  );
  const [penalty, setPenalty] = useState(
    String(item.item_penalty_amount ?? ''),
  );
  const isCheckin = phase === 'checkin';

  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
          <Image
            src={item.image_url}
            alt={item.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-tight">
            {item.product_name}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {item.serial_number}
          </p>
          <p className="text-xs font-semibold text-theme-primary-start mt-1">
            Cọc: {fmt(item.deposit_amount)}
          </p>
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2">
          {isCheckin ? 'Tình trạng ban đầu' : 'Tình trạng khi trả'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CONDITION_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCondition(opt.value)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all',
                condition === opt.value
                  ? opt.cls
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Camera */}
      <CameraCapture
        photos={photos}
        onAdd={(url) => setPhotos((p) => [...p, url])}
        onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))}
        label={
          isCheckin
            ? 'Chụp ảnh tình trạng ban đầu'
            : 'Chụp ảnh tình trạng khi trả'
        }
      />

      {/* Note */}
      <Textarea
        placeholder={
          isCheckin
            ? 'Tình trạng: màu sắc, vết trầy nhỏ, phụ kiện đi kèm...'
            : 'Chi tiết hư hỏng, thiếu phụ kiện... Căn cứ tính phạt.'
        }
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-sm min-h-16 resize-none"
      />

      {/* Penalty */}
      {!isCheckin && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 flex flex-col gap-2">
          <p className="text-xs font-bold text-destructive">
            Phí phạt sản phẩm này (nếu có)
          </p>
          <div className="relative">
            <Input
              type="number"
              placeholder="0"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              className="pr-8 text-sm h-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              ₫
            </span>
          </div>
          {Number(penalty) > 0 ? (
            <p className="text-xs font-bold text-destructive">
              → {fmt(Number(penalty))} khấu trừ cọc
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Bỏ trống nếu không có hư hỏng
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  strong,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p
          className={cn(
            'text-sm text-foreground',
            strong && 'font-bold',
            mono && 'font-mono',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── STEP 1 — PENDING ─────────────────────────────────────────────────────────
function PendingWorkflow({
  order,
  onConfirm,
  loading,
}: {
  order: DashboardOrder;
  onConfirm: () => void;
  loading: boolean;
}) {
  const isPaid = order.payment_status === 'PAID';

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={ClipboardList}
        variant="primary"
        title="Đơn hàng mới — cần xác nhận"
        desc="Khách đã thanh toán và xác nhận thuê. Kiểm tra thông tin rồi xác nhận để bắt đầu chuẩn bị giao hàng."
      />

      {!isPaid && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm font-semibold text-destructive">
            Khách chưa thanh toán đầy đủ — không thể xác nhận đơn
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Khách thuê</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <InfoRow
            icon={User}
            label="Họ và tên"
            value={order.renter.full_name}
            strong
          />
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
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
            label="Địa chỉ giao hàng"
            value={order.delivery_address ?? order.renter.address}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Sản phẩm thuê ({order.items.length})
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="relative size-11 shrink-0 rounded-lg overflow-hidden border border-border bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.serial_number}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground">
                  {fmt(item.daily_price)}/ngày
                </p>
                <p className="text-xs text-muted-foreground">
                  Cọc: {fmt(item.deposit_amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ngày bắt đầu', value: fmtDate(order.start_date) },
          { label: 'Ngày kết thúc', value: fmtDate(order.end_date) },
          { label: 'Phí thuê', value: fmt(order.total_rental_fee) },
          { label: 'Tiền cọc', value: fmt(order.total_deposit) },
        ].map((cell) => (
          <div
            key={cell.label}
            className="rounded-xl border border-border bg-card p-3.5"
          >
            <p className="text-xs text-muted-foreground mb-1">{cell.label}</p>
            <p className="text-sm font-bold text-foreground">{cell.value}</p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs font-bold text-muted-foreground mb-1">
            Ghi chú của khách
          </p>
          <p className="text-sm text-foreground">{order.notes}</p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={loading || !isPaid}
          className="w-full gap-2 text-base"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          Xác nhận đơn hàng
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Đơn hàng này đã được phân công cho bạn. Nhấn sau khi kiểm tra đủ thông
          tin.
        </p>
      </div>
    </div>
  );
}

// ─── STEP 2 — CONFIRMED ───────────────────────────────────────────────────────
function ConfirmedWorkflow({
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

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Danh sách cần làm tại hub
          </p>
        </div>
        <div className="divide-y divide-border/30">
          <ChecklistItem text="Đến hub và xuất trình thẻ nhân viên" />
          <ChecklistItem text="Nhận đầy đủ sản phẩm trong đơn hàng" />
          <ChecklistItem text="Kiểm tra tình trạng từng sản phẩm" />
          <ChecklistItem text="Chụp ảnh từng sản phẩm (nhiều góc độ)" />
          <ChecklistItem text="Đóng gói cẩn thận trước khi vận chuyển" />
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
          size="lg"
          onClick={onStartDelivery}
          disabled={loading}
          className="w-full gap-2 text-base"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Truck className="size-5" />
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

// ─── QR Scanner ───────────────────────────────────────────────────────────────
function QrScanner({
  expectedCode,
  onSuccess,
  onCancel,
}: {
  expectedCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState('');

  const stopAll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
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
        onSuccess();
        return;
      } else {
        setError(
          `QR không khớp (${code.data}) — yêu cầu khách mở đúng mã đơn.`,
        );
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [expectedCode, onSuccess, stopAll]);

  const startScanner = useCallback(async () => {
    setError('');
    setLastDetected('');
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
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setError('Không thể mở camera. Vui lòng cấp quyền truy cập camera.');
    }
  }, [scanFrame]);

  useEffect(() => {
    startScanner();
    return () => stopAll();
  }, [startScanner, stopAll]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {/* Scan overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52 sm:w-64 sm:h-64">
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br-lg" />
              {/* Scanning line */}
              <div className="absolute top-0 left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-[scan-line_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
          {scanning ? '🔍 Đang quét mã QR...' : '⏳ Đang khởi động camera...'}
        </div>
      </div>
      {error && (
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
      )}
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

// ─── Lazy Goong-JS loader (avoids "self is not defined" SSR error) ─────────────
let _goongPromise: Promise<
  (typeof import('@goongmaps/goong-js'))['default']
> | null = null;
function getGoong(): Promise<
  (typeof import('@goongmaps/goong-js'))['default']
> {
  if (!_goongPromise)
    _goongPromise = import('@goongmaps/goong-js').then((m) => m.default);
  return _goongPromise;
}

// ─── Delivery mini map ────────────────────────────────────────────────────────
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function DeliveryMiniMap({
  destLat,
  destLng,
  destAddress,
  staffLat,
  staffLng,
  fullMapHref,
  onLocateMe,
  destPinColor = 'red',
  destLabel,
  mapHeightClass = 'h-64 sm:h-72 md:h-80',
}: {
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  staffLat?: number;
  staffLng?: number;
  fullMapHref?: string;
  onLocateMe?: () => void;
  destPinColor?: 'red' | 'green';
  destLabel?: string;
  mapHeightClass?: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMapInstance | null>(null);
  const staffMarkerRef = useRef<GoongMarker | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goongjsRef = useRef<any>(null);
  const routeDrawnRef = useRef(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fit both markers into view
  const fitRoute = useCallback(() => {
    if (
      !mapRef.current ||
      staffLat == null ||
      staffLng == null ||
      destLat == null ||
      destLng == null
    )
      return;
    mapRef.current.fitBounds(
      [
        [Math.min(staffLng, destLng), Math.min(staffLat, destLat)],
        [Math.max(staffLng, destLng), Math.max(staffLat, destLat)],
      ],
      { padding: 60, maxZoom: 16 },
    );
  }, [staffLat, staffLng, destLat, destLng]);

  // Center on staff marker
  const centerOnStaff = useCallback(() => {
    if (!mapRef.current || staffLat == null || staffLng == null) return;
    mapRef.current.flyTo({
      center: [staffLng, staffLat],
      zoom: 16,
      speed: 1.4,
    });
  }, [staffLat, staffLng]);

  // ── Initialize map once — dynamic import avoids SSR "self is not defined" ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    let cancelled = false;

    getGoong().then((goongjs) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      goongjsRef.current = goongjs;

      const centerLng = destLng ?? staffLng ?? 106.7009;
      const centerLat = destLat ?? staffLat ?? 10.7769;

      goongjs.accessToken = maptilesKey;
      const map = new goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [centerLng, centerLat],
        zoom: 14,
        attributionControl: false,
      }) as GoongMapInstance;
      map.addControl(new goongjs.NavigationControl(), 'top-right');
      mapRef.current = map;

      map.on('load', () => {
        setMapLoading(false);

        // Destination pin (static — doesn't change)
        if (destLat != null && destLng != null) {
          const pinHex = destPinColor === 'green' ? '#22c55e' : '#ef4444';
          const labelText =
            destLabel ??
            destAddress?.split(',')[0] ??
            (destPinColor === 'green' ? 'Hub' : 'Điểm giao');
          const destEl = document.createElement('div');
          destEl.title = labelText;
          destEl.innerHTML = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;"><div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${pinHex};border:3px solid white;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(0,0,0,0.4)"></div><div style="font-size:10px;font-weight:700;color:${pinHex};background:white;padding:2px 6px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.2);margin-top:2px;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${labelText}</div></div>`;
          destEl.style.cursor = 'pointer';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (goongjs.Marker as any)({ element: destEl, anchor: 'bottom' })
            .setLngLat([destLng, destLat])
            .addTo(map);
        }

        setMapReady(true);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      staffMarkerRef.current = null;
      goongjsRef.current = null;
      routeDrawnRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add/update staff marker and draw route when GPS becomes available ──────
  useEffect(() => {
    const goongjs = goongjsRef.current;
    const map = mapRef.current;
    if (!mapReady || !goongjs || !map || staffLat == null || staffLng == null)
      return;

    // Create marker on first GPS fix; reposition on subsequent updates
    if (!staffMarkerRef.current) {
      const staffEl = document.createElement('div');
      staffEl.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.2)"></div>`;
      staffMarkerRef.current = new goongjs.Marker({ element: staffEl })
        .setLngLat([staffLng, staffLat])
        .addTo(map) as GoongMarker;
    } else {
      staffMarkerRef.current.setLngLat([staffLng, staffLat]);
    }

    // Fetch and draw route only once (on first GPS fix)
    if (!routeDrawnRef.current && destLat != null && destLng != null) {
      routeDrawnRef.current = true;
      void (async () => {
        try {
          const res = await axios.get<{
            routes?: {
              overview_polyline: { points: string };
              legs?: {
                distance?: { text: string };
                duration?: { text: string };
              }[];
            }[];
          }>(
            `https://rsapi.goong.io/Direction?origin=${staffLat},${staffLng}&destination=${destLat},${destLng}&vehicle=car&api_key=${apiKey}`,
          );
          const route = res.data?.routes?.[0];
          if (!route?.overview_polyline?.points || !mapRef.current) return;

          const leg = route.legs?.[0];
          setRouteInfo({
            distance: leg?.distance?.text ?? '',
            duration: leg?.duration?.text ?? '',
          });
          const coords: [number, number][] = polyline
            .decode(route.overview_polyline.points)
            .map(
              ([lat, lng]: [number, number]) => [lng, lat] as [number, number],
            );

          // Casing (white border)
          mapRef.current.addSource('delivery-route-casing', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          });
          mapRef.current.addLayer({
            id: 'delivery-route-casing',
            type: 'line',
            source: 'delivery-route-casing',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 8,
              'line-opacity': 0.6,
            },
          });
          // Main route line
          mapRef.current.addSource('delivery-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          });
          mapRef.current.addLayer({
            id: 'delivery-route',
            type: 'line',
            source: 'delivery-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.92,
            },
          });
          mapRef.current.fitBounds(
            [
              [Math.min(staffLng, destLng), Math.min(staffLat, destLat)],
              [Math.max(staffLng, destLng), Math.max(staffLat, destLat)],
            ],
            { padding: 70, maxZoom: 16 },
          );
        } catch {
          // Route fetch failed — markers still visible
        }
      })();
    }
  }, [mapReady, staffLat, staffLng, destLat, destLng]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-sm">
      {/* Map canvas */}
      <div ref={mapContainerRef} className={cn('w-full', mapHeightClass)} />

      {mapLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/95">
          <div className="size-10 rounded-full border-4 border-border border-t-theme-primary-start animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">
            Đang tải bản đồ...
          </p>
        </div>
      )}

      {/* Route info badge */}
      {routeInfo && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-md px-3 py-2">
          <Truck className="size-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-foreground">
            {routeInfo.distance}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <Clock className="size-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            {routeInfo.duration}
          </span>
        </div>
      )}

      {/* Custom overlay buttons */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {/* Locate me */}
        <button
          type="button"
          onClick={() => {
            centerOnStaff();
            onLocateMe?.();
          }}
          title="Định vị chính mình"
          className="size-9 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors active:scale-95"
        >
          <LocateFixed className="size-4 text-blue-500" />
        </button>
        {/* Fit route */}
        {staffLat != null && destLat != null && (
          <button
            type="button"
            onClick={fitRoute}
            title="Xem toàn bộ tuyến đường"
            className="size-9 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors active:scale-95"
          >
            <Navigation className="size-4 text-theme-primary-start" />
          </button>
        )}
      </div>

      {/* Full map link */}
      {fullMapHref && (
        <Link
          href={fullMapHref}
          className="absolute top-3 right-12 flex items-center gap-1.5 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-md px-2.5 py-2 text-xs font-bold text-foreground hover:bg-card transition-colors"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Mở bản đồ</span>
        </Link>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-sm px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm shrink-0" />
          <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
            Bạn
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'size-2.5 rounded-full border-2 border-white shadow-sm shrink-0',
              destPinColor === 'green' ? 'bg-green-500' : 'bg-red-500',
            )}
          />
          <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
            {destLabel ?? (destPinColor === 'green' ? 'Hub' : 'Điểm giao')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3 — DELIVERING ──────────────────────────────────────────────────────
function DeliveringWorkflow({
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

  const fullMapHref =
    order.delivery_latitude != null && order.delivery_longitude != null
      ? `/map?lat=${order.delivery_latitude}&lng=${order.delivery_longitude}&order=${order.rental_order_id}`
      : undefined;

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
            size="lg"
            onClick={() => setPhase('arrived')}
            className={cn(
              'w-full gap-2 text-base h-14',
              isNearDestination
                ? 'bg-success hover:bg-success/90'
                : 'bg-theme-primary-start hover:bg-theme-primary-start/90',
            )}
          >
            <Locate className="size-5" />
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
              onSuccess={() => {
                setQrVerified(true);
                setShowQrScanner(false);
              }}
              onCancel={() => setShowQrScanner(false)}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={() => setShowQrScanner(true)}
                className="w-full gap-2.5 h-14 text-base"
              >
                <QrCode className="size-5" />
                Mở máy quét QR
              </Button>

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
          size="lg"
          onClick={onConfirmDelivery}
          disabled={!canConfirm || loading}
          className="w-full gap-2 text-base h-14"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <PackageCheck className="size-5" />
          )}
          Xác nhận đã bàn giao thành công
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 4 — ACTIVE / OVERDUE ────────────────────────────────────────────────
function ActiveWorkflow({ order }: { order: DashboardOrder }) {
  const now = new Date();
  const endDate = new Date(order.end_date);
  const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
  const isOverdue = order.status === 'OVERDUE';
  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={isOverdue ? AlertCircle : Package}
        variant={isOverdue ? 'danger' : 'success'}
        title={isOverdue ? 'Đơn hàng quá hạn!' : 'Khách đang sử dụng thiết bị'}
        desc={
          isOverdue
            ? 'Khách chưa trả hàng dù đã qua ngày kết thúc. Liên hệ ngay và chuẩn bị thu hồi sản phẩm.'
            : 'Không cần hành động lúc này. Hệ thống sẽ thông báo khi khách yêu cầu trả hoặc đến ngày hết hạn.'
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Thời hạn thuê</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Bắt đầu', value: fmtDate(order.start_date), cls: '' },
            { label: 'Kết thúc', value: fmtDate(order.end_date), cls: '' },
            {
              label: isOverdue ? 'Quá hạn' : 'Còn lại',
              value: isOverdue
                ? `${Math.abs(diffDays)}d`
                : diffDays <= 0
                  ? 'Hôm nay'
                  : `${diffDays}d`,
              cls: isOverdue
                ? 'border-destructive/30 bg-destructive/5'
                : diffDays <= 1
                  ? 'border-yellow-300/50 bg-yellow-50 dark:bg-yellow-950/20'
                  : '',
            },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                'rounded-xl border border-border bg-muted/30 p-3 text-center',
                c.cls,
              )}
            >
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p
                className={cn(
                  'text-sm font-bold',
                  isOverdue && c.label !== 'Bắt đầu' && c.label !== 'Kết thúc'
                    ? 'text-destructive'
                    : 'text-foreground',
                )}
              >
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Package className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Sản phẩm đang thuê
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div
              key={item.rental_order_item_id}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="relative size-10 shrink-0 rounded-lg overflow-hidden border border-border">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {item.product_name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {item.serial_number}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isOverdue && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-destructive mb-0.5">
              Liên hệ khách ngay
            </p>
            <p className="text-sm text-foreground font-semibold">
              {order.renter.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.renter.phone_number}
            </p>
          </div>
          <a
            href={`tel:${order.renter.phone_number}`}
            className="inline-flex items-center gap-2 shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors"
          >
            <Phone className="size-4" /> Gọi ngay
          </a>
        </div>
      )}
    </div>
  );
}

// ─── STEP 5 — RETURNING ───────────────────────────────────────────────────────
function ReturningWorkflow({
  order,
  onCompleteReturn,
  loading,
}: {
  order: DashboardOrder;
  onCompleteReturn: (penalty: number) => void;
  loading: boolean;
}) {
  const [sealPhotos, setSealPhotos] = useState<string[]>([]);
  const [penaltyInput, setPenaltyInput] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penalties, setPenalties] = useState<
    { amount: number; reason: string }[]
  >([]);
  const totalPenalty = penalties.reduce((s, p) => s + p.amount, 0);

  const addPenalty = () => {
    const amount = Number(penaltyInput);
    if (amount > 0 && penaltyReason.trim()) {
      setPenalties((prev) => [
        ...prev,
        { amount, reason: penaltyReason.trim() },
      ]);
      setPenaltyInput('');
      setPenaltyReason('');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={RotateCcw}
        variant="warning"
        title="Thu hồi sản phẩm từ khách"
        desc="Đến địa chỉ khách, kiểm tra từng sản phẩm, ghi nhận hư hỏng, đóng gói niêm phong và chụp ảnh minh chứng đầy đủ."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Quy trình thu hồi</p>
        </div>
        <div className="divide-y divide-border/30">
          <ChecklistItem text="Đến đúng địa chỉ của khách hàng" />
          <ChecklistItem text="Kiểm tra đầy đủ số lượng sản phẩm" />
          <ChecklistItem text="Chụp ảnh tình trạng từng sản phẩm" />
          <ChecklistItem text="Ghi nhận và chụp ảnh hư hỏng (nếu có)" />
          <ChecklistItem text="Đóng gói lại từng sản phẩm" />
          <ChecklistItem text="Niêm phong kiện hàng và chụp ảnh" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-destructive" />
            <p className="text-sm font-bold text-foreground">
              Kiểm tra & chụp ảnh từng sản phẩm
            </p>
          </div>
          <span className="text-xs font-bold bg-destructive/10 text-destructive border border-destructive/25 px-2 py-1 rounded-lg">
            {order.items.length} sản phẩm
          </span>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chụp nhiều góc độ. Ghi rõ hư hỏng nếu có — đây là căn cứ chính thức
            để tính phí phạt.
          </p>
          {order.items.map((item) => (
            <ItemInspectionCard
              key={`out-${item.rental_order_item_id}`}
              item={item}
              phase="checkout"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <ShieldCheck className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">
            Ảnh đóng gói & niêm phong
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Chụp ảnh kiện hàng đã đóng gói và dán niêm phong. Bằng chứng hàng
            trả về đầy đủ.
          </p>
          <CameraCapture
            photos={sealPhotos}
            onAdd={(url) => setSealPhotos((p) => [...p, url])}
            onRemove={(i) => setSealPhotos((p) => p.filter((_, j) => j !== i))}
            label="Chụp ảnh kiện hàng đã niêm phong"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <AlertCircle className="size-4 text-destructive" />
          <p className="text-sm font-bold text-foreground">
            Ghi nhận phí phạt (nếu có)
          </p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {penalties.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-xl border border-destructive/25 bg-destructive/5 p-3">
              {penalties.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">{p.reason}</span>
                  <span className="font-bold text-destructive">
                    {fmt(p.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-destructive/20 pt-2 flex justify-between text-sm font-bold">
                <span className="text-foreground">Tổng phạt</span>
                <span className="text-destructive">{fmt(totalPenalty)}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              placeholder="Số tiền phạt (₫)"
              value={penaltyInput}
              onChange={(e) => setPenaltyInput(e.target.value)}
              className="flex-1 text-sm h-10"
            />
            <Input
              placeholder="Lý do (vd: vỡ màn hình...)"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              className="flex-1 text-sm h-10"
            />
            <Button
              variant="destructive"
              onClick={addPenalty}
              disabled={
                !penaltyInput ||
                Number(penaltyInput) <= 0 ||
                !penaltyReason.trim()
              }
              className="gap-1.5 shrink-0 h-10 text-sm"
            >
              + Thêm
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <Button
          size="lg"
          onClick={() => onCompleteReturn(totalPenalty)}
          disabled={loading}
          className="w-full gap-2 text-base"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          Hoàn thành thu hồi
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Kiểm tra kỹ tất cả thông tin trước khi xác nhận hoàn thành
        </p>
      </div>
    </div>
  );
}

// ─── STEP 6 — COMPLETED ───────────────────────────────────────────────────────
function CompletedWorkflow({
  order,
  onDepositRefund,
}: {
  order: DashboardOrder;
  onDepositRefund: () => void;
}) {
  const depositToReturn = Math.max(
    0,
    order.total_deposit - (order.total_penalty_amount ?? 0),
  );
  const isRefunded = order.deposit_refund_status === 'REFUNDED';

  return (
    <div className="flex flex-col gap-4">
      <WorkflowBanner
        icon={BadgeCheck}
        variant="success"
        title="Đơn hàng đã hoàn thành!"
        desc="Tất cả sản phẩm đã được thu hồi thành công. Xử lý hoàn cọc cho khách nếu chưa thực hiện."
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Tóm tắt tài chính</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí thuê</span>
            <span className="font-bold">{fmt(order.total_rental_fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tiền cọc đã giữ</span>
            <span className="font-bold">{fmt(order.total_deposit)}</span>
          </div>
          {(order.total_penalty_amount ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-destructive font-semibold">Phí phạt</span>
              <span className="font-bold text-destructive">
                +{fmt(order.total_penalty_amount!)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2.5 flex justify-between">
            <span className="text-sm font-bold text-foreground">
              Hoàn cọc cho khách
            </span>
            <span className="text-lg font-bold text-theme-primary-start">
              {fmt(depositToReturn)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BanknoteIcon className="size-4 text-theme-primary-start" />
          <p className="text-sm font-bold text-foreground">Hoàn tiền cọc</p>
        </div>
        {isRefunded ? (
          <div className="flex items-center gap-2 rounded-xl border border-success-border bg-success-muted px-4 py-3">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-sm font-bold text-success">
              Đã hoàn cọc thành công
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Hoàn{' '}
              <span className="font-bold text-foreground">
                {fmt(depositToReturn)}
              </span>{' '}
              cho{' '}
              <span className="font-bold text-foreground">
                {order.renter.full_name}
              </span>
              .
            </p>
            <Button size="lg" onClick={onDepositRefund} className="gap-2">
              <BanknoteIcon className="size-5" /> Xác nhận đã hoàn cọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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
        <Link href="/dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CFG[order.status];
  const isOverdue = order.status === 'OVERDUE';
  const daysOverdue = isOverdue
    ? Math.floor((Date.now() - new Date(order.end_date).getTime()) / 86400000)
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
          <Link href="/dashboard/orders">
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
              <ActiveWorkflow order={order} />
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
                onCompleteReturn={(penalty) =>
                  handleStatusChange('COMPLETED', {
                    total_penalty_amount:
                      (order.total_penalty_amount ?? 0) + penalty,
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

            {/* Collapsible full details */}
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
                    <span className="text-muted-foreground">Tiền cọc</span>
                    <span className="font-bold">
                      {fmt(order.total_deposit)}
                    </span>
                  </div>
                  {(order.total_penalty_amount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-destructive font-semibold">
                        Phí phạt
                      </span>
                      <span className="font-bold text-destructive">
                        +{fmt(order.total_penalty_amount!)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2.5 flex justify-between">
                    <span className="text-sm font-bold">Tổng</span>
                    <span className="text-base font-bold text-theme-primary-start">
                      {fmt(
                        order.total_rental_fee +
                          (order.total_penalty_amount ?? 0),
                      )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
