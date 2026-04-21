'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { httpService } from '@/api/http';
import { useAuth } from '@/hooks/useAuth';
import { buildLoginHref, getCurrentPathWithSearch } from '@/lib/auth-redirect';
import type { ApiResponse } from '@/types/api.types';

type ToggleFavoriteOptions = {
  fallbackPath?: string;
};

type ToggleFavoriteResult = {
  ok: boolean;
  added: boolean;
};

type WishlistItemResponse = {
  wishlistItemId: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
};

const authOpts = { requireToken: true as const };
const EMPTY_FAVORITE_IDS: string[] = [];

const wishlistKeys = {
  all: ['wishlist'] as const,
  mine: (userId: string | null) =>
    [...wishlistKeys.all, 'mine', userId ?? 'anonymous'] as const,
};

function upsertWishlistItem(
  current: WishlistItemResponse[] | undefined,
  nextItem: WishlistItemResponse,
): WishlistItemResponse[] {
  const base = current ?? [];
  if (base.some((item) => item.productId === nextItem.productId)) {
    return base;
  }
  return [nextItem, ...base];
}

export function useFavoriteProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  const userId = user?.id ?? null;
  const wishlistQueryKey = wishlistKeys.mine(userId);

  const wishlistQuery = useQuery({
    queryKey: wishlistQueryKey,
    queryFn: async (): Promise<WishlistItemResponse[]> => {
      const res = await httpService.get<ApiResponse<WishlistItemResponse[]>>(
        '/wishlist',
        authOpts,
      );
      return res.data.data ?? [];
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 60_000,
    retry: false,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string): Promise<WishlistItemResponse> => {
      const res = await httpService.post<ApiResponse<WishlistItemResponse>>(
        `/wishlist/${productId}`,
        undefined,
        authOpts,
      );

      const item = res.data.data;
      if (!item) {
        throw new Error('Không thể thêm sản phẩm vào danh sách yêu thích.');
      }

      return item;
    },
    onSuccess: (item) => {
      queryClient.setQueryData<WishlistItemResponse[]>(wishlistQueryKey, (prev) =>
        upsertWishlistItem(prev, item),
      );
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      await httpService.delete<ApiResponse<null>>(
        `/wishlist/${productId}`,
        authOpts,
      );
    },
    onSuccess: (_data, productId) => {
      queryClient.setQueryData<WishlistItemResponse[]>(wishlistQueryKey, (prev) =>
        (prev ?? []).filter((item) => item.productId !== productId),
      );
    },
  });

  const clearFavoriteMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await httpService.delete<ApiResponse<null>>('/wishlist', authOpts);
    },
    onSuccess: () => {
      queryClient.setQueryData<WishlistItemResponse[]>(wishlistQueryKey, []);
    },
  });

  const favoriteIds = useMemo(() => {
    if (!isAuthenticated) return EMPTY_FAVORITE_IDS;
    const items = wishlistQuery.data ?? [];
    return items.map((item) => item.productId);
  }, [isAuthenticated, wishlistQuery.data]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback(
    (productId: string) => favoriteSet.has(productId),
    [favoriteSet],
  );

  const ensureAuthenticated = useCallback(
    (fallbackPath = '/catalog') => {
      if (isAuthenticated && userId) return true;

      if (!isLoading) {
        router.push(buildLoginHref(getCurrentPathWithSearch(fallbackPath)));
      }

      return false;
    },
    [isAuthenticated, isLoading, router, userId],
  );

  const toggleFavorite = useCallback(
    (
      productId: string,
      options?: ToggleFavoriteOptions,
    ): Promise<ToggleFavoriteResult> => {
      if (!userId || !ensureAuthenticated(options?.fallbackPath)) {
        return Promise.resolve({ ok: false, added: false });
      }

      const existed = favoriteSet.has(productId);

      if (existed) {
        return removeFavoriteMutation.mutateAsync(productId).then(() => ({
          ok: true,
          added: false,
        }));
      }

      return addFavoriteMutation.mutateAsync(productId).then(() => ({
        ok: true,
        added: true,
      }));
    },
    [
      addFavoriteMutation,
      ensureAuthenticated,
      favoriteSet,
      removeFavoriteMutation,
      userId,
    ],
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      if (!userId || !ensureAuthenticated('/favorites')) {
        return false;
      }
      await removeFavoriteMutation.mutateAsync(productId);
      return true;
    },
    [ensureAuthenticated, removeFavoriteMutation, userId],
  );

  const clearFavorites = useCallback(async () => {
    if (!userId || !ensureAuthenticated('/favorites')) {
      return false;
    }
    await clearFavoriteMutation.mutateAsync();
    return true;
  }, [clearFavoriteMutation, ensureAuthenticated, userId]);

  const isUpdatingFavorites =
    addFavoriteMutation.isPending ||
    removeFavoriteMutation.isPending ||
    clearFavoriteMutation.isPending;

  return {
    userId,
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    ensureAuthenticated,
    isLoadingFavorites: wishlistQuery.isLoading || wishlistQuery.isFetching,
    hasWishlistError: wishlistQuery.isError,
    isUpdatingFavorites,
  };
}
