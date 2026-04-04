/**
 * Voucher management hooks — TanStack Query
 * Module 11: VOUCHERS (API-066 → API-072)
 *
 * Gom toàn bộ hooks CRUD voucher vào 1 file.
 * Error từ apiService/AppError đi xuyên suốt để UI hiển thị toast.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { voucherKeys } from '../api/voucher.keys';
import {
  getVouchersList,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../api/voucher.service';
import type {
  VoucherListParams,
  CreateVoucherInput,
  UpdateVoucherInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useVouchersQuery — phân trang danh sách voucher (API-070)
 * staleTime 30s — danh sách voucher thay đổi khi admin CRUD
 * placeholderData: keepPreviousData — giữ dữ liệu trang cũ khi chuyển trang (fix bug trang 1/2 giống nhau)
 */
export function useVouchersQuery(params?: VoucherListParams) {
  return useQuery({
    queryKey: voucherKeys.list(params as Record<string, unknown> | undefined),
    queryFn: () => getVouchersList(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * useVoucherQuery — chi tiết 1 voucher (API-067)
 * Chỉ enabled khi có voucherId
 */
export function useVoucherQuery(voucherId?: string) {
  return useQuery({
    queryKey: voucherKeys.detail(voucherId ?? ''),
    queryFn: () => getVoucherById(voucherId!),
    enabled: !!voucherId,
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useCreateVoucherMutation — tạo voucher mới (API-066)
 * Invalidate toàn bộ list sau khi tạo.
 */
export function useCreateVoucherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVoucherInput) => createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
    },
  });
}

/**
 * useUpdateVoucherMutation — cập nhật voucher (API-071)
 * Invalidate list + detail của voucher đó.
 */
export function useUpdateVoucherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      voucherId,
      payload,
    }: {
      voucherId: string;
      payload: UpdateVoucherInput;
    }) => updateVoucher(voucherId, payload),
    onSuccess: (_data, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: voucherKeys.detail(voucherId),
      });
    },
  });
}

/**
 * useDeleteVoucherMutation — xóa voucher (API-072)
 * Invalidate list sau khi xóa, remove detail khỏi cache.
 */
export function useDeleteVoucherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voucherId: string) => deleteVoucher(voucherId),
    onSuccess: (_data, voucherId) => {
      queryClient.invalidateQueries({ queryKey: voucherKeys.lists() });
      queryClient.removeQueries({ queryKey: voucherKeys.detail(voucherId) });
    },
  });
}
