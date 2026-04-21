'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, Heart, HeartOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteProducts } from '@/hooks/use-favorite-products';
import { buildLoginHref } from '@/lib/auth-redirect';
import { ProductCard } from '@/components/home/product-card';
import { productKeys } from '@/features/products/api/product.keys';
import { getProductById } from '@/features/products/api/product.service';
import { toLocalProduct } from '@/features/products/hooks/use-home-products';
import type { ProductResponse } from '@/features/products/types';

function FavoriteCardSkeleton() {
  return (
    <div className='rounded-2xl border border-border/60 bg-card p-4 shadow-sm'>
      <Skeleton className='h-44 w-full rounded-xl' />
      <Skeleton className='mt-3 h-5 w-3/4' />
      <Skeleton className='mt-2 h-4 w-full' />
      <Skeleton className='mt-1 h-4 w-1/2' />
    </div>
  );
}

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    favoriteIds,
    clearFavorites,
    isLoadingFavorites,
    hasWishlistError,
    isUpdatingFavorites,
  } = useFavoriteProducts();

  const productQueries = useQueries({
    queries: (isAuthenticated ? favoriteIds : []).map((productId) => ({
      queryKey: productKeys.detail(productId),
      queryFn: () => getProductById(productId),
      staleTime: 60_000,
    })),
  });

  const favoriteProducts = useMemo(() => {
    const map = new Map<string, ProductResponse>();
    for (const query of productQueries) {
      if (query.data?.productId) {
        map.set(query.data.productId, query.data);
      }
    }
    return favoriteIds
      .map((id) => map.get(id))
      .filter((p): p is ProductResponse => Boolean(p));
  }, [favoriteIds, productQueries]);

  const isLoadingProducts =
    isLoadingFavorites ||
    (favoriteIds.length > 0 &&
      productQueries.some((q) => q.isLoading || q.isFetching));
  const hasLoadError =
    hasWishlistError || productQueries.some((q) => q.isError);

  const handleClearFavorites = async () => {
    try {
      const cleared = await clearFavorites();
      if (!cleared) return;
      toast.success('Đã xóa toàn bộ danh sách yêu thích.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể xóa danh sách yêu thích.';
      toast.error(message);
    }
  };

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Layout stickyHeader>
        <main className='bg-background pb-16 pt-12'>
          <section className='mx-auto w-full max-w-3xl px-4 text-center sm:px-6'>
            <div className='rounded-3xl border border-border/60 bg-card px-6 py-10 shadow-sm'>
              <div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/35 dark:text-blue-300'>
                <Heart className='size-7' />
              </div>
              <h1 className='mt-4 text-2xl font-black text-foreground'>
                Danh sách sản phẩm yêu thích
              </h1>
              <p className='mt-2 text-sm text-muted-foreground sm:text-base'>
                Vui lòng đăng nhập để lưu và quản lý sản phẩm yêu thích của
                riêng bạn.
              </p>
              <div className='mt-6 flex flex-wrap justify-center gap-2'>
                <Button
                  className='h-10 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700'
                  render={<Link href={buildLoginHref('/favorites')} />}
                >
                  Đăng nhập để tiếp tục
                </Button>
                <Button
                  variant='outline'
                  className='h-10 rounded-xl'
                  render={<Link href='/catalog' />}
                >
                  Đi tới danh mục
                </Button>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    );
  }

  return (
    <Layout stickyHeader>
      <main className='bg-background pb-16 pt-10'>
        <section className='mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10'>
          <div className='rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <p className='inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/30 dark:text-blue-300'>
                  <Sparkles className='size-3.5' />
                  Bộ sưu tập cá nhân
                </p>
                <h1 className='mt-3 text-3xl font-black tracking-tight text-foreground'>
                  Danh sách sản phẩm yêu thích
                </h1>
                <p className='mt-2 text-sm text-muted-foreground sm:text-base'>
                  Lưu nhanh các sản phẩm bạn quan tâm để so sánh giá thuê, quay
                  lại xem sau hoặc thêm vào giỏ hàng bất cứ lúc nào.
                </p>
              </div>

              {favoriteIds.length > 0 && (
                <Button
                  variant='outline'
                  className='h-9 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-950/40'
                  onClick={() => void handleClearFavorites()}
                  disabled={isUpdatingFavorites}
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            <div className='mt-5 flex flex-wrap items-center gap-2'>
              <Badge className='rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground'>
                Tổng yêu thích: {favoriteIds.length}
              </Badge>
              <Badge className='rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground'>
                Hiển thị: {favoriteProducts.length}
              </Badge>
            </div>

            {isLoadingProducts && (
              <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {Array.from({
                  length: Math.min(8, Math.max(1, favoriteIds.length)),
                }).map((_, i) => (
                  <FavoriteCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoadingProducts && favoriteIds.length === 0 && (
              <div className='mt-8 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center'>
                <div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground'>
                  <HeartOff className='size-7' />
                </div>
                <p className='mt-4 text-lg font-bold text-foreground'>
                  Chưa có sản phẩm yêu thích nào
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Nhấn biểu tượng trái tim ở trang chủ hoặc danh mục để lưu sản
                  phẩm bạn thích.
                </p>
                <Button
                  className='mt-5 h-10 rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700'
                  render={<Link href='/catalog' />}
                >
                  Khám phá sản phẩm
                  <ArrowRight className='size-4' />
                </Button>
              </div>
            )}

            {!isLoadingProducts && favoriteProducts.length > 0 && (
              <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={toLocalProduct(product)}
                  />
                ))}
              </div>
            )}

            {!isLoadingProducts && hasLoadError && (
              <p className='mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300'>
                Một vài sản phẩm yêu thích hiện không thể tải lại dữ liệu. Bạn
                có thể bỏ thích và lưu lại sản phẩm đó sau.
              </p>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
