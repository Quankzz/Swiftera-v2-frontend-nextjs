'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  computeCartTotals,
  lineDepositTotal,
  lineRentalAfterVoucher,
  useRentalCartStore,
  type RentalCartLine,
} from '@/stores/rental-cart-store';
import { computeVoucherDiscount } from '@/lib/rental-voucher';

function CartLineRow({ line }: { line: RentalCartLine }) {
  const updateQuantity = useRentalCartStore((s) => s.updateQuantity);
  const removeLine = useRentalCartStore((s) => s.removeLine);

  const sub = line.rentalPricePerUnit * line.quantity;
  const discount = line.voucher ? computeVoucherDiscount(sub, line.voucher) : 0;
  const rentalAfter = lineRentalAfterVoucher(line);
  const dep = lineDepositTotal(line);

  return (
    <div className="flex flex-col gap-4 border-b border-border py-5 last:border-0 sm:flex-row sm:items-start">
      <Link
        href={`/product/${line.productId}`}
        className="relative mx-auto aspect-square w-full max-w-[140px] shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40 sm:mx-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={line.image} alt="" className="size-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <Link
              href={`/product/${line.productId}`}
              className="font-semibold leading-snug text-foreground transition-colors hover:text-teal-600 dark:hover:text-teal-400"
            >
              {line.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">SKU: {line.sku}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {line.variantLabel && (
                <span>
                  Kiểu: <span className="font-medium text-foreground">{line.variantLabel}</span>
                </span>
              )}
              <span>
                Thời gian:{' '}
                <span className="font-medium text-foreground">{line.durationLabel}</span>
              </span>
            </div>
            {line.voucher && discount > 0 && (
              <p className="mt-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                Voucher: {line.voucher.code} (−{discount.toLocaleString()}₫)
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="self-end text-muted-foreground hover:text-destructive sm:self-start"
            aria-label="Xóa khỏi giỏ"
            onClick={() => removeLine(line.lineId)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 p-0"
              onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 p-0"
              onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">
              Thuê: <span className="font-semibold text-foreground">{rentalAfter.toLocaleString()}₫</span>
            </div>
            <div className="text-muted-foreground">
              Cọc: <span className="font-semibold text-foreground">{dep.toLocaleString()}₫</span>
            </div>
            <div className="mt-1 text-base font-bold text-teal-600 dark:text-teal-400">
              Dòng: {(rentalAfter + dep).toLocaleString()}₫
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const lines = useRentalCartStore((s) => s.lines);
  const clearCart = useRentalCartStore((s) => s.clearCart);

  const totals = useMemo(() => computeCartTotals(lines), [lines]);

  return (
    <div className="min-h-screen bg-muted/30 font-sans">
      <div className="mx-auto max-w-5xl px-3 pb-12 pt-20 sm:px-4 sm:pt-24 md:px-6 md:pt-28">
        <nav className="mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <Link
                href="/"
                className="font-medium text-teal-600 transition-colors hover:underline dark:text-teal-400"
              >
                Trang chủ
              </Link>
            </li>
            <li className="text-border">/</li>
            <li className="font-semibold text-foreground">Giỏ hàng</li>
          </ol>
        </nav>

        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Giỏ hàng cho thuê</h1>

        {lines.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-10 text-center ambient-glow">
            <ShoppingBag className="mx-auto size-14 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-foreground">Giỏ hàng trống</p>
            <p className="mt-1 text-sm text-muted-foreground">Thêm sản phẩm thuê từ trang chi tiết để xem tại đây.</p>
            <Button className="kinetic-gradient mt-6 rounded-xl font-semibold text-white" render={<Link href="/" />}>
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="rounded-xl border border-border/60 bg-card px-4 ambient-glow sm:px-6 lg:col-span-8">
              <div className="flex items-center justify-between border-b border-border py-4">
                <span className="text-sm font-semibold text-foreground">
                  {lines.length} sản phẩm trong giỏ
                </span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => clearCart()}>
                  Xóa tất cả
                </Button>
              </div>
              {lines.map((line) => (
                <CartLineRow key={line.lineId} line={line} />
              ))}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4 rounded-xl border border-border/60 bg-card p-5 ambient-glow">
                <h2 className="text-lg font-bold text-foreground">Tóm tắt</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tiền thuê</span>
                    <span className="font-medium text-foreground">{totals.rentalSubtotal.toLocaleString()}₫</span>
                  </div>
                  {totals.voucherDiscount > 0 && (
                    <div className="flex justify-between text-teal-600 dark:text-teal-400">
                      <span>Giảm voucher</span>
                      <span className="font-medium">−{totals.voucherDiscount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tiền cọc</span>
                    <span className="font-medium text-foreground">{totals.depositTotal.toLocaleString()}₫</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-foreground">Tổng thanh toán</span>
                      <span className="text-teal-600 dark:text-teal-400">{totals.grandTotal.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Giá chưa bao gồm phí vận chuyển và 8% VAT. Tiền cọc hoàn trả sau khi trả thiết bị.
                </p>
                <Button className="kinetic-gradient h-12 w-full rounded-xl text-base font-bold text-white hover:opacity-90" disabled>
                  Tiến hành thuê
                </Button>
                <p className="text-center text-xs text-muted-foreground">Thanh toán sẽ kết nối API sau.</p>
                <Button variant="outline" className="w-full rounded-xl" render={<Link href="/" />}>
                  Tiếp tục xem sản phẩm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
