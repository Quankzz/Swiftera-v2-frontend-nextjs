/**
 * Voucher API service - Module 11: VOUCHERS
 * Source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md (API-067 → API-073)
 *
 * HTTP layer: httpService (axios) - dùng http.ts.
 * Service chỉ nhận payload đúng format API, không chứa UI logic.
 */

import { httpService } from "@/api/http";
import type { ApiResponse } from "@/types/api.types";
import type {
  VoucherResponse,
  PaginatedVouchersResponse,
  CreateVoucherInput,
  UpdateVoucherInput,
  VoucherListParams,
} from "../types";

const authOpts = { requireToken: true as const };

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-071: GET /vouchers?page=1&size=10&filter=...
 * BE dùng 1-based pagination. Caller phải truyền đúng page (1-based).
 */
export async function getVouchersList(
  params?: VoucherListParams,
): Promise<PaginatedVouchersResponse> {
  const res = await httpService.get<ApiResponse<PaginatedVouchersResponse>>(
    "/vouchers",
    { ...authOpts, params },
  );
  return res.data.data!;
}

/**
 * API-068: GET /vouchers/{voucherId}
 * Lấy chi tiết voucher theo ID
 */
export async function getVoucherById(
  voucherId: string,
): Promise<VoucherResponse> {
  const res = await httpService.get<ApiResponse<VoucherResponse>>(
    `/vouchers/${voucherId}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-069: GET /vouchers/code/{code}
 * Lấy voucher theo mã code (dùng ở dashboard để preview)
 */
export async function getVoucherByCode(code: string): Promise<VoucherResponse> {
  const res = await httpService.get<ApiResponse<VoucherResponse>>(
    `/vouchers/code/${encodeURIComponent(code)}`,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-070: GET /vouchers/validate
 * Kiểm tra & tính giảm giá voucher theo mã - dùng cho khách hàng
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

export async function validateVoucher(params: {
  code: string;
  rentalDurationDays: number;
  rentalSubtotalAmount: number;
  /** Truyền productId khi validate voucher thuộc loại ITEM_VOUCHER / PRODUCT_DISCOUNT */
  productId?: string;
}): Promise<VoucherValidateResponse> {
  const { productId, ...rest } = params;
  const res = await httpService.get<ApiResponse<VoucherValidateResponse>>(
    "/vouchers/validate",
    {
      ...authOpts,
      params: {
        ...rest,
        ...(productId ? { productId } : {}),
      },
    },
  );
  return res.data.data!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API-067: POST /vouchers
 * Tạo voucher mới
 */
export async function createVoucher(
  payload: CreateVoucherInput,
): Promise<VoucherResponse> {
  const res = await httpService.post<ApiResponse<VoucherResponse>>(
    "/vouchers",
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-072: PATCH /vouchers/{voucherId}
 * Cập nhật voucher (partial)
 */
export async function updateVoucher(
  voucherId: string,
  payload: UpdateVoucherInput,
): Promise<VoucherResponse> {
  const res = await httpService.patch<ApiResponse<VoucherResponse>>(
    `/vouchers/${voucherId}`,
    payload,
    authOpts,
  );
  return res.data.data!;
}

/**
 * API-073: DELETE /vouchers/{voucherId}
 * Xóa voucher
 */
export async function deleteVoucher(voucherId: string): Promise<null> {
  await httpService.delete(`/vouchers/${voucherId}`, authOpts);
  return null;
}
