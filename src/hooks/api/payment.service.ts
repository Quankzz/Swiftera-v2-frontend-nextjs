/**
 * Payment API service - Module 13: PAYMENTS (API-086 → API-089)
 *
 * Service layer chỉ chứa hàm gọi API thuần túy.
 * Không chứa UI logic - chỉ trả về raw data.
 */

import { httpService } from '@/api/http';
import type {
  PaymentTransactionSingleResponse,
  PaymentTransactionListResponse,
  PaymentInitiateResponse,
  PaymentTransactionResponse,
} from '@/api/payment';

const authOpts = { requireToken: true as const };

// ─── Normalized types ──────────────────────────────────────────────────────────

export interface NormalizedPaginatedTransactions {
  items: PaymentTransactionResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

// ─── API functions ─────────────────────────────────────────────────────────────

/**
 * API-086: GET /payments/{paymentTransactionId}
 */
export async function getPaymentTransactionById(
  paymentTransactionId: string,
): Promise<PaymentTransactionResponse> {
  const res = await httpService.get<PaymentTransactionSingleResponse>(
    `/payments/${paymentTransactionId}`,
    authOpts,
  );
  return res.data.data;
}

/**
 * API-087: GET /payments?page=1&size=10&filter=...
 * Lấy danh sách giao dịch (phân trang, filter)
 */
export async function getPaymentsList(params?: {
  page?: number;
  size?: number;
  filter?: string;
  sort?: string;
}): Promise<NormalizedPaginatedTransactions> {
  const res = await httpService.get<PaymentTransactionListResponse>(
    '/payments',
    { ...authOpts, params },
  );

  const raw = res.data.data;
  return {
    items: raw.content ?? [],
    page: raw.meta?.currentPage ?? 1,
    size: raw.meta?.pageSize ?? 20,
    totalItems: raw.meta?.totalElements ?? 0,
    totalPages: raw.meta?.totalPages ?? 1,
  };
}

/**
 * API-088: GET /payments/rental-order/{rentalOrderId}?page=1&size=10
 * Lấy danh sách giao dịch theo đơn thuê
 */
export async function getPaymentsByRentalOrder(
  rentalOrderId: string,
  params?: { page?: number; size?: number },
): Promise<NormalizedPaginatedTransactions> {
  const res = await httpService.get<PaymentTransactionListResponse>(
    `/payments/rental-order/${rentalOrderId}`,
    { ...authOpts, params },
  );

  const raw = res.data.data;
  return {
    items: raw.content ?? [],
    page: raw.meta?.currentPage ?? 1,
    size: raw.meta?.pageSize ?? 20,
    totalItems: raw.meta?.totalElements ?? 0,
    totalPages: raw.meta?.totalPages ?? 1,
  };
}

/**
 * API-089: POST /payments/{rentalOrderId}/initiate
 * Tạo link thanh toán VNPay, trả về URL redirect
 *
 * Logic backend:
 *   amount = totalPayableAmount - totalPaidAmount
 *   Tạo transaction RENTAL_FEE status=PENDING
 *   Ký và trả URL thanh toán VNPay
 *
 * Nếu đơn không ở PENDING_PAYMENT hoặc đã thanh toán đủ → trả lỗi 4xx
 */
export async function initiatePayment(rentalOrderId: string): Promise<string> {
  const res = await httpService.post<PaymentInitiateResponse>(
    `/payments/${rentalOrderId}/initiate`,
    undefined,
    authOpts,
  );
  return res.data.data;
}
