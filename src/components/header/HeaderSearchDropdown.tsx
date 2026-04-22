"use client";

/**
 * HeaderSearchDropdown
 *
 * Shown when the search bar in the Header is open.
 * Two states:
 *   1. Idle (no query typed): shows a grid of root categories from real API data.
 *   2. Searching (query active): shows loading / results list / empty state.
 *
 * The component is purely presentational - all data fetching is done by the
 * parent via `useHeaderSearch` and `useCategoryTreeQuery`.
 */

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/formatters";
import type { SearchProduct } from "@/features/products/hooks/use-header-search";
import type { CategoryTreeNode } from "@/features/categories/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeaderSearchDropdownProps {
  /** Root categories from the real API tree */
  categories: CategoryTreeNode[];
  /** Search query the user typed */
  query: string;
  /** Debounced query - determines whether we're in search mode */
  isQueryActive: boolean;
  /** Preview results (max 5) */
  results: SearchProduct[];
  /** Total count from API - used for "Xem tất cả X sản phẩm" */
  totalElements: number;
  /** True while the API call is in-flight */
  isLoading: boolean;
  /** True when query is active, API responded, and results are empty */
  isEmpty: boolean;
  /** Called when the user clicks "Xem tất cả …" */
  onViewAll: () => void;
  /** Called to navigate to a category page */
  onCategoryClick: (categoryId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HeaderSearchDropdown({
  categories,
  query,
  isQueryActive,
  results,
  totalElements,
  isLoading,
  isEmpty,
  onViewAll,
  onCategoryClick,
}: HeaderSearchDropdownProps) {
  // ── Idle state: show category grid ─────────────────────────────────────────
  if (!isQueryActive) {
    return (
      <div className="p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-sub">
          Danh mục phổ biến
        </p>
        {categories.length === 0 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-text-sub" />
          </div>
        ) : (
          /* Responsive grid: 2 cols on small screens, up to 5 cols max.
             Each card has a fixed width so many categories don't break layout. */
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() => onCategoryClick(cat.categoryId)}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-gray-50/60 dark:bg-white/5 p-3 text-center transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <div className="relative size-16 shrink-0 overflow-hidden">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      sizes="64px"
                      className="object-contain mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-xl bg-gray-200 dark:bg-white/10">
                      <span className="text-xl">📦</span>
                    </div>
                  )}
                </div>
                <span className="line-clamp-2 text-xs font-medium leading-tight text-text-main">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Search state: loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-8 text-text-sub">
        <Loader2 className="size-6 animate-spin text-theme-primary-start" />
        <p className="text-sm">Đang tìm kiếm…</p>
      </div>
    );
  }

  // ── Search state: no results ────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-10 text-center">
        <SearchX
          className="size-10 text-theme-primary-start"
          strokeWidth={1.5}
        />
        <p className="text-base font-semibold text-text-main">
          Không tìm thấy kết quả
        </p>
        <p className="text-sm text-text-sub">
          Không có sản phẩm nào khớp với &ldquo;
          <span className="font-medium text-text-main">{query}</span>&rdquo;
        </p>
      </div>
    );
  }

  // ── Search state: results ───────────────────────────────────────────────────
  return (
    <div>
      {/* Section label */}
      <div className="px-6 pt-6 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-sub">
          Kết quả hàng đầu
        </p>
      </div>

      {/* Product list */}
      <ul>
        {results.map((product) => (
          <li key={product.productId}>
            <Link
              href={`/product/${product.productId}`}
              className="group flex items-center gap-4 px-6 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {/* Thumbnail */}
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/8">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-contain mix-blend-multiply dark:mix-blend-normal p-1"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-lg">
                    📦
                  </div>
                )}
              </div>

              {/* Name + category */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-main group-hover:text-theme-primary-start transition-colors">
                  {product.name}
                </p>
                <p className="truncate text-xs text-text-sub">
                  {product.categoryName}
                </p>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-theme-primary-start">
                  {fmt(product.dailyPrice)}
                </p>
                <p className="text-[10px] text-text-sub">/ngày</p>
              </div>

              {/* Arrow icon */}
              <ArrowRight className="size-4 shrink-0 text-text-sub opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>

      {/* View all button */}
      {totalElements > 0 && (
        <div className="border-t border-gray-100 dark:border-white/8 p-4">
          <button
            type="button"
            onClick={onViewAll}
            className={cn(
              "w-full rounded-xl py-2.5 text-sm font-semibold text-theme-primary-start",
              "border border-theme-primary-start/30 hover:bg-theme-primary-start hover:text-white",
              "transition-colors duration-150",
            )}
          >
            Xem tất cả {totalElements.toLocaleString("vi-VN")} sản phẩm
          </button>
        </div>
      )}
    </div>
  );
}
