'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  useHomeFeaturedProductsQuery,
  useHomeBudgetProductsQuery,
} from '@/features/products/hooks/use-home-products';
import { ProductCard } from './product-card';
import { ChevronRight } from 'lucide-react';

// ── Loading skeleton for a product grid ──────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className='h-80 w-full rounded-xl' />
      ))}
    </div>
  );
}

// ── Featured products section ─────────────────────────────────────────────────

export function HomeFeaturedProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useHomeFeaturedProductsQuery();

  return (
    <section className='mt-16 space-y-6'>
      <div className='flex items-end justify-between'>
        <div>
          <h2 className='text-3xl font-extrabold text-text-main'>
            Sản phẩm nổi bật
          </h2>
          <p className='text-text-sub'>
            Những lựa chọn được thuê nhiều nhất tuần này.
          </p>
        </div>

        <Link
          href='/catalog'
          className='text-md font-semibold text-theme-primary-start hover:text-theme-primary-end inline-flex items-center gap-1 transition-colors hover:gap-1.5'
        >
          Xem tất cả <ChevronRight className='size-4.5' />
        </Link>
      </div>

      {isLoading && <ProductGridSkeleton />}

      {!isLoading && (isError || products.length === 0) && (
        <p className='py-8 text-center text-sm text-text-sub'>
          Không thể tải sản phẩm. Vui lòng thử lại sau.
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Budget products section ───────────────────────────────────────────────────

export function HomeBudgetProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useHomeBudgetProductsQuery();

  return (
    <section className='mt-16 space-y-6'>
      <div className='flex items-end justify-between'>
        <div>
          <h2 className='text-3xl font-extrabold text-text-main'>
            Có thể bạn thích
          </h2>
          <p className='text-text-sub'>
            Lựa chọn phù hợp túi tiền, chất lượng vẫn đảm bảo.
          </p>
        </div>
        <Link
          href='/catalog'
          className='text-md font-semibold text-theme-primary-start hover:text-theme-primary-end inline-flex items-center gap-1 transition-colors hover:gap-1.5'
        >
          Xem tất cả <ChevronRight className='size-4.5' />
        </Link>
      </div>

      {isLoading && <ProductGridSkeleton />}

      {!isLoading && (isError || products.length === 0) && (
        <p className='py-8 text-center text-sm text-text-sub'>
          Không thể tải sản phẩm. Vui lòng thử lại sau.
        </p>
      )}

      {!isLoading && products.length > 0 && (
        <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
