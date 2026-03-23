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
  UserCheck,
  BanknoteIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_ORDERS, MOCK_CURRENT_STAFF } from '@/data/mockDashboard';
import type {
  DashboardOrder,
  OrderStatus,
  OrderItem,
  DepositRefundStatus,
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

// ─── Status transitions ────────────────────────────────────────────────────────
const NEXT_STATUS_MAP: Partial<
  Record<
    OrderStatus,
    { status: OrderStatus; label: string; icon: React.ElementType }[]
  >
> = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Xác nhận đơn hàng', icon: CheckCircle2 },
  ],
  CONFIRMED: [
    { status: 'DELIVERING', label: 'Bắt đầu giao hàng', icon: Truck },
  ],
  DELIVERING: [
    { status: 'ACTIVE', label: 'Xác nhận đã bàn giao', icon: CheckCircle2 },
  ],
  ACTIVE: [
    { status: 'RETURNING', label: 'Khách đang hoàn trả', icon: RotateCcw },
  ],
  RETURNING: [
    { status: 'COMPLETED', label: 'Hoàn thành thu hồi', icon: CheckCircle2 },
  ],
  OVERDUE: [
    { status: 'RETURNING', label: 'Khách đang hoàn trả', icon: RotateCcw },
    { status: 'COMPLETED', label: 'Hoàn thành thu hồi', icon: CheckCircle2 },
  ],
};

// ─── Collapsible section ──────────────────────────────────────────────────────
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
        className="flex w-full items-center justify-between px-6 py-5 hover:bg-accent/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Icon className="size-5 text-theme-primary-start" />
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  );
}

