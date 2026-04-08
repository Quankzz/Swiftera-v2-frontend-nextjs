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
import { TicketPercent, Search, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerVouchersQuery, useVoucherApply } from '@/features/vouchers/hooks/use-customer-vouchers';
import type { VoucherResponse } from '@/features/vouchers/types';
import { cn } from '@/lib/utils';

type VoucherLinePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tổng tiền thuê của dòng (đơn giá × SL) */
  lineRentalSubtotal: number;
  /** Số ngày thuê của dòng */
  lineRentalDays: number;
  /** Voucher đang được áp dụng (nếu có) */
  appliedCode: string | null;
  /** Callback khi áp dụng voucher thành công */
  onApply: (voucher: VoucherResponse) => void;
  /** Callback khi bỏ voucher */
  onClear: () => void;
};

function fmt(amount: number) {
  return amount.toLocaleString('vi-VN') + '₫';
}

export function VoucherLinePickerDialog({
  open,
  onOpenChange,
  lineRentalSubtotal,
  lineRentalDays,
  appliedCode,
  onApply,
  onClear,
}: VoucherLinePickerDialogProps) {
  const { data: vouchersData, isLoading } = useCustomerVouchersQuery();
  const { inputCode, setInputCode, inputError, isValidating, applyByCode, clearVoucher } =
    useVoucherApply();
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const vouchers: VoucherResponse[] = vouchersData?.items ?? [];

  async function handleApply(v: VoucherResponse) {
    setApplyingCode(v.code);
    await applyByCode(
      v.code,
      lineRentalDays,
      lineRentalSubtotal,
      (result) => {
        onApply(v);
        onOpenChange(false);
        toast.success(`Áp dụng voucher ${v.code} thành công! Giảm ${fmt(result.discountAmount)}`);
      },
      (msg) => {
        toast.error(msg);
      },
    );
    setApplyingCode(null);
  }

  async function handleApplyInput() {
    if (!inputCode.trim()) return;
    setApplyingCode(inputCode.trim().toUpperCase());
    await applyByCode(
      inputCode.trim().toUpperCase(),
      lineRentalDays,
      lineRentalSubtotal,
      (result) => {
        const matched = vouchers.find((v) => v.code === inputCode.trim().toUpperCase());
        if (matched) onApply(matched);
        onOpenChange(false);
        toast.success(`Áp dụng voucher ${inputCode.trim().toUpperCase()} thành công! Giảm ${fmt(result.discountAmount)}`);
      },
      (msg) => {
        toast.error(msg);
      },
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
      <DialogContent className='max-h-[min(90dvh,580px)] gap-0 overflow-hidden p-0 sm:max-w-md'>
        <DialogHeader className='border-b border-border px-4 py-4 sm:px-5'>
          <div className='flex items-center gap-2'>
            <TicketPercent className='size-5 text-rose-600 dark:text-rose-400' />
            <DialogTitle className='text-lg font-bold'>Chọn voucher</DialogTitle>
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
        <div className='max-h-[min(45dvh,340px)] overflow-y-auto px-4 py-3 sm:px-5'>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='space-y-2 rounded-xl border border-border/80 p-3'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-40' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ))}
            </div>
          ) : vouchers.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-sm text-muted-foreground'>Không có voucher khả dụng.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {vouchers.map((v) => {
                const isApplied = appliedCode === v.code;
                const isApplying = applyingCode === v.code;

                // Tính preview giảm giá
                let preview = 0;
                if (v.discountType === 'PERCENTAGE') {
                  preview = Math.floor((lineRentalSubtotal * v.discountValue) / 100);
                  if (v.maxDiscountAmount) preview = Math.min(preview, v.maxDiscountAmount);
                } else {
                  preview = v.discountValue;
                }
                const eligible = preview > 0 && (!v.minRentalDays || lineRentalDays >= v.minRentalDays);

                return (
                  <div
                    key={v.voucherId}
                    className={cn(
                      'rounded-xl border p-3 transition-colors',
                      isApplied
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
                          {v.discountType === 'PERCENTAGE' ? (
                            <Badge variant='secondary' className='text-xs'>
                              −{v.discountValue}%
                            </Badge>
                          ) : (
                            <Badge variant='secondary' className='text-xs'>
                              −{fmt(v.discountValue)}
                            </Badge>
                          )}
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
                        {isApplied ? (
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
                        {!eligible && !isApplied && preview <= 0 && (
                          <span className='text-xs text-muted-foreground'>
                            Chưa đủ điều kiện
                          </span>
                        )}
                        {eligible && !isApplied && (
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
