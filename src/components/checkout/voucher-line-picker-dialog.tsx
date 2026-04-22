"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TicketPercent,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useVoucherApply } from "@/features/vouchers/hooks/use-customer-vouchers";
import type { VoucherResponse } from "@/features/vouchers/types";
import type { CartLineVoucherItem } from "@/api/cart";
import { cn } from "@/lib/utils";

type VoucherLinePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tổng tiền thuê của dòng (đơn giá × SL × ngày) */
  lineRentalSubtotal: number;
  /** Số ngày thuê của dòng */
  lineRentalDays: number;
  /** Voucher đang được áp dụng (nếu có) */
  appliedCode: string | null;
  /** Callback khi áp dụng voucher thành công */
  onApply: (voucher: VoucherResponse) => void;
  /** Callback khi bỏ voucher */
  onClear: () => void;
  /** Voucher BE trả về riêng cho dòng này (từ cartLines[].availableVouchers) */
  suggestedVouchers?: CartLineVoucherItem[];
  /**
   * productId của dòng - truyền vào API-070 validate để BE check scope
   * ITEM_VOUCHER / PRODUCT_DISCOUNT. Nếu không truyền, BE validate
   * như voucher toàn đơn.
   */
  productId?: string;
  /**
   * Các voucher code đã được dùng ở dòng khác trong giỏ.
   * Những code này sẽ bị disable (mỗi code chỉ dùng được 1 lần).
   */
  usedCodes?: Set<string>;
};

function fmt(amount: number) {
  return amount.toLocaleString("vi-VN") + "₫";
}

/** Tính preview giảm giá client-side từ CartLineVoucherItem */
function calcSuggestedDiscount(
  lineSubtotal: number,
  v: CartLineVoucherItem,
): number {
  if (v.discountType === "PERCENTAGE") {
    let d = Math.floor((lineSubtotal * v.discountValue) / 100);
    if (v.maxDiscountAmount) d = Math.min(d, v.maxDiscountAmount);
    return d;
  }
  return Math.min(v.discountValue, lineSubtotal);
}

