/**
 * Vouchers API — /api/v1/vouchers
 *
 * Module 11 trong tài liệu API: VOUCHERS (7 endpoints)
 * Base URL: /api/v1
 *
 * NOTE: Tất cả endpoints đều yêu cầu xác thực [AUTH]
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ────────────────────────────────────────────────────────────────────

export type VoucherType = 'ITEM_VOUCHER' | 'PRODUCT_DISCOUNT';
export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED';

export interface VoucherResponse {
  voucherId: string;
  code: string;
  /** ITEM_VOUCHER: áp dụng cho sản phẩm cụ thể; PRODUCT_DISCOUNT: giảm giá theo product */
  type: VoucherType;
  /** Chỉ có khi type = PRODUCT_DISCOUNT */
  productId: string | null;
  productName: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minRentalDays: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Response của API-070: validate voucher */
export interface VoucherValidateResponse {
  voucherId: string;
  code: string;
  type: VoucherType;
  /** productId mà voucher scope đến (nếu là ITEM_VOUCHER) */
  productId: string | null;
  valid: boolean;
  rentalSubtotalAmount: number;
  discountAmount: number;
  rentalFeeAmount: number;
  rentalDurationDays: number;
  expiresAt: string | null;
}

export interface VoucherListResponse {
  success: boolean;
  message?: string;
  data: {
    meta: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    content: VoucherResponse[];
  };
  meta?: { timestamp: string; instance: string };
}

export interface VoucherSingleResponse {
  success: boolean;
  message?: string;
  data: VoucherResponse;
  meta?: { timestamp: string; instance: string };
}

export interface VoucherValidateSingleResponse {
  success: boolean;
  message?: string;
  data: VoucherValidateResponse;
  meta?: { timestamp: string; instance: string };
}

export interface VoucherVoidResponse {
  success: boolean;
  message: string;
  data: null;
  meta?: { timestamp: string; instance: string };
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateVoucherInput {
  code: string;
  /** ITEM_VOUCHER hoặc PRODUCT_DISCOUNT */
  type: VoucherType;
  /** Bắt buộc nếu type = PRODUCT_DISCOUNT */
  productId?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minRentalDays?: number;
  /** ISO 8601 UTC, VD: "2026-12-31T16:59:59Z" */
  expiresAt?: string;
  usageLimit?: number;
}

export interface UpdateVoucherInput {
  type?: VoucherType;
  productId?: string | null;
  discountType?: VoucherDiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minRentalDays?: number;
  expiresAt?: string;
  usageLimit?: number;
  isActive?: boolean;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const vouchersApi = {
  /**
   * API-067: Tạo voucher [AUTH]
   *
   * Lỗi: VOUCHER_DISCOUNT_TYPE_INVALID (discountType không hợp lệ),
   *       VOUCHER_PRODUCT_REQUIRED (type=PRODUCT_DISCOUNT nhưng thiếu productId)
   */
  create(
    data: CreateVoucherInput,
  ): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.post<VoucherSingleResponse>('/vouchers', data, authOpts);
  },

  /**
   * API-068: Lấy voucher theo ID [AUTH]
   */
  getById(voucherId: string): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.get<VoucherSingleResponse>(
      `/vouchers/${voucherId}`,
      authOpts,
    );
  },

  /**
   * API-069: Lấy voucher theo mã code [AUTH]
   *
   * @param code - VD: SUMMER30
   */
  getByCode(code: string): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.get<VoucherSingleResponse>(
      `/vouchers/code/${code}`,
      authOpts,
    );
  },

  /**
   * API-070: Kiểm tra và tính giảm giá voucher [AUTH]
   *
   * @param code                 - mã voucher cần kiểm tra
   * @param rentalDurationDays   - số ngày thuê của line/product target
   * @param rentalSubtotalAmount - subtotal trước giảm của line/product target
   * @param productId            - (tùy chọn) product target để check scope voucher
   *
   * Lỗi: VOUCHER_NOT_FOUND, VOUCHER_INACTIVE, VOUCHER_EXPIRED,
   *       VOUCHER_MIN_RENTAL_DAYS_NOT_MET, VOUCHER_PRODUCT_SCOPE_INVALID,
   *       VOUCHER_ALREADY_USED
   */
  validate(
    code: string,
    rentalDurationDays: number,
    rentalSubtotalAmount: number,
    productId?: string,
  ): Promise<AxiosResponse<VoucherValidateSingleResponse>> {
    const searchParams: Record<string, string> = {
      code,
      rentalDurationDays: String(rentalDurationDays),
      rentalSubtotalAmount: String(rentalSubtotalAmount),
    };
    if (productId) searchParams['productId'] = productId;
    return httpService.get<VoucherValidateSingleResponse>(
      `/vouchers/validate?${new URLSearchParams(searchParams).toString()}`,
      authOpts,
    );
  },

  /**
   * API-071: Lấy danh sách voucher [AUTH]
   *
   * @param params.page   - mặc định 1 (one-indexed)
   * @param params.size   - mặc định 10
   * @param params.filter - SpringFilter DSL, VD: isActive:true
   */
  list(params?: {
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<AxiosResponse<VoucherListResponse>> {
    return httpService.get<VoucherListResponse>('/vouchers', {
      ...authOpts,
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 10,
        ...(params?.filter ? { filter: params.filter } : {}),
      },
    });
  },

  /**
   * API-072: Cập nhật voucher [AUTH]
   */
  update(
    voucherId: string,
    data: UpdateVoucherInput,
  ): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.patch<VoucherSingleResponse>(
      `/vouchers/${voucherId}`,
      data,
      authOpts,
    );
  },

  /**
   * API-073: Xóa voucher [AUTH]
   */
  delete(voucherId: string): Promise<AxiosResponse<VoucherVoidResponse>> {
    return httpService.delete<VoucherVoidResponse>(
      `/vouchers/${voucherId}`,
      authOpts,
    );
  },
};
