/**
 * Cart API — /api/v1/cart
 *
 * Module 10 trong tài liệu API: CART (5 endpoints)
 * Base URL: /api/v1
 *
 * NOTE: Tất cả endpoints đều yêu cầu xác thực [AUTH]
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

/** Voucher áp dụng được cho từng cart line (trả về cùng API-062) */
export interface CartLineVoucherItem {
  voucherId: string;
  code: string;
  type: 'ITEM_VOUCHER' | 'PRODUCT_DISCOUNT';
  productId: string | null;
  productName: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscountAmount: number | null;
  minRentalDays: number | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CartLineResponse {
  cartLineId: string;
  productId: string;
  productColorId: string | null;
  colorName: string | null;
  colorCode: string | null;
  productName: string;
  productImageUrl: string | null;
  dailyPrice: number;
  /** Tiền cọc cho 1 item */
  depositAmount?: number;
  rentalDurationDays: number;
  quantity: number;
  /** Tiền thuê line (sau rules backend) */
  rentalFeeAmount?: number;
  /** Tổng tiền cọc giữ cho line */
  depositHoldAmount?: number;
  /** Tổng cần thanh toán của line = rentalFee + depositHold */
  totalPayableAmount?: number;
  /** dailyPrice × quantity × rentalDurationDays */
  lineTotal: number;
  availableVouchers: CartLineVoucherItem[];
  /** Số lượng tồn kho AVAILABLE hiện tại (FE dùng để giới hạn quantity) */
  availableStock?: number;
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
  /** Bắt buộc nếu product có >1 màu */
  productColorId?: string;
  /** >= 1 và >= product.minRentalDays */
  rentalDurationDays: number;
  /** >= 1, mặc định 1 */
  quantity?: number;
}

export interface UpdateCartLineInput {
  productColorId?: string;
  rentalDurationDays?: number;
  quantity?: number;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  /**
   * API-062: Lấy giỏ hàng hiện tại [AUTH]
   *
   * Backend tự tạo cart nếu user chưa có.
   * cartLines[].lineTotal = dailyPrice × quantity × rentalDurationDays
   * cartLines[].availableVouchers = danh sách voucher áp dụng được cho line đó
   */
  get(): Promise<AxiosResponse<CartSingleResponse>> {
    return httpService.get<CartSingleResponse>('/cart', authOpts);
  },

  /**
   * API-063: Thêm dòng vào giỏ [AUTH]
   *
   * Merge logic: Nếu đã có line cùng productId + productColorId + rentalDurationDays,
   * quantity sẽ được cộng thêm.
   *
   * Lỗi: PRODUCT_NOT_FOUND, RENTAL_DURATION_DAYS_MIN_1,
   *       CART_RENTAL_MIN_DAYS, CART_QUANTITY_MIN_1
   */
  addLine(data: AddCartLineInput): Promise<AxiosResponse<CartSingleResponse>> {
    return httpService.post<CartSingleResponse>('/cart/lines', data, authOpts);
  },

  /**
   * API-064: Cập nhật dòng giỏ [AUTH]
   *
   * @param cartLineId - UUID của dòng giỏ cần cập nhật
   * @param data       - productColorId, rentalDurationDays và/hoặc quantity (tùy chọn)
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
   * API-065: Xóa một dòng giỏ [AUTH]
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
   * API-066: Xóa toàn bộ giỏ [AUTH]
   */
  clear(): Promise<AxiosResponse<CartVoidResponse>> {
    return httpService.delete<CartVoidResponse>('/cart', authOpts);
  },
};
