import { cn } from '@/lib/utils';

/** Animated skeleton placeholder for a single ProductCard. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card p-4',
        'animate-pulse',
        className,
      )}
    >
      {/* Image placeholder */}
      <div className='aspect-square w-full rounded-xl bg-gray-200 dark:bg-white/8' />

      <div className='mt-4 space-y-2.5'>
        {/* Category badge */}
        <div className='h-4 w-20 rounded-full bg-gray-200 dark:bg-white/8' />
        {/* Title */}
        <div className='h-5 w-full rounded-md bg-gray-200 dark:bg-white/8' />
        <div className='h-5 w-3/4 rounded-md bg-gray-200 dark:bg-white/8' />
        {/* Price row */}
        <div className='flex items-center justify-between pt-1'>
          <div className='h-6 w-28 rounded-md bg-gray-200 dark:bg-white/8' />
          <div className='h-8 w-8 rounded-full bg-gray-200 dark:bg-white/8' />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton cards - used while products are loading. */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
