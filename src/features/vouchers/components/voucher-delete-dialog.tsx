"use client";

import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { VoucherResponse } from "@/features/vouchers/types";
import { useDeleteVoucherMutation } from "@/features/vouchers/hooks/use-voucher-management";
import { normalizeError } from "@/api/apiService";

interface VoucherDeleteDialogProps {
  voucher: VoucherResponse;
  onClose: () => void;
}

export function VoucherDeleteDialog({
  voucher,
  onClose,
}: VoucherDeleteDialogProps) {
  const deleteMutation = useDeleteVoucherMutation();

  async function handleConfirm() {
    try {
      await deleteMutation.mutateAsync(voucher.voucherId);
      toast.success(`Đã xóa voucher "${voucher.code}" thành công`);
      onClose();
    } catch (err) {
      const appErr = normalizeError(err);
      toast.error(appErr.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/40">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-text-main">
              Xác nhận xóa voucher
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-text-sub transition hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text-main"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-text-sub">
            Bạn có chắc chắn muốn xóa voucher dưới đây không? Thao tác này không
            thể hoàn tác.
          </p>
          <div className="rounded-md border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 space-y-1">
            <p className="font-mono font-semibold text-text-main text-sm">
              {voucher.code}
            </p>
            <p className="text-xs text-text-sub">
              {voucher.discountType === "PERCENTAGE"
                ? `Giảm ${voucher.discountValue}%`
                : `Giảm ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(voucher.discountValue)}`}
              {voucher.usedCount > 0 && (
                <> &middot; Đã dùng {voucher.usedCount} lần</>
              )}
            </p>
          </div>
          {voucher.usedCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Voucher này đã được sử dụng {voucher.usedCount} lần. Việc xóa có
                thể ảnh hưởng đến lịch sử đơn hàng.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/8 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="rounded-md border border-gray-200 dark:border-white/8 px-5 py-2.5 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            Xóa voucher
          </button>
        </div>
      </div>
    </div>
  );
}
