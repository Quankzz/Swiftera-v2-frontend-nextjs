'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoriteProductsState = {
  byUserId: Record<string, string[]>;
  getFavoritesByUser: (userId?: string | null) => string[];
  isFavorite: (userId: string | null | undefined, productId: string) => boolean;
  toggleFavorite: (userId: string, productId: string) => boolean;
  removeFavorite: (userId: string, productId: string) => void;
  clearFavorites: (userId: string) => void;
};

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

export const useFavoriteProductsStore = create<FavoriteProductsState>()(
  persist(
    (set, get) => ({
      byUserId: {},

      getFavoritesByUser: (userId) => {
        if (!userId) return [];
        return get().byUserId[userId] ?? [];
      },

      isFavorite: (userId, productId) => {
        if (!userId) return false;
        return (get().byUserId[userId] ?? []).includes(productId);
      },

      toggleFavorite: (userId, productId) => {
        let isNowFavorite = false;

        set((state) => {
          const current = state.byUserId[userId] ?? [];
          const exists = current.includes(productId);
          const next = exists
            ? current.filter((id) => id !== productId)
            : dedupe([productId, ...current]);

          isNowFavorite = !exists;

          return {
            byUserId: {
              ...state.byUserId,
              [userId]: next,
            },
          };
        });

        return isNowFavorite;
      },

      removeFavorite: (userId, productId) => {
        set((state) => {
          const current = state.byUserId[userId] ?? [];
          return {
            byUserId: {
              ...state.byUserId,
              [userId]: current.filter((id) => id !== productId),
            },
          };
        });
      },

      clearFavorites: (userId) => {
        set((state) => ({
          byUserId: {
            ...state.byUserId,
            [userId]: [],
          },
        }));
      },
    }),
    {
      name: 'swiftera-favorite-products',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ byUserId: state.byUserId }),
    },
  ),
);
