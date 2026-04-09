'use client';

/**
 * useCartSync — Hướng B: Zustand làm local cart, sync lên API khi đăng nhập.
 *
 * Luồng:
 *  1. User chưa đăng nhập → addLine vào Zustand (localStorage persist)
 *  2. User đăng nhập → hook này chạy 1 lần, push từng line lên API, rồi clearCart Zustand
 *  3. Từ đây trở đi, Header + cart/page đọc từ API (useCartQuery)
 *
 * Mount hook này 1 lần duy nhất tại Layout để bao phủ toàn app.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useRentalCartStore } from '@/stores/rental-cart-store';
import { addCartLine } from '@/hooks/api/cart.service';
import { cartKeys } from '@/hooks/api/cart.keys';

export function useCartSync() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const prevAuthRef = useRef<boolean | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    // Chỉ sync khi lần đầu mount với auth hoặc vừa đăng nhập (null/false → true)
    if (!isAuthenticated) return;
    if (wasAuthenticated === true) return;
    if (isSyncingRef.current) return;

    const lines = useRentalCartStore.getState().lines;
    if (lines.length === 0) return;

    isSyncingRef.current = true;

    const syncToApi = async () => {
      let synced = 0;
      for (const line of lines) {
        const days = parseInt(line.durationId, 10);
        if (!line.productId || isNaN(days) || days < 1) continue;
        try {
          await addCartLine({
            productId: line.productId,
            rentalDurationDays: days,
            quantity: Math.max(1, line.quantity),
          });
          synced++;
        } catch {
          // Bỏ qua nếu sản phẩm hết hàng / lỗi
        }
      }

      if (synced > 0) {
        useRentalCartStore.getState().clearCart();
        await queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      }

      isSyncingRef.current = false;
    };

    void syncToApi();
  }, [isAuthenticated, queryClient]);
}
