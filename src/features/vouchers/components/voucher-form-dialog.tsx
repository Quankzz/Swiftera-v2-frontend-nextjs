"use client";

import { useState, useEffect, startTransition } from "react";
import { X, Loader2, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type {
  VoucherResponse,
  DiscountType,
  VoucherType,
} from "@/features/vouchers/types";
import {
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useVoucherQuery,
} from "@/features/vouchers/hooks/use-voucher-management";
import { useIsDirty } from "@/hooks/use-is-dirty";
import { normalizeError } from "@/api/apiService";

// ─────────────────────────────────────────────────────────────────────────────
// Form State
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  code: string;
  type: VoucherType;
  discountType: DiscountType;
  discountValue: string; // string để dễ bind input
  maxDiscountAmount: string;
  minRentalDays: string;
  expiresAt: string; // "YYYY-MM-DDTHH:mm" cho datetime-local input
  isActive: boolean;
}

function toDateTimeLocalValue(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    // BE trả về format "2026-11-12 00:09:00 AM" - đây là LOCAL time (Vietnam UTC+7)
    // KHÔNG thêm Z (UTC), KHÔNG cộng/trừ offset - chỉ parse thẳng thành datetime-local
    const ampmMatch = dateStr.match(
      /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
    );
    if (ampmMatch) {
      const [, datePart, rawHour, min, , ampm] = ampmMatch;
      let hour = parseInt(rawHour, 10);
      // Chuẩn 12h AM/PM → 24h
      if (hour < 12 && ampm.toUpperCase() === "PM") hour += 12;
      if (hour === 12 && ampm.toUpperCase() === "AM") hour = 0;
      // Trả về "YYYY-MM-DDTHH:mm" cho datetime-local input - không cần timezone
      return `${datePart}T${String(hour).padStart(2, "0")}:${min}`;
    }
    // Fallback: "YYYY-MM-DD HH:mm:ss" không có AM/PM - parse trực tiếp
    const isoLike = dateStr.replace(" ", "T").slice(0, 16); // "YYYY-MM-DDTHH:mm"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(isoLike)) return isoLike;
    return "";
  } catch {
    return "";
  }
}

