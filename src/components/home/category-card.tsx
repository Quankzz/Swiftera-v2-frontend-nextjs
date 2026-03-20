import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog?category=${category.categoryId}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-md border border-border/40 bg-gray-50 p-4 transition-all duration-300 hover:border-theme-primary-start/30 hover:shadow-md',
        className,
      )}
    >
      <div className='relative h-36 w-full overflow-hidden'>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes='(min-width: 1024px) 200px, 50vw'
            className='object-contain transition-transform duration-400 group-hover:scale-105'
          />
        ) : (
          <p className='font-semibold text-text-main'>{category.name}</p>
        )}
      </div>

      <div className='flex items-center justify-center px-2 py-2'>
        <p className='font-semibold text-text-main'>{category.name}</p>
      </div>
    </Link>
  );
}
