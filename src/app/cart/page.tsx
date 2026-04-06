'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HighlightText } from '@/components/ui/highlight-text';
import { Magnetic } from '@/components/ui/magnetic';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { ShinyText } from '@/components/common/shiny-text';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCartQuery,
  useRemoveCartLine,
  useUpdateCartLineQuantity,
  useClearCart,
} from '@/hooks/api/use-cart';
import type { CartLineResponse } from '@/api/cart';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/* ─── Loading skeleton row ─────────────────────────────────────────────────── */

function CartLineSkeleton() {
  return (
    <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5'>
      <Skeleton className='size-36 shrink-0 rounded-xl' />
      <div className='flex-1 space-y-3'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex gap-2'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-5 w-20' />
        </div>
        <div className='flex items-center justify-between pt-2'>
          <Skeleton className='h-9 w-28 rounded-xl' />
          <Skeleton className='h-8 w-24' />
        </div>
      </div>
    </div>
  );
}

/* ─── Cart line row ───────────────────────────────────────────────────────── */

function CartLineRow({
  line,
  index,
  onRemove,
  onUpdateQty,
  isRemoving,
  isUpdating,
}: {
  line: CartLineResponse;
  index: number;
  onRemove: (cartLineId: string) => void;
  onUpdateQty: (cartLineId: string, quantity: number) => void;
  isRemoving: boolean;
  isUpdating: boolean;
}) {
  const days = line.rentalDurationDays;
  const qty = line.quantity;
  const lineTotal = line.lineTotal;

  const isMutating = isRemoving || isUpdating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <SpotlightCard
        className='rounded-2xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm dark:bg-card/80'
        spotlightColor='rgba(254, 20, 81, 0.14)'
      >
        <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5'>
          {/* Image */}
          <Link
            href={`/product/${line.productId}`}
            className='group relative mx-auto aspect-square w-full max-w-[148px] shrink-0 overflow-hidden rounded-xl border border-rose-500/20 bg-muted/50 shadow-inner ring-1 ring-rose-500/10 transition-transform duration-300 hover:scale-[1.02] sm:mx-0'
          >
            {line.productImageUrl ? (
              <img
                src={line.productImageUrl}
                alt={line.productName}
                className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
            ) : (
              <div className='flex size-full items-center justify-center text-muted-foreground'>
                <ShoppingBag className='size-10' />
              </div>
            )}
          </Link>

          {/* Info */}
          <div className='min-w-0 flex-1 space-y-3'>
            <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
              <div>
                <Link
                  href={`/product/${line.productId}`}
                  className='text-base font-semibold leading-snug text-foreground transition-colors hover:text-rose-600 dark:hover:text-rose-400'
                >
                  {line.productName}
                </Link>

                <div className='mt-2 flex flex-wrap gap-2'>
                  <Badge
                    variant='outline'
                    className='rounded-lg border-rose-500/30 text-xs font-normal text-rose-700 dark:text-rose-300'
                  >
                    {days} ngày
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='rounded-lg text-xs font-normal'
                  >
                    {formatter.format(line.dailyPrice)}₫ / ngày
                  </Badge>
                </div>
              </div>

              {/* Delete */}
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='shrink-0 self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 sm:self-start'
                aria-label='Xóa khỏi giỏ'
                disabled={isMutating}
                onClick={() => onRemove(line.cartLineId)}
              >
                <Trash2
                  className={`size-4 ${isRemoving ? 'animate-pulse' : ''}`}
                />
              </Button>
            </div>

            {/* Quantity + Price */}
            <div className='flex flex-col gap-4 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-1 rounded-xl border border-input bg-muted/30 p-1 dark:bg-muted/20'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='size-9 rounded-lg p-0'
                  disabled={qty <= 1 || isMutating}
                  onClick={() => onUpdateQty(line.cartLineId, qty - 1)}
                >
                  <Minus className='size-4' />
                </Button>
                <span
                  className={`min-w-9 text-center text-sm font-bold tabular-nums ${isUpdating ? 'opacity-60' : ''}`}
                >
                  {qty}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='size-9 rounded-lg p-0'
                  disabled={isMutating}
                  onClick={() => onUpdateQty(line.cartLineId, qty + 1)}
                >
                  <Plus className='size-4' />
                </Button>
              </div>

              <div className='min-w-0 max-w-full self-stretch overflow-x-auto sm:max-w-none sm:shrink-0 sm:self-center'>
                <div className='ml-auto inline-block min-w-min space-y-1 text-right text-sm'>
                  <div className='whitespace-nowrap text-muted-foreground'>
                    Thuê ({qty} × {days} ngày):
                  </div>
                  <div className='whitespace-nowrap pt-1 text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400'>
                    {formatter.format(lineTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

/* ─── Summary panel skeleton ───────────────────────────────────────────────── */

function SummarySkeleton() {
  return (
    <div className='space-y-5 p-5 sm:p-6'>
      <div className='flex items-center gap-2'>
        <Skeleton className='size-5 w-5' />
        <Skeleton className='h-6 w-36' />
      </div>
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='flex justify-between'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-20' />
          </div>
        ))}
        <div className='border-t border-border pt-4'>
          <div className='flex justify-between'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-8 w-28' />
          </div>
        </div>
      </div>
      <Skeleton className='h-12 w-full rounded-xl' />
      <Skeleton className='h-11 w-full rounded-xl' />
    </div>
  );
}

