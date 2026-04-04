/**
 * Voucher module types — source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 * Module 11: VOUCHERS (API-066 → API-072)
 *
 * Tất cả field dùng camelCase theo JSON từ BE spec.
 * Không đoán field — chỉ dùng field có trong spec.
 */

import type { PaginatedData } from '@/api/apiService';

// ─────────────────────────────────────────────────────────────────────────────
// Enums / Union Types
// ─────────────────────────────────────────────────────────────────────────────

/** Loại giảm giá — BE spec: PERCENTAGE | FIXED_AMOUNT */
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// ─────────────────────────────────────────────────────────────────────────────
// Response Types (API-066, API-067, API-068, API-070, API-071)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VoucherResponse — trả về cho mọi endpoint voucher.
 * Field map đúng từ BE spec (API-066 response example).
 *
 * NOTE:
 *  - `expiresAt` BE trả string dạng "2026-12-31 11:59:59 PM" hoặc ISO (format UI khi render)
 *  - `createdAt` / `updatedAt` cũng là string từ BE
 *  - `maxDiscountAmount` có thể null (FIXED_AMOUNT không cần)
 *  - `minRentalDays` có thể null (không giới hạn số ngày)
 *  - `usageLimit` có thể null (không giới hạn số lần dùng)
 *  - `expiresAt` có thể null (không hết hạn)
 */
export interface VoucherResponse {
  voucherId: string;
  code: string;
  discountType: DiscountType;
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

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Response (API-070)
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedVouchersResponse = PaginatedData<VoucherResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// Request / Input Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CreateVoucherInput — payload cho API-066 POST /vouchers
 *
 * Required: code, discountType, discountValue
 * Optional: maxDiscountAmount, minRentalDays, expiresAt, usageLimit
 */
export interface CreateVoucherInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minRentalDays?: number | null;
  expiresAt?: string | null; // ISO 8601 UTC
  usageLimit?: number | null;
}

/**
 * UpdateVoucherInput — payload cho API-071 PATCH /vouchers/{voucherId}
 * Tất cả field đều optional (partial update).
 *
 * NOTE: code không thể update theo spec (không có trong PATCH body)
 */
export interface UpdateVoucherInput {
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minRentalDays?: number | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  isActive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// List / Filter Params (API-070)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VoucherListParams — query params cho GET /vouchers
 * BE hỗ trợ pagination + SpringFilter DSL
 */
export interface VoucherListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string; // SpringFilter DSL, e.g. "isActive:true"
}
