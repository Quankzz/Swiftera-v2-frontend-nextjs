/**
 * Payments hooks - TanStack Query
 * Module 13: PAYMENTS (API-086 → API-091)
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentKeys } from './payment.keys';
import {
  getPaymentTransactionById,
  getPaymentsList,
  getPaymentsByRentalOrder,
  initiatePayment,
  initiatePaymentBatch,
  type InitiatePaymentInput,
} from './payment.service';

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Lấy chi tiết giao dịch theo ID [AUTH] - API-086
 * Dùng để hiển thị trạng thái thanh toán
 */
export function usePaymentTransactionQuery(paymentTransactionId: string) {
  return useQuery({
    queryKey: paymentKeys.detail(paymentTransactionId),
    queryFn: () => getPaymentTransactionById(paymentTransactionId),
    enabled: !!paymentTransactionId,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Lấy danh sách giao dịch (phân trang, filter) [AUTH] - API-087
 * Dùng cho trang quản lý thanh toán
 */
export function usePaymentsQuery(params?: {
  page?: number;
  size?: number;
  filter?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPaymentsList(params),
    staleTime: 15_000,
    retry: false,
  });
}

/**
 * Lấy danh sách giao dịch theo đơn thuê [AUTH] - API-088
 * Dùng để hiển thị lịch sử thanh toán trên trang chi tiết đơn thuê
 */
export function usePaymentsByOrderQuery(
  rentalOrderId: string,
  params?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: paymentKeys.byOrder(rentalOrderId, params),
    queryFn: () => getPaymentsByRentalOrder(rentalOrderId, params),
    enabled: !!rentalOrderId,
    staleTime: 15_000,
    retry: false,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────────

/**
 * Tạo link thanh toán VNPay [AUTH] - API-089
 *
 * Trả về URL thanh toán VNPay (sandbox hoặc production).
 * Frontend redirect window.location.href sang URL này.
 *
 * Lưu ý về lỗi VNPay thường gặp:
 *   - code=71 → Terminal chưa được phê duyệt trên sandbox
 *   - code=75 → IP/domain chưa whitelisted
 *   - code=99 → Checksum không hợp lệ
 *
 * Để xem message chi tiết dùng: import { getVnpayMessage } from '@/api/payment'
 */
export function useInitiatePayment(options?: {
  onSuccess?: (paymentUrl: string) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async (input: string | InitiatePaymentInput) => {
      return initiatePayment(input);
    },

    onSuccess: (paymentUrl) => {
      options?.onSuccess?.(paymentUrl);
    },

    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Tạo link thanh toán VNPay cho nhiều đơn cùng lúc [AUTH]
 * Trả về 1 URL duy nhất, thanh toán xong → BE mark tất cả đơn là PAID
 */
export function useInitiateBatchPayment(options?: {
  onSuccess?: (paymentUrl: string) => void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      return initiatePaymentBatch(orderIds);
    },
    onSuccess: (paymentUrl) => {
      options?.onSuccess?.(paymentUrl);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