/* ─── Cart page ────────────────────────────────────────────────────────────── */

export default function CartPage() {
  const { data: cart, isLoading, isError } = useCartQuery();
  const removeMutation = useRemoveCartLine();
  const updateQtyMutation = useUpdateCartLineQuantity();
  const clearMutation = useClearCart();

  const lines: CartLineResponse[] = cart?.cartLines ?? [];

  const totals = useMemo(() => {
    const subtotal = lines.reduce((acc, l) => acc + l.lineTotal, 0);
    return { subtotal, grandTotal: subtotal };
  }, [lines]);

  const totalQty = useMemo(
    () => lines.reduce((a, l) => a + l.quantity, 0),
    [lines],
  );

  const isMutating = removeMutation.isPending || clearMutation.isPending;

  const handleRemove = (cartLineId: string) => {
    removeMutation.mutate(cartLineId);
  };

  const handleUpdateQty = (cartLineId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQtyMutation.mutate({ cartLineId, quantity });
  };

  const handleClear = () => {
    if (confirm('Xóa toàn bộ giỏ hàng?')) {
      clearMutation.mutate();
    }
  };

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-white font-sans dark:bg-surface-base'>
      <div className='relative mx-auto w-full max-w-7xl px-3 pb-16 pt-20 sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
        {/* Breadcrumb */}
        <nav className='mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm'>
          <ol className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>
            <li>
              <Link
                href='/'
                className='font-medium text-rose-600 transition-colors hover:underline dark:text-rose-400'
              >
                Trang chủ
              </Link>
            </li>
            <li className='text-border'>/</li>
            <li className='font-semibold text-foreground'>Giỏ hàng</li>
          </ol>
        </nav>

        {/* Header */}
        <motion.header
          className='mb-8 sm:mb-10'
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-10 w-64' />
              <Skeleton className='h-5 w-80' />
            </div>
          ) : (
            <>
              <div className='flex flex-wrap items-end gap-3 gap-y-2'>
                <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
                  Giỏ hàng{' '}
                  <HighlightText
                    variant='marker'
                    color='destructive'
                    className='font-extrabold'
                  >
                    cho thuê
                  </HighlightText>
                </h1>
                {lines.length > 0 && (
                  <Badge className='border-0 bg-rose-600 text-white shadow-md dark:bg-rose-500'>
                    {totalQty} sản phẩm
                  </Badge>
                )}
              </div>
              <p className='mt-2 max-w-xl text-sm text-muted-foreground sm:text-base'>
                <ShinyText className='font-medium'>Kiểm tra đơn thuê</ShinyText>
                {' — '}
                trước khi tiến hành thanh toán. Giao nhanh toàn quốc.
                <Truck className='ml-1 inline size-4 align-text-bottom text-rose-600 dark:text-rose-400' />
              </p>
            </>
          )}
        </motion.header>

        {/* Error */}
        {isError && (
          <SpotlightCard
            className='rounded-3xl border border-destructive/30 bg-destructive/5 p-12 text-center shadow-lg'
            spotlightColor='rgba(254, 20, 81, 0.1)'
          >
            <AlertCircle className='mx-auto size-12 text-destructive' />
            <p className='mt-4 text-lg font-semibold text-foreground'>
              Không tải được giỏ hàng
            </p>
            <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
              Vui lòng đăng nhập hoặc thử lại sau.
            </p>
            <Button
              className='mt-6 rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700'
              render={<Link href='/login?redirect=/cart' />}
            >
              Đăng nhập
            </Button>
          </SpotlightCard>
        )}

        {/* Empty (not loading, no error, no lines) */}
        {!isLoading && !isError && lines.length === 0 && (
          <SpotlightCard
            className='rounded-3xl border border-dashed border-border/80 bg-card/80 p-12 text-center shadow-lg backdrop-blur-md dark:bg-card/60'
            spotlightColor='rgba(254, 20, 81, 0.15)'
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className='mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500/20 to-rose-400/20 ring-1 ring-rose-500/20'>
                <ShoppingBag className='size-10 text-rose-600 dark:text-rose-400' />
              </div>
              <p className='mt-6 text-xl font-bold text-foreground'>
                Giỏ hàng trống
              </p>
              <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
                Thêm thiết bị từ trang chi tiết sản phẩm để bắt đầu thuê.
              </p>
              <Magnetic intensity={0.35} range={120}>
                <Button
                  className='mt-8 rounded-xl bg-rose-600 px-8 font-semibold text-white shadow-lg hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600'
                  render={<Link href='/' />}
                >
                  Khám phá sản phẩm
                </Button>
              </Magnetic>
            </motion.div>
          </SpotlightCard>
        )}

        {/* Has items OR loading */}
        {(lines.length > 0 || isLoading) && !isError && (
          <div className='grid gap-8 lg:grid-cols-12 lg:gap-10'>
            {/* Cart lines */}
            <div className='space-y-4 lg:col-span-7'>
              <SpotlightCard
                className='rounded-2xl border border-border/60 bg-card/70 shadow-md backdrop-blur-sm dark:bg-card/50'
                spotlightColor='rgba(254, 20, 81, 0.1)'
              >
                <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-6'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground'>
                      Đơn của bạn
                    </span>
                    {isLoading ? (
                      <Skeleton className='h-5 w-16' />
                    ) : (
                      <Badge variant='secondary' className='rounded-full'>
                        {lines.length} dòng
                      </Badge>
                    )}
                  </div>
                  {!isLoading && lines.length > 0 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                      disabled={isMutating}
                      onClick={handleClear}
                    >
                      Xóa tất cả
                    </Button>
                  )}
                </div>

                <div className='space-y-4 p-4 sm:p-6'>
                  {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <CartLineSkeleton key={i} />
                      ))
                    : lines.map((line, index) => (
                        <CartLineRow
                          key={line.cartLineId}
                          line={line}
                          index={index}
                          onRemove={handleRemove}
                          onUpdateQty={handleUpdateQty}
                          isRemoving={
                            removeMutation.isPending &&
                            removeMutation.variables === line.cartLineId
                          }
                          isUpdating={
                            updateQtyMutation.isPending &&
                            updateQtyMutation.variables?.cartLineId ===
                              line.cartLineId
                          }
                        />
                      ))}
                </div>
              </SpotlightCard>
            </div>

            {/* Summary */}
            <div className='lg:col-span-5'>
              <div className='lg:sticky lg:top-28'>
                <SpotlightCard
                  className='rounded-2xl border border-rose-500/20 bg-card/90 shadow-xl backdrop-blur-md dark:border-rose-500/25 dark:bg-card/80'
                  spotlightColor='rgba(254, 20, 81, 0.18)'
                >
                  {isLoading ? (
                    <SummarySkeleton />
                  ) : (
                    <div className='space-y-5 p-5 sm:p-6'>
                      <div className='flex items-center gap-2'>
                        <Sparkles className='size-5 text-rose-600 dark:text-rose-400' />
                        <h2 className='text-lg font-bold text-foreground'>
                          Tóm tắt thanh toán
                        </h2>
                      </div>

                      <div className='space-y-3 text-sm'>
                        <div className='flex items-baseline justify-between gap-3'>
                          <span className='text-muted-foreground'>
                            Tiền thuê ({totalQty} sản phẩm)
                          </span>
                          <span className='font-medium tabular-nums text-foreground'>
                            {formatter.format(totals.subtotal)}
                          </span>
                        </div>
                        <div className='border-t border-border/80 pt-4'>
                          <div className='flex items-baseline justify-between gap-3'>
                            <span className='text-base font-bold text-foreground'>
                              Tổng thanh toán
                            </span>
                            <span className='text-2xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400'>
                              {formatter.format(totals.grandTotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs leading-relaxed text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100'>
                        Giá chưa bao gồm phí vận chuyển và 8% VAT. Tiền cọc (nếu
                        có) sẽ hiển thị ở bước thanh toán.
                      </div>

                      <Magnetic intensity={0.3} range={100}>
                        <Button
                          className='h-12 w-full rounded-xl bg-rose-600 text-base font-bold text-white shadow-lg hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600'
                          disabled={isMutating || lines.length === 0}
                          render={<Link href='/checkout' />}
                        >
                          Tiến hành thuê
                        </Button>
                      </Magnetic>

                      <Button
                        variant='outline'
                        className='w-full rounded-xl border-rose-500/30'
                        disabled={isMutating}
                        render={<Link href='/' />}
                      >
                        Tiếp tục xem sản phẩm
                      </Button>
                    </div>
                  )}
                </SpotlightCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
