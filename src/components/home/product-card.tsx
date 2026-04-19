import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  /** 'storefront' = homepage card với hover effects (mặc định)
   *  'preview' = live preview trong form, không có interaction */
  variant?: 'storefront' | 'preview';
}

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function getSalePercent(daily: number, oldDaily: number): number {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

export function ProductCard({
  product,
  variant = 'storefront',
}: ProductCardProps) {
  const isPreview = variant === 'preview';

  const primaryImage = (() => {
    const img =
      product.productImages.find((img) => img.isPrimary) ??
      product.productImages[0];
    return img?.imageUrl ? img : null;
  })();

  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? getSalePercent(product.dailyPrice, product.oldDailyPrice)
      : null;

  const displayColors = product.colors ?? [];
  const hasColors = displayColors.length > 0;
  return (
    <Link
      href={`/product/${product.productId}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/75 dark:border-white/6 bg-white dark:bg-surface-card p-7 shadow-sm dark:shadow-black/30',
        !isPreview &&
          'transition-transform duration-500 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-black/50',
      )}
    >
      {!isPreview && (
        <div
          className='absolute right-3 top-3 z-10 rounded-full bg-white/90 dark:bg-white/10 p-2 shadow-sm'
          onClick={(e) => e.preventDefault()}
        >
          <Heart className='size-4 text-muted-foreground' />
        </div>
      )}

      {salePercent !== null && (
        <span className='btn-gradient-accent absolute left-3 top-3 z-10 text-xs font-semibold text-white shadow-sm'>
          -{salePercent}%
        </span>
      )}

      {/* SLOT 1: Title */}
      <header className='mt-2.5 mb-3.5 flex flex-col items-center justify-start text-center'>
        <h3 className='line-clamp-2 min-h-12 text-lg font-semibold text-text-main'>
          {product.name || (
            <span className='italic text-text-sub opacity-50'>
              Tên sản phẩm
            </span>
          )}
        </h3>
        <p className='line-clamp-2 min-h-10 text-sm text-text-sub'>
          {product.shortDescription}
        </p>
      </header>

      {/* SLOT 2: Image area (fixed height) */}
      <div className='relative h-56 w-full'>
        {primaryImage ? (
          <Image
            src={primaryImage.imageUrl}
            alt={product.name}
            fill
            sizes='(min-width: 1024px) 300px, 50vw'
            className={cn(
              'object-contain',
              !isPreview &&
                'transition-transform duration-500 group-hover:scale-105',
            )}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center rounded-md bg-gray-100 dark:bg-white/8 text-xs text-text-sub'>
            Chưa có ảnh
          </div>
        )}
      </div>

      {/* SLOT 3 + 4: Colors (reserved space) + Price pinned to bottom */}
      <div className='flex flex-1 flex-col pt-2'>
        <div className='flex h-10 items-center justify-center'>
          {hasColors ? (
            <div className='flex w-full flex-wrap items-center justify-center gap-2'>
              {displayColors.slice(0, 5).map((c) => (
                <span
                  key={`${product.productId}-${c.name}`}
                  aria-label={c.name}
                  title={c.name}
                  className='size-3.5 rounded-full border border-white shadow ring-1 ring-black/10'
                  style={{ backgroundColor: c.value }}
                />
              ))}
              {displayColors.length > 5 && (
                <span className='text-xs text-text-sub'>
                  +{displayColors.length - 5}
                </span>
              )}
            </div>
          ) : (
            <span className='invisible text-xs'>no-colors</span>
          )}
        </div>

        <div className='mt-auto text-center'>
          <div className='flex items-baseline justify-center gap-2 text-theme-accent-start'>
            <span className='text-sm font-medium text-text-sub'>Từ</span>
            <span className='text-xl font-bold'>
              {product.dailyPrice ? (
                formatter.format(product.dailyPrice)
              ) : (
                <span className='text-text-sub italic text-base'>-</span>
              )}
            </span>
            {product.oldDailyPrice && (
              <span className='text-sm text-text-sub line-through'>
                {formatter.format(product.oldDailyPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
