'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TicketPercent,
  CreditCard,
  Wallet,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/common/spotlight-card';
import { VoucherLinePickerDialog } from '@/components/checkout/voucher-line-picker-dialog';
import {
  computeCartTotals,
  lineDepositTotal,
  lineRentalAfterVoucher,
  useRentalCartStore,
  rentalSubtotalLine,
} from '@/stores/rental-cart-store';
import {
  useRentalOrderStore,
  type RentalPaymentMethod,
} from '@/stores/rental-order-store';
import {
  computeVoucherDiscount,
  type RentalVoucher,
} from '@/lib/rental-voucher';
import type { VoucherResponse } from '@/features/vouchers/types';
import { useAuth } from '@/context/AuthContext';
import { buildLoginHref } from '@/lib/auth-redirect';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const lines = useRentalCartStore((s) => s.lines);
  const updateLineVoucher = useRentalCartStore((s) => s.updateLineVoucher);
  const clearCart = useRentalCartStore((s) => s.clearCart);
  const addOrder = useRentalOrderStore((s) => s.addOrder);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState<RentalPaymentMethod>('bank_transfer');
  const [voucherLineId, setVoucherLineId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(buildLoginHref('/cart'));
      return;
    }

    // User đã đăng nhập → giỏ hàng thật là /cart (dùng API), không dùng checkout Zustand
    router.replace('/cart');
  }, [isAuthenticated, router]);

  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  const handlePay = () => {
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    const id = addOrder({
      lines: [...lines],
      paymentMethod: payment,
      customerName: name.trim(),
      customerPhone: phone.trim(),
    });
    clearCart();
    router.push(`/rental-orders/${id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center font-sans text-muted-foreground'>
        Đang chuyển đến trang đăng nhập...
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center font-sans text-muted-foreground'>
        Đang chuyển đến giỏ hàng…
      </div>
    );
  }

  const editingLine = voucherLineId
    ? lines.find((l) => l.lineId === voucherLineId)
    : null;
  const editingSubtotal = editingLine ? rentalSubtotalLine(editingLine) : 0;

  return (
    <div className='relative min-h-screen overflow-x-hidden bg-white font-sans dark:bg-surface-base'>
      <div className='relative mx-auto w-full max-w-7xl px-3 pb-16 pt-8 sm:px-4 sm:pt-4 md:px-6 md:pt-8'>
        <Button
          variant='ghost'
          size='sm'
          className='mb-4 gap-1 text-muted-foreground'
          render={<Link href='/cart' />}
        >
          <ArrowLeft className='size-4' />
          Quay lại giỏ hàng
        </Button>

        <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>
          Thanh toán đơn thuê
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Áp voucher từng dòng nếu cần - xác nhận thông tin và phương thức thanh
          toán.
        </p>

        <div className='mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10'>
          <div className='space-y-6 lg:col-span-7'>
            <SpotlightCard
              className='rounded-2xl border border-border/60 bg-card/80 p-5 shadow-md backdrop-blur-sm dark:bg-card/70'
              spotlightColor='rgba(254, 20, 81, 0.1)'
            >
              <h2 className='text-lg font-bold text-foreground'>
                Sản phẩm &amp; voucher
              </h2>
              <ul className='mt-4 space-y-4'>
                {lines.map((line) => {
                  const sub = rentalSubtotalLine(line);
                  const disc = line.voucher
                    ? computeVoucherDiscount(sub, line.voucher)
                    : 0;
                  const rentAfter = lineRentalAfterVoucher(line);
                  const dep = lineDepositTotal(line);
                  return (
                    <li
                      key={line.lineId}
                      className='flex flex-col gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start'
                    >
                      <div className='relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={line.image}
                          alt=''
                          className='size-full object-cover'
                        />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='font-semibold text-foreground'>
                          {line.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {line.variantLabel && `${line.variantLabel} · `}
                          {line.durationLabel} · SL: {line.quantity}
                        </p>
                        {line.voucher && disc > 0 && (
                          <p className='mt-1 text-xs font-medium text-rose-600 dark:text-rose-400'>
                            {line.voucher.code} · −
                            {disc.toLocaleString('vi-VN')}₫
                          </p>
                        )}
                        <div className='mt-2 flex flex-wrap items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='gap-1 rounded-lg'
                            onClick={() => setVoucherLineId(line.lineId)}
                          >
                            <TicketPercent className='size-3.5' />
                            {line.voucher ? 'Đổi voucher' : 'Thêm voucher'}
                          </Button>
                        </div>
                      </div>
                      <div className='shrink-0 whitespace-nowrap text-right text-sm tabular-nums'>
                        <div className='text-muted-foreground'>
                          Thuê:{' '}
                          <span className='font-semibold text-foreground'>
                            {rentAfter.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <div className='text-muted-foreground'>
                          Cọc:{' '}
                          <span className='font-semibold text-foreground'>
                            {dep.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </SpotlightCard>

            <SpotlightCard
              className='rounded-2xl border border-border/60 bg-card/80 p-5 shadow-md dark:bg-card/70'
              spotlightColor='rgba(254, 20, 81, 0.08)'
            >
              <h2 className='text-lg font-bold text-foreground'>
                Thông tin liên hệ
              </h2>
              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='co-name'>Họ và tên</Label>
                  <Input
                    id='co-name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Nguyễn Văn A'
                    autoComplete='name'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='co-phone'>Số điện thoại</Label>
                  <Input
                    id='co-phone'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='09xx xxx xxx'
                    inputMode='tel'
                    autoComplete='tel'
                  />
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard
              className='rounded-2xl border border-border/60 bg-card/80 p-5 shadow-md dark:bg-card/70'
              spotlightColor='rgba(254, 20, 81, 0.08)'
            >
              <h2 className='mb-4 text-lg font-bold text-foreground'>
                Phương thức thanh toán
              </h2>
              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as RentalPaymentMethod)}
                className='gap-3'
              >
                <label
                  htmlFor='pay-bank'
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-muted/20 p-4 dark:bg-muted/10',
                    payment === 'bank_transfer' &&
                      'border-rose-500/50 bg-rose-500/5 dark:border-rose-500/40',
                  )}
                >
                  <RadioGroupItem
                    value='bank_transfer'
                    id='pay-bank'
                    className='mt-0.5'
                  />
                  <div>
                    <div className='flex items-center gap-2 font-semibold text-foreground'>
                      <CreditCard className='size-4 text-rose-600 dark:text-rose-400' />
                      Chuyển khoản ngân hàng
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      QR / số tài khoản Swiftera (demo - không thu tiền thật).
                    </p>
                  </div>
                </label>
                <label
                  htmlFor='pay-wallet'
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-muted/20 p-4 dark:bg-muted/10',
                    payment === 'e_wallet' &&
                      'border-rose-500/50 bg-rose-500/5 dark:border-rose-500/40',
                  )}
                >
                  <RadioGroupItem
                    value='e_wallet'
                    id='pay-wallet'
                    className='mt-0.5'
                  />
                  <div>
                    <div className='flex items-center gap-2 font-semibold text-foreground'>
                      <Wallet className='size-4 text-rose-600 dark:text-rose-400' />
                      Ví điện tử
                    </div>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Momo, ZaloPay… (demo).
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </SpotlightCard>
          </div>

          <div className='lg:col-span-5'>
            <div className='lg:sticky lg:top-28'>
              <SpotlightCard
                className='rounded-2xl border border-rose-500/25 bg-card/90 p-6 shadow-xl dark:bg-card/80'
                spotlightColor='rgba(254, 20, 81, 0.15)'
              >
                <div className='flex items-center gap-2 text-rose-700 dark:text-rose-300'>
                  <ShieldCheck className='size-5' />
                  <span className='font-bold'>Tóm tắt thanh toán</span>
                </div>
                <div className='mt-4 space-y-2 text-sm'>
                  <div className='flex justify-between gap-3 text-muted-foreground'>
                    <span className='shrink-0'>Tiền thuê</span>
                    <span className='whitespace-nowrap tabular-nums font-medium text-foreground'>
                      {totals.rentalSubtotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {totals.voucherDiscount > 0 && (
                    <div className='flex justify-between gap-3 text-rose-600 dark:text-rose-400'>
                      <span className='shrink-0'>Giảm voucher</span>
                      <span className='whitespace-nowrap tabular-nums font-semibold'>
                        −{totals.voucherDiscount.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between gap-3 text-muted-foreground'>
                    <span className='shrink-0'>Tiền cọc</span>
                    <span className='whitespace-nowrap tabular-nums font-medium text-foreground'>
                      {totals.depositTotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className='border-t border-border pt-3'>
                    <div className='flex justify-between gap-3 text-base font-bold'>
                      <span className='shrink-0'>Tổng cộng</span>
                      <span className='whitespace-nowrap tabular-nums text-rose-600 dark:text-rose-400'>
                        {totals.grandTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  type='button'
                  className='mt-6 h-12 w-full rounded-xl bg-rose-600 text-base font-bold text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600'
                  disabled={!name.trim() || !phone.trim() || submitting}
                  onClick={handlePay}
                >
                  {submitting ? 'Đang xử lý…' : 'Xác nhận & thanh toán'}
                </Button>
                <p className='mt-2 text-center text-xs text-muted-foreground'>
                  Bằng việc thanh toán, bạn đồng ý với điều khoản cho thuê
                  (demo).
                </p>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </div>

      {editingLine && (
        <VoucherLinePickerDialog
          open={!!voucherLineId}
          onOpenChange={(o) => !o && setVoucherLineId(null)}
          lineRentalSubtotal={editingSubtotal}
          lineRentalDays={
            editingLine.durationLabel
              ? parseInt(editingLine.durationLabel.replace(/\D/g, ''), 10) || 1
              : 1
          }
          appliedCode={editingLine.voucher?.code ?? null}
          onApply={(v) => {
            // Convert VoucherResponse → RentalVoucher
            const rv: RentalVoucher = {
              id: v.voucherId,
              code: v.code,
              title:
                v.discountType === 'PERCENTAGE'
                  ? `Giảm ${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${v.maxDiscountAmount.toLocaleString('vi-VN')}₫)` : ''}`
                  : `Giảm ${v.discountValue.toLocaleString('vi-VN')}₫`,
              description: v.minRentalDays
                ? `Áp dụng từ ${v.minRentalDays} ngày`
                : 'Voucher Swiftera',
              kind: v.discountType === 'FIXED' ? 'fixed' : 'percent',
              value: v.discountValue,
            };
            updateLineVoucher(editingLine.lineId, rv);
          }}
          onClear={() => {
            updateLineVoucher(editingLine.lineId, null);
          }}
        />
      )}
    </div>
  );
}
