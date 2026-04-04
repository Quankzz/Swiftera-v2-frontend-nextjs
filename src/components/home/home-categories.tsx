'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useHomeCategoriesQuery } from '@/features/categories/hooks/use-home-categories';
import { CategoryCarousel } from './category-carousel';

// ── Loading skeleton ──────────────────────────────────────────────────────────

function CategoriesSkeleton() {
  return (
    <div className='flex gap-3 overflow-hidden pb-2 pt-2'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='min-w-56 max-w-60 flex-1 shrink-0'>
          <Skeleton className='h-52 w-full rounded-md' />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HomeCategories() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useHomeCategoriesQuery();

  if (isLoading) return <CategoriesSkeleton />;

  if (isError || categories.length === 0) {
    return (
      <p className='py-8 text-center text-sm text-text-sub'>
        Không thể tải danh mục. Vui lòng thử lại sau.
      </p>
    );
  }

  return <CategoryCarousel items={categories} />;
}
