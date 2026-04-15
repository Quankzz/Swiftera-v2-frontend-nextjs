import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className='min-h-screen bg-white dark:bg-surface-base'>
      {/* Hero skeleton */}
      <div className='relative flex min-h-[80vh] items-center bg-gray-100 dark:bg-[#0f0f0f] px-6 lg:px-18 py-16'>
        <div className='relative z-10 mx-auto w-full max-w-7xl grid grid-cols-12 gap-12 items-center'>
          <div className='col-span-12 lg:col-span-6 flex flex-col gap-5'>
            <Skeleton className='h-20 w-4/5' />
            <Skeleton className='h-16 w-3/5' />
            <Skeleton className='h-5 w-full max-w-lg mt-4' />
            <Skeleton className='h-5 w-3/4 max-w-md' />
          </div>
        </div>
      </div>

      {/* Categories section */}
      <div className='mx-auto max-w-full px-4 lg:px-18'>
        <div className='mt-14 space-y-6'>
          <div>
            <Skeleton className='h-9 w-32' />
            <Skeleton className='h-4 w-64 mt-2' />
          </div>
          <div className='flex gap-3 overflow-hidden pb-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-52 w-56 shrink-0 rounded-md' />
            ))}
          </div>
        </div>

        {/* Products skeleton */}
        <div className='mt-16 space-y-6'>
          <Skeleton className='h-8 w-48' />
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='space-y-3'>
                <Skeleton className='h-48 w-full rounded-xl' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
