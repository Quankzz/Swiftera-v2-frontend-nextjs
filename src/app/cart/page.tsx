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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HighlightText } from '@/components/ui/highlight-text';
import { NumberCounter } from '@/components/ui/number-counter';
import { Magnetic } from '@/components/ui/magnetic';

import { SpotlightCard } from '@/components/common/spotlight-card';
import { ShinyText } from '@/components/common/shiny-text';
import {
  computeCartTotals,
  lineDepositTotal,
  lineRentalAfterVoucher,
  useRentalCartStore,
  type RentalCartLine,
} from '@/stores/rental-cart-store';
import { computeVoucherDiscount } from '@/lib/rental-voucher';

function CartLineRow({ line, index }: { line: RentalCartLine; index: number }) {
  const updateQuantity = useRentalCartStore((s) => s.updateQuantity);
  const removeLine = useRentalCartStore((s) => s.removeLine);

  const sub = line.rentalPricePerUnit * line.quantity;
  const discount = line.voucher ? computeVoucherDiscount(sub, line.voucher) : 0;
  const rentalAfter = lineRentalAfterVoucher(line);
  const dep = lineDepositTotal(line);

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
        spotlightColor='rgba(45, 212, 191, 0.14)'
      >
        <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5'>
          <Link
            href={`/product/${line.productId}`}
            className='group relative mx-auto aspect-square w-full max-w-[148px] shrink-0 overflow-hidden rounded-xl border border-teal-500/20 bg-muted/50 shadow-inner ring-1 ring-teal-500/10 transition-transform duration-300 hover:scale-[1.02] sm:mx-0'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={line.image}
              alt=''
              className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </Link>

          <div className='min-w-0 flex-1 space-y-3'>
            <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
              <div>
                <Link
                  href={`/product/${line.productId}`}
                  className='text-base font-semibold leading-snug text-foreground transition-colors hover:text-teal-600 dark:hover:text-teal-400'
                >
                  {line.name}
                </Link>
                <p className='mt-1 font-mono text-xs text-muted-foreground'>
                  SKU: {line.sku}
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {line.variantLabel && (
                    <Badge
                      variant='secondary'
                      className='rounded-lg text-xs font-normal'
                    >
                      {line.variantLabel}
                    </Badge>
                  )}
                  <Badge
                    variant='outline'
                    className='rounded-lg border-teal-500/30 text-xs font-normal text-teal-700 dark:text-teal-300'
                  >
                    {line.durationLabel}
                  </Badge>
                </div>
                {line.voucher && discount > 0 && (
                  <p className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400'>
                    <Sparkles className='size-3.5' />
                    {line.voucher.code} · −{discount.toLocaleString('vi-VN')}₫
                  </p>
                )}
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                className='shrink-0 self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:self-start'
                aria-label='Xóa khỏi giỏ'
                onClick={() => removeLine(line.lineId)}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>

            <div className='flex flex-col gap-4 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-1 rounded-xl border border-input bg-muted/30 p-1 dark:bg-muted/20'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='size-9 rounded-lg p-0'
                  onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                >
                  <Minus className='size-4' />
                </Button>
                <span className='min-w-9 text-center text-sm font-bold tabular-nums'>
                  {line.quantity}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='size-9 rounded-lg p-0'
                  onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                >
                  <Plus className='size-4' />
                </Button>
              </div>
              {/* Giá: nowrap + scroll ngang nếu cực dài (mobile) */}
              <div className='min-w-0 max-w-full self-stretch overflow-x-auto sm:max-w-none sm:shrink-0 sm:self-center'>
                <div className='ml-auto inline-block min-w-min space-y-1 text-right text-sm'>
                  <div className='whitespace-nowrap text-muted-foreground'>
                    Thuê:{' '}
                    <span className='font-semibold tabular-nums text-foreground'>
                      {rentalAfter.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className='whitespace-nowrap text-muted-foreground'>
                    Cọc:{' '}
                    <span className='font-semibold tabular-nums text-foreground'>
                      {dep.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className='whitespace-nowrap pt-1 text-lg font-bold tabular-nums text-teal-600 dark:text-teal-400'>
                    {(rentalAfter + dep).toLocaleString('vi-VN')}₫
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

export default function CartPage() {
  const lines = useRentalCartStore((s) => s.lines);
  const clearCart = useRentalCartStore((s) => s.clearCart);

  const totals = useMemo(() => computeCartTotals(lines), [lines]);
  const totalQty = useMemo(
    () => lines.reduce((a, l) => a + l.quantity, 0),
    [lines],
  );

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-transparent font-sans'>
      <div className='relative mx-auto w-full max-w-7xl px-3 pb-16 pt-20 sm:px-4 sm:pt-24 md:px-6 md:pt-28'>
        <nav className='mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm'>
          <ol className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>
            <li>
              <Link
                href='/'
                className='font-medium text-teal-600 transition-colors hover:underline dark:text-teal-400'
              >
                Trang chủ
              </Link>
            </li>
            <li className='text-border'>/</li>
            <li className='font-semibold text-foreground'>Giỏ hàng</li>
          </ol>
        </nav>

        <motion.header
          className='mb-8 sm:mb-10'
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className='flex flex-wrap items-end gap-3 gap-y-2'>
            <h1 className='text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl'>
              Giỏ hàng{' '}
              <HighlightText
                variant='marker'
                color='teal'
                className='font-extrabold'
              >
                cho thuê
              </HighlightText>
            </h1>
            {lines.length > 0 && (
              <Badge className='kinetic-gradient border-0 text-white shadow-md'>
                {totalQty} sản phẩm
              </Badge>
            )}
          </div>
          <p className='mt-2 max-w-xl text-sm text-muted-foreground sm:text-base'>
            <ShinyText className='font-medium'>
              Ưu đãi &amp; cọc minh bạch
            </ShinyText>
            {' — '}
            Kiểm tra đơn trước khi tiến hành thuê. Giao nhanh toàn quốc.
            <Truck className='ml-1 inline size-4 align-text-bottom text-teal-600 dark:text-teal-400' />
          </p>
        </motion.header>

        {lines.length === 0 ? (
          <SpotlightCard
            className='rounded-3xl border border-dashed border-border/80 bg-card/80 p-12 text-center shadow-lg backdrop-blur-md dark:bg-card/60'
            spotlightColor='rgba(99, 102, 241, 0.15)'
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className='mx-auto flex size-20 items-center justify-center rounded-2xl bg-linear-to-br from-teal-500/20 to-indigo-500/20 ring-1 ring-teal-500/20'>
                <ShoppingBag className='size-10 text-teal-600 dark:text-teal-400' />
              </div>
              <p className='mt-6 text-xl font-bold text-foreground'>
                Giỏ hàng đang trống
              </p>
              <p className='mx-auto mt-2 max-w-sm text-sm text-muted-foreground'>
                Thêm thiết bị từ trang chi tiết — spotlight theo từng món bạn
                chọn.
              </p>
              <Magnetic intensity={0.35} range={120}>
                <Button
                  className='kinetic-gradient mt-8 rounded-xl px-8 font-semibold text-white shadow-lg'
                  render={<Link href='/' />}
                >
                  Khám phá sản phẩm
                </Button>
              </Magnetic>
            </motion.div>
          </SpotlightCard>
        ) : (
          <div className='grid gap-8 lg:grid-cols-12 lg:gap-10'>
            <div className='space-y-4 lg:col-span-7'>
              <SpotlightCard
                className='rounded-2xl border border-border/60 bg-card/70 shadow-md backdrop-blur-sm dark:bg-card/50'
                spotlightColor='rgba(99, 102, 241, 0.1)'
              >
                <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-6'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground'>
                      Đơn của bạn
                    </span>
                    <Badge variant='secondary' className='rounded-full'>
                      {lines.length} dòng
                    </Badge>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                    onClick={() => clearCart()}
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className='space-y-4 p-4 sm:p-6'>
                  {lines.map((line, index) => (
                    <CartLineRow key={line.lineId} line={line} index={index} />
                  ))}
                </div>
              </SpotlightCard>
            </div>

            <div className='lg:col-span-5'>
              <div className='lg:sticky lg:top-28'>
                <SpotlightCard
                  className='rounded-2xl border border-teal-500/20 bg-card/90 shadow-xl backdrop-blur-md dark:border-teal-500/25 dark:bg-card/80'
                  spotlightColor='rgba(20, 184, 166, 0.18)'
                >
                  <div className='space-y-5 p-5 sm:p-6'>
                    <div className='flex items-center gap-2'>
                      <Sparkles className='size-5 text-teal-600 dark:text-teal-400' />
                      <h2 className='text-lg font-bold text-foreground'>
                        Tóm tắt thanh toán
                      </h2>
                    </div>

                    <div className='space-y-3 text-sm'>
                      <div className='flex min-w-0 flex-nowrap items-baseline justify-between gap-3 overflow-x-auto text-muted-foreground'>
                        <span className='shrink-0 whitespace-nowrap'>Tiền thuê</span>
                        <span className='shrink-0 whitespace-nowrap font-medium tabular-nums text-foreground'>
                          {totals.rentalSubtotal.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      {totals.voucherDiscount > 0 && (
                        <div className='flex min-w-0 flex-nowrap items-baseline justify-between gap-3 overflow-x-auto text-teal-600 dark:text-teal-400'>
                          <span className='shrink-0 whitespace-nowrap'>Giảm voucher</span>
                          <span className='shrink-0 whitespace-nowrap font-semibold tabular-nums'>
                            −{totals.voucherDiscount.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      )}
                      <div className='flex min-w-0 flex-nowrap items-baseline justify-between gap-3 overflow-x-auto text-muted-foreground'>
                        <span className='shrink-0 whitespace-nowrap'>Tiền cọc</span>
                        <span className='shrink-0 whitespace-nowrap font-medium tabular-nums text-foreground'>
                          {totals.depositTotal.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className='border-t border-border/80 pt-4'>
                        <div className='flex min-w-0 flex-nowrap items-baseline justify-between gap-3 overflow-x-auto'>
                          <span className='shrink-0 whitespace-nowrap text-base font-bold text-foreground'>
                            Tổng thanh toán
                          </span>
                          <span className='shrink-0 whitespace-nowrap text-2xl font-extrabold tabular-nums text-teal-600 dark:text-teal-400'>
                            {totals.grandTotal.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    </div>
                    <Magnetic intensity={0.3} range={100}>
                      {lines.length > 0 ? (
                        <Button
                          className='kinetic-gradient h-12 w-full rounded-xl text-base font-bold text-white shadow-lg hover:opacity-95'
                          render={<Link href='/checkout' />}
                        >
                          Tiến hành thuê
                        </Button>
                      ) : (
                        <Button className='h-12 w-full rounded-xl' disabled variant='secondary'>
                          Tiến hành thuê
                        </Button>
                      )}
                    </Magnetic>
                 

                    <Button
                      variant='outline'
                      className='w-full rounded-xl border-teal-500/30'
                      render={<Link href='/' />}
                    >
                      Tiếp tục xem sản phẩm
                    </Button>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