export function VoucherLinePickerDialog({
  open,
  onOpenChange,
  lineRentalSubtotal,
  lineRentalDays,
  appliedCode,
  onApply,
  onClear,
  suggestedVouchers = [],
  productId,
  usedCodes,
}: VoucherLinePickerDialogProps) {
  const {
    inputCode,
    setInputCode,
    inputError,
    isValidating,
    applyByCode,
    clearVoucher,
  } = useVoucherApply();
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  /** Áp dụng voucher từ danh sách suggestedVouchers (CartLineVoucherItem) */
  async function handleApplySuggested(sv: CartLineVoucherItem) {
    setApplyingCode(sv.code);
    await applyByCode(
      sv.code,
      lineRentalDays,
      lineRentalSubtotal,
      (result) => {
        const fakeVoucher: VoucherResponse = {
          voucherId: sv.voucherId,
          code: sv.code,
          type: "ITEM_VOUCHER",
          discountType: sv.discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
          discountValue: sv.discountValue,
          maxDiscountAmount: sv.maxDiscountAmount,
          minRentalDays: sv.minRentalDays,
          expiresAt: sv.expiresAt,
          usageLimit: null,
          usedCount: 0,
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
        onApply(fakeVoucher);
        onOpenChange(false);
        toast.success(
          `Áp dụng voucher ${sv.code} thành công! Giảm ${fmt(result.discountAmount)}`,
        );
      },
      (msg) => {
        toast.error(msg);
      },
      // suggestedVoucher luôn thuộc loại ITEM_VOUCHER / PRODUCT_DISCOUNT
      // → truyền productId để BE validate đúng scope
      sv.productId ?? productId,
    );
    setApplyingCode(null);
  }

  async function handleApplyInput() {
    if (!inputCode.trim()) return;
    const code = inputCode.trim().toUpperCase();
    setApplyingCode(code);
    await applyByCode(
      code,
      lineRentalDays,
      lineRentalSubtotal,
      (result) => {
        onOpenChange(false);
        toast.success(
          `Áp dụng voucher ${code} thành công! Giảm ${fmt(result.discountAmount)}`,
        );
      },
      (msg) => {
        toast.error(msg);
      },
      productId,
    );
    setApplyingCode(null);
  }

  function handleClear() {
    clearVoucher();
    onClear();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,620px)] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <TicketPercent className="size-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle className="text-lg font-bold">
              Chọn voucher
            </DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">
            Giảm trừ trên tiền thuê của dòng này.
          </DialogDescription>
        </DialogHeader>

        {/* Input mã voucher */}
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <Label htmlFor="voucher-input" className="sr-only">
            Nhập mã voucher
          </Label>
          <div className="flex gap-2">
            <Input
              id="voucher-input"
              placeholder="Nhập mã voucher…"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && void handleApplyInput()}
              className="font-mono text-sm uppercase"
              disabled={isValidating || !!applyingCode}
            />
            <Button
              type="button"
              size="sm"
              className="shrink-0 bg-blue-600 hover:bg-blue-700"
              onClick={() => void handleApplyInput()}
              disabled={!inputCode.trim() || isValidating || !!applyingCode}
            >
              {isValidating || applyingCode ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="text-xs">Áp dụng</span>
              )}
            </Button>
          </div>
          {inputError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="size-3 shrink-0" />
              {inputError}
            </p>
          )}
        </div>

        {/* Danh sách voucher */}
        <div className="max-h-[min(52dvh,380px)] overflow-y-auto px-4 py-3 sm:px-5">
          {/* Voucher dành riêng cho sản phẩm này */}
          {suggestedVouchers.length > 0 ? (
            <div className="space-y-2">
              {suggestedVouchers.map((sv) => {
                const isApplied = appliedCode === sv.code;
                const isApplying = applyingCode === sv.code;
                const usedByOther =
                  !isApplied && (usedCodes?.has(sv.code) ?? false);
                const discount = calcSuggestedDiscount(lineRentalSubtotal, sv);
                const eligible =
                  !usedByOther &&
                  discount > 0 &&
                  (!sv.minRentalDays || lineRentalDays >= sv.minRentalDays);

                return (
                  <div
                    key={sv.voucherId}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      usedByOther
                        ? "border-border/40 bg-muted/20 opacity-60"
                        : isApplied
                          ? "border-blue-500/50 bg-blue-50/50 dark:border-blue-500/40 dark:bg-blue-950/20"
                          : "border-blue-300/50 bg-blue-50/30 dark:border-blue-800/40 dark:bg-blue-950/10",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {sv.code}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          >
                            {sv.discountType === "PERCENTAGE"
                              ? `−${sv.discountValue}%`
                              : `−${fmt(sv.discountValue)}`}
                          </Badge>
                        </div>
                        {sv.minRentalDays && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Áp dụng từ {sv.minRentalDays} ngày
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        {usedByOther ? (
                          <span className="text-xs text-muted-foreground">
                            Đã dùng ở sản phẩm khác
                          </span>
                        ) : isApplied ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <CheckCircle2 className="size-4" />
                            Đang dùng
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 gap-1 bg-blue-600 text-xs hover:bg-blue-700"
                            disabled={!eligible || !!applyingCode}
                            onClick={() => void handleApplySuggested(sv)}
                          >
                            {isApplying ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              "Áp dụng"
                            )}
                          </Button>
                        )}
                        {eligible && !isApplied && !usedByOther && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            −{fmt(discount)}
                          </span>
                        )}
                        {!eligible && !isApplied && !usedByOther && (
                          <span className="text-xs text-muted-foreground">
                            Chưa đủ điều kiện
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Không có voucher khả dụng cho sản phẩm này.
              </p>
            </div>
          )}
        </div>

        {/* Bỏ voucher */}
        {appliedCode && (
          <div className="border-t border-border px-4 py-3 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              className="w-full gap-1.5 text-destructive hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={handleClear}
            >
              <X className="size-4" />
              Bỏ voucher &quot;{appliedCode}&quot;
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
