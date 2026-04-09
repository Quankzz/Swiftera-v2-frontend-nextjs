'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TicketPercent,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomerVouchersQuery,
  useVoucherApply,
} from '@/features/vouchers/hooks/use-customer-vouchers';
import type { VoucherResponse } from '@/features/vouchers/types';
import type { CartLineVoucherItem } from '@/api/cart';
import { cn } from '@/lib/utils';

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
   * productId của dòng — truyền vào API-070 validate để BE check scope
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
  return amount.toLocaleString('vi-VN') + '₫';
}

/** Tính preview giảm giá client-side từ CartLineVoucherItem */
function calcSuggestedDiscount(
  lineSubtotal: number,
  v: CartLineVoucherItem,
): number {
  if (v.discountType === 'PERCENTAGE') {
    let d = Math.floor((lineSubtotal * v.discountValue) / 100);
    if (v.maxDiscountAmount) d = Math.min(d, v.maxDiscountAmount);
    return d;
  }
  return Math.min(v.discountValue, lineSubtotal);
}

/** Tính preview giảm giá từ VoucherResponse (customer list) */
function calcVoucherPreview(
  lineSubtotal: number,
  lineRentalDays: number,
  v: VoucherResponse,
): number {
  if (!v.minRentalDays || lineRentalDays < v.minRentalDays) return 0;
  if (v.discountType === 'PERCENTAGE') {
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
  const { data: vouchersData, isLoading } = useCustomerVouchersQuery();
  const {
    inputCode,
    setInputCode,
    inputError,
    isValidating,
    applyByCode,
    clearVoucher,
  } = useVoucherApply();
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const allVouchers: VoucherResponse[] = vouchersData?.items ?? [];

  // Loại bỏ các suggested voucher trùng với danh sách tổng (tránh hiển thị 2 lần)
  const generalVouchers = allVouchers.filter(
    (v) => !suggestedVouchers.some((sv) => sv.code === v.code),
  );

  async function handleApply(v: VoucherResponse) {
    setApplyingCode(v.code);
    await applyByCode(
      v.code,
      lineRentalDays,
      lineRentalSubtotal,
      (result) => {
        onApply(v);
        onOpenChange(false);
        toast.success(
          `Áp dụng voucher ${v.code} thành công! Giảm ${fmt(result.discountAmount)}`,
        );
      },
      (msg) => {
        toast.error(msg);
      },
      productId,
    );
    setApplyingCode(null);
  }

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
          discountType:
            sv.discountType === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
          discountValue: sv.discountValue,
          maxDiscountAmount: sv.maxDiscountAmount,
          minRentalDays: sv.minRentalDays,
          expiresAt: sv.expiresAt,
          usageLimit: null,
          usedCount: 0,
          isActive: true,
          createdAt: '',
          updatedAt: '',
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
        const matched = allVouchers.find((v) => v.code === code);
        if (matched) {
          onApply(matched);
        } else {
          const minimalVoucher: VoucherResponse = {
            voucherId: '',
            code,
            discountType: 'PERCENTAGE',
            discountValue: 0,
            maxDiscountAmount: null,
            minRentalDays: null,
            expiresAt: null,
            usageLimit: null,
            usedCount: 0,
            isActive: true,
            createdAt: '',
            updatedAt: '',
          };
          onApply(minimalVoucher);
        }
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
      <DialogContent className='max-h-[min(90dvh,620px)] gap-0 overflow-hidden p-0 sm:max-w-md'>
        <DialogHeader className='border-b border-border px-4 py-4 sm:px-5'>
          <div className='flex items-center gap-2'>
            <TicketPercent className='size-5 text-rose-600 dark:text-rose-400' />
            <DialogTitle className='text-lg font-bold'>
              Chọn voucher
            </DialogTitle>
          </div>
          <DialogDescription className='text-left text-sm'>
            Giảm trừ trên tiền thuê của dòng này.
          </DialogDescription>
        </DialogHeader>

        {/* Input mã voucher */}
        <div className='border-b border-border px-4 py-3 sm:px-5'>
          <Label htmlFor='voucher-input' className='sr-only'>
            Nhập mã voucher
          </Label>
          <div className='flex gap-2'>
            <Input
              id='voucher-input'
              placeholder='Nhập mã voucher…'
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && void handleApplyInput()}
              className='font-mono text-sm uppercase'
              disabled={isValidating || !!applyingCode}
            />
            <Button
              type='button'
              size='sm'
              className='shrink-0 bg-rose-600 hover:bg-rose-700'
              onClick={() => void handleApplyInput()}
              disabled={!inputCode.trim() || isValidating || !!applyingCode}
            >
              {isValidating || applyingCode ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Search className='size-4' />
              )}
            </Button>
          </div>
          {inputError && (
            <p className='mt-1.5 flex items-center gap-1 text-xs text-red-500'>
              <AlertCircle className='size-3 shrink-0' />
              {inputError}
            </p>
          )}
        </div>

        {/* Danh sách voucher */}
        <div className='max-h-[min(52dvh,380px)] overflow-y-auto px-4 py-3 sm:px-5'>
          {/* Voucher dành riêng cho sản phẩm này */}
          {suggestedVouchers.length > 0 && (
            <div className='mb-4'>
              <div className='mb-2 flex items-center gap-1.5'>
                <Sparkles className='size-3.5 text-rose-500' />
                <span className='text-xs font-semibold text-rose-600 dark:text-rose-400'>
                  Voucher phù hợp với sản phẩm này
                </span>
              </div>
              <div className='space-y-2'>
                {suggestedVouchers.map((sv) => {
                  const isApplied = appliedCode === sv.code;
                  const isApplying = applyingCode === sv.code;
                  const usedByOther =
                    !isApplied && (usedCodes?.has(sv.code) ?? false);
                  const discount = calcSuggestedDiscount(
                    lineRentalSubtotal,
                    sv,
                  );
                  const eligible =
                    !usedByOther &&
                    discount > 0 &&
                    (!sv.minRentalDays || lineRentalDays >= sv.minRentalDays);

                  return (
                    <div
                      key={sv.voucherId}
                      className={cn(
                        'rounded-xl border p-3 transition-colors',
                        usedByOther
                          ? 'border-border/40 bg-muted/20 opacity-60'
                          : isApplied
                            ? 'border-rose-500/50 bg-rose-50/50 dark:border-rose-500/40 dark:bg-rose-950/20'
                            : 'border-rose-300/50 bg-rose-50/30 dark:border-rose-800/40 dark:bg-rose-950/10',
                      )}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-1.5'>
                            <span className='font-mono text-xs font-bold text-rose-600 dark:text-rose-400'>
                              {sv.code}
                            </span>
                            <Badge
                              variant='secondary'
                              className='bg-rose-100 text-xs text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            >
                              {sv.discountType === 'PERCENTAGE'
                                ? `−${sv.discountValue}%`
                                : `−${fmt(sv.discountValue)}`}
                            </Badge>
                          </div>
                          {sv.minRentalDays && (
                            <p className='mt-0.5 text-xs text-muted-foreground'>
                              Áp dụng từ {sv.minRentalDays} ngày
                            </p>
                          )}
                        </div>
                        <div className='flex shrink-0 flex-col items-end gap-1.5'>
                          {usedByOther ? (
                            <span className='text-xs text-muted-foreground'>
                              Đã dùng ở sản phẩm khác
                            </span>
                          ) : isApplied ? (
                            <div className='flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400'>
                              <CheckCircle2 className='size-4' />
                              Đang dùng
                            </div>
                          ) : (
                            <Button
                              type='button'
                              size='sm'
                              className='h-7 gap-1 bg-rose-600 text-xs hover:bg-rose-700'
                              disabled={!eligible || !!applyingCode}
                              onClick={() => void handleApplySuggested(sv)}
                            >
                              {isApplying ? (
                                <Loader2 className='size-3 animate-spin' />
                              ) : (
                                'Áp dụng'
                              )}
                            </Button>
                          )}
                          {eligible && !isApplied && !usedByOther && (
                            <span className='text-xs font-medium text-rose-600 dark:text-rose-400'>
                              −{fmt(discount)}
                            </span>
                          )}
                          {!eligible && !isApplied && !usedByOther && (
                            <span className='text-xs text-muted-foreground'>
                              Chưa đủ điều kiện
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {generalVouchers.length > 0 && (
                <div className='mt-3 mb-1 flex items-center gap-2'>
                  <div className='h-px flex-1 bg-border/60' />
                  <span className='text-xs text-muted-foreground'>
                    Voucher khác
                  </span>
                  <div className='h-px flex-1 bg-border/60' />
                </div>
              )}
            </div>
          )}

          {/* Danh sách voucher chung */}
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className='space-y-2 rounded-xl border border-border/80 p-3'
                >
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-40' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ))}
            </div>
          ) : generalVouchers.length === 0 && suggestedVouchers.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                Không có voucher khả dụng.
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {generalVouchers.map((v) => {
                const isApplied = appliedCode === v.code;
                const isApplying = applyingCode === v.code;
                const usedByOther =
                  !isApplied && (usedCodes?.has(v.code) ?? false);
                const preview = calcVoucherPreview(
                  lineRentalSubtotal,
                  lineRentalDays,
                  v,
                );
                const eligible = !usedByOther && preview > 0;

                return (
                  <div
                    key={v.voucherId}
                    className={cn(
                      'rounded-xl border p-3 transition-colors',
                      usedByOther
                        ? 'border-border/40 bg-muted/20 opacity-60'
                        : isApplied
                          ? 'border-rose-500/50 bg-rose-50/50 dark:border-rose-500/40 dark:bg-rose-950/20'
                          : 'border-border/80 bg-muted/30 dark:bg-muted/20',
                    )}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono text-xs font-bold text-rose-600 dark:text-rose-400'>
                            {v.code}
                          </span>
                          <Badge variant='secondary' className='text-xs'>
                            {v.discountType === 'PERCENTAGE'
                              ? `−${v.discountValue}%`
                              : `−${fmt(v.discountValue)}`}
                          </Badge>
                        </div>
                        <p className='mt-0.5 text-sm font-semibold text-foreground'>
                          {v.maxDiscountAmount
                            ? `Giảm tối đa ${fmt(v.maxDiscountAmount)}`
                            : v.discountType === 'FIXED_AMOUNT'
                              ? `Giảm ${fmt(v.discountValue)}`
                              : `Giảm ${v.discountValue}%`}
                        </p>
                        {v.minRentalDays && (
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            Áp dụng từ {v.minRentalDays} ngày
                          </p>
                        )}
                      </div>

                      <div className='flex shrink-0 flex-col items-end gap-2'>
                        {usedByOther ? (
                          <span className='text-xs text-muted-foreground'>
                            Đã dùng ở sản phẩm khác
                          </span>
                        ) : isApplied ? (
                          <div className='flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400'>
                            <CheckCircle2 className='size-4' />
                            Đang dùng
                          </div>
                        ) : (
                          <Button
                            type='button'
                            size='sm'
                            variant={isApplying ? 'secondary' : 'default'}
                            className='h-7 gap-1 bg-rose-600 text-xs hover:bg-rose-700'
                            disabled={!eligible || !!applyingCode}
                            onClick={() => void handleApply(v)}
                          >
                            {isApplying ? (
                              <Loader2 className='size-3 animate-spin' />
                            ) : (
                              'Áp dụng'
                            )}
                          </Button>
                        )}
                        {!eligible && !isApplied && !usedByOther && (
                          <span className='text-xs text-muted-foreground'>
                            Chưa đủ điều kiện
                          </span>
                        )}
                        {eligible && !isApplied && !usedByOther && (
                          <span className='text-xs font-medium text-rose-600 dark:text-rose-400'>
                            −{fmt(preview)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bỏ voucher */}
        {appliedCode && (
          <div className='border-t border-border px-4 py-3 sm:px-5'>
            <Button
              type='button'
              variant='ghost'
              className='w-full gap-1.5 text-destructive hover:bg-red-50 dark:hover:bg-red-950/30'
              onClick={handleClear}
            >
              <X className='size-4' />
              Bỏ voucher &quot;{appliedCode}&quot;
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
