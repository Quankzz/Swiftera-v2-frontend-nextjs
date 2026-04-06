'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
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
import { RentalStockSection } from '@/components/product-detail/rental-product-stock';
import { useProductDetailQuery } from '@/features/products/hooks/use-product-detail';
import { Skeleton } from '@/components/ui/skeleton';

/** Tạo các gói thời gian thuê từ dailyPrice của BE, lọc theo minRentalDays */
function buildDurations(
  dailyPrice: number,
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
      const total = dailyPrice * p.days;
      const discount = p.days >= 7 ? 0.15 : p.days >= 3 ? 0.1 : 0;
      const original = total;
      const price = discount > 0 ? Math.round(total * (1 - discount)) : total;
      return {
        id: String(p.days), // plain number string, e.g. "2"
        label: p.label,
        price,
        originalPrice: discount > 0 ? original : undefined,
      };
    });
}

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default function ProductDetailPage() {
  const params = useParams();
  const productId = typeof params?.id === 'string' ? params.id : '';

  const {
    data: product,
    isLoading,
    isError,
  } = useProductDetailQuery(productId);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('2');
  const [quantity, setQuantity] = useState(1);

  // Mặc định chọn duration = minRentalDays
  const defaultDurationId = useMemo(
    () => String(product?.minRentalDays ?? 1),
    [product?.minRentalDays],
  );

  // Khi product load xong thì reset selectedDuration về minRentalDays
  useState(() => {
    if (defaultDurationId) setSelectedDuration(defaultDurationId);
  });

  // Build durations từ BE dailyPrice, lọc theo minRentalDays
  const durations = useMemo(
    () =>
      product?.dailyPrice
        ? buildDurations(product.dailyPrice, product.minRentalDays ?? 1)
        : [],
    [product?.dailyPrice, product?.minRentalDays],
  );

  // Lấy image URLs
  const imageUrls = useMemo(() => {
    if (!product?.images?.length) return [];
    const sorted = [...product.images].sort(
      (a, b) => b.sortOrder - a.sortOrder,
    );
    return sorted.map((img) => img.imageUrl);
  }, [product?.images]);

  const currentDuration = useMemo(
    () =>
      durations.find((d) => d.id === selectedDuration) ??
      durations.find((d) => d.id === defaultDurationId) ??
      durations[0],
    [durations, selectedDuration, defaultDurationId],
  );

  const currentPrice = currentDuration?.price ?? product?.dailyPrice ?? 0;
  const originalPrice = currentDuration?.originalPrice;

  const discount = useMemo(() => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice)
      return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [originalPrice, currentPrice]);

  // Đếm AVAILABLE stock
  const availableStock = useMemo(
    () =>
      product?.inventoryItems?.filter((i) => i.status === 'AVAILABLE').length ??
      0,
    [product?.inventoryItems],
  );

  // Thông số kỹ thuật
  const specifications = useMemo(() => {
    if (!product) return [];
    return [
      { label: 'Thương hiệu', value: product.brand ?? '—' },
      { label: 'Danh mục', value: product.categoryName ?? '—' },
      { label: 'Màu sắc', value: product.color ?? '—' },
      {
        label: 'Số ngày thuê tối thiểu',
        value: `${product.minRentalDays} ngày`,
      },
      {
        label: 'Tiền cọc',
        value: product.depositAmount
          ? `${formatter.format(product.depositAmount)} (hoàn trả khi trả thiết bị)`
          : '—',
      },
      {
        label: 'Tình trạng kho',
        value:
          availableStock > 0
            ? `${availableStock} thiết bị sẵn sàng`
            : 'Hết hàng',
      },
      {
        label: 'Đánh giá',
        value: product.averageRating
          ? `${product.averageRating} / 5`
          : 'Chưa có đánh giá',
      },
    ];
  }, [product, availableStock]);

  // Short description (hiển thị phía dưới title)
  const shortDesc = useMemo(
    () => product?.shortDescription ?? null,
    [product?.shortDescription],
  );

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white font-sans dark:bg-surface-base'>
        <div className='mx-auto max-w-7xl px-3 pb-8 pt-20 sm:px-4 sm:pb-10 sm:pt-24 md:px-6 md:pt-28'>
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
      <div className='mx-auto max-w-7xl px-3 pb-8 pt-20 sm:px-4 sm:pb-10 sm:pt-24 md:px-6 md:pt-28'>
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
                  brand: product.brand ?? '—',
                  productType: product.categoryName ?? '—',
                  discount,
                  rating: product.averageRating ?? 0,
                  reviews: 0,
                  rentedCount: 0,
                  durations,
                }}
                selectedVariant='default'
                onVariantChange={() => {}}
                selectedDuration={selectedDuration}
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
              durationId={selectedDuration}
              quantity={quantity}
              setQuantity={setQuantity}
              cartProduct={{
                productId: product.productId,
                name: product.name,
                image: imageUrls[0] ?? '',
                sku: product.productId.slice(0, 8).toUpperCase(),
              }}
            />
          </div>
        </div>

        {/* Content: Description + Specifications + Sidebar */}
        <div className='mt-4 grid grid-cols-12 gap-4 sm:mt-6 sm:gap-6'>
          <div className='col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-8'>
            {/* Description */}
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

            {/* Specifications */}
            <RentalSpecifications specifications={specifications} />

            {/* Inventory Items / Stock */}
            {product.inventoryItems && product.inventoryItems.length > 0 && (
              <RentalStockSection
                inventoryItems={product.inventoryItems}
                availableStock={availableStock}
                totalStock={product.inventoryItems.length}
                minRentalDays={product.minRentalDays}
              />
            )}
          </div>

          <div className='col-span-12 flex flex-col gap-4 sm:gap-5 lg:col-span-4'>
            <RentalDeliverySection />
            <RentalProcessSection />
          </div>
        </div>

        {/* Reviews */}
        <div className='mt-4 sm:mt-6'>
          <RentalReviewsSection
            rating={product.averageRating ?? 0}
            reviews={0}
          />
        </div>

        {/* Related Products */}
        <div className='mt-4 sm:mt-6'>
          <RentalRelatedProducts />
        </div>
      </div>
    </div>
  );
}
