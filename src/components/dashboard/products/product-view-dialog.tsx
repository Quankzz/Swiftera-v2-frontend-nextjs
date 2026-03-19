'use client';

import Image from 'next/image';
import { X, Tag, Layers, CalendarDays, Wallet, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';
import { categories } from '@/data/categories';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

interface ProductViewDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

function getSalePercent(daily: number, oldDaily: number) {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

export function ProductViewDialog({
  product,
  open,
  onClose,
}: ProductViewDialogProps) {
  if (!open || !product) return null;

  const primaryImage =
    product.productImages.find((img) => img.isPrimary) ??
    product.productImages[0];

  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? getSalePercent(product.dailyPrice, product.oldDailyPrice)
      : null;

  const categoryName =
    categories.find((c) => c.categoryId === product.categoryId)?.name ??
    product.categoryId;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
          <h2 className='text-lg font-semibold text-text-main'>
            Chi tiết sản phẩm
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='flex size-8 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 hover:text-text-main'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className='overflow-y-auto max-h-[80vh]'>
          <div className='grid grid-cols-1 gap-0 md:grid-cols-2'>
            {/* Left: primary image */}
            <div className='flex items-center justify-center bg-gray-50 p-8'>
              {primaryImage ? (
                <div className='relative h-64 w-64'>
                  <Image
                    src={primaryImage.imageUrl}
                    alt={product.name}
                    fill
                    className='object-contain'
                    sizes='256px'
                  />
                </div>
              ) : (
                <div className='flex h-64 w-64 flex-col items-center justify-center gap-2 rounded-md bg-gray-100 text-text-sub'>
                  <ImageOff size={32} className='opacity-40' />
                  <span className='text-sm'>Không có ảnh</span>
                </div>
              )}
            </div>

            {/* Right: info */}
            <div className='flex flex-col gap-5 p-6'>
              {/* Name + badge */}
              <div>
                {salePercent !== null && (
                  <span className='btn-gradient-accent mb-2 inline-block text-xs font-semibold text-white'>
                    -{salePercent}%
                  </span>
                )}
                <h3 className='text-xl font-bold text-text-main'>
                  {product.name}
                </h3>
                <p className='mt-1 text-sm text-text-sub'>
                  {product.description}
                </p>
              </div>

              {/* Price block */}
              <div className='rounded-md bg-gray-50 px-4 py-3'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-bold text-theme-accent-start'>
                    {formatter.format(product.dailyPrice)}
                  </span>
                  <span className='text-sm text-text-sub'>/ ngày</span>
                  {product.oldDailyPrice && (
                    <span className='text-sm text-text-sub line-through'>
                      {formatter.format(product.oldDailyPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta */}
              <dl className='grid grid-cols-1 gap-3 text-sm'>
                <div className='flex items-center gap-3'>
                  <Tag size={15} className='shrink-0 text-text-sub' />
                  <dt className='w-36 shrink-0 text-text-sub'>Danh mục</dt>
                  <dd className='font-medium text-text-main'>{categoryName}</dd>
                </div>
                {product.depositAmount && (
                  <div className='flex items-center gap-3'>
                    <Wallet size={15} className='shrink-0 text-text-sub' />
                    <dt className='w-36 shrink-0 text-text-sub'>Đặt cọc</dt>
                    <dd className='font-medium text-text-main'>
                      {formatter.format(product.depositAmount)}
                    </dd>
                  </div>
                )}
                <div className='flex items-center gap-3'>
                  <CalendarDays size={15} className='shrink-0 text-text-sub' />
                  <dt className='w-36 shrink-0 text-text-sub'>
                    Thuê tối thiểu
                  </dt>
                  <dd className='font-medium text-text-main'>
                    {product.minRentalDays} ngày
                  </dd>
                </div>
              </dl>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className='mb-2 text-sm text-text-sub'>Màu sắc</p>
                  <div className='flex flex-wrap gap-2'>
                    {product.colors.map((c) => (
                      <div key={c.name} className='flex items-center gap-1.5'>
                        <span
                          className='size-5 rounded-full border border-white shadow ring-1 ring-black/10'
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                        <span className='text-xs text-text-sub'>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All images gallery */}
          {product.productImages.length > 1 && (
            <div className='border-t border-gray-100 px-6 py-5'>
              <div className='mb-3 flex items-center gap-2 text-sm font-medium text-text-main'>
                <Layers size={15} className='text-text-sub' />
                Tất cả hình ảnh ({product.productImages.length})
              </div>
              <div className='flex flex-wrap gap-3'>
                {product.productImages.map((img, i) => (
                  <div
                    key={img.productImageId ?? i}
                    className={cn(
                      'relative h-20 w-20 overflow-hidden rounded-md border-2',
                      img.isPrimary
                        ? 'border-theme-primary-start'
                        : 'border-gray-200',
                    )}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`Ảnh ${i + 1}`}
                      fill
                      className='object-cover'
                      sizes='80px'
                    />
                    {img.isPrimary && (
                      <span className='absolute bottom-0 left-0 right-0 bg-theme-primary-start/80 py-0.5 text-center text-[10px] text-white'>
                        Chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end border-t border-gray-100 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-gray-200 px-5 py-2 text-sm font-medium text-text-main transition hover:bg-gray-50'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
