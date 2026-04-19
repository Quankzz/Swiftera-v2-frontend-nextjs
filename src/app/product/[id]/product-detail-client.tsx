'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  RentalProductGallery,
  RentalProductSummary,
  RentalCheckoutCard,
  type RentalDuration,
} from '@/components/product-detail/rental-product-hero';
import {
  RentalDeliverySection,
  RentalProcessSection,
} from '@/components/product-detail/rental-product-sidebar';
import {
  RentalSpecifications,
  RentalProductDescription,
} from '@/components/product-detail/rental-product-content';
import {
  RentalReviewsSection,
  RentalRelatedProducts,
} from '@/components/product-detail/rental-product-relations';
import { useProductDetailQuery } from '@/features/products/hooks/use-product-detail';
import { useProductReviewsQuery } from '@/hooks/api/use-reviews';
import { useMyOrdersQuery } from '@/hooks/api/use-rental-orders';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

function buildDurations(
  dailyPrice: number,
  oldDailyPrice: number | undefined,
  minRentalDays: number,
): RentalDuration[] {
  const packs = [
    { days: 1, label: '1 ngày' },
    { days: 2, label: '2 ngày' },
    { days: 3, label: '3 ngày' },
    { days: 5, label: '5 ngày' },
    { days: 7, label: '7 ngày' },
    { days: 14, label: '14 ngày' },
    { days: 30, label: '30 ngày' },
  ];
  return packs
    .filter((p) => p.days >= minRentalDays)
    .map((p) => {
      const total = Math.round(dailyPrice * p.days);
      const original =
        oldDailyPrice != null ? Math.round(oldDailyPrice * p.days) : undefined;
      return {
        id: String(p.days),
        label: p.label,
        price: total,
        originalPrice: original && original > total ? original : undefined,
      };
    });
}

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

interface ProductDetailClientProps {
  productId: string;
  initialReviewsMeta?: { totalItems: number } | null;
}

