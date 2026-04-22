"use client";

import { CategoryCard } from "./category-card";
import type { Category } from "@/types/catalog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CategoryCarouselProps {
  items: Category[];
}

export function CategoryCarousel({ items }: CategoryCarouselProps) {
  const parentCategories = items.filter((c) => c.parentId === null);

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        opts={{ align: "start", dragFree: true, loop: false }}
        className="w-full"
      >
        <div className="relative">
          <div className="absolute -right-2 -top-14 hidden gap-2 lg:flex">
            <CarouselPrevious className="static translate-y-0 size-12 rounded-full bg-white dark:bg-surface-card shadow border-border/20" />
            <CarouselNext className="static translate-y-0 size-12 rounded-full bg-white dark:bg-surface-card shadow border-border/20" />
          </div>

          <CarouselContent className="-ml-3 pb-2">
            {parentCategories.map((category) => (
              <CarouselItem
                key={category.categoryId}
                className="pl-3 basis-auto"
              >
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  );
}
