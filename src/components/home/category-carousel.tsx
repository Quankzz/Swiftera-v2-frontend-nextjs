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

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
        className='flex gap-3 overflow-x-auto pb-2 pt-2 [&::-webkit-scrollbar]:hidden'
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
