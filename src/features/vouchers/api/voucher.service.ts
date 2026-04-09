/**
 * Voucher API service — Module 11: VOUCHERS
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (API-067 → API-073)
 *
 * Dùng apiService.ts — KHÔNG dùng client.ts.
 * Service chỉ nhận payload đúng format API, không chứa UI logic.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '@/api/apiService';
import type {
  VoucherResponse,
  PaginatedVouchersResponse,
  CreateVoucherInput,
  UpdateVoucherInput,
  VoucherListParams,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-071: GET /vouchers?page=1&size=10&filter=...
 * BE dùng 1-based pagination. Caller phải truyền đúng page (1-based).
 */
export function getVouchersList(
  params?: VoucherListParams,
): Promise<PaginatedVouchersResponse> {
  return apiGet<PaginatedVouchersResponse>('/vouchers', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });
}

/**
 * API-068: GET /vouchers/{voucherId}
 * Lấy chi tiết voucher theo ID
 */
export function getVoucherById(voucherId: string): Promise<VoucherResponse> {
  return apiGet<VoucherResponse>(`/vouchers/${voucherId}`);
}

/**
 * API-069: GET /vouchers/code/{code}
 * Lấy voucher theo mã code (dùng ở dashboard để preview)
 */
export function getVoucherByCode(code: string): Promise<VoucherResponse> {
  return apiGet<VoucherResponse>(`/vouchers/code/${encodeURIComponent(code)}`);
}

/**
 * API-070: GET /vouchers/validate
 * Kiểm tra & tính giảm giá voucher theo mã — dùng cho khách hàng
 *
 * Query params:
 *   - code                 (bắt buộc) mã voucher
 *   - rentalDurationDays   (bắt buộc) số ngày thuê của line/product target
 *   - rentalSubtotalAmount (bắt buộc) subtotal trước giảm của line/product target
 *   - productId            (tùy chọn) product target để check scope ITEM_VOUCHER / PRODUCT_DISCOUNT
 */
export interface VoucherValidateResponse {
  voucherId: string;
  code: string;
  /** ITEM_VOUCHER | PRODUCT_DISCOUNT */
  type: string;
  /** productId mà voucher scope đến (nếu là ITEM_VOUCHER) */
  productId: string | null;
  valid: boolean;
  rentalSubtotalAmount: number;
  discountAmount: number;
  rentalFeeAmount: number;
  rentalDurationDays: number;
  expiresAt: string | null;
}

export function validateVoucher(params: {
  code: string;
  rentalDurationDays: number;
  rentalSubtotalAmount: number;
  /** Truyền productId khi validate voucher thuộc loại ITEM_VOUCHER / PRODUCT_DISCOUNT */
  productId?: string;
}): Promise<VoucherValidateResponse> {
  const { productId, ...rest } = params;
  return apiGet<VoucherValidateResponse>('/vouchers/validate', {
    params: {
      ...rest,
      ...(productId ? { productId } : {}),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-067: POST /vouchers
 * Tạo voucher mới
 */
export function createVoucher(
  payload: CreateVoucherInput,
): Promise<VoucherResponse> {
  return apiPost<VoucherResponse>('/vouchers', payload);
}

/**
 * API-072: PATCH /vouchers/{voucherId}
 * Cập nhật voucher (partial)
 */
export function updateVoucher(
  voucherId: string,
  payload: UpdateVoucherInput,
): Promise<VoucherResponse> {
  return apiPatch<VoucherResponse>(`/vouchers/${voucherId}`, payload);
}

/**
 * API-073: DELETE /vouchers/{voucherId}
 * Xóa voucher
 */
export function deleteVoucher(voucherId: string): Promise<null> {
  return apiDelete<null>(`/vouchers/${voucherId}`);
}
