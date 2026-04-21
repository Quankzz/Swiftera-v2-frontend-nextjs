/**
 * Payments API - Module 13: PAYMENTS (API-086 → API-091)
 *
 * Base URL: /api/v1
 * Tất cả endpoints đều yêu cầu xác thực [AUTH] (trừ IPN /return)
 *
 * VNPay flow:
 *   1. POST /payments/{rentalOrderId}/initiate  → nhận paymentUrl
 *   2. Redirect browser sang paymentUrl (VNPay sandbox/prod)
 *   3. VNPay gọi IPN (server-to-server) → cập nhật transaction + order status
 *   4. VNPay redirect về return URL của frontend
 *
 * Lỗi thường gặp:
 *   - code=71  → Terminal (vnp_TmnCode) chưa được phê duyệt trên sandbox
 *   - code=75  → IP/domain chưa whitelisted trong cấu hình VNPay merchant
 *   - code=99  → Checksum không khớp hoặc request bị sửa đổi
 */

import type { AxiosResponse } from 'axios';
import { httpService } from '@/api/http';

const authOpts = { requireToken: true as const };

// ─── Types ───────────────────────────────────────────────────────────────────

/** transactionType */
export type TransactionType =
  | 'RENTAL_FEE'
  | 'DEPOSIT'
  | 'DEPOSIT_REFUND'
  | 'PENALTY';

/** payment status */
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

/** VNPay transaction type (phân biệt hoàn toàn với internal TransactionType) */
export type VnpTransactionType = '01' | '02' | '03' | '04';
/** Mã loại giao dịch thanh toán:
 *  01: GD thường (rental fee)
 *  02: Hoàn tiền
 *  03: Kéo tiền
 *  04: Hoàn tiền tự động
 */

/** PaymentTransactionResponse - API-086, 087, 088 */
export interface PaymentTransactionResponse {
  paymentTransactionId: string;
  rentalOrderId: string;
  transactionType: TransactionType;
  amount: number;
  paymentMethod: 'VNPAY';
  status: PaymentStatus;
  vnpTxnRef: string;
  description: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Wrappers ─────────────────────────────────────────────────

/** API-086: GET /payments/{paymentTransactionId} */
export interface PaymentTransactionSingleResponse {
  success: boolean;
  message: string;
  data: PaymentTransactionResponse;
}

/** API-087, 088: GET /payments?... hoặc /payments/rental-order/{rentalOrderId}?...
 * Backend trả PaginationResponse với mảng PaymentTransactionResponse
 */
export interface PaymentTransactionListResponse {
  success: boolean;
  message: string;
  data: {
    content: PaymentTransactionResponse[];
    meta: {
      currentPage: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    };
  };
}

/** API-089: POST /payments/{rentalOrderId}/initiate
 *
 * Logic phía backend:
 *   amount = totalPayableAmount - totalPaidAmount
 *   Tạo transaction RENTAL_FEE với status PENDING
 *   Ký URL VNPay với vnp_Amount, vnp_TxnRef, vnp_Command=pay...
 *
 * Nếu rentalOrderId không tồn tại hoặc order không ở PENDING_PAYMENT
 * → backend trả 4xx error
 */
export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  data: string; // → full VNPay payment URL
}

export interface CreateRefundTransactionRequest {
  rentalOrderId: string;
  refundAmount: number;
  refundReason: string;
}

export interface CreateRefundTransactionResponse {
  success: boolean;
  message: string;
  data: string; // → paymentTransactionId of created refund transaction
}

// ─── VNPay Return / IPN Query Params (frontend đọc khi quay về) ───────────

/** Khi user quay về từ VNPay (return URL), frontend đọc query params này */
export interface VnpayReturnParams {
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_BankCode: string;
  vnp_PayDate: string;
  vnp_SecureHash: string;
}

/** Parse VNPay response code thành message */
export const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Giao dịch đã được xử lý, kết quả giao dịch không thay đổi',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký Internet Banking',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực sai thông tin thẻ/Tài khoản',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán (quit)',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
  '13': 'Giao dịch không thành công do: Nhập sai mật khẩu thanh toán quá 3 lần',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
  '65': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
  '75': 'Ngân hàng đang bảo trì',
  '79': 'Giao dịch không thành công do: Nhập sai mật khẩu thanh toán',
  '99': 'Giao dịch không thành công do: Checksum không hợp lệ',
  '71': 'Website chưa được phê duyệt trên cổng thanh toán VNPay',
};

