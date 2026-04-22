import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/catalog";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog?categoryId=${category.categoryId}`}
      className={cn(
        "group flex flex-col items-center gap-2 p-2 transition-all duration-300 hover:scale-105",
        className,
      )}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-transparent bg-gray-50 dark:bg-white/4 shadow-sm transition-all duration-300 group-hover:border-theme-primary-start/50 group-hover:shadow-md">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-xl font-bold text-theme-primary-start">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <p className="max-w-[80px] text-center text-xs font-semibold leading-tight text-text-main transition-colors group-hover:text-theme-primary-start">
        {category.name}
      </p>
    </Link>
  );
}
