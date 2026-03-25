import { getPost } from '@/api/apiService';

/**
 * Server Component - Sử dụng Native Fetch
 * Component này chạy trên server, fetch data trực tiếp không cần client JS
 */

export async function ServerDataSection() {
  let data: { id: number; title: string; body: string } | null = null;
  let error: string | null = null;

  try {
    data = await getPost(1);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Không thể tải dữ liệu';
  }

  if (error) {
    return (
      <section className='rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
        <h2 className='mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
          Server Component + Native Fetch
        </h2>
        <p className='text-amber-600 dark:text-amber-400'>{error}</p>
        <p className='mt-2 text-xs text-zinc-500'>
          Chạy{' '}
          <code className='rounded bg-zinc-100 px-1 dark:bg-zinc-800'>
            npm run dev
          </code>{' '}
          và mở trình duyệt để test với API thật
        </p>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className='rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'>
      <h2 className='mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50'>
        Server Component + Native Fetch
      </h2>
      <div className='space-y-2 text-sm text-zinc-600 dark:text-zinc-400'>
        <p>
          <span className='font-medium text-zinc-700 dark:text-zinc-300'>
            ID:
          </span>{' '}
          {data.id}
        </p>
        <p>
          <span className='font-medium text-zinc-700 dark:text-zinc-300'>
            Title:
          </span>{' '}
          {data.title}
        </p>
        <p className='line-clamp-2'>{data.body}</p>
      </div>
      <p className='mt-3 text-xs text-zinc-500'>
        Data được fetch trực tiếp từ server, không cần JavaScript ở client
      </p>
    </section>
  );
}
