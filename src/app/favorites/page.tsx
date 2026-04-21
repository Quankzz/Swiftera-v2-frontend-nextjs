'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import {
  ArrowRight,
  Heart,
  HeartOff,
  Loader2,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteProducts } from '@/hooks/use-favorite-products';
import { buildLoginHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';
import { useAddToCart } from '@/hooks/api/use-cart';
import { productKeys } from '@/features/products/api/product.keys';
import { getProductById } from '@/features/products/api/product.service';
import type { ProductResponse } from '@/features/products/types';

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function getPrimaryImage(product: ProductResponse): string | null {
  const images = product.images ?? [];
  if (!images.length) return null;
  const primary = images.find((img) => img.isPrimary);
  return primary?.imageUrl ?? images[0]?.imageUrl ?? null;
}

function getDiscountPercent(product: ProductResponse): number | null {
  if (!product.oldDailyPrice || product.oldDailyPrice <= product.dailyPrice) {
    return null;
  }

  return Math.round(
    ((product.oldDailyPrice - product.dailyPrice) / product.oldDailyPrice) * 100,
  );
}

function FavoriteCardSkeleton() {
  return (
    <article className='rounded-2xl border border-border/60 bg-card p-4 shadow-sm'>
      <Skeleton className='h-44 w-full rounded-xl' />
      <Skeleton className='mt-3 h-5 w-3/4' />
      <Skeleton className='mt-2 h-4 w-full' />
      <Skeleton className='mt-1 h-4 w-1/2' />
      <div className='mt-4 flex gap-2'>
        <Skeleton className='h-9 w-full rounded-xl' />
        <Skeleton className='h-9 w-full rounded-xl' />
      </div>
    </article>
  );
}

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    favoriteIds,
    removeFavorite,
    clearFavorites,
    isLoadingFavorites,
    hasWishlistError,
    isUpdatingFavorites,
  } = useFavoriteProducts();

  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const { mutateAsync: addToCartApi } = useAddToCart();

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
      .filter((product): product is ProductResponse => Boolean(product));
  }, [favoriteIds, productQueries]);

  const isLoadingProducts =
    isLoadingFavorites ||
    (favoriteIds.length > 0 &&
      productQueries.some((query) => query.isLoading || query.isFetching));
  const hasLoadError =
    hasWishlistError || productQueries.some((query) => query.isError);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const removed = await removeFavorite(productId);
      if (!removed) return;
      toast.success('Đã bỏ khỏi danh sách yêu thích.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật danh sách yêu thích.';
      toast.error(message);
    }
  };

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

  const handleAddToCart = async (product: ProductResponse) => {
    setAddingProductId(product.productId);
    try {
      await addToCartApi({
        productId: product.productId,
        productColorId: product.colors?.[0]?.productColorId,
        rentalDurationDays: Math.max(1, product.minRentalDays ?? 1),
        quantity: 1,
      });
      toast.success('Đã thêm sản phẩm yêu thích vào giỏ hàng.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể thêm sản phẩm vào giỏ hàng.';
      toast.error(message);
    } finally {
      setAddingProductId(null);
    }
  };

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Layout stickyHeader>
        <main className='bg-background pb-16 pt-12'>
          <section className='mx-auto w-full max-w-3xl px-4 text-center sm:px-6'>
            <div className='rounded-3xl border border-border/60 bg-card px-6 py-10 shadow-sm'>
              <div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/35 dark:text-rose-300'>
                <Heart className='size-7' />
              </div>
              <h1 className='mt-4 text-2xl font-black text-foreground'>
                Danh sách sản phẩm yêu thích
              </h1>
              <p className='mt-2 text-sm text-muted-foreground sm:text-base'>
                Vui lòng đăng nhập để lưu và quản lý sản phẩm yêu thích của riêng bạn.
              </p>
              <div className='mt-6 flex flex-wrap justify-center gap-2'>
                <Button
                  className='h-10 rounded-xl bg-rose-600 px-5 text-white hover:bg-rose-700'
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
                <p className='inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-300'>
                  <Sparkles className='size-3.5' />
                  Bộ sưu tập cá nhân
                </p>
                <h1 className='mt-3 text-3xl font-black tracking-tight text-foreground'>
                  Danh sách sản phẩm yêu thích
                </h1>
                <p className='mt-2 text-sm text-muted-foreground sm:text-base'>
                  Lưu nhanh các sản phẩm bạn quan tâm để so sánh giá thuê, quay lại xem sau hoặc thêm vào giỏ hàng bất cứ lúc nào.
                </p>
              </div>

              {favoriteIds.length > 0 && (
                <Button
                  variant='outline'
                  className='h-9 rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800/60 dark:text-rose-300 dark:hover:bg-rose-950/40'
                  onClick={() => {
                    void handleClearFavorites();
                  }}
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
              <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {Array.from({ length: Math.min(6, Math.max(1, favoriteIds.length)) }).map(
                  (_, index) => (
                    <FavoriteCardSkeleton key={index} />
                  ),
                )}
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
                  Nhấn biểu tượng trái tim ở trang chủ hoặc danh mục để lưu sản phẩm bạn thích.
                </p>
                <Button
                  className='mt-5 h-10 rounded-xl bg-rose-600 px-5 text-white hover:bg-rose-700'
                  render={<Link href='/catalog' />}
                >
                  Khám phá sản phẩm
                  <ArrowRight className='size-4' />
                </Button>
              </div>
            )}

            {!isLoadingProducts && favoriteProducts.length > 0 && (
              <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {favoriteProducts.map((product) => {
                  const imageUrl = getPrimaryImage(product);
                  const discountPercent = getDiscountPercent(product);
                  const isAdding = addingProductId === product.productId;

                  return (
                    <article
                      key={product.productId}
                      className='group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'
                    >
                      <button
                        type='button'
                        onClick={() => {
                          void handleRemoveFavorite(product.productId);
                        }}
                        className='absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55'
                        title='Bỏ yêu thích'
                        aria-label='Bỏ yêu thích'
                        disabled={isUpdatingFavorites}
                      >
                        <Heart className='size-4 fill-current' />
                      </button>

                      <Link href={`/product/${product.productId}`}>
                        <div className='overflow-hidden rounded-xl border border-border/60 bg-muted/20'>
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              width={640}
                              height={360}
                              className='h-44 w-full object-cover transition-transform duration-500 group-hover:scale-102'
                            />
                          ) : (
                            <div className='flex h-44 items-center justify-center text-sm text-muted-foreground'>
                              Chưa có ảnh sản phẩm
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className='mt-3'>
                        <Link href={`/product/${product.productId}`}>
                          <h2 className='line-clamp-2 text-base font-bold text-foreground transition-colors hover:text-rose-600 dark:hover:text-rose-300'>
                            {product.name}
                          </h2>
                        </Link>
                        <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                          {product.shortDescription || product.description || 'Sản phẩm cho thuê công nghệ chất lượng cao.'}
                        </p>

                        <div className='mt-2 flex items-center gap-2'>
                          {discountPercent != null && (
                            <span className='rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white'>
                              -{discountPercent}%
                            </span>
                          )}
                          <span className='text-xs text-muted-foreground'>
                            Thuê tối thiểu {Math.max(1, product.minRentalDays)} ngày
                          </span>
                        </div>

                        <div className='mt-3 flex items-end gap-2'>
                          <span className='text-lg font-black text-rose-600 dark:text-rose-300'>
                            {money.format(product.dailyPrice)}
                          </span>
                          {product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice && (
                            <span className='text-sm text-muted-foreground line-through'>
                              {money.format(product.oldDailyPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='mt-4 flex items-center gap-2'>
                        <Button
                          variant='outline'
                          className='h-9 flex-1 rounded-xl'
                          render={<Link href={`/product/${product.productId}`} />}
                        >
                          Xem sản phẩm
                        </Button>
                        <Button
                          className={cn(
                            'h-9 flex-1 gap-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700',
                            isAdding && 'cursor-wait opacity-80',
                          )}
                          onClick={() => void handleAddToCart(product)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className='size-4 animate-spin' />
                          ) : (
                            <ShoppingCart className='size-4' />
                          )}
                          {isAdding ? 'Đang thêm' : 'Thêm giỏ hàng'}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {!isLoadingProducts && hasLoadError && (
              <p className='mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300'>
                Một vài sản phẩm yêu thích hiện không thể tải lại dữ liệu. Bạn có thể bỏ thích và lưu lại sản phẩm đó sau.
              </p>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}
