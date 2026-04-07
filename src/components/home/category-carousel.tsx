'use client';

import { useRef } from 'react';
import { CategoryCard } from './category-card';
import type { Category } from '@/types/catalog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CategoryCarouselProps {
  items: Category[];
}

export function CategoryCarousel({ items }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag-scroll state in refs to avoid re-renders
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    container.setPointerCapture(e.pointerId);
    container.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const container = scrollRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startXRef.current;
    dragDistanceRef.current = Math.abs(walk);
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.releasePointerCapture(e.pointerId);
      scrollRef.current.style.cursor = 'grab';
    }
  };

  /** Suppress click on card children when the user actually dragged (> 5 px) */
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragDistanceRef.current > 5) {
      e.stopPropagation();
      dragDistanceRef.current = 0;
    }
  };

  const parentCategories = items.filter(
    (category) => category.parentId === null,
  );

  return (
    <div className='relative'>
      <div className='absolute -right-2 -top-14 hidden gap-2 lg:flex'>
        <Button
          size='icon'
          variant='outline'
          className='rounded-full size-12 bg-white shadow'
          onClick={() => handleScroll('left')}
          aria-label='Previous categories'
        >
          <ArrowLeft className='size-5' />
        </Button>
        <Button
          size='icon'
          variant='outline'
          className='rounded-full size-12 bg-white shadow'
          onClick={() => handleScroll('right')}
          aria-label='Next categories'
        >
          <ArrowRight className='size-5' />
        </Button>
      </div>
      <div
        ref={scrollRef}
        className='flex gap-3 overflow-x-auto pb-2 pt-2 select-none [&::-webkit-scrollbar]:hidden'
        style={{ cursor: 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        {parentCategories.map((category) => (
          <div key={category.categoryId} className='min-w-56 max-w-60 flex-1'>
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}
