'use client';

import { useState, Fragment, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Truck,
  User,
  AlertCircle,
  Package,
  Loader2,
  Ban,
  CreditCard,
  CalendarPlus,
  Star,
  RotateCcw,
  Check,
  MapPin,
  Clock3,
  PlayCircle,
  PackageMinus,
  QrCode,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useRentalOrderQuery,
  useCancelOrder,
  useExtendOrder,
  useUpdateOrderStatus,
  useOverduePenaltySuggestionQuery,
} from '@/hooks/api/use-rental-orders';
import { useInitiatePayment } from '@/hooks/api/use-payments';
import { useRentalContractByOrderQuery } from '@/hooks/api/use-contract';
import { PolicyPdfPreview } from '@/features/policies/components/policy-pdf-preview';
import { toast } from 'sonner';
import { useCartAnimationStore } from '@/stores/cart-animation-store';
import { useAddToCart } from '@/hooks/api/use-cart';
import { cn } from '@/lib/utils';
import {
  RENTAL_ORDER_STATUS_LABELS,
  RENTAL_ORDER_STATUS_COLORS,
} from '@/api/rentalOrderApi';
import { useAuth } from '@/hooks/useAuth';
import { buildLoginHref } from '@/lib/auth-redirect';
import type {
  RentalOrderStatus,
  RentalOrderStaffSummary,
} from '@/api/rentalOrderApi';

const PolicyConsentDialog = dynamic(
  () =>
    import('@/components/checkout/policy-consent-dialog').then(
      (m) => m.PolicyConsentDialog,
    ),
  { ssr: false },
);

const fmt = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const EXTENDABLE_STATUSES: RentalOrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'DELIVERING',
  'DELIVERED',
  'IN_USE',
  'PENDING_PICKUP',
];

const OVERDUE_SUGGESTION_STATUSES: RentalOrderStatus[] = [
  'IN_USE',
  'PENDING_PICKUP',
  'PICKING_UP',
  'PICKED_UP',
];

const CANCELABLE_STATUSES: RentalOrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
];

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const STATUS_GROUPS: RentalOrderStatus[][] = [
  ['PENDING_PAYMENT'],
  ['PAID', 'PREPARING'],
  ['DELIVERING'],
  ['DELIVERED', 'IN_USE'],
  ['PENDING_PICKUP', 'PICKING_UP', 'PICKED_UP'],
  ['COMPLETED'],
];

const STEP_LABELS = [
  'Thanh toán',
  'Chuẩn bị',
  'Giao hàng',
  'Đang dùng',
  'Thu hồi',
  'Hoàn tất',
];

function getActiveGroupIndex(status: RentalOrderStatus): number {
  if (status === 'CANCELLED') return -1;
  if (status === 'COMPLETED') return STATUS_GROUPS.length;
  const i = STATUS_GROUPS.findIndex((g) =>
    g.includes(status as RentalOrderStatus),
  );
  return i >= 0 ? i : 0;
}

