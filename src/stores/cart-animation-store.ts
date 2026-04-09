'use client';

import { create } from 'zustand';

export type FlyItem = {
  id: string;
  imageUrl: string;
  fromRect: DOMRect;
};

type CartAnimationState = {
  /** Queue of items flying to cart */
  flyingItems: FlyItem[];
  /** Ref to the cart icon DOM rect (updated on scroll/resize) */
  cartRect: DOMRect | null;
  /** Actions */
  setCartRect: (rect: DOMRect | null) => void;
  addFlyingItem: (item: FlyItem) => void;
  removeFlyingItem: (id: string) => void;
};

export const useCartAnimationStore = create<CartAnimationState>((set) => ({
  flyingItems: [],
  cartRect: null,

  setCartRect: (rect) => set({ cartRect: rect }),

  addFlyingItem: (item) =>
    set((state) => ({ flyingItems: [...state.flyingItems, item] })),

  removeFlyingItem: (id) =>
    set((state) => ({
      flyingItems: state.flyingItems.filter((i) => i.id !== id),
    })),
}));
