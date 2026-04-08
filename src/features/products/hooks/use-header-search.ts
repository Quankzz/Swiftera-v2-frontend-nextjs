/**
 * useHeaderSearch — debounced product search for the Header search dropdown.
 *
 * - Waits 350 ms after the user stops typing before calling the API.
 * - Returns at most 5 results (for preview list in dropdown).
 * - Exposes totalElements so the "Xem tất cả X sản phẩm" button can show
 *   the accurate count.
 * - `isEmpty` is true only when a query has been entered AND the API returned
 *   0 results (distinct from the initial / idle state).
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product.service';
import type { PaginatedProductsResponse, ProductResponse } from '../types';

const DEBOUNCE_MS = 350;
const PREVIEW_SIZE = 5;

export interface SearchProduct {
  productId: string;
  name: string;
  dailyPrice: number;
  imageUrl: string | null;
  categoryName: string;
}

function toSearchProduct(p: ProductResponse): SearchProduct {
  const primary = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
  return {
    productId: p.productId,
    name: p.name,
    dailyPrice: p.dailyPrice,
    imageUrl: primary?.imageUrl ?? null,
    categoryName: p.categoryName,
  };
}

function buildSearchFilter(query: string): string {
  // Escape single quotes inside the value
  const safe = query.replace(/'/g, "\\'");
  // Match name containing the query (SpringFilter `~` = like/contains)
  return `isActive:true and name~'*${safe}*'`;
}

const searchKeys = {
  preview: (q: string) => ['header-search', 'preview', q] as const,
};

export function useHeaderSearch() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce: update debouncedQuery only after user stops typing
  useEffect(() => {
    const trimmed = inputValue.trim();
    const delay = trimmed ? DEBOUNCE_MS : 0;
    const timer = setTimeout(() => {
      setDebouncedQuery(trimmed);
    }, delay);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Derived: user has typed something (even mid-debounce window)
  const hasInput = inputValue.trim().length > 0;

  // True while the debounce timer hasn't fired yet (input ≠ debouncedQuery)
  const isDebouncing = hasInput && inputValue.trim() !== debouncedQuery;

  const isQueryActive = debouncedQuery.length > 0;

  const { data, isLoading, isFetching } = useQuery<PaginatedProductsResponse>({
    queryKey: searchKeys.preview(debouncedQuery),
    queryFn: () =>
      getProducts({
        page: 1,
        size: PREVIEW_SIZE,
        sort: 'createdAt,desc',
        filter: buildSearchFilter(debouncedQuery),
      }),
    enabled: isQueryActive,
    staleTime: 30 * 1000,
  });

  const results: SearchProduct[] = (data?.content ?? []).map(toSearchProduct);
  const totalElements = data?.meta.totalElements ?? 0;

  // Loading = debounce window still open OR API call in-flight
  const isSearchLoading =
    isDebouncing || (isQueryActive && (isLoading || isFetching));

  const isEmpty =
    !isDebouncing &&
    isQueryActive &&
    !isLoading &&
    !isFetching &&
    results.length === 0;

  return {
    inputValue,
    setInputValue,
    debouncedQuery,
    results,
    totalElements,
    isLoading: isSearchLoading,
    isEmpty,
    isQueryActive: hasInput,
  };
}
