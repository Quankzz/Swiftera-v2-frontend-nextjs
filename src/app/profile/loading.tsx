import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className='relative'>
      <div className='relative z-10'>
        {/* Header skeleton */}
        <div className='mb-12 flex flex-col items-center gap-4'>
          <Skeleton className='size-20 rounded-2xl' />
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-5 w-80' />
        </div>

        {/* Feature cards skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='rounded-xl p-6 border border-white/20 dark:border-white/8 bg-white/60 dark:bg-white/5'
            >
              <div className='flex items-center space-x-3 mb-3'>
                <Skeleton className='size-9 rounded-lg' />
                <Skeleton className='h-5 w-28' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4 mt-1' />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className='rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-6'>
          <Skeleton className='h-7 w-40' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-xl' />
              </div>
            ))}
          </div>
          <Skeleton className='h-11 w-36 rounded-xl' />
        </div>
      </div>
    </div>
  );
}