// ─── Camera-only capture ─────────────────────────────────────────────────────
// WebRTC implementation — strict camera only, no gallery upload allowed
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
      setErrorLine('Không thể mở camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.');
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

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      onAdd(url);
      stopCamera();
    }, 'image/jpeg', 0.8);
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

      {errorLine && <p className="text-sm font-semibold text-destructive">{errorLine}</p>}

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
            'border-border bg-muted/20 hover:bg-muted/50 hover:border-theme-primary-start/50'
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
function ItemInspectionCard({
  item,
  phase,
}: {
  item: OrderItem;
  phase: 'checkin' | 'checkout';
}) {
  const [photos, setPhotos] = useState<string[]>(() => {
    const existing =
      phase === 'checkin' ? item.checkin_photo_url : item.checkout_photo_url;
    return existing ? [existing] : [];
  });
  const [note, setNote] = useState(item.staff_note ?? '');
  const [penalty, setPenalty] = useState<string>(
    String(item.item_penalty_amount ?? ''),
  );

  const isCheckin = phase === 'checkin';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
      {/* Product info header */}
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
          <Image
            src={item.image_url}
            alt={item.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground leading-tight">
            {item.product_name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">
            {item.serial_number}
          </p>
          <p className="text-sm text-muted-foreground">{item.category}</p>
          <p className="text-sm font-bold text-theme-primary-start mt-1">
            {fmt(item.deposit_amount)} tiền cọc
          </p>
        </div>
      </div>

      {/* Camera section */}
      <div>
        <p className="text-base font-bold text-foreground mb-1.5">
          {isCheckin
            ? '📷 Chụp ảnh trước khi bàn giao'
            : '📷 Chụp ảnh khi thu hồi sản phẩm'}
        </p>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          {isCheckin
            ? 'Chụp nhiều góc độ để ghi nhận tình trạng ban đầu. Ảnh này là bằng chứng trước khi khách nhận hàng.'
            : 'Chụp nhiều góc để ghi nhận tình trạng khi khách trả. Căn cứ để xác định hư hỏng và tính phí phạt.'}
        </p>
        <CameraCapture
          photos={photos}
          onAdd={(url) => setPhotos((p) => [...p, url])}
          onRemove={(i) => setPhotos((p) => p.filter((_, idx) => idx !== i))}
          label={
            isCheckin
              ? 'Chụp ảnh sản phẩm trước bàn giao'
              : 'Chụp ảnh sản phẩm khi thu hồi'
          }
        />
      </div>

      {/* Staff note */}
      <div>
        <p className="text-base font-bold text-foreground mb-2">
          {isCheckin
            ? 'Ghi chú tình trạng ban đầu'
            : 'Ghi chú hư hỏng / bất thường'}
        </p>
        <Textarea
          placeholder={
            isCheckin
              ? 'Mô tả tình trạng sản phẩm trước khi bàn giao (màu sắc, vết trầy nhỏ, phụ kiện đi kèm...)'
              : 'Mô tả chi tiết hư hỏng, vết xước, thiếu linh kiện... Ghi chú này là căn cứ để tính mức phạt.'
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-sm min-h-24 resize-none"
        />
      </div>

      {/* Penalty input — checkout phase only */}
      {!isCheckin && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 flex flex-col gap-3">
          <p className="text-base font-bold text-destructive">
            Phí phạt cho sản phẩm này
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="0"
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                className="pr-10 text-sm h-11"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                ₫
              </span>
            </div>
          </div>
          {penalty && Number(penalty) > 0 ? (
            <p className="text-sm font-bold text-destructive">
              → {fmt(Number(penalty))} sẽ được khấu trừ vào tiền cọc
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Để trống nếu không phát sinh hư hỏng
            </p>
          )}
        </div>
      )}

      <Button size="sm" variant="outline" className="self-start gap-2 text-sm">
        <CheckCircle2 className="size-4" />
        Lưu thông tin sản phẩm này
      </Button>
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
      <Icon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground mb-0.5">{label}</p>
        <p
          className={cn(
            'text-base text-foreground',
            strong && 'font-bold text-lg',
            mono && 'font-mono text-sm',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Deposit refund badge ──────────────────────────────────────────────────────
function DepositBadge({ status }: { status?: DepositRefundStatus }) {
  if (status === 'REFUNDED')
    return (
      <span className="text-sm font-bold text-success">
        ✓ Đã hoàn cọc
      </span>
    );
  if (status === 'PARTIAL_REFUNDED')
    return (
      <span className="text-sm font-semibold text-foreground">
        Hoàn một phần
      </span>
    );
  return <span className="text-sm text-muted-foreground">Chưa hoàn cọc</span>;
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const handleStatusChange = useCallback(async (newStatus: OrderStatus) => {
    setStatusLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            ...(newStatus === 'DELIVERING'
              ? { staff_checkin_id: MOCK_CURRENT_STAFF.staff_id }
              : {}),
            ...(newStatus === 'COMPLETED'
              ? { staff_checkout_id: MOCK_CURRENT_STAFF.staff_id }
              : {}),
          }
        : prev,
    );
    setStatusLoading(false);
  }, []);

  const handleUpdateLocation = useCallback(async () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ GPS');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await new Promise((r) => setTimeout(r, 500));
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                staff_current_latitude: pos.coords.latitude,
                staff_current_longitude: pos.coords.longitude,
                staff_location_updated_at: new Date().toISOString(),
              }
            : prev,
        );
        setLocationUpdated(true);
        setLocationLoading(false);
        setTimeout(() => setLocationUpdated(false), 3000);
      },
      () => {
        alert('Không thể lấy vị trí. Vui lòng cho phép truy cập định vị.');
        setLocationLoading(false);
      },
      { timeout: 8000 },
    );
  }, []);

  const handleDepositRefund = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setOrder((prev) =>
      prev ? { ...prev, deposit_refund_status: 'REFUNDED' } : prev,
    );
  }, []);

  const handleApplyPenalty = useCallback(async () => {
    if (!penaltyAmount || Number(penaltyAmount) <= 0 || !penaltyReason.trim())
      return;
    await new Promise((r) => setTimeout(r, 500));
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            total_penalty_amount:
              (prev.total_penalty_amount ?? 0) + Number(penaltyAmount),
          }
        : prev,
    );
    setPenaltyAmount('');
    setPenaltyReason('');
  }, [penaltyAmount, penaltyReason]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <AlertCircle className="size-14 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">
          Không tìm thấy đơn hàng
        </p>
        <Link href="/dashboard/orders">
          <Button variant="outline" size="lg">
            <ArrowLeft className="size-5 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CFG[order.status];
  const nextActions = NEXT_STATUS_MAP[order.status] ?? [];
  const isDelivering = order.status === 'DELIVERING';
  const isReturning =
    order.status === 'RETURNING' || order.status === 'OVERDUE';
  const canRefundDeposit =
    order.status === 'COMPLETED' && order.deposit_refund_status !== 'REFUNDED';

  const now = new Date();
  const daysOverdue =
    order.status === 'OVERDUE'
      ? Math.floor(
          (now.getTime() - new Date(order.end_date).getTime()) / 86400000,
        )
      : 0;
  const totalFee = order.total_rental_fee + (order.total_penalty_amount ?? 0);

  return (
    <div className="flex flex-col gap-6 p-5 md:p-8 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/orders">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 mt-0.5"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              {order.order_code}
            </h1>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold',
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
              <span className="text-sm font-bold bg-destructive text-card px-3 py-1.5 rounded-xl">
                Quá hạn {daysOverdue} ngày
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Tạo lúc {fmtDatetime(order.created_at)}
          </p>
        </div>
      </div>

      {/* ── Next-status action panel ── */}
      {nextActions.length > 0 && (
        <div className="rounded-2xl border border-theme-primary-start/20 bg-theme-primary-start/5 p-6">
          <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
            Hành động tiếp theo
          </p>
          <div className="flex flex-wrap gap-3">
            {nextActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.status}
                  size="lg"
                  onClick={() => handleStatusChange(action.status)}
                  disabled={statusLoading}
                  className="gap-2 text-base"
                >
                  {statusLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ActionIcon className="size-5" />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Renter info ── */}
      <Section title="Thông tin khách thuê" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
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
            label="Số CCCD"
            value={order.renter.cccd_number}
            mono
          />
          <InfoRow icon={MapPin} label="Địa chỉ" value={order.renter.address} />
        </div>
      </Section>

      {/* ── Order financials ── */}
      <Section title="Chi tiết đơn hàng" icon={ClipboardList}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-5">
            <InfoRow
              icon={Calendar}
              label="Ngày bắt đầu"
              value={fmtDate(order.start_date)}
            />
            <InfoRow
              icon={Calendar}
              label="Ngày kết thúc"
              value={fmtDate(order.end_date)}
            />
            {order.actual_return_date && (
              <InfoRow
                icon={Calendar}
                label="Ngày trả thực tế"
                value={fmtDate(order.actual_return_date)}
              />
            )}
            {order.delivery_address && (
              <InfoRow
                icon={MapPin}
                label="Địa chỉ giao hàng"
                value={order.delivery_address}
              />
            )}
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Phí thuê</span>
              <span className="text-lg font-bold text-foreground">
                {fmt(order.total_rental_fee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Tiền cọc</span>
              <span className="text-lg font-bold text-foreground">
                {fmt(order.total_deposit)}
              </span>
            </div>
            {(order.total_penalty_amount ?? 0) > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-destructive">
                  Phí phạt
                </span>
                <span className="text-lg font-bold text-destructive">
                  +{fmt(order.total_penalty_amount!)}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-4 flex justify-between items-baseline">
              <span className="text-base font-bold text-foreground">
                Tổng cộng
              </span>
              <span className="text-2xl font-bold text-theme-primary-start">
                {fmt(totalFee)}
              </span>
            </div>
            <div className="pt-2 space-y-2.5 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Thanh toán
                </span>
                <span
                  className={cn(
                    'text-sm font-bold rounded-lg border px-2.5 py-1',
                    order.payment_status === 'PAID'
                      ? 'text-success bg-success-muted border-success-border'
                      : 'text-muted-foreground bg-muted border-border',
                  )}
                >
                  {order.payment_status === 'PAID'
                    ? 'Đã thanh toán'
                    : order.payment_status === 'PENDING'
                      ? 'Chưa thanh toán'
                      : 'Một phần'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoàn cọc</span>
                <DepositBadge status={order.deposit_refund_status} />
              </div>
            </div>
          </div>
        </div>
        {order.notes && (
          <div className="mt-5 rounded-2xl border border-border bg-muted/30 px-5 py-4">
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Ghi chú đơn hàng
            </p>
            <p className="text-base text-foreground">{order.notes}</p>
          </div>
        )}
      </Section>

      {/* ── Staff assignment ── */}
      <Section title="Nhân viên phụ trách" icon={UserCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-5">
            <div className="size-12 rounded-full bg-theme-primary-start/10 flex items-center justify-center shrink-0">
              <Truck className="size-6 text-theme-primary-start" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">
                Bàn giao (check-in)
              </p>
              <p className="text-base font-bold text-foreground">
                {order.staff_checkin_id === MOCK_CURRENT_STAFF.staff_id ? (
                  MOCK_CURRENT_STAFF.full_name
                ) : order.staff_checkin_id ? (
                  `Nhân viên #${order.staff_checkin_id}`
                ) : (
                  <span className="text-muted-foreground italic font-normal">
                    Chưa gán
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-5">
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <RotateCcw className="size-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">
                Thu hồi (check-out)
              </p>
              <p className="text-base font-bold text-foreground">
                {order.staff_checkout_id === MOCK_CURRENT_STAFF.staff_id ? (
                  MOCK_CURRENT_STAFF.full_name
                ) : order.staff_checkout_id ? (
                  `Nhân viên #${order.staff_checkout_id}`
                ) : (
                  <span className="text-muted-foreground italic font-normal">
                    Chưa gán
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        {!order.staff_checkin_id &&
          ['PENDING', 'CONFIRMED'].includes(order.status) && (
            <Button
              variant="outline"
              size="lg"
              className="mt-5 gap-2 text-sm"
              onClick={() =>
                setOrder((prev) =>
                  prev
                    ? { ...prev, staff_checkin_id: MOCK_CURRENT_STAFF.staff_id }
                    : prev,
                )
              }
            >
              <UserCheck className="size-5" />
              Tôi nhận phụ trách đơn hàng này
            </Button>
          )}
      </Section>

      {/* ── Check-in: photos before handover ── */}
      <Section
        title="Chụp ảnh — Trước khi bàn giao cho khách"
        icon={Camera}
        badge={
          <span className="ml-2 text-xs font-bold bg-theme-primary-start/10 text-theme-primary-start border border-theme-primary-start/25 px-2.5 py-1 rounded-lg">
            {order.items.length} sản phẩm
          </span>
        }
      >
        <p className="text-sm text-muted-foreground mb-5 pt-1 leading-relaxed">
          Trước khi đến giao hàng, hãy chụp ảnh từng sản phẩm nhiều góc độ. Đây
          là bằng chứng tình trạng ban đầu của hàng hoá trước khi khách nhận.
        </p>
        <div className="flex flex-col gap-5">
          {order.items.map((item) => (
            <ItemInspectionCard
              key={item.rental_order_item_id}
              item={item}
              phase="checkin"
            />
          ))}
        </div>
      </Section>

      {/* ── Check-out: photos when collecting ── */}
      {(isReturning || order.status === 'COMPLETED') && (
        <Section
          title="Chụp ảnh — Khi thu hồi hàng từ khách"
          icon={Camera}
          badge={
            <span className="ml-2 text-xs font-bold bg-destructive/10 text-destructive border border-destructive/25 px-2.5 py-1 rounded-lg">
              Thu hồi
            </span>
          }
        >
          <p className="text-sm text-muted-foreground mb-5 pt-1 leading-relaxed">
            Khi đến lấy hàng, chụp ảnh từng sản phẩm nhiều góc độ. Ghi chú rõ hư
            hỏng nếu có — đây là căn cứ để tính phí phạt.
          </p>
          <div className="flex flex-col gap-5">
            {order.items.map((item) => (
              <ItemInspectionCard
                key={`out-${item.rental_order_item_id}`}
                item={item}
                phase="checkout"
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── Live location update (delivering only) ── */}
      {isDelivering && (
        <Section title="Vị trí giao hàng thực tế" icon={Navigation}>
          <div className="flex flex-col gap-5 pt-1">
            {order.delivery_address && (
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-5">
                <MapPin className="size-5 text-theme-primary-start shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">
                    Địa chỉ cần giao
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {order.delivery_address}
                  </p>
                </div>
                {order.delivery_latitude && order.delivery_longitude && (
                  <Link
                    href={`/map?lat=${order.delivery_latitude}&lng=${order.delivery_longitude}&order=${order.rental_order_id}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-theme-primary-start hover:underline shrink-0"
                  >
                    Xem bản đồ <ExternalLink className="size-4" />
                  </Link>
                )}
              </div>
            )}
            {order.staff_location_updated_at && (
              <p className="text-sm text-muted-foreground">
                Cập nhật lần cuối:{' '}
                <span className="font-bold text-foreground">
                  {fmtDatetime(order.staff_location_updated_at)}
                </span>
              </p>
            )}
            <Button
              size="lg"
              onClick={handleUpdateLocation}
              disabled={locationLoading || locationUpdated}
              variant={locationUpdated ? 'outline' : 'default'}
              className="gap-2 text-base w-full sm:w-auto"
            >
              {locationLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : locationUpdated ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Navigation className="size-5" />
              )}
              {locationLoading
                ? 'Đang lấy vị trí GPS...'
                : locationUpdated
                  ? 'Đã cập nhật vị trí thành công!'
                  : 'Cập nhật vị trí hiện tại của tôi'}
            </Button>
          </div>
        </Section>
      )}

      {/* ── Additional penalty ── */}
      {['RETURNING', 'OVERDUE', 'COMPLETED'].includes(order.status) && (
        <Section title="Phí phạt bổ sung (toàn đơn)" icon={AlertCircle}>
          {(order.total_penalty_amount ?? 0) > 0 && (
            <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 pt-2">
              <p className="text-base font-bold text-destructive">
                Tổng phí phạt hiện tại: {fmt(order.total_penalty_amount!)}
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Input
              type="number"
              placeholder="Số tiền phạt (₫)"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              className="flex-1 text-sm h-11"
            />
            <Input
              placeholder="Lý do phạt (vd: vỡ màn hình)"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              className="flex-1 text-sm h-11"
            />
            <Button
              variant="destructive"
              size="lg"
              onClick={handleApplyPenalty}
              disabled={
                !penaltyAmount ||
                Number(penaltyAmount) <= 0 ||
                !penaltyReason.trim()
              }
              className="gap-2 shrink-0"
            >
              <AlertCircle className="size-5" />
              Áp dụng phạt
            </Button>
          </div>
        </Section>
      )}

      {/* ── Deposit refund ── */}
      {(order.status === 'COMPLETED' ||
        order.deposit_refund_status === 'REFUNDED') && (
        <Section title="Hoàn tiền cọc cho khách" icon={BanknoteIcon}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
            <div>
              <p className="text-lg font-bold text-foreground">
                Tiền cọc:{' '}
                <span className="text-theme-primary-start">
                  {fmt(order.total_deposit)}
                </span>
              </p>
              {(order.total_penalty_amount ?? 0) > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Trừ phí phạt:{' '}
                  <span className="font-bold text-destructive">
                    -{fmt(order.total_penalty_amount!)}
                  </span>
                  {' → '}Hoàn về:{' '}
                  <span className="font-bold text-foreground">
                    {fmt(
                      Math.max(
                        0,
                        order.total_deposit - (order.total_penalty_amount ?? 0),
                      ),
                    )}
                  </span>
                </p>
              )}
            </div>
            {order.deposit_refund_status === 'REFUNDED' ? (
              <div className="flex items-center gap-2 rounded-2xl border border-success-border bg-success-muted px-5 py-3">
                <CheckCircle2 className="size-5 text-success" />
                <span className="text-base font-bold text-success">
                  Đã hoàn cọc thành công
                </span>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={handleDepositRefund}
                disabled={!canRefundDeposit}
                className="gap-2 text-base"
              >
                <BanknoteIcon className="size-5" />
                Xác nhận đã hoàn cọc
              </Button>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