export function getVnpayMessage(code: string): string {
  return VNPAY_RESPONSE_MESSAGES[code] ?? `Lỗi không xác định (code: ${code})`;
}

/** Kiểm tra response code có phải thành công không */
export function isVnpaySuccess(code: string): boolean {
  return code === '00';
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const paymentApi = {
  /**
   * API-086: Lấy giao dịch thanh toán theo ID [AUTH]
   *
   * @param paymentTransactionId - UUID của giao dịch
   */
  getById(
    paymentTransactionId: string,
  ): Promise<AxiosResponse<PaymentTransactionSingleResponse>> {
    return httpService.get<PaymentTransactionSingleResponse>(
      `/payments/${paymentTransactionId}`,
      authOpts,
    );
  },

  /**
   * API-087: Lấy danh sách giao dịch [AUTH]
   *
   * @param params.page   - số trang (one-indexed, mặc định 1)
   * @param params.size   - kích thước trang (mặc định 10)
   * @param params.filter - SpringFilter DSL, VD: status:'SUCCESS'
   * @param params.sort   - VD: createdAt,desc
   */
  list(params?: {
    page?: number;
    size?: number;
    filter?: string;
    sort?: string;
  }): Promise<AxiosResponse<PaymentTransactionListResponse>> {
    return httpService.get<PaymentTransactionListResponse>('/payments', {
      ...authOpts,
      params,
    });
  },

  /**
   * API-088: Lấy danh sách giao dịch theo đơn thuê [AUTH]
   *
   * @param rentalOrderId - UUID của đơn thuê
   * @param params.page   - số trang
   * @param params.size   - kích thước trang
   */
  listByRentalOrder(
    rentalOrderId: string,
    params?: { page?: number; size?: number },
  ): Promise<AxiosResponse<PaymentTransactionListResponse>> {
    return httpService.get<PaymentTransactionListResponse>(
      `/payments/rental-order/${rentalOrderId}`,
      { ...authOpts, params },
    );
  },

  /**
   * API-089: Tạo link thanh toán VNPay [AUTH]
   *
   * @param rentalOrderId - UUID của đơn thuê (phải ở trạng thái cho phép thanh toán)
   * @param additionalRentalDays - số ngày gia hạn tạm tính để thanh toán trước gia hạn
   *
   * Logic backend: amount = totalPayableAmount - totalPaidAmount
   * Tạo transaction RENTAL_FEE status=PENDING, ký URL VNPay.
   * Frontend redirect window.location.href sang URL trả về.
   */
  initiate(
    rentalOrderId: string,
    additionalRentalDays?: number,
  ): Promise<AxiosResponse<PaymentInitiateResponse>> {
    return httpService.post<PaymentInitiateResponse>(
      `/payments/${rentalOrderId}/initiate`,
      undefined,
      {
        ...authOpts,
        params:
          typeof additionalRentalDays === 'number'
            ? { additionalRentalDays }
            : undefined,
      },
    );
  },

  /**
   * API: POST /payments/initiate-batch
   * Tạo một link VNPay duy nhất cho nhiều đơn thuê cùng lúc.
   * Khi thanh toán thành công, tất cả các đơn đều được chuyển sang PAID.
   *
   * @param orderIds - danh sách rentalOrderId cần thanh toán gộp
   */
  initiateBatch(
    orderIds: string[],
  ): Promise<AxiosResponse<PaymentInitiateResponse>> {
    return httpService.post<PaymentInitiateResponse>(
      '/payments/initiate-batch',
      { orderIds },
      authOpts,
    );
  },

  /**
   * Admin creates a DEPOSIT_REFUND payment transaction record.
   * Called after confirming the refund has been transferred to the customer.
   *
   * @param input - rentalOrderId, refundAmount, refundReason
   */
  createRefund(
    input: CreateRefundTransactionRequest,
  ): Promise<AxiosResponse<CreateRefundTransactionResponse>> {
    return httpService.post<CreateRefundTransactionResponse>(
      '/payments/refund',
      input,
      authOpts,
    );
  },
};