function initForm(voucher: VoucherResponse | null): FormState {
  if (!voucher) {
    return {
      code: "",
      type: "ITEM_VOUCHER",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minRentalDays: "",
      expiresAt: "",
      isActive: true,
    };
  }
  return {
    code: voucher.code,
    type: voucher.type ?? "ITEM_VOUCHER",
    discountType: voucher.discountType,
    discountValue: String(voucher.discountValue),
    maxDiscountAmount:
      voucher.maxDiscountAmount != null
        ? String(voucher.maxDiscountAmount)
        : "",
    minRentalDays:
      voucher.minRentalDays != null ? String(voucher.minRentalDays) : "",
    expiresAt: toDateTimeLocalValue(voucher.expiresAt),
    isActive: voucher.isActive,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface VoucherFormDialogProps {
  /** null → create mode; voucher → edit mode */
  target: VoucherResponse | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function VoucherFormDialog({ target, onClose }: VoucherFormDialogProps) {
  const isEdit = target !== null;

  // Fetch fresh data by ID khi ở edit mode - tránh dùng stale data từ list
  const { data: freshVoucher, isLoading: isFetchingVoucher } = useVoucherQuery(
    isEdit ? target.voucherId : undefined,
  );

  // Form khởi tạo từ target (optimistic), sau đó sync khi freshVoucher về
  const [form, setForm] = useState<FormState>(() => initForm(target));
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync form khi API trả về data mới nhất (có expiresAt đúng format)
  useEffect(() => {
    if (freshVoucher) {
      startTransition(() => setForm(initForm(freshVoucher)));
    }
  }, [freshVoucher]);

  const createMutation = useCreateVoucherMutation();
  const updateMutation = useUpdateVoucherMutation();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const initialForm = initForm(freshVoucher ?? target);
  const isDirty = useIsDirty(initialForm, form);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerError(null);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // Chuyển expiresAt datetime-local → ISO 8601 UTC (BE nhận ISO)
    // Validate để BE xử lý, chỉ convert format ở đây
    let expiresAtISO: string | null = null;
    if (form.expiresAt) {
      expiresAtISO = new Date(form.expiresAt).toISOString();
    }

    try {
      if (isEdit && target) {
        await updateMutation.mutateAsync({
          voucherId: target.voucherId,
          payload: {
            type: form.type,
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            maxDiscountAmount: form.maxDiscountAmount
              ? Number(form.maxDiscountAmount)
              : null,
            minRentalDays: form.minRentalDays
              ? Number(form.minRentalDays)
              : null,
            expiresAt: expiresAtISO,
            isActive: form.isActive,
          },
        });
        toast.success("Cập nhật voucher thành công");
      } else {
        await createMutation.mutateAsync({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxDiscountAmount: form.maxDiscountAmount
            ? Number(form.maxDiscountAmount)
            : undefined,
          minRentalDays: form.minRentalDays
            ? Number(form.minRentalDays)
            : undefined,
          expiresAt: expiresAtISO ?? undefined,
        });
        toast.success("Tạo voucher thành công");
      }
      onClose();
    } catch (err) {
      const appErr = normalizeError(err);
      setServerError(appErr.message);
      toast.error(appErr.message);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white dark:bg-surface-card shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/8 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-linear-to-br from-theme-primary-start to-theme-primary-end">
              <Tag size={17} className="text-white" />
            </div>
            <h2 className="text-base font-semibold text-text-main">
              {isEdit ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-6 py-5 space-y-5 relative"
        >
          {/* Loading overlay khi đang fetch fresh data by ID */}
          {isFetchingVoucher && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-surface-card/70 backdrop-blur-[2px]">
              <Loader2
                size={24}
                className="animate-spin text-theme-primary-start"
              />
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Mã voucher - chỉ editable khi create */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-main">
              Mã voucher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              disabled={isEdit}
              placeholder="VD: SUMMER30"
              className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base px-3 text-sm text-text-main font-mono placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase transition"
            />
            {isEdit && (
              <p className="text-xs text-text-sub">
                Mã voucher không thể thay đổi sau khi tạo.
              </p>
            )}
          </div>

          {/* Loại voucher */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-main">
              Loại voucher <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(["ITEM_VOUCHER", "PRODUCT_DISCOUNT"] as VoucherType[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      form.type === t
                        ? "border-theme-primary-start bg-theme-primary-start/10 text-theme-primary-start dark:bg-theme-primary-start/20"
                        : "border-gray-200 dark:border-white/8 text-text-sub hover:border-gray-300 dark:hover:border-white/15"
                    }`}
                  >
                    {t === "ITEM_VOUCHER" ? "🎫 Đơn hàng" : "🏷 Sản phẩm"}
                  </button>
                ),
              )}
            </div>
            {form.type === "PRODUCT_DISCOUNT" && (
              <p className="text-xs text-text-sub">
                Voucher sản phẩm sẽ được gắn với sản phẩm cụ thể sau khi tạo qua
                trang quản lý sản phẩm.
              </p>
            )}
          </div>

          {/* Loại giảm giá */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-main">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(["PERCENTAGE", "FIXED"] as DiscountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("discountType", type)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    form.discountType === type
                      ? "border-theme-primary-start bg-theme-primary-start/10 text-theme-primary-start dark:bg-theme-primary-start/20"
                      : "border-gray-200 dark:border-white/8 text-text-sub hover:border-gray-300 dark:hover:border-white/15"
                  }`}
                >
                  {type === "PERCENTAGE" ? "% Phần trăm" : "₫ Cố định"}
                </button>
              ))}
            </div>
          </div>

          {/* Giá trị giảm */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-main">
                Giá trị giảm{" "}
                {form.discountType === "PERCENTAGE" ? "(%)" : "(VNĐ)"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                step={form.discountType === "PERCENTAGE" ? 1 : 1000}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={
                  form.discountType === "PERCENTAGE" ? "30" : "200000"
                }
                className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition"
              />
            </div>

            {/* Giảm tối đa - chỉ PERCENTAGE */}
            {form.discountType === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-main">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.maxDiscountAmount}
                  onChange={(e) => set("maxDiscountAmount", e.target.value)}
                  placeholder="500000"
                  className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition"
                />
              </div>
            )}
          </div>

          {/* Ngày thuê tối thiểu */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-main">
              Ngày thuê tối thiểu
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.minRentalDays}
              onChange={(e) => set("minRentalDays", e.target.value)}
              placeholder="3"
              className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base px-3 text-sm text-text-main placeholder:text-text-sub focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition"
            />
          </div>

          {/* Ngày hết hạn */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-main">
              Ngày hết hạn
            </label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-base px-3 text-sm text-text-main focus:border-theme-primary-start focus:outline-none focus:ring-2 focus:ring-theme-primary-start/20 transition"
            />
            <p className="text-xs text-text-sub">
              Để trống nếu voucher không có thời hạn.
            </p>
          </div>

          {/* isActive toggle - chỉ edit mode */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/8 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-main">
                  Trạng thái kích hoạt
                </p>
                <p className="text-xs text-text-sub mt-0.5">
                  Tắt để vô hiệu hóa voucher mà không xóa
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive
                    ? "bg-theme-primary-start"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/8 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-gray-200 dark:border-white/8 px-5 py-2.5 text-sm font-medium text-text-main transition hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !isDirty || (!isEdit && !form.code.trim())}
            className="inline-flex items-center gap-2 rounded-md bg-theme-primary-start px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo voucher"}
          </button>
        </div>
      </div>
    </div>
  );
}