export default function ProductDetailClient({
  productId,
  initialReviewsMeta,
}: ProductDetailClientProps) {
  const currentUserId = useAuthStore((s) => s.user?.userId ?? null);

  const {
    data: product,
    isLoading,
    isError,
  } = useProductDetailQuery(productId);

  const { data: ordersData } = useMyOrdersQuery(
    { size: 50 },
    { enabled: !!currentUserId },
  );

  const { data: reviewsMeta } = useProductReviewsQuery(productId, {
    page: 1,
    size: 1,
  });

  const completedOrderId =
    ordersData?.items?.find(
      (o) =>
        o.status === 'COMPLETED' &&
        o.rentalOrderLines.some((l) => l.productId === productId),
    )?.rentalOrderId ?? null;

  const reviewsCount = reviewsMeta?.totalItems ?? initialReviewsMeta?.totalItems ?? 0;

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<string>(String(1));
  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  const defaultDurationId = String(product?.minRentalDays ?? 1);

  const durations = product?.dailyPrice
    ? buildDurations(
        product.dailyPrice,
        product.oldDailyPrice as unknown as number | undefined,
        product.minRentalDays ?? 1,
      )
    : [];

  const imageUrls = product?.images?.length
    ? [...product.images]
        .sort((a, b) => b.sortOrder - a.sortOrder)
        .map((img) => img.imageUrl)
    : [];

  const effectiveDurationId =
    durations.find((d) => d.id === selectedDuration) != null
      ? selectedDuration
      : defaultDurationId;

  const currentDuration = (() => {
    const found = durations.find((d) => d.id === effectiveDurationId);
    if (found) return found;
    const days = parseInt(effectiveDurationId, 10);
    if (!isNaN(days) && days >= (product?.minRentalDays ?? 1) && product?.dailyPrice) {
      const total = Math.round(product.dailyPrice * days);
      const original = product.oldDailyPrice
        ? Math.round(product.oldDailyPrice * days)
        : undefined;
      return {
        id: String(days),
        label: `${days} ngày`,
        price: total,
        originalPrice: original && original > total ? original : undefined,
      } as RentalDuration;
    }
    return durations.find((d) => d.id === defaultDurationId) ?? durations[0];
  })();

  const currentPrice = currentDuration?.price ?? product?.dailyPrice ?? 0;
  const originalPrice = currentDuration?.originalPrice;

  const discount = useMemo(() => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice)
      return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [originalPrice, currentPrice]);

  const colors = useMemo(() => product?.colors ?? [], [product?.colors]);

  const selectedColor = useMemo(
    () => colors.find((c) => c.productColorId === selectedColorId) ?? null,
    [colors, selectedColorId],
  );

  const requireColorSelection = colors.length > 1 && !selectedColorId;

  const maxQuantity =
    selectedColorId && selectedColor
      ? selectedColor.availableQuantity ?? 99
      : (product?.availableStock ?? 99);

  const safeQuantity = Math.min(quantity, maxQuantity);

  function handleQuantityChange(nextQty: number) {
    setQuantity(Math.max(1, Math.min(maxQuantity, nextQty)));
  }

  const specifications = useMemo(() => {
    if (!product) return [];
    return [
    { label: 'Thương hiệu', value: product.brand ?? '-' },
    { label: 'Danh mục', value: product.categoryName ?? '-' },
    { label: 'Màu sắc', value: colors && colors.length > 0 ? colors.map((c) => c.name).join(', ') : '-' },
      {
        label: 'Số ngày thuê tối thiểu',
        value: `${product.minRentalDays} ngày`,
      },
      {
        label: 'Tiền cọc',
        value: product.depositAmount
          ? `${formatter.format(product.depositAmount)} (hoàn trả khi trả thiết bị)`
          : '-',
      },
      {
        label: 'Đánh giá',
        value: product.averageRating
          ? `${product.averageRating} / 5`
          : 'Chưa có đánh giá',
      },
    ];
  }, [product]);

  const shortDesc = useMemo(
    () => product?.shortDescription ?? null,
    [product?.shortDescription],
  );

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white font-sans dark:bg-surface-base'>
        <div className='mx-auto max-w-7xl px-3 pb-8 pt-8 sm:px-4 sm:pb-10 sm:pt-8 md:px-6 md:pt-8'>
          <Skeleton className='mb-6 h-4 w-64' />
          <div className='grid grid-cols-12 gap-4 sm:gap-6'>
            <div className='col-span-12 lg:col-span-5'>
              <Skeleton className='aspect-square w-full rounded-xl' />
            </div>
            <div className='col-span-12 lg:col-span-7'>
              <Skeleton className='h-80 w-full rounded-xl' />
              <Skeleton className='mt-4 h-40 w-full rounded-xl' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-sans dark:bg-surface-base'>
        <p className='text-lg font-semibold text-text-sub'>
          Không tìm thấy sản phẩm.
        </p>
        <Link
          href='/'
          className='text-sm font-medium text-rose-600 hover:underline dark:text-rose-400'
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white font-sans dark:bg-surface-base'>
      <div className='mx-auto max-w-7xl px-3 pb-8 pt-8 sm:px-4 sm:pb-10 sm:pt-8 md:px-6 md:pt-8'>
        {/* Breadcrumb */}
        <nav className='mb-4 text-xs text-muted-foreground sm:mb-6 sm:text-sm'>
          <ol className='flex flex-wrap items-center gap-x-1.5 gap-y-1'>
            <li>
              <Link
                href='/'
                className='flex items-center gap-1 font-medium text-rose-600 transition-colors hover:underline dark:text-rose-400'
              >
                Trang chủ
              </Link>
            </li>
            <li className='text-border'>
              <ChevronRight className='size-3' />
            </li>
            <li>
              <Link
                href='/catalog'
                className='font-medium text-rose-600 transition-colors hover:underline dark:text-rose-400'
              >
                {product.categoryName || 'Sản phẩm'}
              </Link>
            </li>
            <li className='text-border'>
              <ChevronRight className='size-3' />
            </li>
            <li className='min-w-0 max-w-full flex-[1_1_100%] font-semibold text-foreground sm:max-w-xs sm:flex-[unset] sm:truncate'>
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Hero: Gallery + Summary + Checkout */}
        <div className='grid grid-cols-12 gap-4 sm:gap-6'>
          {/* Gallery */}
          <div className='col-span-12 lg:col-span-5'>
            <div className='rounded-xl border border-border/60 bg-card p-3 ambient-glow sm:p-4 lg:sticky lg:top-24'>
              <RentalProductGallery
                images={imageUrls}
                currentImage={currentImage}
                setCurrentImage={setCurrentImage}
              />
            </div>
          </div>

          {/* Summary + Checkout */}
          <div className='col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-7'>
            {/* Product Summary */}
            <div className='rounded-xl border border-border/60 bg-card p-4 ambient-glow sm:p-5'>
              <RentalProductSummary
                productData={{
                  name: product.name,
                  sku: product.productId.slice(0, 8).toUpperCase(),
                  brand: product.brand ?? '-',
                  productType: product.categoryName ?? '-',
                  discount,
                  rating: product.averageRating ?? 0,
                  reviews: reviewsCount,
                  rentedCount: 0,
                  colors,
                  durations,
                }}
                minRentalDays={product.minRentalDays ?? 1}
                selectedColorId={selectedColorId}
                onColorChange={setSelectedColorId}
                selectedVariant='default'
                onVariantChange={() => {}}
                selectedDuration={effectiveDurationId}
                onDurationChange={setSelectedDuration}
                currentPrice={currentPrice}
                originalPrice={originalPrice}
              />
            </div>

            {/* Short description badge */}
            {shortDesc && (
              <div className='rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground'>
                {shortDesc}
              </div>
            )}

            {/* Checkout Card */}
            <RentalCheckoutCard
              rentalPrice={currentPrice}
              deposit={product.depositAmount ?? 0}
              selectedDuration={currentDuration?.label ?? '1 ngày'}
              durationId={effectiveDurationId}
              quantity={safeQuantity}
              setQuantity={handleQuantityChange}
              maxQuantity={maxQuantity}
              requireColorSelection={requireColorSelection}
              cartProduct={{
                productId: product.productId,
                name: product.name,
                image: imageUrls[0] ?? '',
                sku: product.productId.slice(0, 8).toUpperCase(),
                productColorId: selectedColorId,
                colorName: selectedColor?.name ?? null,
              }}
            />
          </div>
        </div>

        {/* Content: Description + Specifications + Sidebar */}
        <div className='mt-4 grid grid-cols-12 gap-4 sm:mt-6 sm:gap-6'>
          <div className='col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-8'>
            {product.description && (
              <div className='rounded-xl border border-border/60 bg-card p-4 ambient-glow sm:p-5'>
                <h2 className='mb-3 text-base font-bold tracking-tight text-foreground sm:mb-4 sm:text-lg'>
                  Mô tả sản phẩm
                </h2>
                <RentalProductDescription
                  text={product.description}
                  maxHeight={300}
                />
              </div>
            )}

            <RentalSpecifications specifications={specifications} />
          </div>

          <div className='col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-4'>
            <RentalDeliverySection />
            <RentalProcessSection />
          </div>
        </div>

        {/* Reviews */}
        <div className='mt-4 sm:mt-6'>
          <RentalReviewsSection
            productId={product.productId}
            rating={product.averageRating ?? 0}
            currentUserId={currentUserId}
            userCompletedOrderId={completedOrderId}
          />
        </div>

        {/* Related Products */}
        <div className='mt-4 sm:mt-6'>
          <RentalRelatedProducts currentProductId={product.productId} />
        </div>
      </div>
    </div>
  );
}
