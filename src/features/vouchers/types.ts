/**
 * Voucher module types - source of truth: 09_API_POSTMAN_STYLE_CHO_FRONTEND.md
 * Module 11: VOUCHERS (API-067 → API-073)
 *
 * Tất cả field dùng camelCase theo JSON từ BE spec.
 * Không đoán field - chỉ dùng field có trong spec.
 */

import type { PaginationResponse } from "@/types/api.types";

// ─────────────────────────────────────────────────────────────────────────────
// Enums / Union Types
// ─────────────────────────────────────────────────────────────────────────────

/** Loại voucher - ITEM_VOUCHER (giảm trên order/item) | PRODUCT_DISCOUNT (gắn với product cụ thể) */
export type VoucherType = "ITEM_VOUCHER" | "PRODUCT_DISCOUNT";

/** Loại giảm giá - BE spec: PERCENTAGE | FIXED */
export type DiscountType = "PERCENTAGE" | "FIXED";

// ─────────────────────────────────────────────────────────────────────────────
// Response Types (API-067, API-068, API-069, API-071)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * VoucherResponse - trả về cho mọi endpoint voucher.
 * Field map đúng từ BE spec (API-067 response example).
 *
 * NOTE:
 *  - `expiresAt` BE trả string dạng "2026-12-31 11:59:59 PM" hoặc ISO (format UI khi render)
 *  - `createdAt` / `updatedAt` cũng là string từ BE
 *  - `maxDiscountAmount` có thể null (FIXED không cần)
 *  - `minRentalDays` có thể null (không giới hạn số ngày)
 *  - `usageLimit` có thể null (không giới hạn số lần dùng)
 *  - `expiresAt` có thể null (không hết hạn)
 *  - `productName` có thể có nếu voucher đã được gắn với một product (type=PRODUCT_DISCOUNT)
 */
export interface VoucherResponse {
  voucherId: string;
  code: string;
  type: VoucherType;
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
  /** Có khi voucher đã được gắn với một product (type=PRODUCT_DISCOUNT) */
  productName?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Response (API-070)
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedVouchersResponse = PaginationResponse<VoucherResponse>;

// ─────────────────────────────────────────────────────────────────────────────
// Request / Input Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CreateVoucherInput - payload cho API-067 POST /vouchers
 *
 * Required: code, type, discountType, discountValue
 * Optional: maxDiscountAmount, minRentalDays, expiresAt, usageLimit
 */
export interface CreateVoucherInput {
  code: string;
  type: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minRentalDays?: number | null;
  expiresAt?: string | null; // ISO 8601 UTC
  usageLimit?: number | null;
}

/**
 * UpdateVoucherInput - payload cho API-072 PATCH /vouchers/{voucherId}
 * Tất cả field đều optional (partial update).
 *
 * NOTE:
 *  - code không thể update theo spec (không có trong PATCH body)
 *  - productId không còn nhận ở đây; gắn/bỏ voucher với product thực hiện qua API-052/API-055
 */
export interface UpdateVoucherInput {
  type?: VoucherType;
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
 * VoucherListParams - query params cho GET /vouchers (API-071)
 * BE hỗ trợ pagination + SpringFilter DSL
 */
export interface VoucherListParams {
  page?: number;
  size?: number;
  sort?: string;
  filter?: string; // SpringFilter DSL, e.g. "isActive:true"
}
