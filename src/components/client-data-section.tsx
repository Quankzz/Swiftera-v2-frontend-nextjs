'use client';

import { useQuery } from '@tanstack/react-query';
import { useCounterStore } from '@/stores/use-counter-store';

async function fetchDemoPost(id: number) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json() as Promise<{ title: string; body: string }>;
}

/**
 * Client Component - Sử dụng TanStack Query, Zustand, React Context
 */
export function ClientDataSection() {
  const { count, increment, decrement, reset } = useCounterStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', 2],
    queryFn: () => fetchDemoPost(2),
  });

  return (
    <section className='space-y-6'>
      {/* TanStack Query */}
      <div className='rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
          TanStack Query
        </h2>
        {isLoading && <p className='text-zinc-500'>Đang tải...</p>}
        {error && (
          <p className='text-red-500'>Lỗi: {(error as Error).message}</p>
        )}
        {data && (
          <div className='space-y-2 text-sm text-zinc-600 dark:text-zinc-400'>
            <p>
              <span className='font-medium text-zinc-700 dark:text-zinc-300'>
                Title:
              </span>{' '}
              {data.title}
            </p>
            <p className='line-clamp-2'>{data.body}</p>
          </div>
        )}
      </div>

      {/* Zustand */}
      <div className='rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
          Zustand Store
        </h2>
        <div className='flex items-center gap-4'>
          <span className='text-2xl font-bold text-zinc-900 dark:text-zinc-50'>
            {count}
          </span>
          <div className='flex gap-2'>
            <button
              onClick={decrement}
              className='rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
            >
              -
            </button>
            <button
              onClick={increment}
              className='rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
            >
              +
            </button>
            <button
              onClick={reset}
              className='rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
            >
              Reset
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
