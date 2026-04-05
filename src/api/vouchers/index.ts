/**
 * Vouchers API — /api/v1/vouchers
 *
 * Module 11 trong tài liệu API: VOUCHERS (7 endpoints)
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

export interface VoucherResponse {
  voucherId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
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

export interface VoucherValidateResponse {
  code: string;
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

// ─── Request payloads ────────────────────────────────────────────────────────────

export interface CreateVoucherInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  minRentalDays?: number;
  expiresAt?: string; // ISO 8601 UTC
  usageLimit?: number;
}

export interface UpdateVoucherInput {
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
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
   * API-066: Tạo voucher [AUTH]
   */
  create(
    data: CreateVoucherInput,
  ): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.post<VoucherSingleResponse>('/vouchers', data, authOpts);
  },

  /**
   * API-067: Lấy voucher theo ID [AUTH]
   */
  getById(voucherId: string): Promise<AxiosResponse<VoucherSingleResponse>> {
    return httpService.get<VoucherSingleResponse>(
      `/vouchers/${voucherId}`,
      authOpts,
    );
  },

  /**
   * API-068: Lấy voucher theo mã code [AUTH]
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
   * API-069: Kiểm tra và tính giảm giá voucher [AUTH]
   *
   * @param code               - mã voucher cần kiểm tra
   * @param rentalDurationDays - tổng ngày thuê của đơn
   * @param rentalSubtotalAmount - tổng phí thuê trước giảm
   *
   * Lỗi: VOUCHER_NOT_FOUND, VOUCHER_INACTIVE, VOUCHER_EXPIRED,
   *       VOUCHER_USAGE_LIMIT_REACHED, VOUCHER_MIN_RENTAL_DAYS_NOT_MET
   */
  validate(
    code: string,
    rentalDurationDays: number,
    rentalSubtotalAmount: number,
  ): Promise<AxiosResponse<VoucherValidateSingleResponse>> {
    const qs = new URLSearchParams({
      code,
      rentalDurationDays: String(rentalDurationDays),
      rentalSubtotalAmount: String(rentalSubtotalAmount),
    });
    return httpService.get<VoucherValidateSingleResponse>(
      `/vouchers/validate?${qs.toString()}`,
      authOpts,
    );
  },

  /**
   * API-070: Lấy danh sách voucher [AUTH]
   *
   * @param params.page   - mặc định 0
   * @param params.size  - mặc định 10
   * @param params.filter - SpringFilter DSL, VD: isActive:true
   */
  list(params?: {
    page?: number;
    size?: number;
    filter?: string;
  }): Promise<AxiosResponse<VoucherListResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const searchParams: Record<string, string> = {
      page: String(page),
      size: String(size),
    };
    if (params?.filter) searchParams['filter'] = params.filter;
    return httpService.get<VoucherListResponse>(`/vouchers`, {
      ...authOpts,
      params: searchParams,
    });
  },

  /**
   * API-071: Cập nhật voucher [AUTH]
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
   * API-072: Xóa voucher [AUTH]
   */
  delete(voucherId: string): Promise<AxiosResponse<VoucherVoidResponse>> {
    return httpService.delete<VoucherVoidResponse>(
      `/vouchers/${voucherId}`,
      authOpts,
    );
  },
};
