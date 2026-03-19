'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingCart, Minus, Plus, Info, TicketPercent } from 'lucide-react';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* ---------- Types ---------- */

export interface RentalDuration {
  id: string;
  label: string;
  price: number;
  originalPrice?: number;
}

export interface ProductVariant {
  id: string;
  label: string;
}

/* ---------- Gallery ---------- */

interface RentalProductGalleryProps {
  images: string[];
  currentImage: number;
  setCurrentImage: (index: number) => void;
}

export function RentalProductGallery({
  images,
  currentImage,
  setCurrentImage,
}: RentalProductGalleryProps) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleImages = images.slice(
    Math.max(0, currentImage - 2),
    Math.min(images.length, currentImage + 3)
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, currentImage, setCurrentImage]);

  const handleManualChange = (index: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentImage(index);
  };

  return (
    <div className="space-y-3 font-sans sm:space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Ảnh sản phẩm ${idx + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
              currentImage === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
      </div>
      <div className="relative flex items-center justify-center gap-2 sm:gap-4">
        {currentImage > 0 && (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-transform duration-300 ease-in-out hover:scale-110 hover:text-foreground sm:size-9"
            aria-label="Ảnh trước"
            onClick={() => handleManualChange(currentImage - 1)}
          >
            <span className="text-lg">{'<'}</span>
          </button>
        )}
        <div className="flex min-w-0 flex-1 justify-center gap-1.5 overflow-x-auto overflow-y-hidden pb-1 sm:gap-2">
          {visibleImages.map((img, idx) => {
            const actualIndex = Math.max(0, currentImage - 2) + idx;
            return (
              <button
                key={actualIndex}
                type="button"
                onClick={() => handleManualChange(actualIndex)}
                className={`relative size-14 shrink-0 overflow-hidden rounded-md border transition-transform duration-300 ease-in-out sm:size-16 ${
                  currentImage === actualIndex
                    ? 'scale-105 border-teal-600 sm:scale-110 dark:border-teal-400'
                    : 'border-border'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${actualIndex + 1}`}
                  className="object-cover w-full h-full transition-transform duration-300 ease-in-out transform hover:scale-105"
                />
              </button>
            );
          })}
        </div>
        {currentImage < images.length - 1 && (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-transform duration-300 ease-in-out hover:scale-110 hover:text-foreground sm:size-9"
            aria-label="Ảnh sau"
            onClick={() => handleManualChange(currentImage + 1)}
          >
            <span className="text-lg">{'>'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Rating & badges (nội bộ) ---------- */

function RentalStars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starFill = Math.min(10, Math.max(0, (rating - index) * 10));
          return (
            <div key={index} className="relative inline-block w-4 h-4" style={{ fontSize: '14px' }}>
              <span className="absolute top-0 left-0 w-full h-full text-muted-foreground/40" style={{ display: 'inline-block' }}>
                ★
              </span>
              <span
                className="absolute top-0 left-0 h-full overflow-hidden text-yellow-400"
                style={{ display: 'inline-block', width: `${starFill * 10}%` }}
              >
                ★
              </span>
            </div>
          );
        })}
      </div>
      {reviews !== undefined && <span className="text-sm text-muted-foreground">({reviews})</span>}
    </div>
  );
}

const badgeStyles = {
  green: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  blue: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  purple: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
} as const;

const badgeIcons = {
  green: <ShieldCheck className="w-3.5 h-3.5" />,
  blue: <Truck className="w-3.5 h-3.5" />,
  orange: <Clock className="w-3.5 h-3.5" />,
  purple: <Headphones className="w-3.5 h-3.5" />,
} as const;

const defaultBadges = [
  { label: 'CHÍNH HÃNG', variant: 'green' as const },
  { label: 'GIAO NHANH', variant: 'blue' as const },
  { label: 'CÒN HÀNG', variant: 'orange' as const },
  { label: 'HỖ TRỢ 24/7', variant: 'purple' as const },
];

function RentalProductBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {defaultBadges.map((badge, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeStyles[badge.variant]}`}
        >
          {badgeIcons[badge.variant]}
          {badge.label}
        </div>
      ))}
    </div>
  );
}

/* ---------- Summary ---------- */

interface RentalProductSummaryProps {
  productData: {
    name: string;
    sku: string;
    brand: string;
    productType: string;
    discount?: number;
    rating?: number;
    reviews?: number;
    rentedCount?: number;
    variants?: ProductVariant[];
    durations: RentalDuration[];
  };
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  currentPrice: number;
  originalPrice?: number;
}

export function RentalProductSummary({
  productData,
  selectedVariant,
  onVariantChange,
  selectedDuration,
  onDurationChange,
  currentPrice,
  originalPrice,
}: RentalProductSummaryProps) {
  const {
    name,
    sku,
    brand,
    productType,
    discount = 0,
    rating = 0,
    reviews = 0,
    rentedCount = 0,
    variants = [],
    durations,
  } = productData;

  const selectedRing =
    'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-100 dark:ring-teal-400';
  const idleOption =
    'border-border bg-card text-foreground hover:border-teal-500/50 dark:hover:border-teal-400/40';

  return (
    <div className="space-y-4 font-sans sm:space-y-5">
      <div>
        <RentalProductBadges />
        <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl md:text-3xl">
          {name}
        </h1>
      </div>

      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1 sm:text-sm">
        <div className="text-muted-foreground">
          SKU: <span className="text-foreground font-medium">{sku}</span>
        </div>
        <div className="text-muted-foreground">
          Thương hiệu:{' '}
          <span className="font-bold text-teal-600 dark:text-teal-400">{brand}</span>
        </div>
        <div className="text-muted-foreground">
          Loại: <span className="text-foreground font-medium">{productType}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <RentalStars rating={rating} reviews={reviews} />
        <span className="hidden text-sm text-muted-foreground/50 sm:inline">|</span>
        <div className="text-xs text-muted-foreground sm:text-sm">
          Đã cho thuê <span className="font-semibold text-foreground">{rentedCount.toLocaleString()}</span> lần
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-3 dark:bg-muted/20 sm:p-4">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="text-2xl font-bold text-teal-600 sm:text-3xl dark:text-teal-400">
            {currentPrice.toLocaleString()}₫
          </span>
          {originalPrice && originalPrice > currentPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">{originalPrice.toLocaleString()}₫</span>
              <span className="rounded bg-teal-600 px-2 py-0.5 text-xs font-bold text-white dark:bg-teal-500">
                -{discount}%
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Giá chưa bao gồm phí vận chuyển và 8% VAT</p>
      </div>

      {variants.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-foreground">Kiểu dáng</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onVariantChange(variant.id)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  selectedVariant === variant.id ? selectedRing : idleOption
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-foreground">Thời gian thuê</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {durations.map((duration) => (
            <button
              key={duration.id}
              type="button"
              onClick={() => onDurationChange(duration.id)}
              className={`rounded-lg border px-2 py-2 text-xs transition-all sm:px-3 sm:py-2.5 sm:text-sm ${
                selectedDuration === duration.id
                  ? `${selectedRing} font-semibold`
                  : idleOption
              }`}
            >
              <div className="font-medium leading-tight">{duration.label}</div>
              <div
                className={`mt-0.5 text-xs ${
                  selectedDuration === duration.id
                    ? 'text-teal-800 dark:text-teal-300'
                    : 'text-muted-foreground'
                }`}
              >
                {duration.price.toLocaleString()}₫
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Checkout & voucher ---------- */

type RentalVoucherKind = 'fixed' | 'percent';

export interface RentalVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  kind: RentalVoucherKind;
  /** VND nếu kind=fixed, % nếu kind=percent */
  value: number;
  /** Tổng tiền thuê tối thiểu để áp dụng (VND) */
  minRental?: number;
}

export const defaultRentalVouchers: RentalVoucher[] = [
  {
    id: 'v1',
    code: 'SWIFTERA50K',
    title: 'Giảm 50.000₫ tiền thuê',
    description: 'Áp dụng cho đơn thuê từ 200.000₫',
    kind: 'fixed',
    value: 50000,
    minRental: 200000,
  },
  {
    id: 'v2',
    code: 'THUE10',
    title: 'Giảm 10% tiền thuê',
    description: 'Tối đa áp dụng trên tổng tiền thuê (không áp dụng tiền cọc)',
    kind: 'percent',
    value: 10,
  },
  {
    id: 'v3',
    code: 'WEEKEND',
    title: 'Giảm 100.000₫ cuối tuần',
    description: 'Ưu đãi cuối tuần — đơn từ 500.000₫',
    kind: 'fixed',
    value: 100000,
    minRental: 500000,
  },
];

function computeVoucherDiscount(totalRental: number, voucher: RentalVoucher): number {
  if (voucher.minRental != null && totalRental < voucher.minRental) return 0;
  if (voucher.kind === 'fixed') {
    return Math.min(voucher.value, totalRental);
  }
  return Math.floor((totalRental * voucher.value) / 100);
}

interface RentalCheckoutCardProps {
  rentalPrice: number;
  deposit: number;
  selectedDuration: string;
  quantity: number;
  setQuantity: (qty: number) => void;
  vouchers?: RentalVoucher[];
}

export function RentalCheckoutCard({
  rentalPrice,
  deposit,
  selectedDuration,
  quantity,
  setQuantity,
  vouchers = defaultRentalVouchers,
}: RentalCheckoutCardProps) {
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<RentalVoucher | null>(null);

  const totalRental = rentalPrice * quantity;
  const voucherDiscount = useMemo(
    () => (appliedVoucher ? computeVoucherDiscount(totalRental, appliedVoucher) : 0),
    [appliedVoucher, totalRental]
  );
  const totalPayment = totalRental - voucherDiscount + deposit;

  const handleApplyVoucher = (v: RentalVoucher) => {
    const d = computeVoucherDiscount(totalRental, v);
    if (d <= 0) return;
    setAppliedVoucher(v);
    setVoucherOpen(false);
  };

  useEffect(() => {
    if (!appliedVoucher) return;
    if (computeVoucherDiscount(totalRental, appliedVoucher) <= 0) {
      setAppliedVoucher(null);
    }
  }, [appliedVoucher, totalRental]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 font-sans shadow-sm ambient-glow sm:space-y-5 sm:p-5">
      <div>
        <span className="mb-2 block text-sm font-bold text-foreground">Số lượng</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 rounded-lg border border-input bg-background py-1.5 text-center text-sm text-foreground"
          />
          <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-muted/50 p-3 dark:bg-muted/30 sm:p-4">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="text-xs text-muted-foreground sm:text-sm">Tiền thuê ({selectedDuration})</span>
          <span className="text-sm font-semibold text-foreground sm:text-base">{totalRental.toLocaleString()}₫</span>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            Tiền cọc
            <Info className="size-3.5 shrink-0 text-muted-foreground" />
          </span>
          <span className="text-sm font-semibold text-foreground sm:text-base">{deposit.toLocaleString()}₫</span>
        </div>
        {appliedVoucher && voucherDiscount > 0 && (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <span className="text-xs text-teal-700 dark:text-teal-300 sm:text-sm">
              Giảm voucher ({appliedVoucher.code})
            </span>
            <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 sm:text-base">
              −{voucherDiscount.toLocaleString()}₫
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold text-foreground">Tổng thanh toán</span>
          <span className="text-lg font-bold text-teal-600 sm:text-xl dark:text-teal-400">
            {totalPayment.toLocaleString()}₫
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-3 text-xs leading-relaxed text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-100">
        Tiền cọc sẽ được <span className="font-bold">hoàn trả trong 24h</span> sau khi bạn trả thiết bị. Giá thuê chưa
        bao gồm phí vận chuyển và 8% VAT.
      </div>

      <div className="flex gap-2">
        <Button className="kinetic-gradient h-11 min-w-0 flex-1 rounded-xl text-sm font-bold text-white hover:opacity-90 sm:h-12 sm:text-base">
          <ShoppingCart className="mr-2 size-5 shrink-0" />
          Thêm vào giỏ
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setVoucherOpen(true)}
          className="h-11 shrink-0 rounded-xl px-3 sm:h-12 sm:px-4"
          aria-label="Chọn mã voucher"
        >
          <TicketPercent className="size-5 sm:mr-1.5" />
          <span className="hidden sm:inline">Voucher</span>
        </Button>
      </div>

      <Dialog open={voucherOpen} onOpenChange={setVoucherOpen}>
        <DialogContent className="max-h-[min(90dvh,560px)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-5">
            <DialogTitle className="text-lg font-bold text-foreground">Mã giảm giá</DialogTitle>
            <DialogDescription className="text-left text-sm">
              Chọn một voucher để giảm trừ trên tiền thuê (không áp dụng tiền cọc).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(60dvh,420px)] space-y-2 overflow-y-auto px-4 py-3 sm:px-5">
            {vouchers.map((v) => {
              const preview = computeVoucherDiscount(totalRental, v);
              const disabled = preview <= 0;
              return (
                <div
                  key={v.id}
                  className="rounded-xl border border-border/80 bg-muted/30 p-3 dark:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">{v.code}</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{v.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
                      {v.minRental != null && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Đơn tối thiểu: {v.minRental.toLocaleString()}₫ tiền thuê
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {disabled
                        ? 'Chưa đủ điều kiện'
                        : `Giảm ~${preview.toLocaleString()}₫ cho đơn hiện tại`}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      disabled={disabled || appliedVoucher?.id === v.id}
                      variant={appliedVoucher?.id === v.id ? 'secondary' : 'default'}
                      onClick={() => handleApplyVoucher(v)}
                    >
                      {appliedVoucher?.id === v.id ? 'Đang dùng' : 'Áp dụng'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {appliedVoucher && (
            <div className="border-t border-border bg-muted/40 px-4 py-3 dark:bg-muted/20 sm:px-5">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setAppliedVoucher(null)}
              >
                Bỏ mã đang áp dụng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
