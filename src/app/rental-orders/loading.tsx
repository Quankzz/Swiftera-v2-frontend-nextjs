import { Skeleton } from '@/components/ui/skeleton';

export default function RentalOrdersLoading() {
  return (
    <div className='min-h-screen bg-muted/30 px-3 pb-16 pt-20 font-sans sm:px-4 sm:pt-4 md:px-6 md:pt-8 dark:bg-background'>
      <div className='mx-auto max-w-3xl'>
        {/* Page header skeleton */}
        <div className='mb-6 space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>

        {/* Main card */}
        <div className='overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm'>
          {/* Tab bar skeleton */}
          <div className='flex gap-1 border-b border-border/60 px-4 py-1 overflow-hidden'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-9 w-20 shrink-0 rounded-md' />
            ))}
          </div>

          {/* Controls row */}
          <div className='flex items-center gap-3 border-b border-border/60 px-4 py-3'>
            <Skeleton className='h-9 flex-1 rounded-lg' />
            <Skeleton className='h-9 w-32 rounded-lg' />
          </div>

          {/* Order rows */}
          <div className='divide-y divide-border/60'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 px-5 py-4'>
                <Skeleton className='size-10 shrink-0 rounded-xl' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-48' />
                </div>
                <div className='space-y-2 text-right'>
                  <Skeleton className='ml-auto h-4 w-24' />
                  <Skeleton className='ml-auto h-5 w-20' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
