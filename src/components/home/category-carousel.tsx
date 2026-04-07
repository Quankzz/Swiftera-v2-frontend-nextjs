'use client';

import { CategoryCard } from './category-card';
import type { Category } from '@/types/catalog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface CategoryCarouselProps {
  items: Category[];
}

export function CategoryCarousel({ items }: CategoryCarouselProps) {
  const parentCategories = items.filter((c) => c.parentId === null);

  return (
    <Carousel
      opts={{ align: 'start', dragFree: true, loop: false }}
      className='w-full'
    >
      <div className='relative'>
        {/* Prev / Next buttons — positioned top-right relative to heading row via -top-14 */}
        <div className='absolute -right-2 -top-14 hidden gap-2 lg:flex'>
          <CarouselPrevious className='static translate-y-0 size-12 rounded-full bg-white shadow' />
          <CarouselNext className='static translate-y-0 size-12 rounded-full bg-white shadow' />
        </div>

        <CarouselContent className='-ml-3'>
          {parentCategories.map((category) => (
            <CarouselItem
              key={category.categoryId}
              className='pl-3 basis-56 md:basis-60'
            >
              <CategoryCard category={category} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  );
}