function OrderStatusStepper({ status }: { status: RentalOrderStatus }) {
  if (status === 'CANCELLED') {
    return (
      <div className='flex items-center gap-2.5 rounded-xl border border-red-200/80 bg-red-50/60 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'>
        <Ban className='size-4 shrink-0' />
        Đơn đã hủy - không còn xử lý tiếp.
      </div>
    );
  }

  const active = getActiveGroupIndex(status);

  return (
    <div className='overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      <div className='flex w-full items-start py-1'>
        {STEP_LABELS.map((label, i) => {
          const done = i < active || status === 'COMPLETED';
          const current = i === active && status !== 'COMPLETED';
          const segmentDone =
            i > 0 && (i - 1 < active || status === 'COMPLETED');

          return (
            <Fragment key={label}>
              {i > 0 && (
                <div
                  className={cn(
                    'mt-[15px] h-px flex-1',
                    segmentDone ? 'bg-rose-500' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
              <div className='flex shrink-0 flex-col items-center'>
                <div
                  className={cn(
                    'flex size-[30px] items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                    done
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : current
                        ? 'border-rose-500 bg-card text-rose-600 ring-4 ring-rose-500/15 dark:bg-card dark:text-rose-400'
                        : 'border-border bg-muted/50 text-muted-foreground',
                  )}
                >
                  {done ? (
                    <Check className='size-3.5' strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-center text-[10px] font-medium leading-tight',
                    done || current
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  iconBg,
  title,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
}) {
  return (
    <div className='flex items-center gap-3 border-b border-border/60 px-5 py-4'>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg text-white',
          iconBg,
        )}
      >
        {icon}
      </div>
      <span className='font-semibold text-foreground'>{title}</span>
    </div>
  );
}

function StaffAvatar({
  staff,
  role,
}: {
  staff: RentalOrderStaffSummary;
  role: string;
}) {
  return (
    <div className='flex items-center gap-3'>
      {staff.avatarUrl ? (
        <img
          src={staff.avatarUrl}
          alt={`${staff.firstName} ${staff.lastName}`}
          className='size-9 shrink-0 rounded-full object-cover ring-2 ring-border'
        />
      ) : (
        <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <User className='size-4' />
        </div>
      )}
      <div>
        <p className='text-sm font-semibold text-foreground'>
          {staff.firstName} {staff.lastName}
        </p>
        <p className='text-xs text-muted-foreground'>{role}</p>
        {staff.nickname && (
          <p className='text-xs text-rose-500'>@{staff.nickname}</p>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='space-y-3 rounded-2xl border border-border/60 bg-card p-6'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-64' />
        <Skeleton className='mt-4 h-10 w-full rounded-xl' />
        <div className='flex gap-3 pt-1'>
          <Skeleton className='h-10 w-36 rounded-xl' />
          <Skeleton className='h-10 w-28 rounded-xl' />
        </div>
      </div>
      <div className='grid gap-5 lg:grid-cols-12'>
        <div className='space-y-5 lg:col-span-7'>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border border-border/60 bg-card p-5'
            >
              <Skeleton className='mb-4 h-5 w-36' />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className='mb-3 space-y-1'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-4 w-40' />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className='space-y-5 lg:col-span-5'>
          <Skeleton className='h-56 w-full rounded-2xl' />
          <Skeleton className='h-40 w-full rounded-2xl' />
        </div>
      </div>
    </div>
  );
}

function ExtendDialog({
  orderId,
  expectedRentalEndDate,
  open,
  onOpenChange,
}: {
  orderId: string;
  expectedRentalEndDate: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [days, setDays] = useState(1);

  const extendOrder = useExtendOrder({
    onSuccess: () => {
      toast.success(`Đã gia hạn thêm ${days} ngày thành công.`);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Gia hạn thất bại. Vui lòng thử lại.');
    },
  });

  function handleExtend() {
    extendOrder.mutate({
      rentalOrderId: orderId,
      input: { additionalRentalDays: days },
    });
  }

  const endDate = new Date(expectedRentalEndDate);
  endDate.setDate(endDate.getDate() + days);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CalendarPlus className='size-5 text-rose-600' />
            Gia hạn đơn thuê
          </DialogTitle>
          <DialogDescription>
            Thêm ngày thuê cho đơn này. Thời hạn mới sẽ được tự động cập nhật.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-foreground'>
              Số ngày muốn gia hạn
            </label>
            <div className='mt-2 flex items-center gap-3'>
              <button
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-lg font-bold hover:bg-muted transition-colors'
              >
                −
              </button>
              <input
                type='number'
                min={1}
                max={30}
                value={days}
                onChange={(e) =>
                  setDays(Math.max(1, parseInt(e.target.value) || 1))
                }
                className='flex h-9 w-20 items-center justify-center rounded-lg border border-border bg-background text-center text-lg font-bold focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200'
              />
              <button
                onClick={() => setDays((d) => Math.min(30, d + 1))}
                className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-lg font-bold hover:bg-muted transition-colors'
              >
                +
              </button>
              <span className='text-sm text-muted-foreground'>ngày</span>
            </div>
          </div>

          <div className='rounded-lg border border-border/60 bg-muted/40 p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                Ngày kết thúc hiện tại
              </span>
              <span className='font-medium text-foreground'>
                {formatDateShort(expectedRentalEndDate)}
              </span>
            </div>
            <div className='mt-2 flex justify-between'>
              <span className='text-muted-foreground'>Ngày kết thúc mới</span>
              <span className='font-bold text-rose-600'>
                {formatDateShort(endDate.toISOString())}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={extendOrder.isPending}
          >
            Hủy
          </Button>
          <Button
            className='bg-rose-600 text-white hover:bg-rose-700'
            onClick={handleExtend}
            disabled={extendOrder.isPending}
          >
            {extendOrder.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <CalendarPlus className='size-4' />
            )}
            Gia hạn {days} ngày
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RentalOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const id = typeof params?.id === 'string' ? params.id : '';
  const [extendOpen, setExtendOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [paymentPolicyOpen, setPaymentPolicyOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [pickupConfirmOpen, setPickupConfirmOpen] = useState(false);
  const [reorderState, setReorderState] = useState<
    'idle' | 'adding' | 'success'
  >('idle');

  const { data: order, isLoading, isError } = useRentalOrderQuery(id);

  const overdueSuggestionEnabled = useMemo(
    () =>
      !!order &&
      OVERDUE_SUGGESTION_STATUSES.includes(order.status as RentalOrderStatus),
    [order],
  );

  const { data: overdueSuggestion, isLoading: overdueSuggestionLoading } =
    useOverduePenaltySuggestionQuery(id, {
      enabled: overdueSuggestionEnabled,
    });

  const contractQueryEnabled = useMemo(
    () =>
      !!order &&
      order.status !== 'PENDING_PAYMENT' &&
      order.status !== 'CANCELLED',
    [order],
  );

  const { data: rentalContract, isPending: contractLoading } =
    useRentalContractByOrderQuery(id, {
      enabled: !!id && contractQueryEnabled,
    });

  const hasContractAction =
    contractQueryEnabled &&
    (contractLoading || Boolean(rentalContract?.contractPdfUrl));

  const { mutateAsync: addToCartApi } = useAddToCart();
  const addFlyingItem = useCartAnimationStore((s) => s.addFlyingItem);

  function ensureAuthenticated(actionLabel: string): boolean {
    if (isAuthenticated) return true;

    if (authLoading) {
      toast.error('Đang kiểm tra trạng thái đăng nhập. Vui lòng thử lại.');
      return false;
    }

    toast.error(`Vui lòng đăng nhập để ${actionLabel}.`);
    router.push(buildLoginHref(`/rental-orders/${id}`));
    return false;
  }

  async function handleReorder() {
    if (!ensureAuthenticated('thuê lại sản phẩm')) return;
    if (!order || reorderState !== 'idle') return;

    const btn = document.getElementById('reorder-btn');
    const firstLine = document.getElementById('order-line-0');

    const fromRect = firstLine
      ? firstLine.getBoundingClientRect()
      : btn
        ? btn.getBoundingClientRect()
        : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 80, 60);

    addFlyingItem({ id: `reorder-${Date.now()}`, imageUrl: '', fromRect });
    setReorderState('adding');

    try {
      for (const line of order.rentalOrderLines) {
        await addToCartApi({
          productId: line.productId,
          rentalDurationDays: line.rentalDurationDays,
          quantity: 1,
        });
      }
      toast.success('Đã thêm vào giỏ hàng!');
    } catch {
      toast.error('Không thể thêm một số sản phẩm vào giỏ hàng.');
    }

    setReorderState('success');
    setTimeout(() => setReorderState('idle'), 2500);
  }

  const cancelOrder = useCancelOrder({
    onSuccess: () => toast.success('Đơn thuê đã được hủy thành công.'),
    onError: (err) =>
      toast.error(err.message || 'Hủy đơn thất bại. Vui lòng thử lại.'),
  });

  const initiatePayment = useInitiatePayment({
    onSuccess: (paymentUrl) => {
      window.location.href = paymentUrl;
    },
    onError: (err) =>
      toast.error(
        err.message || 'Tạo link thanh toán thất bại. Vui lòng thử lại.',
      ),
  });

  const updateOrderStatus = useUpdateOrderStatus({
    onSuccess: () => toast.success('Đã cập nhật trạng thái đơn thuê.'),
    onError: (err) =>
      toast.error(
        err instanceof Error
          ? err.message
          : 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
      ),
  });

  function handleCancel() {
    if (!ensureAuthenticated('hủy đơn thuê')) return;
    if (!order) return;
    if (!CANCELABLE_STATUSES.includes(order.status as RentalOrderStatus)) {
      toast.error('Chỉ có thể hủy đơn trước khi bắt đầu giao hàng.');
      return;
    }
    setCancelConfirmOpen(true);
  }

  function confirmCancel() {
    if (!ensureAuthenticated('hủy đơn thuê')) return;
    if (!order) return;
    if (!CANCELABLE_STATUSES.includes(order.status as RentalOrderStatus)) {
      setCancelConfirmOpen(false);
      toast.error('Không thể hủy đơn khi đang giao hàng hoặc sau đó.');
      return;
    }
    cancelOrder.mutate(order.rentalOrderId, {
      onSuccess: () => setCancelConfirmOpen(false),
    });
  }

  function handlePayment() {
    if (!ensureAuthenticated('thanh toán đơn thuê')) return;
    if (!order) return;
    setPaymentPolicyOpen(true);
  }

  function handlePaymentAfterConsent() {
    if (!ensureAuthenticated('thanh toán đơn thuê')) return;
    if (!order) return;
    setPaymentPolicyOpen(false);
    initiatePayment.mutate(order.rentalOrderId);
  }

  function handleDeliveredToInUse() {
    if (!ensureAuthenticated('xác nhận bắt đầu sử dụng')) return;
    if (!order) return;
    updateOrderStatus.mutate({
      rentalOrderId: order.rentalOrderId,
      input: { status: 'IN_USE' },
    });
  }

  function handleInUseToPendingPickup() {
    if (!ensureAuthenticated('yêu cầu thu hồi')) return;
    if (!order) return;
    setPickupConfirmOpen(true);
  }

  function confirmInUseToPendingPickup() {
    if (!ensureAuthenticated('yêu cầu thu hồi')) return;
    if (!order) return;
    updateOrderStatus.mutate(
      {
        rentalOrderId: order.rentalOrderId,
        input: { status: 'PENDING_PICKUP' },
      },
      {
        onSuccess: () => setPickupConfirmOpen(false),
      },
    );
  }

  const isExtendable =
    order && EXTENDABLE_STATUSES.includes(order.status as RentalOrderStatus);

  if (isError) {
    return (
      <div className='min-h-screen bg-muted/30 px-3 pb-16 pt-24 font-sans sm:pt-28 dark:bg-background'>
        <div className='mx-auto max-w-lg text-center'>
          <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10'>
            <AlertCircle className='size-8 text-destructive' />
          </div>
          <p className='mt-4 text-lg font-semibold text-foreground'>
            Không tải được đơn thuê
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Đơn có thể không tồn tại hoặc bạn chưa đăng nhập.
          </p>
          <Button
            className='mt-6 rounded-xl'
            variant='outline'
            render={<Link href='/rental-orders' />}
          >
            Danh sách đơn
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-white font-sans dark:bg-surface-base'>
      <div className='relative mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-4 sm:pt-4 md:px-6 md:pt-8'>
        <Button
          variant='ghost'
          size='sm'
          className='mb-5 gap-1.5 text-muted-foreground hover:text-foreground'
          render={<Link href='/rental-orders' />}
        >
          <ArrowLeft className='size-4' />
          Tất cả đơn thuê
        </Button>

        {isLoading && <DetailSkeleton />}

        {order && (
          <>
            {/* ── Order header card ── */}
            <SectionCard className='mb-5'>
              <div className='p-5 sm:p-6'>
                {/* Top: ID + Status badge */}
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <span className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-muted-foreground'>
                      #{order.rentalOrderId.slice(0, 8).toUpperCase()}
                    </span>
                    <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
                      Đơn thuê của bạn
                    </h1>
                    <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                      <Clock3 className='size-3.5 shrink-0' />
                      Đặt lúc {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-sm font-semibold',
                      RENTAL_ORDER_STATUS_COLORS[
                        order.status as RentalOrderStatus
                      ],
                    )}
                  >
                    {
                      RENTAL_ORDER_STATUS_LABELS[
                        order.status as RentalOrderStatus
                      ]
                    }
                  </Badge>
                </div>

                {/* ── Pending payment banner ── */}
                {order.status === 'PENDING_PAYMENT' && (
                  <div className='mt-4 flex flex-col gap-3 rounded-xl border border-amber-300/70 bg-amber-50/80 p-4 dark:border-amber-700/40 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'>
                        <CreditCard className='size-4' />
                      </div>
                      <div>
                        <p className='text-sm font-bold text-amber-800 dark:text-amber-300'>
                          Đơn hàng chờ thanh toán
                        </p>
                        <p className='mt-0.5 text-xs text-amber-700/80 dark:text-amber-400/80'>
                          Hoàn tất thanh toán qua cổng VNPay để xác nhận đơn
                          thuê của bạn.
                        </p>
                      </div>
                    </div>
                    <Button
                      size='sm'
                      className='shrink-0 gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-sm shadow-amber-500/30 hover:bg-amber-600 active:scale-[0.98] dark:bg-amber-500 dark:hover:bg-amber-600'
                      onClick={handlePayment}
                      disabled={initiatePayment.isPending}
                    >
                      {initiatePayment.isPending ? (
                        <Loader2 className='size-4 animate-spin' />
                      ) : (
                        <CreditCard className='size-4' />
                      )}
                      {initiatePayment.isPending
                        ? 'Đang xử lý…'
                        : 'Thanh toán ngay'}
                    </Button>
                  </div>
                )}

                {/* ── Pending pickup banner ── */}
                {order.status === 'PENDING_PICKUP' && (
                  <div className='mt-4 flex flex-col gap-3 rounded-xl border border-orange-300/70 bg-orange-50/80 p-4 dark:border-orange-700/40 dark:bg-orange-950/30 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'>
                        <RotateCcw className='size-4' />
                      </div>
                      <div>
                        <p className='text-sm font-bold text-orange-800 dark:text-orange-300'>
                          Yêu cầu thu hồi đã được tiếp nhận
                        </p>
                        <p className='mt-0.5 text-xs text-orange-700/80 dark:text-orange-400/80'>
                          Nhân viên sẽ liên hệ và đến thu hồi thiết bị theo lịch trình. Cảm ơn bạn đã sử dụng dịch vụ.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status stepper */}
                <div className='mt-5 border-t border-border/60 pt-5'>
                  <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    Tiến trình đơn hàng
                  </p>
                  <OrderStatusStepper
                    status={order.status as RentalOrderStatus}
                  />
                </div>

                {/* Action buttons */}
                {(() => {
                  const hasPay = order.status === 'PENDING_PAYMENT';
                  const hasCancel = CANCELABLE_STATUSES.includes(
                    order.status as RentalOrderStatus,
                  );
                  const hasStartUse = order.status === 'DELIVERED';
                  const hasRequestPickup = order.status === 'IN_USE';
                  const canRentalStatusTransition = Boolean(
                    order.actualDeliveryAt && order.actualRentalStartAt,
                  );
                  const hasReview =
                    order.status === 'COMPLETED' &&
                    order.rentalOrderLines.length > 0;
                  const hasReorder =
                    order.status === 'COMPLETED' &&
                    order.rentalOrderLines.length > 0;
                  const hasQr = Boolean(order.qrCode);
                  const anyAction =
                    hasPay ||
                    isExtendable ||
                    hasStartUse ||
                    hasRequestPickup ||
                    hasReview ||
                    hasReorder ||
                    hasCancel ||
                    hasQr ||
                    hasContractAction;

                  if (!anyAction) return null;

                  return (
                    <div className='mt-5 border-t border-border/60 pt-5'>
                      <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        Thao tác
                      </p>
                      <div className='flex flex-wrap gap-2.5'>
                        {/* {hasPay && (
                          <Button
                            size='default'
                            className='gap-2 rounded-xl bg-rose-600 px-5 font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98]'
                            onClick={handlePayment}
                            disabled={initiatePayment.isPending}
                          >
                            {initiatePayment.isPending ? (
                              <Loader2 className='size-4 animate-spin' />
                            ) : (
                              <CreditCard className='size-4' />
                            )}
                            Thanh toán ngay
                          </Button>
                        )} */}

                        {isExtendable && (
                          <Button
                            size='default'
                            variant='outline'
                            className='gap-2 rounded-xl border-rose-300 px-5 font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-400 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/50'
                            onClick={() => setExtendOpen(true)}
                          >
                            <CalendarPlus className='size-4' />
                            Gia hạn
                          </Button>
                        )}

                        {hasQr && (
                          <Button
                            size='default'
                            variant='outline'
                            className='gap-2 rounded-xl border-zinc-300 px-5 font-semibold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900/50'
                            onClick={() => setQrDialogOpen(true)}
                          >
                            <QrCode className='size-4' />
                            Xem mã QR
                          </Button>
                        )}

                        {hasContractAction && (
                          <Button
                            size='default'
                            variant='outline'
                            className='gap-2 rounded-xl border-slate-300 px-5 font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900/50'
                            onClick={() => setContractDialogOpen(true)}
                            disabled={
                              contractLoading || !rentalContract?.contractPdfUrl
                            }
                          >
                            {contractLoading ? (
                              <Loader2 className='size-4 animate-spin' />
                            ) : (
                              <FileText className='size-4' />
                            )}
                            {contractLoading
                              ? 'Đang tải hợp đồng…'
                              : 'Xem hợp đồng'}
                          </Button>
                        )}

                        {hasStartUse && (
                          <Button
                            size='default'
                            variant='outline'
                            title={
                              !canRentalStatusTransition
                                ? 'Cần có thời điểm giao hàng và bắt đầu thuê thực tế trước khi xác nhận.'
                                : undefined
                            }
                            className='gap-2 rounded-xl border-cyan-300 px-5 font-semibold text-cyan-800 hover:bg-cyan-50 hover:border-cyan-400 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/50'
                            onClick={handleDeliveredToInUse}
                            disabled={
                              updateOrderStatus.isPending ||
                              !canRentalStatusTransition
                            }
                          >
                            {updateOrderStatus.isPending ? (
                              <Loader2 className='size-4 animate-spin' />
                            ) : (
                              <PlayCircle className='size-4' />
                            )}
                            Bắt đầu sử dụng
                          </Button>
                        )}

                          {hasRequestPickup && (
                            <Button
                              size='default'
                              variant='default'
                              className='gap-2 rounded-xl border-orange-400 bg-orange-600 px-5 font-semibold text-white shadow-sm hover:bg-orange-700 active:scale-[0.98]'
                              onClick={handleInUseToPendingPickup}
                              disabled={updateOrderStatus.isPending}
                            >
                              {updateOrderStatus.isPending ? (
                                <Loader2 className='size-4 animate-spin' />
                              ) : (
                                <PackageMinus className='size-4' />
                              )}
                              Tôi muốn trả hàng
                            </Button>
                          )}

                        {hasReview && (
                          <Button
                            size='default'
                            variant='outline'
                            className='gap-2 rounded-xl border-amber-300 px-5 font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/50'
                            render={
                              <Link
                                href={`/product/${order.rentalOrderLines[0].productId}#reviews`}
                              />
                            }
                          >
                            <Star className='size-4 fill-amber-400 text-amber-500' />
                            Viết đánh giá
                          </Button>
                        )}

                        {hasReorder && (
                          <Button
                            id='reorder-btn'
                            size='default'
                            className={cn(
                              'gap-2 rounded-xl px-5 font-semibold transition-all active:scale-[0.98]',
                              reorderState === 'success'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : reorderState === 'adding'
                                  ? 'animate-pulse cursor-wait bg-rose-400 text-white'
                                  : 'bg-rose-600 text-white hover:bg-rose-700',
                            )}
                            onClick={handleReorder}
                            disabled={reorderState !== 'idle'}
                          >
                            {reorderState === 'adding' ? (
                              <>
                                <Loader2 className='size-4 animate-spin' />
                                Đang thêm...
                              </>
                            ) : reorderState === 'success' ? (
                              <>
                                <Check className='size-4' />
                                Đã thêm vào giỏ!
                              </>
                            ) : (
                              <>
                                <RotateCcw className='size-4' />
                                Thuê lại
                              </>
                            )}
                          </Button>
                        )}

                        {hasCancel && (
                          <Button
                            size='default'
                            variant='outline'
                            className='gap-2 rounded-xl border-red-200 px-5 font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50'
                            onClick={handleCancel}
                            disabled={cancelOrder.isPending}
                          >
                            {cancelOrder.isPending ? (
                              <Loader2 className='size-4 animate-spin' />
                            ) : (
                              <Ban className='size-4' />
                            )}
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </SectionCard>

            {/* Extend Dialog */}
            {order && (
              <ExtendDialog
                orderId={order.rentalOrderId}
                expectedRentalEndDate={order.expectedRentalEndDate}
                open={extendOpen}
                onOpenChange={setExtendOpen}
              />
            )}

            <Dialog
              open={cancelConfirmOpen}
              onOpenChange={setCancelConfirmOpen}
            >
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Xác nhận hủy đơn thuê</DialogTitle>
                  <DialogDescription>
                    Đơn sẽ chuyển sang trạng thái đã hủy và không thể tiếp tục
                    xử lý.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setCancelConfirmOpen(false)}
                    disabled={cancelOrder.isPending}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={confirmCancel}
                    disabled={cancelOrder.isPending}
                  >
                    {cancelOrder.isPending ? 'Đang xử lý…' : 'Xác nhận hủy đơn'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={pickupConfirmOpen}
              onOpenChange={setPickupConfirmOpen}
            >
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Xác nhận trả hàng sớm</DialogTitle>
                  <DialogDescription>
                    Sau khi xác nhận, nhân viên sẽ liên hệ và sắp xếp lịch thu hồi thiết bị theo địa chỉ giao hàng của bạn.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setPickupConfirmOpen(false)}
                    disabled={updateOrderStatus.isPending}
                  >
                    Hủy
                  </Button>
                  <Button
                    className='bg-orange-600 text-white hover:bg-orange-700'
                    onClick={confirmInUseToPendingPickup}
                    disabled={updateOrderStatus.isPending}
                  >
                    {updateOrderStatus.isPending
                      ? 'Đang xử lý…'
                      : 'Xác nhận trả hàng'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {order?.qrCode && (
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className='max-h-[90dvh] overflow-y-auto sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle className='flex items-center gap-2.5'>
                      <span className='flex size-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800'>
                        <QrCode className='size-5 text-zinc-700 dark:text-zinc-200' />
                      </span>
                      Mã QR đơn hàng
                    </DialogTitle>
                    <DialogDescription>
                      Hiển thị sau khi thanh toán thành công. Quét tại quầy hoặc
                      lưu ảnh khi cần.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='flex flex-col items-center gap-4 py-2'>
                    <img
                      src={order.qrCode}
                      alt='Mã QR thanh toán hoặc nhận hàng'
                      className='max-h-64 max-w-full rounded-xl border border-border/80 bg-white p-3 shadow-sm'
                    />
                    <a
                      href={order.qrCode}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm font-medium text-rose-600 underline-offset-2 hover:underline dark:text-rose-400'
                    >
                      Mở ảnh QR trong tab mới
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {rentalContract?.contractPdfUrl && (
              <Dialog
                open={contractDialogOpen}
                onOpenChange={setContractDialogOpen}
              >
                <DialogContent className='flex h-[92vh] w-[70vw] max-w-[96vw]! flex-col gap-0 p-0'>
                  <DialogHeader className='shrink-0 border-b border-border/60 px-5 py-4 text-left'>
                    <DialogTitle className='flex items-center gap-2.5'>
                      <span className='flex size-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800'>
                        <FileText className='size-5 text-slate-700 dark:text-slate-200' />
                      </span>
                      Hợp đồng thuê
                    </DialogTitle>
                    {/* <DialogDescription className='text-left'>
                      {rentalContract.contractNumber} · Phiên bản{' '}
                      {rentalContract.contractVersion}
                      {rentalContract.acceptedAt && (
                        <> · Xác nhận: {rentalContract.acceptedAt}</>
                      )}
                    </DialogDescription> */}
                  </DialogHeader>
                  <div className='min-h-0 flex-1 overflow-auto bg-muted/30 px-2 py-3 sm:px-4 sm:py-4'>
                    <PolicyPdfPreview
                      pdfUrl={rentalContract.contractPdfUrl}
                      className='mx-auto'
                    />
                  </div>
                  <DialogFooter className='shrink-0 border-t border-border/60 px-5 py-3 sm:justify-between'>
                    <p className='text-xs text-muted-foreground'>
                      Nếu không xem được trong khung, mở file PDF ở tab mới.
                    </p>
                    <a
                      href={rentalContract.contractPdfUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:underline dark:text-rose-400'
                    >
                      <ExternalLink className='size-4' />
                      Mở PDF
                    </a>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <PolicyConsentDialog
              open={paymentPolicyOpen}
              onOpenChange={setPaymentPolicyOpen}
              onAllConsented={() => void handlePaymentAfterConsent()}
            />

            {/* ── Two-column layout ── */}
            <div className='grid gap-5 lg:grid-cols-12 lg:gap-6'>
              {/* Left column */}
              <div className='space-y-5 lg:col-span-7'>
                {/* Products */}
                <SectionCard>
                  <SectionHeader
                    icon={<Package className='size-4' />}
                    iconBg='bg-rose-500'
                    title='Sản phẩm trong đơn'
                  />
                  <ul className='divide-y divide-border/60'>
                    {order.rentalOrderLines.map((line, idx) => (
                      <li
                        id={`order-line-${idx}`}
                        key={line.rentalOrderLineId}
                        className='flex gap-3.5 px-5 py-4'
                      >
                        <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground'>
                          {idx + 1}
                        </span>
                        <div className='min-w-0 flex-1 space-y-1.5 text-sm'>
                          <p className='font-semibold leading-snug text-foreground'>
                            {line.productNameSnapshot}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Serial{' '}
                            <span className='font-mono text-foreground/80'>
                              {line.inventorySerialNumber}
                            </span>
                          </p>
                          <div className='flex flex-wrap gap-1.5'>
                            <span className='rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
                              {line.rentalDurationDays} ngày
                            </span>
                            <span className='rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
                              {fmt.format(line.dailyPriceSnapshot)}/ngày
                            </span>
                          </div>
                          <div className='flex flex-wrap gap-4 border-t border-dashed border-border/60 pt-2 text-xs text-muted-foreground'>
                            <span>
                              Tạm tính:{' '}
                              <span className='font-semibold text-foreground tabular-nums'>
                                {fmt.format(
                                  line.dailyPriceSnapshot *
                                    line.rentalDurationDays,
                                )}
                              </span>
                            </span>
                            <span>
                              Cọc:{' '}
                              <span className='font-semibold text-foreground tabular-nums'>
                                {fmt.format(line.depositAmountSnapshot)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SectionCard>

                {/* Delivery */}
                <SectionCard>
                  <SectionHeader
                    icon={<MapPin className='size-4' />}
                    iconBg='bg-sky-500'
                    title='Giao hàng'
                  />
                  <div className='space-y-4 p-5 text-sm'>
                    <div className='flex gap-3 rounded-xl bg-muted/40 p-3'>
                      <Truck className='mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400' />
                      <div className='min-w-0 space-y-0.5'>
                        <p className='font-semibold text-foreground'>
                          {order.deliveryRecipientName ?? order.userAddress?.recipientName ?? '—'}
                        </p>
                        <p className='text-muted-foreground'>
                          {order.deliveryPhone ?? order.userAddress?.phoneNumber ?? '—'}
                        </p>
                      </div>
                    </div>
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {[
                        order.deliveryAddressLine ?? order.userAddress?.addressLine,
                        order.deliveryWard ?? order.userAddress?.ward,
                        order.deliveryDistrict ?? order.userAddress?.district,
                        order.deliveryCity ?? order.userAddress?.city,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {(order.expectedDeliveryDate ||
                      order.expectedRentalEndDate) && (
                      <div className='grid gap-2 sm:grid-cols-2'>
                        {order.expectedDeliveryDate && (
                          <div className='rounded-xl border border-border/60 bg-background/80 px-3 py-2.5'>
                            <p className='text-xs text-muted-foreground'>
                              Dự kiến giao
                            </p>
                            <p className='mt-0.5 text-sm font-semibold text-foreground'>
                              {formatDateShort(order.expectedDeliveryDate)}
                            </p>
                          </div>
                        )}
                        {order.expectedRentalEndDate && (
                          <div className='rounded-xl border border-border/60 bg-background/80 px-3 py-2.5'>
                            <p className='text-xs text-muted-foreground'>
                              Dự kiến trả
                            </p>
                            <p className='mt-0.5 text-sm font-semibold text-foreground'>
                              {formatDateShort(order.expectedRentalEndDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* Staff */}
                {(order.deliveryStaff ||
                  order.pickupStaff ||
                  order.hubName) && (
                  <SectionCard>
                    <SectionHeader
                      icon={<User className='size-4' />}
                      iconBg='bg-violet-500'
                      title='Nhân viên phụ trách'
                    />
                    <div className='space-y-4 p-5'>
                      {order.hubName && (
                        <p className='text-xs text-muted-foreground'>
                          Hub:{' '}
                          <span className='font-medium text-foreground'>
                            {order.hubName}
                          </span>
                        </p>
                      )}
                      {order.deliveryStaff && (
                        <div>
                          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Giao hàng
                          </p>
                          <StaffAvatar
                            staff={order.deliveryStaff}
                            role='Nhân viên giao hàng'
                          />
                        </div>
                      )}
                      {order.pickupStaff && (
                        <div>
                          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Thu hồi
                          </p>
                          <StaffAvatar
                            staff={order.pickupStaff}
                            role='Nhân viên thu hồi'
                          />
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Right column */}
              <div className='space-y-5 lg:col-span-5 lg:sticky lg:top-24 lg:self-start'>
                {overdueSuggestionEnabled && (
                  <SectionCard>
                    <SectionHeader
                      icon={<AlertCircle className='size-4' />}
                      iconBg='bg-amber-500'
                      title='Phí phạt quá hạn (tạm tính)'
                    />
                    <div className='space-y-3 p-5 text-sm'>
                      {overdueSuggestionLoading && (
                        <div className='space-y-2'>
                          <Skeleton className='h-4 w-full' />
                          <Skeleton className='h-4 w-2/3' />
                        </div>
                      )}
                      {!overdueSuggestionLoading && overdueSuggestion && (
                        <div className='space-y-3'>
                          <div
                            className={cn(
                              'rounded-lg border px-3 py-2 text-xs font-medium',
                              overdueSuggestion.overdue
                                ? 'border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100'
                                : 'border-border/60 bg-muted/40 text-muted-foreground',
                            )}
                          >
                            {overdueSuggestion.overdue
                              ? `Đơn đang quá hạn trả - ${overdueSuggestion.overdueDays} ngày`
                              : 'Chưa ghi nhận quá hạn theo dữ liệu hiện tại.'}
                          </div>
                          <dl className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2'>
                            <div className='flex justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5'>
                              <dt className='text-muted-foreground'>
                                Mức/ngày (tổng line)
                              </dt>
                              <dd className='font-medium tabular-nums text-foreground'>
                                {fmt.format(
                                  overdueSuggestion.dailyOverdueRateAmount,
                                )}
                              </dd>
                            </div>
                            <div className='flex justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5'>
                              <dt className='text-muted-foreground'>
                                Phạt quá hạn (tạm tính)
                              </dt>
                              <dd className='font-medium tabular-nums text-amber-700 dark:text-amber-300'>
                                {fmt.format(
                                  overdueSuggestion.provisionalOverduePenaltyAmount,
                                )}
                              </dd>
                            </div>
                            <div className='flex justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5'>
                              <dt className='text-muted-foreground'>
                                Phạt quá hạn (đã chốt)
                              </dt>
                              <dd className='font-medium tabular-nums text-foreground'>
                                {fmt.format(
                                  overdueSuggestion.finalOverduePenaltyAmount,
                                )}
                              </dd>
                            </div>
                            <div className='flex justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5'>
                              <dt className='text-muted-foreground'>
                                Phạt hỏng (đang lưu)
                              </dt>
                              <dd className='font-medium tabular-nums text-foreground'>
                                {fmt.format(
                                  overdueSuggestion.damagePenaltyAmount,
                                )}
                              </dd>
                            </div>
                            <div className='sm:col-span-2 flex justify-between gap-2 rounded-md border border-border/60 bg-background/80 px-2 py-2'>
                              <dt className='font-medium text-foreground'>
                                Tổng phạt gợi ý
                              </dt>
                              <dd className='font-semibold tabular-nums text-rose-600 dark:text-rose-400'>
                                {fmt.format(
                                  overdueSuggestion.suggestedTotalPenaltyAmount,
                                )}
                              </dd>
                            </div>
                            <div className='sm:col-span-2 flex justify-between gap-2 rounded-md border border-emerald-200/70 bg-emerald-50/60 px-2 py-2 dark:border-emerald-900/40 dark:bg-emerald-950/30'>
                              <dt className='text-emerald-900 dark:text-emerald-200'>
                                Hoàn cọc gợi ý (sau phạt)
                              </dt>
                              <dd className='font-semibold tabular-nums text-emerald-800 dark:text-emerald-200'>
                                {fmt.format(
                                  overdueSuggestion.suggestedDepositRefundAmount,
                                )}
                              </dd>
                            </div>
                          </dl>
                          <p className='text-[11px] leading-relaxed text-muted-foreground'>
                            Số liệu tham khảo; mức chốt cuối do nhân viên xác
                            nhận qua cập nhật phạt.
                          </p>
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}

                {/* Payment summary */}
                <SectionCard>
                  <SectionHeader
                    icon={<CreditCard className='size-4' />}
                    iconBg='bg-rose-600'
                    title='Tổng thanh toán'
                  />
                  <div className='space-y-2.5 p-5 text-sm'>
                    <div className='flex justify-between gap-2'>
                      <span className='text-muted-foreground'>
                        Tổng tiền thuê
                      </span>
                      <span className='font-medium tabular-nums text-foreground'>
                        {fmt.format(order.rentalSubtotalAmount)}
                      </span>
                    </div>

                    {order.voucherDiscountAmount > 0 && (
                      <div className='flex justify-between gap-2'>
                        <span className='text-muted-foreground'>
                          Giảm voucher
                          {order.voucherCodeSnapshot && (
                            <span className='ml-1 font-mono text-rose-600'>
                              ({order.voucherCodeSnapshot})
                            </span>
                          )}
                        </span>
                        <span className='font-medium tabular-nums text-rose-600'>
                          −{fmt.format(order.voucherDiscountAmount)}
                        </span>
                      </div>
                    )}

                    <div className='flex justify-between gap-2'>
                      <span className='text-muted-foreground'>
                        Tiền cọc (hold)
                      </span>
                      <span className='font-medium tabular-nums text-foreground'>
                        {fmt.format(order.depositHoldAmount)}
                      </span>
                    </div>

                    {order.totalPaidAmount > 0 && (
                      <div className='flex justify-between gap-2'>
                        <span className='text-muted-foreground'>
                          Đã thanh toán
                        </span>
                        <span className='font-medium tabular-nums text-green-600'>
                          {fmt.format(order.totalPaidAmount)}
                        </span>
                      </div>
                    )}

                    {order.provisionalOverduePenaltyAmount != null && (
                      <div className='flex justify-between gap-2'>
                        <span className='text-muted-foreground'>
                          Phạt quá hạn (tạm tính)
                        </span>
                        <span
                          className={cn(
                            'font-medium tabular-nums',
                            order.provisionalOverduePenaltyAmount > 0
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-muted-foreground',
                          )}
                        >
                          {fmt.format(order.provisionalOverduePenaltyAmount)}
                        </span>
                      </div>
                    )}

                    {order.penaltyChargeAmount !== null &&
                      order.penaltyChargeAmount > 0 && (
                        <div className='flex justify-between gap-2'>
                          <span className='text-muted-foreground'>
                            Phí phạt (đã ghi nhận)
                          </span>
                          <span className='font-medium tabular-nums text-red-600'>
                            +{fmt.format(order.penaltyChargeAmount)}
                          </span>
                        </div>
                      )}

                    <div className='mt-1 rounded-xl border border-rose-200/70 bg-rose-50/60 px-4 py-3 dark:border-rose-800/50 dark:bg-rose-950/30'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <span className='font-semibold text-foreground'>
                          Cần thanh toán
                        </span>
                        <span className='text-xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400'>
                          {fmt.format(order.totalPayableAmount)}
                        </span>
                      </div>
                    </div>

                    {order.depositRefundAmount !== null &&
                      order.depositRefundAmount > 0 && (
                        <div className='rounded-lg border border-green-200/80 bg-green-50/80 p-3 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-200'>
                          Hoàn cọc: {fmt.format(order.depositRefundAmount)}
                        </div>
                      )}
                  </div>
                </SectionCard>

                {/* Timeline */}
                <SectionCard>
                  <SectionHeader
                    icon={<Clock3 className='size-4' />}
                    iconBg='bg-slate-500'
                    title='Mốc thời gian'
                  />
                  <div className='relative p-5'>
                    <div
                      className='absolute bottom-5 left-[29px] top-5 w-px bg-border/80'
                      aria-hidden
                    />
                    <ul className='relative space-y-4 text-sm'>
                      {[
                        { label: 'Đặt đơn', date: order.placedAt },
                        {
                          label: 'Dự kiến giao',
                          date: order.expectedDeliveryDate,
                        },
                        { label: 'Giao thực tế', date: order.actualDeliveryAt },
                        {
                          label: 'Bắt đầu thuê',
                          date: order.actualRentalStartAt,
                        },
                        {
                          label: 'Kết thúc thuê',
                          date: order.actualRentalEndAt,
                        },
                        { label: 'Thu hồi', date: order.pickedUpAt },
                      ]
                        .filter((s) => s.date)
                        .map((s) => (
                          <li key={s.label} className='flex items-start gap-3'>
                            <span className='relative z-1 mt-1 size-2 shrink-0 rounded-full bg-rose-500 ring-4 ring-card' />
                            <div className='min-w-0 flex-1'>
                              <p className='text-xs text-muted-foreground'>
                                {s.label}
                              </p>
                              <p className='font-semibold text-foreground'>
                                {formatDateShort(s.date!)}
                              </p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
