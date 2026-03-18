import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
}

const formatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function ProductCard({ product }: ProductCardProps) {
  const monthlyPrice = product.dailyPrice;
  const oldMonthly = product.oldDailyPrice;

  const displayColors = product.colors?.length
    ? product.colors
    : product.color
      ? [{ name: product.color, hex: '#c9c9c9' }]
      : [];

  const hasColors = displayColors.length > 0;

  return (
    <article className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-white p-7 shadow-sm transition-transform duration-500 hover:-translate-y-1 hover:shadow-md'>
      <div className='absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-sm'>
        <Heart className='size-4 text-muted-foreground' />
      </div>

      {product.badge && (
        <span className='btn-gradient-accent absolute left-3 top-3 z-10 text-xs font-semibold text-white shadow-sm'>
          {product.badge}
        </span>
      )}

      {/* SLOT 1: Title + description (fixed block height) */}
      <header className='flex h-24 flex-col items-center justify-start text-center mt-2.5 mb-3.5'>
        <h3 className='line-clamp-2 min-h-12 text-lg font-semibold text-text-main'>
          {product.name}
        </h3>
        <p className='line-clamp-2 min-h-10 text-sm text-text-sub'>
          {product.description}
        </p>
      </header>

      {/* SLOT 2: Image area (fixed height) */}
      <div className='relative h-56 w-full'>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes='(min-width: 1024px) 300px, 50vw'
          className='object-contain transition-transform duration-500 group-hover:scale-105'
        />
      </div>

      {/* SLOT 3 + 4: Colors (reserved space) + Price pinned to bottom */}
      <div className='flex flex-1 flex-col pt-2'>
        <div className='flex h-10 items-center justify-center'>
          {hasColors ? (
            <div className='flex w-full flex-wrap items-center justify-center gap-2'>
              {displayColors.slice(0, 5).map((c) => (
                <button
                  key={`${product.productId}-${c.name}`}
                  type='button'
                  aria-label={c.name}
                  title={c.name}
                  className='size-3.5 rounded-full border border-white shadow ring-1 ring-black/10 transition hover:scale-110'
                  style={{ backgroundColor: c.hex }}
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
              {formatter.format(monthlyPrice)}
            </span>
            {/* <span className='text-sm font-medium text-text-sub'>/ tháng</span> */}
            {oldMonthly && (
              <span className='text-sm text-text-sub line-through'>
                {formatter.format(oldMonthly)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
