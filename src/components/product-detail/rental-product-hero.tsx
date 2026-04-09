'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ShoppingCart, Minus, Plus, Info, TicketPercent } from 'lucide-react';
import { ShieldCheck, Truck, Clock, Headphones } from 'lucide-react';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X as XIcon,
  ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  computeVoucherDiscount,
  defaultRentalVouchers,
  type RentalVoucher,
} from '@/lib/rental-voucher';
import { useAddToCart } from '@/hooks/api/use-cart';
import { useCartAnimationStore } from '@/stores/cart-animation-store';
import { toast } from 'sonner';

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

export interface ProductColorOption {
  productColorId: string;
  name: string;
  code: string;
  quantity: number;
  availableQuantity: number;
}

/* ---------- Gallery ---------- */

interface RentalProductGalleryProps {
  images: string[];
  currentImage: number;
  setCurrentImage: (index: number) => void;
}

/** Lightbox fullscreen overlay */
function GalleryLightbox({
  images,
  initial,
  onClose,
}: {
  images: string[];
  initial: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initial);
  const touchX = useRef<number | null>(null);

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIdx((i) => Math.min(images.length - 1, i + 1)),
    [images.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onClose]);

  return (
    <div
      className='fixed inset-0 z-9999 flex items-center justify-center bg-black/92 backdrop-blur-sm'
      onClick={onClose}
    >
      {/* Close */}
      <button
        type='button'
        onClick={onClose}
        className='absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20'
        aria-label='Đóng'
      >
        <XIcon className='size-5' />
      </button>

      {/* Counter */}
      <span className='absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold tabular-nums text-white/80 backdrop-blur-md'>
        {idx + 1} / {images.length}
      </span>

      {/* Main image */}
      <div
        className='relative mx-auto flex h-full max-h-[80dvh] w-full max-w-4xl items-center justify-center px-16'
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx > 50) prev();
          else if (dx < -50) next();
          touchX.current = null;
        }}
      >
        {/* Prev */}
        {idx > 0 && (
          <button
            type='button'
            onClick={prev}
            className='absolute left-2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20'
            aria-label='Ảnh trước'
          >
            <ChevronLeft className='size-5' />
          </button>
        )}

        <img
          key={idx}
          src={images[idx]}
          alt={`Ảnh ${idx + 1}`}
          className='max-h-[80dvh] w-full rounded-xl object-contain shadow-2xl'
          style={{ animation: 'lb-fade .25s ease' }}
        />

        {/* Next */}
        {idx < images.length - 1 && (
          <button
            type='button'
            onClick={next}
            className='absolute right-2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20'
            aria-label='Ảnh sau'
          >
            <ChevronRight className='size-5' />
          </button>
        )}
      </div>

      {/* Filmstrip */}
      <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4 pb-1'>
        {images.map((img, i) => (
          <button
            key={i}
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setIdx(i);
            }}
            className={`relative size-12 shrink-0 overflow-hidden rounded-md transition-all duration-200 ${
              i === idx
                ? 'ring-2 ring-white ring-offset-1 ring-offset-black/60 opacity-100'
                : 'opacity-50 hover:opacity-80'
            }`}
          >
            <img src={img} alt='' className='size-full object-cover' />
          </button>
        ))}
      </div>

      <style>{`@keyframes lb-fade{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

export function RentalProductGallery({
  images,
  currentImage,
  setCurrentImage,
}: RentalProductGalleryProps) {
  const [lightbox, setLightbox] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const prev = () => setCurrentImage(Math.max(0, currentImage - 1));
  const next = () =>
    setCurrentImage(Math.min(images.length - 1, currentImage + 1));

  // Keyboard nav khi hover vào gallery
  useEffect(() => {
    if (!isHovered) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, currentImage, images.length]);

  // Auto-scroll filmstrip khi đổi ảnh
  useEffect(() => {
    const strip = filmstripRef.current;
    if (!strip) return;
    const btn = strip.children[currentImage] as HTMLElement | undefined;
    btn?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentImage]);

  const hasManyImages = images.length > 1;

  if (!images.length) return null;

  return (
    <>
      <div
        className='group/gallery select-none space-y-3'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Main image ── */}
        <div
          className='relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/30 shadow-md'
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = Math.abs(
              e.changedTouches[0].clientY - (touchStartY.current ?? 0),
            );
            if (Math.abs(dx) > 40 && dy < 60) {
              if (dx > 0) prev();
              else next();
            }
            touchStartX.current = null;
            touchStartY.current = null;
          }}
        >
          {/* Slides */}
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Ảnh sản phẩm ${idx + 1}`}
              draggable={false}
              className={`absolute inset-0 size-full object-cover transition-all duration-500 ease-out ${
                currentImage === idx
                  ? 'z-10 opacity-100 scale-100'
                  : 'z-0 opacity-0 scale-[1.02]'
              }`}
            />
          ))}

          {/* Left arrow */}
          {hasManyImages && currentImage > 0 && (
            <button
              type='button'
              aria-label='Ảnh trước'
              onClick={prev}
              className='absolute left-3 top-1/2 z-20 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-200 opacity-0 group-hover/gallery:opacity-100 hover:scale-110 hover:bg-black/50 active:scale-95'
            >
              <ChevronLeft className='size-5' />
            </button>
          )}

          {/* Right arrow */}
          {hasManyImages && currentImage < images.length - 1 && (
            <button
              type='button'
              aria-label='Ảnh sau'
              onClick={next}
              className='absolute right-3 top-1/2 z-20 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-200 opacity-0 group-hover/gallery:opacity-100 hover:scale-110 hover:bg-black/50 active:scale-95'
            >
              <ChevronRight className='size-5' />
            </button>
          )}

          {/* Image counter */}
          {hasManyImages && (
            <div className='absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md'>
              <span className='text-xs font-semibold tabular-nums text-white/90'>
                {currentImage + 1}
              </span>
              <span className='text-white/40 text-xs'>/</span>
              <span className='text-xs text-white/60'>{images.length}</span>
            </div>
          )}

          {/* Dot indicators */}
          {hasManyImages && images.length <= 8 && (
            <div className='absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5'>
              {images.map((_, i) => (
                <button
                  key={i}
                  type='button'
                  aria-label={`Ảnh ${i + 1}`}
                  onClick={() => setCurrentImage(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentImage
                      ? 'size-2 bg-white shadow'
                      : 'size-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Expand button */}
          <button
            type='button'
            aria-label='Xem toàn màn hình'
            onClick={() => setLightbox(true)}
            className='absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/30 text-white shadow backdrop-blur-md transition-all duration-200 opacity-0 group-hover/gallery:opacity-100 hover:scale-110 hover:bg-black/50 active:scale-95'
          >
            <Expand className='size-3.5' />
          </button>
        </div>

        {/* ── Filmstrip thumbnails ── */}
        {hasManyImages && (
          <div
            ref={filmstripRef}
            className='flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide'
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((img, idx) => {
              const isActive = currentImage === idx;
              return (
                <button
                  key={idx}
                  type='button'
                  aria-label={`Xem ảnh ${idx + 1}`}
                  onClick={() => setCurrentImage(idx)}
                  className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:w-20 ${
                    isActive
                      ? 'border-rose-500 shadow-sm shadow-rose-500/20 dark:border-rose-400'
                      : 'border-transparent opacity-55 hover:border-border hover:opacity-90'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    draggable={false}
                    className={`size-full object-cover transition-transform duration-300 ${isActive ? 'scale-105' : 'hover:scale-105'}`}
                  />
                  {/* Active overlay gradient */}
                  {isActive && (
                    <span className='absolute inset-0 rounded-[10px] ring-1 ring-inset ring-rose-500/30' />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Zoom hint (desktop) ── */}
        {images.length > 0 && (
          <p className='hidden items-center gap-1 text-xs text-muted-foreground/60 sm:flex'>
            <ZoomIn className='size-3' />
            Click để xem ảnh toàn màn hình · Dùng ← → để chuyển ảnh
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <GalleryLightbox
          images={images}
          initial={currentImage}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}

/* ---------- Rating & badges (nội bộ) ---------- */

function RentalStars({
  rating,
  reviews,
}: {
  rating: number;
  reviews?: number;
}) {
  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm font-medium text-foreground'>
        {rating.toFixed(1)}
      </span>
      <div className='flex items-center gap-1'>
        {Array.from({ length: 5 }).map((_, index) => {
          const starFill = Math.min(10, Math.max(0, (rating - index) * 10));
          return (
            <div
              key={index}
              className='relative inline-block w-4 h-4'
              style={{ fontSize: '14px' }}
            >
              <span
                className='absolute top-0 left-0 w-full h-full text-muted-foreground/40'
                style={{ display: 'inline-block' }}
              >
                ★
              </span>
              <span
                className='absolute top-0 left-0 h-full overflow-hidden text-yellow-400'
                style={{ display: 'inline-block', width: `${starFill * 10}%` }}
              >
                ★
              </span>
            </div>
          );
        })}
      </div>
      {reviews !== undefined && (
        <span className='text-sm text-muted-foreground'>({reviews})</span>
      )}
    </div>
  );
}

const badgeStyles = {
  green: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  blue: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  orange:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  purple:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
} as const;

const badgeIcons = {
  green: <ShieldCheck className='w-3.5 h-3.5' />,
  blue: <Truck className='w-3.5 h-3.5' />,
  orange: <Clock className='w-3.5 h-3.5' />,
  purple: <Headphones className='w-3.5 h-3.5' />,
} as const;

const defaultBadges = [
  { label: 'CHÍNH HÃNG', variant: 'green' as const },
  { label: 'GIAO NHANH', variant: 'blue' as const },
  { label: 'CÒN HÀNG', variant: 'orange' as const },
  { label: 'HỖ TRỢ 24/7', variant: 'purple' as const },
];

function RentalProductBadges() {
  return (
    <div className='flex flex-wrap items-center gap-2 mb-2'>
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
    colors?: ProductColorOption[];
    variants?: ProductVariant[];
    durations: RentalDuration[];
  };
  selectedColorId?: string | null;
  onColorChange?: (colorId: string) => void;
  selectedVariant: string;
  onVariantChange: (variant: string) => void;
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  currentPrice: number;
  originalPrice?: number;
}

export function RentalProductSummary({
  productData,
  selectedColorId,
  onColorChange,
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
    colors = [],
    variants = [],
    durations,
  } = productData;

  const selectedRing =
    'border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-600 dark:border-rose-400 dark:bg-rose-950/50 dark:text-rose-100 dark:ring-rose-400';
  const idleOption =
    'border-border bg-card text-foreground hover:border-rose-500/50 dark:hover:border-rose-400/40';

  return (
    <div className='space-y-4 font-sans sm:space-y-5'>
      <div>
        <RentalProductBadges />
        <h1 className='text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl md:text-3xl'>
          {name}
        </h1>
      </div>

      <div className='flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1 sm:text-sm'>
        <div className='text-muted-foreground'>
          SKU: <span className='text-foreground font-medium'>{sku}</span>
        </div>
        <div className='text-muted-foreground'>
          Thương hiệu:{' '}
          <span className='font-bold text-rose-600 dark:text-rose-400'>
            {brand}
          </span>
        </div>
        <div className='text-muted-foreground'>
          Loại:{' '}
          <span className='text-foreground font-medium'>{productType}</span>
        </div>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
        <RentalStars rating={rating} reviews={reviews} />
        <span className='hidden text-sm text-muted-foreground/50 sm:inline'>
          |
        </span>
        <div className='text-xs text-muted-foreground sm:text-sm'>
          Đã cho thuê{' '}
          <span className='font-semibold text-foreground'>
            {rentedCount.toLocaleString()}
          </span>{' '}
          lần
        </div>
      </div>

      <div className='rounded-xl border border-border/60 bg-muted/40 p-3 dark:bg-muted/20 sm:p-4'>
        <div className='flex flex-wrap items-baseline gap-2 sm:gap-3'>
          <span className='text-2xl font-bold text-rose-600 sm:text-3xl dark:text-rose-400'>
            {currentPrice.toLocaleString()}₫
          </span>
          {originalPrice && originalPrice > currentPrice && (
            <>
              <span className='text-lg text-muted-foreground line-through'>
                {originalPrice.toLocaleString()}₫
              </span>
              <span className='rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white dark:bg-rose-500'>
                -{discount}%
              </span>
            </>
          )}
        </div>
        <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
          Giá chưa bao gồm phí vận chuyển và 8% VAT
        </p>
      </div>

      {/* Color picker */}
      {colors.length > 0 && (
        <div>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-sm font-bold text-foreground'>
              Màu sắc
              {selectedColorId && (
                <span className='ml-2 font-normal text-muted-foreground'>
                  —{' '}
                  {colors.find((c) => c.productColorId === selectedColorId)
                    ?.name ?? ''}
                </span>
              )}
            </h3>
          </div>
          <div className='flex flex-wrap gap-2'>
            {colors.map((color) => {
              const isSelected = selectedColorId === color.productColorId;
              const isUnavailable = color.availableQuantity === 0;
              return (
                <button
                  key={color.productColorId}
                  type='button'
                  disabled={isUnavailable}
                  onClick={() => onColorChange?.(color.productColorId)}
                  title={`${color.name}${isUnavailable ? ' — Hết hàng' : ` — ${color.availableQuantity} sẵn sàng`}`}
                  className={[
                    'relative flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                    isUnavailable
                      ? 'cursor-not-allowed border-border/40 bg-muted/30 opacity-50'
                      : isSelected
                        ? 'border-rose-600 bg-rose-50 ring-1 ring-rose-600 dark:border-rose-400 dark:bg-rose-950/50 dark:ring-rose-400'
                        : 'border-border bg-card text-foreground hover:border-rose-500/50 dark:hover:border-rose-400/40',
                  ].join(' ')}
                >
                  {/* Color swatch */}
                  <span
                    className={[
                      'inline-block size-4 shrink-0 rounded-full border',
                      isSelected
                        ? 'border-rose-600 dark:border-rose-400'
                        : 'border-border/60',
                    ].join(' ')}
                    style={{ backgroundColor: color.code }}
                  />
                  <span
                    className={
                      isSelected
                        ? 'text-rose-900 dark:text-rose-100'
                        : 'text-foreground'
                    }
                  >
                    {color.name}
                  </span>
                  <span
                    className={[
                      'ml-0.5 tabular-nums',
                      isUnavailable
                        ? 'text-muted-foreground'
                        : isSelected
                          ? 'text-rose-700 dark:text-rose-300'
                          : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    ({isUnavailable ? 'Hết' : color.availableQuantity})
                  </span>
                  {isUnavailable && (
                    <span className='absolute inset-0 flex items-center justify-center rounded-xl'>
                      <span className='h-px w-3/4 -rotate-12 bg-muted-foreground/40' />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {colors.length > 1 && !selectedColorId && (
            <p className='mt-1.5 text-xs text-amber-600 dark:text-amber-400'>
              Vui lòng chọn màu trước khi thêm vào giỏ hàng
            </p>
          )}
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <h3 className='mb-2 text-sm font-bold text-foreground'>Kiểu dáng</h3>
          <div className='flex flex-wrap gap-2'>
            {variants.map((variant) => (
              <button
                key={variant.id}
                type='button'
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
        <h3 className='mb-2 text-sm font-bold text-foreground'>
          Thời gian thuê
        </h3>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
          {durations.map((duration) => (
            <button
              key={duration.id}
              type='button'
              onClick={() => onDurationChange(duration.id)}
              className={`rounded-lg border px-2 py-2 text-xs transition-all sm:px-3 sm:py-2.5 sm:text-sm ${
                selectedDuration === duration.id
                  ? `${selectedRing} font-semibold`
                  : idleOption
              }`}
            >
              <div className='font-medium leading-tight'>{duration.label}</div>
              <div
                className={`mt-0.5 text-xs ${
                  selectedDuration === duration.id
                    ? 'text-rose-800 dark:text-rose-300'
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

export type { RentalVoucher } from '@/lib/rental-voucher';
export {
  defaultRentalVouchers,
  computeVoucherDiscount,
} from '@/lib/rental-voucher';

interface RentalCheckoutCardProps {
  rentalPrice: number;
  deposit: number;
  selectedDuration: string;
  durationId: string;
  quantity: number;
  setQuantity: (qty: number) => void;
  vouchers?: RentalVoucher[];
  /** Bắt buộc để thêm vào giỏ */
  cartProduct?: {
    productId: string;
    name: string;
    image: string;
    sku: string;
    /** productColorId được chọn — bắt buộc nếu sản phẩm có >1 màu */
    productColorId?: string | null;
    /** Hiển thị tên màu đang chọn */
    colorName?: string | null;
    variantId?: string;
    variantLabel?: string;
  };
  /** Nếu true thì nút "Thêm vào giỏ" bị disable do chưa chọn màu */
  requireColorSelection?: boolean;
  /** Sau khi thêm giỏ thành công */
  onAddedToCart?: () => void;
}

export function RentalCheckoutCard({
  rentalPrice,
  deposit,
  selectedDuration,
  durationId,
  quantity,
  setQuantity,
  vouchers = defaultRentalVouchers,
  cartProduct,
  requireColorSelection = false,
  onAddedToCart,
}: RentalCheckoutCardProps) {
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<RentalVoucher | null>(
    null,
  );

  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const addFlyingItem = useCartAnimationStore((s) => s.addFlyingItem);

  const totalRental = rentalPrice * quantity;
  const voucherDiscount = useMemo(
    () =>
      appliedVoucher ? computeVoucherDiscount(totalRental, appliedVoucher) : 0,
    [appliedVoucher, totalRental],
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

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      toast.success('Đã thêm vào giỏ hàng!');
      onAddedToCart?.();
    },
    onError: (error: Error) => {
      toast.error(
        error.message ?? 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.',
      );
    },
  });

  const handleAddToCart = () => {
    if (!cartProduct) return;

    if (addToCartBtnRef.current) {
      const rect = addToCartBtnRef.current.getBoundingClientRect();
      const size = Math.max(rect.height * 1.5, 72);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const flyRect = {
        left: cx - size / 2,
        top: cy - size / 2,
        right: cx + size / 2,
        bottom: cy + size / 2,
        width: size,
        height: size,
        x: cx - size / 2,
        y: cy - size / 2,
        toJSON: () => ({}),
      } as DOMRect;
      addFlyingItem({
        id: `${cartProduct.productId}-${Date.now()}`,
        imageUrl: cartProduct.image,
        fromRect: flyRect,
      });
    }

    addToCart({
      productId: cartProduct.productId,
      ...(cartProduct.productColorId
        ? { productColorId: cartProduct.productColorId }
        : {}),
      rentalDurationDays: parseInt(durationId, 10),
      quantity,
    });
  };

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 font-sans shadow-sm ambient-glow sm:space-y-5 sm:p-5'>
      <div className='space-y-3 rounded-xl bg-muted/50 p-3 dark:bg-muted/30 sm:p-4'>
        {cartProduct?.colorName && (
          <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
            <span className='text-xs text-muted-foreground sm:text-sm'>
              Màu sắc
            </span>
            <span className='text-sm font-semibold text-foreground sm:text-base'>
              {cartProduct.colorName}
            </span>
          </div>
        )}
        <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
          <span className='text-xs text-muted-foreground sm:text-sm'>
            Tiền thuê ({selectedDuration})
          </span>
          <span className='text-sm font-semibold text-foreground sm:text-base'>
            {totalRental.toLocaleString()}₫
          </span>
        </div>
        <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
          <span className='flex items-center gap-1 text-xs text-muted-foreground sm:text-sm'>
            Tiền cọc
            <Info className='size-3.5 shrink-0 text-muted-foreground' />
          </span>
          <span className='text-sm font-semibold text-foreground sm:text-base'>
            {deposit.toLocaleString()}₫
          </span>
        </div>
        {appliedVoucher && voucherDiscount > 0 && (
          <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2'>
            <span className='text-xs text-rose-700 dark:text-rose-300 sm:text-sm'>
              Giảm voucher ({appliedVoucher.code})
            </span>
            <span className='text-sm font-semibold text-rose-600 dark:text-rose-400 sm:text-base'>
              −{voucherDiscount.toLocaleString()}₫
            </span>
          </div>
        )}
        <div className='flex flex-col gap-1 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-sm font-bold text-foreground'>
            Tổng thanh toán
          </span>
          <span className='text-lg font-bold text-rose-600 sm:text-xl dark:text-rose-400'>
            {totalPayment.toLocaleString()}₫
          </span>
        </div>
      </div>

      <div className='rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs leading-relaxed text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100'>
        Tiền cọc sẽ được <span className='font-bold'>hoàn trả trong 24h</span>{' '}
        sau khi bạn trả thiết bị. Giá thuê chưa bao gồm phí vận chuyển và 8%
        VAT.
      </div>

      <div className='flex flex-wrap items-stretch gap-2 sm:items-center sm:gap-3'>
        <div
          className='flex h-12 shrink-0 items-center gap-1 rounded-xl border border-input bg-background px-1.5 shadow-sm'
          role='group'
          aria-label='Số lượng'
        >
          <Button
            type='button'
            variant='ghost'
            className='size-10 shrink-0 rounded-lg p-0 hover:bg-muted sm:size-11'
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label='Giảm số lượng'
          >
            <Minus className='size-6' />
          </Button>
          <input
            type='number'
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            className='h-full w-12 border-0 bg-transparent text-center text-lg font-bold tabular-nums text-foreground outline-none sm:w-14 sm:text-xl'
          />
          <Button
            type='button'
            variant='ghost'
            className='size-10 shrink-0 rounded-lg p-0 hover:bg-muted sm:size-11'
            onClick={() => setQuantity(quantity + 1)}
            aria-label='Tăng số lượng'
          >
            <Plus className='size-6' />
          </Button>
        </div>
        <Button
          ref={addToCartBtnRef}
          type='button'
          disabled={!cartProduct || isAddingToCart || requireColorSelection}
          onClick={handleAddToCart}
          className='h-12 min-h-12 min-w-0 flex-1 rounded-xl bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600 sm:text-base'
          title={
            requireColorSelection
              ? 'Vui lòng chọn màu trước'
              : !cartProduct
                ? 'Thiếu thông tin sản phẩm để thêm giỏ'
                : undefined
          }
        >
          {isAddingToCart ? (
            <span className='mr-2 inline-block size-5 animate-spin rounded-full border-2 border-white/40 border-t-white' />
          ) : (
            <ShoppingCart className='mr-2 size-5 shrink-0' />
          )}
          {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </Button>
        {/* <Button
          type='button'
          variant='outline'
          onClick={() => setVoucherOpen(true)}
          className='h-12 min-h-12 shrink-0 rounded-xl px-3 sm:px-4'
          aria-label='Chọn mã voucher'
        >
          <TicketPercent className='size-5 sm:mr-1.5' />
          <span className='hidden sm:inline'>Voucher</span>
        </Button> */}
      </div>

      <Dialog open={voucherOpen} onOpenChange={setVoucherOpen}>
        <DialogContent className='max-h-[min(90dvh,560px)] gap-0 overflow-hidden p-0 sm:max-w-md'>
          <DialogHeader className='border-b border-border px-4 py-4 sm:px-5'>
            <DialogTitle className='text-lg font-bold text-foreground'>
              Mã giảm giá
            </DialogTitle>
            <DialogDescription className='text-left text-sm'>
              Chọn một voucher để giảm trừ trên tiền thuê (không áp dụng tiền
              cọc).
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[min(60dvh,420px)] space-y-2 overflow-y-auto px-4 py-3 sm:px-5'>
            {vouchers.map((v) => {
              const preview = computeVoucherDiscount(totalRental, v);
              const disabled = preview <= 0;
              return (
                <div
                  key={v.id}
                  className='rounded-xl border border-border/80 bg-muted/30 p-3 dark:bg-muted/20'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='font-mono text-xs font-bold text-rose-600 dark:text-rose-400'>
                        {v.code}
                      </p>
                      <p className='mt-0.5 text-sm font-semibold text-foreground'>
                        {v.title}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {v.description}
                      </p>
                      {v.minRental != null && (
                        <p className='mt-1 text-[11px] text-muted-foreground'>
                          Đơn tối thiểu: {v.minRental.toLocaleString()}₫ tiền
                          thuê
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-xs text-muted-foreground'>
                      {disabled
                        ? 'Chưa đủ điều kiện'
                        : `Giảm ~${preview.toLocaleString()}₫ cho đơn hiện tại`}
                    </span>
                    <Button
                      type='button'
                      size='sm'
                      disabled={disabled || appliedVoucher?.id === v.id}
                      variant={
                        appliedVoucher?.id === v.id ? 'secondary' : 'default'
                      }
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
            <div className='border-t border-border bg-muted/40 px-4 py-3 dark:bg-muted/20 sm:px-5'>
              <Button
                type='button'
                variant='ghost'
                className='w-full text-destructive hover:text-destructive'
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
