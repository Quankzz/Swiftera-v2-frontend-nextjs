'use client';

import Image from 'next/image';
import { MoreHorizontal, Eye, Pencil, Trash2, Package } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ProductResponse } from '@/features/products/types';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function getSalePercent(daily: number, oldDaily: number): number {
  return Math.round(((oldDaily - daily) / oldDaily) * 100);
}

interface ProductCardDashboardProps {
  product: ProductResponse;
  selected: boolean;
  onSelect: (id: string) => void;
  onView?: (product: ProductResponse) => void;
  onEdit?: (product: ProductResponse) => void;
  onDelete?: (product: ProductResponse) => void;
}

export function ProductCardDashboard({
  product,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: ProductCardDashboardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dots menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // BE field is `images` (not `productImages`)
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  const salePercent =
    product.oldDailyPrice && product.oldDailyPrice > product.dailyPrice
      ? getSalePercent(product.dailyPrice, product.oldDailyPrice)
      : null;

  // `availableStock` comes directly from BE (not computed from inventoryItems)
  const plainDescription = product.description
    ? product.description.replace(/<[^>]*>/g, '').trim()
    : '';

  return (
    <article
      onClick={() => onSelect(product.productId)}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        selected
          ? 'border-theme-primary-start shadow-md'
          : 'border-transparent hover:border-gray-200 dark:hover:border-white/15',
        'bg-white dark:bg-surface-card',
      )}
    >
      {/* Selection indicator */}
      {selected && (
        <span className='absolute left-3 top-3 z-10 flex size-5 items-center justify-center rounded-full bg-theme-primary-start text-white'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='size-3'
          >
            <polyline points='20 6 9 17 4 12' />
          </svg>
        </span>
      )}

      {/* Inactive badge */}
      {!product.isActive && (
        <span className='absolute left-3 top-3 z-10 rounded-full bg-gray-400 px-2 py-0.5 text-xs font-semibold text-white'>
          Tạm ngưng
        </span>
      )}

      {/* Sale badge */}
      {salePercent !== null && (
        <span
          className={cn(
            'btn-gradient-accent absolute top-3 z-10 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm',
            selected || !product.isActive ? 'left-18' : 'left-3',
          )}
        >
          -{salePercent}%
        </span>
      )}

      {/* Dots menu */}
      <div
        ref={menuRef}
        className='absolute right-3 top-3 z-10'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type='button'
          onClick={() => setMenuOpen((v) => !v)}
          className='flex size-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/60 shadow-sm transition hover:bg-gray-100 dark:hover:bg-white/10'
          aria-label='Tùy chọn'
        >
          <MoreHorizontal className='size-4 text-text-sub' />
        </button>

        {menuOpen && (
          <div className='absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card shadow-xl dark:shadow-black/30 animate-in fade-in slide-in-from-top-1'>
            <button
              type='button'
              onClick={() => {
                setMenuOpen(false);
                onView?.(product);
              }}
              className='flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'
            >
              <Eye size={14} className='text-text-sub' />
              Xem chi tiết
            </button>
            <button
              type='button'
              onClick={() => {
                setMenuOpen(false);
                onEdit?.(product);
              }}
              className='flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors'
            >
              <Pencil size={14} className='text-text-sub' />
              Chỉnh sửa
            </button>
            <button
              type='button'
              onClick={() => {
                setMenuOpen(false);
                onDelete?.(product);
              }}
              className='flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* SLOT 1: Title + description */}
      <header className='mb-3.5 mt-2.5 flex h-24 flex-col items-center justify-start text-center'>
        <h3 className='line-clamp-2 min-h-12 text-lg font-semibold text-text-main'>
          {product.name}
        </h3>
        <p className='line-clamp-2 min-h-10 text-sm text-text-sub'>
          {plainDescription}
        </p>
      </header>

      {/* SLOT 2: Image */}
      <div className='relative h-56 w-full'>
        {primaryImage?.imageUrl ? (
          <Image
            src={primaryImage.imageUrl}
            alt={product.name}
            fill
            sizes='(min-width: 1024px) 280px, 50vw'
            className='object-contain transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-xs text-text-sub'>
            Không có ảnh
          </div>
        )}
      </div>

      {/* SLOT 3: Available stock badge */}
      <div className='mt-2.5 flex items-center justify-center gap-2'>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            product.availableStock > 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/8 text-gray-500 dark:text-gray-400',
          )}
        >
          <Package size={11} />
          {product.availableStock} sẵn sàng
        </span>
        {product.color && (
          <span className='inline-flex items-center rounded-full border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/5 px-2.5 py-0.5 text-xs text-text-sub'>
            {product.color}
          </span>
        )}
      </div>

      {/* SLOT 4: Price */}
      <div className='mt-auto pt-3 text-center'>
        <div className='flex items-baseline justify-center gap-2 text-theme-accent-start'>
          <span className='text-sm font-medium text-text-sub'>Từ</span>
          <span className='text-xl font-bold'>
            {formatter.format(product.dailyPrice)}
          </span>
          {product.oldDailyPrice != null && (
            <span className='text-sm text-text-sub line-through'>
              {formatter.format(product.oldDailyPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
