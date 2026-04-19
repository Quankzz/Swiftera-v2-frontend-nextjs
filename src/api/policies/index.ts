/**
 * Policies API - /api/v1/policies
 *
 * Module 17 trong tài liệu API: POLICIES (7 endpoints - API-105 → API-111)
 * Base URL: /api/v1
 *
 * Access:
 *   PUBLIC  - API-106 (getById), API-107 (getLatestByCode), API-108 (list)
 *   AUTH    - API-105 (create), API-109 (deactivate), API-110 (consent), API-111 (myConsents)
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Enums / Union Types ───────────────────────────────────────────────────────

/**
 * Mã phân loại tài liệu chính sách.
 * Phiên bản mới nhất (isActive:true, version cao nhất) được dùng làm chuẩn.
 */
export type PolicyCode =
  | 'RENTAL_TERMS'
  | 'PRIVACY_POLICY'
  | 'RETURN_POLICY'
  | string;

/**
 * Loại đồng ý của user với chính sách.
 *   ACCEPTED  - đồng ý (default)
 *   DECLINED  - từ chối (nếu BE cho phép)
 *   WITHDRAWN - thu hồi đồng ý
 */
export type ConsentType = 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

/**
 * Ngữ cảnh ghi nhận đồng ý.
 *   ACCOUNT  - khi đăng ký / đăng nhập (default)
 *   CHECKOUT - khi thanh toán
 *   CONTRACT - khi ký hợp đồng
 */
export type ConsentContext = 'ACCOUNT' | 'CHECKOUT' | 'CONTRACT';

// ─── Response Types ────────────────────────────────────────────────────────────

/**
 * PolicyDocumentResponse - trả về từ API-105 → API-109.
 *
 * Ghi chú:
 *   - `effectiveFrom` BE trả chuỗi dạng "2026-04-01 07:00:00 AM"
 *   - `pdfUrl` có thể null nếu chính sách chưa upload PDF
 *   - `isActive: false` sau khi gọi API-109 deactivate
 */
