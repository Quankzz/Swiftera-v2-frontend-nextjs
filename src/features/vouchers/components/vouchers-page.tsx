"use client";

import { useState } from "react";
import { Plus, Tag, ToggleLeft, ToggleRight, TrendingDown } from "lucide-react";
import type { VoucherResponse } from "@/features/vouchers/types";
import { VoucherTable } from "./voucher-table";
import type { VoucherTableMeta } from "./voucher-table";
import { VoucherFormDialog } from "./voucher-form-dialog";
import { VoucherDeleteDialog } from "./voucher-delete-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type DialogState =
  | { type: "idle" }
  | { type: "create" }
  | { type: "edit"; voucher: VoucherResponse }
  | { type: "delete"; voucher: VoucherResponse };

export function VouchersPage() {
  const [dialog, setDialog] = useState<DialogState>({ type: "idle" });
  // Stats đến từ VoucherTable qua callback - không cần query riêng size:100
  const [meta, setMeta] = useState<VoucherTableMeta>({
    totalElements: 0,
    activeCount: 0,
    expiredCount: 0,
    disabledCount: 0,
  });

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">
            Quản lý voucher
          </h2>
          <p className="mt-1 text-sm text-text-sub">
            Tạo và quản lý mã giảm giá cho người dùng thuê sản phẩm
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog({ type: "create" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-theme-primary-start px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
        >
          <Plus className="size-4" />
          Tạo voucher mới
        </button>
      </div>

      {/* Stats - phản ánh trang hiện tại trong bảng */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
          <Tag className="size-4 text-theme-primary-start" />
          <span className="text-sm font-medium text-text-main">
            {meta.totalElements}
          </span>
          <span className="text-sm text-text-sub">tổng voucher</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
          <ToggleRight className="size-4 text-green-500" />
          <span className="text-sm font-medium text-text-main">
            {meta.activeCount}
          </span>
          <span className="text-sm text-text-sub">đang hoạt động</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
          <TrendingDown className="size-4 text-red-400" />
          <span className="text-sm font-medium text-text-main">
            {meta.expiredCount}
          </span>
          <span className="text-sm text-text-sub">đã hết hạn</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card px-4 py-2.5">
          <ToggleLeft className="size-4 text-gray-400" />
          <span className="text-sm font-medium text-text-main">
            {meta.disabledCount}
          </span>
          <span className="text-sm text-text-sub">đã tắt</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-surface-card overflow-hidden">
        <VoucherTable
          onEdit={(v) => setDialog({ type: "edit", voucher: v })}
          onDelete={(v) => setDialog({ type: "delete", voucher: v })}
          onMetaChange={setMeta}
        />
      </div>

      {/* Dialogs */}
      {dialog.type === "create" && (
        <VoucherFormDialog
          key="create"
          target={null}
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
      {dialog.type === "edit" && (
        <VoucherFormDialog
          key={`edit-${dialog.voucher.voucherId}`}
          target={dialog.voucher}
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
      {dialog.type === "delete" && (
        <VoucherDeleteDialog
          voucher={dialog.voucher}
          onClose={() => setDialog({ type: "idle" })}
        />
      )}
    </div>
  );
}
