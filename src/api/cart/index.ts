/**
 * Cart API — /api/v1/cart
 *
 * Module 10 trong tài liệu API: CART (5 endpoints)
 * Base URL: /api/v1
 *
 * NOTE: Tất cả endpoints đều yêu cầu xác thực [AUTH]
 *
 * Sử dụng httpService (axios) giống cấu trúc userProfileApi.ts
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartLineResponse {
  cartLineId: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  dailyPrice: number;
  rentalDurationDays: number;
  quantity: number;
  lineTotal: number; // dailyPrice × quantity × rentalDurationDays
}

export interface CartResponse {
  cartId: string;
  userId: string;
  cartLines: CartLineResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CartSingleResponse {
  success: boolean;
  message?: string;
  data: CartResponse;
  meta?: { timestamp: string; instance: string };
}

export interface CartVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ──────────────────────────────────────────────────────────

export interface AddCartLineInput {
  productId: string;
  rentalDurationDays: number;
  quantity?: number; // default 1, >= 1
}

export interface UpdateCartLineInput {
  rentalDurationDays?: number;
  quantity?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  /**
   * API-061: Lấy giỏ hàng hiện tại [AUTH]
   *
   * Backend tự tạo cart nếu user chưa có.
   * cartLines[].lineTotal = dailyPrice × quantity × rentalDurationDays
   */
  get(): Promise<AxiosResponse<CartSingleResponse>> {
    return httpService.get<CartSingleResponse>('/cart', authOpts);
  },

  /**
   * API-062: Thêm dòng vào giỏ [AUTH]
   *
   * Merge logic: Nếu đã có line cùng productId + rentalDurationDays,
   * quantity sẽ được cộng thêm.
   *
   * @param data.productId          - UUID product đang active
   * @param data.rentalDurationDays - >= 1 và >= product.minRentalDays
   * @param data.quantity            - >= 1, mặc định 1
   *
   * Lỗi: PRODUCT_NOT_FOUND, RENTAL_DURATION_DAYS_MIN_1,
   *       CART_RENTAL_MIN_DAYS, CART_QUANTITY_MIN_1
   */
  addLine(data: AddCartLineInput): Promise<AxiosResponse<CartSingleResponse>> {
    return httpService.post<CartSingleResponse>('/cart/lines', data, authOpts);
  },

  /**
   * API-063: Cập nhật dòng giỏ [AUTH]
   *
   * @param cartLineId - UUID của dòng giỏ cần cập nhật
   * @param data       - rentalDurationDays và/hoặc quantity (tùy chọn)
   */
  updateLine(
    cartLineId: string,
    data: UpdateCartLineInput,
  ): Promise<AxiosResponse<CartSingleResponse>> {
    return httpService.patch<CartSingleResponse>(
      `/cart/lines/${cartLineId}`,
      data,
      authOpts,
    );
  },

  /**
   * API-064: Xóa một dòng giỏ [AUTH]
   *
   * @param cartLineId - UUID của dòng giỏ cần xóa
   */
  removeLine(cartLineId: string): Promise<AxiosResponse<CartVoidResponse>> {
    return httpService.delete<CartVoidResponse>(
      `/cart/lines/${cartLineId}`,
      authOpts,
    );
  },

  /**
   * API-065: Xóa toàn bộ giỏ [AUTH]
   */
  clear(): Promise<AxiosResponse<CartVoidResponse>> {
    return httpService.delete<CartVoidResponse>('/cart', authOpts);
  },
};