export interface PolicyDocumentResponse {
  policyDocumentId: string;
  /** Mã phân loại: RENTAL_TERMS, PRIVACY_POLICY, v.v. */
  code: PolicyCode;
  /** Số phiên bản - số nguyên dương, tăng dần */
  policyVersion: number;
  title: string;
  /** URL PDF lưu trên Azure Blob / S3 - có thể null */
  pdfUrl: string | null;
  /** Thời điểm có hiệu lực */
  effectiveFrom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * UserConsentResponse - trả về từ API-110 và API-111.
 *
 * Ghi chú:
 *   - API-110 là idempotent: cùng user + policy + consentType + consentContext → trả record cũ
 *   - `ipAddress` và `userAgent` có thể null nếu BE lấy từ request headers
 */
export interface UserConsentResponse {
  userConsentId: string;
  userId: string;
  policyDocumentId: string;
  policyCode: PolicyCode;
  policyVersion: number;
  policyTitle: string;
  consentType: ConsentType;
  consentContext: ConsentContext;
  /** ISO string hoặc "2026-03-24 10:30:00 AM" */
  consentedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ─────────────────────────────────────────────────────

export interface PolicySingleResponse {
  success: boolean;
  message?: string;
  data: PolicyDocumentResponse;
  meta?: { timestamp: string; instance: string };
}

export interface PolicyListResponse {
  success: boolean;
  message?: string;
  data: {
    content: PolicyDocumentResponse[];
    meta: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  meta?: { timestamp: string; instance: string };
}

export interface ConsentSingleResponse {
  success: boolean;
  message?: string;
  data: UserConsentResponse;
  meta?: { timestamp: string; instance: string };
}

/** API-111: GET /policies/my-consents - trả mảng trực tiếp trong data */
export interface MyConsentsResponse {
  success: boolean;
  message?: string;
  data: UserConsentResponse[];
  meta?: { timestamp: string; instance: string };
}

// ─── Request Payloads ──────────────────────────────────────────────────────────

/**
 * CreatePolicyInput - payload cho API-105 POST /policies
 *
 * Required: code, policyVersion, title, effectiveFrom
 * Optional: pdfUrl
 */
export interface CreatePolicyInput {
  /** Mã phân loại: RENTAL_TERMS, PRIVACY_POLICY, ... */
  code: PolicyCode;
  /** Số phiên bản nguyên dương - nên lớn hơn phiên bản active hiện tại */
  policyVersion: number;
  title: string;
  /** ISO 8601 UTC, VD: "2026-04-01T00:00:00Z" */
  effectiveFrom: string;
  /** URL PDF - tùy chọn */
  pdfUrl?: string;
}

/**
 * ConsentInput - payload cho API-110 POST /policies/{policyId}/consent
 *
 * Tất cả field đều tùy chọn; backend dùng giá trị mặc định nếu bỏ trống.
 * Idempotent: gửi lại với cùng key không tạo bản ghi mới.
 */
export interface ConsentInput {
  /** Mặc định: ACCEPTED */
  consentType?: ConsentType;
  /** Mặc định: ACCOUNT */
  consentContext?: ConsentContext;
  /** Nếu bỏ trống, BE lấy từ HttpServletRequest */
  ipAddress?: string;
  /** Nếu bỏ trống, BE lấy từ HttpServletRequest */
  userAgent?: string;
}

/**
 * PolicyListParams - query params cho API-108 GET /policies
 */
export interface PolicyListParams {
  /** 1-indexed (BE spec) */
  page?: number;
  size?: number;
  /** SpringFilter DSL, VD: isActive:true hoặc code:'RENTAL_TERMS' */
  filter?: string;
  /** VD: policyVersion,desc */
  sort?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const policiesApi = {
  /**
   * API-105: Tạo tài liệu chính sách mới [AUTH]
   *
   * Lưu ý: Mỗi (code, policyVersion) phải là duy nhất.
   * Để thay thế phiên bản cũ, gọi API-109 deactivate trước.
   */
  create(
    data: CreatePolicyInput,
  ): Promise<AxiosResponse<PolicySingleResponse>> {
    return httpService.post<PolicySingleResponse>('/policies', data, authOpts);
  },

  /**
   * API-106: Lấy tài liệu chính sách theo ID [PUBLIC]
   *
   * @param policyId - UUID của PolicyDocument
   */
  getById(policyId: string): Promise<AxiosResponse<PolicySingleResponse>> {
    return httpService.get<PolicySingleResponse>(`/policies/${policyId}`);
  },

  /**
   * API-107: Lấy phiên bản mới nhất của chính sách theo code [PUBLIC]
   *
   * Trả về PolicyDocumentResponse có isActive:true và policyVersion cao nhất.
   *
   * @param code - Mã phân loại, VD: "RENTAL_TERMS"
   *
   * Dùng để:
   *   - Hiển thị điều khoản cho user trước khi checkout
   *   - Kiểm tra user đã đồng ý phiên bản mới nhất chưa
   */
  getLatestByCode(code: string): Promise<AxiosResponse<PolicySingleResponse>> {
    return httpService.get<PolicySingleResponse>(
      `/policies/code/${encodeURIComponent(code)}/latest`,
    );
  },

  /**
   * API-108: Lấy danh sách tài liệu chính sách [PUBLIC]
   *
   * @param params.page   - Trang (1-indexed, mặc định 1)
   * @param params.size   - Kích thước trang (mặc định 10)
   * @param params.filter - SpringFilter DSL, VD: isActive:true
   * @param params.sort   - VD: policyVersion,desc
   */
  list(params?: PolicyListParams): Promise<AxiosResponse<PolicyListResponse>> {
    return httpService.get<PolicyListResponse>('/policies', { params });
  },

  /**
   * API-109: Vô hiệu hóa tài liệu chính sách [AUTH]
   *
   * Side effect: isActive → false
   * Không xóa record; policy vẫn truy vấn được qua API-106.
   *
   * @param policyId - UUID của PolicyDocument cần vô hiệu hóa
   */
  deactivate(policyId: string): Promise<AxiosResponse<PolicySingleResponse>> {
    return httpService.patch<PolicySingleResponse>(
      `/policies/${policyId}/deactivate`,
      undefined,
      authOpts,
    );
  },

  /**
   * API-110: Ghi nhận đồng ý chính sách [AUTH]
   *
   * Idempotent: Nếu đã tồn tại consent cùng (user + policy + consentType + consentContext),
   * backend trả lại record hiện có, không tạo bản ghi mới.
   *
   * Dùng khi:
   *   - User nhấn "Tôi đồng ý" tại checkout (consentContext: CHECKOUT)
   *   - User đăng ký tài khoản (consentContext: ACCOUNT)
   *   - Ký hợp đồng (consentContext: CONTRACT)
   *
   * @param policyId - UUID của PolicyDocument
   * @param data     - ConsentInput (tất cả field tùy chọn)
   */
  recordConsent(
    policyId: string,
    data?: ConsentInput,
  ): Promise<AxiosResponse<ConsentSingleResponse>> {
    return httpService.post<ConsentSingleResponse>(
      `/policies/${policyId}/consent`,
      data ?? {},
      authOpts,
    );
  },

  /**
   * API-111: Lấy danh sách đồng ý chính sách của tôi [AUTH]
   *
   * Trả mảng tất cả consent records của user hiện tại.
   * Dùng để kiểm tra user đã đồng ý policy version nào.
   */
  myConsents(): Promise<AxiosResponse<MyConsentsResponse>> {
    return httpService.get<MyConsentsResponse>(
      '/policies/my-consents',
      authOpts,
    );
  },
};
