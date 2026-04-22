/**
 * Cart API service - Module 10: CART (API-061 → API-065)
 *
 * Dùng httpService (axios) giống các service khác trong hooks/api/
 */

import { httpService } from "@/api/http";
import type {
  AddCartLineInput,
  CartSingleResponse,
  CartVoidResponse,
  CartResponse,
} from "@/api/cart";

const authOpts = { requireToken: true as const };

/**
 * API-061: Lấy giỏ hàng hiện tại [AUTH]
 * Backend tự tạo cart nếu user chưa có.
 *
 * @param deliveryDate - optional YYYY-MM-DD. Khi được cung cấp, backend sẽ đếm
 * available stock chính xác hơn bằng cách loại trừ các inventory item có
 * booking conflict trùng ngày, khớp với logic của RentalOrderService.
 */
export async function getCart(deliveryDate?: string): Promise<CartResponse> {
  const params: Record<string, string> = {};
  if (deliveryDate) {
    params["deliveryDate"] = deliveryDate;
  }
  const res = await httpService.get<CartSingleResponse>("/cart", {
    ...authOpts,
    params,
  });
  return res.data.data;
}

/**
 * API-062: Thêm dòng vào giỏ [AUTH]
 *
 * Merge logic: Nếu đã có line cùng productId + rentalDurationDays,
 * quantity sẽ được cộng thêm.
 *
 * Lỗi: PRODUCT_NOT_FOUND, RENTAL_DURATION_DAYS_MIN_1,
 *       CART_RENTAL_MIN_DAYS, CART_QUANTITY_MIN_1
 */
export async function addCartLine(
  input: AddCartLineInput,
): Promise<CartResponse> {
  const res = await httpService.post<CartSingleResponse>(
    "/cart/lines",
    input,
    authOpts,
  );
  return res.data.data;
}

/**
 * API-063: Cập nhật dòng giỏ [AUTH]
 */
export async function updateCartLine(
  cartLineId: string,
  input: { rentalDurationDays?: number; quantity?: number },
): Promise<CartResponse> {
  const res = await httpService.patch<CartSingleResponse>(
    `/cart/lines/${cartLineId}`,
    input,
    authOpts,
  );
  return res.data.data;
}

/**
 * API-064: Xóa một dòng giỏ [AUTH]
 */
export async function removeCartLine(cartLineId: string): Promise<void> {
  await httpService.delete<CartVoidResponse>(
    `/cart/lines/${cartLineId}`,
    authOpts,
  );
}

/**
 * API-065: Xóa toàn bộ giỏ [AUTH]
 */
export async function clearCart(): Promise<void> {
  await httpService.delete<CartVoidResponse>("/cart", authOpts);
}
