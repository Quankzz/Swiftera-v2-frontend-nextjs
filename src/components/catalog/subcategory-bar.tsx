'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '@/features/categories/types';

interface SubcategoryBarProps {
  subcategories: CategoryTreeNode[];
  activeSub?: string;
  className?: string;
}

/**
 * Horizontal chip bar showing the direct children of the active root category.
 * Styled as pill chips — compact, fast, scannable.
 *
 * Supports:
 *  - Click to filter (toggles subcategoryId in URL)
 *  - Mouse drag to scroll horizontally (desktop)
 *  - Touch scroll (mobile — native overflow-x: auto)
 */
export function SubcategoryBar({
  subcategories,
  activeSub,
  className,
}: SubcategoryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Drag-to-scroll ────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = false;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;

    const onMove = (ev: MouseEvent) => {
      const dx =
        ev.pageX - (scrollRef.current?.offsetLeft ?? 0) - startX.current;
      if (Math.abs(dx) > 4) isDragging.current = true;
      if (scrollRef.current)
        scrollRef.current.scrollLeft = scrollLeft.current - dx;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  if (subcategories.length === 0) return null;

  function handleClick(subId: string) {
    if (isDragging.current) return; // ignore click after drag
    const next = new URLSearchParams(searchParams.toString());
    if (activeSub === subId) {
      next.delete('subcategoryId');
    } else {
      next.set('subcategoryId', subId);
      next.delete('page');
    }
    router.push(`?${next.toString()}`);
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        className={cn(
          'flex gap-2 overflow-x-auto pb-1 select-none cursor-grab active:cursor-grabbing',
          '[&::-webkit-scrollbar]:h-1',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10',
        )}
      >
        {/* "Tất cả" chip — deselects subcategory */}
        <button
          type='button'
          onClick={() => {
            if (isDragging.current) return;
            const next = new URLSearchParams(searchParams.toString());
            next.delete('subcategoryId');
            next.delete('page');
            router.push(`?${next.toString()}`);
          }}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150',
            !activeSub
              ? 'border-theme-primary-start bg-theme-primary-start text-white'
              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-main hover:border-theme-primary-start/50 hover:bg-theme-primary-start/5',
          )}
        >
          Tất cả
        </button>

        {subcategories.map((sub) => {
          const isActive = activeSub === sub.categoryId;
          return (
            <button
              key={sub.categoryId}
              type='button'
              onClick={() => handleClick(sub.categoryId)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'border-theme-primary-start bg-theme-primary-start text-white'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-text-main hover:border-theme-primary-start/50 hover:bg-theme-primary-start/5',
              )}
            >
              {sub.imageUrl && (
                <span className='relative size-5 shrink-0 overflow-hidden rounded-full'>
                  <Image
                    src={sub.imageUrl}
                    alt=''
                    fill
                    sizes='20px'
                    className='object-contain'
                  />
                </span>
              )}
              {sub.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
