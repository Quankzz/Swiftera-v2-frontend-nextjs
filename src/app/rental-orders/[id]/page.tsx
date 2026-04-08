'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ListOrdered,
  Truck,
  User,
  AlertCircle,
  Package,
  Loader2,
  Ban,
  PlusCircle,
  CreditCard,
  CalendarPlus,
  Star,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpotlightCard } from '@/components/common/spotlight-card';
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
} from '@/hooks/api/use-rental-orders';
import { useInitiatePayment } from '@/hooks/api/use-payments';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { useRentalCartStore } from '@/stores/rental-cart-store';
import { useCartAnimationStore } from '@/stores/cart-animation-store';
import { cn } from '@/lib/utils';
import {
  RENTAL_ORDER_STATUS_LABELS,
  RENTAL_ORDER_STATUS_COLORS,
} from '@/api/rentalOrderApi';
import type {
  RentalOrderStatus,
  RentalOrderStaffSummary,
} from '@/api/rentalOrderApi';

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
          className='size-10 shrink-0 rounded-full object-cover ring-2 ring-border'
        />
      ) : (
        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'>
          <User className='size-5' />
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
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-40' />
        </div>
        <Skeleton className='h-6 w-24' />
      </div>
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className='space-y-3 rounded-xl border border-border/60 bg-card/85 p-5'
            >
              <Skeleton className='h-5 w-32' />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className='space-y-1'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-4 w-40' />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className='h-40 w-full rounded-xl' />
          ))}
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
  const id = typeof params?.id === 'string' ? params.id : '';
  const [extendOpen, setExtendOpen] = useState(false);
  const [reorderState, setReorderState] = useState<
    'idle' | 'adding' | 'success'
  >('idle');

  const { data: order, isLoading, isError } = useRentalOrderQuery(id);
  const addToCart = useRentalCartStore((s) => s.addLine);
  const currentUser = useAuthStore((s) => s.user);
  const addFlyingItem = useCartAnimationStore((s) => s.addFlyingItem);

  function handleReorder() {
    if (!order || reorderState !== 'idle') return;

    const btn = document.getElementById('reorder-btn');
    const firstLine = document.getElementById('order-line-0');

    const fromRect = firstLine
      ? firstLine.getBoundingClientRect()
      : btn
        ? btn.getBoundingClientRect()
        : new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 80, 60);

    addFlyingItem({
      id: `reorder-${Date.now()}`,
      imageUrl: '',
      fromRect,
    });

    setReorderState('adding');
    setTimeout(() => {
      for (const line of order.rentalOrderLines) {
        addToCart({
          productId: line.productId,
          name: line.productNameSnapshot,
          image: '',
          sku: line.inventorySerialNumber,
          durationId: String(line.rentalDurationDays),
          durationLabel: `${line.rentalDurationDays} ngày`,
          rentalPricePerUnit: line.dailyPriceSnapshot,
          quantity: 1,
          depositPerUnit: line.depositAmountSnapshot,
          voucher: null,
        });
      }
      setReorderState('success');
      setTimeout(() => setReorderState('idle'), 2500);
    }, 400);
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

  function handleCancel() {
    if (!order) return;
    if (!window.confirm('Bạn có chắc muốn hủy đơn thuê này?')) return;
    cancelOrder.mutate(order.rentalOrderId);
  }

  function handlePayment() {
    if (!order) return;
    initiatePayment.mutate(order.rentalOrderId);
  }

  const isExtendable =
    order && EXTENDABLE_STATUSES.includes(order.status as RentalOrderStatus);

  if (isError) {
    return (
      <div className='min-h-screen bg-white dark:bg-surface-base px-3 pb-16 pt-24 font-sans sm:pt-28'>
        <div className='mx-auto max-w-lg text-center'>
          <AlertCircle className='mx-auto size-12 text-destructive' />
          <p className='mt-4 text-lg font-semibold text-foreground'>
            Không tải được đơn thuê
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Đơn có thể không tồn tại hoặc bạn chưa đăng nhập.
          </p>
          <Button
            className='mt-6'
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
    <div className='min-h-screen bg-white dark:bg-surface-base px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
      <div className='mx-auto max-w-4xl'>
        {/* Back */}
        <Button
          variant='ghost'
          size='sm'
          className='mb-4 gap-1 text-muted-foreground'
          render={<Link href='/rental-orders' />}
        >
          <ArrowLeft className='size-4' />
          Tất cả đơn thuê
        </Button>

        {isLoading && <DetailSkeleton />}

        {order && (
          <>
            {/* Header */}
            <div className='flex flex-wrap items-end justify-between gap-3'>
              <div>
                <p className='font-mono text-sm font-bold text-rose-600 dark:text-rose-400'>
                  #{order.rentalOrderId.slice(0, 8).toUpperCase()}
                </p>
                <h1 className='mt-1 text-2xl font-extrabold text-foreground'>
                  Chi tiết đơn thuê
                </h1>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Đặt lúc {formatDate(order.placedAt)}
                </p>
                {order.createdBy && (
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    Mã đơn: {order.createdBy}
                  </p>
                )}
              </div>
              <Badge
                className={`rounded-full px-3 py-1 text-sm font-semibold ${RENTAL_ORDER_STATUS_COLORS[order.status as RentalOrderStatus]}`}
              >
                {RENTAL_ORDER_STATUS_LABELS[order.status as RentalOrderStatus]}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {/* Thanh toán */}
              {order.status === 'PENDING_PAYMENT' && (
                <Button
                  size='sm'
                  className='gap-1.5 bg-rose-600 text-white hover:bg-rose-700'
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
              )}

              {/* Gia hạn */}
              {isExtendable && (
                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1.5'
                  onClick={() => setExtendOpen(true)}
                >
                  <CalendarPlus className='size-4' />
                  Gia hạn
                </Button>
              )}

              {/* Viết đánh giá — chỉ hiện khi đơn COMPLETED */}
              {order.status === 'COMPLETED' &&
                order.rentalOrderLines.length > 0 && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='gap-1.5'
                    render={
                      <Link
                        href={`/product/${order.rentalOrderLines[0].productId}#reviews`}
                      />
                    }
                  >
                    <Star className='size-4' />
                    Viết đánh giá
                  </Button>
                )}

              {/* Thuê lại — chỉ hiện khi đơn COMPLETED */}
              {order.status === 'COMPLETED' &&
                order.rentalOrderLines.length > 0 && (
                  <Button
                    id='reorder-btn'
                    size='sm'
                    className={`
                      gap-1.5 transition-all duration-300
                      ${
                        reorderState === 'success'
                          ? 'bg-green-600 hover:bg-green-700 text-white scale-105 shadow-lg shadow-green-500/30'
                          : reorderState === 'adding'
                            ? 'bg-rose-400 text-white cursor-wait animate-pulse'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }
                    `}
                    onClick={handleReorder}
                    disabled={reorderState !== 'idle'}
                  >
                    {reorderState === 'adding' ? (
                      <>
                        <Loader2 className='size-4 animate-spin' />
                        Đang thêm...
                      </>
                    ) : reorderState === 'success' ? (
                      <span className='flex items-center gap-1.5'>
                        <Check className='size-4' />
                        Đã thêm vào giỏ!
                      </span>
                    ) : (
                      <>
                        <RotateCcw className='size-4' />
                        Thuê lại
                      </>
                    )}
                  </Button>
                )}

              {/* Hủy đơn */}
              {order.status === 'PENDING_PAYMENT' && (
                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30'
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

            {/* Extend Dialog */}
            {order && (
              <ExtendDialog
                orderId={order.rentalOrderId}
                expectedRentalEndDate={order.expectedRentalEndDate}
                open={extendOpen}
                onOpenChange={setExtendOpen}
              />
            )}

            {/* Grid */}
            <div className='mt-8 grid gap-6 lg:grid-cols-2 lg:gap-10'>
              {/* Left column */}
              <div className='space-y-5'>
                {/* Products */}
                <SpotlightCard
                  className='rounded-2xl border border-border/60 bg-card/85 p-5 dark:bg-card/75'
                  spotlightColor='rgba(254, 20, 81, 0.08)'
                >
                  <div className='flex items-center gap-2 font-bold text-foreground'>
                    <Package className='size-5 text-rose-600 dark:text-rose-400' />
                    Sản phẩm thuê
                  </div>
                  <ul className='mt-4 space-y-4'>
                    {order.rentalOrderLines.map((line, idx) => (
                      <li
                        id={`order-line-${idx}`}
                        key={line.rentalOrderLineId}
                        className='border-b border-border/50 pb-3 text-sm last:border-0 last:pb-0'
                      >
                        <p className='font-medium text-foreground'>
                          {line.productNameSnapshot}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Serial: {line.inventorySerialNumber}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {line.rentalDurationDays} ngày ·{' '}
                          {fmt.format(line.dailyPriceSnapshot)} / ngày
                        </p>
                        <p className='mt-1 tabular-nums text-muted-foreground'>
                          Thuê:{' '}
                          <span className='font-semibold text-foreground'>
                            {fmt.format(
                              line.dailyPriceSnapshot * line.rentalDurationDays,
                            )}
                          </span>
                          {' · '}
                          Cọc:{' '}
                          <span className='font-semibold text-foreground'>
                            {fmt.format(line.depositAmountSnapshot)}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>

                {/* Delivery */}
                <SpotlightCard
                  className='rounded-2xl border border-border/60 bg-card/85 p-5 dark:bg-card/75'
                  spotlightColor='rgba(254, 20, 81, 0.08)'
                >
                  <div className='flex items-center gap-2 font-bold text-foreground'>
                    <Truck className='size-5 text-rose-600 dark:text-rose-400' />
                    Địa chỉ giao hàng
                  </div>
                  <div className='mt-4 space-y-1 text-sm'>
                    <p className='font-medium text-foreground'>
                      {order.deliveryRecipientName}
                    </p>
                    <p className='text-muted-foreground'>
                      {order.deliveryPhone}
                    </p>
                    <p className='text-muted-foreground'>
                      {[
                        order.deliveryAddressLine,
                        order.deliveryWard,
                        order.deliveryDistrict,
                        order.deliveryCity,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {order.expectedDeliveryDate && (
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Dự kiến giao:{' '}
                        <span className='font-medium text-foreground'>
                          {formatDateShort(order.expectedDeliveryDate)}
                        </span>
                      </p>
                    )}
                    {order.expectedRentalEndDate && (
                      <p className='text-xs text-muted-foreground'>
                        Dự kiến trả:{' '}
                        <span className='font-medium text-foreground'>
                          {formatDateShort(order.expectedRentalEndDate)}
                        </span>
                      </p>
                    )}
                  </div>
                </SpotlightCard>

                {/* Staff */}
                {(order.deliveryStaff ||
                  order.pickupStaff ||
                  order.hubName) && (
                  <SpotlightCard
                    className='rounded-2xl border border-border/60 bg-card/85 p-5 dark:bg-card/75'
                    spotlightColor='rgba(254, 20, 81, 0.08)'
                  >
                    <div className='flex items-center gap-2 font-bold text-foreground'>
                      <User className='size-5 text-rose-600 dark:text-rose-400' />
                      Nhân viên phụ trách
                    </div>
                    {order.hubName && (
                      <p className='mt-3 text-xs text-muted-foreground'>
                        Hub:{' '}
                        <span className='font-medium text-foreground'>
                          {order.hubName}
                        </span>
                      </p>
                    )}
                    <div className='mt-4 space-y-4'>
                      {order.deliveryStaff && (
                        <div>
                          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Giao hàng
                          </p>
                          <div className='mt-2'>
                            <StaffAvatar
                              staff={order.deliveryStaff}
                              role='Nhân viên giao hàng'
                            />
                          </div>
                        </div>
                      )}
                      {order.pickupStaff && (
                        <div>
                          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Thu hồi
                          </p>
                          <div className='mt-2'>
                            <StaffAvatar
                              staff={order.pickupStaff}
                              role='Nhân viên thu hồi'
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </SpotlightCard>
                )}
              </div>

              {/* Right column */}
              <div className='space-y-5'>
                {/* Payment summary */}
                <SpotlightCard
                  className='rounded-2xl border border-rose-500/20 bg-card/90 p-5 dark:border-rose-500/25 dark:bg-card/80'
                  spotlightColor='rgba(254, 20, 81, 0.18)'
                >
                  <div className='flex items-center gap-2 font-bold text-foreground'>
                    <ListOrdered className='size-5 text-rose-600 dark:text-rose-400' />
                    Thanh toán
                  </div>
                  <div className='mt-4 space-y-2 text-sm'>
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
                            <span className='ml-1 text-rose-600'>
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
                    {order.penaltyChargeAmount !== null &&
                      order.penaltyChargeAmount > 0 && (
                        <div className='flex justify-between gap-2'>
                          <span className='text-muted-foreground'>
                            Phí phạt
                          </span>
                          <span className='font-medium tabular-nums text-red-600'>
                            +{fmt.format(order.penaltyChargeAmount)}
                          </span>
                        </div>
                      )}
                    <div className='border-t border-border pt-3'>
                      <div className='flex justify-between gap-2'>
                        <span className='text-base font-bold text-foreground'>
                          Cần thanh toán
                        </span>
                        <span className='text-xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400'>
                          {fmt.format(order.totalPayableAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {order.depositRefundAmount !== null &&
                    order.depositRefundAmount > 0 && (
                      <div className='mt-3 rounded-lg border border-green-200 bg-green-50/80 p-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100'>
                        Tiền cọc hoàn: {fmt.format(order.depositRefundAmount)}
                      </div>
                    )}
                </SpotlightCard>

                {/* Rental timeline */}
                <SpotlightCard
                  className='rounded-2xl border border-border/60 bg-card/85 p-5 dark:bg-card/75'
                  spotlightColor='rgba(254, 20, 81, 0.06)'
                >
                  <div className='flex items-center gap-2 font-bold text-foreground'>
                    <ListOrdered className='size-5 text-rose-600 dark:text-rose-400' />
                    Tiến trình thuê
                  </div>
                  <div className='mt-4 space-y-3 text-sm'>
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
                      { label: 'Kết thúc thuê', date: order.actualRentalEndAt },
                      { label: 'Thu hồi', date: order.pickedUpAt },
                    ]
                      .filter((s) => s.date)
                      .map((s) => (
                        <div
                          key={s.label}
                          className='flex justify-between gap-2'
                        >
                          <span className='text-muted-foreground'>
                            {s.label}
                          </span>
                          <span className='font-medium text-foreground'>
                            {formatDateShort(s.date!)}
                          </span>
                        </div>
                      ))}
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
