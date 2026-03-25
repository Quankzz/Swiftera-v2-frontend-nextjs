'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  computeVoucherDiscount,
  defaultRentalVouchers,
  type RentalVoucher,
} from '@/lib/rental-voucher';

type VoucherLinePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tổng tiền thuê của dòng (đơn giá × SL) */
  lineRentalSubtotal: number;
  applied: RentalVoucher | null;
  onApply: (voucher: RentalVoucher | null) => void;
};

export function VoucherLinePickerDialog({
  open,
  onOpenChange,
  lineRentalSubtotal,
  applied,
  onApply,
}: VoucherLinePickerDialogProps) {
  const handlePick = (v: RentalVoucher) => {
    const d = computeVoucherDiscount(lineRentalSubtotal, v);
    if (d <= 0) return;
    onApply(v);
    onOpenChange(false);
  };

  const handleClear = () => {
    onApply(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[min(90dvh,520px)] gap-0 overflow-hidden p-0 sm:max-w-md'>
        <DialogHeader className='border-b border-border px-4 py-4 sm:px-5'>
          <DialogTitle className='text-lg font-bold text-foreground'>Voucher cho dòng này</DialogTitle>
          <DialogDescription className='text-left text-sm'>
            Giảm trừ trên tiền thuê của món (không áp dụng cọc).
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[min(55dvh,380px)] space-y-2 overflow-y-auto px-4 py-3 sm:px-5'>
          {defaultRentalVouchers.map((v) => {
            const preview = computeVoucherDiscount(lineRentalSubtotal, v);
            const disabled = preview <= 0;
            return (
              <div
                key={v.id}
                className='rounded-xl border border-border/80 bg-muted/30 p-3 dark:bg-muted/20'
              >
                <p className='font-mono text-xs font-bold text-teal-600 dark:text-teal-400'>{v.code}</p>
                <p className='mt-0.5 text-sm font-semibold text-foreground'>{v.title}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{v.description}</p>
                <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {disabled ? 'Chưa đủ điều kiện' : `−~${preview.toLocaleString('vi-VN')}₫`}
                  </span>
                  <Button
                    type='button'
                    size='sm'
                    disabled={disabled || applied?.id === v.id}
                    variant={applied?.id === v.id ? 'secondary' : 'default'}
                    onClick={() => handlePick(v)}
                  >
                    {applied?.id === v.id ? 'Đang dùng' : 'Áp dụng'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        {applied && (
          <div className='border-t border-border px-4 py-3 sm:px-5'>
            <Button type='button' variant='ghost' className='w-full text-destructive' onClick={handleClear}>
              Bỏ voucher dòng này
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
